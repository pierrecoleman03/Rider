import type { Domain, RiderItem, RiderState } from "./types";
import { joinList, riderSentence } from "./sentence";
import { DOMAINS } from "./domains";

const lower = (s: string) => (/^[A-Z][a-z]/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const told = (items: RiderItem[]) => items.filter((i) => i.source === "told");
const inDomain = (items: RiderItem[], d: Domain) => items.filter((i) => (i.domain ?? "food") === d);

/**
 * Rider's read on a person, rebuilt live from what they told it and how they scored things in the rooms.
 * Written as plain sentences so it can be read at a glance or sent to someone.
 */
export function synopsisHeadline(state: RiderState): string {
  const name = state.profile.name || "You";
  const t = told(state.items);
  const allergies = t.filter((i) => i.allergy).map((i) => lower(i.label));
  const nevers = t.filter((i) => i.tier === "never" && !i.allergy).map((i) => lower(i.label));
  // One or two loves from each category, so the headline shows range instead of only food.
  const loves = DOMAINS.flatMap((d) => inDomain(t, d.id).filter((i) => i.tier === "love").slice(-2)).map((i) => lower(i.label));
  const skips = DOMAINS.flatMap((d) => inDomain(t, d.id).filter((i) => i.tier === "rather").slice(-1)).map((i) => lower(i.label));
  const parts: string[] = [];
  if (allergies.length) parts.push(`${name} can't have ${joinList(allergies)}${nevers.length ? ` and never eats ${joinList(nevers.slice(0, 2))}` : ""}.`);
  else if (nevers.length) parts.push(`${name} never eats ${joinList(nevers.slice(0, 3))}.`);
  if (loves.length) parts.push(`${parts.length ? "Lives" : `${name} lives`} for ${joinList(loves.slice(0, 5))}.`);
  if (skips.length) parts.push(`Would rather skip ${joinList(skips.slice(0, 3))}.`);
  return parts.join(" ") || `${name} hasn't told Rider much yet. Add a few things or wander through the rooms.`;
}

export function synopsisByDomain(state: RiderState) {
  const hidden = new Set(state.profile.hiddenDomains ?? []);
  return DOMAINS.map((d) => {
    const items = told(inDomain(state.items, d.id));
    return { domain: d.id, label: d.label, count: items.length, sentence: items.length ? riderSentence(items) : "", shared: !hidden.has(d.id) };
  });
}

/** The text that goes out when someone taps Send. Only shared categories are included. */
export function synopsisText(state: RiderState): string {
  const lines = [synopsisHeadline(state), ""];
  for (const d of synopsisByDomain(state)) if (d.shared && d.sentence) lines.push(`${d.label}: ${d.sentence}`);
  lines.push("", "From my Rider.");
  return lines.join("\n");
}
