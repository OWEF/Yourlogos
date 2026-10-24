/* Accessible swipe-to-enter. Native haptics intensify where the host supports them.
   Browser vibration is best-effort; iOS Safari generally does not expose it. */
(function(){
  const root=document.getElementById("yl-entrance");
  const slider=document.getElementById("yl-slider");
  const track=document.getElementById("yl-slider-track");
  const thumb=document.getElementById("yl-enter");
  const particles=document.getElementById("yl-slider-particles");
  const status=document.getElementById("yl-entrance-status");
  const retry=document.getElementById("yl-retry");
  const daily=document.getElementById("yl-daily");
  const thought=document.getElementById("yl-daily-thought");
  const source=document.getElementById("yl-daily-source");
  const completedKey="yourlogos-daily-ritual-v1";
  let dailyDate="", dailyId=null;
  if(!root||!slider||!track||!thumb)return;
  let ready=false,entered=false,transitioning=false,failed=false,dragId=null,progress=0,lastHapticStep=-1;
  const reduced=()=>!!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const appReady=()=>!!document.querySelector("#app .shell .stage");
  const travel=()=>Math.max(1,track.clientWidth-thumb.offsetWidth-10);
  const localDay=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
  const THEME_TEASERS={Meaning:"What makes today meaningful?",Suffering:"Can pain change its meaning?",Freedom:"What is yours to choose?",Mortality:"What makes this moment precious?",Love:"What does care ask of us?",Doubt:"What if you are mistaken?",Action:"What is one thing you can change?",Solitude:"Can you enjoy being alone?",Beauty:"What deserves another look?",Time:"Where has the day gone?"};
  function shortThought(q){
    const text=String(q?.[0]||"").trim();
    if(text.length<=66&&text.split(/\\s+/).length<=12)return text;
    const reflection=String(q?.[4]||"").trim();
    if(reflection.length<=62&&reflection.split(/\\s+/).length<=11)return reflection;
    return THEME_TEASERS[q?.[2]]||"What might you discover today?";
  }
  function hydrateDaily(detail){
    dailyDate=detail?.date||localDay();
    dailyId=detail?.quoteId??null;
    if(thought)thought.textContent=shortThought(detail?.quote);
    if(source)source.textContent="A glimpse of today's Encounter";
    if(localStorage.getItem(completedKey)===dailyDate){
      entered=true;root.hidden=true;
      document.getElementById("app")?.removeAttribute("aria-hidden");
    }
  }
  function updateReveal(){daily?.style.setProperty("--reveal",String(Math.max(.08,progress)));}

  function setProgress(p,animated=false){
    progress=Math.max(0,Math.min(1,p));
    thumb.classList.toggle("is-dragging",!animated);
    track.style.setProperty("--progress",(progress*100)+"%");
    track.style.setProperty("--intensity",String(progress));
    thumb.style.setProperty("--thumb-x",(progress*travel())+"px");
    thumb.setAttribute("aria-valuenow",String(Math.round(progress*100)));
    updateReveal();
    thumb.setAttribute("aria-valuetext",progress>=.96?"Release to enter":Math.round(progress*100)+" percent");
  }
  function haptic(p,finished=false){
    const step=Math.floor(p*8);
    if(!finished&&step<=lastHapticStep)return;
    lastHapticStep=step;
    try{
      const native=window.webkit?.messageHandlers?.yourlogosHaptics;
      if(native){native.postMessage(finished?"success":p>.72?"impact":"selection");return;}
      const t=window.Telegram?.WebApp?.HapticFeedback;
      if(t){finished?t.notificationOccurred("success"):p>.72?t.impactOccurred("medium"):t.selectionChanged();return}
      if(navigator.vibrate)navigator.vibrate(finished?[18,30,26]:Math.round(5+p*19));
    }catch{}
  }
  function markReady(event){hydrateDaily(event?.detail);if(entered||transitioning)return;ready=true;failed=false;thumb.disabled=false;status.textContent="";retry.hidden=true;}
  function recover(){if(ready||entered||transitioning||appReady())return;failed=true;thumb.disabled=false;status.textContent="YourLogos couldn't finish opening.";retry.hidden=false;thumb.setAttribute("aria-label","Try loading YourLogos again");}
  function burst(){
    if(reduced())return;
    particles.replaceChildren();
    for(let i=0;i<20;i++){
      const el=document.createElement("i"),angle=i*2.39996,dist=22+(i%5)*13;
      el.style.setProperty("--dx",Math.round(Math.cos(angle)*dist)+"px");
      el.style.setProperty("--dy",Math.round(Math.sin(angle)*dist)+"px");
      el.style.setProperty("--size",(2+i%4)+"px");
      el.style.animationDelay=(i%4)*23+"ms";
      particles.appendChild(el);
    }
  }
  function finish(){root.hidden=true;document.getElementById("app")?.removeAttribute("aria-hidden");document.querySelector(".quote-viewport")?.focus?.({preventScroll:true})}
  function enter(){
    if(entered||transitioning)return;
    if(!ready&&!appReady()){location.reload();return}
    ready=true;transitioning=true;entered=true;
    setProgress(1,true);slider.classList.add("is-complete");haptic(1,true);burst();
    localStorage.setItem(completedKey,dailyDate||localDay());
    window.dispatchEvent(new CustomEvent("yourlogos:daily-arrived",{detail:{date:dailyDate||localDay(),quoteId:dailyId}}));
    root.classList.add("is-departing");
    thumb.disabled=true;
    if(reduced())finish();else setTimeout(finish,820);
  }
  function position(e){const r=track.getBoundingClientRect();return (e.clientX-r.left-thumb.offsetWidth/2-5)/travel()}
  thumb.addEventListener("pointerdown",e=>{
    if(thumb.disabled||transitioning)return;
    if(e.pointerType==="mouse"&&e.button!==0)return;
    dragId=e.pointerId;lastHapticStep=-1;thumb.setPointerCapture?.(e.pointerId);
    thumb.classList.add("is-dragging");e.preventDefault();
  });
  thumb.addEventListener("pointermove",e=>{
    if(dragId!==e.pointerId||transitioning)return;
    const p=position(e);setProgress(p);haptic(progress);
  });
  function endDrag(e){
    if(dragId!==e.pointerId)return;
    dragId=null;thumb.classList.remove("is-dragging");
    if(progress>=.93)enter();else {setProgress(0,true);lastHapticStep=-1;}
  }
  thumb.addEventListener("pointerup",endDrag);
  thumb.addEventListener("pointercancel",e=>{if(dragId!==e.pointerId)return;dragId=null;thumb.classList.remove("is-dragging");setProgress(0,true)});
  thumb.addEventListener("keydown",e=>{
    if(thumb.disabled||transitioning)return;
    if(["ArrowRight","ArrowUp"].includes(e.key)){e.preventDefault();setProgress(Math.min(1,progress+.12),true);haptic(progress);if(progress>=.93)enter()}
    else if(["ArrowLeft","ArrowDown"].includes(e.key)){e.preventDefault();setProgress(Math.max(0,progress-.12),true)}
    else if(e.key==="Home"){e.preventDefault();setProgress(0,true)}
    else if(e.key==="End"){e.preventDefault();enter()}
  });
  // Pointer interactions do not allow a one-tap bypass.
  thumb.addEventListener("click",e=>{e.preventDefault();if(failed)location.reload()});
  retry?.addEventListener("click",()=>location.reload());
  window.addEventListener("yourlogos:ready",markReady);
  window.addEventListener("yourlogos:boot-error",recover);
  window.addEventListener("error",()=>{if(!ready)recover()});
  window.addEventListener("unhandledrejection",()=>{if(!ready)recover()});
  window.addEventListener("resize",()=>{if(!transitioning)setProgress(progress,true)});
  setTimeout(()=>{if(appReady())markReady();else recover()},7500);
  if(appReady())markReady();
  updateReveal();
})();
