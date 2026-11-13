import type { RiderItem } from "./types";

const PROPER = ["Greek", "Italian", "Korean", "Japanese", "Thai", "Mexican", "Indian", "French", "Chinese", "Ethiopian", "Peruvian"];

function say(label: string): string {
  const first = label.split(" ")[0];
  return PROPER.includes(first) ? label : label.charAt(0).toLowerCase() + label.slice(1);
}

export function joinList(words: string[]): string {
  if (words.length <= 1) return words[0] ?? "";
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

/**
 * The rider read back as one sentence, the way a good maitre d' would remember it.
 * This is exactly what connected apps receive, so it only uses confirmed items.
 */
export function riderSentence(items: RiderItem[]): string {
  const told = items.filter((i) => i.source === "told");
  const never = told.filter((i) => i.tier === "never").map((i) => say(i.label) + (i.allergy ? " (allergy)" : ""));
  const rather = told.filter((i) => i.tier === "rather").map((i) => say(i.label));
  const love = told.filter((i) => i.tier === "love").map((i) => say(i.label));
  const parts: string[] = [];
  if (never.length) parts.push(`Never ${joinList(never)}.`);
  if (rather.length) parts.push(`Go easy on ${joinList(rather)}.`);
  if (love.length) parts.push(`Always happy with ${joinList(love)}.`);
  return parts.join(" ") || "Your rider is empty. Add the first thing below.";
}
