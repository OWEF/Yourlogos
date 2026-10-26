// YourLogos Living Threads v1 — deterministic, local-first conversational memory.
// Philosophical anchors come from curated quote/tension data; personal meaning
// comes ONLY from explicit choices and user-authored notes. Not a diagnosis.
import { getThoughtThread } from "./thought-threads.js";
import { personalizedExplore, CONCERNS } from "./personalization.js";
import { exploreFor } from "./explore-catalogue.js";

export const LIVING_VERSION=1;
const THEME_START={
 Meaning:["direction","identity","fairness"],Suffering:["change","connection","uncertainty"],
 Freedom:["freedom","identity","connection"],Mortality:["change","time","connection"],
 Love:["connection","identity","fairness"],Doubt:["uncertainty","identity","fairness"],
 Action:["direction","freedom","time"],Solitude:["connection","identity","freedom"],
 Beauty:["identity","connection","change"],Time:["time","change","direction"]
};
const REACTIONS={
 close:"This feels close to what I mean",
 unsure:"I'm not sure that's quite it",
 turn:"I'd like to see another side"
};
const esc=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const safePhrase=(text,n=220)=>typeof text==="string"?text.trim().slice(0,n):"";
function validQuote(quote,id){return Number.isInteger(id)&&id>=0&&id<91&&Array.isArray(quote)&&!!exploreFor(quote,id)}
function answers(profile){return profile?.status==="completed"&&profile.answers&&typeof profile.answers==="object"?profile.answers:{}}
export function normalizeLivingState(value){
 const v=value&&typeof value==="object"?value:{};
 const history=Array.isArray(v.history)?v.history.filter(x=>x&&Number.isInteger(x.quoteId)&&x.quoteId>=0&&x.quoteId<91&&
   Object.hasOwn(CONCERNS,x.focus)&&["close","unsure","turn"].includes(x.reaction)&&typeof x.question==="string").slice(-45).map(x=>({
   id:safePhrase(x.id,90),quoteId:x.quoteId,theme:safePhrase(x.theme,30),focus:x.focus,reaction:x.reaction,
   question:safePhrase(x.question,230),date:safePhrase(x.date,10),note:safePhrase(x.note,240)
 })):[];
 const sessions={};
 if(v.sessions&&typeof v.sessions==="object"){
   for(const [key,s] of Object.entries(v.sessions).slice(-15)){
     if(!/^\d{1,2}$/.test(key)||!s||Number(key)!==s.quoteId||!Number.isInteger(s.quoteId)||s.quoteId>90)continue;
     if(!["focus","mirror","response","reflection","summary","done"].includes(s.phase))continue;
     sessions[key]={id:safePhrase(s.id,90),quoteId:s.quoteId,theme:safePhrase(s.theme,30),date:safePhrase(s.date,10),
       phase:s.phase,focus:Object.hasOwn(CONCERNS,s.focus)?s.focus:null,
       reaction:Object.hasOwn(REACTIONS,s.reaction)?s.reaction:null,
       note:safePhrase(s.note,240),revision:Math.min(5,Math.max(0,Number(s.revision)||0)),
       carried:Boolean(s.carried)};
   }
 }
 return {version:LIVING_VERSION,sessions,history};
}
function stableDate(date){return /^\d{4}-\d{2}-\d{2}$/.test(date||"")?date:"unknown"}
export function beginLiving(quote,id,date,old=null){
 if(!validQuote(quote,id))return null;
 if(old&&old.quoteId===id&&old.phase!=="done")return old;
 return {id:id+":"+stableDate(date),quoteId:id,theme:quote[2],date:stableDate(date),phase:"focus",
   focus:null,reaction:null,note:"",revision:0,carried:false};
}
export function focusChoices(quote,profile,history=[]){
 const user=answers(profile);
 const selected=Array.isArray(user.concerns)?user.concerns.filter(k=>Object.hasOwn(CONCERNS,k)).slice(0,3):[];
 const previous=Array.isArray(history)?[...history].reverse().filter(h=>h?.theme===quote?.[2]&&Object.hasOwn(CONCERNS,h.focus)): [];
 const ids=[...new Set([...selected,...previous.map(h=>h.focus),...(THEME_START[quote?.[2]]||THEME_START.Meaning)])].slice(0,4);
 return ids.map(id=>({id,label:CONCERNS[id].label}));
}
function relevantMemory(history,quote,focus){
 const h=(Array.isArray(history)?[...history]:[]).reverse().find(e=>e&&(e.focus===focus||e.theme===quote?.[2]));
 return h||null;
}
function localProfile(profile,focus){
 const p=answers(profile);
 return {status:"completed",answers:{concerns:[focus],approach:p.approach||"unsure",
   tension:p.tension||"unsure",style:p.style||"surprise"}};
}
function threadContext(quote,id,profile,focus,history){
 return personalizedExplore(quote,id,localProfile(profile,focus),history)||exploreFor(quote,id);
}
export function transitionLiving(session,action,{quote,profile,history=[]}={}){
 if(!session||!validQuote(quote,session.quoteId))return null;
 const next={...session},choices=focusChoices(quote,profile,history);
 if(next.phase==="focus"){
   if(!action.startsWith("focus:"))return null;
   const focus=action.slice(6);
   if(!choices.some(x=>x.id===focus))return null;
   next.focus=focus;next.reaction=null;next.phase="mirror";return next;
 }
 if(next.phase==="mirror"){
   if(!["close","unsure","turn"].includes(action))return null;
   next.reaction=action;next.phase="response";return next;
 }
 if(next.phase==="response"){
   if(action==="continue"){next.phase="reflection";return next;}
   if(action==="reconsider"&&next.revision<5){next.phase="focus";next.revision++;next.focus=null;next.reaction=null;return next;}
   return null;
 }
 if(next.phase==="reflection"){
   if(action==="carry"){next.phase="summary";return next;}
   if(action==="reconsider"&&next.revision<5){next.phase="focus";next.revision++;next.focus=null;next.reaction=null;return next;}
   return null;
 }
 if(next.phase==="summary"){
   if(action==="save"){next.phase="done";next.carried=true;return next;}
   if(action==="reconsider"&&next.revision<5){next.phase="focus";next.revision++;next.focus=null;next.reaction=null;return next;}
 }
 if(next.phase==="done"&&action==="revisit"){return beginLiving(quote,session.quoteId,session.date+"-again");}
 return null;
}
export function noteLiving(session,text){
 if(!session||!["reflection","summary"].includes(session.phase))return null;
 return {...session,note:safePhrase(text,240)};
}
export function archiveLiving(history,session,quote,profile){
 if(!session||session.phase!=="done"||!session.carried||!session.focus||!session.reaction||!validQuote(quote,session.quoteId))return history||[];
 const response=threadContext(quote,session.quoteId,profile,session.focus,history);
 const entry={id:session.id,quoteId:session.quoteId,theme:quote[2],focus:session.focus,
   reaction:session.reaction,question:safePhrase(response?.reflection||getThoughtThread(quote,session.quoteId).question,230),
   date:session.date,note:safePhrase(session.note,240)};
 return [...(Array.isArray(history)?history.filter(x=>x?.id!==entry.id):[]),entry].slice(-45);
}
function button(action,text,variant=""){
 return '<button type="button" class="yl-living-choice '+variant+'" data-living="'+esc(action)+'"><span>'+esc(text)+'</span><span aria-hidden="true">↗</span></button>';
}
export function livingHtml({quote,id,session,profile,history=[]}){
 if(!validQuote(quote,id))return '<div class="yl-thread yl-thread-pending" role="status"><p>This quotation does not have a reviewed Discover conversation yet.</p></div>';
 const thread=getThoughtThread(quote,id);
 const recall=(Array.isArray(history)?[...history].reverse():[]).find(x=>x?.quoteId!==id);
 const front='<div class="yl-thread yl-living" data-living-phase="'+esc(session?.phase||"entry")+'">';
 if(!session)return front+
   '<div class="yl-thread-progress">A QUESTION WORTH FOLLOWING</div>'+
   '<h2 class="yl-living-title">'+esc(thread.question)+'</h2>'+
   (recall?'<p class="yl-living-memory">Last time, you were wondering: “'+esc(recall.question)+'”</p>':"")+
   '<div class="yl-explore-invitation"><button type="button" class="yl-explore-button" data-action="thread-explore" aria-label="Explore this thought"><span class="yl-explore-orb" aria-hidden="true">✧</span><span class="yl-explore-label">Explore</span></button></div>'+
   '<p class="yl-explore-hint">Your answers shape where this goes.</p></div>';
 const prefix='<div class="yl-living-kicker"><span class="yl-living-orbit" aria-hidden="true">✧</span> YOUR THREAD <span class="yl-living-dot">·</span> '+esc((session.phase==="done"?"KEPT":session.phase==="focus"?"WHERE TO BEGIN":session.phase==="mirror"?"A CONNECTION":session.phase==="response"?"FOLLOWING YOUR RESPONSE":session.phase==="reflection"?"STAY WITH IT":"A THREAD TO CARRY"))+'</div>';
 const memory=relevantMemory(history,quote,session.focus);
 if(session.phase==="focus"){
   const options=focusChoices(quote,profile,history);
   return front+prefix+'<h2 class="yl-living-title">'+esc(thread.question)+'</h2>'+
     '<p class="yl-living-sub">What part of your life, or the world around you, does this bring to mind?</p>'+
     '<div class="yl-living-options">'+options.map(x=>button("focus:"+x.id,x.label)).join("")+'</div>'+
     '<p class="yl-living-fine">This is a direction, not a label about you. You can change it later.</p></div>';
 }
 const personal=threadContext(quote,id,profile,session.focus,history);
 if(!personal)return front+prefix+'<p>The next connection is not ready yet.</p></div>';
 const sourceNote=exploreFor(quote,id)?.insight||"";
 if(session.phase==="mirror"){
   return front+prefix+'<h2 class="yl-living-title">'+esc(personal.insight)+'</h2>'+
     (memory?'<div class="yl-living-memory">Earlier, you left this question open: “'+esc(memory.question)+'”</div>':"")+
     '<p class="yl-living-sub">Does this feel close to what you were thinking?</p>'+
     '<div class="yl-living-options">'+Object.entries(REACTIONS).map(([k,v])=>button(k,v)).join("")+'</div></div>';
 }
 const branches=thread.branches||[];
 if(session.phase==="response"){
   const branch=session.reaction==="unsure"?branches[0]:session.reaction==="turn"?branches[2]:branches[1];
   const lead=session.reaction==="close"?"You saw something of your own experience in that thought.":
     session.reaction==="unsure"?"You weren't convinced, and that matters. The first interpretation might not fit your experience.":
     "You'd rather look from another side. That can change which part of the idea matters most.";
   return front+prefix+'<p class="yl-living-ack">'+esc(lead)+'</p>'+
     '<h2 class="yl-living-title">'+esc(branch?.title||personal.reflection)+'</h2>'+
     '<p class="yl-living-sub">'+esc(branch?.followup||personal.reflection)+'</p>'+
     '<div class="yl-living-options">'+button("continue","Follow this question","yl-living-primary")+
     (session.revision<5?button("reconsider","That's not quite my direction"):"")+'</div></div>';
 }
 if(session.phase==="reflection"){
   return front+prefix+'<h2 class="yl-living-title">'+esc(personal.reflection)+'</h2>'+
     '<p class="yl-living-sub">'+esc(personal.nudge||"You don't have to find an answer immediately.")+'</p>'+
     '<label class="yl-living-label" for="yl-living-note">A thought you'd like to remember? <span>(optional)</span></label>'+
     '<textarea id="yl-living-note" class="yl-living-textarea" maxlength="240" rows="2" placeholder="One sentence is enough.">'+esc(session.note)+'</textarea>'+
     '<p class="yl-living-fine">Your words stay on this device until you explicitly sync them.</p>'+
     '<div class="yl-living-options">'+button("carry","Carry this question forward","yl-living-primary")+
     (session.revision<5?button("reconsider","Explore a different direction"):"")+'</div></div>';
 }
 const standpoint=session.reaction==="unsure"?"You questioned an interpretation rather than accepting it.":
    session.reaction==="turn"?"You looked for an alternative interpretation.":"You found something that resonated, without declaring it a fixed belief.";
 return front+prefix+'<h2 class="yl-living-title">'+esc(session.phase==="done"?"This thought can return.":"Here's where your curiosity has led.")+'</h2>'+
   '<p class="yl-living-sub">'+esc(standpoint)+'</p>'+
   '<div class="yl-living-recap"><strong>'+esc(CONCERNS[session.focus]?.label||"A new direction")+'</strong>'+
   '<p>'+esc(personal.reflection)+'</p>'+
   (session.note?'<blockquote>“'+esc(session.note)+'”</blockquote>':"")+'</div>'+
   '<p class="yl-living-fine">'+esc(session.phase==="done"?"Your question is now part of your Encounter history.":"This can become a thread we return to when another quote connects.")+'</p>'+
   '<div class="yl-living-options">'+(session.phase==="summary"?button("save","Keep this thread","yl-living-primary"):button("restart","Explore this again","yl-living-primary"))+
   button("close","Return to Encounter")+'</div></div>';
}
