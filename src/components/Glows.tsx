/** The aura: three soft color fields behind every screen. `lift` moves them for moments like the card reveal. */
export function Glows({ lift = 0, intensity = 0.9 }: { lift?: number; intensity?: number }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <span className="glow" style={{ left: -70, top: 60 + lift, width: 320, height: 320, background: "var(--glow-1)", opacity: intensity, transition: "top .8s var(--ease-out)" }} />
      <span className="glow" style={{ right: -80, top: 130 + lift, width: 300, height: 300, background: "var(--glow-2)", opacity: intensity, animationDelay: "-3s", transition: "top .8s var(--ease-out)" }} />
      <span className="glow" style={{ left: 60, top: 480, width: 280, height: 240, background: "var(--glow-3)", opacity: intensity * 0.8, animationDelay: "-6s" }} />
    </div>
  );
}
