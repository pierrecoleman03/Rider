"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useRider } from "@/lib/store";
import { suggest } from "@/lib/vocab";
import type { Domain, RiderItem, Tier } from "@/lib/types";
import { domainById } from "@/lib/domains";
import { IconPlus } from "./Icons";

const TIERS: { id: Tier; label: string }[] = [
  { id: "never", label: "Never" },
  { id: "rather", label: "Rather not" },
  { id: "love", label: "Love" },
];

/** Type-to-add box with live suggestions, chips grouped by tier, Rider's guesses, and a detail sheet per item. */
export function RiderEditor({ domain = "food" }: { domain?: Domain }) {
  const D = domainById(domain);
  const { state, addItem, removeItem, setTier, setAllergy, confirmGuess } = useRider();
  const [query, setQuery] = useState("");
  // Food starts on Never (allergies first); everything else starts on Love.
  const [tier, setTierChoice] = useState<Tier>(domain === "food" ? "never" : "love");
  useEffect(() => { setTierChoice(domain === "food" ? "never" : "love"); setQuery(""); }, [domain]);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<RiderItem | null>(null);
  const listId = useId();

  const inDomain = state.items.filter((i) => (i.domain ?? "food") === domain);
  const told = inDomain.filter((i) => i.source === "told");
  const guesses = inDomain.filter((i) => i.source === "guess");
  const matches = useMemo(() => suggest(query, told.map((i) => i.label), 4, domain === "food" ? undefined : D.vocab), [query, told, domain, D.vocab]);
  const raw = query.trim();
  const exact = matches.some((m) => m.label.toLowerCase() === raw.toLowerCase());
  const options = [...matches.map((m) => m.label), ...(raw && !exact ? [raw.charAt(0).toUpperCase() + raw.slice(1)] : [])];

  function add(label: string) {
    addItem(label, tier, domain);
    setQuery("");
    setActive(0);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!options.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % options.length); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + options.length) % options.length); }
    if (e.key === "Enter") { e.preventDefault(); add(options[active] ?? options[0]); }
    if (e.key === "Escape") setQuery("");
  }

  const current = open ? state.items.find((i) => i.id === open.id) ?? null : null;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }} aria-label="Your rider">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Your rider</h2>
        <span className="small" style={{ fontSize: 12 }}>{told.length} in {D.label.toLowerCase()}, read live by {state.connections.length} {state.connections.length === 1 ? "app" : "apps"}</span>
      </div>

      {told.length === 0 && D.empty && <p className="small reveal" style={{ margin: 0, lineHeight: 1.45 }}>{D.empty}</p>}

      <div style={{ position: "relative" }}>
        <label htmlFor="rider-add" className="sr-only">Add to your rider</label>
        <input
          id="rider-add"
          className="input"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); }}
          onKeyDown={onKey}
          placeholder={D.hint}
          autoComplete="off"
          role="combobox"
          aria-expanded={options.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
        />
        <span style={{ position: "absolute", left: 15, top: 15, color: "var(--sub)" }}><IconPlus /></span>

        {options.length > 0 && (
          <div className="reveal" style={{ position: "absolute", left: 0, right: 0, top: 54, zIndex: 10, background: "#fff", borderRadius: 18, padding: 6, boxShadow: "0 18px 40px rgba(28,28,58,0.16), 0 0 0 1px rgba(28,28,58,0.06)", animationDuration: ".2s" }}>
            <div style={{ display: "flex", gap: 6, padding: "6px 6px 8px" }} role="group" aria-label="Add as">
              {TIERS.map((t) => (
                <button key={t.id} type="button" className={`pill tier-${t.id === tier ? t.id : ""}`} aria-pressed={t.id === tier}
                  onClick={() => setTierChoice(t.id)}
                  style={{ height: 30, fontSize: 12, padding: "0 12px", ...(t.id === tier ? { borderColor: "transparent" } : { background: "#fff", color: "var(--ink)" }) }}>
                  {t.label}
                </button>
              ))}
            </div>
            <ul id={listId} role="listbox" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {options.map((label, k) => {
                const custom = k >= matches.length;
                return (
                  <li key={label + k} role="option" aria-selected={k === active}>
                    <button type="button" onClick={() => add(label)} onMouseEnter={() => setActive(k)}
                      style={{ width: "100%", height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", border: "none", borderRadius: 12, background: k === active ? "#f4f2fc" : "#fff", fontSize: 15, textAlign: "left", cursor: "pointer", transition: "background-color .15s" }}>
                      <span>{custom ? `Add “${label}”` : label}</span>
                      <span className="small" style={{ fontSize: 12 }}>{custom ? "as written" : `as ${TIERS.find((t) => t.id === tier)!.label.toLowerCase()}`}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {TIERS.map((t) => {
          const list = told.filter((i) => i.tier === t.id);
          return (
            <div key={t.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span className="small" style={{ flex: "none", width: 72, fontSize: 12, paddingTop: 8 }}>{t.label}</span>
              <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 6, minHeight: 32 }}>
                {list.length === 0 && <span className="small" style={{ fontSize: 12, paddingTop: 8, opacity: 0.7 }}>Nothing yet</span>}
                {list.map((i) => (
                  <span key={i.id} className={`chip tier-${t.id}`}>
                    <button type="button" onClick={() => setOpen(i)} style={{ border: "none", background: "transparent", color: "inherit", cursor: "pointer", padding: 0, fontSize: 13, fontWeight: 500 }}>
                      {i.label}{i.allergy ? " (allergy)" : ""}
                    </button>
                    <button type="button" className="chip-x" aria-label={`Remove ${i.label}`} onClick={() => removeItem(i.id)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {guesses.length > 0 && (
        <div className="glass" style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Rider's guesses</span>
          {guesses.map((g) => (
            <div key={g.id} className="reveal" style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 10, borderTop: "1px solid rgba(28,28,58,0.06)" }}>
              <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 500 }}>{g.label}</span>
                <span className="small" style={{ fontSize: 12, whiteSpace: "nowrap" }}>{Math.round((g.confidence ?? 0) * 100)}% sure</span>
              </span>
              <span className="small" style={{ fontSize: 12, lineHeight: 1.4 }}>{g.reason}</span>
              <span style={{ display: "flex", gap: 8 }}>
                <button type="button" className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => confirmGuess(g.id)}>That's me</button>
                <button type="button" className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => removeItem(g.id)}>Not me</button>
              </span>
            </div>
          ))}
        </div>
      )}

      {current && (
        <>
          <button className="scrim" aria-label="Close" onClick={() => setOpen(null)} />
          <div className="sheet" role="dialog" aria-label={current.label}>
            <div className="handle" />
            <h3 className="display" style={{ fontSize: 34 }}>{current.label}</h3>
            <p className="small" style={{ margin: "8px 0 16px" }}>{current.reason ?? "You told Rider this."}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
              {TIERS.map((t) => (
                <button key={t.id} type="button" aria-pressed={current.tier === t.id} onClick={() => setTier(current.id, t.id)}
                  className={`btn btn-sm ${current.tier === t.id ? `tier-${t.id}` : "btn-ghost"}`} style={{ height: 46 }}>
                  {t.label}
                </button>
              ))}
            </div>
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 52, marginTop: 10, fontSize: 15 }}>
              It's an allergy
              <input type="checkbox" checked={!!current.allergy} onChange={(e) => setAllergy(current.id, e.target.checked)} style={{ width: 22, height: 22, accentColor: "var(--accent)" }} />
            </label>
            {current.covers && current.covers.length > 0 && (
              <div style={{ background: "#f4f2fc", borderRadius: 16, padding: "12px 14px", marginTop: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Also catches</span>
                <p className="small" style={{ margin: "4px 0 0", lineHeight: 1.45 }}>{current.covers.join(", ")}. Rider flags dishes that usually include these, even when the menu doesn't say so.</p>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => { removeItem(current.id); setOpen(null); }}>Remove</button>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => setOpen(null)}>Done</button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
