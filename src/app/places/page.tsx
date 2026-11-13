"use client";

import { useState } from "react";
import { useRider } from "@/lib/store";
import { APPS, DEFAULT_SCOPES, SCOPE_LABEL, appById } from "@/lib/apps";
import type { Scope } from "@/lib/types";
import { Glows } from "@/components/Glows";
import { TabBar } from "@/components/TabBar";
import { IconLock } from "@/components/Icons";

const ALL_SCOPES: Scope[] = ["never", "rather", "love", "guesses"];

function when(iso?: string) {
  if (!iso) return "Not read yet";
  const d = new Date(iso);
  return `Last read ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

/** Places: who reads your rider, what each app sees, and the switch to cut it off. */
export default function Places() {
  const { state, connect, setScopes, revoke, reset } = useRider();
  const [open, setOpen] = useState<string | null>(null);
  const connected = state.connections;
  const available = APPS.filter((a) => !connected.some((c) => c.appId === a.id));

  return (
    <main className="page">
      <Glows intensity={0.55} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 18 }}>
        <header>
          <h1 className="display" style={{ fontSize: 34 }}>Who sees your rider</h1>
          <p className="lede" style={{ marginTop: 10, fontSize: 15 }}>One rider, every app. Each one reads it live and only sees what you allow.</p>
        </header>

        <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {connected.map((c) => {
            const app = appById(c.appId);
            const isOpen = open === c.id;
            return (
              <div key={c.id} className="glass reveal" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 44, height: 44, borderRadius: 12, background: "var(--ink)", color: "#fff", fontStyle: app?.builtIn ? "italic" : "normal", fontSize: app?.builtIn ? 15 : 18, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                    {app?.builtIn ? "itin" : (app?.name ?? c.appId).charAt(0)}
                  </span>
                  <span style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{app?.name ?? c.appId}</span>
                    <span className="small" style={{ fontSize: 12 }}>{app?.builtIn ? "Built in. " : ""}{when(c.lastReadAt)}</span>
                  </span>
                  <button type="button" className="btn btn-ghost btn-sm" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : c.id)}>{isOpen ? "Done" : "Manage"}</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {ALL_SCOPES.map((s) => {
                    const on = c.scopes.includes(s);
                    return isOpen ? (
                      <button key={s} type="button" className="pill" aria-pressed={on} style={{ height: 32, fontSize: 12 }}
                        onClick={() => setScopes(c.id, on ? c.scopes.filter((x) => x !== s) : [...c.scopes, s])}>{SCOPE_LABEL[s]}</button>
                    ) : on ? (
                      <span key={s} style={{ height: 28, padding: "0 10px", borderRadius: 14, background: "rgba(255,255,255,0.8)", border: "1px solid var(--line)", display: "inline-flex", alignItems: "center", fontSize: 12, fontWeight: 500 }}>{SCOPE_LABEL[s]}</span>
                    ) : null;
                  })}
                </div>
                {isOpen && (
                  <button type="button" className="btn btn-ghost btn-sm reveal" style={{ alignSelf: "flex-start" }} onClick={() => { revoke(c.id); setOpen(null); }}>
                    Disconnect {app?.name ?? "app"}
                  </button>
                )}
              </div>
            );
          })}
        </section>

        {available.length > 0 && (
          <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="small">Connect more</span>
            {available.map((a) => (
              <div key={a.id} className="glass" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{a.name}</span>
                  <span className="small" style={{ fontSize: 12 }}>{a.description}</span>
                </span>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => connect(a.id, [...DEFAULT_SCOPES])}>Connect</button>
              </div>
            ))}
          </section>
        )}

        <p className="small" style={{ display: "flex", gap: 10, lineHeight: 1.45 }}><IconLock />Apps never see who you dine with and never get your guesses unless you turn them on. Disconnecting cuts access instantly.</p>

        <button type="button" className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => { reset(); window.location.href = "/onboarding"; }}>Sign out and start over</button>
      </div>
      <TabBar />
    </main>
  );
}
