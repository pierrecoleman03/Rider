import type { Domain } from "./types";

/**
 * Each category has a room: an endless deck you score 1 to 10.
 * A high score adds the thing to Love, a low one to Rather not, so the rider fills itself in as you explore.
 * Food uses the Tasting Room (src/lib/dishes.ts); the other four live here.
 */
export type RoomCard = { id: string; name: string; where: string; desc: string; photo: string; tone: string };
export type Room = { domain: Domain; name: string; tagline: string; href: string; question: string; low: string; high: string; cards: RoomCard[] };

const T = {
  violet: "linear-gradient(140deg,#14122E,#2D2466 55%,#7C67F0)",
  teal: "linear-gradient(140deg,#0F3A4A,#2F7C8E 55%,#A9DDE3)",
  amber: "linear-gradient(140deg,#4A3221,#9A6A44 55%,#E9CFA8)",
  sage: "linear-gradient(140deg,#22301F,#556E4C 55%,#C9D8BC)",
};

export const ROOMS: Room[] = [
  { domain: "food", name: "Tasting Room", tagline: "Dishes from everywhere", href: "/tasting", question: "", low: "Never", high: "Obsessed", cards: [] },
  {
    domain: "exp", name: "After Hours", tagline: "Nights out, scenes and things to do", href: "/room/exp",
    question: "Would you be into it?", low: "Not my night", high: "I'm there", cards: [
      { id: "exp:jazz", name: "Live jazz", where: "Small room, late set", desc: "A trio, low lights, a drink on the table and nowhere to be.", photo: "jazz club live music", tone: T.violet },
      { id: "exp:speakeasy", name: "Speakeasies", where: "Hidden door, no sign", desc: "Find the phone booth, say the word, sit at the bar.", photo: "speakeasy cocktail bar", tone: T.violet },
      { id: "exp:rooftop", name: "Rooftops at golden hour", where: "City views", desc: "Spritz in hand as the skyline turns orange.", photo: "rooftop bar sunset", tone: T.violet },
      { id: "exp:counter", name: "Chef's counters", where: "Eight seats", desc: "Watch every plate come together a few feet away.", photo: "chef counter omakase", tone: T.violet },
      { id: "exp:club", name: "Big night clubs", where: "Until 4am", desc: "Loud, packed, and a DJ you came to see.", photo: "nightclub crowd dj", tone: T.violet },
      { id: "exp:comedy", name: "Stand-up comedy", where: "Basement club", desc: "Two drink minimum, five comics, one headliner.", photo: "comedy club stage microphone", tone: T.violet },
      { id: "exp:supper", name: "Supper clubs", where: "Someone's loft", desc: "Long table, strangers, a menu you don't see in advance.", photo: "supper club long table dinner", tone: T.violet },
      { id: "exp:karaoke", name: "Private karaoke", where: "Your own room", desc: "A booth, a playlist and friends who won't judge.", photo: "karaoke room neon", tone: T.violet },
      { id: "exp:hike", name: "Sunset hikes", where: "Just outside the city", desc: "An hour up, a view at the top, headlamps for the way down.", photo: "sunset hike mountain", tone: T.violet },
      { id: "exp:spa", name: "Spa days", where: "Thermal pools", desc: "Steam, cold plunge, robe, repeat.", photo: "spa thermal pool", tone: T.violet },
      { id: "exp:gallery", name: "Gallery openings", where: "Thursday night", desc: "Free wine, new work, and people watching.", photo: "art gallery opening", tone: T.violet },
      { id: "exp:tasting", name: "Wine tastings", where: "Small producer", desc: "Five pours and someone who loves explaining them.", photo: "wine tasting glasses", tone: T.violet },
    ],
  },
  {
    domain: "travel", name: "Departure Lounge", tagline: "How you like to go and where you like to stay", href: "/room/travel",
    question: "Is this your kind of trip?", low: "Not for me", high: "Book it", cards: [
      { id: "travel:boutique", name: "Boutique hotels", where: "Twenty rooms or fewer", desc: "Someone knows your name by the second morning.", photo: "boutique hotel lobby", tone: T.teal },
      { id: "travel:resort", name: "All-inclusive resorts", where: "Wristband included", desc: "Pools, buffets, and nothing to plan.", photo: "resort pool palm trees", tone: T.teal },
      { id: "travel:window", name: "Window seats", where: "Seat A", desc: "Wake up over the clouds and watch the landing.", photo: "airplane window view clouds", tone: T.teal },
      { id: "travel:redeye", name: "Red-eye flights", where: "Overnight", desc: "Lose the night, gain a full day on arrival.", photo: "night flight airport", tone: T.teal },
      { id: "travel:walkable", name: "Walkable cities", where: "No car needed", desc: "Coffee, a museum and dinner, all on foot.", photo: "walkable european city street", tone: T.teal },
      { id: "travel:beach", name: "Beach towns", where: "Off season", desc: "Long walks, seafood shacks and early nights.", photo: "beach town coast", tone: T.teal },
      { id: "travel:ski", name: "Ski towns", where: "Après included", desc: "First chair, fondue, a fire at the lodge.", photo: "ski town snow lodge", tone: T.teal },
      { id: "travel:roadtrip", name: "Road trips", where: "No fixed plan", desc: "A playlist, a full tank and stops you didn't plan.", photo: "road trip open highway", tone: T.teal },
      { id: "travel:latecheckout", name: "Late checkout", where: "Always ask", desc: "Slow morning, room service, leave at two.", photo: "hotel bed morning light", tone: T.teal },
      { id: "travel:hostel", name: "Social hostels", where: "Shared rooms", desc: "Cheap beds and new friends at the bar downstairs.", photo: "hostel common room", tone: T.teal },
    ],
  },
  {
    domain: "gifts", name: "Gift Shop", tagline: "What you'd love to unwrap", href: "/room/gifts",
    question: "Would you love getting this?", low: "Please no", high: "Yes please", cards: [
      { id: "gifts:ceramics", name: "Handmade ceramics", where: "Small studio", desc: "A mug or bowl nobody else has.", photo: "handmade ceramics mug", tone: T.amber },
      { id: "gifts:vinyl", name: "Vinyl records", where: "Pressed on wax", desc: "An album you love, to play start to finish.", photo: "vinyl record player", tone: T.amber },
      { id: "gifts:candles", name: "Scented candles", where: "Strong throw", desc: "Fig, smoke, or fresh linen for the living room.", photo: "scented candle", tone: T.amber },
      { id: "gifts:coffee", name: "Small-batch coffee", where: "Single origin", desc: "A bag from a roaster you haven't tried.", photo: "coffee beans bag roaster", tone: T.amber },
      { id: "gifts:books", name: "Books", where: "Hardcover", desc: "A novel someone picked because it made them think of you.", photo: "stack of books", tone: T.amber },
      { id: "gifts:plants", name: "Plants", where: "Low maintenance", desc: "Something green that's hard to kill.", photo: "house plant pot", tone: T.amber },
      { id: "gifts:gadgets", name: "Gadgets", where: "Latest thing", desc: "Headphones, a speaker, something with a charger.", photo: "tech gadget headphones", tone: T.amber },
      { id: "gifts:experience", name: "Experiences over things", where: "A night out", desc: "Tickets, a class or a dinner instead of a box.", photo: "concert tickets", tone: T.amber },
      { id: "gifts:novelty", name: "Novelty gifts", where: "Funny once", desc: "Gag mugs, joke socks and talking gadgets.", photo: "novelty gift funny", tone: T.amber },
      { id: "gifts:flowers", name: "Flowers", where: "Seasonal", desc: "A loose bunch from the market, not roses.", photo: "flower bouquet market", tone: T.amber },
    ],
  },
  {
    domain: "style", name: "Fitting Room", tagline: "Fits, fabrics and colors", href: "/room/style",
    question: "Would you wear it?", low: "Never", high: "Every day", cards: [
      { id: "style:linen", name: "Linen", where: "Summer weight", desc: "Wrinkles that look intentional.", photo: "linen shirt", tone: T.sage },
      { id: "style:earth", name: "Earth tones", where: "Olive, rust, sand", desc: "Colors that go with everything you already own.", photo: "earth tone clothing", tone: T.sage },
      { id: "style:denim", name: "Selvedge denim", where: "Raw, unwashed", desc: "Stiff at first, yours after a year.", photo: "selvedge denim jeans", tone: T.sage },
      { id: "style:logos", name: "Big logos", where: "Front and center", desc: "The brand is the point.", photo: "logo sweatshirt streetwear", tone: T.sage },
      { id: "style:black", name: "All black", where: "Head to toe", desc: "Easy, sharp, and always works at night.", photo: "all black outfit", tone: T.sage },
      { id: "style:prints", name: "Loud prints", where: "Florals, stripes", desc: "Shirts people remember.", photo: "printed shirt pattern", tone: T.sage },
      { id: "style:oversized", name: "Oversized fits", where: "Relaxed", desc: "Room to move, drape over cling.", photo: "oversized fit fashion", tone: T.sage },
      { id: "style:tailored", name: "Tailored suits", where: "Made to measure", desc: "Sharp shoulders and a break at the shoe.", photo: "tailored suit", tone: T.sage },
      { id: "style:silver", name: "Silver jewelry", where: "Everyday pieces", desc: "A ring or chain you never take off.", photo: "silver jewelry ring", tone: T.sage },
      { id: "style:vintage", name: "Vintage", where: "Thrifted", desc: "One-of-a-kind pieces with a story.", photo: "vintage clothing store", tone: T.sage },
    ],
  },
];

export const roomFor = (d: Domain) => ROOMS.find((r) => r.domain === d)!;

/** What a score does to the rider: 8 and up is Love, 3 and under is Rather not, the middle changes nothing. */
export function tierForScore(score: number): "love" | "rather" | null {
  if (score >= 8) return "love";
  if (score <= 3) return "rather";
  return null;
}
