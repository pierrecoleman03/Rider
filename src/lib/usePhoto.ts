"use client";
import { useEffect, useState } from "react";

export type Photo = { url: string; alt: string; credit: string; creditUrl: string; sourceUrl: string };
const cache = new Map<string, Photo | null>();

/** Looks up a photo for a dish once per session. Returns null until found, or if photos are off. */
export function usePhoto(query: string | undefined) {
  const [photo, setPhoto] = useState<Photo | null>(query ? cache.get(query) ?? null : null);
  useEffect(() => {
    if (!query) return;
    if (cache.has(query)) { setPhoto(cache.get(query) ?? null); return; }
    let live = true;
    fetch(`/api/dish-photo?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => { cache.set(query, d.photo ?? null); if (live) setPhoto(d.photo ?? null); })
      .catch(() => cache.set(query, null));
    return () => { live = false; };
  }, [query]);
  return photo;
}
