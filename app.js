import { SCHOOLS, schoolArtwork } from "./schools.js";
const QUOTES=[
["He who has a why to live can bear almost any how.","Friedrich Nietzsche","Meaning","Twilight of the Idols","What, if anything, gives hardship a direction?"],
["Man is the only creature who refuses to be what he is.","Albert Camus","Freedom","The Rebel","What in yourself are you refusing today?"],
["The unexamined life is not worth living.","Socrates","Meaning","Plato, Apology","What have you accepted without examination?"],
["We suffer more in imagination than in reality.","Seneca","Suffering","Letters to Lucilius","Which anticipated pain never actually arrived?"],
["Man is condemned to be free.","Jean-Paul Sartre","Freedom","Existentialism Is a Humanism","Where is freedom experienced as a burden?"],
["He who knows others is wise; he who knows himself is enlightened.","Laozi","Freedom","Dao De Jing, chapter 33 (translation varies)","What do you know about yourself that knowledge of others cannot give?"],
["It is not death that a man should fear, but he should fear never beginning to live.","Marcus Aurelius","Mortality","Meditations (translation varies)","What part of your life keeps waiting to begin?"],
["Love does not consist of gazing at each other, but in looking outward together in the same direction.","Antoine de Saint-Exupéry","Love","Wind, Sand and Stars","What shared horizon holds a relationship together?"],
["Whereof one cannot speak, thereof one must be silent.","Ludwig Wittgenstein","Doubt","Tractatus Logico-Philosophicus, 7","What might silence reveal that explanation conceals?"],
["Waste no more time arguing about what a good man should be. Be one.","Marcus Aurelius","Action","Meditations, 10.16","When does thought become a way of postponing action?"],
["All of humanity's problems stem from man's inability to sit quietly in a room alone.","Blaise Pascal","Solitude","Pensées (paraphrased translation)","What would you meet if there were nothing to distract you?"],
["Two things fill the mind with ever-increasing wonder: the starry sky above me and the moral law within me.","Immanuel Kant","Beauty","Critique of Practical Reason, conclusion (abridged translation)","What is the relation between wonder and obligation?"],
["How we spend our days is, of course, how we spend our lives.","Annie Dillard","Time","The Writing Life","What does an ordinary Tuesday reveal about your life?"],
["It is not enough to have a good mind; the main thing is to use it well.","René Descartes","Action","Discourse on Method","Where has understanding not yet become practice?"],
["Not knowing is most intimate.","Zen koan (Dizang)","Doubt","Book of Serenity","Could uncertainty be a form of intimacy?"],
["I never found the companion that was so companionable as solitude.","Henry David Thoreau","Solitude","Walden","When is being alone a kind of presence?"],
["The journey of a thousand miles begins with a single step.","Laozi","Action","Dao De Jing, chapter 64 (translation varies)","Which beginning are you making too large?"],
["The present moment is the only moment available to us, and it is the door to all moments.","Thích Nhất Hạnh","Time","Attributed; source needs verification","What does attention change about time?"],
["The strongest man in the world is he who stands most alone.","Henrik Ibsen","Solitude","An Enemy of the People (translation varies)","When is standing alone conscience, and when is it pride?"],
["The most beautiful experience we can have is the mysterious.","Albert Einstein","Beauty","The World As I See It (translation varies)","What deserves wonder instead of explanation?"]
];
const THEMES=["Meaning","Suffering","Freedom","Mortality","Love","Doubt","Action","Solitude","Beauty","Time"];
const PROMPTS={
Meaning:["Notice where your own 'why' is clear, and where it has gone quiet.","Can meaning be found, or must it be made?"],
Suffering:["Where is the pain, before you try to explain it?","Does suffering necessarily teach us anything?"],
Freedom:["What does your freedom cost, and who pays it?","How much of your choosing is shaped by what you did not choose?"],
Mortality:["Imagine encountering this on your final morning.","Does death give life urgency—or distort it?"],
Love:["Let one person come to mind without trying to resolve anything.","Is love a commitment to the other, or a need of the self?"],
Doubt:["Let an unanswered question remain unanswered for a while.","When does doubt sharpen thought, and when does it excuse inaction?"],
Action:["Carry one small possibility into your day.","Is activity ever a way of avoiding understanding?"],
Solitude:["Notice what remains when you stop performing.","When is solitude freedom, and when is it retreat?"],
Beauty:["Recall something that stopped you in your tracks.","Is beauty discovered in things or made by those who see?"],
Time:["Notice one moment without trying to preserve it.","Does attending to the present evade the past and future?"]
};
const KEY="yourlogos_web_v1";
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return {}}};
let data=load();if(!data.themes)data.themes=[];if(!data.saved)data.saved=[];if(!data.practice)data.practice={};
let view="today",detailId=null,selectedTheme="All",mode=null,toastTimeout=null;
let quoteCursor=0,libraryScope="all",discoverOpen=false,swipeBusy=false,navFrom=0,navPulse=null,heartPulse=false,openSchoolId=null;
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const dayIndex=()=>{let d=new Date();return Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(2026,0,1))/86400000)};
const pick=()=>{const n=dayIndex(),favorite=data.themes.length?QUOTES.map((q,i)=>({q,i})).filter(x=>data.themes.includes(x.q[2])):[];const all=QUOTES.map((q,i)=>({q,i}));const pool=n%10<3||!favorite.length?all:favorite;return pool[((n%pool.length)+pool.length)%pool.length].i};
const activeQuote=()=>{const d=today();if(Number.isInteger(data.practice[d]?.quoteId)&&QUOTES[data.practice[d].quoteId])return data.practice[d].quoteId;return pick()};
const persist=()=>localStorage.setItem(KEY,JSON.stringify(data));
const mark=()=>{const d=today();if(!data.practice[d])data.practice[d]={quoteId:activeQuote(),posture:null};return data.practice[d]};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const svg=(name)=>{let paths={today:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',library:'<path d="M3 4h8v16H3zM13 4h8v16h-8z"/>',saved:'<path d="M5 3h14v18l-7-4-7 4z"/>',profile:'<circle cx="12" cy="8" r="4"/><path d="M4 22c0-6 16-6 16 0"/>',share:'<path d="M12 16V3m-4 4 4-4 4 4M5 13v8h14v-8"/>',back:'<path d="m14 5-7 7 7 7"/>',spark:'<path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7z"/>'};return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(paths[name]||"")+'</svg>'};
const btn=(id,label,cls="")=>'<button type="button" class="'+cls+'" data-action="'+id+'">'+label+'</button>';

const navs=[["today","Encounter"],["library","Library"],["profile","Constellation"]];
const dockIcons={
 today:'<svg viewBox="0 0 32 32" aria-hidden="true"><g class="quote-glyph"><path d="M14 6.5C8.5 9 6 13.3 6 19v5.5h8V17H9.5c.5-3.2 2.1-5.6 4.5-7.1M28 6.5C22.5 9 20 13.3 20 19v5.5h8V17h-4.5c.5-3.2 2.1-5.6 4.5-7.1"/></g></svg>',
 library:'<svg viewBox="0 0 32 32" aria-hidden="true"><g class="backpage"><path d="M7 8V5.8C7 4.3 8.3 3 9.8 3H24c1.7 0 3 1.3 3 3v18"/></g><g class="frontpage"><rect x="5" y="8" width="18" height="21" rx="2.5"/><path d="M9.5 14h9M9.5 18h9M9.5 22h5.5"/></g></svg>',
 profile:'<svg viewBox="0 0 32 32" aria-hidden="true"><g class="star-lines"><path d="M7 10.5 17.5 5l8.5 8.5-6 12-13.5-3.5L7 10.5 26 13.5M17.5 5 20 25.5M7 10.5 20 25.5"/></g><circle class="star-one" cx="7" cy="10.5" r="2.5" fill="currentColor"/><circle class="star-two" cx="17.5" cy="5" r="2" fill="currentColor"/><circle class="star-three" cx="26" cy="13.5" r="2.5" fill="currentColor"/><circle class="star-four" cx="20" cy="25.5" r="2.5" fill="currentColor"/><circle cx="6.5" cy="22" r="1.5" fill="currentColor" stroke="none"/></svg>'
};
const navHtml=(compact=false)=>navs.map(([n,label])=>'<button type="button" aria-label="'+label+'" title="'+label+'" data-view="'+n+'" class="'+(compact?'dock-btn':'nav-btn')+(view===n?' active':'')+(navPulse===n?' icon-moving':'')+'">'+dockIcons[n]+(compact?'':'<span>'+label+'</span>')+'</button>').join("");
const daySequence=()=>{
  const featured=activeQuote();
  const rest=QUOTES.map((q,i)=>({id:i,theme:q[2]})).filter(x=>x.id!==featured);
  // Stable shuffle; intentionally mix unfamiliar themes alongside familiar ones.
  let seed=((dayIndex()+100001)*2654435761)>>>0;
  const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  for(let i=rest.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]]}
  const arranged=[],lastTheme=new Set();
  while(rest.length){let index=rest.findIndex(x=>!lastTheme.has(x.theme));if(index<0)index=0;const [next]=rest.splice(index,1);arranged.push(next.id);lastTheme.clear();lastTheme.add(next.theme)}
  return [featured,...arranged];
};
const visibleQuoteId=()=>daySequence()[Math.max(0,Math.min(quoteCursor,QUOTES.length-1))];
const likedIcon=(liked)=>'<svg class="heart-svg" viewBox="0 0 40 40" aria-hidden="true"><path class="heart-path" d="M20 34C14.5 29.3 4 22 4 13.6 4 5 14.4 3.6 20 10.3 25.6 3.6 36 5 36 13.6 36 22 25.5 29.3 20 34Z"/></svg>'+Array.from({length:7},(_,i)=>{const angle=(i*2*Math.PI)/7;return '<i class="heart-spark" style="--dx:'+Math.round(Math.sin(angle)*34)+'px;--dy:'+Math.round(-Math.cos(angle)*34)+'px;--delay:'+(i%3)*20+'ms"></i>'}).join('');
const compassIcon='<svg viewBox="0 0 40 40" aria-hidden="true"><circle class="compass-ring" cx="20" cy="20" r="16"/><g class="compass-needle"><path d="M26.3 13.7 22.3 22.3 13.7 26.3 17.7 17.7Z"/><circle cx="20" cy="20" r="1.2" fill="currentColor" stroke="none"/></g></svg>';
const haptic=()=>{try{navigator.vibrate?.(8)}catch{}};

const toast=msg=>{document.querySelector(".toast")?.remove();const el=document.createElement("div");el.className="toast";el.textContent=msg;document.body.appendChild(el);clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.remove(),2800)};
const quoteBlock=(id)=>{const q=QUOTES[id];return '<div class="today-label">A THOUGHT FOR TODAY</div><h1 class="quote">“'+esc(q[0])+'”</h1><div class="author">— '+esc(q[1])+'</div><div class="source">'+esc(q[3])+'</div>'};
function sitHtml(q,p){return '<section class="practice"><div class="kicker">01 / DWELLING</div><h2>'+esc(PROMPTS[q[2]][0])+'</h2><p>You need not resolve it now. Carry it through the day. Return when something stays.</p><div class="inline-actions">'+btn("sit-return","What stayed?","outline")+'</div>'+(mode==="sit-return"||p.whatStayed?'<label class="section-kicker" style="display:block;margin-top:27px">WHAT STAYED WITH YOU?</label><textarea id="trace" placeholder="One sentence is enough. You can leave this unanswered." maxlength="1200">'+esc(p.whatStayed||"")+'</textarea><div class="inline-actions">'+btn("save-trace","Keep this trace","primary small")+'</div>':"")+'</section>'}
function questionHtml(q,p){let opts=[["Receive","The thought offers an insight worth defending."],["Resist","The thought conceals an assumption I cannot accept."],["Reframe","The real question lies beyond this opposition."]];let voices=[["In its defense","What experience makes this claim compelling?"],["Against it","Whose life or experience might contradict it?"]];return '<section class="practice"><div class="kicker">02 / THE DIALECTIC</div><h2>'+esc(PROMPTS[q[2]][1])+'</h2><p>A philosophical proposition is not a command. Put it under pressure.</p><div style="margin-top:23px">'+voices.map(v=>'<div class="countervoice"><div class="name">'+esc(v[0])+'</div><p>'+esc(v[1])+'</p></div>').join('')+'</div><h2 style="margin-top:29px">Where do you stand?</h2><p class="hintline">Choose a provisional position. You can change your mind.</p>'+opts.map((o,i)=>'<button class="stance '+(p.position===i?"selected":"")+'" data-position="'+i+'"><b>'+esc(o[0])+'</b><span>'+esc(o[1])+'</span></button>').join('')+(p.position!==undefined&&p.position!==null?'<div class="saved-note">Position recorded. Your thinking can change.</div>':"")+'</section>'}

function todayHtml(){
  const id=visibleQuoteId(),q=QUOTES[id],liked=data.saved.includes(id);
  return '<article class="today today-v2">'+
    '<div class="quote-viewport" id="quote-viewport" tabindex="0" aria-label="Quotes. Swipe up or down, or use arrow keys, to browse ideas.">'+
      '<div class="quote-halo" aria-hidden="true"></div>'+
      '<div class="quote-motion" id="quote-motion">'+
      '<div class="today-label">'+(quoteCursor===0?"TODAY’S THOUGHT":"ANOTHER PERSPECTIVE")+'</div>'+
      '<div class="quote-rule"></div><h1 class="quote">“'+esc(q[0])+'”</h1><div class="author">— '+esc(q[1])+'</div>'+
      '<div class="quote-theme">'+esc(q[2]).toUpperCase()+'</div></div>'+
      '<div class="quote-dots" aria-hidden="true">'+daySequence().slice(0,6).map((_,i)=>'<i class="'+(i===Math.min(quoteCursor,5)?"on":"")+'"></i>').join('')+'</div>'+
    '</div>'+
    '<div class="quote-footer"><div class="swipe-cue">↑ &nbsp; SWIPE FOR ANOTHER THOUGHT</div>'+
    '<div class="quote-actions">'+
      '<button type="button" aria-label="'+(liked?"Unlike":"Like")+' this quote" aria-pressed="'+liked+'" data-action="toggle-save" class="icon-action heart-button'+(liked?" liked":"")+(heartPulse?" heart-pop":"")+'">'+likedIcon(liked)+'<span>'+(liked?"Liked":"Like")+'</span></button>'+
      '<button type="button" aria-label="Discover this philosophical idea" data-action="discover" class="icon-action discover-button'+(discoverOpen?' spinning':'')+'">'+compassIcon+'<span>Discover</span></button>'+
    '</div></div></article>';
}
function discoverHtml(){
  const id=visibleQuoteId(),q=QUOTES[id],prompt=PROMPTS[q[2]]?.[1]||"What could challenge this thought?";
  return '<div class="discover-cover" data-action="close-discover"></div><section class="discover-sheet" role="dialog" aria-modal="true" aria-label="Discover this idea">'+
    '<div class="sheet-handle"></div><div class="sheet-head"><span>ANOTHER WAY TO SEE IT</span><button type="button" data-action="close-discover" class="sheet-close" aria-label="Close discovery">×</button></div>'+
    '<h2>'+esc(prompt)+'</h2><p>'+esc(q[4])+'</p><div class="source-credit">— '+esc(q[1])+' · '+esc(q[3])+'</div>'+
    '<div class="discover-foot">Curiosity is enough. No answer required.</div></section>';
}

function listHtml(ids){return ids.length?ids.map(id=>'<button class="quote-card" data-detail="'+id+'"><div class="line">“'+esc(QUOTES[id][0])+'”</div><div class="meta">— '+esc(QUOTES[id][1])+' · '+esc(QUOTES[id][2])+'</div></button>').join(""):'<div class="empty">Nothing here yet. Return to today’s thought.</div>'}


function libraryHtml(){
  const current=SCHOOLS.find(s=>s.id===openSchoolId);
  if(libraryScope==="liked" && !current){
    return '<section class="view library-v3 library-liked" aria-label="Liked quotes">'+
      '<button type="button" data-library-root class="school-back" aria-label="Back to all philosophies"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7M7 12h13"/></svg>All philosophies</button>'+
      '<div class="library-v3-kicker">YOUR COLLECTION</div><h1>Thoughts kept</h1>'+
      '<p class="library-liked-sub">Quotes you have chosen to remember.</p>'+
      '<div class="library-liked-list">'+listHtml(data.saved.slice().reverse())+'</div></section>';
  }
  if(!current){
    return '<section class="view library-v3" aria-label="Philosophy library">'+
      '<div class="library-v3-intro"><div><div class="library-v3-kicker">WAYS OF SEEING</div><h1>Library</h1></div>'+
      '<button type="button" class="library-save-shortcut" data-library-liked aria-label="View liked quotes" title="Liked quotes"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5V21l-7-4-7 4V4.5Z"/></svg>'+(data.saved.length?'<span class="library-saved-count">'+data.saved.length+'</span>':'')+'</button></div>'+
      '<div class="school-grid">'+SCHOOLS.map(s=>
        '<button type="button" class="school-tile school-'+s.id+'" data-school="'+esc(s.id)+'" aria-label="Explore '+esc(s.name)+'">'+
        '<div class="school-art">'+schoolArtwork(s.id)+'</div><span class="school-name">'+esc(s.name)+'</span></button>'
      ).join('')+'</div>'+
    '</section>';
  }
  return '<section class="view library-v3 school-detail-screen" aria-label="'+esc(current.name)+'">'+
    '<div class="school-detail-scroll" id="school-detail-scroll">'+
      '<button type="button" data-school-back class="school-back" aria-label="Back to all philosophies">'+
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7M7 12h13"/></svg>All philosophies</button>'+
      '<div class="school-hero school-'+esc(current.id)+'">'+schoolArtwork(current.id)+'</div>'+
      '<h1 class="school-detail-title">'+esc(current.name)+'</h1>'+
      '<p class="school-detail-sub">'+esc(current.subtitle)+'</p>'+
      '<div class="school-section"><div class="school-section-label">THE CENTRAL QUESTION</div><h2 class="school-big-question">'+esc(current.question)+'</h2></div>'+
      '<div class="school-section"><div class="school-section-label">THE IDEA</div><p>'+esc(current.intro)+'</p></div>'+
      '<div class="school-section"><div class="school-section-label">KEY VOICES</div><div class="school-voices">'+current.thinkers.map(name=>'<span>'+esc(name)+'</span>').join('')+'</div></div>'+
      '<div class="school-section"><div class="school-section-label">CORE TENSIONS</div><div class="school-tensions">'+current.tensions.map(t=>'<div>'+esc(t)+'</div>').join('')+'</div></div>'+
      '<div class="school-section"><div class="school-section-label">A THOUGHT TO CARRY</div><div class="school-reflection">'+esc(current.reflection)+'</div><p class="school-prompt-note">No answer required. Just a place to begin.</p></div>'+
    '</div></section>';
}

function savedHtml(){return '<section class="view"><div class="section-kicker">HELD CLOSE</div><h1>Saved</h1><p class="sub">Thoughts you chose to keep.</p>'+listHtml(data.saved.slice().reverse())+'</section>'}

function profileHtml(){
  // V2 Constellation now lives inside the existing app shell.
  // The Encounter and Library views and the three-button navigation are untouched.
  return '<section class="view living-universe-embed" aria-label="Your living constellation">'+
    '<iframe id="cosmos-frame" src="/cosmos-v2.html" title="Living universe of ideas; drag space to travel and touch formations to explore" loading="eager"></iframe>'+
    '<button type="button" class="cosmos-export" data-action="export" aria-label="Export my YourLogos data">Export my data ↗</button></section>';
}

function detailHtml(){const id=detailId,q=QUOTES[id];return '<section class="view detail">'+btn("back",svg("back")+" Back","top-back")+'<div class="section-kicker" style="margin-top:35px">'+esc(q[2])+'</div><h1>“'+esc(q[0])+'”</h1><div class="author" style="text-align:left">— '+esc(q[1])+'</div><h2>Source</h2><p>'+esc(q[3])+'</p><h2>To sit with</h2><p>'+esc(PROMPTS[q[2]][0])+'</p><h2>To question</h2><p>'+esc(PROMPTS[q[2]][1])+'</p><div class="inline-actions" style="margin-top:36px">'+btn("detail-save",data.saved.includes(id)?"Remove from saved":"Save this thought","outline")+'</div></section>'}
function onboardingHtml(){return '<section class="view onboard"><div class="section-kicker" style="text-align:center;margin-bottom:24px">BEFORE WE BEGIN</div><h1>What are you searching for?</h1><p class="sub">Choose any themes that interest you, or leave them unselected. You can change this later.</p><div class="grid">'+THEMES.map(t=>'<button class="theme-card '+(data.themes.includes(t)?"selected":"")+'" data-theme="'+t+'"><b>'+t+'</b><span>'+esc(PROMPTS[t][1])+'</span></button>').join("")+'</div><div class="count">'+data.themes.length+' of 5 selected</div><div class="actions">'+btn("finish-onboarding","Return to YourLogos","primary")+'</div></section>'}

function render(){
  const onboarding=view==="onboarding"; // No compulsory onboarding: enter directly through curiosity.
  const inner=onboarding?onboardingHtml():detailId!==null?detailHtml():view==="today"?todayHtml():view==="library"?libraryHtml():profileHtml();
  const active=navs.findIndex(x=>x[0]===view),from=navFrom;
  document.getElementById("app").innerHTML='<div class="shell"><aside class="rail"><div><div class="wordmark">YourLogos<sup>✳</sup></div><div class="rail-sub">A space for curiosity.</div></div><nav class="nav">'+navHtml(false)+'</nav><div class="rail-foot"><small>PHILOSOPHY, PRACTICED</small>A thought is an invitation,<br/>not a task.</div></aside>'+
  '<main class="stage"><header class="stage-top"><div class="brand-top"><span class="mobile-brand">YourLogos ✳</span><span class="eyebrow">PHILOSOPHY, PRACTICED</span><span class="top-sub">A space for curiosity.</span></div><div class="daily-meta">'+(view==="library"?"LIBRARY":view==="profile"?"CONSTELLATION":"DAILY ENCOUNTER")+'<span>'+(view==="library"?"SCHOOLS OF THOUGHT":view==="profile"?"IN PROGRESS":String(quoteCursor+1).padStart(2,"0")+' / '+String(QUOTES.length).padStart(2,"0"))+'</span></div></header>'+inner+'</main>'+
  '<aside class="side"><div class="section-kicker">A QUIETER KIND OF FEED</div><div class="side-quote"><h3>One thought at a time.</h3><p>Swipe to encounter something new. Like what stays with you, or discover a deeper question.</p></div><div class="side-bottom"><strong>Depth, not motivation.</strong><span>YourLogos · V1</span></div></aside></div>'+
  (onboarding?'':'<nav class="mobile-tabs"><div class="dock-glass" style="--dock-active:'+(active<0?0:active)+';--dock-from:'+from+'"><div class="dock-indicator"></div>'+navHtml(true)+'</div></nav>')+
  (discoverOpen && !onboarding?discoverHtml():'');
  const currentDock=document.querySelector(".dock-glass");
  if(currentDock && active>=0 && from!==active){
    currentDock.style.setProperty("--dock-active",String(from));
    requestAnimationFrame(()=>requestAnimationFrame(()=>{if(currentDock.isConnected)currentDock.style.setProperty("--dock-active",String(active))}));
  }
  if(view==="today"&&!onboarding&&detailId===null)bindQuoteGesture();
}
function bindQuoteGesture(){
  const area=document.getElementById("quote-viewport"),card=document.getElementById("quote-motion");
  if(!area||!card)return;
  let start=null;
  area.addEventListener("pointerdown",e=>{if(discoverOpen||swipeBusy)return;start={id:e.pointerId,y:e.clientY,t:performance.now(),dy:0};try{area.setPointerCapture(e.pointerId)}catch{};card.style.transition="none"});
  area.addEventListener("pointermove",e=>{if(!start||e.pointerId!==start.id)return;start.dy=e.clientY-start.y;const dy=Math.sign(start.dy)*Math.min(100,Math.abs(start.dy)*.4);card.style.transform="translateY("+dy+"px) scale("+(1-Math.min(.05,Math.abs(start.dy)*.0002))+")";card.style.opacity=String(1-Math.min(.3,Math.abs(start.dy)*.0015))});
  const finish=(e,cancelled=false)=>{if(!start||e.pointerId!==start.id)return;const dist=start.dy,speed=Math.abs(dist)/Math.max(1,performance.now()-start.t);start=null;if(!cancelled&&(Math.abs(dist)>67||(Math.abs(dist)>30&&speed>.57)))moveQuote(dist<0?1:-1);else{card.style.transition="transform .52s cubic-bezier(.18,1.24,.35,1),opacity .25s";card.style.transform="translateY(0) scale(1)";card.style.opacity="1"}};
  area.addEventListener("pointerup",e=>finish(e));
  area.addEventListener("pointercancel",e=>finish(e,true));
  area.addEventListener("wheel",e=>{e.preventDefault();if(swipeBusy||discoverOpen)return;if(Math.abs(e.deltaY)>22)moveQuote(e.deltaY>0?1:-1)},{passive:false});
  area.addEventListener("keydown",e=>{if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();moveQuote(e.key==="ArrowDown"?1:-1)}});
}
function moveQuote(direction){
  if(swipeBusy||discoverOpen||view!=="today"||detailId!==null)return;
  swipeBusy=true;
  const card=document.getElementById("quote-motion"),out=direction>0?-160:160;
  if(!card){swipeBusy=false;return}
  haptic();card.style.transition="transform .2s cubic-bezier(.3,0,.7,.4),opacity .2s";
  card.style.transform="translateY("+out+"px) scale(.93)";card.style.opacity=".08";
  setTimeout(()=>{
    quoteCursor=(quoteCursor+direction+QUOTES.length)%QUOTES.length;
    heartPulse=false;render();
    const incoming=document.getElementById("quote-motion");
    if(incoming){
      incoming.style.transition="none";incoming.style.transform="translateY("+(-out)+"px) scale(.94)";incoming.style.opacity=".2";
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        incoming.style.transition="transform .6s cubic-bezier(.18,1.11,.32,1),opacity .35s";
        incoming.style.transform="translateY(0) scale(1)";incoming.style.opacity="1";
      }));
    }
    setTimeout(()=>{swipeBusy=false},640);
  },200);
}


document.addEventListener("click",async e=>{
  const v=e.target.closest("[data-view]");
  if(v){navFrom=Math.max(0,navs.findIndex(x=>x[0]===view));if(v.dataset.view==="library"){openSchoolId=null;libraryScope="all"}view=v.dataset.view;navPulse=view;detailId=null;discoverOpen=false;render();haptic();setTimeout(()=>{navPulse=null},750);return}
  const school=e.target.closest("[data-school]");if(school){const candidate=school.dataset.school;if(SCHOOLS.some(x=>x.id===candidate)){openSchoolId=candidate;render();document.getElementById("school-detail-scroll")?.scrollTo(0,0)}return}
  const schoolBack=e.target.closest("[data-school-back]");if(schoolBack){openSchoolId=null;render();return}
  if(e.target.closest("[data-library-liked]")){openSchoolId=null;libraryScope="liked";render();return}
  if(e.target.closest("[data-library-root]")){libraryScope="all";openSchoolId=null;render();return}
  const th=e.target.closest("[data-theme]");
  if(th){const t=th.dataset.theme;data.themes=data.themes.includes(t)?data.themes.filter(x=>x!==t):data.themes.length<5?[...data.themes,t]:data.themes;persist();render();return}
  const fil=e.target.closest("[data-filter]");if(fil){selectedTheme=fil.dataset.filter;render();return}
  const scope=e.target.closest("[data-scope]");if(scope){libraryScope=scope.dataset.scope;render();return}
  const de=e.target.closest("[data-detail]");if(de){detailId=Number(de.dataset.detail);render();return}
  const b=e.target.closest("[data-action]");if(!b)return;const a=b.dataset.action;
  switch(a){
    case"finish-onboarding":data.started=true;view="today";break;
    case"edit-themes":view="onboarding";break;
    case"toggle-save":case"detail-save":{
      const id=a==="detail-save"?detailId:visibleQuoteId(),already=data.saved.includes(id);
      data.saved=already?data.saved.filter(x=>x!==id):[...data.saved,id];
      heartPulse=!already;haptic();persist();render();toast(already?"Removed from your library":"A thought worth keeping");
      if(heartPulse)setTimeout(()=>{heartPulse=false},620);
      return;
    }
    case"discover":discoverOpen=true;haptic();render();document.querySelector(".sheet-close")?.focus();return;
    case"close-discover":discoverOpen=false;render();document.querySelector('[data-action="discover"]')?.focus();return;
    case"back":detailId=null;break;
    case"export":{
      const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),link=document.createElement("a");
      link.href=url;link.download="yourlogos-practice.json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);toast("Practice exported");return;
    }
  }
  persist();render();
});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&discoverOpen){discoverOpen=false;render()}});

render();if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));