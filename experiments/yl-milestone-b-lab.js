/** CZ-134 Milestone B0: UI mechanics only, with clearly synthetic fixtures.
 * NO admitted philosophical source, no selector/engine call, no storage, no account.
 * The accepted six-peer selector currently rejects both games for all sources.
 */
"use strict";
(() => {
 const $=id=>document.getElementById(id);
 const fixtures=Object.freeze({
  balance:{left:"Clarity",right:"Experimentation",
   question:"Where would you place the emphasis?",
   note:"An imaginary exhibition-planning choice. These six symbols measure only a fictional editing preference, not moral worth."},
  future:{question:"Which fictional direction will you explore?",
   routes:{
    join:{label:"Join the project",short:"Participate",
     steps:["You choose to join a fictional community project.",
      "The timetable changes after you commit.",
      "New information appears in the imagined project.",
      "Only after this imagined route can you interpret the experience. The unchosen route remains unknown."]},
    wait:{label:"Wait and observe",short:"Wait",
     steps:["You choose to wait before joining.",
      "The group's plans shift while you observe.",
      "Another invitation is offered in the imagined story.",
      "Looking back may clarify this fictional route. It does not reveal what participating would have brought."]}
   }}
 });
 const initial=mode=>({mode,balance:3,balanceTouched:false,
  route:null,step:0,maxSeen:0,finished:false});
 let state=initial("balance");
 let history=[];
 function node(tag,content,cls){
  const n=document.createElement(tag);
  if(content!==null&&content!==undefined)n.textContent=String(content);
  if(cls)n.className=cls;
  return n;
 }
 function button(text,cls,fn,aria){
  const b=node("button",text,cls);b.type="button";b.addEventListener("click",fn);
  if(aria)b.setAttribute("aria-label",aria);
  return b;
 }
 function saveUndo(){
  history.push(structuredClone(state));
  if(history.length>70)history.shift();
 }
 function update(fn){
  saveUndo();fn();
  state.finished=false;
  render();
 }
 function setMode(mode){
  if(!["balance","future"].includes(mode)||mode===state.mode)return;
  state=initial(mode);history=[];render();
 }
 function headline(title,description,symbol){
  const box=$("question-card");box.replaceChildren();
  box.append(node("span",symbol,"symbol"),node("h2",title),node("p",description));
 }
 function balanceAdjust(next){
  if(!Number.isSafeInteger(next)||next<0||next>6)return;
  update(()=>{state.balance=next;state.balanceTouched=true;});
 }
 function renderBalance(root){
  const f=fixtures.balance;
  headline(f.question,"Move the balance toward one fictional priority or the other.","⚖");
  const panel=node("div",null,"balance-visual");
  const left=node("div",null,"weight"),right=node("div",null,"weight");
  left.append(node("strong",state.balance),node("small",f.left));
  right.append(node("strong",6-state.balance),node("small",f.right));
  const pivot=node("div",null,"beam"),line=node("div",null,"beam-line");
  line.style.setProperty("--tilt",(state.balance-3)*7+"deg");
  pivot.append(line);panel.append(left,pivot,right);root.append(panel);
  const row=node("div",null,"slider-row");
  const less=button("←","","", "Move toward "+f.right);
  less.onclick=()=>balanceAdjust(Math.max(0,state.balance-1));less.disabled=state.balance===0;
  const input=node("input");input.type="range";input.min="0";input.max="6";
  input.step="1";input.value=String(state.balance);input.id="balance-slider";
  input.setAttribute("aria-label","Symbolic emphasis from "+f.right+" to "+f.left);
  input.addEventListener("change",e=>balanceAdjust(Number(e.target.value)));
  const more=button("→","",()=>balanceAdjust(Math.min(6,state.balance+1)),
   "Move toward "+f.left);
  more.disabled=state.balance===6;
  row.append(less,input,more);root.append(row);
  root.append(node("p",f.note,"micro"));
  $("step-label").textContent="01 / 01";
  $("stage-label").textContent="VALUE BALANCE · SYNTHETIC UI FIXTURE";
  $("status").textContent=state.finished?
   "Design preview complete. No philosophical claim or account save occurred.":
   state.balanceTouched?"The fictional emphasis changed. You can undo or revise it.":
   "Try moving the balance once to explore this control.";
  $("continue").disabled=!state.balanceTouched||state.finished;
 }
 function revealStep(next){
  if(!Number.isSafeInteger(next)||next<0||next>3||!state.route)return;
  if(next>state.maxSeen+1)return; // cannot skip locked authored scenes
  update(()=>{
   state.step=next;
   state.maxSeen=Math.max(state.maxSeen,next);
  });
 }
 function chooseRoute(id){
  if(!Object.hasOwn(fixtures.future.routes,id))return;
  update(()=>{state.route=id;state.step=0;state.maxSeen=0;});
 }
 function renderFuture(root){
  const f=fixtures.future;
  $("stage-label").textContent="FUTURE REVEAL · SYNTHETIC UI FIXTURE";
  if(!state.route){
   headline(f.question,"Choose a direction. Later scenes are authored possibilities, never real forecasts.","↗");
   const pair=node("div",null,"pair");
   for(const id of ["join","wait"]){
    const opt=f.routes[id];
    const b=button("", "option",()=>chooseRoute(id),
     "Explore fictional decision: "+opt.label);
    b.append(node("strong",opt.label),node("small","You choose this starting action"));
    pair.append(b);
   }
   root.append(pair);
   $("step-label").textContent="00 / 04";
   $("status").textContent="Choose which fictional decision path to reveal.";
   $("continue").disabled=true;
   return;
  }
  const fRoute=f.routes[state.route],at=state.step;
  headline(at===0?fRoute.steps[0]:"An imagined development",
   at===0?"This is your chosen starting action.":
    fRoute.steps[at],"◈");
  $("step-label").textContent=String(at+1).padStart(2,"0")+" / 04";
  const note=node("p",at===0?
   "You decide the starting action. The later events are authored possibilities, not events you cause to happen.":
   "The timeline reveals a fictional possibility. Moving backward does not change your original decision.","timeline-note");
  root.append(note);
  const caption=node("p","Explore one authored stage at a time · "+fRoute.short,"future-caption");
  root.append(caption);
  const slider=node("input");slider.type="range";slider.min="0";
  slider.max=String(Math.min(3,state.maxSeen+1));slider.step="1";
  slider.value=String(at);slider.id="future-slider";
  slider.setAttribute("aria-label","Scrub fictional timeline, step "+(at+1)+" of four");
  slider.addEventListener("change",e=>revealStep(Number(e.target.value)));
  root.append(slider);
  const row=node("div",null,"timeline-tools");
  const prev=button("← Earlier","",()=>revealStep(state.step-1),
    "View earlier fictional stage");
  prev.disabled=at===0;
  const next=button("Later →","",()=>revealStep(state.step+1),
    "Reveal next authored hypothetical stage");
  next.disabled=at===3;
  row.append(prev,next);root.append(row);
  root.append(button("Change initial decision","secondary",()=>update(()=>{
   state.route=null;state.step=0;state.maxSeen=0;
  }),"Choose a different starting action"));
  $("continue").disabled=at!==3||state.finished;
  $("status").textContent=state.finished?
   "Design preview complete. No real future was inferred or stored.":
   "Stage "+(at+1)+" visible. The alternative path is not known in this scenario.";
 }
 function render(){
  const balance=state.mode==="balance";
  $("mode-balance").setAttribute("aria-pressed",String(balance));
  $("mode-future").setAttribute("aria-pressed",String(!balance));
  const root=$("controls");root.replaceChildren();
  if(balance)renderBalance(root);else renderFuture(root);
  $("preview-complete").hidden=!state.finished;
  if(state.finished)$("preview-complete").textContent=
   "You completed a source-neutral interface test. No philosophical insight was inferred, nothing was saved, and these games are NOT admitted by the source selector yet.";
  $("back").disabled=history.length===0&&!state.finished;
  $("continue").textContent="Complete preview";
 }
 $("mode-balance").addEventListener("click",()=>setMode("balance"));
 $("mode-future").addEventListener("click",()=>setMode("future"));
 $("back").addEventListener("click",()=>{
  if(state.finished){state.finished=false;render();return;}
  if(!history.length)return;
  state=history.pop();render();
 });
 $("continue").addEventListener("click",()=>{
  if(state.finished||(state.mode==="balance"?!state.balanceTouched:
    !state.route||state.step!==3))return;
  state.finished=true;render();
 });
 // A read-only QA surface; no setters, no persistence and no source/engine authority.
 window.__YL_B_LAB_QA=Object.freeze({
  getState:()=>JSON.parse(JSON.stringify({...state,historyLength:history.length})),
  capabilities:Object.freeze({sourceEligible:false,philosophicalInference:false,
   selectionAllowed:false,persistenceEnabled:false,publicationAllowed:false})
 });
 render();
})();