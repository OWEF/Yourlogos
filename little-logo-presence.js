// LilLogo's quiet autonomous presence. No network calls, canvases or frame polling.
// Rendered character is replaced by the existing app; this controller follows
// each new instance and never modifies persisted philosophical choices.
const moods=["idle","curious","reflective","thinking","surprised","delighted","encourage"];
const spontaneous=["curious","idle","reflective","idle","thinking","idle","curious"];
let pet=null,clock=0,revert=0,lastTick=0,tick=0;
const reduced=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true;
function release(){
 clearTimeout(clock);clearTimeout(revert);
 clock=0;revert=0;pet=null;
}
function isQuietScreen(node){
 const stage=node.closest(".yl-logo-roam-stage");
 return stage&&!stage.classList.contains("is-complete") &&
  !document.querySelector(".yl-discover-immersive .yl-logo-feedback") &&
  !document.querySelector(".yl-discover-immersive .yl-logo-interlude") &&
  !document.querySelector(".yl-discover-immersive .yl-ai-quiet-loading");
}
function setMood(node,mood){
 if(!node.isConnected)return;
 for(const name of moods)node.classList.remove("yl-logo-pet-"+name);
 node.classList.add("yl-logo-pet-"+mood);
 node.dataset.lilAmbient=mood;
}
function schedule(){
 clearTimeout(clock);
 if(!pet||document.hidden||reduced())return;
 clock=setTimeout(perform,4700+Math.round(Math.random()*3600));
}
function perform(){
 const node=pet;
 if(!node||!node.isConnected)return;
 if(!isQuietScreen(node)){schedule();return}
 const mood=spontaneous[tick++%spontaneous.length];
 const base=node.className.match(/yl-logo-pet-(idle|thinking|curious|reflective|surprised|delighted|encourage)/);
 if(mood!=="idle"){
  setMood(node,mood);
  // A short living glance. Return to independent breathing before the next one.
  revert=setTimeout(()=>{if(pet===node&&node.isConnected&&isQuietScreen(node))setMood(node,"idle")},1150+Math.round(Math.random()*650));
 }else if(base&&base[1]!=="idle")setMood(node,"idle");
 lastTick=Date.now();
 schedule();
}
function attach(){
 const next=document.querySelector(".yl-discover-immersive .yl-logo-roam-stage .yl-logo-pet");
 if(next===pet)return;
 release();
 if(!next||reduced())return;
 pet=next;pet.classList.add("yl-logo-autonomous");
 schedule();
}
function init(){
 const app=document.getElementById("app");
 if(!app)return;
 const observer=new MutationObserver(attach);
 observer.observe(app,{subtree:true,childList:true});
 document.addEventListener("visibilitychange",()=>{if(document.hidden){clearTimeout(clock);clearTimeout(revert)}else{attach();schedule()}});
 window.matchMedia?.("(prefers-reduced-motion: reduce)")?.addEventListener?.("change",attach);
 attach();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
