import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when Supabase is configured. Without it Rider runs in local mode. */
export const hasSupabase = Boolean(url && anon);

let browserClient: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient | null {
  if (!hasSupabase) return null;
  if (!browserClient) browserClient = createBrowserClient(url!, anon!);
  return browserClient;
}

/** Server-only client with the service role. Used by the partner API, never sent to the browser. */
export function supabaseAdmin(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
