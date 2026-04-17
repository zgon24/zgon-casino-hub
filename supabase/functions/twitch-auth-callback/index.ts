import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TWITCH_CLIENT_ID = Deno.env.get("TWITCH_CLIENT_ID")!;
const TWITCH_CLIENT_SECRET = Deno.env.get("TWITCH_CLIENT_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function errorRedirect(origin: string, message: string) {
  const target = new URL(`${origin}/auth`);
  target.searchParams.set("twitch_error", message);
  return Response.redirect(target.toString(), 302);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const twitchError = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  // Decode origin from state so we can redirect back to the right site
  let origin = "";
  try {
    if (state) origin = atob(state.split(".")[1] ?? "");
  } catch (_) {
    origin = "";
  }

  if (!origin) {
    return new Response("Invalid state", { status: 400 });
  }

  if (twitchError) return errorRedirect(origin, twitchError);
  if (!code || !state) return errorRedirect(origin, "Missing code or state");

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Validate + consume state
    const { data: stateRow, error: stateErr } = await supabase
      .from("twitch_auth_state")
      .select("state, used, created_at")
      .eq("state", state)
      .maybeSingle();

    if (stateErr || !stateRow) return errorRedirect(origin, "Estado inválido ou expirado");
    if (stateRow.used) return errorRedirect(origin, "Estado já utilizado");

    await supabase.from("twitch_auth_state").update({ used: true }).eq("state", state);

    // Exchange code for token
    const redirectUri = `${SUPABASE_URL}/functions/v1/twitch-auth-callback`;
    const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const t = await tokenRes.text();
      console.error("token exchange failed:", t);
      return errorRedirect(origin, "Falha ao obter token da Twitch");
    }
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token as string;

    // Fetch Twitch user info
    const userRes = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": TWITCH_CLIENT_ID,
      },
    });
    if (!userRes.ok) {
      console.error("users fetch failed:", await userRes.text());
      return errorRedirect(origin, "Falha a obter perfil da Twitch");
    }
    const userJson = await userRes.json();
    const twitchUser = userJson.data?.[0];
    if (!twitchUser) return errorRedirect(origin, "Perfil Twitch vazio");

    const twitchId: string = twitchUser.id;
    const twitchLogin: string = (twitchUser.login as string).toLowerCase();
    const twitchDisplayName: string = twitchUser.display_name ?? twitchLogin;
    const twitchEmail: string | null = twitchUser.email ?? null;
    const twitchAvatar: string | null = twitchUser.profile_image_url ?? null;

    // Check if a profile already exists with this twitch_id
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("twitch_id", twitchId)
      .maybeSingle();

    let userId: string;

    if (existingProfile) {
      userId = existingProfile.user_id;
      // keep profile fresh
      await supabase
        .from("profiles")
        .update({
          twitch_username: twitchLogin,
          twitch_avatar_url: twitchAvatar,
          display_name: twitchDisplayName,
        })
        .eq("user_id", userId);
    } else {
      // Create user via Admin API
      // Use email from Twitch if present; otherwise synthesize a unique internal one.
      const email = twitchEmail ?? `twitch_${twitchId}@users.zgon.local`;

      const { data: createdUser, error: createErr } =
        await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            provider: "twitch",
            twitch_id: twitchId,
            twitch_login: twitchLogin,
            display_name: twitchDisplayName,
            avatar_url: twitchAvatar,
          },
        });

      if (createErr || !createdUser?.user) {
        console.error("createUser error:", createErr);
        return errorRedirect(origin, "Falha a criar conta");
      }

      userId = createdUser.user.id;

      // Upsert profile
      await supabase.from("profiles").upsert(
        {
          user_id: userId,
          twitch_id: twitchId,
          twitch_username: twitchLogin,
          twitch_avatar_url: twitchAvatar,
          display_name: twitchDisplayName,
        },
        { onConflict: "user_id" },
      );
    }

    // Generate a magic-link-style session by creating an action link
    const { data: linkData, error: linkErr } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: twitchEmail ?? `twitch_${twitchId}@users.zgon.local`,
      });

    if (linkErr || !linkData?.properties?.hashed_token) {
      console.error("generateLink error:", linkErr);
      return errorRedirect(origin, "Falha a gerar sessão");
    }

    // Redirect user to frontend completion page with the token to verify on client
    const completeUrl = new URL(`${origin}/auth/twitch-complete`);
    completeUrl.searchParams.set("token_hash", linkData.properties.hashed_token);
    completeUrl.searchParams.set("type", "magiclink");

    return Response.redirect(completeUrl.toString(), 302);
  } catch (err) {
    console.error("callback error:", err);
    return errorRedirect(origin, "Erro inesperado");
  }
});
