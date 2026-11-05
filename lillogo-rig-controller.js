// CZ-81 M4 — visual-only, default-off LilLogo layered rig controller.
// Semantic motion state machine over the validated CZ-81 artwork: it maps
// encounter event semantics to presentation moods only. No user data, AI calls,
// consent changes, analytics, save logic, or application state ownership.
export const CZ81_PREVIEW_ENABLED=
  typeof window!=="undefined" &&
  new URLSearchParams(window.location.search).get("cz81")==="preview";

const VALID=new Set(["idle","curious","reflective","restful","quietly-delighted"]);
const BEAT_TO_MOOD={
  "encounter.enter":"idle",
  "encounter.resume":"curious",
  "lens.press":"curious",
  "lens.choose":"curious",
  "insight.ready":"reflective",
  "insight.error":"restful",
  "encounter.finish":"quietly-delighted"
};
const svgStates=["state-idle","state-curious","state-reflective","state-restful","state-quietly-delighted"];

// Natural mood transitions. Any attentive state may reach a saved finish
// ("quietly-delighted"); delight itself then holds until a new encounter
// (idle), an explicit resume, or renewed attention (curious) — stray late
// insight events never pull it back into reflective or restful.
const ALL_MOODS=["idle","curious","reflective","restful","quietly-delighted"];
const TRANSITIONS={
  "idle":ALL_MOODS,
  "curious":ALL_MOODS,
  "reflective":ALL_MOODS,
  "restful":ALL_MOODS,
  "quietly-delighted":["idle","curious"]
};

export function rigMoodForEvent(event){
  if(event?.type==="encounter.finish" && event?.payload?.saved!==true)return null;
  return BEAT_TO_MOOD[event?.type]||null;
}

export function canTransitionRig(from,to){
  if(!VALID.has(to))return false;
  if(!VALID.has(from)||from===to)return true;
  return TRANSITIONS[from].includes(to);
}

export function createLilLogoRigController(bus,{enabled=false,root=null,Observer=null}={}){
  if(!enabled)return {dispose(){}};
  if(!bus||typeof bus.subscribe!=="function")throw new TypeError("Encounter event bus is required");
  const doc=root??(typeof document!=="undefined"?document:null);
  if(!doc)throw new TypeError("A document is required for preview mode");
  const Mutation=Observer??(typeof MutationObserver!=="undefined"?MutationObserver:null);
  if(!Mutation)throw new TypeError("A DOM mutation observer is required");
  const abort=new AbortController();
  let current=null;
  let disposed=false;
  if(doc.documentElement)doc.documentElement.dataset.cz81Preview="on";

  function apply(view){
    const svg=view.contentDocument?.documentElement;
    if(!svg||svg.id!=="lillogoLayeredRig")return;
    const initial=view.dataset.rigMood==="curious"?"curious":"idle";
    const mood=VALID.has(current)?current:initial;
    for(const cls of svgStates)svg.classList.remove(cls);
    svg.classList.add("state-"+mood);
    svg.classList.toggle("is-paused",doc.hidden===true ||
      (typeof window!=="undefined"&&window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true));
  }
  function scan(){
    for(const view of doc.querySelectorAll("object.yl-logo-v3-rig")){
      if(view.dataset.rigListener!=="yes"){
        view.dataset.rigListener="yes";
        // One-shot listener belongs to this object, not the long-lived controller.
        // Detached renders are then collectible instead of held by AbortSignal.
        view.addEventListener("load",()=>apply(view),{once:true});
      }
      apply(view);
    }
  }
  const observer=new Mutation(doc=>{scan()});
  const app=doc.getElementById("app");
  const target=app??doc.documentElement;
  if(target)observer.observe(target,{subtree:true,childList:true});
  const unsubs=Object.keys(BEAT_TO_MOOD).map(type=>
    bus.subscribe(type,event=>{
      const mood=rigMoodForEvent(event);
      if(!mood||!canTransitionRig(current,mood))return;
      current=mood;scan();
    }));
  const onVisibility=()=>scan();
  doc.addEventListener("visibilitychange",onVisibility,{signal:abort.signal});
  const preference=typeof window!=="undefined"?window.matchMedia?.("(prefers-reduced-motion: reduce)"):null;
  preference?.addEventListener?.("change",onVisibility,{signal:abort.signal});
  scan();
  return {dispose(){
    if(disposed)return;
    disposed=true;
    observer.disconnect();
    abort.abort();
    for(const unsubscribe of unsubs)unsubscribe();
    if(doc.documentElement?.dataset.cz81Preview==="on")delete doc.documentElement.dataset.cz81Preview;
  }};
}
