"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { DOMAINS, domainById, isDomain } from "@/lib/domains";
import { usePhoto } from "@/lib/usePhoto";
import type { Domain } from "@/lib/types";
import { useRider } from "@/lib/store";
import { riderSentence } from "@/lib/sentence";
import { DISHES } from "@/lib/dishes";
import { roomFor } from "@/lib/rooms";
import { synopsisHeadline } from "@/lib/synopsis";
import { Glows } from "@/components/Glows";
import { RiderCard } from "@/components/RiderCard";
import { RiderEditor } from "@/components/RiderEditor";
import { TabBar } from "@/components/TabBar";
import { IconChevron } from "@/components/Icons";
import { RiderWordmark } from "@/components/RiderMark";

export default function HomePage() {
  return <Suspense fallback={<main className="page"><Glows /></main>}><Home /></Suspense>;
}

/** Header image for the current category: a real photo when one loads, the designed art until then. */
function CategoryBanner({ domain, count }: { domain: Domain; count: number }) {
  const D = domainById(domain);
  const photo = usePhoto(D.photo, "scene");
  return (
    <div key={domain} className="banner reveal" style={{ position: "relative", height: 132, borderRadius: 22, overflow: "hidden", background: D.art, animationDuration: ".35s" }}>
      {photo && <img className="photo-in" src={photo.url} alt={photo.alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      <span aria-hidden="true" className="banner-sheen" />
      <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,10,30,0) 35%, rgba(10,10,30,0.55) 100%)" }} />
      <span style={{ position: "absolute", left: 16, bottom: 14, right: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end", color: "#fff" }}>
        <span className="display" style={{ fontSize: 24 }}>{D.label}</span>
        <span style={{ fontSize: 12, opacity: 0.85 }}>{count ? `${count} in your rider` : "Start here"}</span>
      </span>
      {photo && (
        <a href={photo.creditUrl} target="_blank" rel="noreferrer" style={{ position: "absolute", top: 8, right: 10, fontSize: 10, color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>Photo: {photo.credit} / Unsplash</a>
      )}
    </div>
  );
}

function Home() {
  const { ready, state } = useRider();
  const router = useRouter();
  const params = useSearchParams();
  const d = params.get("d");
  const domain: Domain = isDomain(d) ? d : "food";
  const D = domainById(domain);
  const inDomain = state.items.filter((i) => (i.domain ?? "food") === domain);

  useEffect(() => {
    if (ready && !state.profile.onboarded) router.replace("/onboarding");
  }, [ready, state.profile.onboarded, router]);

  const sentence = useMemo(() => riderSentence(inDomain), [inDomain]);
  const counts = useMemo(() => Object.fromEntries(DOMAINS.map((x) => [x.id, state.items.filter((i) => i.source === "told" && (i.domain ?? "food") === x.id).length])), [state.items]);
  const room = roomFor(domain);
  const nextName = domain === "food"
    ? (DISHES.find((x) => !state.ratings.some((r) => r.dishId === x.id)) ?? DISHES[0]).name.toLowerCase()
    : (room.cards.find((c) => !state.ratings.some((r) => r.dishId === c.id)) ?? room.cards[0]).name.toLowerCase();
  const headline = useMemo(() => synopsisHeadline(state), [state]);
  const hasAllergy = state.items.some((i) => i.allergy && i.source === "told");

  if (!ready || !state.profile.onboarded) return <main className="page" aria-busy="true"><Glows /></main>;

  return (
    <main className="page">
      <Glows />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 22 }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <RiderWordmark size={20} />
          <Link href="/places" className="icon-btn" aria-label="My profile and connected apps" style={{ fontWeight: 300, fontSize: 18 }}>
            {(state.profile.name || "R").charAt(0).toUpperCase()}
          </Link>
        </header>

        <RiderCard name={state.profile.name} allergy={hasAllergy} href="/pass" />

        <Link href="/synopsis" className="glass synopsis-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", textDecoration: "none" }}>
          <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--sub)" }}><span className="live-dot" />Rider's read on you</span>
            <span style={{ fontSize: 14, lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{headline}</span>
          </span>
          <IconChevron />
        </Link>

        <nav aria-label="Categories" className="cat-row">
          {DOMAINS.map((x) => (
            <button key={x.id} type="button" className="pill cat" aria-pressed={x.id === domain}
              onClick={() => router.replace(x.id === "food" ? "/" : `/?d=${x.id}`, { scroll: false })}>
              {x.label}
            </button>
          ))}
        </nav>

        <CategoryBanner domain={domain} count={counts[domain] ?? 0} />

        {counts[domain] > 0 && (
          <section aria-label="What every app hears" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="small" style={{ fontSize: 12 }}>What every app hears, for {D.label.toLowerCase()}</span>
            <p key={sentence} className="display reveal" style={{ fontSize: 21, lineHeight: 1.28, animationDuration: ".35s" }}>{sentence}</p>
          </section>
        )}

        <RiderEditor domain={domain} />

        <Link href={room.href} className="glass" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px 10px 10px", textDecoration: "none", transition: "transform .18s var(--ease-out)" }}>
          <span aria-hidden="true" style={{ width: 48, height: 48, borderRadius: 14, background: D.art, flex: "none" }} />
          <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{room.name}</span>
            <span className="small">Up next: {nextName}</span>
          </span>
          <IconChevron />
        </Link>
      </div>
      <TabBar />
    </main>
  );
}
