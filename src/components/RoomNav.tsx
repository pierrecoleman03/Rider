"use client";

import Link from "next/link";
import { ROOMS } from "@/lib/rooms";
import type { Domain } from "@/lib/types";

/** The row of rooms at the top of every room, so you can wander from one to the next. */
export function RoomNav({ current }: { current: Domain }) {
  return (
    <nav aria-label="Rooms" className="cat-row">
      {ROOMS.map((r) => (
        <Link key={r.domain} href={r.href} className="pill cat" aria-pressed={r.domain === current} aria-current={r.domain === current ? "page" : undefined} style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
          {r.name}
        </Link>
      ))}
    </nav>
  );
}

/** Small confirmation that a score just changed the rider. */
export function AddedToast({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div role="status" style={{ position: "fixed", left: 0, right: 0, bottom: 104, zIndex: 40, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <span className="reveal" style={{ background: "var(--ink)", color: "#fff", borderRadius: 20, padding: "10px 16px", fontSize: 14, boxShadow: "0 14px 30px rgba(28,28,58,0.3)", whiteSpace: "nowrap", animationDuration: ".25s" }}>{text}</span>
    </div>
  );
}
