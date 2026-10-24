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
  if(!root||!slider||!track||!thumb)return;
  let ready=false,entered=false,transitioning=false,failed=false,dragId=null,progress=0,lastHapticStep=-1;
  const reduced=()=>!!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const appReady=()=>!!document.querySelector("#app .shell .stage");
  const travel=()=>Math.max(1,track.clientWidth-thumb.offsetWidth-10);
  function setProgress(p,animated=false){
    progress=Math.max(0,Math.min(1,p));
    thumb.classList.toggle("is-dragging",!animated);
    track.style.setProperty("--progress",(progress*100)+"%");
    track.style.setProperty("--intensity",String(progress));
    thumb.style.setProperty("--thumb-x",(progress*travel())+"px");
    thumb.setAttribute("aria-valuenow",String(Math.round(progress*100)));
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
  function markReady(){if(entered||transitioning)return;ready=true;failed=false;thumb.disabled=false;status.textContent="";retry.hidden=true;}
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
})();
