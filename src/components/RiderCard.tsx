"use client";

import Link from "next/link";
import { useRef } from "react";
import { IconTap } from "./Icons";
import { RiderMark } from "@/components/RiderMark";

interface Props {
  name: string;
  allergy?: boolean;
  caption?: string;
  href?: string;
  height?: number;
  floating?: boolean;
}

/**
 * The Rider card: pearl surface, a slow sheen, and a luminous border that travels around the edge.
 * It tilts toward the pointer so it feels like a physical card in your hand.
 */
export function RiderCard({ name, allergy, caption = "Tap to show at the table", href, height = 170, floating }: Props) {
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
    <div ref={ref} className="pearl-card" style={{ height, padding: "18px 20px", transition: "transform .4s var(--ease-out)" }}>
      <span style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <RiderMark size={30} title="Rider" />
        <IconTap />
      </span>
      <span style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
        <span className="display" style={{ fontSize: 32 }}>{name || "Your name"}</span>
        <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
          {allergy ? (
            <span style={{ height: 24, padding: "0 10px", borderRadius: 12, background: "rgba(28,28,58,0.88)", color: "#fff", display: "inline-flex", alignItems: "center", fontWeight: 500 }}>Allergy on file</span>
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
