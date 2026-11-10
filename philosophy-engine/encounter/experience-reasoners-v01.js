/**
 * CZ-111: pilot-specific but shared-contract philosophical reasoners.
 * Independent of presentation and usable for meaningful input variation tests.
 * They consume the actual CZ-110 Context Atlas. The old CZ-105 8h reasoner is
 * deliberately not silently reused for a different, 3h exercise.
 */
import {ATLAS_PILOT_V01} from "../context-atlas/pilot-records-v01.js";
import {evaluatePhilosophicalGrammar} from "../context-atlas/grammar-v01.js";
import {createInsightPacket} from "./insight-packet-v01.js";

const categories=["Optional work","A friend","Quiet reflection"];
const resource={income:"financial security",space:"private working space",access:"access to education and publishers"};
const barrier={income:"financial insecurity",space:"interruptions and fragile privacy",access:"institutional exclusion"};
const response={write:"start writing despite constraints",protect:"try to protect ongoing time",challenge:"challenge a structural barrier"};
const isValidChoice=(v,o)=>Object.hasOwn(o,v);
const h=n=>(Number.isInteger(n)?String(n):String(n))+"h";
const getContext=(id,mechanism)=>{
  const record=ATLAS_PILOT_V01.find(r=>r.id===id);
  if(!record)throw new RangeError("Missing philosophical context "+id);
  const grammar=evaluatePhilosophicalGrammar(record);
  if(grammar.interactiveRealization.candidate!==mechanism ||
     grammar.interactiveRealization.allowedForProduction!==false)
    throw Error("Mechanic is not a permitted provisional research candidate");
  return {record,grammar};
};
const provenance=(r)=>r.sourcePassage.references.map(x=>({
  kind:x.kind,uri:x.url,supports:x.supports
}));

export function reallocateEvening(ticks, selectedIndex, desiredTicks){
 if(!Array.isArray(ticks)||ticks.length!==3||ticks.some(n=>!Number.isInteger(n)||n<0||n>6)||
    ticks.reduce((a,b)=>a+b,0)!==6)throw new TypeError("Expected three-hour allocation in half-hour ticks");
 if(!Number.isInteger(selectedIndex)||selectedIndex<0||selectedIndex>2||
    !Number.isInteger(desiredTicks)||desiredTicks<0||desiredTicks>6)
    throw new RangeError("Invalid slider");
 if(ticks[selectedIndex]===desiredTicks)return [...ticks];
 const other=[0,1,2].filter(i=>i!==selectedIndex),remaining=6-desiredTicks;
 const previous=ticks[other[0]]+ticks[other[1]];
 const first=previous===0?Math.round(remaining/2):Math.round(remaining*ticks[other[0]]/previous);
 const next=[0,0,0];
 next[selectedIndex]=desiredTicks;next[other[0]]=first;next[other[1]]=remaining-first;
 if(next.reduce((a,b)=>a+b,0)!==6)throw Error("Zero-sum invariant broken");
 return next;
}

export function reasonSeneca(input){
 const {record,grammar}=getContext(49,"tradeoff");
 const ticks=input?.ticks,motivation=input?.motivation;
 if(!Array.isArray(ticks)||ticks.length!==3||ticks.some(n=>!Number.isInteger(n)||n<0||n>6)||
    ticks.reduce((a,b)=>a+b,0)!==6)throw new TypeError("Three-hour fixed budget expected");
 if(!["chosen","expected","necessary"].includes(motivation))throw new TypeError("Select a valid motivation");
 const values=ticks.map(t=>t/2),max=Math.max(...values);
 const leaders=values.map((v,i)=>v===max?i:-1).filter(i=>i!==-1);
 const focus=leaders[0];
 const omissions=values.map((v,i)=>v===0?i:-1).filter(i=>i!==-1);
 const observed=categories.map((label,i)=>label+" "+h(values[i])).join(" · ");
 const dominant=leaders.length===1?categories[focus].toLowerCase():"more than one purpose";
 const other=values.map((v,i)=>({i,v})).filter(v=>v.i!==focus).sort((a,b)=>b.v-a.v)[0];
 const outcomeCode=max===3?"single_priority":leaders.length>1?"shared_priorities":"uneven_priorities";
 const pattern=outcomeCode==="single_priority"?"The whole evening went to "+categories[focus].toLowerCase()+".":
   outcomeCode==="shared_priorities"?"Your evening keeps several priorities in play.":
   "Most time went to "+dominant+"; "+categories[other.i].toLowerCase()+" received "+h(other.v)+".";
 const motive={
  chosen:"A freely chosen commitment can be deliberate even when it excludes something else.",
  expected:"An outside expectation can shape how you use free time, without proving the choice was wrong.",
  necessary:"A responsibility may be worthwhile even when it reduces the choices available tonight."
 }[motivation];
 const omitted=omissions.length?
   " No time remains tonight for "+omissions.map(i=>categories[i].toLowerCase()).join(" or ")+".":"";
 const observation=observed; // factual and exact
 const discovery=(pattern+" "+motive).slice(0,230);
 const connection=motivation==="expected"?
   "Seneca questions time consumed by unexamined demands. The issue is who directs the hour—not whether work is automatically wasted.":
   motivation==="necessary"?
   "Seneca's concern with deliberate living does not mean every duty is disposable. The question is what can genuinely be chosen.":
   "For Seneca, how time is used matters. A deliberate sacrifice can express a value; the numbers alone cannot decide if it was worthwhile.";
 const question=motivation==="expected"?"Which part of tonight's commitment would you still choose without anyone expecting it?":
   motivation==="necessary"?"Which part of the obligation is unavoidable, and which part might still be yours to decide?":
   max===3?"What made this one purpose worth excluding the others tonight?":
   "What would you change if one of these commitments mattered more tomorrow?";
 const headline=motivation==="expected"?"Your free time isn't always free from expectations.":
   motivation==="necessary"?"Not every obligation is a surrender.":
   outcomeCode==="single_priority"?"You chose one priority—and its cost.":
   outcomeCode==="shared_priorities"?"More than one priority can deserve your time.":"A choice reveals what else must wait.";
 return createInsightPacket({
  quote:{id:49,text:record.quote.text,author:record.quote.author,source:record.sourcePassage.work},
  mechanism:"tradeoff",scenarioId:"three-hour-discretionary-evening",
  observation:{text:observation,allocation:values,motivation},
  insight:{
    headline,discovery,connection,question,
    ruleId:"tradeoff:"+outcomeCode+":"+motivation,
    conceptualRelation:grammar.conceptualStructure.relation,
    limit:"This single hypothetical evening says nothing conclusive about your character, whether work is meaningful, or your use of a whole life.",
    tension:omitted||"Every allocation leaves less time available for at least one other purpose."
  },
  visual:{type:"segments",labels:categories,values},
  trace:{
    rules:["bounded-budget:180-minutes", "half-hour-zero-sum", "pattern:"+outcomeCode,
       "motivation:"+motivation,"source-relation:deliberate-time"],
    sourceReferences:provenance(record),
    philosophicalClaim:grammar.conceptualStructure.claim,
    epistemicStatus:"contextual_interpretation_not_truth"
  }
 });
}

export function reasonWoolf(input){
 const {record,grammar}=getContext(28,"decision_map");
 const s={resource:input?.resource,barrier:input?.barrier,action:input?.action};
 if(!isValidChoice(s.resource,resource)||!isValidChoice(s.barrier,barrier)||!isValidChoice(s.action,response))
   throw new TypeError("Invalid Woolf path");
 const same=s.resource===s.barrier;
 const improvement=resource[s.resource],limitation=barrier[s.barrier];
 const action=response[s.action];
 const structure=same?"incomplete_improvement":"distinct_barrier";
 const result=same?
   "Improving "+improvement+" still leaves it fragile. One improvement is not necessarily enough to sustain creative work.":
   "Improving "+improvement+" still leaves "+limitation+". A single resource cannot remove every barrier.";
 const actionContext=s.action==="write"?
   " Beginning to write preserves agency without making the circumstances fair.":
   s.action==="protect"?
   " Protecting the change acknowledges that opportunity must endure.":
   " Seeking structural change turns attention toward who controls opportunity.";
 const discovery=(result+actionContext).slice(0,230);
 const connection="Woolf's argument concerns enabling conditions for women writers. Money, privacy and institutional access can create opportunity—not guarantee achievement.";
 const question=same?
   "What would turn this temporary improvement into a reliable condition?":
   s.action==="challenge"?
   "When is a personal obstacle actually an institutional one?":
   "What would remain difficult even after this one barrier disappeared?";
 const headline=same?"An opened door can still be hard to enter.":
   s.action==="challenge"?"Freedom also depends on who holds the keys.":
   "One improved condition doesn't erase the others.";
 const nodes=[
  {label:"Improved",value:improvement,kind:"gain"},
  {label:"Still constrained",value:limitation,kind:"barrier"},
  {label:"Next move",value:action,kind:"action"}
 ];
 return createInsightPacket({
   quote:{id:28,text:record.quote.text,author:record.quote.author,source:record.sourcePassage.work},
   mechanism:"decision_map",scenarioId:"women-writing-material-conditions",
   observation:{text:"Improved: "+improvement+" · Still limited by: "+limitation+" · Response: "+action,
     resource:s.resource,barrier:s.barrier,action:s.action},
   insight:{
     headline,discovery,connection,question,ruleId:"dependency:"+structure+":"+s.action,
     conceptualRelation:grammar.conceptualStructure.relation,
     limit:"A fictional branch cannot prove a writer's ability or predict publication. Historical gender and institutional barriers are not reducible to personal preference.",
     tension:"An enabling resource can be present even while other constraints remain."
   },
   visual:{type:"path",nodes},
   trace:{
     rules:["enabling-condition:"+s.resource,"remaining-barrier:"+s.barrier,"response:"+s.action,
       "non-determinism:no-achievement-prediction","source-relation:material-conditions"],
     sourceReferences:provenance(record),
     philosophicalClaim:grammar.conceptualStructure.claim,
     epistemicStatus:"contextual_interpretation_not_truth"
   }
 });
}
export function runEncounter(kind,input) {
 if(kind==="seneca")return reasonSeneca(input);
 if(kind==="woolf")return reasonWoolf(input);
 throw new RangeError("Only founder-approved interaction patterns are available in this pilot");
}
