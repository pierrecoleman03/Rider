-- The signup trigger should only run from the auth trigger, never from the public API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
