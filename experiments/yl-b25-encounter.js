import {philosopherPortrait} from "/philosopher-portraits.js";
/**
 * YourLogos CZ-134 B2.3 — isolated, source-bound six-peer browser.
 * Server owns source/author/game eligibility. Never persist anything.
 */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const qaMode=new URLSearchParams(location.search).get("qa")==="1";
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
  tokenOwners:[0,0,1,1,2,2],leftSlots:4,focus:"life_exchanged",
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
 if(next==="balance_of_values"){
  const src=selectedSource();
  st.leftSlots=Math.floor(src.capacity/2);
  st.focus=src.lenses[0].id;
 }
 $("result").hidden=true;
 renderPeers();renderGame();
}
function renderSources(){
 const root=$("sources");root.replaceChildren();
 for(const d of sources){
  const b=button(null,()=>{
   chosen=d.key;game=null;st=null;history=[];
   $("experience").hidden=true;$("result").hidden=true;
   renderSources();renderPeers();
   if(!qaMode&&d.defaultGameId){
    newGame(d.defaultGameId);
    $("experience").scrollIntoView({behavior:"instant",block:"start"});
    $("game-heading").focus({preventScroll:true});
   }
  },"source-card"+(chosen===d.key?" selected":""));
  b.dataset.source=d.key;b.setAttribute("aria-pressed",String(chosen===d.key));
  b.append(make("strong",d.title),make("small",d.intro));
  root.append(b);
 }
}
function renderPeers(){
 const root=$("peers");root.replaceChildren();
 $("peer-section").hidden=!qaMode;
 if(!qaMode)return;
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
 const d=selectedSource(),cap=d.capacity,unit=d.unitName;
 const leftName=d.choices[0].label,rightName=d.choices[1].label;
 root.append(make("p",d.marginalPrompt||d.intro,"hint"));
 const board=make("div",null,"balance-board");
 const left=make("div"),right=make("div"),beam=make("div",null,"balance-beam");
 left.append(make("strong",st.leftSlots),make("span",leftName));
 right.append(make("strong",cap-st.leftSlots),make("span",rightName));
 beam.style.transform="rotate("+((st.leftSlots-cap/2)*6)+"deg)";
 board.append(left,beam,right);root.append(board);
 const slider=make("input");
 slider.id="hours-slider";slider.type="range";slider.min="0";slider.max=String(cap);
 slider.step="1";slider.value=String(st.leftSlots);slider.style.width="100%";
 slider.style.minHeight="44px";slider.setAttribute("aria-label",
  "Allocate "+unit+" to "+leftName+"; fixed total "+cap);
 slider.addEventListener("input",()=>{
  const n=Number(slider.value);
  if(Number.isSafeInteger(n)&&n>=0&&n<=cap&&n!==st.leftSlots)
   updateState(s=>{s.leftSlots=n;s.touched=true;});
 });
 root.append(slider);
 const controls=make("div",null,"actionbar");
 controls.append(button("− One unit",()=>{
  if(st.leftSlots>0)updateState(s=>{s.leftSlots--;s.touched=true;});
 }),button("+ One unit",()=>{
  if(st.leftSlots<cap)updateState(s=>{s.leftSlots++;s.touched=true;});
 }));
 root.append(controls);
 const total=make("p",st.leftSlots+" + "+(cap-st.leftSlots)+" = "+
  cap+" "+unit+" · the total stays the same.","marginal-note");
 root.append(total);
 const interpret=make("div",null,"lens-choices");
 interpret.append(make("p","Which side of this question would you examine?","hint"));
 const options=make("div",null,"option-pair");
 for(const item of d.lenses){
  const b=button(item.label,()=>updateState(s=>{s.focus=item.id;}),
   "option-card lens-option"+(st.focus===item.id?" selected":""));
  b.dataset.focus=item.id;b.setAttribute("aria-pressed",String(st.focus===item.id));
  options.append(b);
 }
 interpret.append(options);
 root.append(interpret);
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

function swipeControl(options,handler){
 const area=make("div","Swipe LEFT for the first decision, RIGHT for the second. Tap the labelled choices below or use arrow keys.","swipe-surface");
 area.dataset.swipeSurface="true";
 area.tabIndex=0;area.setAttribute("role","group");
 area.setAttribute("aria-label","Swipe Decision choice surface with tap and keyboard alternatives");
 let start=null;
 area.addEventListener("touchstart",e=>{
  start=e.changedTouches?.[0]?.clientX??null;
 },{passive:true});
 area.addEventListener("touchend",e=>{
  const finish=e.changedTouches?.[0]?.clientX??null;
  if(start===null||finish===null)return;
  const dx=finish-start;start=null;
  if(Math.abs(dx)<45||options.length<2)return;
  const item=dx>0?options[1]:options[0];
  if(item)handler(item.id);
 },{passive:true});
 area.addEventListener("keydown",e=>{
  if(!["ArrowLeft","ArrowRight"].includes(e.key))return;
  e.preventDefault();
  const item=e.key==="ArrowRight"?options[1]:options[0];
  if(item)handler(item.id);
 });
 return area;
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
  if(game==="swipe_decision")root.append(swipeControl(possibleStarts(),chooseStart));
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
  if(game==="swipe_decision")root.append(swipeControl(responses(),chooseResponse));
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
  return {leftSlots:st.leftSlots,touched:st.touched,focus:st.focus};
 if(game==="decision_map"||game==="swipe_decision")
  return {path:[st.start,st.scene,st.response]};
 return {actions:[
  {type:"choose_start",optionId:st.start},
  {type:"explore_authored",sceneId:st.scene},
  {type:"choose_response",optionId:st.response},
  {type:"read_retrospective"}]};
}

function sourceHighlight(source){
 const raw=String(source.quote||"");
 const options=[
  /the cost of a thing is the amount of what I will call life/i,
  /lived forwards/i,
  /spend our days/i
 ];
 const match=options.map(re=>raw.match(re)).find(Boolean);
 return match?match[0]:raw.split(/\s+/).slice(0,Math.min(8,raw.split(/\s+/).length)).join(" ");
}
function makeTeachingCard(section,source){
 const panel=make("div",null,"teaching-card");
 const head=make("div",null,"teaching-identity");
 const avatar=make("div",null,"thinker-avatar");
 // Reuse the existing, locally authored pixel figure. No remote image/AI rig.
 avatar.innerHTML=philosopherPortrait(source.author);
 avatar.setAttribute("aria-hidden","true");
 const identity=make("div",null,"thinker-meta");
 identity.append(make("strong",source.author),
  make("span",source.work||"Philosophical source"),
  make("small","Stylized portrait · source interpretation provisional"));
 head.append(avatar,identity);panel.append(head);
 const quote=make("blockquote",null,"source-excerpt");
 const text=String(source.quote||""),clause=sourceHighlight(source);
 const at=text.indexOf(clause);
 if(at>=0&&clause){
  quote.append(document.createTextNode(text.slice(0,at)));
  quote.append(make("mark",clause));
  quote.append(document.createTextNode(text.slice(at+clause.length)));
 }else quote.textContent=text;
 panel.append(quote);
 // The source-grounded Section II text is THE main lesson. There is no
 // fourth compulsory section and no replacement of a source qualification.
 const core=make("p",null,"teaching-core");
 core.dataset.teachingClaim="true";
 const sentence=String(section.text).match(/^(.+?[.!?])(?:\s|$)/);
 if(sentence&&sentence[1].length<235){
  const bold=make("strong",sentence[1],"core-insight");
  core.append(bold,document.createTextNode(section.text.slice(sentence[1].length)));
 }else core.textContent=section.text;
 panel.append(core);
 const details=make("details",null,"source-depth");
 const summary=make("summary","Why this matters · read the source");
 details.append(summary);
 details.append(make("p","This source reading is provisional. The situation is imagined, not a claim about your real choices or future.","source-caveat"));
 if(typeof source.sourceUrl==="string"&&/^https:\/\//.test(source.sourceUrl)){
  const link=make("a","View the quoted source");
  link.href=source.sourceUrl;link.rel="noopener noreferrer";link.target="_blank";
  details.append(link);
 }else details.append(make("p","Exact source link unavailable; no invented link is displayed.","source-caveat"));
 panel.append(details);
 return panel;
}

async function discover(){
 if(!readiness())return;
 setDisabled("finish",true);
 $("game-status").textContent="Validating your hypothetical choices…";
 try{
  const response=await fetch("/api/run",{method:"POST",
   headers:{"content-type":"application/json"},
   body:JSON.stringify({recordKey:chosen,gameId:game,input:getInput(),qaMode})});
  const result=await response.json();
  if(!response.ok||result.status!=="ready")
   throw new Error(result.code||result.reason||"Research engine abstained");
  const root=$("result-sections");root.replaceChildren();
  const src=selectedSource();
  result.sections.forEach((section,i)=>{
   const item=make("div",null,"result-section"+(i===1?" educational":""));
   item.append(make("h3",section.label));
   item.append(i===1?makeTeachingCard(section,src):make("p",section.text));
   root.append(item);
  });
  $("result-status").textContent="A reflection on your fictional decision · "+
   result.wordCount+" words";
  $("result").hidden=false;st.finished=true;
  $("game-status").textContent="Discover what this decision can show.";
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
  if(peerIds.length!==6||sources.length!==6||data.productionAllowed!==false)
   throw new Error("Six peer research contract mismatch");
  renderSources();renderPeers();
 }catch(e){$("sources").textContent="Unable to load isolated research content: "+e.message;}
}
window.__YL_B25_QA=Object.freeze({getState:()=>JSON.parse(JSON.stringify({
 selectedSource:chosen,game,qaMode,st,historyLength:history.length,
 sourceEligibleForResearch:Boolean(game),productionAllowed:false,
 externalScholarApproved:false,accountPersistenceEnabled:false
 }))});
main();
})();