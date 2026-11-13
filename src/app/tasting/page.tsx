"use client";

import { useMemo, useState } from "react";
import { useRider } from "@/lib/store";
import { DISHES, clashFor, scoreWord } from "@/lib/dishes";
import type { Dish } from "@/lib/types";
import { Glows } from "@/components/Glows";
import { TabBar } from "@/components/TabBar";

const REGIONS = ["All regions", "Asia", "Africa", "Latin America", "Europe", "Middle East"] as const;

/**
 * Tasting Room: an endless, global feed. Unrated dishes come first; once everything is rated the
 * feed loops so people can revisit. Clashes with the rider are called out on the card.
 */
export default function Tasting() {
  const { state, rate } = useRider();
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("All regions");
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [learn, setLearn] = useState(false);

  const feed = useMemo(() => {
    const pool = DISHES.filter((d) => region === "All regions" || d.area === region);
    const unrated = pool.filter((d) => !state.ratings.some((r) => r.dishId === d.id));
    return unrated.length ? [...unrated, ...pool.filter((d) => !unrated.includes(d))] : pool;
    // Only rebuild when the filter changes so the current card does not jump after rating.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  const dish: Dish | undefined = feed.length ? feed[i % feed.length] : undefined;
  const clash = dish ? clashFor(dish, state.items) : null;
  const rated = state.ratings.filter((r) => r.score !== null).length;

  function next(tried: boolean) {
    if (!dish) return;
    if (tried && score) rate(dish.id, score);
    else if (!tried) rate(dish.id, null);
    setScore(0);
    setLearn(false);
    setI((n) => n + 1);
  }

  return (
    <main className="page">
      <Glows intensity={0.6} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
        <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h1 className="display" style={{ fontSize: 30 }}>Tasting Room</h1>
          <span className="small">{rated} rated</span>
        </header>

        <div style={{ display: "flex", gap: 8, overflowX: "auto", margin: "0 -22px", padding: "0 22px 2px", scrollbarWidth: "none" }}>
          {REGIONS.map((r) => (
            <button key={r} type="button" className="pill" aria-pressed={region === r} onClick={() => { setRegion(r); setI(0); setScore(0); }}>{r}</button>
          ))}
        </div>

        {!dish && <p className="small">No dishes from this region yet. More are added every week.</p>}

        {dish && (
          <article key={dish.id + i} className="card-swap" style={{ background: "#fff", borderRadius: 28, overflow: "hidden", boxShadow: "0 1px 2px rgba(28,28,58,0.04), 0 24px 48px rgba(60,50,120,0.12)" }}>
            <div role="img" aria-label={`Photo placeholder: ${dish.name}`} style={{ position: "relative", height: 240, background: dish.tone }}>
              <span style={{ position: "absolute", top: 14, left: 14, height: 30, padding: "0 12px", borderRadius: 15, background: "rgba(255,255,255,0.85)", display: "inline-flex", alignItems: "center", fontSize: 13, fontWeight: 500 }}>{dish.region}</span>
              <span style={{ position: "absolute", bottom: 12, left: 14, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>Photo: {dish.name}</span>
            </div>
            <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column" }}>
              <h2 className="display" style={{ fontSize: 40 }}>{dish.name}</h2>
              <p style={{ margin: "8px 0 0", fontSize: 15, lineHeight: 1.45, color: "#4a4b6c" }}>{dish.description}</p>
              {clash && (
                <p className="reveal" style={{ margin: "10px 0 0", display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, lineHeight: 1.4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: "var(--accent)", flex: "none", marginTop: 5 }} />{clash}
                </p>
              )}
              <span className="small" style={{ marginTop: 16 }}>How much would you enjoy it?</span>
              <div className="rate-row" role="group" aria-label="How much would you enjoy it, 1 to 10" style={{ marginTop: 8 }}>
                {Array.from({ length: 10 }, (_, k) => k + 1).map((n) => (
                  <button key={n} type="button" aria-pressed={score === n} aria-label={`${n} out of 10`} onClick={() => setScore(n)}
                    className={`rate${score === n ? " on" : score && n <= score ? " lit" : ""}`}>{n}</button>
                ))}
              </div>
              <div className="small" style={{ marginTop: 6, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span>Never</span><span style={{ color: "var(--accent)", fontWeight: 600 }}>{scoreWord(score)}</span><span>Obsessed</span>
              </div>
              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <button type="button" className="btn btn-ghost btn-sm" style={{ flex: 1, height: 48 }} onClick={() => setLearn(true)}>Haven't tried it</button>
                <button type="button" className="btn btn-primary btn-sm" style={{ flex: 1, height: 48 }} onClick={() => next(true)}>{score ? "Save and next" : "Next dish"}</button>
              </div>
            </div>
          </article>
        )}
      </div>

      {dish && learn && (
        <>
          <button className="scrim" aria-label="Close" onClick={() => setLearn(false)} />
          <div className="sheet" role="dialog" aria-label={`Learn more about ${dish.name}`}>
            <div className="handle" />
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <h3 className="display" style={{ fontSize: 34 }}>{dish.name}</h3>
              <span className="small" style={{ fontSize: 14 }}>{dish.region}</span>
            </div>
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
              {dish.variants.map((v, k) => (
                <div key={v} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span role="img" aria-label={`Photo placeholder: ${v}`} style={{ height: 96, borderRadius: 14, background: dish.tone.replace("150deg", `${110 + k * 40}deg`) }} />
                  <span style={{ fontSize: 12, color: "#4a4b6c", lineHeight: 1.3 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Flavor profile</span>
              {dish.flavors.map(([k, v], idx) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "64px 1fr 22px", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <span style={{ color: "#4a4b6c" }}>{k}</span>
                  <span style={{ height: 6, borderRadius: 3, background: "#edecf4", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: `${v * 10}%`, borderRadius: 3, background: "var(--accent)", transformOrigin: "left", animation: `bar-grow .7s var(--ease-out) ${idx * 0.06}s both` }} />
                  </span>
                  <span className="small" style={{ textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, background: "#f4f2fc", borderRadius: 16, padding: "12px 14px" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Against your rider</span>
              <p className="small" style={{ margin: "4px 0 0", lineHeight: 1.45, color: "#3e3f62" }}>{clash ?? "Nothing in it clashes with your rider."}</p>
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #edecf4", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: "var(--ink)", color: "#fff", fontStyle: "italic", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>itin</span>
              <span style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Try it near you</span>
                <span className="small">itin will find a spot that fits your rider</span>
              </span>
            </div>
            <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => next(false)}>Skip for now</button>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => setLearn(false)}>Rate {dish.name}</button>
            </div>
          </div>
        </>
      )}
      <style>{`@keyframes bar-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
      <TabBar />
    </main>
  );
}
