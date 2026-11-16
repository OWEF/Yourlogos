/**
 * B2.7 compact presentation ONLY. Source-bound 80–120-word reasoning and
 * Expression are fully replayed and retained, never replaced/truncated.
 * The editorial phrases below live with VERSIONED source scenario keys.
 */
export const COMPACT_VERSION="encounter-compact-view/2.7.0";
const POLICY=[[10,48],[18,65],[9,26]];
const count=s=>s.trim().split(/\s+/).filter(Boolean).length;
const editorial=Object.freeze({
 dillard:{
  insight:"Dillard points to the pattern formed by ordinary repeated days, not a ranking of how you spend them.",
  limit:"These evenings are hypothetical, not your observed life.",
  question:"What might change if this imagined arrangement became a recurring choice?"
 },
 dillard_pattern:{
  insight:"Dillard draws attention to how repeated ordinary days can shape a life without proving any habit exists.",
  limit:"Four evenings are invented.",
  question:"Which possibility might deserve a place in a repeated evening?"
 },
 thoreau_balance:{
  insight:"Thoreau asks us to see the hours exchanged for an option, not only its monetary price.",
  limit:"The wage and hours are imaginary.",
  question:"What else could an unexchanged hour make possible?"
 },
 thoreau_weekend:{
  insight:"Thoreau's cost question includes time from a finite life, beyond a price tag.",
  limit:"The hours and wage are fictional, not your circumstances.",
  question:"What opportunities might you keep open by not exchanging an hour?"
 },
 kierkegaard_map:{
  insight:"Kierkegaard's distinction is that you act before hindsight becomes available; the unchosen life stays unknown.",
  limit:"The following events are imaginary.",
  question:"Which uncertainty would you still have to act through?"
 },
 kierkegaard_future:{
  insight:"Kierkegaard distinguishes living forward from understanding in hindsight; neither gives knowledge of the other future.",
  limit:"The revealed scene is invented, never predicted.",
  question:"How would you respond without claiming to know the alternative?"
 },
 kierkegaard_hindsight:{
  insight:"Kierkegaard's journal denies us complete hindsight: even later, no one stands outside the flow of living.",
  limit:"The flipped possibility is fictional, not a forecast.",
  question:"What would you choose without demanding perfect understanding afterward?"
 },
 epictetus_relations:{
  insight:"Epictetus distinguishes your own chosen action from another person's response, which cannot be guaranteed.",
  limit:"This fictional exchange proves no real forgiveness or virtue.",
  question:"Where does your own responsibility end, and another person's begin?"
 },
 smith_human:{
  insight:"Smith's division-of-work example illuminates how separate contributions can depend on one another in a finished product.",
  limit:"The gift is fictional; Smith does not settle trust, fairness or the best personal choice.",
  question:"What would you share, knowing this model cannot decide for you?"
 }
});
const deny=(reason)=>({status:"needs_editorial_review",version:COMPACT_VERSION,
 reason,publicationAllowed:false});
function partOne(record,result){
 const family=result.selectedFamilyId,canonical=result.canonical_choice;
 if(family==="balance_move"){
  const alloc=record.allocation,amt=canonical?.amounts;
  if(!alloc||!Array.isArray(amt)||amt.length!==alloc.choices.length)return null;
  const choices=alloc.choices,remaining=amt.slice(1).reduce((a,b)=>a+b,0);
  const others=choices.slice(1).map(x=>x.label).join(" and ");
  return "You allocated "+amt[0]+" of "+alloc.resourceCapacity+" "+alloc.unitName+
   " to "+choices[0].label+"; the remaining "+remaining+
   " went toward "+others+" in this imagined allocation.";
 }
 if(family==="decision_cards"||family==="flip_reveal"){
  const path=canonical?.path,routes=record.timeline;
  const r=Array.isArray(path)&&routes?.find(x=>path.every((p,i)=>x.path?.[i]===p||
   [x.startId,x.sceneId,x.responseId][i]===p));
  if(!r)return null;
  return "You chose "+r.startLabel+", explored the invented possibility "+r.sceneLabel+
   ", then chose "+r.responseLabel+".";
 }
 if(family==="tap_pair"){
  const cardMap=new Map(record.relation?.cards?.map(c=>[c.id,c.label]));
  const pairs=canonical?.pairs;
  if(!Array.isArray(pairs)||pairs.length<1||pairs.length>2||
    pairs.some(p=>!cardMap.has(p.aId)||!cardMap.has(p.bId)))return null;
  return "You connected "+pairs.map(p=>cardMap.get(p.aId)+" with "+cardMap.get(p.bId)).join("; ")+
   " in an imagined situation.";
 }
 return null;
}
const phrase=quote=>{
 const words=quote.trim().split(/\s+/).filter(Boolean);
 return words.slice(0,Math.min(5,words.length)).join(" ");
};
export function compactEncounterB27(record,result){
 if(!record||result?.status!=="ready"||!result.expression?.sections||
    result.expression.sections.length!==3)return deny("A verified complete Encounter is required");
 const full=result.expression,old=full.sections,
  n=old.map(x=>count(x.text)),total=n.reduce((a,b)=>a+b,0);
 if(total!==full.wordCount||total<80||total>120||
   n.some((x,i)=>x<POLICY[i][0]||x>POLICY[i][1])||
   old.map(x=>x.label).join("|")!=="Your Choice|Back to the Philosopher|One Last Thing…")
  return deny("The full source-bound expression failed its frozen 80–120-word/section policy");
 const note=editorial[record.key],first=partOne(record,result);
 if(!note||!first||!record.quote||!record.sourceFingerprint)
  return deny("No exact authored compact interpretation exists for this source");
 const sections=[
  {label:"Your Choice",text:first},
  {label:"Back to the Philosopher",text:note.insight+" "+note.limit},
  {label:"One Last Thing…",text:note.question}
 ];
 const lengths=sections.map(x=>count(x.text)),visible=lengths.reduce((a,b)=>a+b,0);
 if(visible<40||visible>65)
  return deny("Concise rendering cannot meet the 40–65-word editorial target: "+JSON.stringify(lengths));
 // Optional deepening supplies the unchanged source and caveats, not a fourth
 // visible philosophical section. No fabricated excerpt or extra thesis.
 return {
  status:"ready",version:COMPACT_VERSION,
  sourceRecordId:result.sourceRecordId,
  sourceVersionHash:result.sourceVersionHash,
  sourceReview:"founder_provisional_development_only",
  sections,visibleWordCount:visible,
  fullWordCount:total,
  philosopher:{author:record.author,work:record.work,
   highlight:phrase(record.quote),exactQuote:record.quote,
   sourceUrl:record.sourceUrl},
  deepening:{fullSections:old.map(x=>({...x})),
   sourceQualification:old[1].text,
   originalSourceUrl:record.sourceUrl,
   necessaryLimits:note.limit},
  unchangedFullExpression:true,
  publicationAllowed:false
 };
}
