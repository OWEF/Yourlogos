/* Dedicated welcome controller. Independent of module graph so failed imports still display a useful recovery action. */
(function(){
  const root=document.getElementById("yl-entrance"),button=document.getElementById("yl-enter"),status=document.getElementById("yl-entrance-status"),retry=document.getElementById("yl-retry");
  if(!root||!button)return;
  let ready=false,entered=false;
  function reveal(){
    if(entered||!ready)return;
    entered=true;button.disabled=true;root.classList.add("is-departing");
    try{sessionStorage.setItem("yourlogos-welcome-entered","1")}catch{}
    const done=()=>{root.hidden=true;document.getElementById("app")?.removeAttribute("aria-hidden");};
    if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)done();else setTimeout(done,700);
  }
  function markReady(){
    ready=true;button.disabled=false;status.textContent="";retry.hidden=true;
    let visited=false;try{visited=sessionStorage.getItem("yourlogos-welcome-entered")==="1"}catch{}
    if(visited)reveal();
  }
  function recover(){
    status.textContent="The experience couldn't open. Try refreshing.";
    retry.hidden=false;button.disabled=false;
    button.textContent="Try again ↗";
    button.onclick=()=>location.reload();
  }
  window.addEventListener("yourlogos:ready",markReady,{once:true});
  window.addEventListener("yourlogos:boot-error",recover,{once:true});
  window.addEventListener("error",event=>{if(!ready&&event?.message)recover()});
  window.addEventListener("unhandledrejection",()=>{if(!ready)recover()});
  button.addEventListener("click",()=>{
    if(!ready){location.reload();return}
    reveal();
  });
  retry.addEventListener("click",()=>location.reload());
  setTimeout(()=>{if(!ready)recover()},10000);
  if(document.getElementById("app")?.querySelector(".shell"))markReady();
})();