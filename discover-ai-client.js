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
export function aiConversationHtml({quote,conversation,available,authenticated}){
 const c=conversation;
 if(!available)return "";
 let html='<section class="yl-ai-experiment" aria-label="AI-assisted philosophical Discover">'+
 '<div class="yl-ai-eyebrow"><span aria-hidden="true">✧</span> LIVING DIALOGUE · EXPERIMENTAL</div>';
 if(!authenticated)return html+'<p>Sign in through your profile to try the AI-assisted conversation. The original Discover remains available without an account.</p></section>';
 if(!c.consent)return html+
   '<h2 class="yl-ai-title">What if we followed your curiosity instead of a script?</h2>'+
   '<p>A small AI model can respond to what you actually say, challenge an assumption, and remember where the conversation was heading.</p>'+
   '<p>To do that, it would send this quotation, your new messages, and up to four relevant earlier reflections to the DeepSeek API. Do not include information you would not want shared. Nothing is sent until you agree.</p>'+
   '<button type="button" data-ai="agree" class="yl-ai-main">I agree · Start a dialogue <span aria-hidden="true">↗</span></button>'+
   '<button type="button" data-ai="cancel" class="yl-ai-secondary">Use the private, offline Discover instead</button></section>';
 html+='<p class="yl-ai-privacy">You are speaking with AI. It can be wrong about both philosophy and you. Correct it whenever it misses.</p>'+
   '<div class="yl-ai-dialogue" aria-live="polite">';
 if(!c.messages.length&&!c.loading)html+='<div class="yl-ai-intro">An unfinished thought is often more interesting than a perfect answer.</div>';
 for(const m of c.messages.slice(-12)){
  html+='<article class="yl-ai-message '+(m.role==="user"?"is-user":"is-companion")+'"><span class="yl-ai-speaker">'+(m.role==="user"?"YOU":"YOURLOGOS")+'</span><p>'+esc(m.text)+'</p>'+
  (m.role==="assistant"&&m.followUp?'<div class="yl-ai-followup">'+esc(m.followUp)+'</div>':"")+'</article>';
 }
 if(c.loading)html+='<p role="status" class="yl-ai-loading">Following your thought…</p>';
 html+='</div>';
 if(c.error)html+='<p class="yl-ai-error" role="status">'+esc(c.error)+'</p>';
 html+='<label class="yl-living-label" for="yl-ai-draft">'+(c.messages.length?"What's your response?":"What's bothering or intriguing you about this quote?")+'</label>'+
   '<textarea id="yl-ai-draft" class="yl-living-textarea" maxlength="480" rows="3" placeholder="Anything you think, including disagreement…">'+esc(c.draft)+'</textarea>'+
   '<button type="button" data-ai="send" class="yl-ai-main"'+(c.loading?' disabled':'')+'>'
   +(c.messages.length?"Continue the conversation":"Start with this thought")+' <span aria-hidden="true">↗</span></button>'+
   '<button type="button" data-ai="save" class="yl-ai-secondary"'+(!c.messages.some(x=>x.role==="assistant")?' disabled':'')+'>Keep this conversation in My World</button>'+
   '<button type="button" data-ai="revoke" class="yl-ai-secondary">Stop AI and return to offline Discover</button></section>';
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
