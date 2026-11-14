"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRider } from "@/lib/store";
import { synopsisByDomain, synopsisHeadline, synopsisText } from "@/lib/synopsis";
import { Glows } from "@/components/Glows";
import { TabBar } from "@/components/TabBar";
import { IconBack } from "@/components/Icons";

/**
 * The transparency view: everything Rider has put together about you, rebuilt live.
 * Each category can be switched off for apps, every guess shows its reason, and the whole thing can be sent.
 */
export default function Synopsis() {
  const { state, setDomainShared, confirmGuess, removeItem } = useRider();
  const [sent, setSent] = useState("");
  const headline = useMemo(() => synopsisHeadline(state), [state]);
  const blocks = useMemo(() => synopsisByDomain(state), [state]);
  const guesses = state.items.filter((i) => i.source === "guess");
  const toldCount = state.items.filter((i) => i.source === "told").length;
  const scored = state.ratings.filter((r) => r.score !== null).length;

  async function send() {
    const text = synopsisText(state);
    try {
      if (navigator.share) { await navigator.share({ title: `${state.profile.name || "My"} Rider`, text }); setSent("Sent"); }
      else { await navigator.clipboard.writeText(text); setSent("Copied. Paste it anywhere."); }
    } catch { /* closed the share sheet */ }
    setTimeout(() => setSent(""), 2400);
  }

  return (
    <main className="page">
      <Glows intensity={0.8} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 18 }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" className="icon-btn" aria-label="Back" style={{ width: 40, height: 40 }}><IconBack /></Link>
          <span className="small" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span className="live-dot" />Updated live</span>
        </header>

        <section className="lum" style={{ borderRadius: 26 }}>
          <div className="pearl-card" style={{ height: "auto", aspectRatio: "auto", padding: "22px 22px 20px", gap: 14 }}>
            <span className="small" style={{ position: "relative", color: "#3e3f62" }}>Rider's read on you</span>
            <p className="display" style={{ position: "relative", fontSize: 24, lineHeight: 1.25 }}>{headline}</p>
            <span className="small" style={{ position: "relative", fontSize: 12, color: "#3e3f62" }}>
              Built from {toldCount} things you told Rider and {scored} scores in the rooms. Nothing else.
            </span>
          </div>
        </section>

        <button type="button" className="btn btn-primary btn-block" onClick={send}>{sent || "Send my synopsis"}</button>

        <section aria-label="By category" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>What apps can see</h2>
          <p className="small" style={{ margin: 0, lineHeight: 1.45 }}>Switch a category off and every connected app stops seeing it right away. It stays in your rider.</p>
          {blocks.map((b) => (
            <div key={b.domain} className="glass" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, opacity: b.shared ? 1 : 0.62, transition: "opacity .2s" }}>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, cursor: "pointer" }}>
                <span style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{b.label}</span>
                  <span className="small" style={{ fontSize: 12 }}>{b.shared ? "Shared with your apps" : "Only you can see this"}</span>
                </span>
                <span className="switch">
                  <input type="checkbox" role="switch" checked={b.shared} onChange={(e) => setDomainShared(b.domain, e.target.checked)} aria-label={`Share ${b.label} with apps`} />
                  <span aria-hidden="true" />
                </span>
              </label>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.45, color: b.sentence ? "var(--ink)" : "var(--sub)" }}>
                {b.sentence || "Nothing here yet."}
              </p>
            </div>
          ))}
        </section>

        {guesses.length > 0 && (
          <section aria-label="Rider's guesses" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>What Rider is guessing</h2>
            <p className="small" style={{ margin: 0 }}>Guesses are never shared unless you turn them on for an app.</p>
            {guesses.map((g) => (
              <div key={g.id} className="glass" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{g.label}</span>
                  <span className="small">{Math.round((g.confidence ?? 0.5) * 100)}% sure</span>
                </span>
                <span className="small" style={{ lineHeight: 1.4 }}>{g.reason}</span>
                <span style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => confirmGuess(g.id)}>That's me</button>
                  <button type="button" className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => removeItem(g.id)}>Not me</button>
                </span>
              </div>
            ))}
          </section>
        )}
      </div>
      <TabBar />
    </main>
  );
}
