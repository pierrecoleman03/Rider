import { supabaseAdmin } from "@/lib/supabase";
import { json, notConfigured, sha256, shapeRider } from "@/lib/server";
import type { RiderItem, Scope } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/rider
 * Authorization: Bearer <access token from /api/oauth/token>
 *
 * Returns the person's rider, live, limited to the scopes they allowed this app.
 * A revoked connection stops working immediately because nothing is cached on the partner side.
 */
export async function GET(req: Request) {
  const admin = supabaseAdmin();
  if (!admin) return notConfigured();

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "missing_token" }, 401);

  const { data: conn } = await admin
    .from("connections")
    .select("id, user_id, app_id, scopes, revoked_at")
    .eq("token_hash", sha256(token))
    .maybeSingle();
  if (!conn || conn.revoked_at) return json({ error: "revoked_or_unknown" }, 401);

  const [{ data: rows }, { data: profile }] = await Promise.all([
    admin.from("rider_items").select("*").eq("user_id", conn.user_id),
    admin.from("profiles").select("hidden_domains").eq("id", conn.user_id).maybeSingle(),
  ]);
  const hidden: string[] = profile?.hidden_domains ?? [];
  const items: RiderItem[] = (rows ?? []).filter((r) => !hidden.includes(r.domain ?? "food")).map((r) => ({
    id: r.id, label: r.label, tier: r.tier, allergy: r.allergy, source: r.source, domain: r.domain ?? "food",
    confidence: r.confidence ?? undefined, covers: r.covers ?? undefined, createdAt: r.created_at,
  }));

  const readAt = new Date().toISOString();
  await Promise.all([
    admin.from("connections").update({ last_read_at: readAt }).eq("id", conn.id),
    admin.from("access_log").insert({ connection_id: conn.id, user_id: conn.user_id, app_id: conn.app_id, scopes: conn.scopes }),
  ]);

  return json({ app: conn.app_id, read_at: readAt, scopes: conn.scopes, rider: shapeRider(items, conn.scopes as Scope[]) });
}
