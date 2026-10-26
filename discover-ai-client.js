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
// Curiosity must fit on a phone: one observation, one question, one action.
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
 let html='<section class="yl-ai-experiment yl-ai-quiet" aria-label="Discover this quotation">';
 if(!c.consent)return html+
  '<h2 class="yl-ai-title">Follow the tension?</h2>'+
  '<p class="yl-ai-consent">With your permission, DeepSeek will receive this quote, what you write, and up to four saved reflections. You can stop anytime.</p>'+
  '<button type="button" data-ai="agree" class="yl-ai-main">I agree · Continue <span aria-hidden="true">↗</span></button>'+
  '<button type="button" data-ai="cancel" class="yl-ai-secondary">Not now</button></section>';
 const recent=[...(c.messages||[])].slice(-12);
 const latest=[...recent].reverse().find(m=>m.role==="assistant");
 const user=[...recent].reverse().find(m=>m.role==="user");
 const prior=recent.slice(0,Math.max(0,recent.lastIndexOf(latest)));
 html+='<div class="yl-ai-eyebrow">A THOUGHT FOR YOU <span aria-label="AI assisted">· AI</span></div>';
 if(c.loading&&!latest)html+='<div class="yl-ai-quiet-loading" role="status">Following the thought…</div>';
 if(latest){
  html+='<div class="yl-ai-current">';
  if(user)html+='<p class="yl-ai-you">You · '+esc(cleanText(user.text,115))+'</p>';
  html+='<p class="yl-ai-observation">'+esc(shortObservation(latest.text))+'</p>';
  html+='<h2 class="yl-ai-question">'+esc(cleanText(latest.followUp,220))+'</h2></div>';
 }else if(!c.loading)html+='<h2 class="yl-ai-title">What unsettles you here?</h2>';
 if(c.loading&&latest)html+='<p class="yl-ai-loading" role="status">Thinking…</p>';
 if(prior.length>0){
  html+='<details class="yl-ai-history"><summary>Earlier thoughts · '+prior.length+'</summary><div class="yl-ai-history-inside">';
  for(const m of prior){
   html+='<p><small>'+esc(m.role==="user"?"YOU":"YOURLOGOS")+'</small> '+esc(cleanText(m.text,420))+'</p>';
  }
  html+='</div></details>';
 }
 if(c.error)html+='<p class="yl-ai-error" role="status">'+esc(c.error)+'</p>'+
   '<button type="button" data-ai="cancel" class="yl-ai-secondary">Continue privately</button>';
 if(latest?.choices?.length){
  html+='<div class="yl-ai-stance-list" role="group" aria-label="Choose a direction">'+
  latest.choices.slice(0,3).map((choice,i)=>'<button type="button" data-ai-choice="'+i+'" class="yl-ai-stance"'+(c.loading?' disabled':'')+'><span>'+esc(cleanText(choice,82))+'</span><span aria-hidden="true">↗</span></button>').join('')+
  '</div>';
 }else if(!c.loading){
  html+='<div class="yl-ai-stance-list" role="group" aria-label="Choose a direction">'+
  ['I’m intrigued','I doubt it','Show me another angle'].map((label,i)=>'<button type="button" data-ai-choice="'+i+'" class="yl-ai-stance"><span>'+esc(label)+'</span><span aria-hidden="true">↗</span></button>').join('')+
  '</div>';
 }
   '<div class="yl-ai-footnotes">'+
   (latest?'<button type="button" data-ai="save" class="yl-ai-secondary">Keep this thread</button>':'')+
   '<button type="button" data-ai="revoke" class="yl-ai-secondary">Private mode</button>'+
   '</div></section>';
 return html;
}
export function aiSummary(conversation,quote,date){
 const messages=(conversation?.messages||[]).filter(x=>x&&["user","assistant"].includes(x.role)).slice(-12);
 if(!messages.some(x=>x.role==="assistant"))return null;
 const user=messages.filter(x=>x.role==="user").map(x=>cleanText(x.text,240));
 const assistant=messages.filter(x=>x.role==="assistant");
 return {id:"ai:"+conversation.quoteId+":"+date,quoteId:conversation.quoteId,
   theme:quote?.[2]||"",question:cleanText(assistant.at(-1)?.followUp||"",230),
   opening:user[0]||"",note:user.at(-1)||"",date,kind:"ai"};
}
