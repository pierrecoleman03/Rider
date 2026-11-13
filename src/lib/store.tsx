"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Connection, Rating, RiderItem, RiderState, Scope, Tier } from "./types";
import { DEFAULT_SCOPES } from "./apps";
import { lookup } from "./vocab";
import { hasSupabase, supabaseBrowser } from "./supabase";

const KEY = "rider:v1";

const EMPTY: RiderState = {
  profile: { name: "", onboarded: false },
  items: [],
  ratings: [],
  connections: [],
};

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}
const now = () => new Date().toISOString();

/** itin has Rider built in, so every new rider starts connected to it. */
function itinConnection(): Connection {
  return { id: uid(), appId: "itin", scopes: [...DEFAULT_SCOPES], connectedAt: now() };
}

/** Starter guesses so the transparency layer has something to show; replaced by real signals from connected apps. */
function starterGuesses(): RiderItem[] {
  return [
    { id: uid(), label: "Greek seafood", tier: "love", source: "guess", confidence: 0.72, reason: "From itin: you saved 3 Greek spots this month.", createdAt: now() },
    { id: uid(), label: "Natural wine", tier: "love", source: "guess", confidence: 0.61, reason: "You love big Italian reds. Natural wine is a close neighbor.", createdAt: now() },
  ];
}

// ---------- persistence adapters ----------

interface Adapter {
  load(): Promise<RiderState | null>;
  save(state: RiderState, change: Change): Promise<void>;
}

type Change =
  | { kind: "profile" }
  | { kind: "item-upsert"; item: RiderItem }
  | { kind: "item-delete"; id: string }
  | { kind: "items-replace" }
  | { kind: "rating"; rating: Rating }
  | { kind: "connection-upsert"; connection: Connection }
  | { kind: "reset" };

const localAdapter: Adapter = {
  async load() {
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as RiderState) : null;
    } catch {
      return null;
    }
  },
  async save(state) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage can be unavailable in private windows; the session keeps working in memory */
    }
  },
};

/** Supabase adapter: one row per item, rating and connection, scoped to the signed-in user by RLS. */
const supabaseAdapter: Adapter = {
  async load() {
    const sb = supabaseBrowser();
    if (!sb) return null;
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) return null;
    const [profile, items, ratings, conns] = await Promise.all([
      sb.from("profiles").select("name, onboarded").eq("id", auth.user.id).maybeSingle(),
      sb.from("rider_items").select("*").order("created_at"),
      sb.from("ratings").select("*"),
      sb.from("connections").select("*").is("revoked_at", null),
    ]);
    return {
      profile: { name: profile.data?.name ?? "", onboarded: profile.data?.onboarded ?? false },
      items: (items.data ?? []).map((r) => ({
        id: r.id, label: r.label, tier: r.tier, allergy: r.allergy, source: r.source,
        confidence: r.confidence ?? undefined, reason: r.reason ?? undefined, covers: r.covers ?? undefined, createdAt: r.created_at,
      })),
      ratings: (ratings.data ?? []).map((r) => ({ dishId: r.dish_id, score: r.score, ratedAt: r.rated_at })),
      connections: (conns.data ?? []).map((c) => ({
        id: c.id, appId: c.app_id, scopes: c.scopes, connectedAt: c.connected_at, lastReadAt: c.last_read_at ?? undefined,
      })),
    };
  },
  async save(state, change) {
    const sb = supabaseBrowser();
    if (!sb) return;
    const { data: auth } = await sb.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return;
    const itemRow = (i: RiderItem) => ({
      id: i.id, user_id: userId, label: i.label, tier: i.tier, allergy: !!i.allergy, source: i.source,
      confidence: i.confidence ?? null, reason: i.reason ?? null, covers: i.covers ?? null, created_at: i.createdAt,
    });
    switch (change.kind) {
      case "profile":
        await sb.from("profiles").upsert({ id: userId, name: state.profile.name, onboarded: state.profile.onboarded });
        break;
      case "item-upsert":
        await sb.from("rider_items").upsert(itemRow(change.item));
        break;
      case "item-delete":
        await sb.from("rider_items").delete().eq("id", change.id);
        break;
      case "items-replace":
        await sb.from("rider_items").delete().eq("user_id", userId);
        if (state.items.length) await sb.from("rider_items").insert(state.items.map(itemRow));
        break;
      case "rating":
        await sb.from("ratings").upsert({ user_id: userId, dish_id: change.rating.dishId, score: change.rating.score, rated_at: change.rating.ratedAt });
        break;
      case "connection-upsert": {
        const c = change.connection;
        await sb.from("connections").upsert({
          id: c.id, user_id: userId, app_id: c.appId, scopes: c.scopes, connected_at: c.connectedAt, revoked_at: c.revokedAt ?? null,
        });
        break;
      }
      case "reset":
        break;
    }
  },
};

// ---------- context ----------

interface RiderApi {
  ready: boolean;
  mode: "local" | "supabase";
  state: RiderState;
  signIn(provider: "apple" | "google"): Promise<void>;
  finishOnboarding(input: { name: string; items: { label: string; tier: Tier; allergy?: boolean }[] }): void;
  addItem(label: string, tier: Tier): void;
  removeItem(id: string): void;
  setTier(id: string, tier: Tier): void;
  confirmGuess(id: string): void;
  rate(dishId: string, score: number | null): void;
  setAllergy(id: string, allergy: boolean): void;
  connect(appId: string, scopes: Scope[]): void;
  setScopes(connectionId: string, scopes: Scope[]): void;
  revoke(connectionId: string): void;
  reset(): void;
}

const Ctx = createContext<RiderApi | null>(null);

export function RiderProvider({ children }: { children: React.ReactNode }) {
  const adapter = hasSupabase ? supabaseAdapter : localAdapter;
  const [state, setState] = useState<RiderState>(EMPTY);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    let alive = true;
    adapter.load().then((loaded) => {
      if (!alive) return;
      if (loaded) setState(loaded);
      setReady(true);
    });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = useCallback((next: RiderState, change: Change) => {
    // Update the ref right away so several actions in one tick build on each other instead of on a stale render.
    stateRef.current = next;
    setState(next);
    void adapter.save(next, change);
  }, [adapter]);

  const api = useMemo<RiderApi>(() => ({
    ready,
    mode: hasSupabase ? "supabase" : "local",
    state,
    async signIn(provider) {
      const sb = supabaseBrowser();
      if (!sb) return; // local mode: onboarding continues without an account
      await sb.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/onboarding?step=2` },
      });
    },
    finishOnboarding({ name, items }) {
      const s = stateRef.current;
      const told: RiderItem[] = items.map((i) => ({
        id: uid(), label: i.label, tier: i.tier, allergy: i.allergy, source: "told",
        covers: lookup(i.label)?.covers, createdAt: now(),
      }));
      const next: RiderState = {
        ...s,
        profile: { name: name || s.profile.name || "You", onboarded: true },
        items: [...told, ...starterGuesses()],
        connections: s.connections.some((c) => c.appId === "itin") ? s.connections : [itinConnection(), ...s.connections],
      };
      commit(next, { kind: "items-replace" });
      void adapter.save(next, { kind: "profile" });
      next.connections.forEach((c) => void adapter.save(next, { kind: "connection-upsert", connection: c }));
    },
    addItem(label, tier) {
      const s = stateRef.current;
      const clean = label.trim();
      if (!clean || s.items.some((i) => i.label.toLowerCase() === clean.toLowerCase() && i.source === "told")) return;
      const known = lookup(clean);
      const item: RiderItem = {
        id: uid(), label: known?.label ?? clean.charAt(0).toUpperCase() + clean.slice(1), tier, source: "told",
        covers: known?.covers, createdAt: now(),
      };
      commit({ ...s, items: [...s.items.filter((i) => !(i.source === "guess" && i.label.toLowerCase() === clean.toLowerCase())), item] }, { kind: "item-upsert", item });
    },
    removeItem(id) {
      const s = stateRef.current;
      commit({ ...s, items: s.items.filter((i) => i.id !== id) }, { kind: "item-delete", id });
    },
    setTier(id, tier) {
      const s = stateRef.current;
      const items = s.items.map((i) => (i.id === id ? { ...i, tier } : i));
      const item = items.find((i) => i.id === id);
      if (item) commit({ ...s, items }, { kind: "item-upsert", item });
    },
    setAllergy(id, allergy) {
      const s = stateRef.current;
      const items = s.items.map((i) => (i.id === id ? { ...i, allergy, tier: allergy ? ("never" as const) : i.tier } : i));
      const item = items.find((i) => i.id === id);
      if (item) commit({ ...s, items }, { kind: "item-upsert", item });
    },
    confirmGuess(id) {
      const s = stateRef.current;
      const items = s.items.map((i) => (i.id === id ? { ...i, source: "told" as const, confidence: undefined, reason: "You confirmed this." } : i));
      const item = items.find((i) => i.id === id);
      if (item) commit({ ...s, items }, { kind: "item-upsert", item });
    },
    rate(dishId, score) {
      const s = stateRef.current;
      const rating: Rating = { dishId, score, ratedAt: now() };
      commit({ ...s, ratings: [...s.ratings.filter((r) => r.dishId !== dishId), rating] }, { kind: "rating", rating });
    },
    connect(appId, scopes) {
      const s = stateRef.current;
      const existing = s.connections.find((c) => c.appId === appId);
      const connection: Connection = existing ? { ...existing, scopes, revokedAt: undefined } : { id: uid(), appId, scopes, connectedAt: now() };
      commit({ ...s, connections: [...s.connections.filter((c) => c.appId !== appId), connection] }, { kind: "connection-upsert", connection });
    },
    setScopes(connectionId, scopes) {
      const s = stateRef.current;
      const connections = s.connections.map((c) => (c.id === connectionId ? { ...c, scopes } : c));
      const connection = connections.find((c) => c.id === connectionId);
      if (connection) commit({ ...s, connections }, { kind: "connection-upsert", connection });
    },
    revoke(connectionId) {
      const s = stateRef.current;
      const target = s.connections.find((c) => c.id === connectionId);
      if (!target) return;
      const connection = { ...target, revokedAt: now() };
      commit({ ...s, connections: s.connections.filter((c) => c.id !== connectionId) }, { kind: "connection-upsert", connection });
    },
    reset() {
      try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
      setState(EMPTY);
    },
  }), [ready, state, commit, adapter]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useRider(): RiderApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useRider must be used inside RiderProvider");
  return v;
}
