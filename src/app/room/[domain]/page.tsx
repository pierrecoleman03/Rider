"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRider } from "@/lib/store";
import { roomFor, tierForScore } from "@/lib/rooms";
import { isDomain } from "@/lib/domains";
import { usePhoto } from "@/lib/usePhoto";
import { Glows } from "@/components/Glows";
import { TabBar } from "@/components/TabBar";
import { AddedToast, RoomNav } from "@/components/RoomNav";

const TIER_NAME = { love: "Love", rather: "Rather not" } as const;

/**
 * A room for one category (After Hours, Departure Lounge, Gift Shop, Fitting Room).
 * Tap a score and the next card slides in. 8 or more adds it to Love, 3 or less to Rather not.
 */
export default function RoomPage() {
  const params = useParams<{ domain: string }>();
  const router = useRouter();
  const domain = isDomain(params.domain) && params.domain !== "food" ? params.domain : null;
  useEffect(() => { if (!domain) router.replace("/tasting"); }, [domain, router]);
  if (!domain) return <main className="page"><Glows /></main>;
  return <Room domain={domain} />;
}

function Room({ domain }: { domain: Exclude<ReturnType<typeof roomFor>["domain"], "food"> }) {
  const room = roomFor(domain);
  const { state, rate, addItem } = useRider();
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const feed = useMemo(() => {
    const unrated = room.cards.filter((c) => !state.ratings.some((r) => r.dishId === c.id));
    return unrated.length ? [...unrated, ...room.cards.filter((c) => !unrated.includes(c))] : room.cards;
    // Built once per room so the current card does not jump after a score.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);
  const card = feed[i % feed.length];
  const photo = usePhoto(card?.photo, "scene");
  const scored = state.ratings.filter((r) => r.score !== null && room.cards.some((c) => c.id === r.dishId)).length;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function later(fn: () => void, ms: number) { timers.current.push(setTimeout(fn, ms)); }
  function advance() { setScore(0); setLeaving(false); setI((n) => n + 1); }

  function pick(n: number) {
    if (!card || leaving) return;
    setScore(n);
    rate(card.id, n);
    const tier = tierForScore(n);
    if (tier) {
      addItem(card.name, tier, domain);
      setToast(`Added ${card.name.toLowerCase()} to ${TIER_NAME[tier]}`);
      later(() => setToast(null), 1800);
    }
    later(() => setLeaving(true), 260);
    later(advance, 600);
  }

  function skip() { if (card) { rate(card.id, null); advance(); } }

  return (
    <main className="page">
      <Glows intensity={0.6} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
        <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h1 className="display" style={{ fontSize: 30 }}>{room.name}</h1>
          <span className="small">{scored} scored</span>
        </header>
        <RoomNav current={domain} />
        {card && (
          <article key={card.id + i} className={leaving ? "card-out" : "card-swap"} style={{ background: "#fff", borderRadius: 28, overflow: "hidden", boxShadow: "0 1px 2px rgba(28,28,58,0.04), 0 24px 48px rgba(60,50,120,0.12)" }}>
            <div className="banner" style={{ position: "relative", height: 250, background: card.tone, overflow: "hidden" }}>
              {photo && <img key={photo.url} className="photo-in" src={photo.url} alt={photo.alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
              <span aria-hidden="true" className="banner-sheen" />
              <span style={{ position: "absolute", top: 14, left: 14, height: 30, padding: "0 12px", borderRadius: 15, background: "rgba(255,255,255,0.88)", display: "inline-flex", alignItems: "center", fontSize: 13, fontWeight: 500 }}>{card.where}</span>
              {photo && (
                <span style={{ position: "absolute", bottom: 10, right: 12, fontSize: 11, color: "rgba(255,255,255,0.9)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                  Photo by <a href={photo.creditUrl} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>{photo.credit}</a> on <a href={photo.sourceUrl} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>Unsplash</a>
                </span>
              )}
            </div>
            <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column" }}>
              <h2 className="display" style={{ fontSize: 34 }}>{card.name}</h2>
              <p style={{ margin: "8px 0 0", fontSize: 15, lineHeight: 1.45, color: "#4a4b6c" }}>{card.desc}</p>
              <span className="small" style={{ marginTop: 16 }}>{room.question} 8 or more goes to Love.</span>
              <div className="rate-row" role="group" aria-label={`${room.question} 1 to 10`} style={{ marginTop: 8 }}>
                {Array.from({ length: 10 }, (_, k) => k + 1).map((n) => (
                  <button key={n} type="button" aria-pressed={score === n} aria-label={`${n} out of 10`} onClick={() => pick(n)}
                    className={`rate${score === n ? " on" : score && n <= score ? " lit" : ""}`}>{n}</button>
                ))}
              </div>
              <div className="small" style={{ marginTop: 6, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span>{room.low}</span><span>{room.high}</span>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 16, height: 48 }} onClick={skip}>Skip</button>
            </div>
          </article>
        )}
      </div>
      <AddedToast text={toast} />
      <TabBar />
    </main>
  );
}
