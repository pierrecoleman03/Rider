"use client";
import { useEffect, useState } from "react";

export type Photo = { url: string; alt: string; credit: string; creditUrl: string; sourceUrl: string };
const cache = new Map<string, Photo | null>();

/** Looks up a photo for a dish once per session. Returns null until found, or if photos are off. */
export function usePhoto(query: string | undefined, kind: "dish" | "scene" = "dish") {
  const key = query ? `${kind}:${query}` : undefined;
  const [photo, setPhoto] = useState<Photo | null>(key ? cache.get(key) ?? null : null);
  useEffect(() => {
    if (!query || !key) { setPhoto(null); return; }
    if (cache.has(key)) { setPhoto(cache.get(key) ?? null); return; }
    setPhoto(null);
    let live = true;
    fetch(`/api/dish-photo?q=${encodeURIComponent(query)}&kind=${kind}`)
      .then((r) => r.json())
      .then((d) => { cache.set(key, d.photo ?? null); if (live) setPhoto(d.photo ?? null); })
      .catch(() => cache.set(key, null));
    return () => { live = false; };
  }, [query, key, kind]);
  return photo;
}
