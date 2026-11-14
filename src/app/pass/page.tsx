"use client";

import Link from "next/link";
import { useRider } from "@/lib/store";
import { riderSentence } from "@/lib/sentence";
import { Glows } from "@/components/Glows";
import { RiderCard } from "@/components/RiderCard";
import { IconBack, IconWallet } from "@/components/Icons";

/** The pass: what a server or hotel sees when you show your phone. Large type, never list first. */
export default function Pass() {
  const { state } = useRider();
  const told = state.items.filter((i) => i.source === "told" && (i.domain ?? "food") === "food");
  const never = told.filter((i) => i.tier === "never");
  const rather = told.filter((i) => i.tier === "rather");

  return (
    <main className="page" style={{ paddingBottom: 30 }}>
      <Glows lift={40} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" className="icon-btn" aria-label="Back" style={{ width: 40, height: 40 }}><IconBack /></Link>
          <h1 className="display" style={{ fontSize: 26 }}>Show at the table</h1>
        </header>

        <RiderCard name={state.profile.name} caption="Hospitality rider" height={190} />

        <section className="glass" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--sub)" }}>Never</span>
            <p className="display" style={{ fontSize: 24, lineHeight: 1.25, marginTop: 4 }}>
              {never.length ? never.map((i) => i.label + (i.allergy ? " (allergy)" : "")).join(", ") : "Nothing on this list"}
            </p>
          </div>
          <div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--sub)" }}>Please go easy on</span>
            <p style={{ fontSize: 17, lineHeight: 1.4, margin: "4px 0 0" }}>{rather.length ? rather.map((i) => i.label).join(", ") : "Nothing"}</p>
          </div>
          <p className="small" style={{ margin: 0, fontSize: 12, lineHeight: 1.45 }}>Self-reported by the guest. Please confirm allergies with the kitchen.</p>
        </section>

        <p className="small" style={{ lineHeight: 1.45 }}>{riderSentence(told)}</p>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          <button type="button" className="btn btn-ghost btn-block"><IconWallet />Add to Apple Wallet</button>
          <button type="button" className="btn btn-primary btn-block" onClick={() => navigator.share?.({ title: "My Rider", text: riderSentence(told) }).catch(() => {})}>Send ahead to a restaurant</button>
        </div>
      </div>
    </main>
  );
}
