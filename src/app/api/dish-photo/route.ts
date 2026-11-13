import { NextRequest, NextResponse } from "next/server";

/**
 * Real food photography for Tasting Room cards, from Unsplash.
 * Set UNSPLASH_ACCESS_KEY in Vercel to turn it on. Without it, cards keep their color art.
 * Unsplash asks that photos are hotlinked and credited, which the card does.
 */
export const revalidate = 86400;

export async function GET(req: NextRequest) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  const q = req.nextUrl.searchParams.get("q")?.slice(0, 80);
  if (!key || !q) return NextResponse.json({ photo: null });
  const url = `https://api.unsplash.com/search/photos?per_page=1&orientation=landscape&content_filter=high&query=${encodeURIComponent(q + " food")}`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" }, next: { revalidate: 86400 } });
    if (!res.ok) return NextResponse.json({ photo: null });
    const data = await res.json();
    const p = data.results?.[0];
    if (!p) return NextResponse.json({ photo: null });
    const utm = "?utm_source=rider&utm_medium=referral";
    return NextResponse.json(
      { photo: { url: `${p.urls.raw}&w=900&h=600&fit=crop&auto=format&q=75`, alt: p.alt_description ?? q, credit: p.user?.name ?? "Unsplash", creditUrl: (p.user?.links?.html ?? "https://unsplash.com") + utm, sourceUrl: "https://unsplash.com" + utm } },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch {
    return NextResponse.json({ photo: null });
  }
}
