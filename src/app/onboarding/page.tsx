"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRider } from "@/lib/store";
import { parseSaid } from "@/lib/vocab";
import { CALIBRATION } from "@/lib/dishes";
import { APPS, DEFAULT_SCOPES } from "@/lib/apps";
import { riderSentence } from "@/lib/sentence";
import type { RiderItem, Tier } from "@/lib/types";
import { Glows } from "@/components/Glows";
import { RiderCard } from "@/components/RiderCard";
import { IconBack, IconCheck, IconLock, IconMic, IconWallet } from "@/components/Icons";

type Draft = { label: string; tier: Tier; allergy?: boolean };
const EXAMPLES = ["Shellfish allergy", "Vegetarian", "No cilantro", "Love spicy food"];
const TIER_LABEL: Record<Tier, string> = { never: "Never", rather: "Rather not", love: "Love" };
const NEXT_TIER: Record<Tier, Tier> = { never: "rather", rather: "love", love: "never" };

function Onboarding() {
  const params = useSearchParams();
  const router = useRouter();
  const { state, startGuest, finishOnboarding, rate, connect } = useRider();
  const [starting, setStarting] = useState(false);
  const [step, setStep] = useState(() => Math.min(6, Math.max(1, Number(params.get("step")) || 1)));
  const [said, setSaid] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [asked, setAsked] = useState<string[]>([]);
  const [d, setD] = useState(0);
  const [score, setScore] = useState(0);
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [name, setName] = useState(state.profile.name);
  const [apps, setApps] = useState<Record<string, boolean>>({});

  useEffect(() => { if (state.profile.name && !name) setName(state.profile.name); }, [state.profile.name, name]);

  const question = drafts.find((x) => x.tier === "rather" && !asked.includes(x.label));
  const previewItems: RiderItem[] = useMemo(
    () => drafts.map((x, k) => ({ id: String(k), label: x.label, tier: x.tier, allergy: x.allergy, source: "told", createdAt: "" })),
    [drafts],
  );
  const covers = drafts.some((x) => x.label === "Mayo") || drafts.some((x) => x.label === "Peanuts");

  function toHeard() {
    const parsed = parseSaid(said);
    setDrafts(parsed);
    setStep(3);
  }

  async function getStarted() {
    // Sign-in is paused for now. Everyone starts as a guest; Apple and Google can be linked later without losing the rider.
    setStarting(true);
    await startGuest();
    setStarting(false);
    setStep(2);
  }

  function nextDish(tried: boolean) {
    const dish = CALIBRATION[d];
    const all = { ...scores, [dish.id]: tried && score ? score : null };
    setScores(all);
    setScore(0);
    if (d >= CALIBRATION.length - 1) setStep(5);
    else setD(d + 1);
  }

  function toWhereItWorks() {
    finishOnboarding({ name: name.trim() || "You", items: drafts });
    Object.entries(scores).forEach(([id, v]) => rate(id, v));
    setStep(6);
  }

  function finish() {
    Object.entries(apps).filter(([, on]) => on).forEach(([id]) => connect(id, [...DEFAULT_SCOPES]));
    router.replace("/");
  }

  const lift = step === 1 ? 0 : step === 5 ? 60 : -40;

  return (
    <main className="page" style={{ paddingBottom: 30 }}>
      <Glows lift={lift} intensity={step === 5 ? 1 : 0.9} />
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
        {step > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
            <button type="button" className="icon-btn" aria-label="Back" onClick={() => setStep(Math.max(1, step - 1))} style={{ width: 40, height: 40 }}><IconBack /></button>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 5 }} aria-label={`Step ${step - 1} of 5`}>
              {[2, 3, 4, 5, 6].map((k) => (
                <span key={k} style={{ height: 3, borderRadius: 2, background: k <= step ? "var(--ink)" : "rgba(28,28,58,0.12)", transition: "background-color .4s" }} />
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <section key="s1" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <span className="wordmark">Rider</span>
            <div style={{ margin: "52px auto 0", width: "88%" }}><RiderCard name="" caption="Yours in a minute" floating height={180} /></div>
            <h1 className="display h1 reveal" style={{ marginTop: 48 }}>Your taste, everywhere you eat.</h1>
            <p className="lede reveal" style={{ marginTop: 14, animationDelay: ".1s" }}>One profile of what you love, what you avoid and what you can't have. itin and other apps read it live, so you never explain yourself twice.</p>
            <div style={{ marginTop: "auto", paddingTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="lum btn-lum"><button type="button" className="btn btn-primary" disabled={starting} onClick={getStarted}>{starting ? "One moment" : "Get started"}</button></div>
              <span className="small" style={{ textAlign: "center", fontSize: 12, marginTop: 4 }}>You own your rider. Apps only see what you allow.</span>
            </div>
          </section>
        )}

        {step === 2 && (
          <section key="s2" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h1 className="display h1 reveal">Tell me how you eat.</h1>
            <p className="lede" style={{ marginTop: 12 }}>Allergies, hard nos, what you'd rather skip, what you love. Say it the way you'd tell a friend.</p>
            <label htmlFor="say" className="sr-only">Your rider in your words</label>
            <textarea id="say" className="textarea" style={{ marginTop: 22 }} value={said} onChange={(e) => setSaid(e.target.value)}
              placeholder="Allergic to peanuts. No red meat. I hate mayo, even spicy mayo. Love a big Italian red." />
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {EXAMPLES.map((x) => (
                <button key={x} type="button" className="pill" onClick={() => setSaid((s) => `${s}${s && !/[.\s]$/.test(s) ? ". " : s ? " " : ""}${x}.`)}>+ {x}</button>
              ))}
            </div>
            <div style={{ marginTop: "auto", paddingTop: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <button type="button" aria-label="Hold to talk" className="icon-btn" style={{ width: 76, height: 76, borderRadius: 38, background: "#fff", color: "var(--accent)", boxShadow: "0 0 0 10px rgba(91,69,224,0.08), 0 14px 30px rgba(60,50,120,0.18)" }}><IconMic /></button>
              <span className="small">Or hold to talk</span>
              <button type="button" className="btn btn-primary btn-block" disabled={!said.trim()} onClick={toHeard}>Continue</button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section key="s3" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h1 className="display h1 reveal">Here's what I heard.</h1>
            <p className="lede" style={{ marginTop: 12, fontSize: 15 }}>Tap a chip to move it between lists. You can change everything later.</p>
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 16 }}>
              {drafts.length === 0 && <p className="small">I didn't catch anything yet. Go back and add a few things.</p>}
              {(["never", "rather", "love"] as Tier[]).map((t, gi) => {
                const list = drafts.filter((x) => x.tier === t);
                if (!list.length) return null;
                return (
                  <div key={t} className="reveal" style={{ display: "flex", flexDirection: "column", gap: 8, animationDelay: `${0.1 + gi * 0.15}s` }}>
                    <span className="small">{TIER_LABEL[t]}</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {list.map((x) => (
                        <span key={x.label} className={`chip tier-${t}`} style={{ height: 36 }}>
                          <button type="button" style={{ border: "none", background: "transparent", color: "inherit", cursor: "pointer", fontSize: 14, fontWeight: 500, padding: 0 }}
                            onClick={() => setDrafts((all) => all.map((y) => (y.label === x.label ? { ...y, tier: NEXT_TIER[y.tier], allergy: NEXT_TIER[y.tier] === "never" ? y.allergy : false } : y)))}>
                            {x.label}{x.allergy ? " (allergy)" : ""}
                          </button>
                          <button type="button" className="chip-x" aria-label={`Remove ${x.label}`} onClick={() => setDrafts((all) => all.filter((y) => y.label !== x.label))}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {covers && (
              <div className="glass reveal" style={{ marginTop: 20, padding: "14px 16px", animationDelay: ".5s" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>I'll also catch the hidden ones</span>
                <p className="small" style={{ margin: "4px 0 0", lineHeight: 1.45 }}>Mayo covers spicy mayo, aioli and Kewpie. Peanuts covers peanut oil and satay.</p>
              </div>
            )}
            {question && (
              <div className="reveal" style={{ marginTop: 12, background: "var(--ink)", color: "#fff", borderRadius: 20, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, animationDelay: ".7s" }}>
                <span style={{ fontSize: 14, lineHeight: 1.4 }}>One question. Is {question.label.toLowerCase()} a never, or just a rather not?</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" className="btn btn-sm" style={{ flex: 1, border: "1px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff" }}
                    onClick={() => { setDrafts((all) => all.map((y) => (y.label === question.label ? { ...y, tier: "never" } : y))); setAsked((a) => [...a, question.label]); }}>Never</button>
                  <button type="button" className="btn btn-sm" style={{ flex: 1, background: "#fff", color: "var(--ink)" }}
                    onClick={() => setAsked((a) => [...a, question.label])}>Rather not</button>
                </div>
              </div>
            )}
            <button type="button" className="btn btn-primary btn-block" style={{ marginTop: "auto" }} disabled={!drafts.length} onClick={() => setStep(4)}>Looks right</button>
          </section>
        )}

        {step === 4 && (
          <section key="s4" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <h1 className="display h2">Five quick ones.</h1>
              <span className="small">{d + 1} of {CALIBRATION.length}</span>
            </div>
            <p className="lede" style={{ marginTop: 8, fontSize: 15 }}>Score how much you'd enjoy each one. This is how Rider learns what to put first.</p>
            <article key={CALIBRATION[d].id} className="card-swap" style={{ marginTop: 20, background: "#fff", borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 48px rgba(60,50,120,0.12)" }}>
              <div role="img" aria-label={`Photo placeholder: ${CALIBRATION[d].name}`} style={{ height: 210, background: CALIBRATION[d].tone, position: "relative" }}>
                <span style={{ position: "absolute", left: 14, bottom: 12, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>Photo: {CALIBRATION[d].name}</span>
              </div>
              <div style={{ padding: "18px 20px 20px" }}>
                <h2 className="display" style={{ fontSize: 34 }}>{CALIBRATION[d].name}</h2>
                <p className="small" style={{ margin: "6px 0 16px", fontSize: 14 }}>{CALIBRATION[d].note}</p>
                <div className="rate-row" role="group" aria-label="How much would you enjoy it, 1 to 10">
                  {Array.from({ length: 10 }, (_, k) => k + 1).map((n) => (
                    <button key={n} type="button" aria-pressed={score === n} aria-label={`${n} out of 10`} onClick={() => setScore(n)}
                      className={`rate${score === n ? " on" : score && n <= score ? " lit" : ""}`}>{n}</button>
                  ))}
                </div>
                <div className="small" style={{ marginTop: 6, display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>Never</span><span>Obsessed</span></div>
              </div>
            </article>
            <div style={{ marginTop: "auto", paddingTop: 20, display: "flex", gap: 10 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => nextDish(false)}>Haven't tried it</button>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} disabled={!score} onClick={() => nextDish(true)}>Next</button>
            </div>
          </section>
        )}

        {step === 5 && (
          <section key="s5" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h1 className="display h1 reveal">Your rider is ready.</h1>
            <div className="reveal" style={{ marginTop: 30, animationDelay: ".15s" }}>
              <RiderCard name={name} allergy={drafts.some((x) => x.allergy)} caption={`${drafts.length} notes, ${Object.values(scores).filter(Boolean).length} scores`} floating height={200} />
            </div>
            <label htmlFor="card-name" className="small" style={{ marginTop: 22 }}>Name on your card</label>
            <input id="card-name" className="input" style={{ paddingLeft: 16, marginTop: 6 }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name" />
            <p className="display reveal" style={{ marginTop: 20, fontSize: 19, lineHeight: 1.3, animationDelay: ".3s" }}>{riderSentence(previewItems)}</p>
            <div style={{ marginTop: "auto", paddingTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              <button type="button" className="btn btn-ghost btn-block"><IconWallet />Add to Apple Wallet</button>
              <button type="button" className="btn btn-primary btn-block" disabled={!name.trim()} onClick={toWhereItWorks}>Continue</button>
            </div>
          </section>
        )}

        {step === 6 && (
          <section key="s6" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
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
  return (
    <Suspense fallback={<main className="page"><Glows /></main>}>
      <Onboarding />
    </Suspense>
  );
}
