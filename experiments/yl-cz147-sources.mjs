/**
 * CZ-147: versioned SOURCE DATA, not shared engine logic.
 * Every quote is byte-identical to the accepted app catalogue. All new
 * admissions remain internal and PROVISIONAL; no scholarly sign-off asserted.
 * The same source-neutral engines process all families/authors below.
 */
import {B27_APP_QUOTES} from "./yl-b27-quote-ledger.mjs";
export const CZ147_RESEARCH_VERSION="cz147-editorial-research/1";
const q=id=>B27_APP_QUOTES[id];
const warrant=["source:central","scenario:fictional","source:boundary"];
const make=(id,fields)=>({
 recordId:"cz147:quoted-source:"+id,quoteId:id,version:CZ147_RESEARCH_VERSION,
 status:"development_provisional",developmentOnly:id>=91,
 source:{text:q(id)[0],author:q(id)[1],work:q(id)[3],
  referenceUrl:fields.referenceUrl??""},
 evidenceIds:[...warrant],publicationAllowed:false,
 prohibitedInferences:["actual emotion","personality diagnosis","moral ranking","historical prediction"],
 ...fields
});
const allocation=(capacity,unit,labels,initial,repetitions=null)=>({
 resourceCapacity:capacity,resourceType:"exact",unitName:unit,
 choices:labels.map((label,i)=>({id:"activity_"+i,label})),
 initial,repetitions,lenses:[]});
const edge=(aId,bId,relationId,label,claim)=>({
 aId,bId,relationId,label,claim,warrantIds:["source:central","scenario:fictional"]});
const relation=(cards,edges)=>({
 cards:cards.map(([id,label,detail])=>({id,label,detail,glyph:"link"})),
 edges,minimumPairs:1,maximumPairs:2,noCorrectMatch:true});
function routes(starts,scenes,responses){
 const result=[];
 for(const start of starts)for(const scene of scenes)for(const response of responses)
  result.push({startId:start.id,startLabel:start.label,
   sceneId:scene.id,sceneLabel:scene.label,authoredText:[scene.text],
   responseId:response.id,responseLabel:response.label,
   responseStance:response.stance,authoredFutureIsPrediction:false,
   path:[start.id,scene.id,response.id]});
 return result;
}
export const CZ147_SOURCE_RECORDS=Object.freeze([
 make(12,{
  philosophicalOperation:{"kind":"habitual_pattern","focus":"repeated daily practices","contrast":"one invented evening versus a lived pattern","sourceWarrantIds":["source:central"]},
  exposeInApp:false,familyId:"balance_move",title:"The shape of an ordinary evening",
  intro:"Imagine six fictional half-hour slots. You can make something, answer messages, or rest; each possibility uses time that cannot be spent twice.",
  humanTension:"A creative intention competes with everyday messages and the need to rest.",
  sourceThesis:"Repeated ordinary days can form the pattern of a life",
  evidenceClaim:"The use of recurring time gives a pattern its shape",
  epistemicLimits:"These imaginary evenings do not reveal actual habits or a better moral identity",
  compactLimit:"This is no measure of your real life",
  counterexample:"One productive evening cannot prove the pattern of an entire lifetime",
  readerAgency:"Divide the available imaginary evening without inventing extra time",
  reflectionQuestion:"If this pattern recurred, what would you wish to protect next time?",
  supportedConclusions:["Time allocations can illustrate repeated patterns"],
  affordances:["tradeoff_attention","choice_awareness","curious_reflection"],
  allocation:allocation(6,"half-hour slots",["making something","answering messages","resting"],[2,2,2],5)
 }),
 make(49,{
  philosophicalOperation:{"kind":"deliberate_use","focus":"deliberate use of finite time","contrast":"chosen purpose versus automatic busyness","activityRoles":[{"id":"activity_0","role":"deliberate_practice"},{"id":"activity_1","role":"possible_distraction"},{"id":"activity_2","role":"restorative_pause"}],"sourceWarrantIds":["source:central"]},
  exposeInApp:true,familyId:"balance_move",title:"Where the evening goes",
  intro:"After a demanding day you have eight imagined half-hour slots. Study, idle scrolling and needed rest each draw on the same evening; this is not a productivity judgment.",
  humanTension:"Having time does not settle how to use it well; rest is not automatically waste.",
  sourceThesis:"A lifetime may be consumed by busyness without deliberate direction",
  evidenceClaim:"How time is used matters alongside how much time remains",
  epistemicLimits:"Eight invented slots cannot establish how this reader actually spends time",
  compactLimit:"This evening is invented, not your actual routine",
  counterexample:"Resting when needed is not identical to Seneca's critique of idle distraction",
  readerAgency:"Distribute eight fictional half-hours among three ordinary purposes",
  reflectionQuestion:"Which use of your time seems deliberate without making rest an enemy?",
  supportedConclusions:["Imagined time can illuminate competing uses, without measuring virtue"],
  affordances:["tradeoff_attention","choice_awareness","curious_reflection"],
  referenceUrl:"https://www.whatwouldstoicsdo.com/passage/on-the-shortness-of-life/2.1",
  allocation:allocation(8,"half-hour slots",["study","idle scrolling","rest"],[3,2,3])
 }),
 make(91,{
  philosophicalOperation:{"kind":"coordinated_work","focus":"distinct contributions to a completed result","contrast":"division of work versus moral endorsement","sourceWarrantIds":["source:central"]},
  exposeInApp:false,familyId:"tap_pair",title:"A shared gift before tomorrow",
  intro:"Two friends need a gift by tomorrow. Keeping the design to yourself preserves control; dividing the practical tasks makes completion depend on several contributions.",
  humanTension:"Maintaining control of a personal idea or relying on a friend's complementary contribution.",
  sourceThesis:"Divided work can increase output through coordinated specialized contributions",
  evidenceClaim:"A finished product may depend on distinct stages of work",
  epistemicLimits:"The imagined gift does not establish trust, fairness or the best friendship decision",
  compactLimit:"The invented gift cannot prove kindness or fairness",
  counterexample:"Smith's productivity argument does not settle whether sharing personal work is kind",
  readerAgency:"Choose one or two source-warranted conceptual links between contributions",
  reflectionQuestion:"What would you share while leaving friendship judgments outside this example?",
  supportedConclusions:["Different stages can contribute to a completed object"],
  affordances:["curious_reflection","boundary_awareness"],
  relation:relation([
   ["design","Your design","The imagined creative plan"],
   ["friend","Friend's handiwork","Another person's practical contribution"],
   ["assembly","Assembly","The work of joining the parts"],
   ["gift","Finished gift","The imagined shared product"]
  ],[
   edge("design","friend","complementarity","Complementary contributions","Design and handiwork contribute distinct parts of the imagined shared product"),
   edge("friend","assembly","coordination","Coordinated stages","Handiwork requires assembly to form this particular invented gift"),
   edge("assembly","gift","dependence","Finishing the product","The finished gift depends on its assembly in this fictional situation"),
   edge("design","gift","dependence","Design and result","The planned gift depends partly on its imagined design")
  ])
 }),
 make(23,{
  philosophicalOperation:{"kind":"self_governance","focus":"independent judgment and agency","contrast":"self-government rather than domination","sourceWarrantIds":["source:central"]},
  exposeInApp:true,familyId:"tap_pair",title:"Whose freedom does this serve?",
  intro:"Imagine a community group discussing girls' access to education. Some members confuse women's independence with having authority over men. Explore the distinction rather than choosing anyone's worth.",
  humanTension:"Supporting self-government without making another person's subordination the goal.",
  sourceThesis:"Women's independence concerns governing themselves, not dominating men",
  evidenceClaim:"Education supports the exercise of independent judgment and equal standing",
  epistemicLimits:"A fictional group debate cannot measure anyone's actual rights or ethical worth",
  compactLimit:"These conceptual links do not prove a person's virtue",
  counterexample:"Calling domination empowerment would invert the distinction in the cited argument",
  readerAgency:"Connect concept pairs that distinguish self-government from domination",
  reflectionQuestion:"What kind of independence could grow without reducing another person's agency?",
  supportedConclusions:["Self-government and authority over others are different claims"],
  affordances:["boundary_awareness","curious_reflection"],
  referenceUrl:"https://oll.libertyfund.org/titles/wollstonecraft-a-vindication-of-the-rights-of-woman",
  relation:relation([
   ["education","Girls' education","Access to education and learning"],
   ["judgment","Independent judgment","A woman's own reasoning capacity"],
   ["dominance","Power over men","Authority imposed upon another person"],
   ["agency","Self-government","The exercise of one's own agency"]
  ],[
   edge("education","judgment","support","Education and judgment","Access to education can support the exercise of independent judgment"),
   edge("judgment","agency","dependence","Agency through judgment","Reasoning for oneself is part of governing oneself in this illustration"),
   edge("dominance","agency","contrast","Domination is different","Power over others is not equivalent to a woman's self-government"),
   edge("education","agency","support","Education for independence","Education can support women's independence rather than a claim to dominate men")
  ])
 }),
 make(34,{
  philosophicalOperation:{"kind":"retrospective_limits","focus":"forward commitment and partial hindsight","contrast":"lived path versus unobserved alternatives","sourceWarrantIds":["source:central"]},
  exposeInApp:false,familyId:"decision_cards",title:"Before hindsight arrives",
  intro:"Imagine deciding whether to remain at familiar work or explore a change. You will see one invented later possibility, not a prediction of what either decision will cause.",
  humanTension:"A known commitment offers stability while an untested future remains uncertain.",
  sourceThesis:"One must live choices forward before hindsight supplies partial understanding",
  evidenceClaim:"The unchosen future cannot be recovered as a known comparison",
  epistemicLimits:"No authored scene predicts either job or the alternative life",
  compactLimit:"The alternative future remains unknown",
  counterexample:"Knowing one imagined ending does not establish what the other path would contain",
  readerAgency:"Choose first, see one invented development, and respond",
  reflectionQuestion:"What can you responsibly choose without requiring a complete future forecast?",
  supportedConclusions:["A decision occurs before its later interpretation"],
  affordances:["uncertainty_awareness","choice_awareness","revisability"],
  timeline:routes([
   {id:"stay",label:"You remain in familiar work"},
   {id:"change",label:"You investigate a different role"}
  ],[
   {id:"surprise",label:"an unexpected project arrives",text:"An imagined project appears without proving either path right"},
   {id:"delay",label:"a decision gets delayed",text:"An imaginary delay leaves some questions unanswered about both paths"}
  ],[
   {id:"reconsider",label:"You reconsider your reasons",stance:"reconsider"},
   {id:"continue",label:"You continue your plan",stance:"hold"}
  ])
 }),
 make(55,{
  philosophicalOperation:{"kind":"independent_judgment","focus":"present reasons behind a commitment","contrast":"independent judgment versus foolish consistency","startRoles":[{"id":"maintain","role":"retain_prior"},{"id":"revisit","role":"reexamine_prior"}],"sourceWarrantIds":["source:central"]},
  exposeInApp:true,familyId:"decision_cards",title:"When a past opinion meets today",
  intro:"A neighborhood group must revisit a public plan. New details emerge, and everyone remembers what you previously said. The dilemma is whether consistency is serving the question or merely your reputation.",
  humanTension:"Keeping a public promise of consistency or revisiting your judgment when circumstances shift.",
  sourceThesis:"Fidelity to earlier words is not always faithful to present judgment",
  evidenceClaim:"A mistaken insistence on consistency can inhibit independent thought",
  epistemicLimits:"A revised view is not automatically wiser, nor is keeping a view always cowardly",
  compactLimit:"Revision itself cannot guarantee a better judgment",
  counterexample:"Emerson criticizes foolish consistency, not every principled commitment",
  readerAgency:"Choose a stance before seeing an invented complication and reconsider",
  reflectionQuestion:"When might a changed answer express integrity rather than mere inconsistency?",
  supportedConclusions:["Past statements are not sufficient evidence for a present judgment"],
  affordances:["revisability","choice_awareness","uncertainty_awareness"],
  referenceUrl:"https://anthology.lib.virginia.edu/work/Emerson/emerson-self-reliance",
  timeline:routes([
   {id:"maintain",label:"You keep the original plan"},
   {id:"revisit",label:"You open the plan to revision"}
  ],[
   {id:"details",label:"new facts complicate the plan",text:"Additional fictional details raise questions about the original decision"},
   {id:"critique",label:"a neighbor raises an objection",text:"An invented neighbor asks for reasons rather than a declaration"}
  ],[
   {id:"consider",label:"You reconsider the evidence",stance:"reconsider"},
   {id:"explain",label:"You explain your present reasons",stance:"hold"}
  ])
 }),
 make(94,{
  philosophicalOperation:{"kind":"retrospective_limits","focus":"the partial view gained by looking back","contrast":"lived path versus unobserved alternatives","sourceWarrantIds":["source:central"]},
  exposeInApp:false,familyId:"flip_reveal",title:"The limits of looking back",
  intro:"Imagine choosing a working life before everything unfolds. One of two made-up scenes will be revealed; it cannot stand for the future you did not live.",
  humanTension:"Choosing amid uncertainty while later understanding remains partial.",
  sourceThesis:"Even hindsight cannot grant an external view of every lived possibility",
  evidenceClaim:"An alternative life remains unavailable as an observed outcome",
  epistemicLimits:"The revealed scene is fiction and cannot prove what your future holds",
  compactLimit:"The unrevealed future is still unknown",
  counterexample:"A retrospective interpretation cannot reveal a life that was never lived",
  readerAgency:"Choose an action, reveal one authored possibility, then answer it",
  reflectionQuestion:"What could you accept about hindsight without imagining complete certainty?",
  supportedConclusions:["Later interpretation remains limited by lived experience"],
  affordances:["uncertainty_awareness","revisability","choice_awareness"],
  timeline:routes([
   {id:"stay",label:"You keep the current position"},
   {id:"change",label:"You explore a different position"}
  ],[
   {id:"welcome",label:"a colleague changes teams",text:"A fictional colleague moves without revealing any real future"},
   {id:"surprise",label:"an unexpected task appears",text:"An invented task appears without establishing a causal prediction"}
  ],[
   {id:"reflect",label:"You reflect on the limits",stance:"observe"},
   {id:"adjust",label:"You reconsider a next step",stance:"reconsider"}
  ])
 }),
 make(48,{
  philosophicalOperation:{"kind":"event_acceptance","focus":"agency over responses to events","contrast":"chosen response versus externally determined occurrence","sourceWarrantIds":["source:central"]},
  exposeInApp:true,familyId:"flip_reveal",title:"An outcome you cannot command",
  intro:"Imagine preparing for an uncomfortable exchange. You can choose your approach, but another person's actions are not yours to script. Reveal one fictional development, then decide what response remains available.",
  humanTension:"Preparing carefully while accepting that the other person's response is not under your control.",
  sourceThesis:"Wisdom asks us to meet events as they occur, rather than require our preferred outcome",
  evidenceClaim:"The response to a happening differs from control over the happening itself",
  epistemicLimits:"An invented response does not predict another person or justify passive resignation",
  compactLimit:"This does not predict or excuse another person's behavior",
  counterexample:"Acceptance of an event does not demand surrendering every possible future action",
  readerAgency:"Choose a preparation, reveal an event not caused by that choice, then respond",
  reflectionQuestion:"How might you accept what occurred without giving up deliberate action?",
  supportedConclusions:["Acceptance of events is distinct from controlling them"],
  affordances:["uncertainty_awareness","choice_awareness","revisability"],
  referenceUrl:"https://classics.mit.edu/Epictetus/epicench.html",
  timeline:routes([
   {id:"prepare",label:"You prepare what to say"},
   {id:"listen",label:"You leave room to listen"}
  ],[
   {id:"silence",label:"the other person stays silent",text:"The imaginary listener says nothing in this authored possibility"},
   {id:"delay",label:"the meeting is postponed",text:"An invented delay occurs independently of your initial preparation"}
  ],[
   {id:"respond",label:"You attend to your response",stance:"observe"},
   {id:"try",label:"You try another careful action",stance:"hold"}
  ])
 })
]);
export const CZ147_RESEARCH_MATRIX=Object.freeze([
 ...CZ147_SOURCE_RECORDS.map(r=>({
  quoteId:r.quoteId,author:r.source.author,work:r.source.work,
  operation:r.familyId,status:r.exposeInApp?"admitted_internal_app":"generic_engine_regression",
  sourceReview:"editorial_provisional_no_external_scholarly_approval",
  limitation:r.epistemicLimits
 })),
 ...[
  [21,"Mill","argument_and_counterargument","capability_research","A relation-card pairing cannot reconstruct the strongest opposing argument"],
  [28,"Woolf","material_preconditions_for_creative_freedom","source_review","Financial independence and writing space require source-context review before game mechanics"],
  [56,"Hume","belief_proportioned_to_evidence","capability_research","An evidence-updating operator must validate qualified evidence rather than popularity"],
  [71,"Kant","universalizable_maxim","capability_research","Requires formal maxim formulation and universalization, not a secret morality card"],
  [63,"Hegel","retrospective_historical_comprehension","no_fit","Historical mediation of an epoch cannot be equated with one invented career event"],
  [77,"Confucius","study_and_reflection","source_review","The truncated translation and precise study/reflection relationship require review"],
  [90,"Mencius","incipient_compassion","capability_research","A clicked rescue scenario cannot prove actual compassion or moral character"]
 ].map(([id,author,operation,status,limitation])=>({
  quoteId:id,author,work:q(id)[3],operation,status,limitation,
  sourceReview:"provisional_research_only"
 }))
]);
