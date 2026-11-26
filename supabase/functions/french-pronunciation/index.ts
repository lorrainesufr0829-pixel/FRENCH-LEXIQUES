// Supabase Edge Function: french-pronunciation
// Prefer human-recorded French audio from fr.wiktionary.org / Wikimedia Commons.
// Optional fallback secret: GOOGLE_TTS_API_KEY
// Supabase supplies SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY automatically.
const corsHeaders = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
const WIKTIONARY_API = "https://fr.wiktionary.org/w/api.php";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const USER_AGENT = "LEXIQUE-French-Learning/1.0 (pronunciation lookup)";
function json(body: unknown, status=200) { return new Response(JSON.stringify(body), {status,headers:{...corsHeaders,"Content-Type":"application/json"}}); }
function cleanHtml(value: unknown): string { return String(value||"").replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g," ").trim(); }
function safeWord(word:string) { const safe=word.normalize("NFC").toLocaleLowerCase("fr-FR").trim().replace(/[’']/g,"-").replace(/\s+/g,"-").replace(/[^\p{L}\p{N}-]/gu,"").replace(/-+/g,"-").replace(/^-|-$/g,""); if(!safe||safe.length>80) throw new Error("Invalid French word"); return safe; }
function extractFrenchAudioFile(wikitext:string,word:string):string|null {
  const templates=wikitext.matchAll(/\{\{\s*(écouter|audio)\s*\|([^{}]*?)\}\}/giu);
  for(const match of templates) {
    const template=match[1].toLocaleLowerCase("fr-FR"), params=match[2].split("|").map((part:string)=>part.trim());
    const named:Record<string,string>={}, positional:string[]=[];
    for(const param of params){const equal=param.indexOf("=");if(equal>=0)named[param.slice(0,equal).trim().toLowerCase()]=param.slice(equal+1).trim();else positional.push(param);}
    let language="",filename="";
    if(template==="écouter"){language=named.lang||positional[2]||"";filename=named.audio||"";const spoken=named.titre;if(spoken&&spoken.normalize("NFC").toLocaleLowerCase("fr-FR")!==word.normalize("NFC").toLocaleLowerCase("fr-FR"))continue;}
    else {language=positional[0]||named.lang||"";filename=positional[1]||named.audio||"";}
    if(language.toLowerCase()!=="fr"||!filename)continue;
    filename=filename.replace(/^File:/i,"").replace(/^Fichier:/i,"").trim();
    if(filename&&!/[\[\]{}|<>]/.test(filename))return filename;
  }
  return null;
}
async function wiktionaryAudio(word:string) {
  const url=new URL(WIKTIONARY_API);
  url.search=new URLSearchParams({action:"query",prop:"revisions",rvprop:"content",rvslots:"main",format:"json",formatversion:"2",titles:word}).toString();
  const response=await fetch(url,{headers:{"User-Agent":USER_AGENT}});
  if(!response.ok)throw new Error("Wiktionnaire lookup failed.");
  const data=await response.json(), page=data?.query?.pages?.[0], wikitext=page?.revisions?.[0]?.slots?.main?.content||"";
  if(!wikitext)return null;
  const filename=extractFrenchAudioFile(wikitext,word);if(!filename)return null;
  const commons=new URL(COMMONS_API);
  commons.search=new URLSearchParams({action:"query",prop:"imageinfo",iiprop:"url|mime|extmetadata",format:"json",formatversion:"2",titles:"File:"+filename}).toString();
  const fileResponse=await fetch(commons,{headers:{"User-Agent":USER_AGENT}});
  if(!fileResponse.ok)throw new Error("Wikimedia Commons file lookup failed.");
  const fileData=await fileResponse.json(), info=fileData?.query?.pages?.[0]?.imageinfo?.[0];
  if(!info?.url)return null;
  const meta=info.extmetadata||{}, license=cleanHtml(meta.LicenseShortName?.value||meta.UsageTerms?.value);
  if(!license)return null;
  return {url:info.url,mime:info.mime||"audio/ogg",descriptionUrl:info.descriptionurl||("https://commons.wikimedia.org/wiki/File:"+encodeURIComponent(filename.replace(/ /g,"_"))),license,licenseUrl:cleanHtml(meta.LicenseUrl?.value),artist:cleanHtml(meta.Artist?.value||meta.Credit?.value)};
}
async function uploadObject(url:string,key:string,body:Uint8Array,mime:string) {
  const response=await fetch(url,{method:"POST",headers:{"Authorization":`Bearer ${key}`,"apikey":key,"Content-Type":mime,"x-upsert":"true"},body});
  if(!response.ok)throw new Error("Audio could not be saved to Supabase Storage.");
}
async function googleAudio(word:string,key:string) {
  const response=await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({input:{text:word},voice:{languageCode:"fr-FR",name:"fr-FR-Neural2-A"},audioConfig:{audioEncoding:"MP3",speakingRate:0.92}})});
  if(!response.ok){console.error("Google TTS error:",response.status,await response.text());throw new Error("French speech generation failed. Check TTS API key and billing.");}
  const data=await response.json();if(!data.audioContent)throw new Error("Speech provider returned empty audio.");
  return Uint8Array.from(atob(data.audioContent),(char)=>char.charCodeAt(0));
}
Deno.serve(async(req)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
  if(req.method!=="POST")return json({error:"Method not allowed"},405);
  try{
    const supabaseUrl=Deno.env.get("SUPABASE_URL"), serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if(!supabaseUrl||!serviceKey)return json({error:"Supabase storage is not configured."},503);
    const payload=await req.json(), word=typeof payload?.word==="string"?payload.word.trim():"";
    if(!word||word.length>80||/[\r\n]/.test(word))return json({error:"Please provide one valid French word."},400);
    const safe=safeWord(word), base=`fr/${encodeURIComponent(safe)}`, audioPath=base+".audio", metaPath=base+".json";
    const publicBase=`${supabaseUrl}/storage/v1/object/public/french-audio/`;
    const cached=await fetch(publicBase+audioPath,{method:"HEAD"});
    if(cached.ok){let meta:Record<string,unknown>={};try{const mr=await fetch(publicBase+metaPath);if(mr.ok)meta=await mr.json();}catch(_){}return json({audioUrl:publicBase+audioPath,cached:true,...meta});}
    const recording=await wiktionaryAudio(word);
    if(recording){
      const media=await fetch(recording.url,{headers:{"User-Agent":USER_AGENT}});
      if(!media.ok)throw new Error("Wiktionary recording could not be downloaded.");
      const bytes=new Uint8Array(await media.arrayBuffer()), mime=(media.headers.get("content-type")||recording.mime||"audio/ogg").split(";")[0];
      if(!mime.startsWith("audio/"))throw new Error("Wikimedia returned a file that is not recognized as audio.");
      await uploadObject(`${supabaseUrl}/storage/v1/object/french-audio/${audioPath}`,serviceKey,bytes,mime);
      const metadata={source:"Wiktionnaire / Wikimedia Commons",sourceUrl:recording.descriptionUrl,attribution:recording.artist,license:recording.license,licenseUrl:recording.licenseUrl,audioMime:mime};
      await uploadObject(`${supabaseUrl}/storage/v1/object/french-audio/${metaPath}`,serviceKey,new TextEncoder().encode(JSON.stringify(metadata)),"application/json");
      return json({audioUrl:publicBase+audioPath,cached:false,...metadata});
    }
    const googleKey=Deno.env.get("GOOGLE_TTS_API_KEY");
    if(!googleKey)return json({error:"No human recording was found for this word. Optional TTS fallback is not configured."},404);
    const bytes=await googleAudio(word,googleKey);
    await uploadObject(`${supabaseUrl}/storage/v1/object/french-audio/${audioPath}`,serviceKey,bytes,"audio/mpeg");
    const metadata={source:"Google Cloud Text-to-Speech",sourceUrl:"https://cloud.google.com/text-to-speech",attribution:"Synthetic French voice",license:"Provider-generated audio",licenseUrl:"https://cloud.google.com/terms",audioMime:"audio/mpeg"};
    await uploadObject(`${supabaseUrl}/storage/v1/object/french-audio/${metaPath}`,serviceKey,new TextEncoder().encode(JSON.stringify(metadata)),"application/json");
    return json({audioUrl:publicBase+audioPath,cached:false,...metadata});
  }catch(error){console.error("Pronunciation function error:",error);return json({error:error instanceof Error?error.message:"Unexpected pronunciation service error."},500);}
});