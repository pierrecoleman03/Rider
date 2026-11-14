"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRider } from "@/lib/store";
import { SCOPE_LABEL, appById } from "@/lib/apps";
import { supabaseBrowser } from "@/lib/supabase";
import type { Scope } from "@/lib/types";
import { Glows } from "@/components/Glows";
import { IconLock } from "@/components/Icons";
import { RiderMark } from "@/components/RiderMark";

const SCOPE_HINT: Record<Scope, string> = {
  never: "Allergies and hard nos",
  rather: "Things you'd rather skip",
  love: "What you love",
  guesses: "Rider's guesses, off unless you turn it on",
};

/**
 * Connect with Rider: the consent screen a partner app opens.
 * /connect?client_id=delivery&scope=never+rather+love&redirect_uri=https://partner/callback&state=xyz
 */
function Connect() {
  const params = useSearchParams();
  const { state, connect, mode } = useRider();
  const clientId = params.get("client_id") ?? "";
  const app = appById(clientId);
  const requested = (params.get("scope") ?? "never rather love").split(/[\s+,]+/).filter((s): s is Scope => s in SCOPE_LABEL);
  const [scopes, setScopes] = useState<Scope[]>(requested.filter((s) => s !== "guesses"));
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function approve() {
    setError("");
    const redirect = params.get("redirect_uri");
    if (mode === "supabase" && redirect) {
      const sb = supabaseBrowser();
      const { data } = await sb!.auth.getSession();
      const res = await fetch("/api/connect/approve", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` },
        body: JSON.stringify({ app_id: clientId, scopes, redirect_uri: redirect, state: params.get("state") }),
      });
      const body = await res.json();
      if (!res.ok) { setError("That didn't work. Check that you're signed in and try again."); return; }
      window.location.href = body.redirect;
      return;
    }
    connect(clientId, scopes);
    setDone(true);
  }

  if (!app) {
    return (
      <main className="page"><Glows /><div style={{ position: "relative" }}>
        <h1 className="display h2">Unknown app</h1>
        <p className="lede" style={{ marginTop: 10 }}>This connection link is missing a registered app. Ask the app to send you a new link.</p>
      </div></main>
    );
  }

  return (
    <main className="page" style={{ paddingBottom: 30 }}>
      <Glows />
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 30 }}>
          <span style={{ width: 56, height: 56, borderRadius: 16, background: "var(--ink)", color: "#fff", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>{app.name.charAt(0)}</span>
          <span aria-hidden="true" style={{ letterSpacing: 4, color: "var(--muted)" }}>...</span>
          <span className="lum" style={{ "--lum-radius": "16px" } as React.CSSProperties}>
            <span style={{ width: 56, height: 56, background: "var(--pearl)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink)" }}><RiderMark size={30} title="Rider" /></span>
          </span>
        </div>

        {done ? (
          <section className="reveal" style={{ textAlign: "center", marginTop: 40 }}>
            <h1 className="display h2">Connected</h1>
            <p className="lede" style={{ marginTop: 12 }}>{app.name} now reads your rider live. You can change what it sees or disconnect anytime.</p>
            <Link href="/places" className="btn btn-primary btn-block" style={{ marginTop: 30 }}>See connected apps</Link>
          </section>
        ) : (
          <>
            <h1 className="display h2 reveal" style={{ textAlign: "center", marginTop: 28 }}>{app.name} wants to use your Rider</h1>
            <p className="lede" style={{ textAlign: "center", marginTop: 10, fontSize: 15 }}>{app.description}. It reads your rider live and loses access the moment you disconnect.</p>
            <div className="glass" style={{ marginTop: 24, padding: "4px 16px" }}>
              {(["never", "rather", "love", "guesses"] as Scope[]).map((s, k) => (
                <label key={s} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 58, borderTop: k ? "1px solid rgba(28,28,58,0.08)" : "none", cursor: "pointer" }}>
                  <span style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{SCOPE_LABEL[s]}</span>
                    <span className="small" style={{ fontSize: 12 }}>{SCOPE_HINT[s]}</span>
                  </span>
                  <input type="checkbox" checked={scopes.includes(s)} onChange={(e) => setScopes((x) => (e.target.checked ? [...x, s] : x.filter((y) => y !== s)))} style={{ width: 22, height: 22, accentColor: "var(--accent)" }} />
                </label>
              ))}
            </div>
            {!state.profile.onboarded && <p className="small" style={{ marginTop: 12 }}>No rider yet? <Link href="/onboarding">Make one in a minute</Link>, then come back.</p>}
            {error && <p role="alert" style={{ color: "#8a1c1c", fontSize: 14 }}>{error}</p>}
            <p className="small" style={{ marginTop: 16, display: "flex", gap: 10, lineHeight: 1.45 }}><IconLock />Rider never shares who you dine with and never sells your data.</p>
            <div className="lum btn-lum" style={{ marginTop: "auto" }}>
              <button type="button" className="btn btn-primary" disabled={!scopes.length || !state.profile.onboarded} onClick={approve}>Connect with Rider</button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function ConnectPage() {
  return <Suspense fallback={<main className="page"><Glows /></main>}><Connect /></Suspense>;
}
