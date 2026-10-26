import { SCHOOLS, schoolArtwork } from "./schools.js";
import { availableThoughts, quoteAt, followingThought } from "./encounter-queue.js";
import { SCHOOL_SCENES } from "./school-scenes.js";
import { encounterFor, encounterPanel, recordExploration, worldHomeEvidence, worldFingerprintEvidence } from "./encounter-v31.js";
import { encounterSoundEnabled, setEncounterSoundEnabled, playEncounterTone } from "./encounter-feedback.js";
import { thoughtThreadHtml, thoughtThreadDestination, getThoughtThread } from "./thought-threads.js";
import { exploreFor } from "./explore-catalogue.js";
import { personalizedExplore } from "./personalization.js";
import { livingHtml, normalizeLivingState, beginLiving, transitionLiving, noteLiving, openingLiving, archiveLiving } from "./living-threads.js";
import { buildWorldMemory, worldMemoryHtml } from "./world-memory.js";
import { aiConversationHtml, safeAIConversation, aiMemoryChoices, aiSummary, cleanText } from "./discover-ai-client.js";
import { worldHomeHtml, mirrorHtml } from "./world-view.js";
import { AUTH_ENABLED, requestMagicLink, getVerifiedIdentity, signOutEmail, fetchPublishedQuotes, readAccountData, writeAccountData, writeAccountName, getDiscoverAccessToken } from "./auth-client.js";
const QUOTES=[
["He who has a why to live can bear almost any how.","Friedrich Nietzsche","Meaning","Twilight of the Idols","What, if anything, gives hardship a direction?"],
["Man is the only creature who refuses to be what he is.","Albert Camus","Freedom","The Rebel","What in yourself are you refusing today?"],
["The unexamined life is not worth living.","Socrates","Meaning","Plato, Apology","What have you accepted without examination?"],
["We suffer more in imagination than in reality.","Seneca","Suffering","Letters to Lucilius","Which anticipated pain never actually arrived?"],
["Man is condemned to be free.","Jean-Paul Sartre","Freedom","Existentialism Is a Humanism","Where is freedom experienced as a burden?"],
["He who knows others is wise; he who knows himself is enlightened.","Laozi","Freedom","Dao De Jing, chapter 33 (translation varies)","What do you know about yourself that knowledge of others cannot give?"],
["It is not death that a man should fear, but he should fear never beginning to live.","Marcus Aurelius","Mortality","Meditations (translation varies)","What part of your life keeps waiting to begin?"],
["Love does not consist of gazing at each other, but in looking outward together in the same direction.","Antoine de Saint-Exupéry","Love","Wind, Sand and Stars","What shared horizon holds a relationship together?"],
["Whereof one cannot speak, thereof one must be silent.","Ludwig Wittgenstein","Doubt","Tractatus Logico-Philosophicus, 7","What might silence reveal that explanation conceals?"],
["Waste no more time arguing about what a good man should be. Be one.","Marcus Aurelius","Action","Meditations, 10.16","When does thought become a way of postponing action?"],
["All of humanity's problems stem from man's inability to sit quietly in a room alone.","Blaise Pascal","Solitude","Pensées (paraphrased translation)","What would you meet if there were nothing to distract you?"],
["Two things fill the mind with ever-increasing wonder: the starry sky above me and the moral law within me.","Immanuel Kant","Beauty","Critique of Practical Reason, conclusion (abridged translation)","What is the relation between wonder and obligation?"],
["How we spend our days is, of course, how we spend our lives.","Annie Dillard","Time","The Writing Life","What does an ordinary Tuesday reveal about your life?"],
["It is not enough to have a good mind; the main thing is to use it well.","René Descartes","Action","Discourse on Method","Where has understanding not yet become practice?"],
["Not knowing is most intimate.","Zen koan (Dizang)","Doubt","Book of Serenity","Could uncertainty be a form of intimacy?"],
["I never found the companion that was so companionable as solitude.","Henry David Thoreau","Solitude","Walden","When is being alone a kind of presence?"],
["The journey of a thousand miles begins with a single step.","Laozi","Action","Dao De Jing, chapter 64 (translation varies)","Which beginning are you making too large?"],
["The present moment is the only moment available to us, and it is the door to all moments.","Thích Nhất Hạnh","Time","Attributed; source needs verification","What does attention change about time?"],
["The strongest man in the world is he who stands most alone.","Henrik Ibsen","Solitude","An Enemy of the People (translation varies)","When is standing alone conscience, and when is it pride?"],
["The most beautiful experience we can have is the mysterious.","Albert Einstein","Beauty","The World As I See It (translation varies)","What deserves wonder instead of explanation?"]
,
["I think, therefore I am.","René Descartes","Doubt","Discourse on Method, Part IV","What must be certain before you can doubt anything?"],
["He who knows only his own side of the case knows little of that.","John Stuart Mill","Doubt","On Liberty, Chapter II","Which opposing view would sharpen your own?"],
["The philosophers have only interpreted the world, in various ways; the point is to change it.","Karl Marx","Action","Theses on Feuerbach, Thesis XI (translation varies)","When should understanding become collective action?"],
["I do not wish them to have power over men; but over themselves.","Mary Wollstonecraft","Freedom","A Vindication of the Rights of Woman, Chapter IV","What is the difference between independence and dominance?"],
["All things excellent are as difficult as they are rare.","Baruch Spinoza","Meaning","Ethics, Part V, Proposition 42, Scholium (translation varies)","What is worth pursuing without any guarantee of ease?"],
["The heart has its reasons, which reason does not know.","Blaise Pascal","Love","Pensées, fragment 277 (Brunschvicg; translation varies)","Is there a form of understanding that reason alone cannot grasp?"],
["Reason is, and ought only to be the slave of the passions.","David Hume","Freedom","A Treatise of Human Nature, Book II, Part III, Section III","Does reason direct your desires, or serve them?"],
["The life of man, solitary, poor, nasty, brutish, and short.","Thomas Hobbes","Suffering","Leviathan, Chapter XIII (excerpt)","How much of a good life depends on other people?"],
["A woman must have money and a room of her own if she is to write fiction.","Virginia Woolf","Freedom","A Room of One's Own, Chapter I","What material conditions does freedom require?"],
["There is nothing either good or bad, but thinking makes it so.","William Shakespeare","Doubt","Hamlet, Act II, Scene II","How much do your judgments shape your world?"],
["Man is by nature a political animal.","Aristotle","Love","Politics, Book I, 1253a (translation varies)","Can a person truly flourish alone?"],
["The true is the whole.","G. W. F. Hegel","Meaning","Phenomenology of Spirit, Preface (translation varies)","Can something be understood apart from its relations?"],
["The mind is its own place, and in itself can make a Heaven of Hell, a Hell of Heaven.","John Milton","Doubt","Paradise Lost, Book I","Where does interpretation meet circumstance?"],
["To be, or not to be, that is the question.","William Shakespeare","Mortality","Hamlet, Act III, Scene I","What does it mean to bear an uncertain future?"],
["Life can only be understood backwards; but it must be lived forwards.","Søren Kierkegaard","Time","Journals, 1843 (translation varies)","How do you act before understanding catches up?"],
["What is the use of a house if you haven't got a tolerable planet to put it on?","Henry David Thoreau","Beauty","Letter to Harrison Blake, 1860 (commonly quoted)","What larger home makes your own life possible?"],
["One does not become enlightened by imagining figures of light, but by making the darkness conscious.","Carl Jung","Doubt","The Philosophical Tree, Psychology and Alchemy, CW 13 (translation varies)","What are you unwilling to notice about yourself?"],
["The world is my representation.","Arthur Schopenhauer","Doubt","The World as Will and Representation, Book I (translation varies)","How do perception and world fit together?"],
["You must change your life.","Rainer Maria Rilke","Action","Archaic Torso of Apollo, New Poems (translation varies)","What has beauty asked you to do?"],
["The only thing we have to fear is fear itself.","Franklin D. Roosevelt","Suffering","First Inaugural Address, March 4, 1933","What becomes possible when fear is named?"],
["If liberty means anything at all, it means the right to tell people what they do not want to hear.","George Orwell","Freedom","Preface to Animal Farm, 'The Freedom of the Press'","What does honest disagreement require?"],
["I am no bird; and no net ensnares me.","Charlotte Brontë","Freedom","Jane Eyre, Chapter XXIII (excerpt)","What does refusing a constraint look like?"],
["All men by nature desire to know.","Aristotle","Doubt","Metaphysics I.1 (translation varies)","Which ordinary curiosity has recently surprised you?"],
["Happiness is an activity of soul in accordance with virtue.","Aristotle","Meaning","Nicomachean Ethics I.7 (translation varies)","What distinguishes a good life from a pleasant moment?"],
["Death is nothing to us.","Epicurus","Mortality","Letter to Menoeceus","What would change if death held less fear?"],
["By pleasure we mean the absence of pain in the body and of trouble in the soul.","Epicurus","Meaning","Letter to Menoeceus (translation varies)","Which simple pleasures are enough for you?"],
["Men are disturbed not by things, but by the views which they take of things.","Epictetus","Suffering","Enchiridion 5, Higginson translation","How might your judgment shape an uncomfortable event?"],
["Of things some are in our power, and others are not.","Epictetus","Freedom","Enchiridion 1, George Long translation","Where are you expending attention without influence?"],
["Seek not that the things which happen should happen as you wish; but wish the things which happen to be as they are.","Epictetus","Action","Enchiridion 8, George Long translation (excerpt)","Can accepting a circumstance coexist with changing it?"],
["Life is long if you know how to use it.","Seneca","Time","On the Shortness of Life (translation varies)","What makes a day feel fully lived?"],
["While we are postponing, life speeds by.","Seneca","Time","Moral Letters to Lucilius, Letter 1 (translation varies)","What meaningful thing has been waiting for later?"],
["Only that day dawns to which we are awake.","Henry David Thoreau","Time","Walden, Conclusion","What might you notice if you paid closer attention?"],
["The mass of men lead lives of quiet desperation.","Henry David Thoreau","Meaning","Walden, Economy","Which forms of striving do we mistake for necessity?"],
["Simplify, simplify.","Henry David Thoreau","Action","Walden, Where I Lived, and What I Lived For","What could you remove without losing anything essential?"],
["Trust thyself: every heart vibrates to that iron string.","Ralph Waldo Emerson","Freedom","Essays: First Series, Self-Reliance","Where do you borrow confidence from others?"],
["A foolish consistency is the hobgoblin of little minds.","Ralph Waldo Emerson","Doubt","Essays: First Series, Self-Reliance","What belief deserves to be revised?"],
["A wise man proportions his belief to the evidence.","David Hume","Doubt","An Enquiry Concerning Human Understanding, X","What would change your mind about something important?"],
["No man's knowledge here can go beyond his experience.","John Locke","Doubt","An Essay Concerning Human Understanding, IV.iii","Where does your knowledge depend on another person's account?"],
["To be is to be perceived.","George Berkeley","Doubt","A Treatise Concerning the Principles of Human Knowledge, §3 (esse est percipi)","What does perception contribute to the world you experience?"],
["Man is born free, and everywhere he is in chains.","Jean-Jacques Rousseau","Freedom","The Social Contract I.1 (translation varies)","Which constraints are social rather than natural?"],
["Over himself, over his own body and mind, the individual is sovereign.","John Stuart Mill","Freedom","On Liberty, I","Where should another person's authority end?"],
["All that is solid melts into air.","Karl Marx and Friedrich Engels","Time","Manifesto of the Communist Party, I (Moore translation)","What changes so rapidly that it feels permanent only for a moment?"],
["It is not the consciousness of men that determines their existence, but their social existence that determines their consciousness.","Karl Marx","Meaning","Preface to A Contribution to the Critique of Political Economy, 1859 (translation varies)","How has your social world shaped what seems natural to you?"],
["The owl of Minerva spreads its wings only with the falling of the dusk.","G. W. F. Hegel","Time","Elements of the Philosophy of Right, Preface (translation varies)","Can an age only understand itself after it passes?"],
["Anxiety is the dizziness of freedom.","Søren Kierkegaard","Freedom","The Concept of Anxiety (translation varies)","What possibility frightens you precisely because you can choose it?"],
["Existence precedes essence.","Jean-Paul Sartre","Freedom","Existentialism Is a Humanism","How much of identity is made through what we do?"],
["One must imagine Sisyphus happy.","Albert Camus","Meaning","The Myth of Sisyphus (translation varies)","What could make a repetitive life meaningful?"],
["The limits of my language mean the limits of my world.","Ludwig Wittgenstein","Doubt","Tractatus Logico-Philosophicus, 5.6","What experience is difficult to put into words?"],
["What can be shown cannot be said.","Ludwig Wittgenstein","Doubt","Tractatus Logico-Philosophicus, 4.1212","What can a gesture communicate more directly than speech?"],
["The world is everything that is the case.","Ludwig Wittgenstein","Doubt","Tractatus Logico-Philosophicus, 1","Is the world made up of things, or of facts?"],
["Sapere aude! Have courage to use your own understanding!","Immanuel Kant","Action","An Answer to the Question: What Is Enlightenment? (translation varies)","Where are you still allowing someone else to think for you?"],
["Act only according to that maxim whereby you can at the same time will that it should become a universal law.","Immanuel Kant","Action","Groundwork of the Metaphysics of Morals, II (translation varies)","Would you endorse your own rule if everyone followed it?"],
["The good life is one inspired by love and guided by knowledge.","Bertrand Russell","Love","What I Believe","How should care and understanding correct each other?"],
["One is not born, but rather becomes, a woman.","Simone de Beauvoir","Freedom","The Second Sex, Introduction to Book II (translation varies)","How do social expectations participate in forming identity?"],
["Form is emptiness; emptiness is form.","The Heart Sutra","Doubt","Prajñāpāramitāhṛdaya Sūtra (translation varies)","What changes when things have no independent fixed essence?"],
["Hatred is never appeased by hatred in this world.","The Dhammapada","Suffering","Dhammapada 5 (translation varies; excerpt)","How might refusing retaliation alter a conflict?"],
["A frog in a well cannot be talked with about the sea.","Zhuangzi","Doubt","Zhuangzi, Autumn Floods (translation varies)","Which limits of experience have you mistaken for limits of reality?"],
["Learning without thought is labor lost; thought without learning is perilous.","Confucius","Action","Analects 2.15 (James Legge translation, wording abridged)","What balance between study and reflection works for you?"],
["To know what you know and what you do not know, that is true knowledge.","Confucius","Doubt","Analects 2.17 (translation varies)","Where might admitting ignorance be a sign of understanding?"],
["One must still have chaos in oneself to be able to give birth to a dancing star.","Friedrich Nietzsche","Beauty","Thus Spoke Zarathustra, Prologue (translation varies)","Can creativity emerge without uncertainty or disorder?"],
["Become who you are.","Friedrich Nietzsche","Freedom","The Gay Science, §270 (translation varies)","Can you become yourself without discovering something new?"],
["God is dead. God remains dead. And we have killed him.","Friedrich Nietzsche","Meaning","The Gay Science, §125 (translation varies)","What follows when inherited sources of meaning lose authority?"],
["I am myself the matter of my book.","Michel de Montaigne","Meaning","Essays, To the Reader (translation varies)","What could you learn by making your experience a subject of inquiry?"],
["The path up and down is one and the same.","Heraclitus","Time","Fragment B60 (translation varies)","How can opposite directions belong to the same process?"],
["Our heart is restless until it rests in you.","Augustine of Hippo","Love","Confessions I.1 (translation varies)","What longing seems to persist beneath the things you pursue?"],
["Nothing can be created from nothing.","Lucretius","Doubt","On the Nature of Things, Book I (translation varies)","What does an explanation need to account for?"],
["We are all in the gutter, but some of us are looking at the stars.","Oscar Wilde","Beauty","Lady Windermere's Fan, Act III","What allows hope without denying difficult circumstances?"],
["The true mystery of the world is the visible, not the invisible.","Oscar Wilde","Beauty","The Picture of Dorian Gray, Chapter II","What ordinary sight have you stopped seeing?"],
["One cannot think well, love well, sleep well, if one has not dined well.","Virginia Woolf","Action","A Room of One's Own, Chapter I","How do material conditions shape the freedom to think?"],
["Nothing is so painful to the human mind as a great and sudden change.","Mary Shelley","Suffering","Frankenstein, Chapter XXIII (1818 edition varies)","Which change have you needed time to understand?"],
["The feeling of commiseration is the beginning of humanity.","Mencius","Love","Mencius 2A:6 (translation varies)","Where does empathy begin before deliberate reasoning?"]
];
// Daily first impressions favor clear, everyday wording. All 91 original
// quotations remain available in Encounter swipes and Library, with stable IDs.
// Add future quotes only after an editorial accessibility review.
const DAILY_FEATURE_IDS=[0,2,3,5,6,7,9,10,12,13,15,16,17,18,19,20,21,22,23,24,26,29,30,33,34,35,36,39,40,41,42,43,45,47,48,49,50,51,52,53,54,57,60,61,68,71,76,77,78,79,81,84,86,87,89,90];
const THEMES=["Meaning","Suffering","Freedom","Mortality","Love","Doubt","Action","Solitude","Beauty","Time"];
const PROMPTS={
Meaning:["Notice where your own 'why' is clear, and where it has gone quiet.","Can meaning be found, or must it be made?"],
Suffering:["Where is the pain, before you try to explain it?","Does suffering necessarily teach us anything?"],
Freedom:["What does your freedom cost, and who pays it?","How much of your choosing is shaped by what you did not choose?"],
Mortality:["Imagine encountering this on your final morning.","Does death give life urgency—or distort it?"],
Love:["Let one person come to mind without trying to resolve anything.","Is love a commitment to the other, or a need of the self?"],
Doubt:["Let an unanswered question remain unanswered for a while.","When does doubt sharpen thought, and when does it excuse inaction?"],
Action:["Carry one small possibility into your day.","Is activity ever a way of avoiding understanding?"],
Solitude:["Notice what remains when you stop performing.","When is solitude freedom, and when is it retreat?"],
Beauty:["Recall something that stopped you in your tracks.","Is beauty discovered in things or made by those who see?"],
Time:["Notice one moment without trying to preserve it.","Does attending to the present evade the past and future?"]
};
const KEY="yourlogos_web_v1";
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return {}}};
let data=load();if(!data.themes)data.themes=[];if(!data.saved)data.saved=[];if(!data.practice)data.practice={};
let view="today",detailId=null,selectedTheme="All",mode=null,toastTimeout=null;
let bridgeFromQuestion=null;
let aiDiscoverEnabled=false,aiDiscoverMode=false,aiConversation=null,aiPrivateForCurrentSheet=false;
function activateDiscoverAI(){
 if(!discoverOpen||!aiDiscoverEnabled||aiPrivateForCurrentSheet)return;
 const id=visibleQuoteId();if(id===null)return;
 aiDiscoverMode=true;
 if(!aiConversation||aiConversation.quoteId!==id){
  aiConversation={...safeAIConversation(null,id),consent:previouslyConsented()};
 }
 render();
 if(aiConversation?.consent)document.querySelector('[data-ai="send"]')?.click();
}
const consentKey=()=>"yourlogos-ai-consent-v1:"+(verifiedIdentity?.id||"guest");
const previouslyConsented=()=>localStorage.getItem(consentKey())==="yes";
let settingsReturnScrollY=0;
let syncBusy=false,syncConfirm="",cloudStateInfo="",quoteCursor=0,libraryScope="all",discoverOpen=false,discoverStep=0,settingsConfirm=false,settingsOpen=false,universePane="home",swipeBusy=false,navFrom=0,navPulse=null,heartPulse=false,openSchoolId=null,schoolSceneIndex=0,schoolChoiceIndex=null;
if(!data.discovery||typeof data.discovery!=="object")data.discovery={};
if(!data.encounters||typeof data.encounters!=="object")data.encounters={};
if(!Array.isArray(data.encounterEvents))data.encounterEvents=[];
if(typeof data.localName!=="string")data.localName="";
let verifiedIdentity=null,authBusy=false,authNotice="";
let threadBranch=0,threadAnswer=0;
let libraryListScrollY=0;
let keepPending=null,keepTimer=null;
if(!Array.isArray(data.thoughtThreadEvents))data.thoughtThreadEvents=[];
data.livingThreads=normalizeLivingState(data.livingThreads);
if(!Array.isArray(data.aiDiscoverThreads))data.aiDiscoverThreads=[];
data.aiDiscoverThreads=data.aiDiscoverThreads.filter(x=>x&&Number.isInteger(x.quoteId)&&x.quoteId>=0&&x.quoteId<91).slice(-30);
// A return is a gentle, optional act of presence; not a competitive streak.
if(!Array.isArray(data.arrivals))data.arrivals=[];
data.arrivals=[...new Set(data.arrivals.filter(x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)))].slice(-730);
let arrivalCelebrating=false,arrivalSeenDate="",activeLocalDay="",previewTomorrowOpen=false;
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const dayIndexFor=(dateKey)=>{const [y,m,d]=dateKey.split("-").map(Number);return Math.floor((Date.UTC(y,m-1,d)-Date.UTC(2026,0,1))/86400000)};
const dayIndex=()=>dayIndexFor(today());
const shiftDate=(key,days)=>{const [y,m,d]=key.split("-").map(Number);const v=new Date(Date.UTC(y,m-1,d+days));return [v.getUTCFullYear(),String(v.getUTCMonth()+1).padStart(2,"0"),String(v.getUTCDate()).padStart(2,"0")].join("-")};
// A seeded full-cycle deck: approachable daily quotes do not repeat within their cycle.
// Favorited themes still influence browsing through Discover; daily variety wins over a
// preference pool small enough to repeat the same quote every few days.
let DAILY_ORDER=(()=>{
  const ids=DAILY_FEATURE_IDS.slice();let seed=0x7a3f9201;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  for(let i=ids.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}
  return ids;
})();
const dailyPick=(dateKey)=>{
  const n=dayIndexFor(dateKey);
  const slot=((n%DAILY_ORDER.length)+DAILY_ORDER.length)%DAILY_ORDER.length;
  let id=DAILY_ORDER[slot];
  // Protect against a last-day repetition from pre-upgrade practice history.
  const yesterday=data.practice[shiftDate(dateKey,-1)]?.quoteId;
  if(Number.isInteger(yesterday)&&yesterday===id)id=DAILY_ORDER[(slot+1)%DAILY_ORDER.length];
  return id;
};
const activeQuote=()=>{const d=today();if(Number.isInteger(data.practice[d]?.quoteId)&&QUOTES[data.practice[d].quoteId])return data.practice[d].quoteId;return dailyPick(d)};
const persist=()=>localStorage.setItem(KEY,JSON.stringify(data));
function sharedWorldMemory(){
  const cosmos=(()=>{try{return JSON.parse(localStorage.getItem("yourlogos-v2-encounters-v1")||"[]")}catch{return []}})();
  return buildWorldMemory(data,QUOTES,Array.isArray(cosmos)?cosmos:[]);
}
const ensureDailyFeature=()=>{
  const d=today();if(!data.practice[d])data.practice[d]={};
  if(!Number.isInteger(data.practice[d].quoteId)||!QUOTES[data.practice[d].quoteId]){
    data.practice[d].quoteId=dailyPick(d);persist();
  }
  return data.practice[d].quoteId;
};
const mark=()=>{const d=today();ensureDailyFeature();return data.practice[d]};
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const svg=(name)=>{let paths={today:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',library:'<path d="M3 4h8v16H3zM13 4h8v16h-8z"/>',saved:'<path d="M5 3h14v18l-7-4-7 4z"/>',profile:'<circle cx="12" cy="8" r="4"/><path d="M4 22c0-6 16-6 16 0"/>',share:'<path d="M12 16V3m-4 4 4-4 4 4M5 13v8h14v-8"/>',back:'<path d="m14 5-7 7 7 7"/>',spark:'<path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7z"/>'};return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(paths[name]||"")+'</svg>'};
const btn=(id,label,cls="")=>'<button type="button" class="'+cls+'" data-action="'+id+'">'+label+'</button>';

const navs=[["today","Encounter"],["library","Library"],["profile","My World"]];
const dockIcons={
 settings:'<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="5.3"/><path d="M16 2.5v4M16 25.5v4M2.5 16h4M25.5 16h4M6.5 6.5l3 3M22.5 22.5l3 3M25.5 6.5l-3 3M9.5 22.5l-3 3"/></svg>',
 today:'<svg viewBox="0 0 32 32" aria-hidden="true"><g class="quote-glyph"><path d="M14 6.5C8.5 9 6 13.3 6 19v5.5h8V17H9.5c.5-3.2 2.1-5.6 4.5-7.1M28 6.5C22.5 9 20 13.3 20 19v5.5h8V17h-4.5c.5-3.2 2.1-5.6 4.5-7.1"/></g></svg>',
 library:'<svg viewBox="0 0 32 32" aria-hidden="true"><g class="backpage"><path d="M7 8V5.8C7 4.3 8.3 3 9.8 3H24c1.7 0 3 1.3 3 3v18"/></g><g class="frontpage"><rect x="5" y="8" width="18" height="21" rx="2.5"/><path d="M9.5 14h9M9.5 18h9M9.5 22h5.5"/></g></svg>',
 profile:'<svg viewBox="0 0 32 32" aria-hidden="true"><g class="star-lines"><path d="M7 10.5 17.5 5l8.5 8.5-6 12-13.5-3.5L7 10.5 26 13.5M17.5 5 20 25.5M7 10.5 20 25.5"/></g><circle class="star-one" cx="7" cy="10.5" r="2.5" fill="currentColor"/><circle class="star-two" cx="17.5" cy="5" r="2" fill="currentColor"/><circle class="star-three" cx="26" cy="13.5" r="2.5" fill="currentColor"/><circle class="star-four" cx="20" cy="25.5" r="2.5" fill="currentColor"/><circle cx="6.5" cy="22" r="1.5" fill="currentColor" stroke="none"/></svg>'
};
const navHtml=(compact=false)=>navs.map(([n,label])=>'<button type="button" aria-label="'+label+'" title="'+label+'" data-view="'+n+'" class="'+(compact?'dock-btn':'nav-btn')+(view===n?' active':'')+(navPulse===n?' icon-moving':'')+'">'+dockIcons[n]+(compact?'':'<span>'+label+'</span>')+'</button>').join("");
function arrivalDates(){return Array.from({length:7},(_,i)=>shiftDate(today(),i-6))}
function arrivalHtml(){
  const days=arrivalDates(),done=data.arrivals.includes(today()),dates=new Set(data.arrivals);
  if(done && !arrivalCelebrating)return "";
  let entering=false;try{entering=sessionStorage.getItem("yourlogos-arrival-intro:"+today())!=="1";if(entering)sessionStorage.setItem("yourlogos-arrival-intro:"+today(),"1")}catch{}
  return '<div class="arrival-ritual'+(arrivalCelebrating?" celebrating":"")+(entering?" first-light":"")+'" aria-label="Daily arrival">'+
    '<div class="arrival-constellation" role="img" aria-label="'+days.filter(x=>dates.has(x)).length+' of the last 7 days visited">'+
      days.map((day,i)=>'<span class="arrival-star'+(dates.has(day)?" visited":"")+(day===today()?" current":"")+'" title="'+day+'"></span>').join("")+
    '</div><div class="arrival-copy"><span>'+(done?"YOU WERE HERE TODAY":"A MOMENT TO ARRIVE")+'</span><small>'+(done?"A thought has a place to begin.":"No streaks to protect. Just this moment.")+'</small></div>'+
    (done?'<span class="arrival-done" aria-label="Checked in today">✧</span>':'<button type="button" data-action="daily-arrive" class="arrival-button">I’m here <span aria-hidden="true">✧</span></button>')+
  '</div>';
}
const daySequence=()=>{
  const featured=activeQuote();
  const rest=QUOTES.map((q,i)=>({id:i,theme:q[2]})).filter(x=>x.id!==featured);
  // Stable shuffle; intentionally mix unfamiliar themes alongside familiar ones.
  let seed=((dayIndex()+100001)*2654435761)>>>0;
  const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  for(let i=rest.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]]}
  const arranged=[],lastTheme=new Set();
  while(rest.length){let index=rest.findIndex(x=>!lastTheme.has(x.theme));if(index<0)index=0;const [next]=rest.splice(index,1);arranged.push(next.id);lastTheme.clear();lastTheme.add(next.theme)}
  return [featured,...arranged];
};
const discoveryQueue=()=>availableThoughts(daySequence(),data.saved);
const visibleQuoteId=()=>quoteAt(discoveryQueue(),quoteCursor);
const keepCurrentInRange=()=>{const n=discoveryQueue().length;quoteCursor=n?((quoteCursor%n)+n)%n:0};
const likedIcon=(liked)=>'<svg class="heart-svg" viewBox="0 0 40 40" aria-hidden="true"><path class="heart-path" d="M20 34C14.5 29.3 4 22 4 13.6 4 5 14.4 3.6 20 10.3 25.6 3.6 36 5 36 13.6 36 22 25.5 29.3 20 34Z"/></svg>'+Array.from({length:7},(_,i)=>{const angle=(i*2*Math.PI)/7;return '<i class="heart-spark" style="--dx:'+Math.round(Math.sin(angle)*34)+'px;--dy:'+Math.round(-Math.cos(angle)*34)+'px;--delay:'+(i%3)*20+'ms"></i>'}).join('');
const questionIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.3a8.8 8.8 0 0 1-9.3 8.8 9.2 9.2 0 0 1-3.5-.7L3 21l1.6-5.1A8.8 8.8 0 1 1 21 11.3Z"/><path d="M9.5 9a2.7 2.7 0 0 1 5.2.8c0 1.9-2.6 2-2.6 3.8"/><circle cx="12.1" cy="16.3" r=".45" fill="currentColor" stroke="none"/></svg>';
const haptic=(kind="selection")=>{
  // Native haptics where a hosting platform supports them. Standalone iPhone
  // browsers have no general JavaScript Taptic Engine access.
  try{
    const native=window.webkit?.messageHandlers?.yourlogosHaptics;
    if(native){native.postMessage(kind);return}
    const t=window.Telegram?.WebApp?.HapticFeedback;
    if(t){kind==="success"?t.notificationOccurred("success"):kind==="impact"?t.impactOccurred("light"):t.selectionChanged();return}
    navigator.vibrate?.(kind==="success"?[12,24,12]:8);
  }catch{}
};

const toast=(msg,{undo=false}={})=>{
  document.querySelector(".toast")?.remove();
  const el=document.createElement("div");el.className="toast"+(undo?" keep-toast":"");
  const label=document.createElement("span");label.textContent=msg;el.appendChild(label);
  if(undo){const b=document.createElement("button");b.type="button";b.textContent="Undo";b.dataset.action="undo-keep";b.setAttribute("aria-label","Undo keeping this thought");el.appendChild(b);}
  document.body.appendChild(el);clearTimeout(toastTimeout);
  toastTimeout=setTimeout(()=>{el.remove();if(keepPending?.phase==="completed")keepPending=null},undo?4400:2800);
};
const quoteBlock=(id)=>{const q=QUOTES[id];return '<div class="today-label">A THOUGHT FOR TODAY</div><h1 class="quote">“'+esc(q[0])+'”</h1><div class="author">— '+esc(q[1])+'</div><div class="source">'+esc(q[3])+'</div>'};
function sitHtml(q,p){return '<section class="practice"><div class="kicker">01 / DWELLING</div><h2>'+esc(PROMPTS[q[2]][0])+'</h2><p>You need not resolve it now. Carry it through the day. Return when something stays.</p><div class="inline-actions">'+btn("sit-return","What stayed?","outline")+'</div>'+(mode==="sit-return"||p.whatStayed?'<label class="section-kicker" style="display:block;margin-top:27px">WHAT STAYED WITH YOU?</label><textarea id="trace" placeholder="One sentence is enough. You can leave this unanswered." maxlength="1200">'+esc(p.whatStayed||"")+'</textarea><div class="inline-actions">'+btn("save-trace","Keep this trace","primary small")+'</div>':"")+'</section>'}
function questionHtml(q,p){let opts=[["Receive","The thought offers an insight worth defending."],["Resist","The thought conceals an assumption I cannot accept."],["Reframe","The real question lies beyond this opposition."]];let voices=[["In its defense","What experience makes this claim compelling?"],["Against it","Whose life or experience might contradict it?"]];return '<section class="practice"><div class="kicker">02 / THE DIALECTIC</div><h2>'+esc(PROMPTS[q[2]][1])+'</h2><p>A philosophical proposition is not a command. Put it under pressure.</p><div style="margin-top:23px">'+voices.map(v=>'<div class="countervoice"><div class="name">'+esc(v[0])+'</div><p>'+esc(v[1])+'</p></div>').join('')+'</div><h2 style="margin-top:29px">Where do you stand?</h2><p class="hintline">Choose a provisional position. You can change your mind.</p>'+opts.map((o,i)=>'<button class="stance '+(p.position===i?"selected":"")+'" data-position="'+i+'"><b>'+esc(o[0])+'</b><span>'+esc(o[1])+'</span></button>').join('')+(p.position!==undefined&&p.position!==null?'<div class="saved-note">Position recorded. Your thinking can change.</div>':"")+'</section>'}

function todayHtml(){
  const queue=discoveryQueue(),id=visibleQuoteId();
  if(id===null)return '<article class="today today-v2"><div class="encounter-complete" role="status"><div class="encounter-complete-mark" aria-hidden="true">✳</div><div class="section-kicker">YOUR CURIOSITY HAS TRAVELLED</div><h1>Every thought has found a home.</h1><p>Nothing new in your Encounter feed for now. Your saved thoughts are waiting in Library.</p><button type="button" data-action="view-saved-from-encounter">See saved thoughts ↗</button></div></article>';
  const q=QUOTES[id],liked=data.saved.includes(id);
  return '<article class="today today-v2">'+
    arrivalHtml()+
    '<div class="quote-viewport" id="quote-viewport" tabindex="0" aria-label="Quotes. Swipe up or down, or use arrow keys, to browse ideas.">'+
      '<div class="quote-halo" aria-hidden="true"></div>'+
      '<div class="quote-motion" id="quote-motion">'+
      '<div class="personal-greeting">'+(data.localName?'A thought for you, '+esc(data.localName)+'.':'A moment for your curiosity.')+'</div><div class="today-label">'+(quoteCursor===0?"TODAY’S THOUGHT":"ANOTHER PERSPECTIVE")+'</div>'+
      '<div class="quote-rule"></div><h1 class="quote '+(q[0].length>158?'quote-dense':q[0].length>108?'quote-medium':'')+'">“'+esc(q[0])+'”</h1><div class="author">— '+esc(q[1])+'</div>'+
      '<div class="quote-theme">'+esc(q[2]).toUpperCase()+'</div></div>'+
      '<div class="quote-dots" aria-hidden="true">'+queue.slice(0,6).map((_,i)=>'<i class="'+(i===Math.min(quoteCursor,5)?"on":"")+'"></i>').join('')+'</div>'+
    '</div>'+
    '<div class="quote-footer"><div class="swipe-cue">↑ &nbsp; SWIPE FOR ANOTHER THOUGHT</div>'+
    '<div class="quote-actions">'+
      '<button type="button" aria-label="'+(liked?"Remove this saved thought":"Keep this thought")+'" title="'+(liked?"Remove saved thought":"Keep this thought")+'" aria-pressed="'+liked+'" data-action="toggle-save" class="icon-action yl-quote-btn heart-button'+(liked?" liked":"")+(heartPulse?" heart-pop":"")+'">'+likedIcon(liked)+'</button>'+
      '<button type="button" aria-label="Discover what this thought means for you" title="Discover what this thought means for you" aria-haspopup="dialog" data-action="discover" class="icon-action yl-quote-btn discover-button">'+questionIcon+'</button>'+
    '</div></div></article>';
}
const DISCOVERY_RESPONSES=[
  {id:"resonate",title:"This speaks to my experience",body:"Something here feels true, even if I cannot fully explain it."},
  {id:"resist",title:"I want to challenge this",body:"An assumption here deserves a closer look."},
  {id:"ambivalent",title:"Both can be true",body:"I can hold the tension without resolving it."},
  {id:"curious",title:"I need another perspective",body:"I want to discover how someone else might see this."}
];
const DISCOVERY_LENSES=[
  {id:"experience",title:"My own experience",body:"How does this appear in everyday life?"},
  {id:"reason",title:"The underlying logic",body:"What assumption holds this claim together?"},
  {id:"others",title:"Other people",body:"Whose experience might challenge it?"},
  {id:"time",title:"Change over time",body:"Would I still feel this way years from now?"}
];

function discoverHtml(){
  const id=visibleQuoteId(),q=QUOTES[id];
  return '<div class="discover-cover" data-action="close-discover"></div>'+
    '<section class="discover-sheet discover-v26 v31-discover v32-discover" role="dialog" aria-modal="true" aria-label="Discover this thought">'+
      '<div class="sheet-handle"></div>'+
      '<div class="sheet-head"><span>DISCOVER</span><div class="v32-header-actions">'+
        '<button type="button" data-action="encounter-sound" class="v32-sound-toggle" data-sound="'+(encounterSoundEnabled()?'on':'off')+'" aria-pressed="'+encounterSoundEnabled()+'" aria-label="'+(encounterSoundEnabled()?'Mute':'Enable')+' Encounter sound" title="'+(encounterSoundEnabled()?'Mute':'Enable')+' Encounter sound">'+
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 16V5l9-2v11"/><circle cx="7" cy="17" r="3"/><circle cx="16" cy="15" r="3"/>'+(encounterSoundEnabled()?'':'<path d="M3 3 21 21" stroke-width="2"/>')+'</svg></button>'+
        '<button type="button" data-action="close-discover" class="sheet-close" aria-label="Close">×</button></div></div>'+
      (aiDiscoverEnabled&&aiDiscoverMode?
        aiConversationHtml({quote:q,conversation:safeAIConversation(aiConversation,id),available:aiDiscoverEnabled,authenticated:true}):
        livingHtml({quote:q,id,session:data.livingThreads.sessions[String(id)]||null,profile:data.personalization,history:data.livingThreads.history,memory:sharedWorldMemory()})+
        '')+
    '</section>';
}

function listHtml(ids){return ids.length?ids.map(id=>'<button class="quote-card" data-detail="'+id+'"><div class="line">“'+esc(QUOTES[id][0])+'”</div><div class="meta">— '+esc(QUOTES[id][1])+' · '+esc(QUOTES[id][2])+'</div></button>').join(""):'<div class="empty">Nothing here yet. Return to today’s thought.</div>'}


const SCHOOL_ART_IMAGES={"stoicism":{name:"Equestrian Statue of Marcus Aurelius",artist:"Photograph: Adrian Pingstone",src:"https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent("Marcus.aurelius.horse.statue.rome.arp.jpg")+"?width=900",page:"https://commons.wikimedia.org/wiki/File:"+encodeURIComponent("Marcus.aurelius.horse.statue.rome.arp.jpg")},
"existentialism":{name:"Wanderer above the Sea of Fog",artist:"Caspar David Friedrich",src:"https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent("Caspar David Friedrich - Wanderer above the Sea of Fog.jpeg")+"?width=900",page:"https://commons.wikimedia.org/wiki/File:"+encodeURIComponent("Caspar David Friedrich - Wanderer above the Sea of Fog.jpeg")},
"nihilism":{name:"The Abbey in the Oakwood",artist:"Caspar David Friedrich",src:"https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent("The Abbey in the Oakwood.jpg")+"?width=900",page:"https://commons.wikimedia.org/wiki/File:"+encodeURIComponent("The Abbey in the Oakwood.jpg")},
"skepticism":{name:"The Incredulity of Saint Thomas",artist:"Caravaggio",src:"https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent("The Incredulity of Saint Thomas-Caravaggio (1601-2).jpg")+"?width=900",page:"https://commons.wikimedia.org/wiki/File:"+encodeURIComponent("The Incredulity of Saint Thomas-Caravaggio (1601-2).jpg")},
"daoism":{name:"Travelers Among Mountains and Streams",artist:"Fan Kuan",src:"https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent("Xsxlt fankuan.jpg")+"?width=900",page:"https://commons.wikimedia.org/wiki/File:"+encodeURIComponent("Xsxlt fankuan.jpg")},
"buddhism":{name:"Seated Buddha",artist:"Cleveland Museum of Art, CC0",src:"https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent("Afghanistan, Gandhara, Hadda, late Kushan Period - Seated Buddha - 1967.39 - Cleveland Museum of Art.jpg")+"?width=900",page:"https://commons.wikimedia.org/wiki/File:"+encodeURIComponent("Afghanistan, Gandhara, Hadda, late Kushan Period - Seated Buddha - 1967.39 - Cleveland Museum of Art.jpg")}};
function schoolPlayHtml(id){
  const experience=SCHOOL_SCENES[id];if(!experience)return "";
  const scene=experience.scenes[schoolSceneIndex%experience.scenes.length];
  const chosen=schoolChoiceIndex===null?null:scene.options[schoolChoiceIndex];
  const axis=chosen?chosen[2]:50;
  return '<section class="school-play-lab" aria-label="Try this philosophy in a real situation">'+
    '<div class="school-play-top"><span>AN IDEA IN MOTION</span><span>SCENE '+(schoolSceneIndex+1)+' / '+experience.scenes.length+'</span></div>'+
    '<div class="school-play-context">'+esc(scene.place)+'</div>'+
    '<h2>'+esc(scene.question)+'</h2>'+
    '<div class="school-play-options">'+scene.options.map((o,i)=>
      '<button type="button" data-school-choice="'+i+'" class="'+(schoolChoiceIndex===i?'chosen':'')+'" aria-pressed="'+(schoolChoiceIndex===i)+'"><span class="school-choice-bullet">'+(i+1)+'</span>'+esc(o[0])+'</button>').join('')+'</div>'+
    '<div class="school-play-axis"><div class="school-axis-caption">'+esc(experience.tag)+'</div>'+
      '<div class="school-axis-track"><div class="school-axis-current" style="--axis:'+axis+'%"></div></div>'+
      '<div class="school-axis-labels"><span>'+esc(experience.pole[0])+'</span><span>'+esc(experience.pole[1])+'</span></div></div>'+
    '<div class="school-play-insight" role="status" aria-live="polite">'+
      (chosen?'<span class="school-insight-eyebrow">ONE WAY TO SEE IT</span><p>'+esc(chosen[1])+'</p><small>'+esc(scene.insight)+'</small>':
      '<span class="school-insight-eyebrow">NOT A QUIZ</span><p>Choose an instinct. Watch the perspective shift.</p>')+
    '</div>'+
    '<div class="school-play-actions"><button type="button" data-school-scene="next">'+
      (schoolSceneIndex+1<experience.scenes.length?'Another situation →':'Start again ↺')+
    '</button><span>No scores. Only perspectives.</span></div>'+
  '</section>';
}
function schoolBackdropHtml(id){
  const art=SCHOOL_ART_IMAGES[id];
  return art?'<figure class="school-atmosphere" aria-hidden="true"><img alt="" loading="eager" fetchpriority="high" decoding="async" src="/api/school-art/'+id+'" data-fallback="0" onerror="if(this.dataset.fallback===\'0\'){this.dataset.fallback=\'1\';this.src=this.dataset.remote}else this.hidden=true" data-remote="'+esc(art.src)+'"/></figure>':'';
}
function schoolArtCreditHtml(id){
  const art=SCHOOL_ART_IMAGES[id];
  return art?'<div class="school-art-credit">Art: <a target="_blank" rel="noopener noreferrer" href="'+art.page+'">'+esc(art.name)+'</a> · '+esc(art.artist)+'</div>':'';
}
function libraryHtml(){
  const current=SCHOOLS.find(s=>s.id===openSchoolId);
  if(libraryScope==="liked" && !current){
    return '<section class="view library-v3 library-liked" aria-label="Liked quotes">'+
      '<button type="button" data-library-root class="school-back" aria-label="Back to all philosophies"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7M7 12h13"/></svg>All philosophies</button>'+
      '<div class="library-v3-kicker">YOUR COLLECTION</div><h1>Thoughts kept</h1>'+
      '<p class="library-liked-sub">Quotes you have chosen to remember.</p>'+
      '<div class="library-liked-list">'+listHtml(data.saved.slice().reverse())+'</div></section>';
  }
  if(!current){
    return '<section class="view library-v3" aria-label="Philosophy library">'+
      '<div class="library-v3-intro"><div><div class="library-v3-kicker">WAYS OF SEEING</div><h1>Library</h1></div>'+
      '</div>'+ 
      '<div class="library-v3-guide"><span>'+SCHOOLS.length+' ways of seeing</span><span class="guide-dot" aria-hidden="true"></span><span>Scroll to explore</span></div>'+ 
      '<div class="school-grid">'+SCHOOLS.map(s=>
        '<button type="button" class="school-tile school-'+s.id+'" data-school="'+esc(s.id)+'" aria-label="Explore '+esc(s.name)+'">'+
        '<div class="school-art">'+schoolArtwork(s.id)+'</div><span class="school-name">'+esc(s.name)+'</span></button>'
      ).join('')+'</div>'+
    '</section>';
  }
  return '<section class="view library-v3 school-detail-screen" aria-label="'+esc(current.name)+'">'+
    '<div class="school-detail-scroll" id="school-detail-scroll">'+
      '<button type="button" data-school-back class="school-back" aria-label="Back to all philosophies">'+
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5-7 7 7 7M7 12h13"/></svg>All philosophies</button>'+
      (bridgeFromQuestion?.schoolId===current.id?'<div class="school-bridge"><div class="school-bridge-label">FROM YOUR ENCOUNTER <span aria-hidden="true">✳</span></div><p>'+esc(bridgeFromQuestion.question)+'</p><small>'+esc(bridgeFromQuestion.move.toUpperCase())+' · '+esc(bridgeFromQuestion.challenge)+'</small></div>':'')+
      '<div class="school-hero school-'+esc(current.id)+'">'+schoolArtwork(current.id)+'</div>'+
      schoolBackdropHtml(current.id)+
      '<h1 class="school-detail-title">'+esc(current.name)+'</h1>'+
      '<p class="school-detail-sub">'+esc(current.subtitle)+'</p>'+
      '<div class="school-section"><div class="school-section-label">THE CENTRAL QUESTION</div><h2 class="school-big-question">'+esc(current.question)+'</h2></div>'+
      '<div class="school-section school-idea-summary"><div class="school-section-label">THE IDEA IN A SENTENCE</div><p>'+esc(current.intro)+'</p></div>'+
      schoolPlayHtml(current.id)+
      '<details class="school-deep-dive"><summary>Go deeper into this philosophy <span aria-hidden="true">⌄</span></summary>'+
      '<div class="school-section"><div class="school-section-label">KEY VOICES</div><div class="school-voices">'+current.thinkers.map(name=>'<span>'+esc(name)+'</span>').join('')+'</div></div>'+
      '<div class="school-section"><div class="school-section-label">CORE TENSIONS</div><div class="school-tensions">'+current.tensions.map(t=>'<div>'+esc(t)+'</div>').join('')+'</div></div>'+
      '<div class="school-section"><div class="school-section-label">A THOUGHT TO CARRY</div><div class="school-reflection">'+esc(current.reflection)+'</div><p class="school-prompt-note">No answer required. Just a place to begin.</p></div></details>'+
      schoolArtCreditHtml(current.id)+
    '</div></section>';
}

function savedHtml(){return '<section class="view v22-saved" aria-label="Saved thoughts"><div class="v22-kicker">YOUR COLLECTION</div><h1>Thoughts kept.</h1><p class="v22-sub">The ideas you chose to remember, not necessarily the ones you agree with.</p><div class="v22-saved-count">'+data.saved.length+' saved encounters</div>'+listHtml(data.saved.slice().reverse())+'</section>'}
const SCHOOL_ASSOCIATIONS={"Seneca":"Stoicism","Marcus Aurelius":"Stoicism","Jean-Paul Sartre":"Existentialism","Laozi":"Daoism","Thích Nhất Hạnh":"Buddhism","Zen koan (Dizang)":"Buddhism"};
function fingerprintHtml(){
  const saved=data.saved.map(i=>QUOTES[i]).filter(Boolean);
  const mentions=(list)=>{const counts={};list.forEach(t=>{if(t)counts[t]=(counts[t]||0)+1});return Object.entries(counts).sort((a,b)=>b[1]-a[1])};
  const themes=mentions(saved.map(q=>q[2])),authors=mentions(saved.map(q=>q[1])),schools=mentions(saved.map(q=>SCHOOL_ASSOCIATIONS[q[1]]));
  const reflections=Object.values(data.discovery).filter(x=>x&&x.response);
  const approaches=mentions(reflections.map(x=>DISCOVERY_RESPONSES.find(y=>y.id===x.response)?.title));
  const lenses=mentions(reflections.map(x=>DISCOVERY_LENSES.find(y=>y.id===x.lens)?.title));
  const colors=['#d7bf9d','#98b8cc','#b4a4d4','#b1c9bb','#ca9f9c','#e0d8c0'];
  let running=0;const grad=themes.length?themes.map((x,i)=>{const begin=running;running+=x[1]/saved.length*100;return colors[i%colors.length]+' '+begin+'% '+running+'%'}).join(', '):'transparent 0 100%';
  const bars=(counts,empty)=>counts.length?counts.slice(0,6).map(([label,n],i)=>'<div class="v22-bar"><div class="v22-bar-caption"><span>'+esc(label)+'</span><span>'+n+'</span></div><div class="v22-track"><i style="width:'+(n/counts[0][1]*100)+'%;background:'+colors[i%colors.length]+'"></i></div></div>').join(''):'<p class="v22-muted">'+empty+'</p>';
  return '<section class="view v22-fingerprint" aria-label="Philosophical fingerprint"><div class="v22-kicker">AN UNFINISHED PORTRAIT</div><h1>Your fingerprint.</h1><p class="v22-sub">A readable picture of where your curiosity has wandered—not a personality test or a measure of what you believe.</p>'+
    '<div class="v22-metrics"><div><b>'+saved.length+'</b><span>Thoughts kept</span></div><div><b>'+reflections.length+'</b><span>Responses</span></div><div><b>'+new Set(saved.map(q=>q[2])).size+'</b><span>Themes visited</span></div></div>'+
    '<article class="v22-data-card"><div class="v22-card-head"><span>SAVED THEMES</span><small>From your saved quotes</small></div>'+
    (saved.length?'<div class="v22-donut-wrap"><div class="v22-donut" role="img" aria-label="Theme distribution of saved quotes" style="background:conic-gradient('+grad+')"><div><b>'+saved.length+'</b><small>kept</small></div></div><div class="v22-legend">'+themes.slice(0,6).map(([t,n],i)=>'<div><i style="background:'+colors[i%colors.length]+'"></i><span>'+esc(t)+'</span><b>'+Math.round(n/saved.length*100)+'%</b></div>').join('')+'</div></div>':'<p class="v22-muted">Save a quote in Encounter to begin seeing recurring themes.</p>')+'</article>'+
    '<article class="v22-data-card"><div class="v22-card-head"><span>AUTHORS YOU KEEP</span><small>Saved quotes, not beliefs</small></div>'+bars(authors,'No authors yet.')+'</article>'+
    '<article class="v22-data-card"><div class="v22-card-head"><span>PHILOSOPHICAL TRADITIONS</span><small>Where a source has a clear association</small></div>'+bars(schools,'Not enough attributable saved quotes yet.')+'<p class="v22-data-note">A thinker can belong to several traditions. We only use conservative editorial associations here.</p></article>'+
    '<article class="v22-data-card"><div class="v22-card-head"><span>HOW YOU APPROACH QUESTIONS</span><small>From Discover choices</small></div>'+bars(approaches,'Try Discover and choose how an idea lands with you.')+'<div class="v22-card-head v22-inset"><span>LENSES YOU EXPLORE</span></div>'+bars(lenses,'Choose a second perspective in Discover to populate this section.')+'</article>'+
    worldFingerprintEvidence(data.encounterEvents)+
     '<p class="v22-fine">Based on this browser’s saved quotes and explicit choices. You can revise or clear your Discover responses in Settings. Nothing here is a diagnosis.</p></section>';
}
function settingsHtml(){
  const responses=Object.keys(data.discovery).length+(data.encounterEvents?.length||0)+(data.thoughtThreadEvents?.length||0)+(data.livingThreads?.history?.length||0);
  return '<section class="view v22-settings" aria-label="YourLogos settings"><div class="v22-kicker">YOUR SPACE, YOUR TERMS</div><h1>Settings.</h1><p class="v22-sub">Your curiosity belongs to you.</p>'+
    '<div class="v22-settings-block"><h2>Your account</h2><p>Personalize the way YourLogos welcomes you. Your display name is kept on this device until account sync is connected.</p>'+
      '<form id="profile-name-form" class="account-form"><label for="display-name">DISPLAY NAME</label><input id="display-name" name="displayName" required maxlength="32" autocomplete="nickname" placeholder="What should we call you?" value="'+esc(data.localName)+'"/><button type="submit">Save name</button></form>'+
      (verifiedIdentity?'<p class="account-muted">Verified email: '+esc(verifiedIdentity.email)+'. Your device data remains private until you choose to transfer it.</p>'+
       '<div class="account-cloud-options"><p>Cloud history is optional. Upload this device’s saved quotes, check-ins and responses, or restore a previous cloud snapshot. Neither happens automatically.</p>'+
       '<button type="button" class="v22-setting-row" data-action="cloud-save" '+(syncBusy?'disabled':'')+'><span><strong>Save this device to my account</strong><small>Replaces the cloud copy, not this device</small></span><b>↗</b></button>'+
       '<button type="button" class="v22-setting-row" data-action="cloud-restore" '+(syncBusy?'disabled':'')+'><span><strong>Restore my account history</strong><small>Replaces this device’s saved quotes, preferences and responses</small></span><b>↗</b></button>'+
       (syncConfirm?'<div class="v22-confirm"><p>'+esc(syncConfirm==="save"?"Replace the saved account copy with this device’s current data? This does not delete anything on this device.":"Replace the saved history on this device with the cloud copy? Export your local data first if you want a backup.")+'</p><button type="button" data-action="cloud-confirm" '+(syncBusy?'disabled':'')+'>Confirm transfer</button><button type="button" data-action="cloud-cancel">Cancel</button></div>':'')+
       (cloudStateInfo?'<p class="account-muted" role="status">'+esc(cloudStateInfo)+'</p>':'')+'</div>'+
       '<button type="button" data-action="email-signout" class="v22-setting-row"><span><strong>Sign out from email</strong></span><b>↗</b></button>':
       AUTH_ENABLED?'<form id="account-email-form" class="account-form"><label for="account-email">EMAIL ADDRESS</label><input id="account-email" type="email" name="email" required autocomplete="email" placeholder="you@example.com"/><button type="submit" '+(authBusy?'disabled':'')+'>Send secure sign-in link</button></form>':
       '<p class="account-muted">Verified email enrollment will be available when a dedicated YourLogos authentication project is connected. You can still save your name and use the app without an account.</p>')+
       (authNotice?'<div class="account-notice" role="status">'+esc(authNotice)+'</div>':'')+'</div>'+
    '<div class="v22-settings-block arrival-settings"><h2>Your returns</h2><p>Each day you choose to arrive leaves a small light. No pressure to keep a streak, and missing a day changes nothing.</p>'+
    '<div class="arrival-summary"><span class="arrival-count">'+data.arrivals.length+'</span><span>days you made room for a thought</span></div>'+
    '<div class="arrival-seven">'+arrivalDates().map(x=>'<div><span class="'+(data.arrivals.includes(x)?"visited":"")+'"></span><small>'+x.slice(5)+'</small></div>').join("")+'</div>'+
    '<button type="button" data-action="preview-tomorrow" class="v22-setting-row"><span><strong>Preview tomorrow’s quote</strong><small>For testing only. Does not affect today or mark an arrival.</small></span><b>↗</b></button></div>'+
    '<div class="v22-settings-block"><h2>Your data</h2><p>Your quotes, reflections and universe history currently stay on this browser. No account sync yet.</p><button type="button" data-action="export" class="v22-setting-row"><span><strong>Export everything</strong><small>Saved thoughts, Discover choices and universe history</small></span><b>↗</b></button><button type="button" data-action="edit-themes" class="v22-setting-row"><span><strong>Change interests</strong><small>Adjust the questions you chose when starting</small></span><b>↗</b></button></div>'+
    '<div class="v22-settings-block"><h2>Exploration history</h2><p>'+responses+' exploration choice'+(responses===1?"":"s")+' recorded. Choices are provisional evidence of exploration, not a personality classification.</p>'+
    (settingsConfirm?'<div class="v22-confirm"><p>Clear all Encounter and Library exploration choices from this browser? Your saved quotes and sky readings will remain.</p><button type="button" data-action="confirm-clear-discovery">Yes, clear responses</button><button type="button" data-action="cancel-clear-discovery">Cancel</button></div>':'<button type="button" data-action="clear-discovery" class="v22-setting-row"><span><strong>Clear my exploration choices</strong><small>This does not delete saved quotes</small></span><b>↗</b></button>')+'</div>'+
    '<div class="v22-settings-block"><h2>About YourLogos</h2><p>A space to encounter ideas, leave traces of questions, and discover where thought leads. There are no scores for being philosophical.</p></div></section>';
}
function worldBack(){return '<button type="button" data-world-pane="home" class="world-back">← My World</button>'}
function profileHtml(){
  if(universePane==="sky")return '<section class="view living-universe-embed" aria-label="Your living sky">'+
    '<iframe id="cosmos-frame" src="/cosmos-v2.html" title="Living sky of ideas" loading="eager"></iframe>'+
    '</section>';
  if(universePane==="home")return worldHomeHtml({saved:data.saved.map(i=>QUOTES[i]).filter(Boolean),discovery:data.discovery,name:data.localName,encountersHtml:worldHomeEvidence(data.encounterEvents)})+worldMemoryHtml(sharedWorldMemory());
  return '<div class="world-detail">'+worldBack()+(universePane==="saved"?savedHtml():universePane==="fingerprint"?fingerprintHtml():mirrorHtml(data.saved.map(i=>QUOTES[i]).filter(Boolean),data.discovery))+'</div>';
}

function detailHtml(){const id=detailId,q=QUOTES[id];return '<section class="view detail">'+btn("back",svg("back")+" Back","top-back")+'<div class="section-kicker" style="margin-top:35px">'+esc(q[2])+'</div><h1>“'+esc(q[0])+'”</h1><div class="author" style="text-align:left">— '+esc(q[1])+'</div><h2>Source</h2><p>'+esc(q[3])+'</p><h2>To sit with</h2><p>'+esc(PROMPTS[q[2]][0])+'</p><h2>To question</h2><p>'+esc(PROMPTS[q[2]][1])+'</p><div class="inline-actions" style="margin-top:36px">'+btn("detail-save",data.saved.includes(id)?"Remove from saved":"Save this thought","outline")+'</div></section>'}
function onboardingHtml(){return '<section class="view onboard"><div class="section-kicker" style="text-align:center;margin-bottom:24px">BEFORE WE BEGIN</div><h1>What are you searching for?</h1><p class="sub">Choose any themes that interest you, or leave them unselected. You can change this later.</p><div class="grid">'+THEMES.map(t=>'<button class="theme-card '+(data.themes.includes(t)?"selected":"")+'" data-theme="'+t+'"><b>'+t+'</b><span>'+esc(PROMPTS[t][1])+'</span></button>').join("")+'</div><div class="count">'+data.themes.length+' of 5 selected</div><div class="actions">'+btn("finish-onboarding","Return to YourLogos","primary")+'</div></section>'}

function tomorrowPreviewHtml(){
  const key=shiftDate(today(),1),id=Number.isInteger(data.practice[key]?.quoteId)?data.practice[key].quoteId:dailyPick(key),q=QUOTES[id];
  return '<div class="discover-cover" data-action="close-preview"></div><section class="tomorrow-preview" role="dialog" aria-modal="true" aria-label="Preview tomorrow’s quote">'+
    '<div class="tomorrow-star" aria-hidden="true">✧</div><div class="v22-kicker">A THOUGHT FROM TOMORROW · PREVIEW ONLY</div>'+
    '<h2>“'+esc(q[0])+'”</h2><p>— '+esc(q[1])+'</p><small>'+esc(key)+' · This will not be recorded as a visit.</small>'+
    '<button type="button" data-action="close-preview" class="tomorrow-close">Return to today</button></section>';
}

function render(){
  // Preserve the real dock element across app renders so indicator motion
  // continues instead of snapping back to a new element every click.
  const persistentNav=document.querySelector("body > .mobile-tabs");
  // Like the bottom dock, the top-right profile launcher must survive all
  // view/Settings re-renders. Replacing its DOM node makes mobile taps flicker
  // and can leave its stacking context behind the newly rendered route.
  const persistentSettings=document.querySelector("body > .settings-launch");
  const onboarding=view==="onboarding"; // No compulsory onboarding: enter directly through curiosity.
  const inner=settingsOpen?
    '<section class="view settings-route" aria-label="Account and settings"><button type="button" class="settings-route-back" data-action="settings-close">← Back</button>'+settingsHtml()+'</section>':
    onboarding?onboardingHtml():detailId!==null?detailHtml():view==="today"?todayHtml():view==="library"?libraryHtml():profileHtml();
  const active=navs.findIndex(x=>x[0]===view),from=navFrom;
  document.getElementById("app").innerHTML='<div class="shell"><aside class="rail"><div><div class="wordmark"><img class="yl-brand-mark" src="/icon.svg" width="32" height="32" alt="" draggable="false"/>YourLogos</div><div class="rail-sub">Be your own philosopher.</div></div><nav class="nav">'+navHtml(false)+'</nav><div class="rail-foot"><small>PHILOSOPHY, PRACTICED</small>A thought is an invitation,<br/>not a task.</div></aside>'+
  '<main class="stage'+(navPulse===view&&from!==active?' motion-tab-entry':'')+'" style="--motion-dir:'+(active>from?1:-1)+'"><header class="stage-top"><div class="brand-top"><span class="mobile-brand"><img class="yl-brand-mark" src="/icon.svg" width="28" height="28" alt="" draggable="false"/>YourLogos</span><span class="eyebrow">PHILOSOPHY, PRACTICED</span><span class="top-sub">Be your own philosopher.</span></div><div class="daily-meta">'+(settingsOpen?"SETTINGS":view==="library"?"LIBRARY":view==="profile"?"MY WORLD":"DAILY ENCOUNTER")+'<span>'+(view==="library"?"SCHOOLS OF THOUGHT":view==="profile"?"STILL BECOMING":String(quoteCursor+1).padStart(2,"0")+' / '+String(QUOTES.length).padStart(2,"0"))+'</span></div></header>'+inner+'</main>'+
  '<aside class="side"><div class="section-kicker">A QUIETER KIND OF FEED</div><div class="side-quote"><h3>One thought at a time.</h3><p>Swipe to encounter something new. Like what stays with you, or discover a deeper question.</p></div><div class="side-bottom"><strong>Depth, not motivation.</strong><span>YourLogos · V3.1</span></div></aside></div>'+
  (onboarding?'':'<nav class="mobile-tabs"><div class="dock-glass" style="--dock-active:'+(active<0?0:active)+';--dock-from:'+from+'"><div class="dock-indicator"></div>'+navHtml(true)+'</div></nav>')+
  (discoverOpen && !onboarding?discoverHtml():'')+
  (previewTomorrowOpen&&!onboarding?tomorrowPreviewHtml():'')+
  (!onboarding&&!persistentSettings?'<button type="button" data-action="settings-open" class="settings-launch" title="Profile and settings" aria-label="Profile and settings" aria-controls="app" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21c0-7 14-7 14 0"/></svg></button>':'')+
  '';
  // Settings is a real app route, not a portal or dialog. It cannot vanish
  // behind WebKit top layers, transformed scenes, or a stale focus trap.
  document.querySelector("body > dialog.settings-layer")?.remove();
  // Keep a single, stable launcher directly under <body>, outside the
  // reconstructed app shell and any animated/sticky page containers.
  const replacementSettings=document.querySelector("#app > .settings-launch");
  if(onboarding){
    persistentSettings?.remove();
    replacementSettings?.remove();
  }else if(persistentSettings){
    replacementSettings?.remove();
  }else if(replacementSettings){
    document.body.appendChild(replacementSettings);
  }
  const settingsLauncher=document.querySelector("body > .settings-launch");
  if(settingsLauncher){
    settingsLauncher.setAttribute("aria-expanded",String(settingsOpen));
    settingsLauncher.setAttribute("aria-pressed",String(settingsOpen));
    settingsLauncher.classList.toggle("is-open",settingsOpen);
  }
  const oldBack=document.querySelector("body > .sky-return");
  if(view==="profile"&&universePane==="sky"&&!settingsOpen){
    if(!oldBack){
      const back=document.createElement("button");
      back.type="button";back.className="sky-return";back.dataset.worldPane="home";
      back.textContent="← My World";back.setAttribute("aria-label","Back to My World");
      document.body.appendChild(back);
    }
  }else oldBack?.remove();
  // Place the dock outside #app once, so subsequent innerHTML updates never
  // detach it. This is what makes the moving selection feel continuous.
  const replacementNav=document.querySelector("#app .mobile-tabs");
  if(onboarding){
    persistentNav?.remove();
  }else if(persistentNav){
    replacementNav?.remove();
  }else if(replacementNav){
    document.body.appendChild(replacementNav);
  }
  const currentDock=document.querySelector("body > .mobile-tabs .dock-glass");
  if(currentDock&&active>=0){
    // Keep the existing glass indicator mounted for true interpolated motion.
    currentDock.style.setProperty("--dock-active",String(active));
    currentDock.querySelectorAll(".dock-btn").forEach(button=>{
      const chosen=button.dataset.view===view;
      button.classList.toggle("active",chosen);
      button.setAttribute("aria-current",chosen?"page":"false");
      button.classList.remove("icon-moving");
      if(chosen&&navPulse===view){
        void button.offsetWidth;
        button.classList.add("icon-moving");
      }
    });
  }
  if(view==="today"&&!onboarding&&detailId===null)bindQuoteGesture();
  window.dispatchEvent(new CustomEvent("yourlogos:ready",{detail:{date:today(),quoteId:visibleQuoteId()??activeQuote(),quote:QUOTES[visibleQuoteId()??activeQuote()]}}));
}
function bindQuoteGesture(){
  const area=document.getElementById("quote-viewport"),card=document.getElementById("quote-motion");
  if(!area||!card)return;
  let start=null,wheelSum=0,wheelAt=0;
  const settle=()=>{
    card.style.transition="transform .38s cubic-bezier(.2,1.12,.28,1),opacity .26s ease";
    card.style.transform="translate3d(0,0,0) scale(1)";card.style.opacity="1";
  };
  area.addEventListener("pointerdown",e=>{
    if(discoverOpen||swipeBusy||e.isPrimary===false||e.button>0)return;
    start={id:e.pointerId,y:e.clientY,t:performance.now(),dy:0};
    try{area.setPointerCapture(e.pointerId)}catch{}
    card.style.transition="none";
  });
  area.addEventListener("pointermove",e=>{
    if(!start||start.id!==e.pointerId||swipeBusy)return;
    start.dy=e.clientY-start.y;
    const dy=Math.sign(start.dy)*Math.min(118,Math.abs(start.dy)*.55);
    card.style.transform="translate3d(0,"+dy+"px,0) scale("+(1-Math.min(.035,Math.abs(start.dy)*.00015))+")";
    card.style.opacity=String(1-Math.min(.24,Math.abs(start.dy)*.001));
  });
  const finish=(e,cancelled=false)=>{
    if(!start||start.id!==e.pointerId)return;
    const dist=start.dy,velocity=Math.abs(dist)/Math.max(1,performance.now()-start.t);start=null;
    if(!cancelled&&(Math.abs(dist)>62||(Math.abs(dist)>28&&velocity>.55)))moveQuote(dist<0?1:-1);
    else settle();
  };
  area.addEventListener("pointerup",e=>finish(e));
  area.addEventListener("pointercancel",e=>finish(e,true));
  area.addEventListener("wheel",e=>{
    e.preventDefault();
    if(swipeBusy||discoverOpen)return;
    const now=performance.now();if(now-wheelAt>180)wheelSum=0;
    wheelAt=now;wheelSum+=e.deltaY;
    if(Math.abs(wheelSum)>52){const direction=wheelSum>0?1:-1;wheelSum=0;moveQuote(direction);}
  },{passive:false});
  area.addEventListener("keydown",e=>{if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();moveQuote(e.key==="ArrowDown"?1:-1)}});
}
function moveQuote(direction){
  if(swipeBusy||discoverOpen||view!=="today"||detailId!==null||!discoveryQueue().length)return;
  const area=document.getElementById("quote-viewport"),current=document.getElementById("quote-motion");
  if(!area||!current)return;
  swipeBusy=true;haptic();
  const queue=discoveryQueue(),nextCursor=(quoteCursor+direction+queue.length)%queue.length;
  const id=queue[nextCursor],q=QUOTES[id];
  const exitY=direction>0?-Math.max(180,area.clientHeight*.48):Math.max(180,area.clientHeight*.48);
  const enterY=-exitY;
  const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if(reduced){quoteCursor=nextCursor;heartPulse=false;render();swipeBusy=false;return;}
  const next=current.cloneNode(true);
  next.id="quote-motion-next";
  const greeting=next.querySelector(".personal-greeting");
  const label=next.querySelector(".today-label");
  const quote=next.querySelector(".quote");
  const author=next.querySelector(".author");
  const theme=next.querySelector(".quote-theme");
  if(greeting)greeting.textContent=data.localName?"A thought for you, "+data.localName+".":"A moment for your curiosity.";
  if(label)label.textContent=nextCursor===0?"TODAY’S THOUGHT":"ANOTHER PERSPECTIVE";
  if(quote){quote.textContent="“"+q[0]+"”";quote.classList.toggle("quote-dense",q[0].length>158);quote.classList.toggle("quote-medium",q[0].length<=158&&q[0].length>108);}
  if(author)author.textContent="— "+q[1];
  if(theme)theme.textContent=q[2].toUpperCase();
  next.style.position="absolute";next.style.top="50%";next.style.left="0";next.style.width="100%";
  next.style.transform="translate3d(0,calc(-50% + "+enterY+"px),0) scale(.965)";
  next.style.opacity="0";next.style.transition="none";next.style.pointerEvents="none";
  area.appendChild(next);
  // Keep the old and new thought visible in a shared, continuous motion.
  current.style.transition="transform .43s cubic-bezier(.25,.78,.34,1),opacity .35s ease";
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(!next.isConnected)return;
    current.style.transform="translate3d(0,"+exitY+"px,0) scale(.96)";
    current.style.opacity="0";
    next.style.transition="transform .49s cubic-bezier(.19,1,.25,1),opacity .35s ease";
    next.style.transform="translate3d(0,-50%,0) scale(1)";
    next.style.opacity="1";
  }));
  setTimeout(()=>{
    quoteCursor=nextCursor;heartPulse=false;
    render();swipeBusy=false;
  },510);
}

// Unified, immediate touch feedback across the existing glass control family.
// Visual response begins at pointer-down instead of waiting for click/route work.
document.addEventListener("pointerdown",e=>{
  if(e.isPrimary===false||e.button>0)return;
  const element=e.target instanceof Element?e.target:null;
  const button=element?.closest("button");
  if(!button||!button.matches('[data-view],[data-world-pane],[data-school],[data-school-back],[data-action],.quote-card,.v26-discover-choices button'))return;
  if(button.disabled)return;
  button.classList.add("motion-tap","motion-pressed");
  const rect=button.getBoundingClientRect();
  if(rect.width&&rect.height){
    const orb=document.createElement("span");
    orb.className="motion-ripple";
    orb.style.setProperty("--touch-x",(e.clientX-rect.left)+"px");
    orb.style.setProperty("--touch-y",(e.clientY-rect.top)+"px");
    button.appendChild(orb);
    requestAnimationFrame(()=>orb.classList.add("rippling"));
    setTimeout(()=>orb.remove(),510);
  }
},{passive:true});
const releaseTouch=e=>{
  const element=e.target instanceof Element?e.target:null;
  const button=element?.closest("button.motion-pressed");
  if(button)setTimeout(()=>button.classList.remove("motion-pressed"),75);
};
document.addEventListener("pointerup",releaseTouch,{passive:true});
document.addEventListener("pointercancel",releaseTouch,{passive:true});

document.addEventListener("cancel",e=>{
  if(e.target instanceof Element&&e.target.matches("dialog.settings-layer")){
    e.preventDefault();settingsOpen=false;render();
    document.querySelector('[data-action="settings-open"]')?.focus();
  }
},true);
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&settingsOpen){settingsOpen=false;render();document.querySelector('[data-action="settings-open"]')?.focus()}
});
document.addEventListener("click",e=>{
 if(settingsOpen&&e.target instanceof Element&&e.target.matches("body > .settings-layer")){
  settingsOpen=false;render();document.querySelector('[data-action="settings-open"]')?.focus()
 }
});
document.addEventListener("click",async e=>{
  const v=e.target.closest("[data-view]");
  if(v){
    const target=v.dataset.view;
    if(target===view&&detailId===null&&!settingsOpen){
      const button=document.querySelector('.dock-btn[data-view="'+target+'"]');
      if(button){button.classList.remove("icon-moving");void button.offsetWidth;button.classList.add("icon-moving");button.classList.add("reaffirm");setTimeout(()=>button.classList.remove("reaffirm"),360)}
      haptic();return;
    }
    navFrom=Math.max(0,navs.findIndex(x=>x[0]===view));
    view=target;navPulse=view;detailId=null;discoverOpen=false;settingsOpen=false;
    if(view==="library"){openSchoolId=null;libraryScope="all"}
    render();haptic();
    setTimeout(()=>{navPulse=null;document.querySelectorAll(".dock-btn.icon-moving").forEach(b=>b.classList.remove("icon-moving"))},610);
    return;
  }
  const tab=e.target.closest("[data-world-pane]");if(tab){
    e.preventDefault();
    const destination=tab.dataset.worldPane;
    if(!["home","sky","saved","fingerprint","mirror"].includes(destination))return;
    universePane=destination;openSchoolId=null;libraryScope="all";detailId=null;
    settingsOpen=false;render();haptic();return;
  }
  const encounterChoice=e.target.closest("[data-encounter-choice]");
  if(encounterChoice && discoverOpen){
    const id=visibleQuoteId(),choice=Number(encounterChoice.dataset.encounterChoice);
    const {schoolId,scene,sceneIndex}=encounterFor(QUOTES[id],id);
    if(!Number.isInteger(choice)||choice<0||choice>=scene.options.length)return;
    const record={schoolId,sceneIndex,optionIndex:choice,theme:QUOTES[id][2],date:today(),axis:scene.options[choice][2]};
    data.encounters[id]=record;
    data.encounterEvents=recordExploration(data.encounterEvents,{...record,source:"encounter",quoteId:id});
    discoverStep=1;persist();playEncounterTone("choose");haptic("selection");render();document.querySelector(".v32-flash")?.focus({preventScroll:true});return;
  }
  const school=e.target.closest("[data-school]");if(school){const candidate=school.dataset.school;
    if(SCHOOLS.some(x=>x.id===candidate)&&!openSchoolId){
      libraryListScrollY=window.scrollY||document.documentElement.scrollTop||0;
      school.classList.add("school-entering");schoolSceneIndex=0;schoolChoiceIndex=null;haptic("impact");
      const delay=window.matchMedia("(prefers-reduced-motion: reduce)").matches?0:180;
      setTimeout(()=>{openSchoolId=candidate;render();window.scrollTo({top:0,behavior:"instant"});document.getElementById("school-detail-scroll")?.scrollTo(0,0)},delay);
    }
    return;
  }
  const lessonChoice=e.target.closest("[data-school-choice]");
  if(lessonChoice&&openSchoolId){
    const entry=SCHOOL_SCENES[openSchoolId]?.scenes[schoolSceneIndex];
    const choice=Number(lessonChoice.dataset.schoolChoice);
    if(!entry||!Number.isInteger(choice)||choice<0||choice>=entry.options.length)return;
    schoolChoiceIndex=choice;
    data.encounterEvents=recordExploration(data.encounterEvents,{source:"library",schoolId:openSchoolId,sceneIndex:schoolSceneIndex,optionIndex:choice,axis:entry.options[choice][2],date:today()});
    persist();haptic();
    const lesson=document.querySelector(".school-play-lab");
    if(lesson)lesson.outerHTML=schoolPlayHtml(openSchoolId);
    return;
  }
  const lessonNext=e.target.closest("[data-school-scene]");
  if(lessonNext&&openSchoolId){
    const count=SCHOOL_SCENES[openSchoolId]?.scenes.length||1;
    schoolSceneIndex=(schoolSceneIndex+1)%count;schoolChoiceIndex=null;haptic();
    const lesson=document.querySelector(".school-play-lab");
    if(lesson)lesson.outerHTML=schoolPlayHtml(openSchoolId);
    return;
  }
  const schoolBack=e.target.closest("[data-school-back]");if(schoolBack){openSchoolId=null;schoolChoiceIndex=null;schoolSceneIndex=0;render();haptic();requestAnimationFrame(()=>window.scrollTo({top:libraryListScrollY,behavior:"instant"}));return}
  if(e.target.closest("[data-library-liked]")){openSchoolId=null;libraryScope="liked";render();return}
  if(e.target.closest("[data-library-root]")){libraryScope="all";openSchoolId=null;render();return}
  const th=e.target.closest("[data-theme]");
  if(th){const t=th.dataset.theme;data.themes=data.themes.includes(t)?data.themes.filter(x=>x!==t):data.themes.length<5?[...data.themes,t]:data.themes;persist();render();return}
  const fil=e.target.closest("[data-filter]");if(fil){selectedTheme=fil.dataset.filter;render();return}
  const scope=e.target.closest("[data-scope]");if(scope){libraryScope=scope.dataset.scope;render();return}
  const de=e.target.closest("[data-detail]");if(de){detailId=Number(de.dataset.detail);render();return}
  const stanceAction=e.target.closest("[data-ai-choice]");
  if(stanceAction&&discoverOpen&&aiDiscoverEnabled&&aiConversation?.consent&&!aiConversation.loading){
    const index=Number(stanceAction.dataset.aiChoice),id=visibleQuoteId(),q=QUOTES[id];
    if(!Number.isInteger(index)||index<0||index>2||!q)return;
    const last=[...aiConversation.messages].reverse().find(m=>m.role==="assistant");
    const choice=last?.choices?.[index]||["I'm intrigued","I doubt it","Show me another angle"][index];
    const requestHistory=aiConversation.messages.slice(-10).map(m=>m.role+": "+m.text);
    const context=last?.followUp?"Question: "+last.followUp+" | My response: "+choice:choice;
    const current=aiConversation;
    current.loading=true;current.error="";render();
    try{
      const token=await getDiscoverAccessToken().catch(()=>null);
      const reply=await fetch("/api/discover-ai",{
        method:"POST",headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},
        body:JSON.stringify({consent:true,quoteId:id,quote:{text:q[0],author:q[1],theme:q[2]},
          memory:aiMemoryChoices(sharedWorldMemory()),history:requestHistory,userText:context,
          turn:current.messages.filter(m=>m.role==="assistant").length})
      });
      if(!reply.ok)throw Error(reply.status===429?"Daily AI limit reached.":"DeepSeek is unavailable right now.");
      const next=await reply.json();
      if(!next.reply||!next.followUp||!Array.isArray(next.choices)||next.choices.length!==3)throw Error("Incomplete DeepSeek response.");
      if(aiConversation!==current||!aiDiscoverMode)return;
      current.messages.push({role:"user",text:choice});
      current.messages.push({role:"assistant",text:cleanText(next.reply,850),
        followUp:cleanText(next.followUp,300),choices:next.choices.map(x=>cleanText(x,82))});
      current.messages=current.messages.slice(-12);
    }catch(err){if(aiConversation===current)current.error=String(err.message||"Please retry.");}
    finally{current.loading=false;if(aiConversation===current&&discoverOpen)render()}
    return;
  }
  const aiAction=e.target.closest("[data-ai]");
  if(aiAction&&discoverOpen&&aiDiscoverEnabled){
    const id=visibleQuoteId(),q=QUOTES[id],action=aiAction.dataset.ai;
    if(id===null||!q)return;

    if(!aiConversation||aiConversation.quoteId!==id)return;
    if(action==="cancel"||action==="revoke"){
      if(action==="revoke")localStorage.removeItem(consentKey());
      aiPrivateForCurrentSheet=true;aiDiscoverMode=false;aiConversation=null;render();return
    }
    if(action==="agree"){
      localStorage.setItem(consentKey(),"yes");
      aiConversation.consent=true;render();
      document.querySelector('[data-ai="send"]')?.click();return;
    }
    if(!aiConversation.consent)return;
    if(action==="save"){
      const summary=aiSummary(aiConversation,q,today());
      if(!summary){toast("Explore a little more before saving.");return}
      data.aiDiscoverThreads=[...data.aiDiscoverThreads.filter(x=>x.id!==summary.id),summary].slice(-30);
      persist();toast("Conversation saved to My World");render();return;
    }
    if(action==="send"){
      if(aiConversation.loading)return;
      const pendingText=cleanText(document.getElementById("yl-ai-draft")?.value||aiConversation.draft,480);
      const requestHistory=aiConversation.messages.slice(-10).map(m=>m.role+": "+m.text);
      const memory=aiMemoryChoices(sharedWorldMemory());
      const currentConversation=aiConversation;
      currentConversation.loading=true;currentConversation.error="";render();
      try{
        const token=await getDiscoverAccessToken().catch(()=>null);
        const reply=await fetch("/api/discover-ai",{
          method:"POST",headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},
          body:JSON.stringify({consent:true,quoteId:id,quote:{text:q[0],author:q[1],theme:q[2]},
            memory,history:requestHistory,userText:pendingText,turn:currentConversation.messages.filter(m=>m.role==="assistant").length})
        });
        if(!reply.ok)throw Error(reply.status===429?"You've reached the AI conversation limit for today.":reply.status===401?"Please sign in again.":"The AI conversation is unavailable at the moment.");
        const next=await reply.json();
        if(!next.reply||!next.followUp||!Array.isArray(next.choices)||next.choices.length!==3)throw Error("The response was incomplete. Please try again.");
        if(aiConversation!==currentConversation||!aiDiscoverMode)return;
        if(pendingText)currentConversation.messages.push({role:"user",text:pendingText});
        currentConversation.messages.push({role:"assistant",text:cleanText(next.reply,850),followUp:cleanText(next.followUp,300),choices:next.choices.map(x=>cleanText(x,82))});
        currentConversation.messages=currentConversation.messages.slice(-12);
        currentConversation.draft="";
      }catch(err){
        if(aiConversation===currentConversation)currentConversation.error=String(err.message||"AI is unavailable");
      }finally{currentConversation.loading=false;if(aiConversation===currentConversation&&discoverOpen)render()}
      return;
    }
    return;
  }
  const livingAction=e.target.closest("[data-living]");
  if(livingAction&&discoverOpen){
    const id=visibleQuoteId(),q=QUOTES[id],key=String(id);
    let current=data.livingThreads.sessions[key];
    if(!current||!q)return;
    const action=livingAction.dataset.living;
    if(action==="own-voice"){
      const opening=document.getElementById("yl-living-opening");
      if(opening)current=openingLiving(current,opening.value)||current;
      if(!current.opening?.trim()){toast("Share a thought first—or choose a direction below.");return;}
      data.livingThreads.sessions[key]=current;
    }
    if(action==="close"){discoverOpen=false;render();return;}
    if(action==="restart"){
      current=beginLiving(q,id,today(),null);
      data.livingThreads.sessions[key]=current;persist();render();haptic("selection");return;
    }
    // The note is the user's own explicit text; it is never interpreted as a belief.
    if(["carry","save"].includes(action)){
      const note=document.getElementById("yl-living-note");
      if(note)current=noteLiving(current,note.value)||current;
    }
    const next=transitionLiving(current,action,{quote:q,profile:data.personalization,history:data.livingThreads.history,memory:sharedWorldMemory()});
    if(!next)return;
    data.livingThreads.sessions[key]=next;
    if(next.phase==="done")data.livingThreads.history=archiveLiving(data.livingThreads.history,next,q,data.personalization);
    persist();haptic("selection");playEncounterTone("choose");render();return;
  }
  const b=e.target.closest("[data-action]");if(!b)return;const a=b.dataset.action;
  switch(a){
    case"settings-open":{
      const opening=!settingsOpen;
      if(opening)settingsReturnScrollY=window.scrollY;
      settingsOpen=opening;
      if(opening){discoverOpen=false;previewTomorrowOpen=false;}
      render();haptic("impact");
      // A scrolled Library/My World page must not open Settings offscreen.
      window.scrollTo({top:opening?0:settingsReturnScrollY,behavior:"instant"});
      document.querySelector(opening?".settings-route-back":'body > .settings-launch')?.focus({preventScroll:true});
      return;
    }
    case"settings-close":settingsOpen=false;authNotice="";render();haptic();window.scrollTo({top:settingsReturnScrollY,behavior:"instant"});document.querySelector('body > .settings-launch')?.focus({preventScroll:true});return;
    case"email-signout":{try{await signOutEmail();verifiedIdentity=null;syncConfirm="";cloudStateInfo="";authNotice="Signed out from email on this device.";render()}catch(err){authNotice=String(err.message||err);render()}return}
    case"cloud-save":if(!verifiedIdentity)return;syncConfirm="save";render();return;
    case"cloud-restore":if(!verifiedIdentity)return;syncConfirm="restore";render();return;
    case"cloud-cancel":syncConfirm="";render();return;
    case"cloud-confirm":{
      if(!verifiedIdentity||syncBusy||!syncConfirm)return;
      const direction=syncConfirm;syncBusy=true;syncConfirm="";cloudStateInfo="";render();
      try{
        if(direction==="save"){
          const cosmosEvents=(()=>{try{const raw=JSON.parse(localStorage.getItem("yourlogos-v2-encounters-v1")||"[]");return Array.isArray(raw)?raw.slice(-2000):[]}catch{return []}})();
          await writeAccountData({...data,cosmosEvents});
          if(data.localName)await writeAccountName(data.localName);
          cloudStateInfo="Your account copy has been saved. Other devices can restore it when signed in.";
        }else{
          const remote=await readAccountData();
          if(!remote.state)throw new Error("There is no saved account history yet.");
          if(!Array.isArray(remote.state.saved)||!remote.state.practice||typeof remote.state.practice!=="object")throw new Error("The cloud snapshot is incomplete; this device was not changed.");
          // Preserve this browser's existing name unless the user has not set one.
          const originalName=data.localName||"";
          const safe={
            saved:remote.state.saved.filter(id=>Number.isInteger(id)&&id>=0&&id<QUOTES.length),
            practice:remote.state.practice,
            discovery:remote.state.discovery&&typeof remote.state.discovery==="object"?remote.state.discovery:{},
            encounters:remote.state.encounters&&typeof remote.state.encounters==="object"?remote.state.encounters:{},
            encounterEvents:Array.isArray(remote.state.encounterEvents)?remote.state.encounterEvents.slice(-350):[],
            thoughtThreadEvents:Array.isArray(remote.state.thoughtThreadEvents)?remote.state.thoughtThreadEvents.slice(-250):[],
            themes:Array.isArray(remote.state.themes)?remote.state.themes:[],
            arrivals:Array.isArray(remote.state.arrivals)?remote.state.arrivals:[],
            started:Boolean(remote.state.started),
            localName:originalName||remote.name||"",
            personalization:remote.state.personalization&&["completed","skipped"].includes(remote.state.personalization.status)?remote.state.personalization:data.personalization,
            livingThreads:normalizeLivingState(remote.state.livingThreads),
            aiDiscoverThreads:Array.isArray(remote.state.aiDiscoverThreads)?remote.state.aiDiscoverThreads.filter(x=>x&&Number.isInteger(x.quoteId)&&x.quoteId>=0&&x.quoteId<QUOTES.length).slice(-30):[]
          };
          data={...data,...safe};persist();
          if(Array.isArray(remote.state.cosmosEvents)){
            const events=remote.state.cosmosEvents.filter(e=>e&&typeof e==="object"&&["save","read","link","view"].includes(e.type)&&typeof e.concept==="string").slice(-2000);
            localStorage.setItem("yourlogos-v2-encounters-v1",JSON.stringify(events));
          }
          quoteCursor=0;
          cloudStateInfo="Your saved account history was restored to this device. Reopen Sky to refresh its local view.";
        }
      }catch(err){cloudStateInfo=String(err?.message||err)}
      finally{syncBusy=false;render()}
      return;
    }
    case"daily-arrive":{
      const d=today();if(!data.arrivals.includes(d)){data.arrivals.push(d);data.arrivals=data.arrivals.slice(-730);persist();}
      arrivalCelebrating=true;haptic("success");render();toast("A little light for today");
      setTimeout(()=>{arrivalCelebrating=false;if(view==="today"&&!discoverOpen&&!settingsOpen)render()},870);
      return;
    }
    case"preview-tomorrow":previewTomorrowOpen=true;render();return;
    case"close-preview":previewTomorrowOpen=false;render();return;
    case"finish-onboarding":data.started=true;view="today";break;
    case"edit-themes":settingsOpen=false;view="onboarding";break;
    case"toggle-save":case"detail-save":{
      const inFeed=a==="toggle-save",id=inFeed?visibleQuoteId():detailId;
      if(id===null||!QUOTES[id])return;
      const already=data.saved.includes(id);
      if(keepTimer){clearTimeout(keepTimer);keepTimer=null}
      keepPending=null;
      if(already){
        data.saved=data.saved.filter(x=>x!==id);
        keepCurrentInRange();persist();render();toast("Removed from your saved thoughts");haptic();return;
      }
      const before=inFeed?daySequence():null;
      const next=inFeed?followingThought(before,id,[...data.saved,id]):null;
      data.saved=[...data.saved,id];
      heartPulse=inFeed;persist();haptic("success");playEncounterTone("choose");
      if(!inFeed){render();toast("Thought kept in Library");return}
      // Preserve the old card briefly: red-heart feedback precedes the next quote.
      const heart=document.querySelector('[data-action="toggle-save"]');
      if(heart){heart.classList.add("liked","heart-pop");heart.setAttribute("aria-pressed","true");heart.setAttribute("aria-label","Thought kept");heart.title="Thought kept";}

      keepPending={id,next,phase:"animating"};
      toast("Thought kept ✧",{undo:true});
      keepTimer=setTimeout(()=>{
        keepTimer=null;
        if(!keepPending||keepPending.id!==id||keepPending.phase!=="animating")return;
        quoteCursor=keepPending.next.cursor;keepPending.phase="completed";heartPulse=false;
        if(view==="today"&&!discoverOpen&&!settingsOpen&&detailId===null){
          const card=document.getElementById("quote-motion");
          if(card){card.classList.add("keep-advance-out");setTimeout(()=>{if(keepPending?.id!==id)return;render();document.getElementById("quote-motion")?.classList.add("keep-advance-in")},160)}
          else render();
        }
      },480);
      return;
    }
    case"undo-keep":{
      if(!keepPending)return;
      const {id}=keepPending;
      if(keepTimer){clearTimeout(keepTimer);keepTimer=null}
      keepPending=null;heartPulse=false;
      data.saved=data.saved.filter(x=>x!==id);
      const restored=discoveryQueue();
      const i=restored.indexOf(id);quoteCursor=i>=0?i:0;
      persist();render();toast("Back in Encounter");haptic();return;
    }
    case"view-saved-from-encounter":{
      view="library";libraryScope="liked";openSchoolId=null;render();return;
    }
    case"discover":discoverStep=0;threadBranch=0;threadAnswer=0;
      aiPrivateForCurrentSheet=false;aiDiscoverMode=false;aiConversation=null;
      discoverOpen=true;haptic("impact");playEncounterTone("open");
      if(aiDiscoverEnabled)activateDiscoverAI();else render();
      document.querySelector(".sheet-close")?.focus();return;
    case"encounter-sound":{const next=setEncounterSoundEnabled(!encounterSoundEnabled());haptic("selection");if(next)playEncounterTone("open");render();document.querySelector('[data-action="encounter-sound"]')?.focus({preventScroll:true});return;}
    case"close-discover":discoverOpen=false;discoverStep=0;aiDiscoverMode=false;aiConversation=null;render();document.querySelector('[data-action="discover"]')?.focus();return;
    case"discover-universe":discoverOpen=false;universePane="fingerprint";view="profile";detailId=null;render();return;
    case"discover-save":{const id=visibleQuoteId();if(id===null)return;const next=followingThought(daySequence(),id,[...data.saved,id]);if(!data.saved.includes(id)){data.saved.push(id);persist();}quoteCursor=next.cursor;discoverOpen=false;render();toast("Thought kept");return}
    case"discover-again":discoverStep=0;render();return;
    case"thread-explore":{
      if(!discoverOpen)return;
      const id=visibleQuoteId(),q=QUOTES[id];if(id===null)return;
      const existing=data.livingThreads.sessions[String(id)];
      const next=beginLiving(q,id,today(),existing);
      if(!next)return;
      data.livingThreads.sessions[String(id)]=next;
      persist();playEncounterTone("choose");haptic("selection");render();return;
    }
    case"thread-reflect":return; // Retired fixed-step Discover, retained as an inert legacy hook.
    case"thread-back":render();return;
    case"thread-restart":render();return;
    case"discover-library":{
      const id=visibleQuoteId(),q=QUOTES[id],exploration=personalizedExplore(q,id,data.personalization,data.thoughtThreadEvents);
      const target=exploration?.school;
      if(!target||!SCHOOLS.some(s=>s.id===target)){discoverOpen=false;discoverStep=0;render();return;}
      const thread=getThoughtThread(q,id);
      bridgeFromQuestion={schoolId:target,question:thread.question,move:"explore",challenge:exploration.insight};
      discoverOpen=false;discoverStep=0;view="library";openSchoolId=target;schoolSceneIndex=0;schoolChoiceIndex=null;libraryScope="all";render();haptic();return;
    }
    case"clear-discovery":settingsConfirm=true;render();return;
    case"cancel-clear-discovery":settingsConfirm=false;render();return;
    case"confirm-clear-discovery":data.discovery={};data.encounters={};data.encounterEvents=[];data.thoughtThreadEvents=[];data.livingThreads=normalizeLivingState(null);data.aiDiscoverThreads=[];settingsConfirm=false;persist();render();toast("Exploration choices cleared");return;
    case"back":detailId=null;break;
    case"export":{
      const universe=(()=>{try{return JSON.parse(localStorage.getItem("yourlogos-v2-encounters-v1")||"[]")}catch{return []}})();
       const blob=new Blob([JSON.stringify({...data,universeV2:{events:universe,storage:"local"}},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),link=document.createElement("a");
      link.href=url;link.download="yourlogos-practice.json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);toast("Practice exported");return;
    }
  }
  persist();render();
});
document.addEventListener("input",e=>{
 if(e.target.id==="yl-ai-draft"&&aiDiscoverMode&&aiConversation){aiConversation.draft=cleanText(e.target.value,480);return}
 if(!discoverOpen||!["yl-living-note","yl-living-opening"].includes(e.target.id))return;
 const id=visibleQuoteId(),key=String(id),current=data.livingThreads.sessions[key];
 const updated=e.target.id==="yl-living-opening"?openingLiving(current,e.target.value):noteLiving(current,e.target.value);
 if(updated){data.livingThreads.sessions[key]=updated;persist();}
});
document.addEventListener("keydown",e=>{if(e.key!=="Escape")return;if(settingsOpen){settingsOpen=false;render()}else if(previewTomorrowOpen){previewTomorrowOpen=false;render()}else if(discoverOpen){discoverOpen=false;render()}});
document.addEventListener("submit",async e=>{
 if(e.target.id==="profile-name-form"){
  e.preventDefault();const name=String(new FormData(e.target).get("displayName")||"").trim().replace(/\s+/g," ").slice(0,32);
  if(!name)return;data.localName=name;persist();authNotice="Your greeting was saved on this device."+(verifiedIdentity?" Use Save this device to my account to copy it online.":"");render();return;
 }
 if(e.target.id==="account-email-form"){
  e.preventDefault();if(!AUTH_ENABLED){authNotice="Email login is not configured yet.";render();return}
  const address=String(new FormData(e.target).get("email")||"").trim();if(!address)return;
  authBusy=true;authNotice="Sending your one-time sign-in link…";render();
  try{await requestMagicLink(address,data.localName||"");authNotice="Check your email for a secure sign-in link. No password needed."}
  catch(err){authNotice=String(err?.message||err)}
  finally{authBusy=false;render()}return;
 }
});

// A backgrounded PWA must update its daily feature on the next foreground entry.
activeLocalDay=today();
ensureDailyFeature();
window.addEventListener("yourlogos:daily-arrived",e=>{
   const key=e.detail?.date;
   if(key!==today())return;
   if(!data.arrivals.includes(key)){data.arrivals=[...data.arrivals,key].slice(-730);persist();}
   arrivalCelebrating=false;render();
});
function refreshForLocalDay(){
  const next=today();if(next===activeLocalDay)return;
  activeLocalDay=next;quoteCursor=0;heartPulse=false;swipeBusy=false;
  discoverOpen=false;discoverStep=0;previewTomorrowOpen=false;arrivalCelebrating=false;
  ensureDailyFeature();render();
}
document.addEventListener("visibilitychange",()=>{if(!document.hidden)refreshForLocalDay()});
window.addEventListener("focus",refreshForLocalDay);
window.addEventListener("pageshow",refreshForLocalDay);
setInterval(()=>{if(!document.hidden)refreshForLocalDay()},60000);

async function refreshPublicQuoteCatalogue(){
 if(!AUTH_ENABLED)return;
 try{
   const incoming=await fetchPublishedQuotes(),valid=new Set(THEMES);
   let added=0;
   for(const q of incoming){
     if(!Number.isInteger(q.legacy_id)||q.legacy_id!==QUOTES.length)continue;
     if(!valid.has(q.theme)||!q.quote_text||!q.author||!q.source||!q.reflection_prompt)continue;
     QUOTES.push([q.quote_text,q.author,q.theme,q.source,q.reflection_prompt]);added++;
   }
   if(added){
     // Remote quote indices and themes are hints to the existing personal sky,
     // never proof of agreement or a new relationship.
     const themeHints=Object.fromEntries(QUOTES.slice(42).map((quote,index)=>[index+42,quote[2]]));
     try{localStorage.setItem("yourlogos-quote-theme-map",JSON.stringify(themeHints))}catch{}
     // Remote additions stay in the swipe feed until independently reviewed for daily use.
     const ids=DAILY_FEATURE_IDS.slice();
     let seed=0x7a3f9201;
     const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
     for(let i=ids.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}
     DAILY_ORDER=ids;
     if(!discoverOpen&&!settingsOpen)render();
   }
 }catch(error){console.warn("YourLogos: cached quote catalogue remains available.",error?.message||error)}
}

// The AI pilot is opt-in and hidden unless the backend confirms credentials and a feature flag.
fetch("/api/discover-ai-config",{cache:"no-store"})
  .then(r=>r.ok?r.json():{enabled:false}).then(info=>{aiDiscoverEnabled=info?.enabled===true;if(discoverOpen){if(aiDiscoverEnabled)activateDiscoverAI();else render()}})
  .catch(()=>{aiDiscoverEnabled=false});
window.addEventListener("yourlogos:onboarding-complete",event=>{
  const incoming=event.detail?.profile;
  if(!incoming||!["completed","skipped"].includes(incoming.status))return;
  data.personalization=incoming;
  const nickname=String(event.detail?.name||"").trim().slice(0,32);
  if(nickname)data.localName=nickname;
  persist();render();
});
render();
// Supabase SDK loading and network requests are noncritical for the first
// interaction. Schedule them only after the first frame is painted.
if(AUTH_ENABLED){
  const startConnectedServices=()=>{
    refreshPublicQuoteCatalogue();
    getVerifiedIdentity().then(u=>{
      if(u){
        verifiedIdentity=u;
        if(!data.localName&&u.displayName){data.localName=u.displayName.slice(0,32);persist()}
        render();
      }
    }).catch(()=>{});
  };
  if("requestIdleCallback" in window)requestIdleCallback(startConnectedServices,{timeout:2000});
  else setTimeout(startConnectedServices,700);
}
// Do not tie offline cache registration to third-party font load events.
if("serviceWorker" in navigator)setTimeout(()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}),300);