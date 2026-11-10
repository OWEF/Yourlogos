/**
 * CZ-116 Parallel Mechanism Transfer v0.1.
 *
 * Research cases, NOT editorially approved interpretations. Separate:
 *   interaction transfer / generic rule-kernel transfer / source fidelity.
 *
 * Source IDs 23/34/49/28/22 reference the exact existing 15-quote Atlas.
 * ID 12 is currently only in bundled app.js and has SECONDARY excerpt
 * corroboration; it is NOT part of the approved Atlas or generalizable.
 * This file changes no existing records or production behavior.
 */
import { ATLAS_PILOT_V01 } from "../context-atlas/pilot-records-v01.js";
import { evaluatePhilosophicalGrammar } from "../context-atlas/grammar-v01.js";

const atlasFor=(id,mechanism)=>{
 const record=ATLAS_PILOT_V01.find(r=>r.id===id);
 if(!record)throw new RangeError("No Context Atlas pilot record for quote "+id);
 const grammar=evaluatePhilosophicalGrammar(record);
 if(mechanism&&grammar.interactiveRealization.candidate!==mechanism)
   throw new Error("Atlas rejects "+mechanism+" for quote "+id);
 if(grammar.interactiveRealization.allowedForProduction!==false)
   throw new Error("Experimental source must not be production eligible");
 return {record,grammar};
};
const b=(id,label,detail)=>Object.freeze({id,label,detail});
const branches=(key,prompt,options)=>Object.freeze({key,prompt,options});
const money=b("income","She earns her own money","An independent financial base");
const room=b("space","She gets a quiet room","Some time without interruptions");
const education=b("education","She receives a serious education","She can develop her own judgment");
const selfDetermination=b("voice","She can make some decisions herself","Others no longer decide everything for her");

export const MECHANISM_TRANSFER_CASES=Object.freeze({
 seneca:{
   id:"seneca",quoteId:49,author:"Seneca",family:"tradeoff",
   label:"Seneca · original control",role:"baseline_control",
   review:"provisional_reference",citationSource:"On the Shortness of Life",
   context:"Seneca challenges occupations that consume life without deliberation; the three free hours are an illustrative constraint, not a formula from the text.",
   scenario:"After essential commitments, you have three genuinely free hours tonight. An optional work request arrives, a friend asks to see you, and you hoped for quiet reflection.",
   categories:["Optional work","A friend","Quiet reflection"],
   timeFrame:"one_discretionary_evening",
   sourceRelation:"Deliberate use of finite time, not an optimal allocation of hours.",
   guard:"A hypothetical evening cannot reveal the worth of a whole life or determine whether duties are objectively necessary."
 },
 dillard:{
   id:"dillard",quoteId:12,author:"Annie Dillard",family:"tradeoff",
   label:"Annie Dillard · transfer",role:"conditional_transfer",
   review:"outside_atlas_secondary_excerpt_needs_editorial_review",
   quote:"How we spend our days is, of course, how we spend our lives.",
   citationSource:"The Writing Life (1989), scheduling passage",
   sourceUrl:"https://www.dltn.io/posts/annie-dillard-keep-a-daily-routine",
   context:"Dillard discusses a schedule as a deliberate structure that protects time from distraction and makes repeated days into a life. The passage is written about writing and daily routine; it does not rank occupations or prescribe a perfect schedule.",
   scenario:"Imagine a typical weekday after essential commitments. You have three discretionary hours for optional work, time with a friend, or quiet reflection. Imagine choosing a similar pattern on five weekdays; no claim is made that you actually live this way.",
   categories:["Optional work","A friend","Quiet reflection"],
   timeFrame:"hypothetical_repeated_five_weekdays",
   sourceRelation:"Daily schedules accumulate over time; a pattern of chosen hours can shape a life without making any one evening determinative.",
   guard:"The repeated-week calculation is a conditional teaching illustration, not an observation of the user's real habits. Dillard does not say work is bad or that equal time allocations are ideal."
 },
 woolf:{
   id:"woolf",quoteId:28,author:"Virginia Woolf",family:"decision_map",
   label:"Virginia Woolf · original control",role:"baseline_control",
   review:"provisional_reference",
   citationSource:"A Room of One's Own, Chapter I",
   context:"Money, private working space, and access to institutions can enable writing without guaranteeing publication or artistic achievement.",
   startingPoint:"She wants to write fiction",
   semanticModel:"enabling_conditions",
   sourceRelation:"The material conditions of creative opportunity are not the same as certainty of achievement.",
   guard:"Keep the historical gendered constraints; a branch is a thought experiment, not an outcome prediction.",
   steps:[
    branches("resource","What improves first?",[money,room]),
    branches("barrier","What still gets in her way?",{
      income:[b("space","She keeps getting interrupted","A secure income alone does not create privacy"),b("access","Nobody will give her a chance","Institutions still decide whose work circulates")],
      space:[b("income","She still needs more money","She needs resources to keep working"),b("access","Nobody will give her a chance","Institutions still decide whose work circulates")]
    }),
    branches("action","How does she respond?",{
      space:[b("write","She writes when she can","Begin under imperfect conditions"),b("protect","She protects her writing time","Make the improvement last")],
      access:[b("write","She keeps writing","Keep creating even if recognition is delayed"),b("challenge","She challenges the gatekeepers","Try to change who gets to be heard")],
      income:[b("write","She writes anyway","Find a way to start"),b("challenge","She challenges unequal conditions","Address the economic barrier")]
    })
   ]
 },
 wollstonecraft:{
   id:"wollstonecraft",quoteId:23,author:"Mary Wollstonecraft",family:"decision_map",
   label:"Mary Wollstonecraft · transfer",role:"conditional_transfer",
   review:"atlas_candidate_editorial_review_required",
   citationSource:"A Vindication of the Rights of Woman (1792), Chapter IV",
   sourceUrl:"https://www.britlit.org/pub/5v9vgtqk/release/4",
   context:"Wollstonecraft argues for women's education and independent exercise of reason, rather than power over men. Her critique concerns social arrangements restricting rational autonomy.",
   startingPoint:"She wants to decide for herself",
   semanticModel:"enabling_conditions",
   sourceRelation:"Access to education and opportunities to exercise judgment can help develop autonomy; neither a single resource nor personal effort guarantees freedom from structural subordination.",
   guard:"Do not treat education as instant emancipation or portray women as personally to blame for barriers created by institutions. Source wording requires editorial review.",
   steps:[
    branches("resource","What opens up first?",[education,selfDetermination]),
    branches("barrier","What still limits her?",{
      education:[b("dependence","Her family still makes the decisions","Her learning does not settle who controls her choices"),b("exclusion","Others dismiss her as a thinker","Institutions still deny her equal standing")],
      voice:[b("education_gap","She was denied a good education","She lacks the learning made available to others"),b("economic","She still depends on someone financially","Her choice may remain materially precarious")]
    }),
    branches("action","What does she try next?",{
      dependence:[b("reason","She argues for her own judgment","Ask others to recognize her reasoning"),b("allies","She asks for support","Seek people who respect her autonomy")],
      exclusion:[b("study","She keeps learning","Continue exercising judgment"),b("challenge","She challenges the unfair rule","Try to change who is treated as credible")],
      education_gap:[b("study","She seeks opportunities to learn","Pursue the education she was denied"),b("challenge","She challenges unequal schooling","Question the rule restricting her education")],
      economic:[b("earn","She seeks independent income","Reduce material dependence"),b("challenge","She challenges the dependency","Try to change what limits her choices")]
    })
   ]
 },
 kierkegaard:{
   id:"kierkegaard",quoteId:34,author:"Søren Kierkegaard",family:"decision_map",
   label:"Kierkegaard · boundary stress test",role:"stress_test_ui_only",
   review:"atlas_candidate_translation_and_model_review_required",
   citationSource:"Journal JJ:167 (1843), shortened variant",
   sourceUrl:"https://homepage.divms.uiowa.edu/~jorgen/kierkegaardquotesource.html",
   context:"The fuller journal note contrasts the retrospective understanding of life with the necessity of living forward. It also denies that one can step outside time to understand a life fully.",
   startingPoint:"A choice must be made before the future is known",
   semanticModel:"temporal_information_asymmetry",
   sourceRelation:"The information available before acting differs from the retrospective account afterward; this is not the same causal mechanism as Woolf's or Wollstonecraft's enabling conditions.",
   guard:"Branches are invented illustrations, not things Kierkegaard predicted. Never reveal future results at the decision stage, assign success, or treat a retrospectively told story as full understanding.",
   steps:[
    branches("resource","Which direction do you choose now?",[
      b("change","You begin something new","Act despite not knowing what happens"),
      b("stay","You stay with the present path","Keep what you already know")
    ]),
    branches("barrier","Which uncertainty becomes visible?",{
      change:[b("risk","The outcome is uncertain","No guarantee the change will work"),b("surprise","An unexpected obstacle appears","The situation changes along the way")],
      stay:[b("missed","You wonder about the road not taken","Another possibility remains unknown"),b("surprise","An unexpected change appears anyway","Staying cannot freeze circumstances")]
    }),
    branches("action","What do you do with this uncertainty?",{
      risk:[b("continue","You continue for now","Remain committed without certainty"),b("revisit","You reconsider as you learn","Revise the plan in response to events")],
      surprise:[b("adapt","You adjust what you can","Meet a change not visible in advance"),b("continue","You keep going for now","Accept that complete certainty is unavailable")],
      missed:[b("reflect","You examine the choice again","Consider a path you cannot directly observe"),b("continue","You remain with your choice","Commit without knowing an alternative future")]
    })
   ]
 },
 marx:{
   id:"marx",quoteId:22,author:"Karl Marx",family:"none",requestedMechanism:"tradeoff",
   label:"Karl Marx · rejection control",role:"reject_incompatible",
   review:"atlas_no_fit",
   citationSource:"Theses on Feuerbach, Thesis XI",
   context:"Marx critiques merely contemplative philosophy disconnected from transformative praxis. His thesis does not establish that theory and action must compete for a fixed number of hours.",
   sourceRelation:"The relation of theory and praxis is not a finite time-allocation dilemma.",
   guard:"Reject a 'thinking versus doing' slider; it would introduce a false opposition absent from this passage."
 }
});
for(const id of ["seneca","woolf","wollstonecraft","kierkegaard","marx"]){
 const spec=MECHANISM_TRANSFER_CASES[id];
 const {grammar}=atlasFor(spec.quoteId);
 if(id==="marx"&&grammar.interactiveRealization.candidate!=="none")throw Error("Expected abstention for Marx");
 if(id==="wollstonecraft"&&grammar.interactiveRealization.candidate!=="decision_map")throw Error("Atlas does not support conditional transfer");
 if(id==="kierkegaard"&&grammar.interactiveRealization.candidate!=="decision_map")throw Error("Atlas does not support temporal stress test");
 if(id==="seneca"&&grammar.interactiveRealization.candidate!=="tradeoff")throw Error("Atlas control changed");
 if(id==="woolf"&&grammar.interactiveRealization.candidate!=="decision_map")throw Error("Atlas control changed");
}
export function getMechanismCase(id){
 if(!Object.hasOwn(MECHANISM_TRANSFER_CASES,id))throw new RangeError("Unknown quoted case");
 return MECHANISM_TRANSFER_CASES[id];
}
export function optionsFor(spec,key,prior){
 const stage=spec.steps?.find(s=>s.key===key);
 if(!stage)throw new RangeError("Unknown fork stage");
 if(Array.isArray(stage.options))return stage.options;
 if(!Object.hasOwn(stage.options,prior||""))throw new RangeError("No relevant next stage for "+key+"/"+prior);
 return stage.options[prior];
}
export function sourceTrace(id){
 const spec=getMechanismCase(id);
 if(spec.quoteId===12)return [
  {url:"app.js",supports:"Bundled quote text and stable ID"},
  {url:spec.sourceUrl,supports:"Secondary excerpt and discussion of schedules in The Writing Life"}
 ];
 const {record}=atlasFor(spec.quoteId);
 const curated=record.sourcePassage.references.map(ref=>({url:ref.url,supports:ref.supports}));
 // A newly located source is a *parallel-study lead*, not a silent editorial
 // promotion of the untouched Atlas record. Kierkegaard's Atlas entry currently
 // contains only the bundled catalogue reference.
 if(spec.sourceUrl&&!curated.some(ref=>ref.url===spec.sourceUrl)){
   curated.push({url:spec.sourceUrl,
     supports:"Additional external passage lead from parallel research; not yet incorporated into the Context Atlas or editorially approved"});
 }
 return curated;
}
export function candidateFitAudit(){
 return Object.values(MECHANISM_TRANSFER_CASES).map(spec=>{
   const inAtlas=spec.quoteId!==12;
   const grammar=inAtlas?atlasFor(spec.quoteId).grammar:null;
   return {
    id:spec.id,quoteId:spec.quoteId,role:spec.role,family:spec.family,
    uiTransfer:spec.role==="reject_incompatible"?"blocked":"prototype_testable",
    modelTransfer:spec.role==="baseline_control"?"reference_only":
      spec.id==="dillard"?"conditional_same_allocation_kernel":
      spec.id==="wollstonecraft"?"conditional_same_enabling_condition_kernel":
      spec.id==="kierkegaard"?"ui_only_different_temporal_semantics":"rejected_false_dilemma",
    sourceFit:spec.role==="reject_incompatible"?"atlas_no_fit":
      inAtlas?grammar.interactiveRealization.eligibility:"outside_atlas_source_review_required",
    productionEligible:false,
    review:spec.review,guard:spec.guard
   };
 });
}
