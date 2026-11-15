/**
 * CZ-128 visual connector for the EXACT PR #182 Encounter HTML.
 * NO philosopher->game mapping, no client-side game eligibility/routing,
 * no client-side reasoning/Emotion/Expression, no persistent data.
 *
 * The accepted Node selector decides game and authoritative source record.
 * This adapter only binds a selected game ID to the existing approved widget,
 * sends its authored canonical choice, and displays the verified response.
 */
"use strict";
(function(){
 const $=id=>document.getElementById(id);
 const GAME_WIDGETS=Object.freeze({token_studio:"choose-token",swipe_decision:"choose-swipe"});
 const ROLE_NAMES=Object.freeze({
  USER_DECISION:"YOUR DECISION",
  AUTHORED_DEVELOPMENT:"AUTHORED HYPOTHETICAL · NOT YOUR ACTION"
 });
 let catalogue=null,current=null,lastRun=null,busy=false,serial=0,revealStep=0,showAll=false;
 const setStatus=(message,error=false)=>{
  $("cz128-status").textContent=message;
  $("cz128-status").dataset.error=String(error);
 };
 const setReady=ready=>{
  document.body.dataset.cz128Ready=String(ready);
  $("start").disabled=!ready;
 };
 const escapeQuote=source=>"“"+source.quote+"”";
 const newElement=(tag,text,className)=>{
  const node=document.createElement(tag);node.textContent=text;
  if(className)node.className=className;
  return node;
 };
 const futureUnknown=()=>{
  $("research-notice").textContent="Research only · provisional interpretation and source passage. "+
   "The scenario is hypothetical, not a record of your behavior or a prediction. "+
   "Scholarly review and physical iPhone accessibility acceptance remain open.";
 };
 async function loadJson(url,options={}){
  const res=await fetch(url,{
   method:options.body?"POST":"GET",
   headers:options.body?{"content-type":"application/json"}:{},
   body:options.body?JSON.stringify(options.body):undefined,
   cache:"no-store",credentials:"same-origin",
   referrerPolicy:"no-referrer"
  });
  const data=await res.json();
  if(!res.ok)throw new Error(data.reason||data.status||"Local research request rejected.");
  return data;
 }
 function renderTrace(selection){
  const target=$("cz128-peer-reasons");target.replaceChildren();
  const rows=selection?.selection_trace?.candidates||[];
  for(const peer of rows){
   const card=newElement("div","", "cz128-peer");
   card.setAttribute("role","listitem");
   const status=peer.selectionEligible?"Eligible for this research request":
     peer.philosophicalEligible?"Supported philosophically, but not available in this browser":
     "Not eligible for the source-backed argument";
   card.append(newElement("strong",peer.label+" · "+status));
   card.append(newElement("span",peer.reason||peer.capabilityReason||
    "No independently reviewed source evidence is available."));
   if(peer.browserPrototypeAvailable)
    card.append(newElement("span","Isolated browser prototype exists; production still unavailable."));
   else if(peer.availableInResearch)
    card.append(newElement("span","Headless research contract only; not browser-playable."));
   else card.append(newElement("span","Not implemented; not playable."));
   target.append(card);
  }
  if(!rows.length){
   for(const peer of selection?.rejected_games||[]){
    const card=newElement("div","", "cz128-peer");
    card.setAttribute("role","listitem");
    card.append(newElement("strong",peer.label+" · unavailable"));
    card.append(newElement("span",peer.reason));target.append(card);
   }
  }
 }
 function showDilemma(data){
  const record=data.record;
  const widget=data.adapter.widgetId;
  if(!widget||!GAME_WIDGETS[data.selection.selected_game_id])return;
  // This is an adapter switch from the actual selector's game ID.
  // It is NOT an author, quotation or source-id route.
  $(GAME_WIDGETS[data.selection.selected_game_id]).click();
  const source=record.source,contract=data.selection.canonical_choice_contract;
  let headline="",decision="",action="";
  if(contract.kind==="finite_budget_allocation"){
   const budget=contract.budget,unit=budget.unitHours,capacity=budget.capacity;
   const hours=unit===null?null:capacity*unit;
   headline=hours===null?"One shared budget. Your priorities.":
     String(Number(hours.toFixed(8)))+" hours. Your choices.";
   decision="DECISION: Allocate "+capacity+" source-approved tokens among "+
    contract.choices.length+" activities. "+(unit===null?"":(
    "Each token represents "+String(Number((unit*60).toFixed(8)))+" minutes."));
   action="Allocate the imagined time";
  }else{
   headline="A choice. A future you cannot know.";
   decision="DECISION: Choose an initial action, explore a source-authored "+
    "hypothetical development (not an action you cause), then choose your response.";
   action="Make the first decision";
  }
  $("intro-eyebrow").textContent="01 · THE DILEMMA · AUTOMATICALLY MATCHED";
  $("intro-title").textContent=headline;
  $("intro-quote").textContent=escapeQuote(source);
  $("intro-author").textContent="— "+source.author+" · "+source.work;
  $("quote-rendering-note").textContent="Provisional research quotation · "+source.locator;
  $("dilemma-label").textContent="SITUATION · HYPOTHETICAL";
  $("dilemma-situation").textContent=record.dilemma;
  $("dilemma-decision").textContent=decision;
  $("dilemma-discovery").textContent="DISCOVERY: "+record.accessibleInsight;
  $("start-label").textContent=action;
  $("result-quote").textContent=escapeQuote(source);
  $("result-quote-note").textContent="Provisional source · "+source.locator;
  $("thinker-name").textContent=source.author;
  $("try-again-label").textContent=contract.kind==="finite_budget_allocation"?
   "Try another allocation":"Try another imagined path";
  $("research-notice").textContent="Research-only, source not independently certified. "+
   record.uncertaintyLimit;
  $("source-detail").textContent=source.work+" · Source review pending · "+
   record.uncertaintyLimit;
 }
 function navigateToIntro(){
  if(!$("result").classList.contains("hidden"))$("edit").click();
  if(!$("play").classList.contains("hidden"))$("to-intro").click();
  // Gracefully recover after any previous game route, without touching engine.
  $("intro").classList.remove("hidden");
  $("play").classList.add("hidden");
  $("result").classList.add("hidden");
  for(let i=0;i<3;i++)$("prog-"+i).classList.toggle("active",i===0);
  $("cz128-remember").classList.add("hidden");
 }
 function clearReflections(){
  for(const id of ["cz128-recall-choice","cz128-recall-thesis","cz128-recall-limits"])
   $(id).value="";
 }
 async function activateSource(id){
  const epoch=++serial;
  setReady(false);busy=true;lastRun=null;clearReflections();
  navigateToIntro();
  setStatus("Consulting the accepted six-peer selector and source contracts…");
  $("cz128-selection-summary").textContent="";
  $("cz128-no-fit").classList.add("hidden");
  try{
   const data=await loadJson("/api/research/select",{body:{recordId:id}});
   if(epoch!==serial)return;
   current=data;renderTrace(data.selection);
   const chosen=data.selection?.selected_game_id;
   if(data.status==="research_selected"&&data.adapter?.available&&
      GAME_WIDGETS[chosen]){
    showDilemma(data);
    $("cz128-selection-summary").textContent="Automatically selected: "+
     data.selection.selected_game.label+" · isolated playable prototype. "+
     "The source and all six game evaluations remain inspectable below.";
    setStatus("Source contract admitted. Make an imagined decision; "+
     "the accepted engines will evaluate it after you finish.");
    setReady(true);
   }else{
    const reason=data.adapter?.reason||data.selection?.fallback_reason||
     data.selection?.no_fit_status||data.status;
    $("cz128-selection-summary").textContent=data.status==="no_fit"?
     "Source-grounded no-fit: no game will be forced.":
     "No browser-playable source-grounded interaction is currently available.";
    $("cz128-no-fit").textContent=reason;
    $("cz128-no-fit").classList.remove("hidden");
    setStatus("No playable Encounter · "+reason,true);
    $("intro-title").textContent="A source deserves a faithful representation.";
    $("intro-quote").textContent=data.record?escapeQuote(data.record.source):"";
    $("intro-author").textContent=data.record?
     "— "+data.record.source.author+" · "+data.record.source.work:"";
    $("dilemma-situation").textContent=data.record?.dilemma||
     "This source requires independent scholarly admission.";
    $("dilemma-decision").textContent="We will not invent a game to fill this gap.";
    $("dilemma-discovery").textContent="Review source and model capabilities before play.";
    $("quote-rendering-note").textContent="Not approved for research play; no source publication.";
    setReady(false);
   }
  }catch(error){
   if(epoch!==serial)return;
   current=null;setReady(false);
   setStatus("The verified local research service is unavailable: "+error.message,true);
  }finally{if(epoch===serial)busy=false;}
 }
 function validUserChoice(){
  const gameId=current?.selection?.selected_game_id;
  if(gameId==="token_studio"){
   const state=window.__YL_V21_TEST?.getState?.();
   const cells=state?.cells;
   if(!Array.isArray(cells)||cells.length!==6)return null;
   const amounts=[0,1,2].map(x=>cells.filter(v=>v===x).length);
   if(amounts.reduce((a,b)=>a+b,0)!==6)return null;
   return {gameId,amounts,repetitions:current.selection.canonical_choice_contract.budget.repetitions};
  }
  if(gameId==="swipe_decision"){
   const state=window.__YL_CZ140_TEST?.getState?.();
   if(!state?.audit?.done||!Array.isArray(state.path)||state.path.length!==3)
    return null;
   if(state.audit.trail.some((s,i)=>s.role!==
     ["USER_DECISION","AUTHORED_DEVELOPMENT","USER_DECISION"][i]))return null;
   return {gameId,path:[...state.path]};
  }
  return null;
 }
 function visualise(result){
  const container=$("choice-dashboard");container.replaceChildren();
  const canonical=result.canonical_choice,contract=result.canonical_choice_contract;
  const unit=contract.budget?.unitHours;
  if(Array.isArray(canonical.amounts)){
   const total=canonical.amounts.reduce((sum,n,i)=>sum+n*contract.budget.costs[i],0);
   const note=newElement("p","Modeled resource used: "+total+" of "+
    contract.budget.capacity+" units. An imaginary allocation, not your life.","dashboard-summary");
   container.append(note);
   canonical.amounts.forEach((n,i)=>{
    const item=contract.choices[i],row=newElement("div","", "cz128-mini-row");
    const amount=unit===null?String(n)+" units":
     String(Number((n*unit).toFixed(8)))+" hours";
    row.append(newElement("span",item.label+" — "+amount));
    const bar=newElement("div","", "cz128-track");
    const fill=newElement("div","", "cz128-fill");
    fill.style.width=(n*item.cost/contract.budget.capacity*100)+"%";
    bar.append(fill);row.append(bar);container.append(row);
   });
  }else{
   container.append(newElement("p",
    "This path was imagined. The unchosen future has not been observed.",
    "dashboard-summary"));
   const path=canonical.path,approved=contract.sourceAuthoredRoutes
    .find(route=>JSON.stringify(route.path)===JSON.stringify(path));
   const uiTrail=window.__YL_CZ140_TEST?.getState?.().audit?.trail;
   if(!approved||!Array.isArray(uiTrail)||
      JSON.stringify(uiTrail.map(x=>x.id))!==JSON.stringify(path))
    throw Error("The displayed path does not match the canonical source-authorized sequence.");
   approved.agencyRoles.forEach((role,i)=>{
    const card=newElement("div","", "cz128-stage");
    card.dataset.role=role;
    card.append(newElement("strong",String(i+1).padStart(2,"0")+" · "+
     (ROLE_NAMES[role]||role)));
    card.append(newElement("p",uiTrail[i].label));
    container.append(card);
   });
   const note=newElement("div","", "cz128-stage");
   note.dataset.role="RETROSPECTIVE_INTERPRETATION";
   note.append(newElement("strong","04 · LOOKING BACK"));
   note.append(newElement("p","This is an interpretation after one imagined route, not knowledge of the alternative."));
   container.append(note);
  }
 }
 function reveal(stage,all=false){
  revealStep=Math.max(0,Math.min(2,stage));showAll=all;
  const panels=["choice-card","teaching-card","last-card"];
  panels.forEach((id,i)=>$(id).classList.toggle("hidden",!all&&i>revealStep));
  $("reveal-back").disabled=!all&&revealStep===0;
  $("reveal-next").disabled=all||revealStep===2;
  $("reveal-next").textContent=all?"All three sections visible":
   revealStep===0?"Continue to the philosopher →":"One last thing… →";
  $("reveal-all").disabled=all;
  $("reveal-status").textContent=all?"All three source-grounded sections are visible.":
   "Stage "+(revealStep+1)+" of 3 · "+
   ["Your Choice","Back to the Philosopher","One Last Thing…"][revealStep];
  $("cz128-remember").classList.toggle("hidden",!all&&revealStep!==2);
  const focus=all?$("choice-card"):$(panels[revealStep]);
  focus.focus({preventScroll:true});
  focus.scrollIntoView({block:"nearest",
   behavior:window.matchMedia("(prefers-reduced-motion:reduce)").matches?
   "instant":"smooth"});
 }
 function exposeOutput(reply){
  const result=reply.result,expression=result.expression,source=current.record.source;
  if(result.status!=="ready"||!Array.isArray(expression.sections)||
    expression.sections.length!==3||!result.canonical_choice||
    result.publicationAllowed!==false||reply.publicationAllowed!==false)
   throw Error("Unverified source-grounded Expression was rejected.");
  $("choice-text").textContent=expression.sections[0].text;
  $("teaching-text").textContent=expression.sections[1].text;
  $("ending-text").textContent=expression.sections[2].text;
  $("thinker-name").textContent=source.author;
  $("result-quote").textContent=escapeQuote(source);
  $("result-quote-note").textContent="Research quotation · "+source.locator;
  $("result-title").textContent="What your decision\nmakes visible.";
  $("result-title").style.whiteSpace="pre-line";
  $("result-eyebrow").textContent="03 · DISCOVER · ACCEPTED ENGINE OUTPUT";
  $("source-detail").textContent=source.work+" · "+
   current.record.uncertaintyLimit+" "+
   "No alternative outcome is known. Selection SHA: "+reply.engineSha+
   ". Emotion strategy: "+result.emotion.strategy+".";
  $("research-notice").textContent="Research only · provisional quotation and interpretation. "+
   "This is a source-grounded hypothetical, not a record of your real life. "+
   "Publication is blocked; scholarly review is outstanding.";
  const portrait=$("philosopher-portrait");
  portrait.setAttribute("aria-label","Stylized static portrait of "+source.author);
  try{
   portrait.innerHTML=window.YL_ENCOUNTER_ENGINE.philosopherPortrait(source.author);
  }catch{
   portrait.textContent=source.author.slice(0,2);
  }
  $("intro").classList.add("hidden");
  $("play").classList.add("hidden");
  $("result").classList.remove("hidden");
  for(let i=0;i<3;i++)$("prog-"+i).classList.add("active");
  // Original widget's MutationObserver can recalculate the allocation visual.
  // Paint the verified canonical path after its microtask to ensure authority.
  requestAnimationFrame(()=>{
   try{visualise(result);reveal(0);}catch(error){
    $("result").classList.add("hidden");$("play").classList.remove("hidden");
    setStatus("A path visualization would misrepresent the canonical evidence: "+
      error.message,true);
   }
  });
 }
 async function submitCurrent(kind){
  if(busy||!current?.adapter?.available)return;
  if(kind!==current.adapter.widgetId){
   setStatus("The chosen interaction no longer matches the selected game.",true);return;
  }
  const choice=validUserChoice();
  if(!choice){
   setStatus("Complete an accepted canonical user choice before discovering its implications.",true);
   return;
  }
  const origin=serial;
  busy=true;
  const submission=kind==="token"?$("submit"):$("swipe-finish");
  submission.disabled=true;
  setStatus("Validating your actual choice and interpreting the philosophical evidence…");
  try{
   const data=await loadJson("/api/research/run",{body:{
    recordId:current.record.id,versionHash:current.record.versionHash,choice
   }});
   if(origin!==serial)return;
   if(data.selectedGameId!==choice.gameId||
      data.sourceVersionHash!==current.record.versionHash||
      data.engineSha!==catalogue.engineSha)
    throw Error("The browser result did not match the accepted source/selector version.");
   lastRun=data;
   exposeOutput(data);
   setStatus("The research-only Meaning → Emotion → Expression pipeline returned READY.");
  }catch(error){
   if(origin!==serial)return;
   setStatus("No philosophical result was fabricated: "+error.message,true);
  }finally{busy=false;submission.disabled=false;}
 }
 const captureSubmit=(buttonId,kind)=>{
  $(buttonId).addEventListener("click",event=>{
   event.preventDefault();event.stopImmediatePropagation();
   submitCurrent(kind);
  },true);
 };
 captureSubmit("submit","token");
 captureSubmit("swipe-finish","swipe");
 for(const [id,action] of [
  ["reveal-next",()=>reveal(revealStep+1)],
  ["reveal-back",()=>reveal(showAll?1:revealStep-1)],
  ["reveal-all",()=>reveal(2,true)]
 ]){
  $(id).addEventListener("click",event=>{
   if(!lastRun)return;
   event.preventDefault();event.stopImmediatePropagation();
   action();
  },true);
 }
 $("start").addEventListener("click",event=>{
  if(document.body.dataset.cz128Ready!=="true"){
   event.preventDefault();event.stopImmediatePropagation();
   setStatus("No admitted browser-playable Encounter has been selected.",true);
  }
 },true);
 $("cz128-source").addEventListener("change",event=>{
  activateSource(event.target.value);
 });
 $("edit").addEventListener("click",()=>{
  lastRun=null;$("cz128-remember").classList.add("hidden");clearReflections();
 },true);
 $("try-again").addEventListener("click",()=>{
  lastRun=null;$("cz128-remember").classList.add("hidden");clearReflections();
 },true);
 // Stable read-only QA instrumentation; never a controller or source authority.
 window.__YL_CZ128_RESEARCH={
  getState:()=>({ready:document.body.dataset.cz128Ready==="true",
   sourceId:current?.record?.id??null,selectedGameId:current?.selection?.selected_game_id??null,
   adapterAvailable:current?.adapter?.available===true,sourceVersionHash:current?.record?.versionHash??null,
   status:current?.status??null,
   peerTrace:current?.selection?.selection_trace?.candidates?.map(x=>({
    id:x.id,eligible:x.selectionEligible,reason:x.reason}))??[],
   resultStatus:lastRun?.status??null,
   canonicalChoice:lastRun?.result?.canonical_choice??null,
   wordCount:lastRun?.result?.expression?.wordCount??null,
   emotionStrategy:lastRun?.result?.emotion?.strategy??null,
   publicationAllowed:false,rememberVisible:!$("cz128-remember").classList.contains("hidden"),
   revealStep,showAll}),
  // Intentionally no submit-as-philosopher, set-game or mutate-selector API.
  version:"encounter-local-learning/1.0.0"
 };
 async function initialize(){
  setReady(false);
  try{
   const data=await loadJson("/api/research/catalogue");
   if(data.status!=="ready"||data.publicationAllowed!==false||
     typeof data.engineSha!=="string"||data.selectorVersion!=="single-six-peer-selection/2.1.0"||
     !Array.isArray(data.records)||!Array.isArray(data.games)||data.games.length!==6||
     data.games.some(g=>g.productionPlayable!==false))
    throw Error("The six-peer selector or source contract is not version-verified.");
   catalogue=data;
   const picker=$("cz128-source");picker.replaceChildren();
   for(const record of data.records){
    const option=document.createElement("option");
    option.value=record.id;
    option.textContent=record.source.author+" · "+record.source.work+
     (record.route==="no_fit"?" · conceptual no-fit":"");
    picker.append(option);
   }
   picker.disabled=false;
   await activateSource(picker.value);
  }catch(error){
   setReady(false);
   setStatus("Unable to verify or load the accepted local selection service: "+error.message,true);
  }
 }
 initialize();
})();
