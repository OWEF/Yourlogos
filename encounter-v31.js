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
export function encounterPanel({quote, quoteId, record, step=0}) {
  const {schoolId, school, scene, sceneIndex} = encounterFor(quote, quoteId);
  const position = Number.isInteger(record?.optionIndex) && record.schoolId===schoolId && record.sceneIndex===sceneIndex
    ? record.optionIndex : null;
  const chosen = position===null ? null : scene.options[position];
  const showResult = step===1 && chosen;
  return '<div class="v31-play" data-encounter-stage="'+(showResult?'result':'choice')+'">'+
    '<div class="v31-play-kicker"><span class="v31-spark" aria-hidden="true">✳</span> A MOMENT FROM LIFE <span class="v31-play-count">01 / 01</span></div>'+
    '<div class="v31-play-place">'+escapeHtml(scene.place)+'</div>'+
    '<h2>'+escapeHtml(scene.question)+'</h2>'+
    (!showResult?
      '<div class="v31-play-options" role="group" aria-label="What would you do?">'+scene.options.map((option,i)=>
        '<button type="button" data-encounter-choice="'+i+'" class="'+(position===i?'is-chosen':'')+'"><span class="v31-option-number">0'+(i+1)+'</span><span>'+escapeHtml(option[0])+'</span><span class="v31-option-arrow" aria-hidden="true">↗</span></button>').join('')+'</div>'+
      '<p class="v31-play-foot">Follow an instinct. No answer to get right.</p>' :
      '<div class="v31-result" role="status" aria-live="polite">'+
        '<div class="v31-result-eyebrow">YOUR CHOICE REVEALS A TENSION</div>'+
        '<p class="v31-result-insight">'+escapeHtml(chosen[1])+'</p>'+
        '<div class="v31-axis" role="img" aria-label="'+escapeHtml(school.pole[0])+' to '+escapeHtml(school.pole[1])+', marker at '+Number(chosen[2])+' percent">'+
           '<div class="v31-axis-track"><div class="v31-axis-fill" style="--v31-axis:'+Number(chosen[2])+'%"></div><i class="v31-axis-dot" style="--v31-axis:'+Number(chosen[2])+'%"></i></div>'+
           '<div class="v31-axis-poles"><span>'+escapeHtml(school.pole[0])+'</span><span>'+escapeHtml(school.pole[1])+'</span></div>'+
        '</div>'+
        '<p class="v31-philosophical-angle"><span>ONE POSSIBLE PERSPECTIVE · '+escapeHtml(schoolId.toUpperCase())+'</span>'+escapeHtml(scene.insight)+'</p>'+
        '<div class="v31-result-actions"><button type="button" data-action="discover-library" class="v31-deeper">Explore in Library ↗</button><button type="button" data-action="close-discover" class="v31-quiet">Back to the quote</button></div>'+
        '<div class="v31-result-secondary"><button type="button" data-action="discover-again">Try another response</button><button type="button" data-action="discover-save">Keep this thought ✧</button></div>'+
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
