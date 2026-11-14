"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRider } from "@/lib/store";
import { COMMON_NEVERS, lookup, suggest } from "@/lib/vocab";
import { APPS, DEFAULT_SCOPES } from "@/lib/apps";
import { riderSentence, joinList } from "@/lib/sentence";
import type { RiderItem } from "@/lib/types";
import { Glows } from "@/components/Glows";
import { RiderCard } from "@/components/RiderCard";
import { IconBack, IconCheck, IconLock, IconPlus, IconWallet } from "@/components/Icons";
import { RiderWordmark } from "@/components/RiderMark";

type Pick = { label: string; allergy: boolean };

/**
 * Onboarding, kept short on purpose:
 * 1 welcome, 2 what you never eat, 3 your card, 4 where Rider works.
 * Everything softer (rather nots, loves, scores) is learned later in the app and the Tasting Room.
 */
function Onboarding() {
  const params = useSearchParams();
  const router = useRouter();
  const { state, startGuest, finishOnboarding, connect } = useRider();
  const [step, setStep] = useState(() => Math.min(4, Math.max(1, Number(params.get("step")) || 1)));
  const [starting, setStarting] = useState(false);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [query, setQuery] = useState("");
  const [name, setName] = useState(state.profile.name);
  const [apps, setApps] = useState<Record<string, boolean>>({});

  const picked = (label: string) => picks.some((p) => p.label === label);
  const toggle = (label: string) =>
    setPicks((all) => (picked(label) ? all.filter((p) => p.label !== label) : [...all, { label, allergy: false }]));
  const setAllergy = (label: string, allergy: boolean) => setPicks((all) => all.map((p) => (p.label === label ? { ...p, allergy } : p)));

  const extras = picks.filter((p) => !COMMON_NEVERS.includes(p.label));
  const matches = useMemo(() => suggest(query, picks.map((p) => p.label), 3), [query, picks]);
  const raw = query.trim();
  const options = [...matches.map((m) => m.label), ...(raw && !matches.some((m) => m.label.toLowerCase() === raw.toLowerCase()) ? [raw.charAt(0).toUpperCase() + raw.slice(1)] : [])];

  const covered = picks.flatMap((p) => (lookup(p.label)?.covers ?? []).slice(0, 2).map((c) => ({ from: p.label, c })));
  const previewItems: RiderItem[] = picks.map((p, k) => ({ id: String(k), label: p.label, tier: "never", allergy: p.allergy, source: "told", createdAt: "" }));

  async function getStarted() {
    setStarting(true);
    await startGuest();
    setStarting(false);
    setStep(2);
  }

  function addOther(label: string) {
    if (!picked(label)) setPicks((all) => [...all, { label, allergy: false }]);
    setQuery("");
  }

  function toWhereItWorks() {
    finishOnboarding({ name: name.trim() || "You", items: picks.map((p) => ({ label: p.label, tier: "never", allergy: p.allergy })) });
    setStep(4);
  }

  function finish() {
    Object.entries(apps).filter(([, on]) => on).forEach(([id]) => connect(id, [...DEFAULT_SCOPES]));
    router.replace("/");
  }

  return (
    <main className="page" style={{ paddingBottom: 30 }}>
      <Glows lift={step === 1 ? 0 : step === 3 ? 60 : -40} intensity={step === 3 ? 1 : 0.9} />
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
        {step > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
            <button type="button" className="icon-btn" aria-label="Back" onClick={() => setStep(step - 1)} style={{ width: 40, height: 40 }}><IconBack /></button>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 5 }} aria-label={`Step ${step - 1} of 3`}>
              {[2, 3, 4].map((k) => <span key={k} style={{ height: 3, borderRadius: 2, background: k <= step ? "var(--ink)" : "rgba(28,28,58,0.12)", transition: "background-color .4s" }} />)}
            </div>
          </div>
        )}

        {step === 1 && (
          <section key="s1" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <RiderWordmark size={20} />
            <div style={{ margin: "52px auto 0", width: "88%" }}><RiderCard name="" caption="Yours in a minute" floating height={180} /></div>
            <h1 className="display h1 reveal" style={{ marginTop: 48 }}>Your taste, everywhere you go.</h1>
            <p className="lede reveal" style={{ marginTop: 14, animationDelay: ".1s" }}>One profile of what you love, what you avoid and what you can't have. The apps you use read it live, so you never explain yourself twice.</p>
            <div style={{ marginTop: "auto", paddingTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="lum btn-lum"><button type="button" className="btn btn-primary" disabled={starting} onClick={getStarted}>{starting ? "One moment" : "Get started"}</button></div>
              <span className="small" style={{ textAlign: "center", fontSize: 12, marginTop: 4 }}>You own your rider. Apps only see what you allow.</span>
            </div>
          </section>
        )}

        {step === 2 && (
          <section key="s2" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h1 className="display h1 reveal">What do you never eat?</h1>
            <p className="lede" style={{ marginTop: 12, fontSize: 15 }}>Allergies and hard nos. Everything else can come later.</p>

            <div style={{ marginTop: 22, display: "flex", flexWrap: "wrap", gap: 8 }} role="group" aria-label="Common hard nos">
              {COMMON_NEVERS.map((label) => {
                const on = picked(label);
                return (
                  <button key={label} type="button" aria-pressed={on} onClick={() => toggle(label)} className="pill"
                    style={{ height: 42, padding: "0 16px", fontSize: 15, ...(on ? { background: "var(--ink)", color: "#fff", borderColor: "var(--ink)" } : {}) }}>
                    {on ? "✓ " : ""}{label}
                  </button>
                );
              })}
              {extras.map((p) => (
                <button key={p.label} type="button" aria-pressed onClick={() => toggle(p.label)} className="pill chip" style={{ height: 42, padding: "0 16px", fontSize: 15, background: "var(--ink)", color: "#fff", borderColor: "var(--ink)" }}>✓ {p.label}</button>
              ))}
            </div>

            <div style={{ position: "relative", marginTop: 14 }}>
              <label htmlFor="other" className="sr-only">Something else you never eat</label>
              <input id="other" className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Something else?" autoComplete="off"
                onKeyDown={(e) => { if (e.key === "Enter" && options[0]) { e.preventDefault(); addOther(options[0]); } }} />
              <span style={{ position: "absolute", left: 15, top: 15, color: "var(--sub)" }}><IconPlus /></span>
              {options.length > 0 && (
                <div className="reveal" style={{ position: "absolute", left: 0, right: 0, top: 54, zIndex: 10, background: "#fff", borderRadius: 18, padding: 6, boxShadow: "0 18px 40px rgba(28,28,58,0.16), 0 0 0 1px rgba(28,28,58,0.06)", animationDuration: ".2s" }}>
                  {options.map((o, k) => (
                    <button key={o} type="button" onClick={() => addOther(o)} style={{ width: "100%", height: 44, display: "flex", alignItems: "center", padding: "0 12px", border: "none", borderRadius: 12, background: k === 0 ? "#f4f2fc" : "#fff", fontSize: 15, textAlign: "left", cursor: "pointer" }}>
                      {k >= matches.length ? `Add “${o}”` : o}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {picks.length > 0 && (
              <div className="glass reveal" style={{ marginTop: 18, padding: "6px 16px" }}>
                <span className="small" style={{ display: "block", padding: "10px 0 4px" }}>Which are allergies?</span>
                {picks.map((p, k) => (
                  <label key={p.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 46, borderTop: k ? "1px solid rgba(28,28,58,0.06)" : "none", fontSize: 15, cursor: "pointer" }}>
                    {p.label}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--sub)" }}>
                      Allergy
                      <input type="checkbox" checked={p.allergy} onChange={(e) => setAllergy(p.label, e.target.checked)} style={{ width: 22, height: 22, accentColor: "var(--accent)" }} />
                    </span>
                  </label>
                ))}
              </div>
            )}

            {covered.length > 0 && (
              <p className="small reveal" style={{ marginTop: 12, lineHeight: 1.45 }}>
                Rider also watches for the hidden ones, like {joinList(covered.slice(0, 4).map((x) => x.c))}.
              </p>
            )}

            <button type="button" className="btn btn-primary btn-block" style={{ marginTop: "auto" }} onClick={() => setStep(3)}>
              {picks.length ? "Continue" : "Nothing to add, continue"}
            </button>
          </section>
        )}

        {step === 3 && (
          <section key="s3" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h1 className="display h1 reveal">Your rider is ready.</h1>
            <div className="reveal" style={{ marginTop: 30, animationDelay: ".15s" }}>
              <RiderCard name={name} badge="Ready to connect" caption={picks.length ? `${picks.length} hard ${picks.length === 1 ? "no" : "nos"}` : "Add more anytime"} floating height={200} />
            </div>
            <label htmlFor="card-name" className="small" style={{ marginTop: 22 }}>Name on your card</label>
            <input id="card-name" className="input" style={{ paddingLeft: 16, marginTop: 6 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name" />
            {picks.length > 0 && <p className="display reveal" style={{ marginTop: 20, fontSize: 19, lineHeight: 1.3, animationDelay: ".3s" }}>{riderSentence(previewItems)}</p>}
            <div style={{ marginTop: "auto", paddingTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <button type="button" className="btn btn-ghost btn-block"><IconWallet />Add to Apple Wallet</button>
              <button type="button" className="btn btn-primary btn-block" disabled={!name.trim()} onClick={toWhereItWorks}>Continue</button>
            </div>
          </section>
        )}

        {step === 4 && (
          <section key="s4" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h1 className="display h1 reveal">Where Rider works.</h1>
            <p className="lede" style={{ marginTop: 12, fontSize: 15 }}>Every app reads your rider live and sees only what you allow.</p>
            <div className="glass" style={{ marginTop: 22, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: "var(--ink)", color: "#fff", fontStyle: "italic", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>itin</span>
              <span style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>itin</span>
                <span className="small">Built in. Your picks already use your rider.</span>
              </span>
              <span aria-label="Connected" style={{ width: 26, height: 26, borderRadius: 13, background: "var(--love-bg)", color: "var(--love-fg)", display: "flex", alignItems: "center", justifyContent: "center" }}><IconCheck /></span>
            </div>
            <span className="small" style={{ marginTop: 20 }}>Turn on when you want</span>
            <div className="glass" style={{ marginTop: 8, padding: "2px 16px" }}>
              {APPS.filter((a) => !a.builtIn).map((a, k) => (
                <label key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 62, borderTop: k ? "1px solid rgba(28,28,58,0.08)" : "none", cursor: "pointer" }}>
                  <span style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{a.name}</span>
                    <span className="small">{a.description}</span>
                  </span>
                  <input type="checkbox" checked={!!apps[a.id]} onChange={(e) => setApps((s) => ({ ...s, [a.id]: e.target.checked }))} style={{ width: 22, height: 22, accentColor: "var(--accent)" }} />
                </label>
              ))}
            </div>
            <p className="small" style={{ marginTop: 16, display: "flex", gap: 10, lineHeight: 1.45 }}><IconLock />Disconnect any app and it loses access instantly. Rider never sells your data.</p>
            <div className="lum btn-lum" style={{ marginTop: "auto" }}><button type="button" className="btn btn-primary" onClick={finish}>Go to my rider</button></div>
          </section>
        )}
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return <Suspense fallback={<main className="page"><Glows /></main>}><Onboarding /></Suspense>;
}
