import {philosopherPortrait} from "/philosopher-portraits.js";
/**
 * CZ-143 B2.6: four tactile source-driven games; NO fake philosophical result.
 * All analysis comes from /api/run and exact server-owned source contracts.
 */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const QA=new URLSearchParams(location.search).get("qa")==="1";
const families={
 balance_move:"Balance & Move",decision_cards:"Decision Cards",
 tap_pair:"Tap & Pair",flip_reveal:"Flip & Reveal"
};
const artGlyph={balance_move:"◈",decision_cards:"◇",tap_pair:"⌁",flip_reveal:"✧"};
let catalogue=[],current=null,family=null,state=null,history=[],stage="choose",busy=false,message="";
const make=(tag,text,cls)=>{
 const el=document.createElement(tag);
 if(cls)el.className=cls;
 if(text!==undefined&&text!==null)el.textContent=String(text);
 return el;
};
const button=(label,fn,cls="control quiet")=>{
 const b=make("button",label,cls);b.type="button";
 b.addEventListener("click",fn);
 // R3 keyboard: Enter/Space must activate exactly once even when this
 // source-authored stage immediately replaces its own button DOM.
 b.addEventListener("keydown",event=>{
  if(event.key!=="Enter"&&event.key!==" ")return;
  event.preventDefault();
  if(!event.repeat&&!b.disabled)fn();
 });
 return b;
};
const svgIcon={
 hand:'<path d="M13 23v-9c0-1.5 2-1.5 2 0v-8c0-2 3-2 3 0v7-10c0-2 3-2 3 0v11-9c0-2 3-2 3 0v9-6c0-2 3-2 3 0v9c0 8-3 12-10 12H12c-4 0-6-2-9-7-1-2 2-4 4-2z" transform="translate(-1 0) scale(.88)"/>',
 heart:'<path d="M20 28 8 17C-1 9 9-1 17 8l3 3 3-3c8-9 18 1 9 9Z" transform="translate(-2 -2) scale(.85)"/>',
 speech:'<path d="M5 7h29v18H17l-8 7v-7H5Z"/><path d="M12 14h15M12 19h11"/>',
 spark:'<path d="m20 4 3 12 12 4-12 4-3 12-4-12L4 20l12-4z"/>',
 grid:'<path d="M5 7h12v12H5zM23 7h12v12H23zM5 25h12v12H5zM23 25h12v12H23z" transform="scale(.92)"/>',
 pages:'<path d="M7 6h21v28H7zM12 10h21v28H12zM16 17h12M16 23h11M16 29h8"/>',
 link:'<path d="M15 12h-3a9 9 0 0 0 0 18h8M25 12h3a9 9 0 0 1 0 18h-8M14 21h12"/>',
 book:'<path d="M5 7h14l3 3 3-3h13v27H25l-3 3-3-3H5zM22 11v26M9 13h9M26 13h8"/>'
};
function icon(name){
 const wrap=make("span",null,"pair-art"),s=document.createElementNS("http://www.w3.org/2000/svg","svg");
 s.setAttribute("viewBox","0 0 42 42");s.setAttribute("aria-hidden","true");
 s.innerHTML=svgIcon[name]||svgIcon.spark;wrap.append(s);return wrap;
}
function setScene(next){
 stage=next;
 $("choose-screen").hidden=next!=="choose";
 $("play-screen").hidden=next!=="play";
 $("discover-screen").hidden=next!=="discover";
 const main=next==="choose"?$("intro-heading"):
  next==="play"?$("play-title"):$("result-heading");
 requestAnimationFrame(()=>main.focus?.({preventScroll:true}));
 window.scrollTo({top:0,behavior:"instant"});
}
function selected(){return current;}
function setMessage(text){
 message=text;
 $("feedback").textContent=text;
}
function saveAnd(action,{animatePieces=false,focusPiece=null}={}){
 if(!state)return;
 const old=animatePieces?pieceCoordinates():null;
 history.push(structuredClone(state));
 if(history.length>60)history.shift();
 action(state);
 renderGame();
 if(old)animateMovedPieces(old);
 if(focusPiece!==null){
  const p=document.querySelector('[data-piece="'+focusPiece+'"]');
  if(p)p.focus({preventScroll:true});
 }
}
function pieceCoordinates(){
 return new Map([...document.querySelectorAll(".resource-piece")].map(p=>
  [p.dataset.piece,p.getBoundingClientRect()]));
}
function animateMovedPieces(old){
 if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 for(const p of document.querySelectorAll(".resource-piece")){
  const prior=old.get(p.dataset.piece),now=p.getBoundingClientRect();
  if(!prior)continue;
  const dx=prior.left-now.left,dy=prior.top-now.top;
  if(Math.abs(dx)+Math.abs(dy)<2)continue;
  p.animate([
   {transform:"translate("+dx+"px,"+dy+"px) scale(1.08)",filter:"brightness(1.25)"},
   {transform:"translate(0,0) scale(1)",filter:"brightness(1)"}
  ],{duration:290,easing:"cubic-bezier(.18,1.2,.42,1)"});
 }
}
function initialState(d,chosenFamily){
 if(chosenFamily==="balance_move"){
  const a=d.allocation,owners=[];
  a.initial.forEach((n,i)=>{for(let j=0;j<n;j++)owners.push(i);});
  if(a.resourceType==="cap")
   for(let i=owners.length;i<a.resourceCapacity;i++)owners.push(a.choices.length);
  return {owners,amounts:[...a.initial],touched:false,
   focus:a.lenses?.[0]?.id??null};
 }
 if(chosenFamily==="tap_pair")return {first:null,pairs:[],touched:false};
 return {start:null,scene:null,response:null,flipped:false,touched:false};
}
function selectQuestion(d){
 current=d;family=d.familyId;state=null;history=[];message="";
 renderQuestions();
 if(!family){
  if(QA)showQAFamilies();
  return;
 }
 if(QA){showQAFamilies();return;}
 beginFamily(family);
}
function beginFamily(next){
 if(!current?.eligibleFamilies.some(f=>f.id===next&&f.eligible)){
  setMessage("This source does not warrant that interaction.");return;
 }
 family=next;state=initialState(current,next);history=[];message="";
 $("play-title").textContent=current.title;
 $("play-description").textContent=current.intro;
 $("play-family").textContent=families[next];
 setScene("play");renderGame();
}
function renderQuestions(){
 const root=$("questions");root.replaceChildren();
 for(const d of catalogue){
  const b=button(null,()=>selectQuestion(d),"question-card");
  b.dataset.source=d.key;b.dataset.family=d.familyId||"no_fit";
  const illustration=make("span",artGlyph[d.familyId]||"·","question-art");
  illustration.setAttribute("aria-hidden","true");
  b.append(illustration,make("strong",d.title),make("small",d.intro));
  if(d.sourceStatus!=="research_selected")b.disabled=true;
  root.append(b);
 }
}
function showQAFamilies(){
 $("qa-panel").hidden=!QA;
 if(!QA)return;
 const root=$("qa-families");root.replaceChildren();
 const source=selected();
 for(const id of Object.keys(families)){
  const can=source?.eligibleFamilies.some(x=>x.id===id&&x.eligible);
  const b=button(families[id],()=>{if(can)beginFamily(id);},"qa-family");
  b.disabled=!can;b.dataset.family=id;b.setAttribute("aria-pressed",String(id===family));
  root.append(b);
 }
}
function unitsFromOwners(s){
 const n=current.allocation.choices.length;
 const a=Array(n).fill(0);
 for(const owner of s.owners)if(owner>=0&&owner<n)a[owner]++;
 return a;
}
function assignPiece(piece,target,{focusPiece=null}={}){
 if(!state||family!=="balance_move")return;
 const a=current.allocation,n=a.choices.length;
 if(target<0||target>n||target===n&&a.resourceType!=="cap")return;
 if(!Number.isSafeInteger(piece)||piece<0||piece>=state.owners.length)return;
 if(state.owners[piece]===target)return;
 saveAnd(s=>{
  s.owners[piece]=target;s.amounts=unitsFromOwners(s);s.touched=true;
 },{animatePieces:true,focusPiece});
 setMessage("Resources moved. The available total stays source-defined.");
}
function sliderAssign(to){
 if(!Number.isSafeInteger(to)||!state)return;
 const a=current.allocation,from=state.amounts[0];
 if(to<0||to>a.resourceCapacity||to===from)return;
 saveAnd(s=>{
  if(to>from){
   let need=to-from;
   for(let i=s.owners.length-1;i>=0&&need;i--)
    if(s.owners[i]!==0){s.owners[i]=0;need--;}
  }else{
   let need=from-to;
   for(let i=s.owners.length-1;i>=0&&need;i--)
    if(s.owners[i]===0){s.owners[i]=a.choices.length>1?1:
      (a.resourceType==="cap"?a.choices.length:0);need--;}
  }
  s.amounts=unitsFromOwners(s);
  s.touched=true;
 },{animatePieces:true});
 setMessage("The slider and pieces share this same allocation.");
}
function renderBalance(root){
 const a=current.allocation,n=a.choices.length;
 root.append(make("p","Tap a piece to move it, drag it into another container, or move the slider.","instruction"));
 const grid=make("div",null,"resource-tray"+(n===3?" cols-3":""));
 for(let i=0;i<n+(a.resourceType==="cap"?1:0);i++){
  const bucket=make("div",null,"bucket");bucket.dataset.index=String(i);
  bucket.dataset.bucket=String(i);
  const label=i===n?"Unallocated":a.choices[i].label;
  bucket.append(make("span",label,"bucket-title"),
   make("div",String(i===n?a.resourceCapacity-state.amounts.reduce((x,y)=>x+y,0):
     state.amounts[i]),"bucket-count"));
  const pile=make("div",null,"resource-pieces");
  for(let piece=0;piece<state.owners.length;piece++){
   if(state.owners[piece]!==i)continue;
   const p=button("✦",()=>assignPiece(piece,(i+1)%(n+(a.resourceType==="cap"?1:0)),
    {focusPiece:piece}),"resource-piece");
   p.dataset.piece=String(piece);p.draggable=true;
   p.setAttribute("aria-label","Resource piece "+(piece+1)+
    " allocated to "+label+". Tap to move to the next container.");
   p.addEventListener("dragstart",e=>{
    e.dataTransfer.setData("text/plain",String(piece));e.dataTransfer.effectAllowed="move";
   });
   pile.append(p);
  }
  bucket.addEventListener("dragover",e=>{e.preventDefault();
   bucket.classList.add("drag-over");});
  bucket.addEventListener("dragleave",()=>bucket.classList.remove("drag-over"));
  bucket.addEventListener("drop",e=>{
   e.preventDefault();bucket.classList.remove("drag-over");
   const id=Number(e.dataTransfer.getData("text/plain"));
   if(Number.isSafeInteger(id))assignPiece(id,i);
  });
  bucket.append(pile);grid.append(bucket);
 }
 root.append(grid);
 const controls=make("div",null,"resource-controls"),line=make("div",null,"range-label");
 line.append(make("span","Adjust "+a.choices[0].label),
  make("strong",state.amounts[0]+" / "+a.resourceCapacity+" "+a.unitName));
 const range=make("input");
 range.type="range";range.className="resource-slider";range.id="resource-slider";
 range.min="0";range.max=String(a.resourceCapacity);range.step="1";
 range.value=String(state.amounts[0]);
 range.setAttribute("aria-label","Allocate "+a.unitName+" to "+a.choices[0].label);
 range.addEventListener("change",()=>sliderAssign(Number(range.value)));
 controls.append(line,range);
 const sum=state.amounts.reduce((x,y)=>x+y,0),slack=a.resourceCapacity-sum;
 controls.append(make("p",sum+" allocated · "+slack+" unused · "+
  a.resourceCapacity+" "+a.unitName+" available","mini-note"));
 if(a.repetitions!==null)
  controls.append(make("p","These same quantities are assumed to repeat "+
   a.repetitions+" times in a fictional example.","mini-note"));
 if(a.lenses?.length){
  const lenses=make("div",null,"lens-options");
  for(const choice of a.lenses){
   const b=button(choice.label,()=>saveAnd(s=>{s.focus=choice.id;}),
    "lens-card");b.dataset.focus=choice.id;
   b.setAttribute("aria-pressed",String(state.focus===choice.id));
   lenses.append(b);
  }
  controls.append(make("p","What would you like to notice?","mini-note"),lenses);
 }
 root.append(controls);
}
function routeStarts(){
 const map=new Map();
 for(const r of current.timeline??[])map.set(r.startId,r.startLabel);
 return [...map].map(([id,label])=>({id,label}));
}
function routeScenes(){
 const map=new Map();
 for(const r of (current.timeline??[]).filter(x=>x.startId===state.start))
  map.set(r.sceneId,{id:r.sceneId,label:r.sceneLabel,
   content:r.authoredText.join(" ")});
 return [...map.values()];
}
function routeResponses(){
 const map=new Map();
 for(const r of (current.timeline??[]).filter(x=>
  x.startId===state.start&&x.sceneId===state.scene))
  map.set(r.responseId,r.responseLabel);
 return [...map].map(([id,label])=>({id,label}));
}
function chooseStart(id){
 if(!routeStarts().some(x=>x.id===id))return;
 saveAnd(s=>{s.start=id;s.scene=null;s.response=null;s.flipped=false;s.touched=true;});
}
function chooseScene(id){
 if(!routeScenes().some(x=>x.id===id))return;
 saveAnd(s=>{s.scene=id;s.response=null;s.flipped=true;s.touched=true;});
}
function chooseResponse(id){
 if(!routeResponses().some(x=>x.id===id))return;
 saveAnd(s=>{s.response=id;s.touched=true;});
}
function choiceCards(options,click,{caption="",greeting="Choose one",label="Choose an action"}={}){
 const wrap=make("div");
 wrap.append(make("p",greeting,"step-label"));
 const grid=make("div",null,"choice-pair");
 for(const item of options){
  const b=button(null,()=>click(item.id),"choice-card");
  b.dataset.choice=item.id;b.setAttribute("aria-label",label+": "+item.label);
  b.append(make("span","◇","mini-glyph"),make("strong",item.label));
  if(caption)b.append(make("small",caption));
  grid.append(b);
 }
 wrap.append(grid);return wrap;
}
function pathSummary(){
 const row=make("div",null,"path-chips");
 const start=routeStarts().find(x=>x.id===state.start);
 const scene=routeScenes().find(x=>x.id===state.scene);
 const response=routeResponses().find(x=>x.id===state.response);
 if(start)row.append(make("span",start.label,"path-chip"));
 if(scene)row.append(make("span",scene.label+" (fictional)","path-chip"));
 if(response)row.append(make("span",response.label,"path-chip"));
 return row;
}
function renderDecision(root){
 if(state.start===null){
  root.append(choiceCards(routeStarts(),chooseStart,{
   greeting:"First, what would you choose?",caption:"An imagined decision"}));return;
 }
 root.append(pathSummary());
 if(state.scene===null){
  root.append(make("p","Next is an author-written possibility to explore—not an event your decision causes.","authored-notice"));
  root.append(choiceCards(routeScenes(),chooseScene,{
   greeting:"Explore one fictional development",caption:"Authored possibility",
   label:"Explore a fictional possibility"}));return;
 }
 if(state.response===null){
  const scene=routeScenes().find(x=>x.id===state.scene);
  root.append(make("p","Imagined development · "+(scene?.content||""),
   "authored-notice"));
  root.append(choiceCards(routeResponses(),chooseResponse,{
   greeting:"Knowing this imagined situation, what would you do next?",
   caption:"Your own response",label:"Choose your response"}));return;
 }
 root.append(make("p","You chose an action, explored one authored development, then chose a response. The other future remains unknown.","authored-notice"));
 root.append(pathSummary());
}
function renderFlip(root){
 if(state.start===null){
  root.append(choiceCards(routeStarts(),chooseStart,{
   greeting:"First, choose the action you can take",caption:"Your choice"}));return;
 }
 root.append(pathSummary());
 const options=routeScenes(),picked=options.find(x=>x.id===state.scene);
 root.append(make("p","Choose a card to flip. Each contains an AUTHOR-WRITTEN fictional possibility, not a prediction or an event you caused.","instruction"));
 const row=make("div",null,"flip-row");
 for(let i=0;i<options.length;i++){
  const item=options[i],flipped=state.scene===item.id;
  const b=button(null,()=>chooseScene(item.id),
   "flip-card"+(flipped?" flipped":""));
  b.dataset.flip=item.id;
  b.disabled=state.scene!==null&&!flipped;
  b.setAttribute("aria-label",flipped?
   "Revealed authored possibility: "+item.label:
   "Flip fictional possibility "+(i+1));
  b.setAttribute("aria-pressed",String(flipped));
  const inner=make("span",null,"flip-inner");
  const front=make("span",null,"flip-front");
  front.append(make("span","✧","seal"),make("small","Possibility "+(i+1)+" · tap to reveal"));
  const back=make("span",null,"flip-back");
  back.append(make("strong",item.label),
   make("p",flipped?item.content:"Only the chosen fiction may be read."));
  inner.append(front,back);b.append(inner);row.append(b);
 }
 root.append(row);
 if(!state.scene)return;
 root.append(make("p","You explored one imagined event. Unopened possibilities remain unknown.","revealed-note"));
 if(state.response===null){
  root.append(choiceCards(routeResponses(),chooseResponse,{
   greeting:"What would you choose to do afterward?",caption:"Your response"}));
 }else{
  root.append(make("p","Your response is now part of this authored route; other outcomes are not known.","authored-notice"));
  root.append(pathSummary());
 }
}
function allPairs(){
 return current.relation?.edges??[];
}
function findEdge(a,b){
 return allPairs().find(e=>
  (e.aId===a&&e.bId===b)||(e.aId===b&&e.bId===a))??null;
}
function choosePair(id){
 if(!state||family!=="tap_pair")return;
 if(state.first===null){
  saveAnd(s=>{s.first=id;});setMessage("Now tap another idea to connect them.");return;
 }
 if(state.first===id){
  // Idempotent first-card selection. Some native keyboards synthesize
  // both an Enter keydown and an accessibility click, even when the
  // card's DOM is rerendered. A duplicate activation must never erase
  // the intended first concept. Undo provides explicit cancellation.
  setMessage("That idea is already selected. Choose another idea, or use Undo.");
  return;
 }
 const e=findEdge(state.first,id);
 if(!e){
  saveAnd(s=>{s.first=null;});
  setMessage("No source-authored link is available for those two in this example. Try another connection—there is no score.");return;
 }
 const duplicate=state.pairs.some(x=>
  [x.aId,x.bId].sort().join("|")===
  [e.aId,e.bId].sort().join("|"));
 if(duplicate){
  saveAnd(s=>{s.first=null;});setMessage("That relationship is already connected.");return;
 }
 if(state.pairs.length>=2){
  saveAnd(s=>{s.first=null;});
  setMessage("Two links are enough. Undo to explore another.");return;
 }
 saveAnd(s=>{
  s.pairs.push({aId:e.aId,bId:e.bId,relationId:e.relationId});
  s.first=null;s.touched=true;
 });
 setMessage("A source-warranted connection. There is no hidden correct-answer score.");
}
function drawConnections(){
 const board=document.querySelector(".pair-board");
 if(!board)return;
 const overlay=board.querySelector(".relation-lines");
 if(!overlay)return;
 const bounds=board.getBoundingClientRect();
 overlay.replaceChildren();overlay.setAttribute("viewBox","0 0 "+bounds.width+" "+bounds.height);
 for(const link of state.pairs){
  const a=board.querySelector('[data-card="'+link.aId+'"]');
  const b=board.querySelector('[data-card="'+link.bId+'"]');
  if(!a||!b)continue;
  const p=a.getBoundingClientRect(),q=b.getBoundingClientRect();
  const l=document.createElementNS("http://www.w3.org/2000/svg","line");
  l.setAttribute("x1",p.left+p.width/2-bounds.left);
  l.setAttribute("y1",p.top+p.height/2-bounds.top);
  l.setAttribute("x2",q.left+q.width/2-bounds.left);
  l.setAttribute("y2",q.top+q.height/2-bounds.top);
  overlay.append(l);
 }
}
function renderPair(root){
 const relation=current.relation;
 root.append(make("p","Tap any two ideas to explore a source-supported relationship. One or two connections are enough; no matching score.","instruction"));
 const board=make("div",null,"pair-board");
 for(const c of relation.cards){
  const selected=state.first===c.id,
   connected=state.pairs.some(x=>[x.aId,x.bId].includes(c.id));
  const b=button(null,()=>choosePair(c.id),"pair-card"+
   (selected?" selected":"")+(connected?" linked":""));
  b.dataset.card=c.id;b.setAttribute("aria-pressed",String(selected));
  b.setAttribute("aria-label","Concept: "+c.label+". "+c.detail+
   ". Tap to "+(selected?"cancel":"connect")+" this idea.");
  b.append(icon(c.glyph),make("strong",c.label));
  board.append(b);
 }
 const line=document.createElementNS("http://www.w3.org/2000/svg","svg");
 line.classList.add("relation-lines");line.setAttribute("aria-hidden","true");
 board.append(line);root.append(board);
 const list=make("div",null,"connected-list");
 for(const p of state.pairs){
  const e=findEdge(p.aId,p.bId);
  list.append(make("span",e?.label||p.relationId,"connected-chip"));
 }
 root.append(list);
 root.append(make("p",state.pairs.length+
  " of up to 2 connections · source-authored claims, not tested knowledge","pair-status"));
 requestAnimationFrame(drawConnections);
}
function ready(){
 if(!state)return false;
 if(family==="balance_move")return state.touched;
 if(family==="tap_pair")return state.pairs.length>=1;
 return state.start!==null&&state.scene!==null&&state.response!==null;
}
function renderGame(){
 const root=$("game");root.replaceChildren();
 if(!state||!current)return;
 if(family==="balance_move")renderBalance(root);
 else if(family==="decision_cards")renderDecision(root);
 else if(family==="flip_reveal")renderFlip(root);
 else if(family==="tap_pair")renderPair(root);
 $("undo").disabled=history.length===0;
 $("discover").disabled=!ready()||busy;
 $("feedback").textContent=message||(
  ready()?"Your imagined choice is ready for reflection. Nothing will be saved.":
   "One small gesture unlocks the philosophical reading.");
}
function canonicalInput(){
 if(family==="balance_move"){
  const a=current.allocation;
  return {amounts:[...state.amounts],budgets:[a.resourceCapacity],
   touched:state.touched,
   ...(a.lenses?.length?{focus:state.focus}:
    {repetitions:a.repetitions})};
 }
 if(family==="decision_cards")return {path:[state.start,state.scene,state.response]};
 if(family==="flip_reveal")return {actions:[
  {type:"choose_start",optionId:state.start},
  {type:"explore_authored",sceneId:state.scene},
  {type:"choose_response",optionId:state.response},
  {type:"read_retrospective"}]};
 return {pairs:state.pairs.map(x=>({...x}))};
}
function teachingCard(section,src){
 const article=make("div",null,"teaching-card");
 const identity=make("div",null,"thinker-identity"),avatar=make("div",null,"thinker-avatar");
 avatar.setAttribute("aria-hidden","true");
 avatar.innerHTML=philosopherPortrait(src.author);
 const info=make("div",null,"thinker-info");
 info.append(make("strong",src.author),make("small",src.work||"Source excerpt"));
 identity.append(avatar,info);article.append(identity);
 const quote=make("blockquote",null,"source-quote");
 const q=src.quote||"",tokens=q.split(/\s+/),highlight=tokens.slice(0,Math.min(8,tokens.length)).join(" ");
 if(highlight&&q.startsWith(highlight)){
  quote.append(make("mark",highlight),document.createTextNode(q.slice(highlight.length)));
 }else quote.textContent=q;
 article.append(quote);
 const p=make("p",null,"teaching-core"),main=section.text;
 const first=main.match(/^(.+?[.!?])(?:\s|$)/);
 if(first&&first[1].length<230){
  p.append(make("strong",first[1],"core-insight"),
   document.createTextNode(main.slice(first[1].length)));
 }else p.append(make("strong",main,"core-insight"));
 article.append(p);
 const detail=make("details",null,"source-detail");
 detail.append(make("summary","Why this interpretation? · Source & limits"),
  make("p","The source reading is provisional. This is an imagined situation, not a conclusion about your character, moral worth, or actual future."));
 if(typeof src.sourceUrl==="string"&&/^https:\/\//.test(src.sourceUrl)){
  const link=make("a","Read the original source");
  link.href=src.sourceUrl;link.target="_blank";link.rel="noopener noreferrer";
  detail.append(link);
 }
 article.append(detail);return article;
}
function displayResult(result){
 const root=$("result-sections");root.replaceChildren();
 result.sections.forEach((section,i)=>{
  const box=make("section",null,"result-section"+(i===1?" educational":""));
  box.append(make("h2",section.label));
  box.append(i===1?teachingCard(section,current):make("p",section.text));
  root.append(box);
 });
 $("result-meta").textContent=result.wordCount+
  " words · Founder-provisional source interpretation · Nothing saved";
 setScene("discover");
}
async function discover(){
 if(!ready()||busy)return;
 busy=true;$("discover").disabled=true;
 setMessage("Reading your choices through the source…");
 try{
  const r=await fetch(QA?"/api/run/qa":"/api/run",{
   method:"POST",headers:{"content-type":"application/json"},
   body:JSON.stringify({recordKey:current.key,familyId:family,input:canonicalInput()})
  });
  const payload=await r.json();
  if(!r.ok||payload.status!=="ready")
   throw new Error(payload.reason||payload.code||"Source could not warrant this output");
  if(payload.selectedFamilyId!==family||payload.sections.length!==3)
   throw new Error("Source/family or expression contract mismatch");
  displayResult(payload);
 }catch(e){
  setMessage("This reading could not be justified: "+e.message+
   ". You can revise the choice; no result was invented.");
 }finally{busy=false;$("discover").disabled=!ready();}
}
function undo(){
 if(!history.length)return;
 state=history.pop();setMessage("The previous choice is restored.");renderGame();
}
function reset(){
 if(!current||!family)return;
 state=initialState(current,family);history=[];setMessage("A fresh start. Nothing was stored.");
 renderGame();
}
function backToChoose(){
 current=null;state=null;family=null;history=[];message="";
 renderQuestions();showQAFamilies();setScene("choose");
}
$("back-to-questions").addEventListener("click",backToChoose);
$("back-to-play").addEventListener("click",()=>{
 setScene("play");setMessage("Revise any of your choices.");renderGame();
});
$("undo").addEventListener("click",undo);
$("reset").addEventListener("click",reset);
$("discover").addEventListener("click",discover);
$("another").addEventListener("click",backToChoose);
window.addEventListener("resize",()=>{if(stage==="play"&&family==="tap_pair")drawConnections();});
window.__YL_B26_QA=Object.freeze({getState:()=>JSON.parse(JSON.stringify({
  stage,sourceKey:current?.key??null,family,state,historyLength:history.length,
  qaMode:QA,gameFamilies:Object.keys(families),publicationAllowed:false,
  productionPlayable:false,accountPersistence:false
}))});
async function main(){
 try{
  const r=await fetch("/api/catalogue"+(QA?"?qa=1":""));
  if(!r.ok)throw Error("No source catalogue");
  const data=await r.json();
  if(data.families.length!==4||data.productionAllowed!==false||
     data.sources.length!==(QA?9:8))
   throw Error("The source/family contract is incompatible");
  catalogue=data.sources;
  $("mode").textContent=QA?"INDEPENDENT QA MODE · MANUAL":"A thought worth exploring";
  renderQuestions();showQAFamilies();setScene("choose");
 }catch(e){
  $("questions").textContent="Unable to load the isolated source content: "+e.message;
 }
}
main();
})();