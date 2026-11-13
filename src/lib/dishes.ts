import type { Dish, RiderItem } from "./types";

/**
 * Starter catalog for the Tasting Room. The production catalog lives in the dishes table
 * (see supabase/migrations) so it can grow without a deploy.
 */
export const DISHES: Dish[] = [
  { id: "kimchi", name: "Kimchi", region: "Korea", area: "Asia", description: "Fermented napa cabbage with chili, garlic and ginger. Sour, spicy and funky.", tone: "linear-gradient(150deg, #B8372A 0%, #E2793C 50%, #F4C48A 100%)", flavors: [["Sour", 8], ["Spicy", 7], ["Umami", 6], ["Funky", 8], ["Sweet", 2]], variants: ["Napa cabbage kimchi", "Kimchi stew", "Radish kimchi"], contains: ["fish sauce"], sometimes: ["shrimp"] },
  { id: "ceviche", name: "Ceviche", region: "Peru", area: "Latin America", description: "Raw fish cured in lime with chili, red onion and cilantro.", tone: "linear-gradient(150deg, #22707A 0%, #6FB8AE 50%, #E4F0D2 100%)", flavors: [["Sour", 9], ["Fresh", 9], ["Spicy", 5], ["Umami", 5], ["Sweet", 2]], variants: ["Classic ceviche", "Tiradito", "Leche de tigre"], contains: ["fish", "cilantro"] },
  { id: "injera", name: "Injera", region: "Ethiopia", area: "Africa", description: "Spongy, slightly sour teff flatbread, torn by hand to scoop stews.", tone: "linear-gradient(150deg, #5E4029 0%, #A97A50 50%, #E2C79F 100%)", flavors: [["Sour", 6], ["Earthy", 7], ["Spicy", 3], ["Umami", 4], ["Sweet", 1]], variants: ["Injera platter", "Misir wot", "Shiro"], contains: [], sometimes: ["butter", "beef"] },
  { id: "shakshuka", name: "Shakshuka", region: "North Africa", area: "Africa", description: "Eggs poached in a spiced tomato and pepper sauce, eaten with bread.", tone: "linear-gradient(150deg, #A33622 0%, #DB6A3A 50%, #F2B56E 100%)", flavors: [["Spicy", 5], ["Smoky", 5], ["Umami", 6], ["Sour", 3], ["Sweet", 3]], variants: ["Classic shakshuka", "Green shakshuka", "With feta"], contains: ["eggs"], sometimes: ["cheese"] },
  { id: "mole", name: "Mole negro", region: "Mexico", area: "Latin America", description: "A dark, glossy sauce of dried chilies, chocolate and toasted spices.", tone: "linear-gradient(150deg, #321D15 0%, #6A3824 50%, #A86A44 100%)", flavors: [["Smoky", 8], ["Earthy", 8], ["Sweet", 5], ["Spicy", 5], ["Bitter", 4]], variants: ["Mole over chicken", "Mole enchiladas", "Mole paste"], contains: [], sometimes: ["peanuts", "sesame"] },
  { id: "pho", name: "Pho", region: "Vietnam", area: "Asia", description: "Clear, spiced broth with rice noodles, herbs and lime.", tone: "linear-gradient(150deg, #7A5A2E 0%, #C9A066 50%, #F1E2BE 100%)", flavors: [["Umami", 8], ["Fresh", 7], ["Spicy", 3], ["Sweet", 3], ["Sour", 3]], variants: ["Pho bo", "Pho ga", "Vegetable pho"], contains: ["fish sauce"], sometimes: ["beef"] },
  { id: "khachapuri", name: "Khachapuri", region: "Georgia", area: "Europe", description: "Boat-shaped bread filled with molten cheese, butter and a raw egg.", tone: "linear-gradient(150deg, #9C6A2A 0%, #E0B062 50%, #F8E6B8 100%)", flavors: [["Rich", 9], ["Salty", 6], ["Tangy", 4], ["Sweet", 1], ["Umami", 5]], variants: ["Adjaruli", "Imeruli", "Megruli"], contains: ["cheese", "butter", "eggs"] },
  { id: "laksa", name: "Laksa", region: "Malaysia", area: "Asia", description: "Coconut curry noodle soup with shrimp, tofu and chili sambal.", tone: "linear-gradient(150deg, #B1521F 0%, #E89A4A 50%, #F8D9A0 100%)", flavors: [["Spicy", 8], ["Creamy", 7], ["Umami", 7], ["Sour", 3], ["Sweet", 3]], variants: ["Curry laksa", "Assam laksa", "Sarawak laksa"], contains: ["shrimp", "coconut"], sometimes: ["peanuts"] },
  { id: "muhammara", name: "Muhammara", region: "Syria", area: "Middle East", description: "Roasted red pepper and walnut dip with pomegranate molasses.", tone: "linear-gradient(150deg, #8E2F1E 0%, #CF6A43 50%, #F0B88C 100%)", flavors: [["Smoky", 6], ["Sweet", 5], ["Tangy", 6], ["Nutty", 8], ["Spicy", 4]], variants: ["Classic muhammara", "With flatbread", "As a spread"], contains: ["walnut"] },
  { id: "pozole", name: "Pozole verde", region: "Mexico", area: "Latin America", description: "Hominy stew in a tomatillo and pumpkin seed broth.", tone: "linear-gradient(150deg, #3D5E2A 0%, #84A65A 50%, #DCE8B4 100%)", flavors: [["Herbal", 8], ["Sour", 5], ["Spicy", 5], ["Earthy", 6], ["Umami", 5]], variants: ["Pozole verde", "Pozole rojo", "Pozole blanco"], contains: [], sometimes: ["pork"] },
];

/** Dishes used during onboarding to calibrate how strongly someone feels. */
export const CALIBRATION = [
  { id: "oysters", name: "Oysters", note: "Briny, cold, eaten raw", tone: "linear-gradient(150deg, #5D7480 0%, #A9BDC4 50%, #E6EEF0 100%)" },
  { id: "natural-wine", name: "Natural wine", note: "Funky, low-intervention, often cloudy", tone: "linear-gradient(150deg, #6E2B3A 0%, #B7646B 50%, #EDC3B8 100%)" },
  { id: "thai-hot", name: "Thai curry, Thai hot", note: "Coconut, lemongrass, real heat", tone: "linear-gradient(150deg, #9A6A12 0%, #DDA83A 50%, #F6E1A2 100%)" },
  { id: "tasting-menu", name: "Tasting menus", note: "Ten courses, three hours", tone: "linear-gradient(150deg, #2E3440 0%, #6B7383 50%, #C9CED6 100%)" },
  { id: "truffle", name: "Truffle", note: "Earthy, heady, shaved on top", tone: "linear-gradient(150deg, #3B2E22 0%, #7D6650 50%, #CDBBA3 100%)" },
];

const SYNONYMS: Record<string, string[]> = {
  eggs: ["eggs", "egg"],
  peanuts: ["peanuts", "peanut"],
  "red meat": ["beef", "lamb", "pork", "veal"],
  pork: ["pork"],
  "heavy dairy": ["cheese", "butter", "cream"],
  dairy: ["cheese", "butter", "cream"],
  shellfish: ["shrimp", "crab", "lobster"],
  "tree nuts": ["walnut", "almond", "cashew"],
  cilantro: ["cilantro"],
  coconut: ["coconut"],
  sesame: ["sesame"],
};

/** Finds where a dish runs into the person's rider, so the card can say so plainly. */
export function clashFor(dish: Dish, items: RiderItem[]): string | null {
  const active = items.filter((i) => i.source === "told" && i.tier !== "love");
  for (const item of active) {
    const keys = SYNONYMS[item.label.toLowerCase()] ?? [item.label.toLowerCase()];
    const always = dish.contains.find((c) => keys.includes(c));
    if (always) {
      return item.tier === "never"
        ? `Contains ${always}, which is on your never list${item.allergy ? " (allergy)" : ""}.`
        : `Usually made with ${always}, which you'd rather skip.`;
    }
    const maybe = dish.sometimes?.find((c) => keys.includes(c));
    if (maybe) {
      return item.tier === "never"
        ? `Some versions use ${maybe}. Rider checks with the kitchen first.`
        : `Some versions use ${maybe}, which you'd rather skip.`;
    }
  }
  return null;
}

export function scoreWord(v: number | null): string {
  if (!v) return "";
  return v <= 2 ? "Never" : v <= 4 ? "Rather not" : v <= 6 ? "Fine" : v <= 8 ? "Love it" : "Obsessed";
}
