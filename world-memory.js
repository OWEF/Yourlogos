// My World is the shared evidence ledger for Encounter, not a personality verdict.
// Store volunteered answers and observable exploration separately from interpretation.
// This is local-first, deterministic, and does not call a model or transmit notes.
import { CONCERNS } from "./personalization.js";
const safe=(x,n=220)=>typeof x==="string"?x.trim().slice(0,n):"";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const validId=(x,quotes)=>Number.isInteger(x)&&x>=0&&x<quotes.length;
const recent=(arr,n)=>Array.isArray(arr)?arr.slice(-n):[];
export function buildWorldMemory(state={},quotes=[],cosmos=[]){
 const p=state.personalization?.status==="completed"?state.personalization?.answers||{}:{};
 const interests=Array.isArray(p.concerns)?[...new Set(p.concerns.filter(x=>Object.hasOwn(CONCERNS,x)))].slice(0,3):[];
 const saved=recent(state.saved,100).filter(id=>validId(id,quotes));
 const savedThemes=saved.map(id=>quotes[id]?.[2]).filter(Boolean);
 const chosenThemes=Array.isArray(state.themes)?state.themes.filter(x=>typeof x==="string"&&x.length<=30).slice(0,5):[];
 const practice=state.practice&&typeof state.practice==="object"?state.practice:{};
 const checkins=Array.isArray(state.arrivals)?state.arrivals.filter(s=>/^\d{4}-\d{2}-\d{2}$/.test(s)).length:0;
 const legacyDiscover=Object.values(state.discovery||{}).filter(x=>x&&typeof x==="object"&&x.response);
 const threads=recent(state.livingThreads?.history,45)
  .filter(h=>h&&validId(h.quoteId,quotes)&&Object.hasOwn(CONCERNS,h.focus)&&typeof h.question==="string")
  .map(h=>({type:"thread",id:safe(h.id,90),quoteId:h.quoteId,theme:quotes[h.quoteId][2],focus:h.focus,
     question:safe(h.question,230),note:safe(h.note,240),opening:safe(h.opening,240),
     reaction:["close","unsure","turn"].includes(h.reaction)?h.reaction:null,date:safe(h.date,10)}));
 const aiThreads=Array.isArray(state.aiDiscoverThreads)?state.aiDiscoverThreads.slice(-30).filter(
   x=>x&&Number.isInteger(x.quoteId)&&x.quoteId>=0&&x.quoteId<quotes.length
     &&typeof x.question==="string"
 ).map(x=>({type:"ai",quoteId:x.quoteId,theme:quotes[x.quoteId][2],
   focus:null,opening:safe(x.opening,240),note:safe(x.note,240),
   question:safe(x.question,230),date:safe(x.date,10)})):[];
 const sessions=Object.values(state.livingThreads?.sessions||{})
  .filter(h=>h&&validId(h.quoteId,quotes)&&h.phase!=="done").slice(-10)
  .map(h=>({type:"ongoing",quoteId:h.quoteId,theme:quotes[h.quoteId][2],focus:h.focus,
    opening:safe(h.opening,240),note:safe(h.note,240),date:safe(h.date,10)}));
 const oldChoices=recent(state.encounterEvents,150).filter(e=>e&&validId(e.quoteId,quotes)&&typeof e.theme==="string");
 const legacy=recent(state.thoughtThreadEvents,150).filter(e=>e&&validId(e.quoteId,quotes)&&typeof e.theme==="string");
 const other=recent(cosmos,250).filter(e=>e&&["save","read","link","view"].includes(e.type)&&typeof e.concept==="string");
 const evidence={onboarding:interests.length,saved:saved.length,threads:threads.length,
   choices:oldChoices.length+legacy.length+legacyDiscover.length,sky:other.length,aiThreads:aiThreads.length,
   checkins,practiceDays:Object.keys(practice).length};
 const counts=new Map();
 const increment=(theme,amount)=>{if(typeof theme==="string"&&theme.length<=30)counts.set(theme,(counts.get(theme)||0)+amount)};
 // Interest is an indication of attention, NEVER a statement of agreement.
 savedThemes.forEach(x=>increment(x,1));
 chosenThemes.forEach(x=>increment(x,.5));
 threads.forEach(x=>increment(x.theme,3));
 aiThreads.forEach(x=>increment(x.theme,3));
 oldChoices.forEach(x=>increment(x.theme,.25));
 legacy.forEach(x=>increment(x.theme,.25));
 const themes=[...counts.entries()].sort((a,b)=>b[1]-a[1]).map(([name,count])=>({name,count}));
 return {interests,threads:[...threads,...aiThreads],sessions,savedThemes,chosenThemes,latestSavedQuoteId:saved.at(-1)??null,
   themes,evidence,hasExplicitMemory:threads.some(x=>x.note||x.opening)};
}
export function matchWorldMemory(memory,quote,id){
 if(!memory||!quote)return null;
 const related=memory.threads.filter(h=>h.quoteId!==id&&(h.theme===quote[2]||memory.interests.includes(h.focus)));
 const withWords=related.filter(h=>h.opening||h.note);
 if(withWords.length)return {...withWords.at(-1),reason:withWords.at(-1).theme===quote[2]?"shared-theme":"chosen-interest"};
 if(related.length)return {...related.at(-1),reason:"previous-thread"};
 const ongoing=memory.sessions.filter(h=>h.quoteId!==id&&(h.theme===quote[2]||memory.interests.includes(h.focus)));
 if(ongoing.length)return {...ongoing.at(-1),reason:"unfinished-thread"};
 return null;
}
export function memoryForQuote(memory,quote,id){
 const match=matchWorldMemory(memory,quote,id);
 if(match){
   const fragment=match.opening||match.note;
   const focus=CONCERNS[match.focus]?.label?.toLowerCase()||"a question that mattered";
   return {source:match.type,focus:match.focus,previous:match,hasWords:Boolean(fragment),
     preview:fragment?'You once wrote: “'+fragment+'”':'You previously explored '+focus+'.',
     question:match.question||"",theme:match.theme};
 }
 if(memory?.savedThemes?.includes(quote?.[2])){
   return {source:"saved",focus:null,preview:"You've saved a thought about "+quote[2].toLowerCase()+" before. I don't know if you agreed with it, but something made you keep it.",
     question:"",hasWords:false};
 }
 if(memory?.interests?.length){
   const first=memory.interests[0],focus=CONCERNS[first]?.label?.toLowerCase()||"your curiosity";
   return {source:"onboarding",focus:first,preview:"When you joined, you chose "+focus+" as something on your mind.",
     question:"",hasWords:false};
 }
 return {source:"new",focus:null,preview:"I don't know what part of this speaks to you yet. We can start wherever you want.",
   question:"",hasWords:false};
}
export function worldMemoryHtml(memory){
 const m=memory||buildWorldMemory();
 const newest=m.threads.slice(-3).reverse();
 const counts=m.evidence;
 return '<section class="yl-world-memory" aria-label="Your Encounter memory">'+
   '<div class="yl-world-memory-head"><span>THE THOUGHTS YOU CARRY</span><small>From your encounters</small></div>'+
   '<p class="yl-world-memory-intro">YourLogos remembers the directions you chose and the thoughts you decided to keep. These are traces of curiosity, not a definition of you.</p>'+
   '<div class="yl-world-memory-counts"><span>'+counts.threads+' threads kept</span><span>'+counts.saved+' quotes saved</span><span>'+counts.choices+' past choices</span><span>'+counts.checkins+' visits</span></div>'+
   (newest.length?'<div class="yl-world-memory-entries">'+newest.map(e=>'<article><span>'+esc(e.theme)+' · '+esc(e.date)+'</span><p>'+esc(e.opening||e.note||e.question)+'</p></article>').join("")+'</div>':
      '<p class="yl-world-memory-empty">Nothing saved here yet. When you choose to keep a thread in Discover, it will have a place here—and can connect with another quote later.</p>')+
   '<p class="yl-world-memory-privacy">Saved locally on this device. Account sync happens only when you choose it in Settings.</p></section>';
}
