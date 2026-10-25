import { resolveTension, findDestination } from "./tension-engine.js";
// YourLogos V3.3 — Question threads.
// Small editorial graph: a proposition, three genuine counter-moves, one follow-up,
// then an optional doorway to a curated Library tradition. No grading or scores.
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const MOVES=[
  {id:"resist",label:"BUT…",color:"coral"},
  {id:"doubt",label:"WHY?",color:"blue"},
  {id:"reframe",label:"WHAT IF?",color:"sage"}
];
const branch=(title,followup,a,b)=>({title,followup,answers:[a,b]});
const answer=(label,school,insight)=>({label,school,insight});
const editorial=[
  {match:"Of things some are in our power",question:"If outcomes aren't yours, why resist injustice?",branches:[
    branch("An unjust world won't change itself.","Can resistance matter without winning?",answer("The action matters, even without victory.","stoicism","Action is yours. The outcome may not be."),answer("Change begins when we choose to act.","existentialism","Freedom carries responsibility.")),
    branch("Who decides what is beyond us?","How do you know where your influence ends?",answer("Question that boundary.","skepticism","Even certainty about limits can be examined."),answer("Act with the judgment you have.","stoicism","Uncertainty needn't mean paralysis.")),
    branch("Maybe control is the wrong goal.","Is freedom mastery—or responsiveness?",answer("Work with what changes.","daoism","Not every action needs to force an outcome."),answer("Choose your own response.","stoicism","An inner response can remain free."))]},
  {match:"The unexamined life is not worth living",question:"Can you examine life so much that you forget to live it?",branches:[
    branch("Reflection can become avoidance.","What makes an examined life worth living?",answer("Put insight into action.","existentialism","An idea becomes a life through commitment."),answer("Practice a better judgment.","stoicism","Inquiry changes how we act.")),
    branch("Who decides which life is examined?","Can you know another person's inner life?",answer("Suspend easy judgments.","skepticism","Appearances don't reveal everything."),answer("Look beyond the self.","buddhism","Attention can be more than self-analysis.")),
    branch("Maybe living is itself a kind of inquiry.","Can experience teach what argument cannot?",answer("Explore lived possibility.","existentialism","Meaning is lived, not merely stated."),answer("Attend to what unfolds.","daoism","Knowing needn't always mean controlling."))]},
  {match:"Become who you are",question:"How can you become yourself if you're always changing?",branches:[
    branch("Maybe there is no fixed self to become.","Must identity remain the same over time?",answer("Let the self change.","buddhism","Continuity needn't be a fixed essence."),answer("Choose what you become.","existentialism","Your actions shape a life.")),
    branch("Who says you know your true self?","When does self-knowledge become illusion?",answer("Interrogate the certainty.","skepticism","Self-knowledge is also fallible."),answer("Test yourself in action.","existentialism","Choice reveals what abstractions conceal.")),
    branch("Becoming may matter more than being.","Can a person be a process, not a thing?",answer("Stay open to transformation.","existentialism","Identity unfolds through choices."),answer("Move with change.","daoism","A living path needn't stand still."))]},
  {match:"owl of Minerva spreads its wings",question:"If wisdom arrives too late, how can it guide us?",branches:[
    branch("Understanding after the fact isn't enough.","Must philosophy change the world, not just explain it?",answer("Act even without certainty.","existentialism","Action can't always await full understanding."),answer("Examine what action can control.","stoicism","Reflection can still shape conduct.")),
    branch("How can we know when an era has ended?","Who gets to declare a history complete?",answer("Doubt the final account.","skepticism","Every historical verdict can be questioned."),answer("Notice how contexts shift.","daoism","Understanding follows changing conditions.")),
    branch("Maybe hindsight changes the next beginning.","Can late understanding still matter?",answer("Use what was learned.","stoicism","Past events can clarify future judgments."),answer("Stay open to revision.","skepticism","Knowledge remains a continuing inquiry."))]},
  {match:"One must imagine Sisyphus happy",question:"Does calling suffering meaningful make it easier to endure?",branches:[
    branch("Happiness can't be commanded.","Is defiance still possible without joy?",answer("Choose a stance anyway.","existentialism","Meaning may lie in how we confront the absurd."),answer("Recognize what hurts.","buddhism","Attention is not a demand to feel happy.")),
    branch("How could we know Sisyphus is happy?","When does interpretation replace evidence?",answer("Question the assumption.","skepticism","A metaphor needn't prove a psychological claim."),answer("Look at the lived experience.","existentialism","Meaning is not observable from outside.")),
    branch("Maybe the struggle matters more than the summit.","Must purpose have a final outcome?",answer("Find freedom in doing.","stoicism","Some value belongs to action itself."),answer("Release the fixed destination.","daoism","A process needn't be justified only by arrival."))]},
  {match:"Man is condemned to be free",question:"If freedom is unavoidable, why does it feel like a prison?",branches:[
    branch("Circumstances can sharply limit choice.","Is freedom enough without real possibilities?",answer("Challenge imposed limits.","existentialism","Freedom remains entangled with situations."),answer("Find what judgment can change.","stoicism","Agency isn't identical to unlimited options.")),
    branch("Can we ever know a choice was truly free?","How much of us was already shaped?",answer("Question your assumptions.","skepticism","Certainty about the self is difficult."),answer("Watch habitual reactions.","buddhism","Not every impulse needs to rule us.")),
    branch("Maybe freedom means responding, not escaping.","Must freedom require total independence?",answer("Work with constraints.","daoism","Agency can respond to conditions."),answer("Own your response.","stoicism","Responsibility can survive uncertainty."))]},
  {match:"We suffer more in imagination",question:"If a feared future never arrives, was the fear unreal?",branches:[
    branch("An imagined fear can still hurt.","Can we respect pain without believing every thought?",answer("Notice it without clinging.","buddhism","The feeling is real; its prediction may not be."),answer("Test the judgment.","stoicism","An impression isn't yet a verdict.")),
    branch("How could we know which fear is justified?","When does caution become projection?",answer("Look for evidence.","skepticism","A plausible story is not proof."),answer("Act on what you can assess.","stoicism","Preparation needn't mean rumination.")),
    branch("Maybe imagination is also our freedom.","Can worry become a form of possibility?",answer("Choose what you make of it.","existentialism","Imagination can open a different future."),answer("Return to what is here.","daoism","Attention can loosen imagined control."))]},
  {match:"Act only according to that maxim",question:"What if following a universal rule hurts someone you love?",branches:[
    branch("An exception might be more humane.","Can a moral rule survive a painful case?",answer("Defend responsibility.","stoicism","Integrity can matter even under pressure."),answer("Consider the lived other.","existentialism","Ethical freedom is never abstract alone.")),
    branch("Who decides whether a rule is universal?","Can we separate reason from our assumptions?",answer("Examine the rule itself.","skepticism","A good argument still requires scrutiny."),answer("Watch attachment to certainty.","buddhism","Holding a principle needn't end inquiry.")),
    branch("Maybe morality begins with relationships.","Can care change how principles apply?",answer("Attend to interdependence.","buddhism","No action exists in total isolation."),answer("Think through the situation.","stoicism","Judgment engages circumstances, not slogans."))]},
  {match:"It is not the consciousness of men",question:"If society shapes your thinking, which thoughts are truly yours?",branches:[
    branch("People still resist the world that formed them.","Can consciousness change its conditions?",answer("Choose to act.","existentialism","Formation does not erase responsibility."),answer("Change your judgment.","stoicism","Reflection can challenge habit.")),
    branch("How would we recognize a socially shaped belief?","Can we ever step outside our standpoint?",answer("Question what feels natural.","skepticism","Familiarity isn't proof."),answer("Examine attachment to self.","buddhism","The observer is part of the question.")),
    branch("Maybe the individual isn't isolated at all.","Could identity exist through relationships?",answer("Attend to interdependence.","buddhism","The self isn't separate from conditions."),answer("Follow changing relations.","daoism","Identity develops in a living context."))]}
];
const fallback={
 Meaning:["If meaning has to be found, who gets to decide what counts?","Meaning might not come ready-made."],
 Freedom:["Can anyone be free without limits?","The boundary of freedom deserves scrutiny."],
 Doubt:["Can doubting everything become another kind of certainty?","Even skepticism can be examined."],
 Action:["When does doing more become a way of avoiding what matters?","Activity is not always agency."],
 Time:["If time is limited, why spend it trying to control every moment?","Urgency may conceal what matters."],
 Suffering:["Does suffering reveal truth—or only demand attention?","Pain doesn't automatically make us wise."],
 Beauty:["If beauty changes us, how do we know what changed?","Aesthetic certainty can also be questioned."],
 Mortality:["If death makes life urgent, can urgency make us miss it?","Finite time needn't become a command."],
 Love:["Can care become a desire to possess?","Love also raises the question of freedom."],
 Solitude:["When is being alone freedom—and when is it avoidance?","Solitude can hide opposing meanings."]
};
export function getThoughtThread(quote,quoteId=null){
  const curated=resolveTension(quote,quoteId);
  if(curated)return {
    question:curated.friction,
    curated:true,
    tension:{claim:curated.claim,warrant:curated.warrant,poles:curated.poles},
    branches:curated.moves.map(move=>({title:move.title,followup:move.followup,answers:move.answers}))
  };
  if(Number.isInteger(quoteId))return {
    curated:false,
    question:"This thought deserves a closer question.",
    branches:[],
    message:"We're still developing a faithful philosophical challenge for this quotation. Keep it for now—or continue exploring."
  };

  const text=quote?.[0]||"";
  const found=editorial.find(e=>text.includes(e.match));
  if(found)return found;
  const [question,seed]=fallback[quote?.[2]]||fallback.Doubt;
  return {question,branches:[
    branch(seed,"What changes when the idea meets real life?",answer("Act on what matters.","stoicism","The response remains a choice."),answer("Challenge a given limit.","existentialism","Possibility grows through action.")),
    branch("What would count as evidence against it?","What might change your mind?",answer("Examine the grounds.","skepticism","A belief can survive honest questioning."),answer("Notice how it appears.","buddhism","Experience can revise certainty.")),
    branch("What if we ask a different question?","Could the opposite also reveal something?",answer("Follow changing conditions.","daoism","Not every tension needs to be forced."),answer("Study our response to it.","stoicism","Perspective changes what an event means."))
  ]};
}

// A first reaction should feel like a gesture, not choosing an academic method.
// Three distinct questions remain underneath, but the first screen shows none of
// the demanding counter-arguments until the reader deliberately chooses a path.
const REACTION_ICONS=[
  '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M16 15 7 24l9 9M8 24h20c8 0 12-4 12-12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M17 17a7.5 7.5 0 1 1 11 6.5c-3 1.8-4 3.4-4 6.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="24" cy="36" r="1.8" fill="currentColor"/></svg>',
  '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="m24 6 4.7 13.3L42 24l-13.3 4.7L24 42l-4.7-13.3L6 24l13.3-4.7L24 6Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="M35 8v7M31.5 11.5h7" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"/></svg>'
];
const REACTION_HELP=[
  "Explore a counterpoint",
  "Look closer at what is uncertain",
  "Find a different way to see it"
];
export function thoughtThreadHtml({quote,quoteId=null,step=0,branchIndex=0,answerIndex=0}){
  const thread=getThoughtThread(quote,quoteId);
  if(!thread.curated && Number.isInteger(quoteId))
    return '<div class="yl-thread yl-thread-pending" role="status"><div class="yl-thread-progress">AN OPEN QUESTION</div><h2 class="yl-thread-question">'+esc(thread.question)+'</h2><p>'+esc(thread.message)+'</p><button type="button" class="yl-thread-back" data-action="close-discover">Return to quote</button></div>';
  const selected=thread.branches[branchIndex]||thread.branches[0];
  const choice=selected.answers[answerIndex]||selected.answers[0];
  const gesture=(i)=>'<button type="button" class="yl-reaction yl-tone-'+MOVES[i].color+'" data-thread-branch="'+i+'" title="'+esc(REACTION_HELP[i])+'" aria-label="'+esc(REACTION_HELP[i])+'">'+
    '<span class="yl-reaction-glyph">'+REACTION_ICONS[i]+'</span>'+
    '<span class="yl-reaction-name">'+esc(MOVES[i].label)+'</span></button>';
  return '<div class="yl-thread yl-thread-gentle" data-thread-step="'+step+'">'+
    (step===0?
      '<div class="yl-thread-progress">01 <span>—</span> A LITTLE QUESTION</div>'+
      '<h2 class="yl-thread-question">'+esc(thread.question)+'</h2>'+
      '<p class="yl-reaction-prompt">Where would you like to go?</p>'+
      '<div class="yl-reaction-grid" role="group" aria-label="Three ways to explore this question">'+
        MOVES.map((_,i)=>gesture(i)).join("")+
      '</div>'+
      '<p class="yl-reaction-footnote">No right answer. Just curiosity.</p>':
    step===1?
      '<div class="yl-thread-progress">02 <span>—</span> A LITTLE CLOSER</div>'+
      '<div class="yl-thread-remember">'+esc(thread.question)+'</div>'+
      '<div class="yl-thread-selected yl-tone-'+MOVES[branchIndex].color+'">'+REACTION_ICONS[branchIndex]+'<span>'+esc(MOVES[branchIndex].label)+'</span></div>'+
      '<h2 class="yl-thread-question yl-thread-followup-question">'+esc(selected.followup)+'</h2>'+
      '<div class="yl-thread-choices yl-followup" role="group" aria-label="Choose what to explore next">'+selected.answers.map((a,i)=>
         '<button type="button" data-thread-answer="'+i+'" class="yl-thread-choice yl-tone-'+MOVES[branchIndex].color+'"><span class="yl-choice-stripe" aria-hidden="true"></span><span class="yl-choice-content"><strong>'+esc(a.label)+'</strong></span><span aria-hidden="true" class="yl-choice-arrow">↗</span></button>').join("")+'</div>'+
      '<button type="button" class="yl-thread-back" data-action="thread-back">← Try another direction</button>':
      '<div class="yl-thread-ending" role="status" aria-live="polite" tabindex="-1">'+
        '<div class="yl-thread-seed" aria-hidden="true">✳</div>'+
        '<div class="yl-thread-progress">A NEW PERSPECTIVE</div>'+
        '<h2 class="yl-thread-result">'+esc(choice.insight)+'</h2>'+
        '<p class="yl-thread-soft-note">You can carry this thought with you—or leave it here.</p>'+
        '<button type="button" data-action="discover-library" class="yl-thread-library">Explore a little further ↗</button>'+
        '<button type="button" data-action="thread-restart" class="yl-thread-restart">Another way to see it</button>'+
      '</div>')+
    '</div>';
}

export function thoughtThreadDestination(quote,branchIndex,answerIndex,quoteId=null){
 const curated=findDestination(quote,quoteId,branchIndex,answerIndex);
 if(curated)return curated.school;
 const t=getThoughtThread(quote,quoteId);
 if(!t.branches.length)return null;
 return (t.branches[branchIndex]||t.branches[0]).answers[answerIndex]?.school||"skepticism";
}
export function thoughtThreadValid(){
 const all=[...editorial,...Object.keys(fallback).map(theme=>getThoughtThread(["", "",theme]))];
 return all.every(t=>t.question&&t.branches.length===3&&t.branches.every(b=>b.title&&b.followup&&b.answers.length===2&&b.answers.every(a=>a.label&&a.school&&a.insight)));
}
