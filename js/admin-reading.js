(() => {
"use strict";
const ADMIN="lorrainesufr@outlook.com", db=window.supabaseClient, $=id=>document.getElementById(id);
let editing=null;
const say=m=>{$("admin-message").textContent=m};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function addVocabRow(item={}) {
  const row=document.createElement("div");
  row.className="vocab-editor-row";
  row.innerHTML='<div class="vocab-row-top"><strong class="vocab-row-number">New word</strong><button type="button" class="vocab-remove-button">Remove</button></div><div class="vocab-input-grid"><label>French word *<input class="vocab-word" type="text" placeholder="例如：enjeu" value="'+esc(item.word)+'"></label><label>Chinese meaning *<input class="vocab-meaning" type="text" placeholder="例如：重大议题" value="'+esc(item.meaning)+'"></label><label>Example sentence (French)<textarea class="vocab-example" rows="2" placeholder="Une phrase qui contient ce mot…">'+esc(item.example)+'</textarea></label><label>Example translation (Chinese)<textarea class="vocab-translation" rows="2" placeholder="例句的中文翻译（可选）">'+esc(item.translation)+'</textarea></label></div>';
  row.querySelector(".vocab-remove-button").addEventListener("click",()=>{row.remove();refreshVocabRows();});
  $("vocab-editor").appendChild(row);
  refreshVocabRows();
}
function refreshVocabRows(){
  const rows=[...$("vocab-editor").querySelectorAll(".vocab-editor-row")];
  rows.forEach((row,i)=>row.querySelector(".vocab-row-number").textContent="Word "+(i+1));
  $("vocab-editor").classList.toggle("is-empty",rows.length===0);
  if(!rows.length)$("vocab-editor").innerHTML='<p class="vocab-empty">No vocabulary added yet. Click “Add a word” to create your list.</p>';
}
function readVocabulary(){
  const result=[];
  for(const row of $("vocab-editor").querySelectorAll(".vocab-editor-row")){
    const word=row.querySelector(".vocab-word").value.trim();
    const meaning=row.querySelector(".vocab-meaning").value.trim();
    const example=row.querySelector(".vocab-example").value.trim();
    const translation=row.querySelector(".vocab-translation").value.trim();
    if(!word&&!meaning&&!example&&!translation)continue;
    if(!word||!meaning)throw Error("Each vocabulary entry needs both a French word and a Chinese meaning.");
    const item={word,meaning};
    if(example)item.example=example;
    if(translation)item.translation=translation;
    result.push(item);
  }
  return result;
}
function setVocabulary(items=[]){
  $("vocab-editor").innerHTML="";
  (Array.isArray(items)?items:[]).forEach(addVocabRow);
  refreshVocabRows();
}
function reset(){editing=null;$("reading-form").reset();$("reading-date").value=new Date().toISOString().slice(0,10);setVocabulary([]);$("reading-status").value="draft";$("form-heading").textContent="Create a reading";}
function edit(x){editing=x.id;for(const [id,key] of Object.entries({"reading-title":"title","reading-title-en":"title_en","reading-title-zh":"title_zh","reading-date":"published_at","reading-level":"level","reading-topic":"topic","reading-content":"content_fr","reading-summary-zh":"summary_zh","reading-source":"source_name","reading-source-title":"source_title","reading-source-url":"source_url","reading-status":"status"}))$(id).value=x[key]||"";setVocabulary(x.vocabulary||[]);$("form-heading").textContent="Edit reading";window.scrollTo({top:0,behavior:"smooth"});}
async function list(){const {data,error}=await db.from("daily_readings").select("*").order("published_at",{ascending:false});if(error){say(error.message);return;}$("reading-list").innerHTML=(data||[]).map(x=>'<div class="admin-reading-row"><div><b>'+esc(x.title)+'</b><p>'+esc(x.published_at)+' · '+esc(x.level)+' · '+esc(x.status)+'</p></div><div class="admin-row-actions"><button data-edit="'+x.id+'">Edit</button><button data-del="'+x.id+'">Delete</button></div></div>').join("")||"No readings yet.";document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>edit(data.find(x=>x.id===b.dataset.edit)));document.querySelectorAll("[data-del]").forEach(b=>b.onclick=async()=>{if(confirm("Delete this reading?")){const r=await db.from("daily_readings").delete().eq("id",b.dataset.del);say(r.error?.message||"Deleted.");list();}});}
async function init(){const {data}=await db.auth.getUser();if(!data.user||data.user.email.toLowerCase()!==ADMIN){$("admin-status").textContent="Access denied. Log in with the administrator account.";return;}$("admin-gate").hidden=true;$("admin-workspace").hidden=false;reset();list();}
$("add-vocab").addEventListener("click",()=>addVocabRow());
$("reading-form").onsubmit=async e=>{e.preventDefault();let vocabulary;try{vocabulary=readVocabulary();}catch(err){say(err.message);return;}const {data:u}=await db.auth.getUser();const p={title:$("reading-title").value.trim(),title_en:$("reading-title-en").value.trim()||null,title_zh:$("reading-title-zh").value.trim()||null,published_at:$("reading-date").value,level:$("reading-level").value,topic:$("reading-topic").value.trim()||null,content_fr:$("reading-content").value.trim(),summary_zh:$("reading-summary-zh").value.trim()||null,vocabulary,source_name:$("reading-source").value.trim()||null,source_title:$("reading-source-title").value.trim()||null,source_url:$("reading-source-url").value.trim()||null,status:$("reading-status").value,created_by:u.user.id};const q=editing?db.from("daily_readings").update(p).eq("id",editing):db.from("daily_readings").insert(p);const {error}=await q;if(error){say("Save failed: "+error.message);return;}say(p.status==="published"?"Published.":"Saved.");reset();list();};
$("reset-reading").onclick=reset;
init();
})();