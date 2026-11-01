import fs from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
const app=read("app.js"),world=read("world-view.js"),cosmos=read("cosmos-v2.html");
const exploreModule=read("explore-catalogue.js"),threadModule=read("thought-threads.js");
const personalizedModule=read("personalization.js"),onboardingModule=read("onboarding.js");
const auth=read("auth-client.js"),config=read("auth-config.js"),sw=read("sw.js"),html=read("index.html");
const v33Source=read("v33.css");
for(const [name,source] of [["app",app],["world",world],["auth",auth],["explore-catalogue",exploreModule],["thought-threads",threadModule],["personalization",personalizedModule],["onboarding",onboardingModule]]){
  new vm.Script(source.replace(/^import[^\n]*\n/gm,"").replace(/^export /gm,""),{filename:name});
}
const embedded=cosmos.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(embedded,"Cosmos should have inline JavaScript");
new vm.Script(embedded[1],{filename:"cosmos-inline.js"});

const quoteSnippet=app.slice(app.indexOf("const QUOTES="),app.indexOf("const THEMES="));
assert.ok(quoteSnippet.startsWith("const QUOTES="));
const QUOTES=new Function(quoteSnippet.replace("const QUOTES=","return "))();
assert.equal(QUOTES.length,91);
assert.equal(new Set(QUOTES.map(q=>q[0])).size,QUOTES.length,"Curated quote text must be distinct");
assert.equal(QUOTES[0][1],"Friedrich Nietzsche");
assert.equal(QUOTES[19][1],"Albert Einstein");
assert.equal(QUOTES[31][1],"G. W. F. Hegel");
const seed=read("supabase/yourlogos_quotes_seed.sql");
const seedPayload=JSON.parse(seed.split("$quotes$\n")[1].split("\n$quotes$")[0]);
assert.deepEqual(seedPayload.map(x=>x.legacy_id),Array.from({length:42},(_,i)=>i));
assert.deepEqual(seedPayload.map(x=>x.author),QUOTES.slice(0,42).map(x=>x[1]));

const start=app.indexOf("const dayIndexFor="),end=app.indexOf("const esc=",start);
const mockData={practice:{},saved:[],themes:[]};
const model=new Function("data","localStorage","KEY",
  quoteSnippet+'\nconst today=()=>"2026-10-23";\n'+app.slice(start,end)+
  "\nreturn {QUOTES,dailyPick,shiftDate,ensureDailyFeature,activeQuote};"
)(mockData,{setItem(){}},"test");
const days=Array.from({length:168},(_,i)=>model.shiftDate("2026-10-23",i));
const chosen=days.map(d=>model.dailyPick(d));
const featureIds=new Function(quoteSnippet+"return DAILY_FEATURE_IDS;")();
assert.ok(featureIds.length>=50 && featureIds.length<QUOTES.length,"Daily first impressions are deliberately curated");
assert.ok(!featureIds.includes(11)&&!featureIds.includes(72),"Specialist Kant texts should not be selected as daily introductions");
assert.equal(new Set(featureIds).size,featureIds.length,"Daily quote IDs must be unique");
assert.ok(featureIds.every(id=>Number.isInteger(id)&&id>=0&&id<QUOTES.length),"Valid stable quote IDs required");
assert.ok(chosen.every(id=>featureIds.includes(id)),"Daily picks must stay within reviewed quote pool");
for(let i=0;i<=chosen.length-featureIds.length;i++){
  assert.equal(new Set(chosen.slice(i,i+featureIds.length)).size,featureIds.length,
    "Expected no repeats in a "+featureIds.length+" day featured-quote cycle");
}
assert.equal(model.ensureDailyFeature(),model.activeQuote(),"Quote should remain stable on same date");
assert.ok(app.includes('["today","Encounter"],["library","Library"],["profile","My World"]'));
assert.ok(app.includes('class="view settings-route"'),"Account controls must use a reliable app route");
assert.ok(app.includes('body > .sky-return'),"Universe back control must remain outside the iframe");
assert.ok(!app.includes('portal.showModal()'),"Avoid fragile modal top-layer handling");
assert.ok(app.includes("data-action=\"daily-arrive\""));
assert.ok(app.includes("preview-tomorrow"));
assert.ok(app.includes('document.body.appendChild(replacementNav)'),"Navigation dock must persist outside content root");
assert.ok(app.includes('body > .mobile-tabs .dock-glass'),"Live dock indicator remains the same DOM element");
assert.ok(app.includes('document.addEventListener("pointerdown"'),"Important taps respond at pointer-down");
assert.ok(app.includes('motion-tab-entry'),"Tabs animate directional content arrival");
const motion=read("motion.css");
assert.ok(motion.includes("prefers-reduced-motion:reduce"),"Reduced motion must be supported");
assert.ok(motion.includes(".dock-indicator"),"Active dock indicator must have continuous feedback");
assert.ok(html.includes('href="/motion.css"')&&sw.includes('"/motion.css"'),"Motion CSS is loaded and cached");
assert.ok(cosmos.includes("if(!explored.length)return;"),"Personal lines require recorded link evidence");
const mapped=cosmos.match(/const legacyConceptByIndex=\[([^\]]*)\]/);
assert.equal(mapped?.[1]?.split(",").length,42,"Existing personal sky mappings preserve original quote IDs");
assert.ok(cosmos.includes("yourlogos-quote-theme-map"),"Additional quote themes must be supported through metadata fallback");
assert.ok(world.includes("THE PHILOSOPHER’S MIRROR"));
assert.ok(world.includes("ready:saved.length>=3"),"A match must have minimum personal evidence");
assert.ok(config.includes("/api/public-config"),"Auth configuration is loaded from server runtime");
assert.ok(read("server.mjs").includes("YOURLOGOS_SUPABASE_PUBLISHABLE_KEY"),"Server reads publishable key only");
assert.ok(auth.includes("writeAccountData")&&auth.includes("readAccountData"),"Account snapshot supports explicit save and restore");
assert.ok(app.includes("cloud-confirm")&&app.includes("cloud-cancel"),"Cloud transfers require confirmation");
for(const path of ["/world-view.js","/world.css","/daily-arrival.css","/library-atmosphere.css","/auth-client.js","/auth-config.js"]){
 assert.ok(sw.includes('"'+path+'"'),"Offline cache should precache "+path);
}
for(const sheet of ["/world.css","/daily-arrival.css"])assert.ok(html.includes(sheet));
for(const table of ["quotes","profiles","user_state","user_links"])
 assert.ok(read("supabase/yourlogos_schema.sql").includes("alter table public."+table+" enable row level security;"));
assert.ok(app.includes("schoolBackdropHtml(current.id)"),"Each philosophy detail should use an independent image, not repeat the SVG icon");
assert.ok(app.includes("schoolArtCreditHtml(current.id)"),"Background artwork must be credited");
assert.ok(html.includes("/v29.css")&&sw.includes('"/v29.css"'),"New art CSS should be linked and cached");
assert.ok(read("ios/project.yml").includes("YourLogosQuoteWidget"),"Native project must embed WidgetKit extension");
assert.ok(read("ios/Widget/YourLogosQuoteWidget.swift").includes("yourlogos://save?quote="),"Keep widget control deep-links into installed app");
const nativeQuotes=JSON.parse(read("ios/Widget/widget-quotes.json"));
assert.equal(nativeQuotes.quotes.length,QUOTES.length,"Native widget quote library stays aligned with the web");
assert.deepEqual(nativeQuotes.order,(()=>{const ids=featureIds.slice();let seed=0x7a3f9201;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};for(let i=ids.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}return ids})(),"Native widget daily cycle must match web");
assert.deepEqual(nativeQuotes.quotes.map(x=>x.text),QUOTES.map(x=>x[0]),"Native widget quote IDs and text match the app");
const scenes=read("school-scenes.js");
assert.ok(scenes.includes("SCHOOL_SCENES")&&scenes.includes("stoicism")&&scenes.includes("buddhism"),"Every school has a visual encounter");
assert.ok(app.includes("schoolPlayHtml(current.id)"),"Library includes interactive visual lessons");
assert.ok(app.includes("data-school-choice")&&app.includes("data-school-scene"),"Interactive choices and scene navigation work");
assert.ok(app.includes("quote-dense"),"Long quotation has a readable responsive font size");
const api=read("server.mjs");
assert.ok(api.includes('"/api/school-art/"')&&api.includes("artCache"),"Optimized curated artwork served from same origin");
assert.ok(html.includes('/v30.css')&&sw.includes('"/v30.css"')&&sw.includes('"/school-scenes.js"'),"New interaction assets load offline");
const explore=read("explore-catalogue.js"),threads=read("thought-threads.js");
assert.ok(sw.includes('"/explore-catalogue.js"'),"Offline cache must include Explore content");
assert.ok(app.includes('case"thread-explore"')&&app.includes('case"thread-reflect"'),"One-tap Explore and optional reflection are reachable");
assert.ok(threads.includes("yl-explore-button")&&threads.includes("exploration.insight")&&threads.includes("exploration.reflection"),"Discover must reveal a meaningful insight before optional reflection");
assert.ok(!threads.includes("MOVES.map((_,i)=>gesture(i))"),"Old three-choice reaction entrance is removed");
const exploreSource=read("explore-catalogue.js");
const marker="export const EXPLORE=",ending=";\nexport function exploreFor";
const exploreStart=exploreSource.indexOf(marker),exploreEnd=exploreSource.indexOf(ending,exploreStart);
assert.ok(exploreStart>=0&&exploreEnd>exploreStart,"Explore catalogue must export structured editorial records");
const exploreRecords=JSON.parse(exploreSource.slice(exploreStart+marker.length,exploreEnd));
assert.equal(exploreRecords.length,QUOTES.length,"Every built-in quote has a distinct editorial exploration");
const supported=new Set(["stoicism","existentialism","nihilism","skepticism","daoism","buddhism"]);
exploreRecords.forEach((record,id)=>{
 assert.equal(record.length,3,"Explore entry "+id+" needs insight/reflection/school");
 assert.ok(record[0].length>=25&&record[0].length<=130,"Explore insight should be substantial yet short: "+id);
 assert.ok(record[1].endsWith("?")&&record[1].length<=130,"Reflection should be specific and concise: "+id);
 assert.ok(supported.has(record[2]),"Destination must be supported: "+id);
});
assert.ok(exploreRecords[15][0].includes("Loneliness"),"Solitude sample must distinguish loneliness from chosen aloneness");
assert.ok(exploreRecords[15][1].includes("recharging"),"Solitude sample must invite an everyday reflection");
assert.ok(!threads.includes("data-thread-answer="),"Explore removes the obligatory second philosophical choice");

assert.ok(html.includes('id="yl-onboarding"')&&html.includes('/onboarding.js')&&html.includes('/onboarding.css'),"A first visit can learn about the user before the original slider");
assert.ok(sw.includes('"/personalization.js"')&&sw.includes('"/onboarding.js"')&&sw.includes('"/onboarding.css"'),"New onboarding modules are available offline");
assert.ok(onboardingModule.includes('yourlogos:onboarding-complete')&&onboardingModule.includes('yourlogos-introduction-v1'),"A one-time completion event is persisted");
assert.ok(threadModule.includes("personalizedExplore(quote,quoteId,profile,history)"),"Discover content considers the voluntary user context");
assert.ok(app.includes('profile:data.personalization')&&app.includes('case"thread-explore"'),"Encounter passes onboarding profile into the existing one-tap Explore");
assert.ok(personalizedModule.includes("QUESTIONS")&&personalizedModule.includes("safeProfile"),"Editorial lenses retain a guarded fallback");
// Behavioral test: preference data must change a quote's reflection, without
// claiming curiosity or a single answer establishes a fixed philosophical identity.
const { personalizedExplore, validatePersonalization }=await import("../personalization.js");
assert.equal(validatePersonalization(),true,"All eight everyday lenses span ten philosophical themes");
const visitor={status:"completed",answers:{concerns:["time","connection"],approach:"reflect",tension:"achievement",style:"practical"}};
const guest=personalizedExplore(QUOTES[50],50,null,[]);
const personal=personalizedExplore(QUOTES[50],50,visitor,[]);
assert.equal(guest.personalized,false,"Guest can enjoy universal insights without onboarding");
assert.equal(personal.personalized,true,"Voluntary onboarding provides the new perspective");
assert.notEqual(personal.reflection,guest.reflection,"A relevant concern changes the prompt");
assert.ok(personal.why.includes("selected during your introduction"),"Explain the source of personalization");
assert.ok(personal.insight.toLowerCase().includes("you"),"Personalized insight must address the user directly");
assert.ok(!personal.insight.includes("This thought offers one way"),"Avoid generic appended textbook language");
assert.ok(threadModule.includes("A THOUGHT FOR YOU")&&threadModule.includes("Take it a little further"),"Discover should use conversational direct-address labels");
const skipped=personalizedExplore(QUOTES[50],50,{status:"skipped",answers:visitor.answers},[]);
assert.equal(skipped.personalized,false,"Skipped onboarding is never inferred");
for(let id=0;id<QUOTES.length;id++){
 const base=personalizedExplore(QUOTES[id],id,null,[]);
 assert.ok(base?.insight&&base?.reflection,"All curated quotes retain a guest-safe option "+id);
 const tailored=personalizedExplore(QUOTES[id],id,visitor,[]);
 assert.ok(tailored?.reflection.endsWith("?"),"Personalized reflections remain valid "+id);
}
const livingSource=read("living-threads.js");new vm.Script(livingSource.replace(/^import[^\n]*\n/gm,"").replace(/^export /gm,""),{filename:"living-threads"});assert.ok(app.includes("livingHtml({")&&app.includes("data.livingThreads.history"),"Living Threads integrated with saved memory");assert.ok(sw.includes('"/living-threads.js"'),"Offline Living Threads cache included");
const {beginLiving,focusChoices,transitionLiving,archiveLiving,normalizeLivingState,noteLiving}=await import("../living-threads.js");
const qaQuote=QUOTES[63],qaId=63,qaDate="2026-10-26";
const qaProfile={status:"completed",answers:{concerns:["time","change"],approach:"reflect",tension:"achievement",style:"practical"}};
let qa=beginLiving(qaQuote,qaId,qaDate);
assert.equal(qa.phase,"focus");
const choices=focusChoices(qaQuote,qaProfile,[]);
assert.ok(choices.some(c=>c.id==="time"),"Chosen user concern offered as an option");
qa=transitionLiving(qa,"focus:time",{quote:qaQuote,profile:qaProfile,history:[]});
assert.equal(qa.phase,"mirror");
qa=transitionLiving(qa,"unsure",{quote:qaQuote,profile:qaProfile,history:[]});
assert.equal(qa.phase,"response");
qa=transitionLiving(qa,"continue",{quote:qaQuote,profile:qaProfile,history:[]});
assert.equal(qa.phase,"reflection");
qa=noteLiving(qa,"Maybe change is not always something I can choose.");
qa=transitionLiving(qa,"carry",{quote:qaQuote,profile:qaProfile,history:[]});
assert.equal(qa.phase,"summary");
qa=transitionLiving(qa,"save",{quote:qaQuote,profile:qaProfile,history:[]});
assert.equal(qa.phase,"done");
const qaHistory=archiveLiving([],qa,qaQuote,qaProfile);
assert.equal(qaHistory.length,1);
assert.equal(qaHistory[0].note,"Maybe change is not always something I can choose.");
const restored=normalizeLivingState({sessions:{"63":qa},history:qaHistory});
assert.equal(restored.history.length,1);
assert.equal(restored.sessions["63"].phase,"done");
assert.equal(archiveLiving(qaHistory,qa,qaQuote,qaProfile).length,1,"Re-saving does not duplicate a thread");
assert.equal(transitionLiving(qa,"unknown",{quote:qaQuote,profile:qaProfile,history:qaHistory}),null,"Reject invalid actions");
assert.ok(focusChoices(qaQuote,null,[]).length>0,"New users have valid directions without pretending to know them");
// My World is the one evidence source for Discover, never an inferred belief profile.
const {buildWorldMemory,matchWorldMemory,memoryForQuote,worldMemoryHtml}=await import("../world-memory.js");
const {openingLiving,livingHtml:renderLiving}=await import("../living-threads.js");
const memoryQuote=QUOTES[63],memorySameTheme=QUOTES.findIndex((q,id)=>id!==63&&q[2]===memoryQuote[2]);
assert.ok(memorySameTheme>=0,"At least two quotes share a theme for memory tests");
const remembered={id:"63:2026-10-26",quoteId:63,theme:memoryQuote[2],focus:"time",
  reaction:"unsure",question:"What might you choose to keep?",opening:"My responsibilities are crowding out my curiosity.",
  note:"I want one evening without deadlines.",date:"2026-10-26"};
const myWorldMemory=buildWorldMemory({
 personalization:qaProfile, saved:[63,memorySameTheme], themes:["Time"],
 arrivals:["2026-10-25","2026-10-26"],practice:{"2026-10-26":{quoteId:63}},
 livingThreads:{history:[remembered],sessions:{}},
 encounterEvents:[{quoteId:63,theme:memoryQuote[2]}],
 discovery:{"63":{response:"curious"}}
},QUOTES,[{type:"read",concept:"time"}]);
assert.equal(myWorldMemory.threads.length,1,"Explicitly saved thread is included");
assert.equal(myWorldMemory.evidence.saved,2);
assert.equal(myWorldMemory.evidence.choices,2);
assert.equal(myWorldMemory.evidence.sky,1);
assert.equal(myWorldMemory.evidence.checkins,2);
const found=matchWorldMemory(myWorldMemory,QUOTES[memorySameTheme],memorySameTheme);
assert.equal(found.opening,remembered.opening);
const quoteContext=memoryForQuote(myWorldMemory,QUOTES[memorySameTheme],memorySameTheme);
assert.ok(quoteContext.preview.includes(remembered.opening),"Real historical words reappear");
assert.ok(worldMemoryHtml(myWorldMemory).includes("THE THOUGHTS YOU CARRY"),"My World displays shared memory");
assert.ok(app.includes("worldMemoryHtml(sharedWorldMemory())")&&app.includes("memory:sharedWorldMemory()"),"Both surfaces draw from the same memory");
assert.ok(auth.includes('"personalization","livingThreads","encounterEvents"'),"Cloud snapshot preserves real memory by explicit consent");
assert.ok(sw.includes('"/world-memory.js"'),"Shared memory works offline");
const qaStart=beginLiving(QUOTES[memorySameTheme],memorySameTheme,"2026-10-27");
const personalOpening=openingLiving(qaStart,"I worry that I only work and never live.");
assert.ok(personalOpening.opening.includes("never live"));
const qaNext=transitionLiving(personalOpening,"own-voice",{quote:QUOTES[memorySameTheme],profile:qaProfile,history:[remembered],memory:myWorldMemory});
assert.equal(qaNext.phase,"mirror","User can start with their own text rather than categories");
const firstScreen=renderLiving({quote:QUOTES[memorySameTheme],id:memorySameTheme,session:qaNext,profile:qaProfile,history:[remembered],memory:myWorldMemory});
assert.ok(firstScreen.includes("I worry that I only work"),"Next step responds to their volunteered words");
assert.ok(!firstScreen.includes("What part of your life, or the world around you"),"Generic first-layer questionnaire removed");
assert.equal(transitionLiving(qaStart,"own-voice",{quote:QUOTES[memorySameTheme],profile:qaProfile,history:[remembered],memory:myWorldMemory}),null,"Cannot submit empty free text");
const otherWorld=buildWorldMemory({personalization:qaProfile,livingThreads:{history:[{...remembered,opening:"I enjoy my responsibilities and find meaning in them."}]}},QUOTES);
assert.notEqual(memoryForQuote(myWorldMemory,QUOTES[memorySameTheme],memorySameTheme).preview,
                memoryForQuote(otherWorld,QUOTES[memorySameTheme],memorySameTheme).preview,
                "Two users with different histories must not receive the same remembered words");
assert.ok(!worldMemoryHtml(myWorldMemory).includes("<script>"),"My World escapes private note content");

// Discover vNext: one choice -> concise philosophical clarification.
// Keep the existing security/guest tests below while verifying the revised contract.
const aiClientSource=read("discover-ai-client.js"),aiServerSource=read("discover-ai-server.mjs"),serverSource=read("server.mjs");
for(const [name,source] of [["discover-ai-client",aiClientSource],["discover-ai-server",aiServerSource]]){
 new vm.Script(source.replace(/^import[^\n]*\n/gm,"").replace(/^export /gm,""),{filename:name});
}
const {makeDiscoverPrompt,validateDiscoverTurn,discoverAIEnabled,DISCOVER_DECISIONS}=await import("../discover-ai-server.mjs");
const {newAIConversation,aiSummary,aiMemoryChoices,aiConversationHtml,LOGO_DECISIONS}=await import("../discover-ai-client.js");
const {VISUAL_BY_QUOTE,conceptVisualHtml}=await import("../discover-concept-grammar.js");
assert.equal(discoverAIEnabled(),false,"AI remains disabled without explicit credentials and opt-in");
const dataForAI={quoteId:63,quote:{text:QUOTES[63][0],author:QUOTES[63][1],theme:QUOTES[63][2]},
 turn:0,userText:"This feels difficult to explain.",memory:["A private thought from the visitor"]};
const openingPrompt=makeDiscoverPrompt(dataForAI);
assert.ok(openingPrompt.system.includes("ONE ROUND ONLY")&&openingPrompt.system.includes("Turn 0"),"Prompt enforces one-round clarification");
assert.ok(openingPrompt.context.philosophicalAnchor.claim,"Source-matched philosophical claim is provided");
assert.equal(openingPrompt.context.pastVoluntaryReflections.length,1);
assert.equal(openingPrompt.context.userWords,dataForAI.userText);
const closingPrompt=makeDiscoverPrompt({...dataForAI,turn:1,direction:"I'd ask what changed",history:["A moment","Visitor chose: I'd ask what changed"]});
assert.equal(closingPrompt.context.selectedDirection,"I'd ask what changed");
assert.ok(closingPrompt.context.closing,"One selection completes the journey");
assert.equal(DISCOVER_DECISIONS,1,"No forced second or third choice");
assert.equal(LOGO_DECISIONS,DISCOVER_DECISIONS,"Client/server limits match");
assert.throws(()=>makeDiscoverPrompt({...dataForAI,turn:2}),/journey step/);
assert.equal(validateDiscoverTurn({
 reply:"Nietzsche asks what helps us endure. Picture this:",
 followUp:"A friend asks why you stay at a job you dislike. What do you say?",
 choices:["It pays the bills","I hope things improve","I don't know anymore"]
},0).choices.length,3);
const completedTurn=validateDiscoverTurn({
 reply:"Necessity can sustain endurance without making the job fulfilling.",
 followUp:"Does needing a reason mean you have chosen it?",choices:[]
},1);
assert.equal(completedTurn.complete,true);
assert.ok(completedTurn.followUp);
assert.throws(()=>validateDiscoverTurn({
 reply:"I see why you might be uncertain. Let's explore.",
 followUp:"A friend asks what you believe. What do you say?",choices:["Yes, definitely","No, not really","Maybe, I guess"]
},0),/speculative/);
assert.throws(()=>validateDiscoverTurn({
 reply:"This may make a new relation visible in your everyday life.",
 followUp:"What next?",choices:["Another choice","One more choice","A last choice"]
},1),/Final reflection/);
assert.equal(newAIConversation(12).consent,false,"No background submission or implied consent");
assert.equal(aiMemoryChoices({threads:[{opening:"A remembered thought"},{note:"A different memory"}]}).length,2);
const firstAI={...newAIConversation(63),consent:true,messages:[{
 role:"assistant",text:"Hegel asks us to look beyond the fragment. Picture this:",
 followUp:"A team judges someone from one quiet meeting. What feels missing?",
 choices:["Their other commitments","The team's real needs","More context altogether"]
}]};
const firstHtml=aiConversationHtml({quote:QUOTES[63],conversation:firstAI,available:true,authenticated:true});
assert.ok(firstHtml.includes("Their other commitments")&&firstHtml.includes("THE ENCOUNTER"));
assert.equal((firstHtml.match(/data-ai-choice="/g)||[]).length,3);
assert.ok(firstHtml.includes('data-ai="own-answer"')&&firstHtml.includes("<details"),"Optional own-words path stays collapsed");
assert.ok(firstHtml.includes("yl-logo-source-visible"),"Original idea remains visible");
assert.ok(firstHtml.includes('data-ai="pet"')&&firstHtml.includes("yl-logo-pet-hero"),"Companion remains available");
const finishedAI={...firstAI,complete:true,messages:[...firstAI.messages,
 {role:"user",text:"More context altogether",lensIndex:0},
 {role:"assistant",text:"The silence meant something, but it cannot explain the whole situation alone.",followUp:"What other relationships would change your view?",choices:[],complete:true}
]};
const finishHtml=aiConversationHtml({quote:QUOTES[63],conversation:finishedAI,available:true,authenticated:true});
assert.ok(finishHtml.includes("WHAT THIS SHOWS")&&!finishHtml.includes("yl-quote-drag"),"Unreviewed quote has explanation but no ungrounded word exercise");
assert.ok(finishHtml.includes('data-ai="finish"')&&!finishHtml.includes("data-ai-choice="));
assert.ok(finishHtml.includes("What other relationships would change your view?"));
assert.ok(aiSummary(finishedAI,QUOTES[63],"2026-11-01").note.includes("More context"));
assert.equal(Object.keys(VISUAL_BY_QUOTE).length,91,"All bundled quotes have a deterministic visual archetype");
assert.ok(conceptVisualHtml(QUOTES[31],31,"We need more context.",0).includes("BACK TO THE QUOTE"));
assert.equal(conceptVisualHtml(["Bad quote"],31,""),"","Wrong quote cannot receive a diagram");
assert.ok(!finishHtml.includes("<script>"),"User-origin text is escaped");
assert.ok(app.includes("direction:choice")&&app.includes('m.followUp?"Question: "'),"Exact answer and question context reach the model");
assert.ok(app.includes('action==="try-another"')&&app.includes('const custom=stanceAction.dataset.ai==="own-answer"'),"Only explicit retry or hidden own-words choice changes the path");
assert.ok(aiServerSource.includes("guestIdentity(req,res)")&&aiServerSource.includes("SameSite=Strict"),"Guest cookie and security preserved");
assert.ok(aiServerSource.includes("YOURLOGOS_AI_GUEST_DAILY_CAP")&&aiServerSource.includes("refundBudget(id)"),"Rate limits and failed-request refund preserved");
assert.ok(!auth.includes("signInAnonymously()")&&auth.includes("data.user.is_anonymous"),"No unintended anonymous Supabase signup");
assert.ok(sw.includes("discover-concept-grammar.js")&&sw.includes("discover-concept.css"),"Offline visual grammar is precached");
assert.ok(html.includes("little-logo-hd-v2.jpg")&&sw.includes("little-logo-hd-v2.jpg"),"Original mascot remains available offline");
assert.ok(!aiServerSource.includes("OPENAI_API_KEY"),"Server does not read unrelated provider secrets");

const {guestIdentity}=await import("../discover-ai-server.mjs");
const cookieResponse={headers:{},setHeader(name,value){this.headers[name]=value}};
const guestReq={headers:{origin:"https://yourlogos-web-production.up.railway.app",host:"railway-internal-proxy"}};
const firstGuest=guestIdentity(guestReq,cookieResponse);
assert.ok(firstGuest?.startsWith("guest:"),"Same-origin visit receives a guest identity");
const cookie=cookieResponse.headers["Set-Cookie"].split(";")[0];
assert.ok(cookieResponse.headers["Set-Cookie"].includes("HttpOnly")&&cookieResponse.headers["Set-Cookie"].includes("SameSite=Strict"));
assert.equal(guestIdentity({headers:{...guestReq.headers,cookie}}, {setHeader(){}}),firstGuest,"Signed guest cookie is stable for the same visitor");
assert.equal(guestIdentity({headers:{origin:"https://untrusted.test",host:"railway-internal-proxy"}},cookieResponse),null,"Cross-origin requests cannot create guest identity");
assert.ok(guestIdentity({headers:{host:"railway-internal-proxy","sec-fetch-site":"same-origin"}},{setHeader(){}})?.startsWith("guest:"),"Same-origin Safari requests may omit Origin");
assert.equal(guestIdentity({headers:{host:"railway-internal-proxy","sec-fetch-site":"cross-site"}},cookieResponse),null,"Cross-site fetch without Origin is denied");

assert.ok(app.includes('...(token?{Authorization:"Bearer "+token}:{})'),"Browser sends account authentication only when available");
assert.ok(firstHtml.includes('data-ai-choice="0"'),"AI tap responses are available without a keyboard");
assert.ok(serverSource.includes('"/api/discover-ai"')&&serverSource.includes('handleDiscoverAI(req,res)'));
assert.ok(!serverSource.includes('process.env.OPENAI_API_KEY'),"Static public config must never include the secret API key");
assert.ok(aiServerSource.includes("getUser")===false&&aiServerSource.includes('/auth/v1/user'),"Supabase verifies bearer token");
assert.ok(aiServerSource.includes("api.deepseek.com/chat/completions")&&aiServerSource.includes("response_format")&&aiServerSource.includes("daily_or_rate_limit"),"DeepSeek JSON mode and budgets are configured");
assert.ok(aiServerSource.includes("process.env.DEEPSEEK_API_KEY")&&!aiServerSource.includes("process.env.OPENAI_API_KEY"),"DeepSeek secret stays server-side");
assert.ok(sw.includes('"/discover-ai-client.js"'),"Offline shell loads without AI network access");

assert.ok(openingPrompt.system.includes("ONE ROUND ONLY")&&openingPrompt.system.includes("ordinary life"),"Short ordinary-life encounters are required");
assert.ok(openingPrompt.system.includes("3 distinct plausible")&&openingPrompt.system.includes("single clear question"),"Three defensible lenses and a single question are required");
assert.ok(openingPrompt.system.includes("not statements to attribute as verbatim words"),"Prevent false thinker attribution");
assert.ok(app.includes("yl-discover-immersive"),"Discover receives immersive full-screen class");
assert.ok(app.includes('type:"complete"')&&app.includes('positives.get(theme)'),"Journey completions influence next-day quote ranking");
assert.ok(!firstHtml.includes("Earlier thoughts")&&!firstHtml.includes("YOUR LAST DIRECTION"),"Keep interaction uncluttered");

const immersiveCSS=read("little-logo-discover.css");
assert.ok(html.includes('/little-logo-discover.css'),"Immersive Discover stylesheet loads last");
assert.ok(sw.includes('/little-logo-discover.css')&&Number(sw.match(/const CACHE="yourlogos-v([0-9]+)-/)?.[1]||0)>=81,"iPhone PWA precaches the new visual treatment");
assert.ok(firstHtml.includes("yl-logo-pet-pose")&&!firstHtml.includes("yl-logo-face"),"Character uses real painted pose art without mismatched vector faces");
assert.ok(firstHtml.includes('yl-logo-scene-light')&&firstHtml.includes('yl-logo-scene-ridge'),"Discover uses a cohesive subtle scene behind the mascot");
assert.ok(immersiveCSS.includes('yl-life-stage-joy')&&immersiveCSS.includes('yl-life-stage-think')&&immersiveCSS.includes('yl-life-stage-startle'),"Companion includes physically different joyful thinking and startled poses");
assert.ok(immersiveCSS.includes('mix-blend-mode:screen')&&immersiveCSS.includes('mask-image:'),"Old dark sticker edges blend into the scene");
assert.ok(immersiveCSS.includes('prefers-reduced-motion:reduce'),"Active character states respect reduced-motion preference");
const consentScene=aiConversationHtml({quote:QUOTES[63],conversation:newAIConversation(63),available:true,authenticated:true});
assert.ok(consentScene.includes('yl-logo-roam-stage')&&consentScene.includes('Little Logo uses DeepSeek'),"First entrance feels immersive while preserving consent");
const cutoutCSS=read("little-logo-cutout-fix.css");
const silhouetteMask=read("little-logo-cutout-mask.svg");
assert.ok(html.includes('/little-logo-cutout-fix.css'),"Cutout patch is loaded after the earlier face overlay");
assert.ok(cutoutCSS.includes('.yl-logo-pet-figure .yl-logo-face')&&cutoutCSS.includes('display:none!important'),"Inaccurate facial overlay is disabled");
assert.ok(cutoutCSS.includes('mask-image:url("/little-logo-cutout-mask.svg")'),"Original character is composited through a standalone silhouette");
assert.ok(silhouetteMask.includes('viewBox="0 0 400 400"')&&silhouetteMask.includes('<path'),"Feathered mask targets the original 400px artwork");
assert.ok(Number(sw.match(/const CACHE="yourlogos-v([0-9]+)-/)?.[1]||0)>=81&&sw.includes('/little-logo-cutout-mask.svg')&&sw.includes('/little-logo-cutout-fix.css'),"iPhone service worker precaches both fix assets");
const fxSource=read("little-logo-fx.js");
const ritualCSS=read("little-logo-ritual.css");
assert.ok(html.includes('little-logo-ritual.css'),"Reaction stylesheet loads after legacy motion patches");
assert.ok(sw.includes('little-logo-fx.js')&&sw.includes('little-logo-ritual.css'),"PWA includes reaction scripts and styles offline");
assert.ok(fxSource.includes('counts={tap:10,answer:17')&&fxSource.includes('reduceMotion()'),"Tap and answer bursts are finite and respect reduced motion");
assert.ok(ritualCSS.includes('yl-v4-celebration')&&ritualCSS.includes('yl-v4-startle'),"Different interactions have distinct whole-body actions");
assert.ok(app.includes('lilLogoFX("answer")')&&app.includes('lilLogoFX("tap")')&&app.includes('lilLogoFX("world")'),"Discover events trigger effects");
assert.ok(app.includes('t.impactOccurred("medium")'),"Telegram host uses a real medium impact for answer actions");
const loadingPoseCard=aiConversationHtml({
  quote:QUOTES[63],
  conversation:{...firstAI,loading:true,petMood:"thinking"},
  available:true,authenticated:true
});
assert.ok(loadingPoseCard.includes("yl-logo-feedback"),"Initial AI thinking scene still has distinct display");
assert.ok(!loadingPoseCard.includes("A team judges someone from one quiet meeting")&&!loadingPoseCard.includes("yl-logo-choices"),"Loading feedback hides stale choices");
assert.ok(firstHtml.includes("yl-logo-progress-track")&&firstHtml.includes('role="progressbar"'),"Discover has its own one-stage progress indicator");
const poseCSS=read("little-logo-poses-v5.css");
const poseWebP=fs.readFileSync(new URL("../little-logo-poses-v5.webp",import.meta.url));
assert.ok(poseWebP.length>25000&&poseWebP.subarray(0,4).toString()==="RIFF","Real eight-pose artwork is present and valid WebP");
assert.ok(html.includes('little-logo-poses-v5.css'),"Illustration CSS loads last after original styles");
assert.ok(sw.includes('little-logo-poses-v5.css')&&sw.includes('little-logo-poses-v5.webp'),"Artwork and CSS are available offline in PWA");
assert.ok(firstHtml.includes('yl-logo-pet-pose')&&!firstHtml.includes('yl-logo-face'),"Rendered companion uses painted sprite without old eye overlay");
assert.ok(poseCSS.includes('.yl-logo-pet-delighted .yl-logo-pet-pose')&&poseCSS.includes('.yl-logo-pet-thinking .yl-logo-pet-pose')&&poseCSS.includes('.yl-logo-pet-surprised .yl-logo-pet-pose'),"Distinct physical character poses are mapped to states");
assert.ok(poseCSS.includes('background-size:800% 100%')&&poseCSS.includes('prefers-reduced-motion:reduce'),"Atlas uses eight frames and honors accessibility");
const livingCSS=read("little-logo-live.css");
assert.ok(html.includes('/little-logo-live.css'),"Living companion styling is loaded after existing theme");
assert.ok(sw.includes('/little-logo-live.css'),"PWA caches Living companion styles offline");
assert.ok(aiClientSource.includes("yl-logo-pet-figure")&&aiClientSource.includes("yl-logo-pet-pose"),"Character mounts a real illustrated pose within the motion rig");
assert.ok(!aiClientSource.includes("yl-logo-pet-hair")&&!aiClientSource.includes("yl-logo-face"),"Broken hand-drawn eye and hair overlays are removed from the DOM");
assert.ok(livingCSS.includes("@keyframes yl-life-blink")&&livingCSS.includes("@keyframes yl-life-thinking")&&livingCSS.includes("@keyframes yl-life-delighted"),"Character has deliberate idle and emotional motion");
assert.ok(livingCSS.includes("prefers-reduced-motion:reduce"),"Companion respects reduced-motion accessibility");
assert.ok(app.includes('current.interlude=true')&&app.includes('current.interlude=false'),"Decision interlude starts and resolves");
const reactionScene=aiConversationHtml({quote:QUOTES[63],conversation:{...firstAI,interlude:true,interludeChoice:1,loading:true},available:true,authenticated:true});
assert.ok(reactionScene.includes("yl-logo-interlude")&&reactionScene.includes("yl-logo-pet"),"Interlude renders mascot");
assert.ok(!reactionScene.includes("yl-logo-choices")&&!reactionScene.includes("yl-thinker-intro")&&!reactionScene.includes("yl-logo-feedback")&&!reactionScene.includes("yl-ai-question"),"Interlude hides all philosopher, choice and thinking text");
const {PORTRAIT_AUTHORS,philosopherPortrait}=await import("../philosopher-portraits.js");
assert.equal(PORTRAIT_AUTHORS.length,56,"All canonical Discover author sources are represented");
assert.equal(new Set(PORTRAIT_AUTHORS.map(a=>philosopherPortrait(a))).size,56,"Every source has unique portrait SVG");
assert.ok(html.includes('src="/app.js?yl=')&&html.includes('src="/little-logo-presence.js?yl=')&&html.includes('href="/discover-living-v2.css?yl='),"iPhone entrypoint references versioned Discover assets");
assert.ok(app.includes('from "./discover-ai-client.js?yl=87"'),"app loads current Discover component");
assert.ok(sw.includes('cache:"no-store"')&&sw.includes('request.mode==="navigate"')&&sw.includes('url.pathname.startsWith("/api/")'),
  "iPhone PWA retrieves fresh app scripts/pages online without caching private API data");
assert.ok(sw.includes("caches.match(request)")&&sw.includes('"/index.html"'),
  "iPhone PWA still provides offline shell fallback");
const livingV2CSS=read("discover-living-v2.css"),presenceV2=read("little-logo-presence.js"),portraitV2=read("philosopher-portraits.js");
for(const asset of ["discover-living-v2.css","little-logo-presence.js","philosopher-portraits.js"])
 assert.ok(sw.includes('"/'+asset+'"'),"New Discover asset is available offline: "+asset);
assert.ok(html.includes('/discover-living-v2.css')&&html.includes('/little-logo-presence.js'),"Living Discover includes CSS and idle controller");
assert.ok(aiClientSource.includes("philosopherPortrait(author)")&&portraitV2.includes("Søren Kierkegaard"),"Philosopher identity is rendered");
assert.ok(livingV2CSS.includes("prefers-reduced-motion:reduce")&&presenceV2.includes("reduced()"),"Living encounters respect reduced motion");
console.log("YourLogos V3.0: source, native beta, routes, curated art, visual lessons and privacy checks PASS.");

assert.ok(v33Source.includes(".yl-logo-pet-atlas{display:none!important}"),"Never expose the repeated frames");
