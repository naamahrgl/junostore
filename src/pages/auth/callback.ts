import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get("code");

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { access_token, refresh_token } = data.session;
      // Store tokens in cookies so the server can see them
      cookies.set("sb-access-token", access_token, { path: "/", secure: true });
      cookies.set("sb-refresh-token", refresh_token, { path: "/", secure: true });
    }
  }

  return redirect("/account"); // Where to go after login
};
