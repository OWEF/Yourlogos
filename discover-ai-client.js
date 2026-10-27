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
const petAvatar='<span class="yl-logo-pet-shadow" aria-hidden="true"></span><span class="yl-logo-pet-figure" aria-hidden="true"><span class="yl-logo-pet-art">'+
 '<img class="yl-logo-pet-hero" src="/little-logo-hd-v2.jpg" width="400" height="400" alt="" decoding="async" draggable="false"><img class="yl-logo-pet-atlas" src="/little-logo-hd-v2.jpg" width="400" height="400" alt="" decoding="async" draggable="false"></span>'+
 '<span class="yl-logo-pet-hair"><svg viewBox="0 0 100 100" fill="none"><path d="M23 29q-8 2-13 10m18-13q-5-7 3-12m9-5q7-9 16-2" stroke="#f3d2a7" stroke-width="1.7" stroke-linecap="round"/></svg></span>'+
 '<span class="yl-logo-pet-scarf"><svg viewBox="0 0 100 100" fill="none"><path d="M12 70q-8 9-11 4m18-10q-11 5-17 2" stroke="#b9b79b" stroke-width="2" stroke-linecap="round"/></svg></span>'+
 '<span class="yl-logo-pet-blink yl-logo-pet-blink--left"></span><span class="yl-logo-pet-blink yl-logo-pet-blink--right"></span>'+
 '<span class="yl-logo-pet-cheek yl-logo-pet-cheek--left"></span><span class="yl-logo-pet-cheek yl-logo-pet-cheek--right"></span>'+
 '<svg class="yl-logo-face" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'+
 '<defs><radialGradient id="yl-face-l"><stop offset="59%" stop-color="#eac09f"/><stop offset="78%" stop-color="#eac09f" stop-opacity=".98"/><stop offset="100%" stop-color="#eac09f" stop-opacity="0"/></radialGradient><radialGradient id="yl-face-r"><stop offset="57%" stop-color="#f6dbb6"/><stop offset="77%" stop-color="#f6dbb6" stop-opacity=".96"/><stop offset="100%" stop-color="#f6dbb6" stop-opacity="0"/></radialGradient></defs>'+
 '<g class="yl-face-skin"><ellipse cx="244" cy="191" rx="29" ry="34" fill="url(#yl-face-l)"/><ellipse cx="312" cy="179" rx="22" ry="32" fill="url(#yl-face-r)"/></g>'+
 '<g class="yl-face-normal"><ellipse cx="244" cy="192" rx="13" ry="17" fill="#17130f"/><ellipse cx="312" cy="180" rx="10" ry="15" fill="#17130f"/><ellipse cx="240" cy="186" rx="3.1" ry="4" fill="#fff2dd" opacity=".9"/><ellipse cx="309" cy="175" rx="2.4" ry="3.2" fill="#fff6df" opacity=".88"/></g>'+
 '<g class="yl-face-happy"><path d="M229 191 Q244 208 258 186 M302 178 Q314 192 324 173" fill="none" stroke="#3e2619" stroke-width="5" stroke-linecap="round"/><path d="M276 220 Q286 232 298 218" fill="none" stroke="#7a4031" stroke-width="3.2" stroke-linecap="round"/></g>'+
 '<g class="yl-face-reflect"><path d="M229 192 Q244 201 258 191 M301 183 Q312 188 323 177" fill="none" stroke="#57402b" stroke-width="4" stroke-linecap="round"/><path d="M283 218 Q290 216 295 219" fill="none" stroke="#7d5841" stroke-width="2.5" stroke-linecap="round"/></g>'+
 '<g class="yl-face-surprise"><ellipse cx="244" cy="191" rx="15" ry="20" fill="#191511"/><ellipse cx="312" cy="179" rx="12" ry="18" fill="#191511"/><ellipse cx="240" cy="183" rx="4" ry="5" fill="#fff6df"/><ellipse cx="309" cy="172" rx="3.2" ry="4.2" fill="#fff6df"/><ellipse cx="286" cy="220" rx="4.5" ry="6" fill="#623c30"/></g>'+
 '<g class="yl-face-think"><ellipse cx="244" cy="191" rx="12" ry="14" fill="#241a13"/><path d="M301 182 Q312 188 322 175" fill="none" stroke="#583a29" stroke-width="4" stroke-linecap="round"/><path d="M230 158 Q241 150 252 154 M300 150 Q310 143 320 147" stroke="#916c4e" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M284 221q5-4 11 0" stroke="#714b32" fill="none" stroke-width="2.4"/></g>'+
 '<g class="yl-face-encourage"><path d="M230 191 Q244 204 257 188" stroke="#4c2b1c" stroke-width="4.5" fill="none" stroke-linecap="round"/><ellipse cx="312" cy="179" rx="11" ry="15" fill="#21150f"/><ellipse cx="308" cy="175" rx="3.2" ry="3.8" fill="#fff4dc"/><path d="M280 220 Q289 228 298 218" stroke="#774333" stroke-width="2.8" fill="none" stroke-linecap="round"/></g>'+
 '</svg></span>'+
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
 html+='<div class="yl-logo-roam-stage yl-logo-roam-stage-'+steps+(completed?" is-complete":"")+'" role="group" aria-label="Meet Little Logo">'+
  '<span class="yl-logo-scene-light" aria-hidden="true"></span><span class="yl-logo-scene-ridge" aria-hidden="true"></span>'+ '<span class="yl-logo-roam-orbit" aria-hidden="true"></span>'+
  '<span class="yl-logo-roam-glow" aria-hidden="true"></span>'+
  '<div class="yl-logo-roam-position">'+littleLogoPet(c.loading&&c.petMood!=="curious"&&c.petMood!=="reflective"&&c.petMood!=="surprised"?"thinking":(c.petMood||(completed?"delighted":steps?"curious":"idle")))+'</div>'+
  '</div>';
 if(!completed&&steps===0&&original){
  html+='<details class="yl-logo-source"><summary>FROM '+esc(author.toUpperCase())+'</summary><p>“'+esc(original)+'”</p></details>';
 }
 if(c.loading&&!latest)html+='<div class="yl-ai-quiet-loading" role="status">Following a thought…</div>';
 if(latest){
  if(completed){
   html+='<div class="yl-logo-finale">'+
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
