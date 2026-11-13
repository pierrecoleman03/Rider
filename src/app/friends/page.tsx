"use client";

import { useState } from "react";
import { useRider } from "@/lib/store";
import { Glows } from "@/components/Glows";
import { TabBar } from "@/components/TabBar";

/** Friends: the start of linked riders for group dinners. Invites work now; table matching ships with itin. */
export default function Friends() {
  const { state } = useRider();
  const [copied, setCopied] = useState(false);

  async function invite() {
    const text = `${state.profile.name || "A friend"} wants your Rider so dinner plans work for everyone.`;
    const url = typeof window !== "undefined" ? window.location.origin : "";
    try {
      if (navigator.share) await navigator.share({ title: "Join me on Rider", text, url });
      else { await navigator.clipboard.writeText(`${text} ${url}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch { /* person closed the share sheet */ }
  }

  return (
    <main className="page">
      <Glows intensity={0.6} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 18 }}>
        <header>
          <h1 className="display" style={{ fontSize: 34 }}>Dinner with friends</h1>
          <p className="lede" style={{ marginTop: 10, fontSize: 15 }}>Link riders with the people you eat with. itin uses everyone's riders to find tables that work for the whole group.</p>
        </header>
        <div className="glass" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontWeight: 600 }}>No linked friends yet</span>
          <span className="small" style={{ lineHeight: 1.45 }}>Invite someone. They make a rider in a minute, and you each choose what the other can see.</span>
          <div className="lum btn-lum" style={{ alignSelf: "stretch" }}><button type="button" className="btn btn-primary" onClick={invite}>{copied ? "Invite link copied" : "Invite a friend"}</button></div>
        </div>
      </div>
      <TabBar />
    </main>
  );
}
