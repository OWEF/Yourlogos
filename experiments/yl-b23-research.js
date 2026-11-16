/**
 * YourLogos CZ-134 B2.3 — isolated, source-bound six-peer browser.
 * Server owns source/author/game eligibility. Never persist anything.
 */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const labels={
 trade_off:"Trade-Off",decision_map:"Decision Map",token_studio:"Token Studio",
 balance_of_values:"Value Balance",swipe_decision:"Swipe Decision",
 future_reveal:"Future Reveal"
};
let sources=[],peerIds=[],chosen=null,game=null,st=null,history=[];
const make=(tag,text,className)=>{
 const e=document.createElement(tag);
 if(text!==undefined&&text!==null)e.textContent=String(text);
 if(className)e.className=className;
 return e;
};
function button(text,fn,cls="button outline"){
 const b=make("button",text,cls);b.type="button";b.addEventListener("click",fn);return b;
}
function setDisabled(id,disabled){$(id).disabled=disabled;}
function resetState(){
 const s={touched:false,finished:false,amounts:[2,2,2],
  tokenOwners:[0,0,1,1,2,2],leftSlots:4,
  start:null,scene:null,response:null,view:0,unlocked:0};
 return s;
}
function updateState(fn){
 if(!st)return;
 history.push(structuredClone(st));
 if(history.length>70)history.shift();
 fn(st);st.finished=false;
 $("result").hidden=true;renderGame();
}
function selectedSource(){return sources.find(x=>x.key===chosen);}
function newGame(next){
 game=next;st=resetState();history=[];
 $("result").hidden=true;
 renderPeers();renderGame();
}
function renderSources(){
 const root=$("sources");root.replaceChildren();
 for(const d of sources){
  const b=button(null,()=>{chosen=d.key;game=null;st=null;history=[];
   $("experience").hidden=true;$("result").hidden=true;renderSources();renderPeers();},
   "source-card"+(chosen===d.key?" selected":""));
  b.dataset.source=d.key;b.setAttribute("aria-pressed",String(chosen===d.key));
  b.append(make("strong",d.title),make("small",d.intro));
  root.append(b);
 }
}
function renderPeers(){
 const root=$("peers");root.replaceChildren();
 const src=selectedSource();
 for(const id of peerIds){
  const available=src?.games.find(g=>g.id===id)?.eligible===true;
  const b=button(null,()=>{if(available)newGame(id);},
   "peer-card"+(game===id?" selected":"")+(!available?" not-eligible":""));
  b.dataset.game=id;b.disabled=!available;
  b.setAttribute("aria-pressed",String(game===id));
  b.append(make("strong",labels[id]),make("small",
   available?"Available for this source":"Not supported by this source"));
  root.append(b);
 }
}
function readiness(){
 if(!st)return false;
 if(game==="trade_off"||game==="token_studio"||game==="balance_of_values")
  return st.touched;
 return st.start!==null&&st.scene!==null&&st.response!==null;
}
function allocateHours(idx,next){
 if(!Number.isSafeInteger(next)||next<0||next>6||next===st.amounts[idx])return;
 updateState(s=>{
  const a=[...s.amounts],delta=next-a[idx];
  if(delta>0){
   let need=delta;
   for(let j=1;j<=2;j++){
    const other=(idx+j)%3;
    const free=Math.min(a[other],need);
    a[other]-=free;need-=free;
   }
   if(need!==0)return;
   a[idx]=next;
  }else{
   const give=(idx+1)%3;
   a[give]+=-delta;a[idx]=next;
  }
  if(a.reduce((x,y)=>x+y,0)===6&&a.every(x=>x>=0&&x<=6)){
   s.amounts=a;s.touched=true;
  }
 });
}
function renderTrade(root){
 root.append(make("p","Move an imagined half-hour from one use to another. All six half-hours stay allocated.","hint"));
 for(let i=0;i<3;i++){
  const row=make("div",null,"allocation-row"),head=make("div",null,"allocation-head");
  head.append(make("strong",selectedSource().choices[i].label),
   make("span",String(st.amounts[i])+" of 6 half-hours"));
  const range=make("input");
  range.type="range";range.min="0";range.max="6";range.step="1";
  range.value=String(st.amounts[i]);range.setAttribute("aria-label",
   "Allocate half-hours to "+selectedSource().choices[i].label);
  range.addEventListener("change",()=>allocateHours(i,Number(range.value)));
  row.append(head,range);root.append(row);
 }
}
function renderTokens(root){
 root.append(make("p","Six physical tokens. Tap a token to move that half-hour to the next imagined activity.","hint"));
 const row=make("div",null,"tokens");
 for(let i=0;i<6;i++){
  const current=st.tokenOwners[i],label=selectedSource().choices[current].label;
  const chip=button((i+1)+" · "+String(current+1),()=>{
   updateState(s=>{
    s.tokenOwners[i]=(s.tokenOwners[i]+1)%3;
    s.amounts=[0,0,0];
    for(const owner of s.tokenOwners)s.amounts[owner]++;
    s.touched=true;
   });
  },"token");
  chip.dataset.token=String(i);
  chip.title=label;chip.setAttribute("aria-label",
   "Token "+(i+1)+", currently "+label+". Move to next activity");
  row.append(chip);
 }
 root.append(row);
 for(let i=0;i<3;i++)root.append(make("p",
  selectedSource().choices[i].label+": "+st.amounts[i]+" half-hours","hint"));
}
function renderBalance(root){
 root.append(make("p","Balance eight invented discretionary hours, not moral values. Extra paid work assumes a fictional $20 net rate; no purchase is inferred.","hint"));
 const board=make("div",null,"balance-board");
 const left=make("div"),right=make("div"),beam=make("div",null,"balance-beam");
 left.append(make("strong",st.leftSlots),make("span","hours of extra paid work"));
 right.append(make("strong",8-st.leftSlots),make("span","hours kept for other uses"));
 beam.style.transform="rotate("+((st.leftSlots-4)*6)+"deg)";
 board.append(left,beam,right);root.append(board);
 const slider=make("input");
 slider.id="hours-slider";slider.type="range";slider.min="0";slider.max="8";
 slider.step="1";slider.value=String(st.leftSlots);slider.style.width="100%";
 slider.style.minHeight="44px";slider.setAttribute("aria-label",
  "Fictional hours of extra paid work, zero through eight");
 slider.addEventListener("input",()=>{
  const val=Number(slider.value);
  if(Number.isSafeInteger(val)&&val>=0&&val<=8&&st.leftSlots!==val)
   updateState(s=>{s.leftSlots=val;s.touched=true;});
 });
 const controls=make("div",null,"actionbar");
 controls.append(button("− One hour",()=>{
  if(st.leftSlots>0)updateState(s=>{s.leftSlots--;s.touched=true;});
 }),button("+ One hour",()=>{
  if(st.leftSlots<8)updateState(s=>{s.leftSlots++;s.touched=true;});
 }));
 root.append(slider,controls);
 root.append(make("p","The assumed extra earnings are $"+(st.leftSlots*20)+
  ". That number belongs only to this fictional example.","hint"));
}
const kindIsFuture=()=>game==="future_reveal";
function possibleStarts(){
 const byId=new Map();
 for(const r of selectedSource().routes)byId.set(r.startId,r.startLabel);
 return [...byId].map(([id,label])=>({id,label}));
}
function possibilities(){
 const byId=new Map();
 for(const r of selectedSource().routes.filter(x=>x.startId===st.start))
  byId.set(r.sceneId,{id:r.sceneId,label:r.sceneLabel,description:r.authoredText.join(" ")});
 return [...byId.values()];
}
function responses(){
 const byId=new Map();
 for(const r of selectedSource().routes.filter(x=>
    x.startId===st.start&&x.sceneId===st.scene))
  byId.set(r.responseId,r.responseLabel);
 return [...byId].map(([id,label])=>({id,label}));
}
function chooseStart(id){
 if(!possibleStarts().some(x=>x.id===id))return;
 updateState(s=>{s.start=id;s.scene=null;s.response=null;s.unlocked=1;s.view=1;});
}
function chooseScene(id){
 if(!possibilities().some(x=>x.id===id))return;
 updateState(s=>{s.scene=id;s.response=null;s.unlocked=2;s.view=2;});
}
function chooseResponse(id){
 if(!responses().some(x=>x.id===id))return;
 updateState(s=>{s.response=id;s.unlocked=3;s.view=3;});
}
function renderBranch(root){
 root.append(make("p",kindIsFuture()?
  "The first and third stages are YOUR decisions. The middle stage is a fiction you choose to explore, not an event you cause.":
  "Follow a source-authored hypothetical decision path; fictional developments are not forecasts.",
  "hint"));
 const progress=make("div",null,"progress-dots");
 for(let i=1;i<=3;i++)progress.append(make("span",null,
  "dot"+(st.unlocked>=i?" active":"")));
 root.append(progress);
 if(st.start!==null&&kindIsFuture()){
  const scrub=make("input");
  scrub.id="timeline-scrub";scrub.type="range";scrub.min="1";
  scrub.max=String(st.unlocked);scrub.value=String(st.view);
  scrub.step="1";scrub.style.width="100%";scrub.style.minHeight="44px";
  scrub.setAttribute("aria-label","Review earlier fictional narrative stage");
  scrub.addEventListener("change",()=>{
   const target=Number(scrub.value);
   if(Number.isSafeInteger(target)&&target<=st.unlocked&&target>=1)
    updateState(s=>{s.view=target;});
  });
  root.append(scrub);
 }
 if(st.start===null){
  root.append(make("p","First, what do you choose?","hint"));
  const pair=make("div",null,"option-pair");
  for(const item of possibleStarts()){
   const b=button(item.label,()=>chooseStart(item.id),"option-card");
   b.dataset.start=item.id;pair.append(b);
  }
  root.append(pair);return;
 }
 const selectedStart=possibleStarts().find(x=>x.id===st.start);
 const currentScene=possibilities().find(x=>x.id===st.scene);
 const selectedResponse=responses().find(x=>x.id===st.response);
 if(kindIsFuture()){
  const timeline=make("div",null,"authored");
  timeline.append(make("small","Retrospective sequence · a fictional scenario"));
  if(st.view===1)timeline.append(make("p","First choice: "+selectedStart.label));
  else if(st.view===2)timeline.append(make("p",
   currentScene?"Authored possibility: "+currentScene.description:
    "Explore one authored possibility to see what the story might present."));
  else timeline.append(make("p",selectedResponse?
   "Later response: "+selectedResponse.label:
   "The later response has not yet been selected."));
  root.append(timeline);
 }
 if(st.scene===null){
  root.append(make("p","Now explore one AUTHOR-WRITTEN possibility. It is not a real consequence of your decision.","hint"));
  const pair=make("div",null,"option-pair");
  for(const item of possibilities()){
   const b=button(item.label,()=>chooseScene(item.id),"option-card");
   b.dataset.scene=item.id;pair.append(b);
  }
  root.append(pair);
 }else if(st.response===null){
  const box=make("div",null,"authored");
  box.append(make("small","AUTHOR-WRITTEN FICTION · NOT CAUSED BY YOUR DECISION"),
   make("p",currentScene?.description||""));
  root.append(box,make("p","Knowing this imagined development, what would you decide next?","hint"));
  const pair=make("div",null,"option-pair");
  for(const item of responses()){
   const b=button(item.label,()=>chooseResponse(item.id),"option-card");
   b.dataset.response=item.id;pair.append(b);
  }
  root.append(pair);
 }else{
  const recap=make("div",null,"authored");
  recap.append(make("small","Three-stage hypothetical journey"),
   make("p","You chose: "+selectedStart.label),
   make("p","You explored one imagined scene: "+currentScene?.label),
   make("p","Your later response: "+selectedResponse?.label));
  root.append(recap,make("p",
   "The future not explored is UNKNOWN. Discover shows a retrospective interpretation, not a prediction.","hint"));
 }
 const nav=make("div",null,"actionbar");
 nav.append(button("Change first decision",()=>{
  updateState(s=>{s.start=null;s.scene=null;s.response=null;s.view=0;s.unlocked=0;});
 }));
 if(st.scene!==null)nav.append(button("Explore a different scene",()=>{
  updateState(s=>{s.scene=null;s.response=null;s.view=1;s.unlocked=1;});
 }));
 root.append(nav);
}
function renderGame(){
 const src=selectedSource();
 if(!src||!game||!st){$("experience").hidden=true;return;}
 $("experience").hidden=false;
 $("game-heading").textContent=labels[game]+" · "+src.title;
 $("game-explainer").textContent=src.intro;
 const root=$("game-controls");root.replaceChildren();
 if(game==="trade_off")renderTrade(root);
 else if(game==="token_studio")renderTokens(root);
 else if(game==="balance_of_values")renderBalance(root);
 else renderBranch(root);
 setDisabled("finish",!readiness());
 setDisabled("undo",history.length===0);
 $("game-status").textContent=readiness()?
  "Your hypothetical choice is ready to interpret. Nothing will be saved.":
  "Make a deliberate choice to unlock the philosophical result.";
}
function getInput(){
 if(game==="trade_off"||game==="token_studio")
  return {amounts:[...st.amounts],repetitions:selectedSource().repetitions};
 if(game==="balance_of_values")
  return {leftSlots:st.leftSlots,touched:st.touched};
 if(game==="decision_map"||game==="swipe_decision")
  return {path:[st.start,st.scene,st.response]};
 return {actions:[
  {type:"choose_start",optionId:st.start},
  {type:"explore_authored",sceneId:st.scene},
  {type:"choose_response",optionId:st.response},
  {type:"read_retrospective"}]};
}
async function discover(){
 if(!readiness())return;
 setDisabled("finish",true);
 $("game-status").textContent="Validating your hypothetical choices…";
 try{
  const response=await fetch("/api/run",{method:"POST",
   headers:{"content-type":"application/json"},
   body:JSON.stringify({recordKey:chosen,gameId:game,input:getInput()})});
  const result=await response.json();
  if(!response.ok||result.status!=="ready")
   throw new Error(result.code||result.reason||"Research engine abstained");
  const root=$("result-sections");root.replaceChildren();
  for(const section of result.sections){
   const item=make("div",null,"result-section");
   item.append(make("h3",section.label),make("p",section.text));
   root.append(item);
  }
  $("result-status").textContent=result.wordCount+
   " words · founder-provisional research · "+
   (result.expressionVerification==="frozen_v12_semantic_not_v20"?
    "v1.2 semantic expression (not v2.0)" :
    "frozen v2.0 expression");
  $("result").hidden=false;st.finished=true;
  $("game-status").textContent="The three-section reflection is ready for isolated QA.";
  $("result").scrollIntoView({behavior:"instant"});
 }catch(err){
  $("game-status").textContent="The research engine declined: "+err.message;
 }finally{setDisabled("finish",!readiness());}
}
$("undo").addEventListener("click",()=>{
 if(!history.length)return;
 st=history.pop();$("result").hidden=true;renderGame();
});
$("reset").addEventListener("click",()=>{
 if(!game)return;
 st=resetState();history=[];$("result").hidden=true;renderGame();
});
$("finish").addEventListener("click",discover);
$("revise").addEventListener("click",()=>{
 $("result").hidden=true;st.finished=false;renderGame();
 $("game-heading").focus();
});
async function main(){
 try{
  const r=await fetch("/api/catalogue",{cache:"no-store"});
  if(!r.ok)throw new Error("Catalogue unavailable");
  const data=await r.json();sources=data.sources;peerIds=data.peerIds;
  if(peerIds.length!==6||sources.length!==4||data.productionAllowed!==false)
   throw new Error("Six peer research contract mismatch");
  renderSources();renderPeers();
 }catch(e){$("sources").textContent="Unable to load isolated research content: "+e.message;}
}
window.__YL_B23_QA=Object.freeze({getState:()=>JSON.parse(JSON.stringify({
 selectedSource:chosen,game,st,historyLength:history.length,
 sourceEligibleForResearch:Boolean(game),productionAllowed:false,
 externalScholarApproved:false,accountPersistenceEnabled:false
 }))});
main();
})();