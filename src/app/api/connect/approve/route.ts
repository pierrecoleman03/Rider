import { supabaseAdmin } from "@/lib/supabase";
import { json, newSecret, notConfigured, sha256, userFromRequest } from "@/lib/server";

export const dynamic = "force-dynamic";

const ALLOWED_SCOPES = ["never", "rather", "love", "guesses"];

/**
 * POST /api/connect/approve
 * Called by the Connect with Rider screen after the person taps Connect.
 * Body: { app_id, scopes, redirect_uri, state }
 * Creates (or refreshes) the connection and returns a one-time code redirect for the partner.
 */
export async function POST(req: Request) {
  const admin = supabaseAdmin();
  if (!admin) return notConfigured();
  const user = await userFromRequest(req);
  if (!user) return json({ error: "not_signed_in" }, 401);

  const body = await req.json().catch(() => null) as { app_id?: string; scopes?: string[]; redirect_uri?: string; state?: string } | null;
  if (!body?.app_id || !body.redirect_uri) return json({ error: "bad_request" }, 400);

  const { data: app } = await admin.from("partner_apps").select("id, redirect_uris").eq("id", body.app_id).maybeSingle();
  if (!app) return json({ error: "unknown_app" }, 404);
  if (!app.redirect_uris.includes(body.redirect_uri)) return json({ error: "redirect_uri_not_registered" }, 400);

  const scopes = (body.scopes ?? []).filter((s) => ALLOWED_SCOPES.includes(s));
  if (!scopes.length) return json({ error: "no_scopes" }, 400);

  // One active connection per person per app.
  await admin.from("connections").update({ revoked_at: new Date().toISOString() }).eq("user_id", user.id).eq("app_id", app.id).is("revoked_at", null);
  const { data: conn, error } = await admin
    .from("connections")
    .insert({ user_id: user.id, app_id: app.id, scopes })
    .select("id")
    .single();
  if (error || !conn) return json({ error: "could_not_connect" }, 500);

  const code = newSecret("rc");
  await admin.from("oauth_codes").insert({ code_hash: sha256(code), connection_id: conn.id, redirect_uri: body.redirect_uri });

  const target = new URL(body.redirect_uri);
  target.searchParams.set("code", code);
  if (body.state) target.searchParams.set("state", body.state);
  return json({ redirect: target.toString() });
}
