// Supabase Edge Function: french-pronunciation
// Required secrets:
//   GOOGLE_TTS_API_KEY
// Supabase supplies SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY automatically.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function audioObjectName(word: string) {
  const safe = word.normalize("NFC").toLocaleLowerCase("fr-FR")
    .trim().replace(/[’']/g, "-").replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "").replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!safe || safe.length > 80) throw new Error("Invalid French word");
  return `fr/${encodeURIComponent(safe)}.mp3`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const googleKey = Deno.env.get("GOOGLE_TTS_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!googleKey || !supabaseUrl || !serviceRoleKey) {
      return json({ error: "Pronunciation service is not configured." }, 503);
    }

    const payload = await req.json();
    const word = typeof payload?.word === "string" ? payload.word.trim() : "";
    if (!word || word.length > 80 || /[\r\n]/.test(word)) {
      return json({ error: "Please provide one valid French word." }, 400);
    }

    const objectName = audioObjectName(word);
    const storagePath = objectName.split("/").map(encodeURIComponent).join("/");
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/french-audio/${storagePath}`;

    // Reuse previously generated MP3 files to avoid repeated TTS charges.
    const cached = await fetch(publicUrl, { method: "HEAD" });
    if (cached.ok) return json({ audioUrl: publicUrl, cached: true });

    const ttsResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(googleKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text: word },
          voice: { languageCode: "fr-FR", name: "fr-FR-Neural2-A" },
          audioConfig: { audioEncoding: "MP3", speakingRate: 0.92 },
        }),
      },
    );

    if (!ttsResponse.ok) {
      const detail = await ttsResponse.text();
      console.error("Google Cloud TTS error:", ttsResponse.status, detail);
      return json({ error: "French speech generation failed. Check the TTS API key and billing configuration." }, 502);
    }

    const ttsData = await ttsResponse.json();
    if (typeof ttsData.audioContent !== "string" || !ttsData.audioContent) {
      return json({ error: "The speech provider returned an empty audio file." }, 502);
    }

    const binary = Uint8Array.from(atob(ttsData.audioContent), (char) => char.charCodeAt(0));
    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/french-audio/${storagePath}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${serviceRoleKey}`,
          "apikey": serviceRoleKey,
          "Content-Type": "audio/mpeg",
          "x-upsert": "true",
        },
        body: binary,
      },
    );

    if (!uploadResponse.ok) {
      const detail = await uploadResponse.text();
      console.error("Supabase Storage upload error:", uploadResponse.status, detail);
      return json({ error: "The generated audio could not be saved to Supabase Storage." }, 502);
    }

    return json({ audioUrl: publicUrl, cached: false });
  } catch (error) {
    console.error("Pronunciation function error:", error);
    return json({ error: error instanceof Error ? error.message : "Unexpected pronunciation service error." }, 500);
  }
});
