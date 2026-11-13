import type { PartnerApp, Scope } from "./types";

/**
 * Apps that can read a rider. itin is built in; the rest connect through the
 * Connect with Rider flow (/connect). In production this list lives in the partner_apps table.
 */
export const APPS: PartnerApp[] = [
  { id: "itin", name: "itin", category: "Restaurant picks", description: "Built in. Your picks already use your rider.", builtIn: true },
  { id: "delivery", name: "Food delivery", category: "Delivery", description: "Gray out dishes that break your rider" },
  { id: "reservations", name: "Reservations", category: "Reservations", description: "Send your rider with every booking" },
  { id: "hotels", name: "Hotels", category: "Hotels", description: "Room service and the concierge know" },
];

export const DEFAULT_SCOPES: Scope[] = ["never", "rather", "love"];

export const SCOPE_LABEL: Record<Scope, string> = {
  never: "Never list",
  rather: "Rather nots",
  love: "Loves",
  guesses: "Rider's guesses",
};

export function appById(id: string): PartnerApp | undefined {
  return APPS.find((a) => a.id === id);
}
