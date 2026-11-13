import { supabaseAdmin } from "@/lib/supabase";
import { json, newSecret, notConfigured, sha256 } from "@/lib/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/oauth/token
 * Partner server exchanges the one-time code for an access token.
 * Body: { client_id, client_secret, code, redirect_uri }
 */
export async function POST(req: Request) {
  const admin = supabaseAdmin();
  if (!admin) return notConfigured();

  const body = await req.json().catch(() => null) as { client_id?: string; client_secret?: string; code?: string; redirect_uri?: string } | null;
  if (!body?.client_id || !body.client_secret || !body.code || !body.redirect_uri) return json({ error: "invalid_request" }, 400);

  const { data: app } = await admin.from("partner_apps").select("id, client_secret_hash").eq("id", body.client_id).maybeSingle();
  if (!app?.client_secret_hash || app.client_secret_hash !== sha256(body.client_secret)) return json({ error: "invalid_client" }, 401);

  const { data: code } = await admin
    .from("oauth_codes")
    .select("code_hash, connection_id, redirect_uri, expires_at, used_at, connections(app_id, scopes)")
    .eq("code_hash", sha256(body.code))
    .maybeSingle();
  const connection = (code?.connections ?? null) as { app_id: string; scopes: string[] } | null;
  if (!code || !connection || code.used_at || new Date(code.expires_at) < new Date() || code.redirect_uri !== body.redirect_uri || connection.app_id !== app.id) {
    return json({ error: "invalid_grant" }, 400);
  }

  const token = newSecret("rt");
  await Promise.all([
    admin.from("oauth_codes").update({ used_at: new Date().toISOString() }).eq("code_hash", code.code_hash),
    admin.from("connections").update({ token_hash: sha256(token) }).eq("id", code.connection_id),
  ]);

  return json({ access_token: token, token_type: "bearer", scope: connection.scopes.join(" ") });
}
