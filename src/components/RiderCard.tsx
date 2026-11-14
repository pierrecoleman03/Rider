"use client";

import Link from "next/link";
import { useRef } from "react";
import { IconTap } from "./Icons";
import { RiderMark } from "@/components/RiderMark";

interface Props {
  name: string;
  /** Short live line on the card, like "Live in 4 apps". Shown with a pulsing dot. */
  badge?: string;
  caption?: string;
  href?: string;
  /** Ignored: the card always keeps real credit card proportions. */
  height?: number;
  floating?: boolean;
}

/**
 * The Rider card: pearl surface, a slow sheen, and a luminous border that travels around the edge.
 * It tilts toward the pointer so it feels like a physical card in your hand.
 */
export function RiderCard({ name, badge, caption = "Tap to show at the table", href, floating }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  }
  function onLeave() {
    if (ref.current) ref.current.style.transform = "";
  }

  const body = (
    <div ref={ref} className="pearl-card" style={{ aspectRatio: "1.586 / 1", padding: "18px 20px", transition: "transform .4s var(--ease-out)" }}>
      <span style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <RiderMark size={30} title="Rider" />
        <IconTap />
      </span>
      <span style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
        <span className="display" style={{ fontSize: 32 }}>{name || "Your name"}</span>
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
          {badge ? (
            <span style={{ height: 26, padding: "0 11px 0 9px", borderRadius: 13, background: "rgba(28,28,58,0.88)", color: "#fff", display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 500 }}><span className="live-dot" />{badge}</span>
          ) : <span />}
          <span style={{ color: "#3e3f62" }}>{caption}</span>
        </span>
      </span>
    </div>
  );

  const wrapped = (
    <div className={`lum${floating ? " float" : ""}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      {body}
    </div>
  );

  return href ? (
    <Link href={href} aria-label="Open your Rider pass" style={{ textDecoration: "none", display: "block" }}>{wrapped}</Link>
  ) : wrapped;
}
