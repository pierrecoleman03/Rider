export type Domain = "food" | "exp" | "travel" | "gifts" | "style";
export type Tier = "never" | "rather" | "love";

/** Where an item came from: the person said it, or Rider inferred it and is waiting for a yes. */
export type Source = "told" | "guess";

export interface RiderItem {
  /** Category; missing means food (older items). */
  domain?: Domain;
  id: string;
  label: string;
  tier: Tier;
  allergy?: boolean;
  source: Source;
  /** 0 to 1, only for guesses */
  confidence?: number;
  /** Why Rider thinks this, shown to the person (supreme transparency). */
  reason?: string;
  /** Hidden ingredients this item also covers, e.g. mayo covers aioli. */
  covers?: string[];
  createdAt: string;
}

export interface Rating {
  dishId: string;
  /** 1 to 10, or null when the person has not tried it */
  score: number | null;
  ratedAt: string;
}

export interface Dish {
  id: string;
  name: string;
  region: string;
  area: "Asia" | "Africa" | "Latin America" | "Europe" | "Middle East" | "North America";
  description: string;
  /** Placeholder art until real photography is wired in */
  tone: string;
  flavors: [string, number][];
  variants: string[];
  /** Ingredients that can clash with a rider */
  contains: string[];
  sometimes?: string[];
}

export type Scope = "never" | "rather" | "love" | "guesses";

export interface PartnerApp {
  id: string;
  name: string;
  category: string;
  description: string;
  builtIn?: boolean;
}

export interface Connection {
  id: string;
  appId: string;
  scopes: Scope[];
  connectedAt: string;
  lastReadAt?: string;
  revokedAt?: string;
}

export interface Profile {
  name: string;
  onboarded: boolean;
}

export interface RiderState {
  profile: Profile;
  items: RiderItem[];
  ratings: Rating[];
  connections: Connection[];
}
