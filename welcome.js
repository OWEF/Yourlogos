/* YourLogos welcome: a functioning, user-controlled entrance with a graceful failure route.
   Standalone from ES modules so a missing app import cannot trap the user on a bare loader. */
(function(){
  const root=document.getElementById("yl-entrance");
  const button=document.getElementById("yl-enter");
  const status=document.getElementById("yl-entrance-status");
  const retry=document.getElementById("yl-retry");
  if(!root||!button)return;
  let ready=false,entered=false,transitioning=false,failed=false;
  const reduced=()=>!!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  function actualAppReady(){return !!document.querySelector("#app .shell .stage")}
  function markReady(){
    if(entered||transitioning)return;
    ready=true;failed=false;button.disabled=false;
    button.innerHTML='Philosophy it <span class="yl-entrance__arrow" aria-hidden="true">↗</span>';
    status.textContent="";retry.hidden=true;
  }
  function recover(){
    if(ready||entered||transitioning||actualAppReady())return;
    failed=true;button.disabled=false;
    status.textContent="YourLogos couldn't finish opening.";
    retry.hidden=false;button.textContent="Try again ↗";
  }
  function finish(){
    root.hidden=true;
    document.getElementById("app")?.removeAttribute("aria-hidden");
    document.querySelector(".quote-viewport")?.focus?.({preventScroll:true});
  }
  function enter(){
    if(entered||transitioning)return;
    if(!ready&&!actualAppReady()){location.reload();return}
    ready=true;transitioning=true;
    button.classList.add("is-pressed");
    try{
      window.webkit?.messageHandlers?.yourlogosHaptics?.postMessage("impact");
      navigator.vibrate?.(10);
    }catch{}
    const start=()=>{
      entered=true;root.classList.add("is-departing");button.disabled=true;
      if(reduced())finish();else setTimeout(finish,720);
    };
    if(reduced())start();else setTimeout(start,120);
  }
  window.addEventListener("yourlogos:ready",markReady);
  window.addEventListener("yourlogos:boot-error",recover);
  window.addEventListener("error",()=>{if(!ready)recover()});
  window.addEventListener("unhandledrejection",()=>{if(!ready)recover()});
  button.addEventListener("click",()=>failed?location.reload():enter());
  button.addEventListener("pointerup",()=>{if(!transitioning)button.classList.remove("is-pressed")});
  retry.addEventListener("click",()=>location.reload());
  setTimeout(()=>{if(actualAppReady())markReady();else recover()},7500);
  if(actualAppReady())markReady();
})();
