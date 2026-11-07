/* YourLogos — illustrated first visit, real email sign-in and non-destructive QA replay.
   First-visit data stays in this browser until users explicitly sync their account.
   QA replay neither edits the profile nor changes the authenticated session. */
import { AUTH_ENABLED, requestMagicLink, getVerifiedIdentity } from "./auth-client.js";

const STORAGE="yourlogos_web_v1", FLAG="yourlogos-introduction-v1";
const DEV_PREVIEW="yourlogos-developer-preview-v1";
const root=document.getElementById("yl-onboarding");
const slider=document.getElementById("yl-entrance");
const app=document.getElementById("app");
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const categories={
 identity:{label:"Self & identity",prompt:"Who am I becoming?",sub:"Identity, freedom, and the person I am becoming.",concern:"identity",name:"Socrates",theme:"Meaning",
 quote:"The unexamined life is not worth living.",source:"Plato, Apology",explanation:"Socrates invites us to examine the assumptions behind the way we live."},
 knowledge:{label:"Truth & knowledge",prompt:"What can I really know?",sub:"Evidence, certainty, and what makes a belief trustworthy.",concern:"uncertainty",name:"René Descartes",theme:"Doubt",
 quote:"I think, therefore I am.",source:"Discourse on Method, Part IV",explanation:"Descartes begins by questioning what he can know for certain."},
 ethics:{label:"Ethics & action",prompt:"How should I live?",sub:"Values, choices, and what we owe to others.",concern:"fairness",name:"Marcus Aurelius",theme:"Action",
 quote:"Waste no more time arguing about what a good man should be. Be one.",source:"Meditations, 10.16",explanation:"Marcus Aurelius asks what it means to turn a principle into action."}
};
const approaches={
 facts:{label:"Look for the facts",sub:"What do I know, and what am I assuming?",approach:"facts",insight:"Start with the evidence, then consider what evidence alone cannot decide.",contrast:"A contrasting view asks whether some choices require principles beyond the facts."},
 principles:{label:"Ask what is right",sub:"Which principle should guide my choice?",approach:"reflect",insight:"Start with the principle that matters, then examine its limits.",contrast:"A contrasting view asks what happens when principles meet real consequences."},
 consequences:{label:"Consider the outcome",sub:"What might happen if I act?",approach:"act",insight:"Begin with possible consequences, then question whether outcomes are everything.",contrast:"A contrasting view asks whether some duties matter even when the result is uncertain."},
 people:{label:"Think of those affected",sub:"Who will this decision matter to?",approach:"talk",insight:"Begin with the people involved and the claims they have on you.",contrast:"A contrasting view asks how care for particular people relates to fairness for everyone."}
};
const painting="/api/school-art/onboarding";
const hasRealHistory=s=>{
 const d=new Date(),today=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
 const oldPractice=s?.practice&&typeof s.practice==="object"?s.practice:{};
 const earlierPractice=Object.keys(oldPractice).some(day=>day!==today);
 return Boolean(s&&(s.personalization?.status==="completed"||s.personalization?.status==="skipped"||
   localStorage.getItem("yourlogos-daily-ritual-v1")||earlierPractice||
   s.started||s.localName||(s.saved||[]).length||(s.arrivals||[]).length||
   (s.encounterEvents||[]).length||(s.thoughtThreadEvents||[]).length));
};
function readData(){try{return JSON.parse(localStorage.getItem(STORAGE)||"{}")||{}}catch{return {}}}
if(root){
 let page=0,topic=null,reason=null,loginNotice="",busy=false,replay=false,opened=false,fromPage=0;
 function lock(){slider?.setAttribute("inert","");app?.setAttribute("inert","");root.hidden=false;opened=true;document.body.classList.add("yl-intro-active")}
 function unlock(){root.hidden=true;root.replaceChildren();slider?.removeAttribute("inert");app?.removeAttribute("inert");document.body.classList.remove("yl-intro-active");opened=false}
 // Ensure welcome.js has registered its entrance listener before the first auto-redirect.
 function goToDashboard(){
   const send=()=>window.dispatchEvent(new Event("yourlogos:skip-entrance"));
   if(document.readyState==="complete")send();
   else window.addEventListener("load",send,{once:true});
 }
 function currentCategory(){return categories[topic]||categories.identity}
 function currentApproach(){return approaches[reason]||approaches.facts}
 function header(){return '<header class="yl-v2-top"><button type="button" data-step="back" aria-label="Go back" class="yl-v2-back">'+(page===0?"":"‹")+'</button>'+
 '<div class="yl-v2-bars" aria-label="Introduction progress">'+[0,1,2].map((n)=>'<i class="'+(n<=Math.min(page,2)?"on":"")+'"></i>').join("")+'</div>'+
 '<button class="yl-v2-quiet" type="button" data-step="skip">'+(replay?"Close":"Skip")+'</button></header>'}
 function action(label,enabled=true){return '<button type="button" class="yl-v2-action" data-step="next" '+(enabled?"":"disabled")+'>'+label+' <span aria-hidden="true">→</span></button>'}
 const picture=(alt,extra="",src=painting)=>'<div class="yl-v2-picture '+extra+'"><img alt="'+safe(alt)+'" src="'+src+'" loading="eager" onerror="this.style.opacity=0"/><div class="yl-v2-picture-caption">PHILOSOPHY IN EVERYDAY LIFE</div></div>';
 function intro(){return picture("Classical landscape with ancient architecture and natural light","yl-v2-first-picture")+
 '<div class="yl-v2-kicker">WHY YOURLOGOS</div><h1 class="yl-v2-title">Discover the <em>PHILOSOPHER</em> in you.</h1>'+
 '<div class="yl-v2-invitation"><p class="yl-v2-wonder">Have you ever wondered—</p>'+
 '<p class="yl-v2-questions">Who am I?<br>What can I know?<br>What makes a good life?</p>'+
 '<p class="yl-v2-begun">Then you’ve already begun.</p>'+
 '<p class="yl-v2-meaning">YourLogos connects your questions with thinkers who explored them—and helps you develop a perspective of your own.</p></div>'+
 '<div class="yl-v2-journey">'+[['◇','Discover','Find a question that matters to you.'],['✧','Encounter','See how a philosopher approaches it.'],['↗','Deepening','Develop your own point of view.']].map(v=>
 '<div class="yl-v2-journey-row"><span>'+v[0]+'</span><div><strong>'+v[1]+'</strong><small>'+v[2]+'</small></div></div>').join("")+'</div>'+
 action("Choose a question")+
 (replay?'':'<button type="button" data-step="signin" class="yl-v2-signin-link">Already have an account? <strong>Sign in</strong></button>')}
 function choice(){return '<div class="yl-v2-kicker">YOUR CURIOSITY</div><h1 class="yl-v2-title">What would you like to explore first?</h1>'+
 '<p class="yl-v2-lede">Choose the question that interests you most today.</p>'+
 '<div class="yl-v2-options">'+Object.entries(categories).map(([k,v])=>'<button type="button" class="yl-v2-choice '+(k===topic?"selected":"")+'" data-topic="'+k+'" aria-pressed="'+(k===topic)+'"><img class="yl-v2-thumb" alt="" src="/api/school-art/'+({identity:"existentialism",knowledge:"skepticism",ethics:"stoicism"}[k])+'" loading="lazy" onerror="this.style.opacity=0"/><span><strong>'+v.label+'</strong><small>'+v.prompt+'</small></span><span class="yl-v2-check">'+(k===topic?"✓":"○")+'</span></button>').join("")+'</div>'+
 '<p class="yl-v2-hint">You can explore every direction later.</p>'+action("Continue",Boolean(topic))}
 function instinct(){return picture("A contemplative figure in a mountainous landscape","yl-v2-small-picture","/api/school-art/existentialism")+
 '<div class="yl-v2-kicker">YOUR FIRST INSTINCT</div><h1 class="yl-v2-title">You have a difficult decision to make. What would you consider first?</h1>'+
 '<p class="yl-v2-lede">Choose the starting point that feels most natural.</p>'+
 '<div class="yl-v2-options yl-v2-reasons">'+Object.entries(approaches).map(([k,v])=>'<button type="button" class="yl-v2-choice '+(k===reason?"selected":"")+'" data-reason="'+k+'" aria-pressed="'+(k===reason)+'"><span><strong>'+v.label+'</strong><small>'+v.sub+'</small></span><span class="yl-v2-check">'+(k===reason?"✓":"○")+'</span></button>').join("")+'</div>'+action("See my starting point",Boolean(reason))}
 function result(){const c=currentCategory(),a=currentApproach();return '<div class="yl-v2-result-art">'+picture("A classical painting suggesting a journey of inquiry","yl-v2-result-picture")+'<img class="yl-v2-result-pet" src="/little-logo-hd-v2.jpg" alt="Little Logo, your companion"/></div>'+
 '<div class="yl-v2-kicker">A THOUGHT TO BEGIN WITH</div><h1 class="yl-v2-title">Meet '+safe(c.name)+'.</h1><p class="yl-v2-lede">'+safe(c.explanation)+'</p>'+
 '<blockquote class="yl-v2-quote"><p>“'+safe(c.quote)+'”</p><footer>'+safe(c.source)+'</footer></blockquote>'+
 '<div class="yl-v2-result-note"><strong>Why this thought?</strong><p>'+safe(a.insight)+'</p><p class="yl-v2-counter">'+safe(a.contrast)+'</p></div>'+
 action(replay?"Return to YourLogos":"Begin my first Encounter")+
 (replay?'':'<p class="yl-v2-hint">You can save your journey later from Settings.</p>')}
 function login(){return '<div class="yl-v2-login-mark">λ</div><div class="yl-v2-kicker">YOUR SPACE, READY WHEN YOU ARE</div>'+
 '<h1 class="yl-v2-title">Welcome back.</h1><p class="yl-v2-lede">Return to your questions and the ideas you’ve been exploring.</p>'+
 '<form class="yl-v2-login-form" id="yl-v2-login-form">'+
 '<label for="yl-v2-email">EMAIL ADDRESS</label><input name="email" id="yl-v2-email" type="email" autocomplete="email" required placeholder="you@example.com" '+(busy?"disabled":"")+'/>'+
 '<button type="submit" '+(busy||!AUTH_ENABLED?"disabled":"")+'>'+ (busy?"Sending…":"Send me a sign-in link")+' →</button></form>'+
 (!AUTH_ENABLED?'<p class="yl-v2-auth-msg" role="status">Account sign-in is not configured on this deployment yet. You can still explore without an account.</p>':"<p class='yl-v2-hint'>No password needed. We’ll email you a secure sign-in link.</p>")+
 (loginNotice?'<p class="yl-v2-auth-msg" role="status">'+safe(loginNotice)+'</p>':"")+
 '<button class="yl-v2-developer-entry" type="button" data-step="developer-preview">Enter developer preview <span aria-hidden="true">→</span></button>'+
 '<p class="yl-v2-developer-hint">No credentials needed. Opens a local preview on this device; it does not sign in to an account or unlock private data.</p>'+
 '<button class="yl-v2-login-guest" type="button" data-step="return">← Back to exploring</button>'}
 function paint(){
   if(!opened)return;
   root.innerHTML='<div class="yl-v2-shell"><div class="yl-v2-panel">'+header()+
    '<main class="yl-v2-main" id="yl-v2-main">'+(page==="login"?login():page===0?intro():page===1?choice():page===2?instinct():result())+'</main>'+
    '<p class="yl-v2-foot">'+(replay?"Preview mode · Your saved answers will not change.":"Your first questions are yours to explore.")+'</p></div></div>';
 }
 function finish(skipped=false){
   if(!replay){
     const c=currentCategory(),a=currentApproach();
     const profile={version:2,status:skipped?"skipped":"completed",completedAt:new Date().toISOString(),
       answers:{concerns:skipped?[]:[c.concern],approach:skipped?"unsure":a.approach,tension:"unsure",style:"surprise"},
       startingPoint:skipped?null:{topic,reason,theme:c.theme,author:c.name,quote:c.quote}};
     try{const current=readData();localStorage.setItem(STORAGE,JSON.stringify({...current,personalization:profile}));localStorage.setItem(FLAG,"done")}catch{}
     window.dispatchEvent(new CustomEvent("yourlogos:onboarding-complete",{detail:{profile,previewQuote:skipped?null:{author:c.name,quote:c.quote,theme:c.theme}}}));
   }
   unlock();
   if(!replay&&!skipped)goToDashboard();
 }
 function open(isReplay=false){replay=isReplay;topic=null;reason=null;page=0;fromPage=0;loginNotice="";busy=false;lock();paint()}
 function goBack(){if(page==="login"){page=fromPage;loginNotice=""}else if(page>0)page--;paint()}
 root.addEventListener("click",e=>{
   const el=e.target instanceof Element?e.target.closest("button"):null;if(!el)return;
   if(el.dataset.topic&&Object.hasOwn(categories,el.dataset.topic)){topic=el.dataset.topic;paint();return}
   if(el.dataset.reason&&Object.hasOwn(approaches,el.dataset.reason)){reason=el.dataset.reason;paint();return}
   switch(el.dataset.step){
    case"back":goBack();break;
    case"skip":if(replay)unlock();else finish(true);break;
    case"next":if(page===3){finish(false);break}if(page===1&&!topic||page===2&&!reason)return;page++;paint();break;
    case"signin":fromPage=page;page="login";paint();break;
    case"developer-preview":{
      try{
        localStorage.setItem(DEV_PREVIEW,"on");
        // Browser preference only — not an identity or authorization token.
        localStorage.setItem(FLAG,"done");
      }catch{}
      unlock();goToDashboard();break;
    }
    case"return":page=fromPage;paint();break;
   }
 });
 root.addEventListener("submit",async e=>{
   if(e.target?.id!=="yl-v2-login-form")return;e.preventDefault();
   if(!AUTH_ENABLED)return;
   const email=String(new FormData(e.target).get("email")||"").trim();
   if(!email)return;
   busy=true;loginNotice="";paint();
   try{await requestMagicLink(email,"");loginNotice="Check your inbox for your secure sign-in link. Once verified, you can return directly to YourLogos."}
   catch(error){loginNotice=String(error?.message||"Sign-in link could not be sent. Please try again.")}
   finally{busy=false;paint()}
 });
 // Replay is available from Settings to all visitors, without login or URL flags.
 window.addEventListener("yourlogos:onboarding-replay",()=>open(true));
 // Leaving local preview offers the sign-in screen, without deleting account or guest data.
 window.addEventListener("yourlogos:developer-signin",()=>{open(true);page="login";fromPage=0;paint()});
 // Prior visits bypass the new introduction; an existing five-step profile is not reset.
 const state=readData();
 const seen=!!(localStorage.getItem(FLAG)||hasRealHistory(state));
 if(!seen)open(false);
 if(localStorage.getItem(DEV_PREVIEW)==="on")goToDashboard();
 // A previously signed-in account on a new device bypasses first-time questions.
 // Never identify returning users by a guessed email or local "developer" flag.
 if(AUTH_ENABLED)getVerifiedIdentity().then(u=>{if(u&&!replay){if(opened)unlock();goToDashboard();}}).catch(()=>{});
}