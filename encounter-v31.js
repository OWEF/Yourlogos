// YourLogos V3.1 — Encounter is an invitation, not a personality test.
// Reuses the Library's curated six-school situations without grading a choice.
import { SCHOOL_SCENES } from "./school-scenes.js";

const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const authorSchool = [
  [/Epictetus|Seneca|Marcus Aurelius/i, "stoicism"],
  [/Sartre|Beauvoir|Kierkegaard|Camus/i, "existentialism"],
  [/Nietzsche|Schopenhauer/i, "nihilism"],
  [/Hume|Socrates|Locke|Berkeley|Wittgenstein|Montaigne/i, "skepticism"],
  [/Laozi|Zhuangzi/i, "daoism"],
  [/Buddha|Dhammapada|Heart Sutra|Thích/i, "buddhism"]
];
const themeSchool = {
  Meaning:"nihilism", Suffering:"buddhism", Freedom:"existentialism",
  Mortality:"buddhism", Love:"daoism", Doubt:"skepticism",
  Action:"stoicism", Solitude:"daoism", Beauty:"daoism", Time:"existentialism"
};
export function encounterFor(quote, quoteId) {
  const author = quote?.[1] || "";
  const schoolId = authorSchool.find(([pattern])=>pattern.test(author))?.[1] || themeSchool[quote?.[2]] || "skepticism";
  const school = SCHOOL_SCENES[schoolId];
  const sceneIndex = (Number(quoteId) || 0) % school.scenes.length;
  return { schoolId, school, scene:school.scenes[sceneIndex], sceneIndex };
}
// Deliberately small editorial reactions: an invitation, never a verdict.
export const ENCOUNTER_MICRO = {
  stoicism: [
    ["The delay took center stage.","You found your next move.","Calm can mask what matters."],
    ["You tried to win their judgment.","You made space to respond.","Silence is not always calm."]
  ],
  existentialism: [
    ["The familiar path still asks a choice.","You chose without a guarantee.","Waiting is its own choice."],
    ["You borrowed someone else's plan.","You gave the day a direction.","Possibility can feel heavy."]
  ],
  nihilism: [
    ["A new certainty replaced the old.","You stayed with the unknown.","You dared to create meaning."],
    ["Losing certainty can feel empty.","You questioned the measuring stick.","You made room for new values."]
  ],
  skepticism: [
    ["Confidence became your evidence.","Doubt can become a reflex, too.","You left room for doubt."],
    ["Volume sounded like certainty.","You looked beneath the disagreement.","Uncertainty needn't end inquiry."]
  ],
  daoism: [
    ["More force met more resistance.","You made room to listen.","Stillness isn't always harmony."],
    ["Control met a changing world.","You adjusted to what changed.","Letting go isn't abandoning care."]
  ],
  buddhism: [
    ["You wished the moment would stay.","You noticed without holding tight.","Impermanence needn't erase joy."],
    ["Fighting added another struggle.","You noticed the feeling changing.","A feeling isn't a verdict."]
  ]
};
export function encounterPanel({quote, quoteId, record, step=0}) {
  const {schoolId, school, scene, sceneIndex} = encounterFor(quote, quoteId);
  const position = Number.isInteger(record?.optionIndex) && record.schoolId===schoolId && record.sceneIndex===sceneIndex
    ? record.optionIndex : null;
  const chosen = position===null ? null : scene.options[position];
  const showResult = step===1 && chosen;
  const micro = showResult ? (ENCOUNTER_MICRO[schoolId]?.[sceneIndex]?.[position] || chosen[1]) : "";
  return '<div class="v31-play v32-play" data-encounter-stage="'+(showResult?'result':'choice')+'">'+
    (!showResult ?
      '<div class="v32-scene-label"><span class="v32-scene-dot" aria-hidden="true"></span>'+escapeHtml(scene.place)+'</div>'+
      '<h2 class="v32-scene-question">'+escapeHtml(scene.question)+'</h2>'+
      '<div class="v31-play-options" role="group" aria-label="Choose what you would do">'+scene.options.map((option,i)=>
        '<button type="button" data-encounter-choice="'+i+'" class="'+(position===i?'is-chosen':'')+'"><span class="v31-option-number">0'+(i+1)+'</span><span>'+escapeHtml(option[0])+'</span><span class="v31-option-arrow" aria-hidden="true">↗</span></button>').join('')+'</div>' :
      '<div class="v32-flash" role="status" aria-live="polite" tabindex="-1">'+
        '<div class="v32-flash-emblem" aria-hidden="true"><svg viewBox="0 0 60 60" fill="none"><circle cx="30" cy="30" r="22" stroke="currentColor" stroke-opacity=".24"/><circle cx="30" cy="30" r="9" stroke="currentColor"/><path d="M30 2v12M30 46v12M2 30h12M46 30h12" stroke="currentColor" stroke-linecap="round"/></svg></div>'+
        '<span class="v32-flash-label">A DIFFERENT ANGLE</span>'+
        '<h2 class="v32-flash-insight">'+escapeHtml(micro)+'</h2>'+
        '<div class="v32-axis" role="img" aria-label="'+escapeHtml(school.pole[0])+' to '+escapeHtml(school.pole[1])+', chosen direction '+Number(chosen[2])+' percent">'+
          '<div class="v32-axis-track"><span class="v32-axis-indicator" style="--v31-axis:'+Number(chosen[2])+'%"></span></div>'+
          '<div class="v32-axis-labels"><span>'+escapeHtml(school.pole[0])+'</span><span>'+escapeHtml(school.pole[1])+'</span></div>'+
        '</div>'+
        '<div class="v32-next-actions"><button type="button" data-action="discover-again" class="v32-retry">↶ Try again</button><button type="button" data-action="discover-library" class="v32-library">Go deeper in Library <span aria-hidden="true">↗</span></button></div>'+
      '</div>')+
  '</div>';
}
export function recordExploration(existing, event) {
  const history = Array.isArray(existing) ? existing : [];
  const safe = {
    source: event.source==="library"?"library":"encounter",
    schoolId: String(event.schoolId||""),
    sceneIndex: Number(event.sceneIndex)||0,
    optionIndex: Number(event.optionIndex)||0,
    quoteId: Number.isInteger(event.quoteId)?event.quoteId:null,
    theme: String(event.theme||""),
    date: String(event.date||""),
    axis: Math.max(0,Math.min(100,Number(event.axis)||0))
  };
  if(!SCHOOL_SCENES[safe.schoolId]||!SCHOOL_SCENES[safe.schoolId].scenes[safe.sceneIndex]?.options[safe.optionIndex])return history;
  const prev=history[history.length-1];
  if(prev && ["source","schoolId","sceneIndex","optionIndex","quoteId","date"].every(k=>prev[k]===safe[k]))return history;
  return [...history.slice(-349), safe];
}
function summarize(events) {
  const valid=(Array.isArray(events)?events:[]).filter(e=>e&&SCHOOL_SCENES[e.schoolId]&&Number.isInteger(e.optionIndex));
  const tally = prop => {
    const map = new Map();
    valid.forEach(e=>{const name=prop(e);if(name)map.set(name,(map.get(name)||0)+1)});
    return [...map].sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0]));
  };
  return {valid,schools:tally(e=>e.schoolId),tensions:tally(e=>SCHOOL_SCENES[e.schoolId].tag),themes:tally(e=>e.theme)};
}
export function worldHomeEvidence(events) {
  const x=summarize(events);
  const label=x.tensions[0]?.[0]?.replaceAll(" / "," ↔ ") || "A question is waiting";
  return '<div class="v31-world-thread" aria-label="Your explored philosophical tensions">'+
    '<span class="v31-world-tag">THREADS OF CURIOSITY</span>'+
    '<strong>'+escapeHtml(label)+'</strong>'+
    '<p>'+(x.valid.length?x.valid.length+' choices across '+x.schools.length+' philosophical perspectives. Your choices show where you explored, not what you believe.':'Explore a situation in Encounter or Library. Each choice will add a trace here.')+'</p>'+
    '<button type="button" data-world-pane="fingerprint">See your explored questions <span aria-hidden="true">↗</span></button>'+
  '</div>';
}
export function worldFingerprintEvidence(events) {
  const x=summarize(events);
  const bars=(items)=>items.slice(0,4).map(([name,count])=>
    '<div class="v31-evidence-row"><span>'+escapeHtml(name.replaceAll(" / "," ↔ "))+'</span><b>'+count+'</b><i style="--v31-width:'+(100*count/Math.max(1,items[0][1]))+'%"></i></div>').join("");
  return '<article class="v22-data-card v31-fingerprint-evidence"><div class="v22-card-head"><span>QUESTIONS YOU EXPLORED</span><small>From Encounter and Library choices</small></div>'+
    (x.valid.length?
      '<div class="v31-evidence-stats"><strong>'+x.valid.length+'</strong> selections · <strong>'+x.schools.length+'</strong> perspectives visited</div>'+
      '<div class="v31-evidence-heading">Recurring tensions</div>'+bars(x.tensions)+
      '<div class="v31-evidence-heading">Perspectives encountered</div>'+bars(x.schools) :
      '<p class="v22-muted">Your first choice in Encounter will begin this picture. There are no scores and no fixed identities.</p>')+
    '<p class="v22-data-note">This is a history of encounters—not a belief profile. Repeated selections may reflect exploration, disagreement, or changing your mind.</p></article>';
}
