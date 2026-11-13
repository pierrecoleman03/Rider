# Rider

One taste profile for every app you eat with. Rider holds what you never eat, what you'd rather skip and what you love. itin has Rider built in, and any other app can plug in with **Connect with Rider**, the way apps connect to a bank through Plaid. Apps read your rider live, see only what you allow, and lose access the moment you disconnect.

## What's in v1

| Screen | Route | What it does |
| --- | --- | --- |
| Onboarding | `/onboarding` | Sign in with Apple or Google, say your rider once, see what Rider heard (plus the hidden ingredients it will catch), score five dishes, get your card, choose where Rider works |
| Home | `/` | Rider card with a luminous moving border, the rider read back as one live sentence, type-to-add with suggestions, chips you can tap to edit or remove, Rider's guesses with "That's me / Not me" |
| Tasting Room | `/tasting` | Endless global dish feed, 1 to 10 scores, clashes with your rider called out, "Haven't tried it" sheet with photos, flavor profile and where to try it |
| Places | `/places` | Every connected app, what it can see, when it last read your rider, disconnect |
| Pass | `/pass` | What a server or hotel sees at the table |
| Friends | `/friends` | Invite friends to link riders for group dinners |
| Connect | `/connect` | The consent screen partner apps open |

## Run it

```bash
npm install
npm run dev
```

With no environment variables, Rider runs in **local mode**: sign-in is simulated and data is saved in the browser. That's enough to click through every screen.

## Go live with Supabase

1. Create a Supabase project.
2. Run the migrations in `supabase/migrations` (SQL editor, or `supabase db push`).
3. In Authentication, turn on the **Apple** and **Google** providers and add `https://YOUR_DOMAIN/onboarding` as a redirect URL.
4. Copy `.env.example` to `.env.local` and fill in the URL, anon key, service role key and site URL.
5. Deploy to Vercel with the same variables.

## Partner API (Connect with Rider)

1. **Register the partner** in `partner_apps` with its `redirect_uris` and the sha256 of a client secret.
2. **Send the person to consent:**
   `https://YOUR_DOMAIN/connect?client_id=APP_ID&scope=never+rather+love&redirect_uri=https://partner.example/callback&state=RANDOM`
3. **Exchange the code** (server to server):
   ```http
   POST /api/oauth/token
   { "client_id": "APP_ID", "client_secret": "...", "code": "rc_...", "redirect_uri": "https://partner.example/callback" }
   → { "access_token": "rt_...", "token_type": "bearer", "scope": "never rather love" }
   ```
4. **Read the rider live, every time you need it.** Don't cache it, or "disconnect anytime" stops being true.
   ```http
   GET /api/v1/rider
   Authorization: Bearer rt_...
   → { "rider": { "sentence": "Never peanuts (allergy) and red meat. ...", "never": [{ "label": "Peanuts", "allergy": true, "covers": ["peanut oil", "satay"] }], "rather": [...], "love": [...] } }
   ```
   A revoked connection returns `401 revoked_or_unknown`.

**itin** is built in. It gets a token for an existing connection with `POST /api/connections/:id/token` (signed-in user only, built-in apps only).

Every read is written to `access_log` and stamps `last_read_at`, so people can see who read their rider and when.

## Still to do

- Swap the placeholder dish art for real photography (`dishes.image_url`)
- Replace the "say it once" keyword parser (`src/lib/vocab.ts → parseSaid`) with a model call
- Apple Wallet pass generation and voice input
- Friends: linked riders and table matching with itin
- A partner dashboard for registering apps and rotating secrets
