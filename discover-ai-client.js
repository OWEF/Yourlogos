// YourLogos AI Discover pilot UI. All conversation state is ephemeral until
// the visitor explicitly saves a memory. No model output runs as HTML.
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const cleanText=(x,max=480)=>typeof x==="string"?x.trim().slice(0,max):"";
export function newAIConversation(quoteId){
 return {quoteId,consent:false,messages:[],loading:false,error:"",draft:""};
}
export function safeAIConversation(value,id){
 return value&&value.quoteId===id?value:newAIConversation(id);
}
export function aiMemoryChoices(memory){
 return (memory?.threads||[]).filter(x=>x?.note||x?.opening).slice(-4)
   .map(x=>cleanText(x.note||x.opening,200)).filter(Boolean);
}
// Little Logo: Encounter -> three choices -> an explicit connection back to the thinker.
export const LOGO_DECISIONS=3;
const logoGlyph='<svg viewBox="0 0 32 32" aria-hidden="true" fill="none"><path d="M16 2.5c0 8-5.5 13.5-13.5 13.5C10.5 16 16 21.5 16 29.5c0-8 5.5-13.5 13.5-13.5C21.5 16 16 10.5 16 2.5Z" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="16" r="3" fill="currentColor"/></svg>';

// Approved Little Logo artwork, in six compact, transparent sprite poses.
// The original abstract mark remains as a graceful fallback on older devices.
const petAvatar='<span class="yl-logo-pet-art" aria-hidden="true"><img class="yl-logo-pet-atlas" src="/little-logo-v1.avif" width="384" height="60" alt="" decoding="async" draggable="false"></span>';
export function littleLogoPet(mood="idle"){
 const moods=new Set(["idle","thinking","curious","delighted","reflective","surprised","encourage"]);
 const value=moods.has(mood)?mood:"idle";
 return '<button type="button" class="yl-logo-pet yl-logo-pet-'+value+'" data-ai="pet" aria-label="Say hello to Little Logo" title="Say hello to Little Logo">'+petAvatar+'</button>';
}
const nextArrow='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
function shortObservation(text){
 const value=cleanText(text,850);
 const first=value.match(/^.{18,190}?[.!?](?=\s|$)/s);
 if(first)return first[0];
 if(value.length<=190)return value;
 return value.slice(0,190).replace(/\s+\S*$/,"").trimEnd()+"…";
}
export function aiConversationHtml({quote,conversation,available,authenticated}){
 const c=conversation;
 if(!available||!authenticated)return "";
 const recent=(c.messages||[]).slice(-12);
 const latest=[...recent].reverse().find(m=>m.role==="assistant");
 const user=[...recent].reverse().find(m=>m.role==="user");
 const prior=latest?recent.slice(0,recent.lastIndexOf(latest)):[];
 const steps=Math.min(LOGO_DECISIONS,recent.filter(m=>m.role==="user").length);
 const completed=Boolean(c.complete||latest?.complete);
 const dots=Array.from({length:LOGO_DECISIONS},(_,i)=>'<span class="yl-logo-progress-dot'+(i<steps?" is-visited":"")+(i===steps&&!completed?" is-current":"")+(completed?" is-done":"")+'"></span>').join("");
 let html='<section class="yl-ai-experiment yl-ai-quiet yl-logo" aria-label="Little Logo philosophical companion">';
 if(!c.consent)return html+
  '<div class="yl-logo-intro">'+littleLogoPet("idle")+'<span>MEET LITTLE LOGO</span></div>'+
  '<h2 class="yl-ai-title">A small guide for a bigger question.</h2>'+
  '<p class="yl-ai-consent">Little Logo uses DeepSeek to explore this quote with you. With your permission, it will share this quotation, your choices, and up to four saved reflections. No account needed.</p>'+
  '<button type="button" data-ai="agree" class="yl-ai-main">Begin together '+nextArrow+'</button>'+
  '<button type="button" data-ai="cancel" class="yl-ai-secondary">Not now</button></section>';
 const author=Array.isArray(quote)?cleanText(quote[1],80):"";
 const original=Array.isArray(quote)?cleanText(quote[0],190):"";
 html+='<div class="yl-logo-top"><div class="yl-logo-identity">'+
    '<span class="yl-logo-mark">'+littleLogoPet(c.petMood||(c.loading?"thinking":completed?"delighted":steps?"curious":"idle"))+'</span>'+
    '<div><strong>LITTLE LOGO</strong><small>'+(completed?"YOUR CONNECTION":"FOLLOW THE THOUGHT")+'</small></div></div>'+
    '<div class="yl-logo-progress" aria-label="'+(completed?"Reflection finished":"Reflection "+(steps+1)+" of 3")+'">'+dots+'</div></div>';
 if(!completed&&steps===0&&original){
  html+='<details class="yl-logo-source"><summary>FROM '+esc(author.toUpperCase())+'</summary><p>“'+esc(original)+'”</p></details>';
 }
 if(c.loading&&!latest)html+='<div class="yl-ai-quiet-loading" role="status">Following a thought…</div>';
 if(latest){
  if(completed){
   html+='<div class="yl-logo-finale"><span class="yl-logo-final-mark" aria-hidden="true">'+littleLogoPet("delighted")+'</span>'+
     '<h2 class="yl-logo-final-title">Your Connection</h2>'+
     '<p class="yl-logo-final-insight">'+esc(cleanText(latest.text,480))+'</p><p class="yl-logo-backlink">FROM '+esc(author.toUpperCase())+'</p></div>';
  }else{
   html+='<div class="yl-ai-current">';
   
   html+=(steps===0?'<p class="yl-logo-thinker">WHAT WOULD '+esc(author.split(" ").at(-1).toUpperCase())+' NOTICE?</p>':'')+'<p class="yl-ai-observation">'+esc(shortObservation(latest.text))+'</p>'+
     '<h2 class="yl-ai-question">'+esc(cleanText(latest.followUp,220))+'</h2></div>';
  }
 }else if(!c.loading&&!c.error)html+='<p class="yl-ai-quiet-loading">Finding another angle…</p>';
 if(c.loading&&latest)html+='<p class="yl-ai-loading" role="status">'+(steps===LOGO_DECISIONS?"Gathering your reflection…":"Little Logo is thinking…")+'</p>';
 if(!completed&&!c.loading&&latest?.choices?.length){
  html+='<div class="yl-logo-choices" role="group" aria-label="Choose a philosophical direction">'+
   latest.choices.slice(0,3).map((choice,i)=>
    '<button type="button" class="yl-logo-choice yl-logo-choice-'+i+'" data-ai-choice="'+i+'">'+
    '<span class="yl-logo-choice-index">0'+(i+1)+'</span>'+
    '<span class="yl-logo-choice-label">'+esc(cleanText(choice,82))+'</span>'+
    '<span class="yl-logo-choice-arrow">'+nextArrow+'</span></button>'
   ).join("")+'</div>';
 }
 if(c.error)html+='<p class="yl-ai-error" role="status">'+esc(c.error)+'</p>'+
   '<button type="button" data-ai="cancel" class="yl-ai-secondary">Continue privately</button>';
 if(!completed&&!c.loading&&!latest){
  html+='<button type="button" data-ai="send" class="yl-ai-main"'+(!c.error?' hidden':'')+'>Try again '+nextArrow+'</button>';
 }else if(!completed&&c.loading&&!latest){
  html+='<button type="button" data-ai="send" hidden disabled></button>';
 }
 if(completed){
  html+='<div class="yl-logo-ending-actions">'+
    '<button type="button" data-ai="save" class="yl-ai-main">'+
      (c.saved?"See it in My World":"Keep in My World")+nextArrow+'</button>'+
    '<button type="button" data-ai="finish" class="yl-ai-secondary">Back to Encounter</button></div>';
 }else if(latest&&!c.loading){
  html+='<button type="button" data-ai="finish" class="yl-ai-secondary yl-logo-exit">End reflection here</button>';
 }
 if(!completed)html+='<div class="yl-logo-privacy"><button type="button" data-ai="revoke">Use private mode</button></div>';
 html+='</section>';
 return html;
}
export function aiSummary(conversation,quote,date){
 const messages=(conversation?.messages||[]).filter(x=>x&&["user","assistant"].includes(x.role)).slice(-12);
 if(!messages.some(x=>x.role==="assistant"))return null;
 const user=messages.filter(x=>x.role==="user").map(x=>cleanText(x.text,240));
 const assistant=messages.filter(x=>x.role==="assistant");
 return {id:"ai:"+conversation.quoteId+":"+date,quoteId:conversation.quoteId,
   theme:quote?.[2]||"",question:cleanText(assistant.at(-1)?.complete?assistant.at(-1)?.text:assistant.at(-1)?.followUp,230),
   opening:user[0]||"",note:user.at(-1)||"",date,kind:"ai"};
}
