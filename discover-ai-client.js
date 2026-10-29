import {philosopherPortrait} from "./philosopher-portraits.js";
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
// Production pose atlas: eight separately illustrated physical states with intact black eyes.
// The original HD artwork remains a non-sprite fallback for older WebP browsers.
const petAvatar='<span class="yl-logo-pet-shadow" aria-hidden="true"></span>'+
 '<span class="yl-logo-pet-figure" aria-hidden="true"><span class="yl-logo-pet-art">'+
 '<img class="yl-logo-pet-hero" src="/little-logo-hd-v2.jpg" width="400" height="400" alt="" decoding="async" draggable="false">'+
 '<span class="yl-logo-pet-pose" aria-hidden="true"></span></span></span>'+
 '<span class="yl-logo-pet-emote" aria-hidden="true"><i></i><i></i><i></i></span>';
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
  '<div class="yl-logo-top"><div class="yl-logo-identity"><div><strong>LITTLE LOGO</strong><small>A THOUGHTFUL COMPANION</small></div></div></div>'+
  '<div class="yl-logo-roam-stage yl-logo-roam-stage-0" role="group" aria-label="Meet Little Logo">'+
    '<span class="yl-logo-scene-light" aria-hidden="true"></span><span class="yl-logo-scene-ridge" aria-hidden="true"></span>'+
    '<span class="yl-logo-roam-orbit" aria-hidden="true"></span><span class="yl-logo-roam-glow" aria-hidden="true"></span>'+
    '<div class="yl-logo-roam-position">'+littleLogoPet("idle")+'</div></div>'+
  '<h2 class="yl-ai-title">A small question. A different perspective.</h2>'+
  '<p class="yl-ai-consent">Little Logo uses DeepSeek to explore this quote with you. With your permission, it will share this quotation, your choices, and up to four saved reflections. No account needed.</p>'+
  '<button type="button" data-ai="agree" class="yl-ai-main">Begin together '+nextArrow+'</button>'+
  '<button type="button" data-ai="cancel" class="yl-ai-secondary">Not now</button></section>';
 const author=Array.isArray(quote)?cleanText(quote[1],80):"";
 const original=Array.isArray(quote)?cleanText(quote[0],190):"";
 html+='<div class="yl-logo-top"><div class="yl-logo-identity">'+
    '<div><strong>LITTLE LOGO</strong><small>'+(completed?"YOUR CONNECTION":"FOLLOW THE THOUGHT")+'</small></div></div>'+
    '<div class="yl-logo-progress" aria-label="'+(completed?"Reflection finished":"Reflection "+(steps+1)+" of 3")+'">'+dots+'</div></div>';
 html+='<div class="yl-logo-progress-track" role="progressbar" aria-label="Your reflection journey" aria-valuemin="0" aria-valuemax="3" aria-valuenow="'+Math.min(LOGO_DECISIONS,steps+1)+'"><span style="width:'+(completed?"100":((steps+1)*100/LOGO_DECISIONS).toFixed(1))+'%"></span></div>';
 html+='<div class="yl-logo-roam-stage yl-logo-roam-stage-'+steps+(completed?" is-complete":"")+'" role="group" aria-label="Meet Little Logo">'+
  '<span class="yl-logo-scene-light" aria-hidden="true"></span><span class="yl-logo-scene-ridge" aria-hidden="true"></span>'+ '<span class="yl-logo-roam-orbit" aria-hidden="true"></span>'+
  '<span class="yl-logo-roam-glow" aria-hidden="true"></span>'+
  '<div class="yl-logo-roam-position">'+littleLogoPet(c.loading&&c.petMood!=="curious"&&c.petMood!=="reflective"&&c.petMood!=="surprised"?"thinking":(c.petMood||(completed?"delighted":steps?"curious":"idle")))+'</div>'+
  '</div>';
 if(author)html+='<div class="yl-thinker-intro"><span class="yl-thinker-avatar">'+philosopherPortrait(author)+'</span><div class="yl-thinker-copy"><span class="yl-thinker-eyebrow">A THOUGHT FROM</span><strong>'+esc(author)+'</strong><span class="yl-thinker-whisper">A philosopher in your everyday world</span></div></div>';
 if(!completed&&steps===0&&original){
  html+='<details class="yl-logo-source"><summary>THE ORIGINAL IDEA</summary><p>“'+esc(original)+'”</p></details>';
 }
 if(c.loading&&!latest)html+='<div class="yl-ai-quiet-loading" role="status">Following a thought…</div>';
 if(c.loading&&latest){
  const responding=["curious","reflective","surprised"].includes(c.petMood);
  html+='<div class="yl-logo-feedback" role="status" aria-live="polite">'+
    '<span class="yl-logo-feedback-eyebrow">'+(responding?"YOUR CHOICE":"FOLLOWING YOUR THOUGHT")+'</span>'+
    '<h2>'+(responding?"An interesting direction.":"Hmm…")+'</h2>'+
    '<p>'+(responding?"Let's see where it leads.":(steps===LOGO_DECISIONS?"Gathering your reflection…":"Little Logo is thinking about your answer."))+'</p></div>';
 }else if(latest){
  if(completed){
   html+='<div class="yl-logo-finale">'+
     '<h2 class="yl-logo-final-title">Your Connection</h2>'+
     '<p class="yl-logo-final-insight">'+esc(cleanText(latest.text,480))+'</p><p class="yl-logo-backlink">FROM '+esc(author.toUpperCase())+'</p></div>';
  }else{
   html+='<div class="yl-ai-current">';
   
   html+='<p class="yl-ai-observation">'+esc(shortObservation(latest.text))+'</p>'+
     '<h2 class="yl-ai-question">'+esc(cleanText(latest.followUp,220))+'</h2></div>';
  }
 }else if(!c.loading&&!c.error)html+='<p class="yl-ai-quiet-loading">Finding another angle…</p>';
 // A dedicated feedback view replaces the old question while the AI responds.
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
