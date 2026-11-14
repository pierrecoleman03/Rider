"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useRider } from "@/lib/store";
import { riderSentence } from "@/lib/sentence";
import { DISHES } from "@/lib/dishes";
import { Glows } from "@/components/Glows";
import { RiderCard } from "@/components/RiderCard";
import { RiderEditor } from "@/components/RiderEditor";
import { TabBar } from "@/components/TabBar";
import { IconChevron } from "@/components/Icons";
import { RiderWordmark } from "@/components/RiderMark";

export default function Home() {
  const { ready, state } = useRider();
  const router = useRouter();

  useEffect(() => {
    if (ready && !state.profile.onboarded) router.replace("/onboarding");
  }, [ready, state.profile.onboarded, router]);

  const sentence = useMemo(() => riderSentence(state.items), [state.items]);
  const next = DISHES.find((d) => !state.ratings.some((r) => r.dishId === d.id)) ?? DISHES[0];
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

        <section aria-label="What every app hears" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="small" style={{ fontSize: 12 }}>What every app hears</span>
          <p key={sentence} className="display reveal" style={{ fontSize: 21, lineHeight: 1.28, animationDuration: ".35s" }}>{sentence}</p>
        </section>

        <RiderEditor />

        <Link href="/tasting" className="glass" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px 10px 10px", textDecoration: "none", transition: "transform .18s var(--ease-out)" }}>
          <span role="img" aria-label={`${next.name} photo placeholder`} style={{ width: 48, height: 48, borderRadius: 14, background: next.tone, flex: "none" }} />
          <span style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Tasting Room</span>
            <span className="small">Up next: {next.name.toLowerCase()}, from {next.region}</span>
          </span>
          <IconChevron />
        </Link>
      </div>
      <TabBar />
    </main>
  );
}
