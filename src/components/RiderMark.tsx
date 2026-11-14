"use client";

import { useId } from "react";

/**
 * The Rider R: a bold R sliced on the diagonal, halves slid apart, leaning slightly forward (option 4b).
 * Drawn in a 100x100 box; color follows `currentColor`.
 */
export function RiderMark({ size = 24, color = "currentColor", title }: { size?: number; color?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="-12 0 116 100" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={{ overflow: "visible", flex: "none" }}>
      <defs>
        <clipPath id={`${id}a`}><polygon points="-20,-20 120,-20 120,24 -20,78" /></clipPath>
        <clipPath id={`${id}b`}><polygon points="-20,86 120,32 120,120 -20,120" /></clipPath>
        <g id={`${id}r`}>
          <path d="M30 94 V12 H56 a20 20 0 0 1 0 40 H30" fill="none" stroke={color} strokeWidth="18" />
          <path d="M50 50 L76 94" fill="none" stroke={color} strokeWidth="18" />
        </g>
      </defs>
      <g transform="translate(9 0) skewX(-8)">
        <g clipPath={`url(#${id}a)`} transform="translate(-6 -3)"><use href={`#${id}r`} /></g>
        <g clipPath={`url(#${id}b)`} transform="translate(6 3)"><use href={`#${id}r`} /></g>
      </g>
    </svg>
  );
}

/** Mark plus the RIDER wordmark in wide Archivo. */
export function RiderWordmark({ size = 22 }: { size?: number }) {
  return (
    <span className="wordmark" style={{ display: "inline-flex", alignItems: "center", gap: Math.round(size * 0.4), fontSize: size }} aria-label="Rider">
      <RiderMark size={Math.round(size * 1.15)} />
      <span aria-hidden="true">RIDER</span>
    </span>
  );
}
