import { supabaseAdmin } from "@/lib/supabase";
import { json, notConfigured, userFromRequest } from "@/lib/server";

export const dynamic = "force-dynamic";

/** DELETE /api/connections/:id  Revokes access. The partner's next read fails immediately. */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const admin = supabaseAdmin();
  if (!admin) return notConfigured();
  const user = await userFromRequest(req);
  if (!user) return json({ error: "not_signed_in" }, 401);

  const { data, error } = await admin
    .from("connections")
    .update({ revoked_at: new Date().toISOString(), token_hash: null })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();
  if (error || !data) return json({ error: "not_found" }, 404);
  return json({ revoked: true });
}

/** PATCH /api/connections/:id  Changes what an app can see. Body: { scopes } */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = supabaseAdmin();
  if (!admin) return notConfigured();
  const user = await userFromRequest(req);
  if (!user) return json({ error: "not_signed_in" }, 401);
  const body = await req.json().catch(() => null) as { scopes?: string[] } | null;
  const scopes = (body?.scopes ?? []).filter((s) => ["never", "rather", "love", "guesses"].includes(s));

  const { data } = await admin.from("connections").update({ scopes }).eq("id", params.id).eq("user_id", user.id).is("revoked_at", null).select("id").maybeSingle();
  if (!data) return json({ error: "not_found" }, 404);
  return json({ scopes });
}
