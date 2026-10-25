/* YourLogos first-visit introduction: a short, one-time conversation before
   the existing entrance slider. No login or AI API required.
   Onboarding data stays local until the user explicitly chooses account sync. */
import { CONCERNS, APPROACHES, TENSIONS, STYLES } from "./personalization.js";
const STORAGE="yourlogos_web_v1",FLAG="yourlogos-introduction-v1";
const root=document.getElementById("yl-onboarding");
const slider=document.getElementById("yl-entrance");
const app=document.getElementById("app");
if(root){
  const stored=(()=>{try{return JSON.parse(localStorage.getItem(STORAGE)||"null")}catch{return null}})();
  const today=(()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")})();
  // The main app creates today's quote in local state on boot: that is NOT
  // proof that a person has visited. Record actual past entry or activity.
  const practice=stored?.practice&&typeof stored.practice==="object"?stored.practice:{};
  const earlierVisit=Object.keys(practice).some(day=>day!==today);
  const hasHistory=Boolean(stored&&typeof stored==="object"&&(
    stored.personalization?.status==="completed"||stored.personalization?.status==="skipped"||
    localStorage.getItem("yourlogos-daily-ritual-v1")||
    stored.started||stored.localName||earlierVisit||
    (stored.saved||[]).length||(stored.arrivals||[]).length||
    (stored.thoughtThreadEvents||[]).length||(stored.encounterEvents||[]).length
  ));
  const demo=new URLSearchParams(location.search).get("intro")==="1";
  const shouldShow=demo||(!localStorage.getItem(FLAG)&&!hasHistory);
  if(shouldShow){
    slider?.setAttribute("inert","");
    app?.setAttribute("inert","");
    root.hidden=false;
    let step=0,concerns=[],name="",approach="unsure",tension="unsure",style="surprise";
    const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const stepData=[
      {eyebrow:"HELLO",headline:"What should we call you?",sub:"Philosophy begins with a person, not a theory."},
      {eyebrow:"YOUR WORLD",headline:"What's been on your mind lately?",sub:"Choose up to three. There isn't a wrong answer."},
      {eyebrow:"YOUR INSTINCTS",headline:"When something troubles you, what do you usually do first?",sub:"All of these are human ways to begin."},
      {eyebrow:"THE TENSIONS",headline:"Sometimes two good things pull us in different directions.",sub:"Which tension has felt familiar lately?"},
      {eyebrow:"YOUR CURIOSITY",headline:"What kind of question would you welcome?",sub:"This helps us choose how to invite you into a thought."}
    ];
    const optionButton=(key,label,selected,multiple=false)=>'<button type="button" class="yl-intro-option'+(selected?" is-selected":"")+'" data-select="'+esc(key)+'" aria-pressed="'+Boolean(selected)+'">'+
      '<span>'+esc(label)+'</span><span class="yl-intro-option-check" aria-hidden="true">'+(selected?"✦":multiple?"＋":"○")+'</span></button>';
    const choices=(object,value)=>'<div class="yl-intro-options" role="group">'+Object.entries(object).map(([key,label])=>optionButton(key,typeof label==="string"?label:label.label,key===value)).join("")+'</div>';
    const pages=()=>{
      if(step===0)return '<label class="yl-intro-label" for="yl-intro-name">YOUR NAME OR NICKNAME</label><input id="yl-intro-name" class="yl-intro-input" maxlength="32" autocomplete="nickname" placeholder="Whatever feels like you" value="'+esc(name)+'"/><p class="yl-intro-minor">You can change this later.</p>';
      if(step===1)return '<div class="yl-intro-options yl-intro-options-grid" role="group" aria-label="Topics on your mind">'+Object.entries(CONCERNS).map(([key,value])=>optionButton(key,value.label,concerns.includes(key),true)).join("")+'</div><p class="yl-intro-minor">'+concerns.length+' of 3 selected · You can change these later.</p>';
      if(step===2)return choices(APPROACHES,approach);
      if(step===3)return choices(Object.fromEntries(Object.entries(TENSIONS).map(([key,value])=>[key,value.label])),tension);
      return choices(STYLES,style);
    };
    function paint(){
      const cfg=stepData[step];
      root.innerHTML='<div class="yl-intro-atmosphere" aria-hidden="true"></div>'+
       '<div class="yl-intro-layout"><header class="yl-intro-header"><span class="yl-intro-brand">✦ YOURLOGOS</span><span class="yl-intro-count">'+String(step+1).padStart(2,"0")+' / 05</span></header>'+
       '<div class="yl-intro-progress" aria-hidden="true">'+stepData.map((_,i)=>'<i class="'+(i<=step?"on":"")+'"></i>').join("")+'</div>'+
       '<main class="yl-intro-main"><p class="yl-intro-kicker">'+cfg.eyebrow+'</p><h1>'+cfg.headline+'</h1><p class="yl-intro-sub">'+cfg.sub+'</p>'+pages()+'</main>'+
       '<footer class="yl-intro-footer"><div class="yl-intro-footer-actions">'+
        '<button type="button" class="yl-intro-back" data-intro="back">'+(step===0?"Skip introduction":"← Back")+'</button>'+
        '<button type="button" class="yl-intro-next" data-intro="next">'+(step===4?"Meet your first thought ✦":"Continue →")+'</button>'+
       '</div><p class="yl-intro-privacy">Your answers stay on this device unless you choose to sync them. No personality labels.</p></footer></div>';
      if(step===0){const input=root.querySelector("#yl-intro-name");if(input)input.addEventListener("input",e=>name=e.target.value.slice(0,32))}
    }
    function finish(skip=false){
      const answers={concerns:[...concerns],approach,tension,style};
      const safeName=name.trim().replace(/\s+/g," ").slice(0,32);
      const profile={version:1,status:skip?"skipped":"completed",answers,completedAt:new Date().toISOString()};
      // Merge latest state: app startup can write daily practice in parallel.
      try{
        const current=JSON.parse(localStorage.getItem(STORAGE)||"{}");
        const updated={...(current&&typeof current==="object"?current:{}),personalization:profile};
        if(safeName)updated.localName=safeName;
        localStorage.setItem(STORAGE,JSON.stringify(updated));
        localStorage.setItem(FLAG,"done");
      }catch{ /* Continue without storing when private browsing blocks storage. */ }
      window.dispatchEvent(new CustomEvent("yourlogos:onboarding-complete",{detail:{profile,name:safeName}}));
      slider?.removeAttribute("inert");
      app?.removeAttribute("inert");
      root.hidden=true;
      root.replaceChildren();
      // The existing slider and its welcome animation are not modified.
    }
    root.addEventListener("click",e=>{
      const choice=e.target.closest("[data-select]");
      if(choice){
        const key=choice.dataset.select;
        if(step===1&&Object.hasOwn(CONCERNS,key)){
          concerns=concerns.includes(key)?concerns.filter(x=>x!==key):concerns.length<3?[...concerns,key]:concerns;
        }else if(step===2&&Object.hasOwn(APPROACHES,key))approach=key;
        else if(step===3&&Object.hasOwn(TENSIONS,key))tension=key;
        else if(step===4&&Object.hasOwn(STYLES,key))style=key;
        paint();return;
      }
      const button=e.target.closest("[data-intro]");if(!button)return;
      if(button.dataset.intro==="back"){if(step===0)finish(true);else{step--;paint()}}
      if(button.dataset.intro==="next"){if(step===4)finish();else{step++;paint()}}
    });
    root.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id==="yl-intro-name"){e.preventDefault();step=1;paint()}});
    paint();
  }
}
