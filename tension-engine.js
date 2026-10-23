// YourLogos V3.4 — deterministically curated Tension Engine.
// No LLM calls. No generic theme-generated philosophical judgments.
import { A } from "./tension-catalogue-a.js";
import { B } from "./tension-catalogue-b.js";
import { C } from "./tension-catalogue-c.js";
import { D } from "./tension-catalogue-d.js";
import { E } from "./tension-catalogue-e.js";
export const SCHOOL_IDS = ["stoicism","existentialism","nihilism","skepticism","daoism","buddhism","confucianism","epicureanism","idealism","pragmatism"];
export const TYPES=["resist","doubt","reframe"];
export const CURATED=[...A,...B,...C,...D,...E];
export function validateTensionRecords(records=CURATED){
  const errors=[],seenIds=new Set(),seenMatches=new Set();
  for(const r of records){
    if(!Number.isInteger(r.id)||r.id<0||seenIds.has(r.id))errors.push("Duplicate or invalid id: "+r.id);
    seenIds.add(r.id);
    if(!r.match||seenMatches.has(r.match))errors.push("Duplicate or empty match: "+r.id);
    seenMatches.add(r.match);
    if(!r.claim||!r.warrant||!r.friction||!Array.isArray(r.poles)||r.poles.length!==2||r.poles.some(x=>!x))errors.push("Missing philosophical reconstruction: "+r.id);
    if(!Array.isArray(r.moves)||r.moves.length!==3)errors.push("Expected three distinct moves: "+r.id);
    (r.moves||[]).forEach((m,i)=>{
      if(m.type!==TYPES[i])errors.push("Wrong move type/order: "+r.id);
      if(!m.target||!m.title||!m.followup||!Array.isArray(m.answers)||m.answers.length!==2)errors.push("Missing reasoned move: "+r.id+" "+i);
      (m.answers||[]).forEach(a=>{
        if(!a.label||!a.insight||!a.concept||!SCHOOL_IDS.includes(a.school))errors.push("Invalid destination concept: "+r.id);
      });
    });
    if(new Set((r.moves||[]).map(x=>x.title.toLowerCase())).size!==3)errors.push("Repeated moves: "+r.id);
  }
  return errors;
}
const index=new Map(CURATED.map(x=>[x.id,x]));
export function resolveTension(quote,quoteId){
  const record=index.get(quoteId);
  // Quote IDs are stable local IDs; verify the quote text as a fail-closed guard.
  if(!record||typeof quote?.[0]!=="string"||!quote[0].includes(record.match))return null;
  return record;
}
export function getEngineCoverage(quotes){
  return {curated:quotes.filter((q,i)=>resolveTension(q,i)).length,total:quotes.length};
}
export function findDestination(quote,quoteId,branchIndex,answerIndex){
  const record=resolveTension(quote,quoteId);
  const answer=record?.moves?.[branchIndex]?.answers?.[answerIndex];
  return answer?{school:answer.school,concept:answer.concept}:null;
}
