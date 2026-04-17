import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TWITCH_CLIENT_ID = Deno.env.get("TWITCH_CLIENT_ID")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const origin = url.searchParams.get("origin") ?? "";
    if (!origin) {
      return new Response(JSON.stringify({ error: "Missing origin" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate random state (CSRF protection). Encode site origin inside so callback knows where to return the user.
    const nonce = crypto.randomUUID();
    const state = `${nonce}.${btoa(origin)}`;

    const { error } = await supabase.from("twitch_auth_state").insert({ state });
    if (error) throw error;

    const redirectUri = `${SUPABASE_URL}/functions/v1/twitch-auth-callback`;
    const scopes = ["user:read:email"].join(" ");

    const twitchUrl = new URL("https://id.twitch.tv/oauth2/authorize");
    twitchUrl.searchParams.set("client_id", TWITCH_CLIENT_ID);
    twitchUrl.searchParams.set("redirect_uri", redirectUri);
    twitchUrl.searchParams.set("response_type", "code");
    twitchUrl.searchParams.set("scope", scopes);
    twitchUrl.searchParams.set("state", state);
    twitchUrl.searchParams.set("force_verify", "false");

    return Response.redirect(twitchUrl.toString(), 302);
  } catch (err) {
    console.error("twitch-auth error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
