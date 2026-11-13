import { supabaseAdmin } from "@/lib/supabase";
import { json, newSecret, notConfigured, sha256, userFromRequest } from "@/lib/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/connections/:id/token
 * Issues an access token for a built-in app (itin) without the redirect dance,
 * because the person already uses Rider inside it. Third-party apps must use /connect + /api/oauth/token.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = supabaseAdmin();
  if (!admin) return notConfigured();
  const user = await userFromRequest(req);
  if (!user) return json({ error: "not_signed_in" }, 401);

  const { data: conn } = await admin
    .from("connections")
    .select("id, app_id, scopes, revoked_at, partner_apps(built_in)")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();
  const builtIn = (conn?.partner_apps as { built_in?: boolean } | null)?.built_in;
  if (!conn || conn.revoked_at || !builtIn) return json({ error: "not_allowed" }, 403);

  const token = newSecret("rt");
  await admin.from("connections").update({ token_hash: sha256(token) }).eq("id", conn.id);
  return json({ access_token: token, token_type: "bearer", scope: (conn.scopes as string[]).join(" ") });
}
