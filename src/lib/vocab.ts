/**
 * Suggestions for the type-to-add box, plus the hidden ingredients each one covers.
 * Kept local so suggestions appear instantly as the person types.
 */
export const VOCAB: { label: string; covers?: string[]; allergen?: boolean }[] = [
  { label: "Peanuts", covers: ["peanut oil", "satay", "groundnut"], allergen: true },
  { label: "Tree nuts", covers: ["almond", "cashew", "walnut", "pesto"], allergen: true },
  { label: "Shellfish", covers: ["shrimp", "crab", "lobster", "shrimp paste"], allergen: true },
  { label: "Fish", covers: ["fish sauce", "anchovies", "Worcestershire"], allergen: true },
  { label: "Alcohol", covers: ["wine reductions", "beer batter", "liqueurs in desserts"] },
  { label: "Mustard", allergen: true },
  { label: "Sesame", covers: ["tahini", "sesame oil", "furikake"], allergen: true },
  { label: "Gluten", covers: ["wheat", "soy sauce", "breadcrumbs"], allergen: true },
  { label: "Soy", covers: ["soy sauce", "tofu", "edamame", "miso"], allergen: true },
  { label: "Dairy", covers: ["butter", "cream", "cheese", "ghee"] },
  { label: "Heavy dairy", covers: ["cream sauces", "butter-heavy dishes"] },
  { label: "Eggs", covers: ["mayo", "aioli", "custard"] },
  { label: "Mayo", covers: ["spicy mayo", "aioli", "Kewpie", "remoulade", "tartar sauce"] },
  { label: "Red meat", covers: ["beef", "lamb", "pork", "veal"] },
  { label: "Pork", covers: ["bacon", "ham", "chorizo", "lard"] },
  { label: "Lamb" },
  { label: "Shrimp" },
  { label: "Shiitake" },
  { label: "Mushrooms" },
  { label: "Cilantro" },
  { label: "Coconut" },
  { label: "Olives" },
  { label: "Oysters" },
  { label: "Anchovies", covers: ["Caesar dressing", "fish sauce"] },
  { label: "Fish sauce" },
  { label: "Blue cheese" },
  { label: "Goat cheese" },
  { label: "Eggplant" },
  { label: "Truffle" },
  { label: "Spicy food" },
  { label: "Sushi" },
  { label: "Sardines" },
  { label: "Kimchi" },
  { label: "Lobster" },
  { label: "Mango" },
  { label: "Tofu" },
  { label: "Natural wine" },
  { label: "Big Italian reds" },
  { label: "Negroni" },
  { label: "Mezcal" },
  { label: "Greek seafood" },
  { label: "Garlic" },
  { label: "Peppers" },
];

/** The tap-to-pick chips on the first onboarding question: the most common allergies and hard nos. */
export const COMMON_NEVERS = ["Peanuts", "Tree nuts", "Shellfish", "Fish", "Dairy", "Eggs", "Gluten", "Soy", "Sesame", "Pork", "Red meat", "Alcohol"];

export function suggest(query: string, exclude: string[], limit = 4) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const have = new Set(exclude.map((e) => e.toLowerCase()));
  const starts = VOCAB.filter((v) => v.label.toLowerCase().startsWith(q));
  const contains = VOCAB.filter((v) => !v.label.toLowerCase().startsWith(q) && v.label.toLowerCase().includes(q));
  return [...starts, ...contains].filter((v) => !have.has(v.label.toLowerCase())).slice(0, limit);
}

export function lookup(label: string) {
  return VOCAB.find((v) => v.label.toLowerCase() === label.trim().toLowerCase());
}

/**
 * Very small parser for "say it once". It finds known items and sorts them by the words around them.
 * The production version should call a model; this keeps onboarding working offline and in local mode.
 */
export function parseSaid(text: string): { label: string; tier: "never" | "rather" | "love"; allergy?: boolean }[] {
  const out: { label: string; tier: "never" | "rather" | "love"; allergy?: boolean }[] = [];
  const sentences = text.split(/[.!\n;]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
  for (const s of sentences) {
    const tier: "never" | "rather" | "love" =
      /allerg|never|no |don't eat|do not eat|can't|cannot/.test(s) ? "never"
      : /love|adore|always|obsessed|favorite/.test(s) ? "love"
      : /avoid|hate|rather|less|light on|not a fan|try not/.test(s) ? "rather"
      : "rather";
    const allergy = /allerg/.test(s);
    for (const v of VOCAB) {
      const key = v.label.toLowerCase();
      const singular = key.replace(/s$/, "");
      const hit = s.includes(key) || (singular.length > 3 && s.includes(singular));
      if (hit && !out.some((o) => o.label === v.label) && !out.some((o) => o.label.toLowerCase().includes(key))) {
        out.push({ label: v.label, tier, allergy: allergy && v.allergen });
      }
    }
    if (/italian red|barolo/.test(s) && !out.some((o) => o.label === "Big Italian reds")) out.push({ label: "Big Italian reds", tier: "love" });
  }
  // "Dairy" and "Heavy dairy" both match the word dairy; keep the one the person meant.
  if (out.some((o) => o.label === "Dairy") && out.some((o) => o.label === "Heavy dairy")) {
    return out.filter((o) => o.label !== "Heavy dairy");
  }
  return out;
}
