/* YourLogos entrance V3.6 — isolated human-guide slider.
   It does not alter Encounter, Library, or My World. */
(function(){
  const root=document.getElementById("yl-entrance");
  const thumb=document.getElementById("yl-enter");
  const track=document.getElementById("yl-slide-track");
  const scene=document.getElementById("yl-welcome-scene");
  const arm=document.getElementById("yl-guide-arm");
  const sleeve=document.getElementById("yl-guide-sleeve");
  const hand=document.getElementById("yl-guide-hand");
  const status=document.getElementById("yl-entrance-status");
  const retry=document.getElementById("yl-retry");
  if(!root||!thumb||!track||!scene)return;
  let ready=false,entered=false,transitioning=false,failed=false,progress=0;
  let activePointer=null,animationFrame=0,springFrame=0;
  const reduced=()=>!!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const actualAppReady=()=>!!document.querySelector("#app .shell .stage");
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
  const range=()=>Math.max(0,track.clientWidth-thumb.offsetWidth-12);
  function apply(value){
    progress=clamp(value,0,1);
    scene.style.setProperty("--yl-slide",String(progress));
    scene.style.setProperty("--yl-range",range()+"px");
    // Hand is linked to the knob at the bottom of the composition.
    // Arm changes in real time: shoulder is fixed, wrist traces the thumb's journey.
    const x=29+progress*88, y=160-progress*10;
    arm?.setAttribute("d",`M84 113 Q${57+progress*27} ${126-progress*16} ${x} ${y}`);
    sleeve?.setAttribute("d",`M86 110 Q${66+progress*10} ${119-progress*5} ${59+progress*21} ${132-progress*4}`);
    hand?.setAttribute("cx",String(x));hand?.setAttribute("cy",String(y));
    track.setAttribute("aria-valuenow",String(Math.round(progress*100)));
  }
  function markReady(){
    if(entered||transitioning)return;
    ready=true;failed=false;thumb.disabled=false;retry.hidden=true;status.textContent="";
    thumb.setAttribute("aria-label","Slide to open YourLogos. Press Enter to open with keyboard.");
    apply(progress);
  }
  function recover(){
    if(ready||entered||transitioning||actualAppReady())return;
    failed=true;thumb.disabled=false;
    status.textContent="YourLogos couldn't finish opening.";
    retry.hidden=false;
    thumb.setAttribute("aria-label","Retry opening YourLogos");
  }
  function finish(){
    root.hidden=true;
    document.getElementById("app")?.removeAttribute("aria-hidden");
    document.querySelector(".quote-viewport")?.focus?.({preventScroll:true});
  }
  function enter(){
    if(entered||transitioning)return;
    if(failed||(!ready&&!actualAppReady())){location.reload();return}
    transitioning=true;
    cancelAnimationFrame(springFrame);
    apply(1);
    try{window.webkit?.messageHandlers?.yourlogosHaptics?.postMessage("success");navigator.vibrate?.(10)}catch{}
    const start=()=>{
      entered=true;root.classList.add("is-departing");thumb.disabled=true;
      if(reduced())finish();else setTimeout(finish,720);
    };
    if(reduced())start();else setTimeout(start,160);
  }
  function glideHome(){
    cancelAnimationFrame(springFrame);
    if(reduced()){apply(0);return}
    let velocity=0;
    function frame(){
      velocity+=(0-progress)*.14;
      velocity*=.73;
      apply(progress+velocity);
      if(progress<.003&&Math.abs(velocity)<.003){apply(0);return}
      springFrame=requestAnimationFrame(frame);
    }
    springFrame=requestAnimationFrame(frame);
  }
  function dragAt(clientX){
    const rect=track.getBoundingClientRect();
    const x=clientX-rect.left-thumb.offsetWidth/2-6;
    cancelAnimationFrame(animationFrame);
    animationFrame=requestAnimationFrame(()=>apply(x/Math.max(1,range())));
  }
  thumb.addEventListener("pointerdown",e=>{
    if(thumb.disabled||transitioning)return;
    if(e.pointerType==="mouse"&&e.button!==0)return;
    cancelAnimationFrame(springFrame);
    activePointer=e.pointerId;
    scene.classList.add("is-dragging");
    thumb.setPointerCapture?.(e.pointerId);
    dragAt(e.clientX);
    e.preventDefault();
  });
  thumb.addEventListener("pointermove",e=>{
    if(activePointer!==e.pointerId)return;
    dragAt(e.clientX);
  });
  function release(e){
    if(activePointer!==e.pointerId)return;
    activePointer=null;
    scene.classList.remove("is-dragging");
    cancelAnimationFrame(animationFrame);
    const rect=track.getBoundingClientRect();
    apply((e.clientX-rect.left-thumb.offsetWidth/2-6)/Math.max(1,range()));
    if(progress>=.86)enter();else glideHome();
  }
  thumb.addEventListener("pointerup",release);
  thumb.addEventListener("pointercancel",e=>{if(activePointer===e.pointerId){activePointer=null;scene.classList.remove("is-dragging");glideHome()}});
  thumb.addEventListener("lostpointercapture",()=>{if(activePointer!==null){activePointer=null;scene.classList.remove("is-dragging");glideHome()}});
  thumb.addEventListener("click",e=>{
    if(failed){location.reload();return}
    // Pointer taps are not enough; only a full slide enters on touch.
    if(e.detail===0 && activePointer===null)enter();
  });
  thumb.addEventListener("keydown",e=>{
    if(e.key==="ArrowRight"){e.preventDefault();if(ready)apply(Math.min(1,progress+.2))}
    if(e.key==="ArrowLeft"){e.preventDefault();apply(Math.max(0,progress-.2))}
    if(e.key==="Home"){e.preventDefault();apply(0)}
    if(e.key==="End"){e.preventDefault();apply(1)}
    if(e.key==="Enter"||e.key===" "){e.preventDefault();enter()}
  });
  retry?.addEventListener("click",()=>location.reload());
  window.addEventListener("resize",()=>apply(progress));
  window.addEventListener("yourlogos:ready",markReady);
  window.addEventListener("yourlogos:boot-error",recover);
  window.addEventListener("error",()=>{if(!ready)recover()});
  window.addEventListener("unhandledrejection",()=>{if(!ready)recover()});
  setTimeout(()=>{if(actualAppReady())markReady();else recover()},7500);
  if(actualAppReady())markReady();
  apply(0);
})();