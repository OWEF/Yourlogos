/**
 * CZ-152 source-authored narrative bridge contract.
 * Presentation-only; it must never infer a belief, psychological state, or
 * canonical choice. The surrounding authenticated source keeps all original
 * wording, provenance, caveats, and independent hypothetical outcomes.
 */
export const CZ152_BRIDGE_VERSION="cz152-narrative/1";
const object=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
export const bridgeWordCount=s=>String(s||"").trim().split(/\s+/u).filter(Boolean).length;
const sentence=(s,min,max)=>{
 if(typeof s!=="string"||s.length>260||/[<>]/u.test(s)||/\s{2,}/u.test(s))return false;
 const words=bridgeWordCount(s);
 return s===s.trim()&&words>=min&&words<=max&&/[.!?]$/u.test(s);
};
export function validateCZ152Bridge(record){
 const bridge=record?.narrativeBridge;
 if(!object(record)||!object(bridge)||bridge.version!==CZ152_BRIDGE_VERSION||
  !sentence(bridge.bridgeFromSource,7,23)||
  !sentence(bridge.situationHook,13,36)||
  !sentence(bridge.playPrompt,4,20)||
  !Array.isArray(bridge.sourceWarrantIds)||
  bridge.sourceWarrantIds.length<2||bridge.sourceWarrantIds.length>5||
  new Set(bridge.sourceWarrantIds).size!==bridge.sourceWarrantIds.length||
  !bridge.sourceWarrantIds.includes("source:central")||
  typeof record.sourceThesis!=="string"||
  typeof record.humanTension!=="string"||
  typeof record.intro!=="string"||
  typeof record.epistemicLimits!=="string")return false;
 const eligible=record.evidenceIds??record.sourceWarrantIds;
 return Array.isArray(eligible)&&bridge.sourceWarrantIds.every(id=>eligible.includes(id));
}
