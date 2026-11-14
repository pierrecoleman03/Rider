import { createHash, randomBytes } from "crypto";
import { supabaseAdmin } from "./supabase";
import { riderSentence } from "./sentence";
import type { RiderItem, Scope } from "./types";

export const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");
export const newSecret = (prefix: string) => `${prefix}_${randomBytes(24).toString("base64url")}`;

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}

export function notConfigured() {
  return json({ error: "not_configured", message: "The partner API needs Supabase. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY." }, 503);
}

/** Resolves the signed-in person from the Supabase access token the app sends. */
export async function userFromRequest(req: Request) {
  const admin = supabaseAdmin();
  if (!admin) return null;
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data } = await admin.auth.getUser(token);
  return data.user ?? null;
}

/** What a partner receives: only the scopes the person allowed, read live at request time. */
export function shapeRider(items: RiderItem[], scopes: Scope[]) {
  const others = (["exp", "travel", "gifts", "style"] as const).reduce<Record<string, unknown>>((acc, d) => {
    const inD = items.filter((i) => i.domain === d && i.source === "told" && scopes.includes(i.tier));
    if (inD.length) acc[d] = { sentence: riderSentence(inD), never: inD.filter((i) => i.tier === "never").map((i) => i.label), rather: inD.filter((i) => i.tier === "rather").map((i) => i.label), love: inD.filter((i) => i.tier === "love").map((i) => i.label) };
    return acc;
  }, {});
  return { ...shapeFood(items.filter((i) => (i.domain ?? "food") === "food"), scopes), categories: others };
}

function shapeFood(items: RiderItem[], scopes: Scope[]) {
  const told = items.filter((i) => i.source === "told");
  const pick = (tier: RiderItem["tier"]) =>
    told.filter((i) => i.tier === tier).map((i) => ({ label: i.label, allergy: i.allergy || undefined, covers: i.covers ?? undefined }));
  const allowedTold = told.filter((i) => scopes.includes(i.tier));
  return {
    sentence: riderSentence(allowedTold),
    never: scopes.includes("never") ? pick("never") : undefined,
    rather: scopes.includes("rather") ? pick("rather") : undefined,
    love: scopes.includes("love") ? pick("love") : undefined,
    guesses: scopes.includes("guesses")
      ? items.filter((i) => i.source === "guess").map((i) => ({ label: i.label, tier: i.tier, confidence: i.confidence }))
      : undefined,
  };
}
