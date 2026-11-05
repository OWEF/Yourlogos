// CZ-80 — gated, DOM-only Encounter feedback. Application state in app.js
// remains authoritative. This module never persists, sends data, or infers beliefs.
// Preview is deliberately OFF unless the founder opens ?cz80=preview.
export const CZ80_PREVIEW_ENABLED =
  typeof window!=="undefined" &&
  new URLSearchParams(window.location.search).get("cz80")==="preview";

const BEATS=Object.freeze({
  "encounter.enter":"enter",
  "encounter.resume":"resume",
  "lens.press":"press",
  "lens.choose":"choice",
  "insight.ready":"insight",
  "insight.error":"error",
  "exercise.place":"place",
  "exercise.complete":"exercise",
  "encounter.finish":"finish"
});

export function livingTransitionEvents(before,after,action){
  if(!before||!after||after===before||before.phase===after.phase)return [];
  if(before.phase==="focus" && after.phase==="mirror" &&
    (action==="own-voice"||action?.startsWith("focus:")))return ["lens.choose"];
  if(after.phase==="response"||after.phase==="reflection"||after.phase==="summary")
    return ["insight.ready"];
  if(before.phase==="summary" && after.phase==="done" &&
      after.carried===true && action==="save")return ["encounter.finish"];
  if(after.phase==="focus"&&action==="reconsider")return ["encounter.resume"];
  return [];
}

export function createEncounterChoreography(bus,{enabled=false,root=null}={}){
  if(!enabled)return {dispose(){}};
  if(!bus||typeof bus.subscribe!=="function")throw new TypeError("Encounter event bus required");
  const dom=root??(typeof document!=="undefined"?document:null);
  if(!dom)throw new TypeError("Encounter root required for enabled preview");
  const docElement=dom.documentElement;
  if(docElement)docElement.dataset.cz80Preview="on";
  const unsubscribers=Object.entries(BEATS).map(([type,beat])=>
    bus.subscribe(type,()=>{
      // Only the currently mounted sheet can receive a visual beat.
      // No timer survives an app render and no visual event can save data.
      const sheet=dom.querySelector(".discover-sheet");
      if(!sheet)return;
      sheet.dataset.cz80Beat=beat;
    }));
  return {dispose(){
    unsubscribers.forEach(fn=>fn());
    if(docElement?.dataset.cz80Preview==="on")delete docElement.dataset.cz80Preview;
  }};
}
