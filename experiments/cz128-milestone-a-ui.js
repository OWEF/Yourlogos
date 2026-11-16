/** CZ-128 Milestone A — presentation only, no inference, persistence or philosopher routing. */
"use strict";
(() => {
 const $ = id => document.getElementById(id);
 const names = {
  trade_off:"Trade-Off",decision_map:"Decision Map",
  token_studio:"Token Studio",swipe_decision:"Swipe Decision"
 };
 const titles=["Your Choice.","Back to the Philosopher.","One Last Thing."];
 const roleNames=["YOUR DECISION","IMAGINED DEVELOPMENT · NOT YOUR ACTION","YOUR RESPONSE"];
 let catalogue=null,current=null,game=null,view="intro",section=0,epoch=0;
 let busy=false,lastRun=null;
 let choiceState=null,history=[],stage=0,selectedActivity=1,preferredGameId=null;
 const tokenGame=()=>game==="token_studio";
 const allocationGame=()=>game==="token_studio"||game==="trade_off";
 const showError=(message,error=false)=>{
  $("status").textContent=message;
  $("status").classList.toggle("error",error);
 };
 function setView(next){
  view=next;
  for(const key of ["intro","play","result"])$(key).classList.toggle("hidden",key!==next);
  ["dot-0","dot-1","dot-2"].forEach((id,i)=>$(id).classList.toggle("on",i<=["intro","play","result"].indexOf(next)));
  window.scrollTo({top:0,behavior:"instant"});
 }
 async function api(path,body){
  const res=await fetch(path,{method:body?"POST":"GET",cache:"no-store",
   credentials:"same-origin",referrerPolicy:"no-referrer",
   headers:body?{"content-type":"application/json"}:{},
   body:body?JSON.stringify(body):undefined});
  const value=await res.json();
  if(!res.ok)throw Error(value.reason||value.status||"The accepted research service refused the request.");
  return value;
 }
 function element(tag,text,cls){
  const node=document.createElement(tag);
  if(text!==undefined&&text!==null)node.textContent=String(text);
  if(cls)node.className=cls;
  return node;
 }
 function elButton(text,cls,callback,aria){
  const b=element("button",text,cls);b.type="button";
  if(aria)b.setAttribute("aria-label",aria);
  b.addEventListener("click",callback);
  return b;
 }
 function markRevision(){
  epoch++;lastRun=null;
  $("save-notice").hidden=true;
 }
 function snapshot(){
  history.push({choiceState:structuredClone(choiceState),stage,selectedActivity});
  if(history.length>60)history.shift();
 }
 function initialState(){
  history=[];stage=0;selectedActivity=1;
  const c=current.selection.canonical_choice_contract;
  choiceState=allocationGame()?
   tokenGame()?{cells:Array.from({length:c.budget.capacity},()=>0)}:
   {amounts:Array.from({length:c.choices.length},()=>0)}:
   {path:[]};
  markRevision();
 }
 function undo(){
  if(!history.length)return;
  const old=history.pop();
  choiceState=old.choiceState;stage=old.stage;selectedActivity=old.selectedActivity;
  markRevision();renderGame();
 }
 function reset(){
  initialState();renderGame();showError("The imagined choices were reset.");
 }
 function activityCounts(){
  if(!allocationGame())return null;
  const c=current.selection.canonical_choice_contract;
  return tokenGame()?c.choices.map((_,i)=>choiceState.cells.filter(v=>v===i).length):
    [...choiceState.amounts];
 }
 function timeText(unitHours,count){
  if(unitHours===null)return count+" units";
  if(!Number.isFinite(unitHours)||!Number.isSafeInteger(count)||count<0)throw Error("Invalid duration");
  const raw=unitHours*count*60;
  const mins=Math.round(raw*1e9)/1e9;
  const h=Math.trunc(mins/60);
  const m=Math.round((mins-h*60)*1e9)/1e9;
  const fmt=n=>new Intl.NumberFormat("en",{maximumFractionDigits:9}).format(n);
  if(!h&&!m&&raw>0)return "< 0.000000001 min";
  if(!m)return fmt(h)+" h";
  return (h?fmt(h)+" h ":"")+fmt(m)+" min";
 }
 function duration(unitHours,count){
  if(count===0)return unitHours===null?"0 units":"0 min";
  return timeText(unitHours,count);
 }
 function allocationSummary(){
  const c=current.selection.canonical_choice_contract,n=activityCounts();
  return c.choices.map((item,i)=>item.label+": "+duration(c.budget.unitHours,n[i])).join(" · ");
 }
 function addActivityCard(target,item,index,count,budget,callbacks){
  const card=element("div",null,"activity");
  const head=element("div",null,"activity-head");
  head.append(element("strong",item.label),element("span",duration(budget.unitHours,count),"stage-role"));
  const bar=element("div",null,"activity-bar");
  const fill=element("span");fill.style.width=(100*count*item.cost/budget.capacity)+"%";
  bar.append(fill);
  const controls=element("div",null,"adjust");
  const less=elButton("−","",callbacks.less,"Remove one allocation from "+item.label);
  const more=elButton("+","",callbacks.more,"Add one allocation to "+item.label);
  less.disabled=!callbacks.canLess;more.disabled=!callbacks.canMore;
  controls.append(less,element("strong",count+" "+(budget.unitHours===null?"units":"segments")),more);
  card.append(head,bar,controls);target.append(card);
 }
 function renderTradeOff(target){
  const c=current.selection.canonical_choice_contract,b=c.budget,n=activityCounts();
  const used=n.reduce((sum,x,i)=>sum+x*b.costs[i],0);
  target.append(element("p",
   "Assign your budget. "+used+" of "+b.capacity+" units used · "+(b.capacity-used)+" left.",
   "stage-role"));
  const dist=element("div",null,"distribution");
  c.choices.forEach((x,i)=>{
   const cost=x.cost;
   addActivityCard(dist,x,i,n[i],b,{
    canLess:n[i]>0,
    canMore:n[i]<(x.max??Infinity)&&used+cost<=b.capacity,
    less:()=>{snapshot();choiceState.amounts[i]--;markRevision();renderGame();},
    more:()=>{snapshot();choiceState.amounts[i]++;markRevision();renderGame();}
   });
  });
  target.append(dist);
  target.append(element("p","These are finite modeled resources, not judgments about what deserves your time.","hint"));
  $("play-next").disabled=b.capacityMode==="cap"?used>b.capacity:used!==b.capacity;
 }
 function setToken(index,activity){
  if(!tokenGame()||index<0||index>=choiceState.cells.length)return;
  if(choiceState.cells[index]===activity)return;
  snapshot();choiceState.cells[index]=activity;markRevision();renderGame();
 }
 function moveToken(activity,inc){
  const cells=choiceState.cells;
  const from=inc?cells.findIndex(v=>v!==activity):cells.findLastIndex(v=>v===activity);
  if(from<0)return;
  const to=inc?activity:(activity+1)%current.selection.canonical_choice_contract.choices.length;
  setToken(from,to);
 }
 function renderTokens(target){
  const c=current.selection.canonical_choice_contract,b=c.budget,n=activityCounts();
  target.append(element("p","Six 30-minute segments. Tap a segment to change it, or drag it onto an activity below.","stage-role"));
  const grid=element("div",null,"slot-grid");
  choiceState.cells.forEach((x,i)=>{
   const label=c.choices[x].label;
   const btn=elButton(null,"slot",()=>{
    if(dragged)return;
    setToken(i,(x+1)%c.choices.length);
   },"Segment "+(i+1)+": "+label+". Tap to choose next activity.");
   btn.dataset.slot=String(i);
   btn.draggable=true;
   btn.append(element("span",String(i+1).padStart(2,"0"),"slot-index"),
    element("strong",label));
   btn.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/plain",String(i));});
   grid.append(btn);
  });
  target.append(grid);
  const legend=element("div",null,"tokens-legend");
  c.choices.forEach((item,i)=>{
   const btn=elButton(item.label,"",()=>{selectedActivity=i;renderGame();},
    "Select "+item.label+" as the drag destination");
   btn.dataset.activity=String(i);
   if(selectedActivity===i)btn.classList.add("active");
   btn.addEventListener("dragover",e=>e.preventDefault());
   btn.addEventListener("drop",e=>{
    e.preventDefault();const v=Number(e.dataTransfer.getData("text/plain"));
    if(Number.isSafeInteger(v))setToken(v,i);
   });
   legend.append(btn);
  });
  target.append(legend);
  const dist=element("div",null,"distribution");
  c.choices.forEach((x,i)=>{
   addActivityCard(dist,x,i,n[i],b,{
    canLess:n[i]>0,canMore:n[i]<b.capacity,
    less:()=>moveToken(i,false),more:()=>moveToken(i,true)
   });
  });
  target.append(dist);
  target.append(element("p","Distribution: "+allocationSummary()+". The repeated evenings are imagined, not measured habits.","hint"));
  $("play-next").disabled=false;
 }
 let dragged=false,gesture=null;
 document.addEventListener("pointerdown",e=>{
  const slot=e.target.closest?.(".slot[data-slot]");
  if(slot){gesture={index:Number(slot.dataset.slot),x:e.clientX,y:e.clientY};dragged=false;}
 });
 document.addEventListener("pointerup",e=>{
  if(!gesture)return;
  const moving=Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>24;
  if(moving&&tokenGame()&&view==="play"){
   const dest=document.elementFromPoint(e.clientX,e.clientY)?.closest?.("[data-activity]");
   if(dest){setToken(gesture.index,Number(dest.dataset.activity));dragged=true;}
  }
  gesture=null;
  if(dragged)queueMicrotask(()=>{dragged=false;});
 });
 function stageOptions(){
  const routes=current.presentation?.routes||[];
  const prefix=choiceState.path;
  const indexed=routes.filter(x=>prefix.every((p,i)=>x.path[i]===p));
  const options=new Map();
  for(const route of indexed){
   const entry=route.stages[stage];
   if(entry&&!options.has(entry.id))options.set(entry.id,entry);
  }
  return [...options.values()];
 }
 function acceptStageOption(option){
  if(!stageOptions().some(x=>x.id===option.id))return;
  snapshot();
  choiceState.path=[...choiceState.path.slice(0,stage),option.id];
  stage=Math.min(3,choiceState.path.length);
  markRevision();renderGame();
 }
 function branchPrompt(){
  if(stage===0)return current.record.dilemma;
  if(stage===1)return "Which imagined development would you like to explore?";
  if(stage===2)return "If that happened in the imagined story, how might you respond?";
  return "Your imagined path is ready to consider.";
 }
 function chosenStages(){
  const path=choiceState.path,route=current.presentation?.routes?.find(
   r=>path.every((v,i)=>r.path[i]===v));
  return route?.stages.slice(0,path.length)||[];
 }
 function renderSwipe(target){
  const box=element("div",null,"question-square");
  box.setAttribute("role","group");
  box.setAttribute("aria-label","Question and two possible cards");
  box.append(element("div",branchPrompt(),"question-text"),
   element("div",stage<3?roleNames[stage]:"PATH READY","question-meta"));
  target.append(box);
  if(stage<3){
   const pair=element("div",null,"option-pair");
   stageOptions().forEach(option=>{
    const b=elButton(option.label,"option-card",()=>acceptStageOption(option),
     (stage===1?"Explore authored hypothetical: ":"Choose: ")+option.label);
    if(stage===1)b.dataset.role="AUTHORED_DEVELOPMENT";
    pair.append(b);
   });
   target.append(pair);
  }else target.append(element("div","You can now discover a qualified reading, or undo a step.","path-card"));
  const summary=chosenStages();
  if(summary.length)target.append(element("p",summary.map((s,i)=>
   (i===1?"Imagined: ":i===0?"You chose: ":"Your response: ")+s.label).join(" · "),"hint"));
  $("play-next").disabled=stage!==3;
 }
 function renderDecisionMap(target){
  const chain=element("div",null,"map-chain");
  chosenStages().forEach((s,i)=>{
   const b=elButton(null,"map-node selected",()=>{
    // A user may revise any earlier action; the later path is discarded.
    snapshot();choiceState.path=choiceState.path.slice(0,i);stage=i;markRevision();renderGame();
   },"Revise step "+(i+1)+": "+s.label);
   b.append(element("small",(i===1?"IMAGINED EVENT":i===0?"INITIAL CHOICE":"RESPONSE")+
     " · REVISE"),element("span",s.label));
   chain.append(b);
  });
  target.append(chain);
  if(stage<3){
   const stageTag=element("div",stage===1?
    "This event is written into the hypothetical, not caused by your choice. Select which scenario to examine.":
    stage===0?"Your initial decision.":"Your response to the imagined development.","stage-role");
   target.append(stageTag);
   const cards=element("div",null,"branch-choices");
   stageOptions().forEach(option=>{
    const b=elButton(option.label,"option-card",()=>acceptStageOption(option),
     (stage===1?"Explore source-authored possibility: ":"Choose: ")+option.label);
    cards.append(b);
   });
   target.append(cards);
  }else target.append(element("div",
   "A complete hypothetical route. Revisiting an earlier node clears the later route.","path-card"));
  $("play-next").disabled=stage!==3;
 }
 function renderGame(){
  if(!current?.adapter.available)return;
  const c=current.selection.canonical_choice_contract;
  $("game-title").textContent=names[game]||"Mini-game";
  $("game-eyebrow").textContent="PLAY · "+(names[game]||"ENCOUNTER").toUpperCase();
  $("game-prompt").textContent=allocationGame()?current.record.dilemma:branchPrompt();
  const root=$("game-content");root.replaceChildren();
  if(game==="trade_off")renderTradeOff(root);
  else if(game==="token_studio")renderTokens(root);
  else if(game==="decision_map")renderDecisionMap(root);
  else if(game==="swipe_decision")renderSwipe(root);
  else throw Error("An unimplemented game must never be rendered.");
  $("undo").disabled=history.length===0;
  $("reset").disabled=history.length===0;
 }
 function renderTrace(data){
  const area=$("trace");area.replaceChildren();
  const rows=data.selection?.selection_trace?.candidates||[];
  for(const row of rows){
   const card=element("div",null,"trace-item");card.setAttribute("role","listitem");
   card.append(element("strong",row.label+" · "+
    (row.selectionEligible?"Eligible":row.philosophicalEligible?"Source supported; not playable":"No fit")),
    element("span",row.reason||row.capabilityReason||"Not admitted."));
   area.append(card);
  }
 }
 async function activateSource(){
  const localEpoch=++epoch;
  lastRun=null;busy=false;setView("intro");$("start").disabled=true;
  $("refusal").hidden=true;
  showError("Verifying source evidence and evaluating all six game peers…");
  try{
   const id=$("source").value;
   const response=await api("/api/research/select",{recordId:id,
    ...(preferredGameId?{preferredGameId}:{})});
   if(localEpoch!==epoch)return;
   current=response;game=response.selection?.selected_game_id||null;
   $("intro-title").textContent="What would you choose?";
   $("dilemma").textContent=response.record?.dilemma||"This source cannot be played without stronger evidence.";
   $("quote").textContent=response.record?.source?.quote?
    "“"+response.record.source.quote+"”":"";
   $("quote-source").textContent=response.record?.source?
    "— "+response.record.source.author+" · "+response.record.source.work:"";
   renderTrace(response);
   if(!response.adapter?.available){
    $("refusal").hidden=false;
    $("refusal").textContent=response.adapter?.reason||
     "No source-valid browser interaction is available. We will not force-fit one.";
    showError("No suitable playable Encounter. Research admission preserved.",true);
    $("start").disabled=true;
    return;
   }
   initialState();
   $("start").disabled=false;
   showError(names[game]+" selected by the six-peer source-grounded selector. Ready to play.");
  }catch(error){
   if(localEpoch!==epoch)return;
   $("start").disabled=true;showError("Source admission failed: "+error.message,true);
  }
 }
 function canonicalChoice(){
  const c=current.selection.canonical_choice_contract;
  if(allocationGame()){
   const amounts=activityCounts();
   return {gameId:game,amounts,...(c.budget.repetitions===null?{}:
    {repetitions:c.budget.repetitions})};
  }
  if(choiceState.path.length!==3)return null;
  return {gameId:game,path:[...choiceState.path]};
 }
 function pathSummary(){
  if(allocationGame())return "Your imagined distribution: "+allocationSummary()+
   ". No real habits or personal values have been inferred.";
  const xs=chosenStages();
  if(xs.length!==3)return "";
  return "You chose: "+xs[0].label+". Imagined development: "+xs[1].label+
   ". Your response: "+xs[2].label+". The unchosen future remains unknown.";
 }
 function renderReading(){
  const parts=lastRun?.result?.expression?.sections;
  if(!Array.isArray(parts)||parts.length!==3)return;
  $("section-counter").textContent=String(section+1).padStart(2,"0")+" / 03";
  $("section-title").textContent=titles[section];
  $("section-text").textContent=parts[section].text;
  $("result-next").textContent=section===2?"Finish & Save":"Continue →";
  $("result-next").disabled=section===2; // No simulated save in Milestone A.
  $("save-notice").hidden=section!==2;
  $("path-summary").textContent=pathSummary();
  $("limits").textContent=(current.record?.uncertaintyLimit||"")+
   " · "+(current.record?.source?.locator||"")+
   " · Provisional research only; exact original source approval and iPhone VoiceOver acceptance remain open.";
  $("result").querySelector(".reading").focus({preventScroll:true});
 }
 async function submit(){
  if(busy||!current?.adapter.available||$("play-next").disabled)return;
  const originalEpoch=epoch;
  const picked=canonicalChoice();
  if(!picked)return;
  busy=true;$("play-next").disabled=true;
  showError("Checking your exact decisions against the source and accepted engines…");
  try{
   const data=await api("/api/research/run",{
    recordId:current.record.id,versionHash:current.record.versionHash,
    choice:picked,...(preferredGameId?{preferredGameId}:{})
   });
   if(originalEpoch!==epoch)return;
   const exp=data.result?.expression;
   if(data.status!=="ready"||data.publicationAllowed!==false||
      data.selectedGameId!==game||data.sourceVersionHash!==current.record.versionHash||
      data.engineSha!==catalogue.engineSha||
      !Array.isArray(exp?.sections)||exp.sections.length!==3||
      exp.wordCount<80||exp.wordCount>120)
    throw Error("Version, source, word-limit or expression verification failed.");
   lastRun=data;section=0;setView("result");renderReading();
   showError("The accepted reasoning and expression engines returned a verified research result.");
  }catch(error){
   if(originalEpoch!==epoch)return;
   showError("No result was invented: "+error.message,true);
  }finally{
   busy=false;
   if(view==="play")renderGame();
  }
 }
 $("source").addEventListener("change",activateSource);
 $("preferred").addEventListener("change",e=>{
  preferredGameId=e.target.value||null;activateSource();
 });
 $("start").addEventListener("click",()=>{
  if(!current?.adapter.available)return;
  initialState();setView("play");renderGame();showError("Make a reversible choice.");
 });
 $("play-back").addEventListener("click",()=>{
  if(!allocationGame()&&stage>0){undo();return;}
  setView("intro");showError("You can still revise the imagined choice.");
 });
 $("play-next").addEventListener("click",submit);
 $("undo").addEventListener("click",undo);
 $("reset").addEventListener("click",reset);
 $("result-back").addEventListener("click",()=>{
  if(section>0){section--;renderReading();}
  else{markRevision();setView("play");renderGame();}
 });
 $("result-next").addEventListener("click",()=>{
  if(section<2){section++;renderReading();}
 });
 // Read-only QA interface; no author, text, routes or result mutation API.
 window.__YL_CZ128_MILESTONE_A={
  getState:()=>({view,selectedGameId:game,recordId:current?.record?.id||null,
   sourceVersionHash:current?.record?.versionHash||null,
   selectedContractVersion:current?.selection?.version||null,
   canonicalChoice:current?.adapter?.available?canonicalChoice():null,
   gameStage:stage,section,resultStatus:lastRun?.status||null,
   wordCount:lastRun?.result?.expression?.wordCount||null,
   publicationAllowed:false,saveAvailable:false}),
  version:"research-four-game-shell/1.0.0"
 };
 (async()=>{
  try{
   const data=await api("/api/research/catalogue");
   if(data.status!=="ready"||data.engineSha?.length!==40||
      data.selectorVersion!=="single-six-peer-selection/2.2.0"||
      data.publicationAllowed!==false||data.games?.length!==6||
      data.games.filter(x=>x.browserPrototypeAvailable).length!==4)
    throw Error("Unexpected selector/engine/catalogue version.");
   catalogue=data;
   const select=$("source");select.replaceChildren();
   for(const record of data.records){
    const opt=element("option",record.source.author+" · "+record.source.work+
     (record.route==="no_fit"?" · no fit":""));
    opt.value=record.id;select.append(opt);
   }
   const alt=$("preferred");
   for(const g of data.games.filter(x=>x.browserPrototypeAvailable)){
    const opt=element("option",g.label);opt.value=g.id;alt.append(opt);
   }
   select.disabled=false;
   await activateSource();
  }catch(e){showError("Local research server unavailable: "+e.message,true);}
 })();
})();