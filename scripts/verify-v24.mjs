import fs from "node:fs";
import assert from "node:assert/strict";
import vm from "node:vm";

const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
const app=read("app.js"),world=read("world-view.js"),cosmos=read("cosmos-v2.html");
const exploreModule=read("explore-catalogue.js"),threadModule=read("thought-threads.js");
const personalizedModule=read("personalization.js"),onboardingModule=read("onboarding.js");
const auth=read("auth-client.js"),config=read("auth-config.js"),sw=read("sw.js"),html=read("index.html");
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

// AI Discover is disabled without server credentials and explicit opt-in.
// Neither the key nor raw memory may be exposed in static /api/public-config.
const aiClientSource=read("discover-ai-client.js"),aiServerSource=read("discover-ai-server.mjs"),serverSource=read("server.mjs");
for(const [name,source] of [["discover-ai-client",aiClientSource],["discover-ai-server",aiServerSource]]){
 new vm.Script(source.replace(/^import[^\n]*\n/gm,"").replace(/^export /gm,""),{filename:name});
}
const {makeDiscoverPrompt,validateDiscoverTurn,discoverAIEnabled}=await import("../discover-ai-server.mjs");
const {newAIConversation,aiSummary,aiMemoryChoices,aiConversationHtml}=await import("../discover-ai-client.js");
assert.equal(discoverAIEnabled(),false,"AI must stay disabled until owner configures credentials and explicitly enables it");
const dataForAI={quoteId:63,quote:{text:QUOTES[63][0],author:QUOTES[63][1],theme:QUOTES[63][2]},
 turn:2,userText:"I want to change, but I am afraid of losing who I am.",memory:["I used to be afraid of being alone."]};
const prompt=makeDiscoverPrompt(dataForAI);
assert.ok(prompt.system.includes("provocative")&&prompt.system.includes("revise"),"The AI should invite challenging, responsive philosophical thinking");
assert.equal(prompt.context.userWords,dataForAI.userText);
assert.equal(prompt.context.pastVoluntaryReflections.length,1);
assert.ok(!prompt.system.includes("OPENAI_API_KEY"));
assert.deepEqual(validateDiscoverTurn({reply:"You might be protecting an old identity because it has kept you safe.",followUp:"What would you risk by changing it?",choices:["I might lose belonging","I might gain freedom","I question the premise"]}).followUp,"What would you risk by changing it?");
assert.equal(newAIConversation(12).consent,false,"No background submission or implied consent");
const aiMemory=aiMemoryChoices({threads:[{opening:"A remembered thought"},{note:"A different memory"}]});
assert.equal(aiMemory.length,2);
const artificial={...newAIConversation(63),consent:true,messages:[{role:"user",text:"I want more freedom"},{role:"assistant",text:"Freedom often costs more than we first expect.",followUp:"What would that cost you?",choices:["My comfort","My certainty","My social ties"]}]};
const aiCard=aiConversationHtml({quote:QUOTES[63],conversation:artificial,available:true,authenticated:true});
assert.ok(aiCard.includes("I want more freedom")&&aiCard.includes("What would that cost you?")&&aiCard.includes("My certainty"));
assert.ok(!aiCard.includes("<textarea"),"No typing is needed in AI Discover");
assert.ok(!aiCard.includes("Continue the conversation")&&!aiCard.includes("LIVING DIALOGUE · EXPERIMENTAL"),"Quiet Discover hides verbose AI scaffolding");
assert.ok(!aiConversationHtml({quote:QUOTES[63],conversation:artificial,available:false,authenticated:true}),"Feature flag hides AI when disabled");
const savedAI=aiSummary(artificial,QUOTES[63],"2026-10-27");
assert.equal(savedAI.note,"I want more freedom");
assert.equal(savedAI.kind,"ai");
assert.ok(!app.includes('data-ai="launch"')&&app.includes('"/api/discover-ai"'),"Discover seamlessly selects AI for signed-in users");
assert.ok(app.includes('previouslyConsented()')&&app.includes('Boolean(verifiedIdentity)'),"AI respects account consent and authenticated session");
assert.ok(serverSource.includes('"/api/discover-ai"')&&serverSource.includes('handleDiscoverAI(req,res)'));
assert.ok(!serverSource.includes('process.env.OPENAI_API_KEY'),"Static public config must never include the secret API key");
assert.ok(aiServerSource.includes("getUser")===false&&aiServerSource.includes('/auth/v1/user'),"Supabase verifies bearer token");
assert.ok(aiServerSource.includes("api.deepseek.com/chat/completions")&&aiServerSource.includes("response_format")&&aiServerSource.includes("daily_or_rate_limit"),"DeepSeek JSON mode and budgets are configured");
assert.ok(aiServerSource.includes("process.env.DEEPSEEK_API_KEY")&&!aiServerSource.includes("process.env.OPENAI_API_KEY"),"DeepSeek secret stays server-side");
assert.ok(sw.includes('"/discover-ai-client.js"'),"Offline shell loads without AI network access");

console.log("YourLogos V3.0: source, native beta, routes, curated art, visual lessons and privacy checks PASS.");
