"use client";

import Link from "next/link";
import { useRider } from "@/lib/store";
import { ROOMS } from "@/lib/rooms";
import { DISHES } from "@/lib/dishes";
import { domainById } from "@/lib/domains";
import { usePhoto } from "@/lib/usePhoto";
import { Glows } from "@/components/Glows";
import { TabBar } from "@/components/TabBar";
import type { Domain } from "@/lib/types";

/** Every room in one place. Each tile is a doorway with its own photo. */
export default function Rooms() {
  const { state } = useRider();
  const count = (d: Domain) => {
    const ids = d === "food" ? DISHES.map((x) => x.id) : ROOMS.find((r) => r.domain === d)!.cards.map((c) => c.id);
    return { done: state.ratings.filter((r) => r.score !== null && ids.includes(r.dishId)).length, total: ids.length };
  };
  return (
    <main className="page">
      <Glows intensity={0.6} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
        <h1 className="display" style={{ fontSize: 30 }}>Rooms</h1>
        <p className="small" style={{ margin: 0, lineHeight: 1.45 }}>Wander through and score what you see. Rider fills itself in as you go.</p>
        {ROOMS.map((r, k) => <Door key={r.domain} domain={r.domain} name={r.name} tagline={r.tagline} href={r.href} n={count(r.domain)} delay={k * 0.05} />)}
      </div>
      <TabBar />
    </main>
  );
}

function Door({ domain, name, tagline, href, n, delay }: { domain: Domain; name: string; tagline: string; href: string; n: { done: number; total: number }; delay: number }) {
  const D = domainById(domain);
  const photo = usePhoto(D.photo, "scene");
  return (
    <Link href={href} className="banner reveal door" style={{ position: "relative", display: "block", height: 128, borderRadius: 24, overflow: "hidden", background: D.art, color: "#fff", textDecoration: "none", animationDelay: `${delay}s` }}>
      {photo && <img className="photo-in" src={photo.url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      <span aria-hidden="true" className="banner-sheen" />
      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(10,10,30,0.62) 0%, rgba(10,10,30,0.15) 70%)" }} />
      <span style={{ position: "absolute", left: 18, top: 18, bottom: 16, right: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="display" style={{ fontSize: 26 }}>{name}</span>
          <span style={{ fontSize: 13, opacity: 0.85 }}>{tagline}</span>
        </span>
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
          <span style={{ opacity: 0.85 }}>{n.done ? `${n.done} of ${n.total} scored` : `${n.total} to score`}</span>
          <span style={{ height: 30, padding: "0 14px", borderRadius: 15, background: "rgba(255,255,255,0.92)", color: "var(--ink)", display: "inline-flex", alignItems: "center", fontWeight: 600 }}>Enter</span>
        </span>
      </span>
    </Link>
  );
}
