import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twitch";
const CHANNEL_LOGIN = "zgon__24";
const POINTS_PER_TICK = 15;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const TWITCH_API_KEY = Deno.env.get("TWITCH_API_KEY");
  if (!TWITCH_API_KEY) {
    return new Response(JSON.stringify({ error: "TWITCH_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 1. Get broadcaster ID
    const userRes = await fetch(`${GATEWAY_URL}/helix/users?login=${CHANNEL_LOGIN}`, {
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWITCH_API_KEY,
      },
    });
    const userData = await userRes.json();
    const broadcasterId = userData?.data?.[0]?.id;
    if (!broadcasterId) {
      return new Response(JSON.stringify({ error: "Broadcaster not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Check if stream is live
    const streamRes = await fetch(`${GATEWAY_URL}/helix/streams?user_login=${CHANNEL_LOGIN}`, {
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TWITCH_API_KEY,
      },
    });
    const streamData = await streamRes.json();
    if (!streamData?.data?.length) {
      return new Response(JSON.stringify({ message: "Stream offline, no points awarded" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Get chatters (paginated)
    const allChatters: string[] = [];
    let cursor: string | undefined;
    do {
      const url = new URL(`${GATEWAY_URL}/helix/chat/chatters`);
      url.searchParams.set("broadcaster_id", broadcasterId);
      url.searchParams.set("moderator_id", broadcasterId);
      url.searchParams.set("first", "1000");
      if (cursor) url.searchParams.set("after", cursor);

      const chatRes = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": TWITCH_API_KEY,
        },
      });
      const chatData = await chatRes.json();
      if (!chatRes.ok) {
        console.error("Chatters API error:", JSON.stringify(chatData));
        break;
      }
      for (const c of chatData?.data ?? []) {
        allChatters.push(c.user_login.toLowerCase());
      }
      cursor = chatData?.pagination?.cursor;
    } while (cursor);

    if (allChatters.length === 0) {
      return new Response(JSON.stringify({ message: "No chatters found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Match chatters to registered users by twitch_username
    const { data: matchedProfiles, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, twitch_username")
      .not("twitch_username", "is", null)
      .in("twitch_username", allChatters);

    if (profileError) {
      console.error("Profile query error:", profileError);
      throw new Error("Failed to query profiles");
    }

    if (!matchedProfiles?.length) {
      return new Response(JSON.stringify({ message: "No matched users found", chatters: allChatters.length }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Award points to each matched user
    let awarded = 0;
    for (const profile of matchedProfiles) {
      // Upsert user_points
      const { error: upsertError } = await supabase
        .from("user_points")
        .upsert(
          { user_id: profile.user_id, balance: POINTS_PER_TICK },
          { onConflict: "user_id" }
        );

      if (upsertError) {
        // If exists, increment balance
        await supabase.rpc("increment_points", {
          p_user_id: profile.user_id,
          p_amount: POINTS_PER_TICK,
        });
      }

      // Log transaction
      await supabase.from("point_transactions").insert({
        user_id: profile.user_id,
        amount: POINTS_PER_TICK,
        reason: "Assistir à live",
        source: "stream_watch",
      });

      awarded++;
    }

    return new Response(
      JSON.stringify({
        message: `Awarded ${POINTS_PER_TICK} points to ${awarded} users`,
        chatters: allChatters.length,
        matched: matchedProfiles.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
