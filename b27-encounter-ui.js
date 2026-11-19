/**
 * CZ-145 B2.7: REAL app Discover renderer, quote-first not a lab catalogue.
 * Pure markup/state helpers: existing app.js owns routing, persist(), Like,
 * My World, and the asynchronous server-side Reasoning/Emotion/Expression.
 */
import {startEncounter,chooseAction} from "./experiments/yl-cz155-director.mjs";
import {philosopherPortrait} from "./philosopher-portraits.js";
const e=s=>String(s??"").replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));
const pretty={balance_move:"Balance & Move",decision_cards:"Decision Cards",
 tap_pair:"Tap & Pair",flip_reveal:"Flip & Reveal"};
const safeInt=n=>Number.isSafeInteger(n)&&n>=0;
const arr=x=>Array.isArray(x)?x:[];
const b=(action,label,cls="",extra="")=>'<button type="button" data-b27="'+action+'" class="b27-button '+cls+'" '+extra+'>'+label+'</button>';
function starts(record){
 return [...new Map(arr(record.timeline).map(r=>[r.startId,r.startLabel])).entries()]
  .map(([id,label])=>({id,label}));
}
function scenes(record,start){
 return [...new Map(arr(record.timeline).filter(r=>r.startId===start)
  .map(r=>[r.sceneId,{id:r.sceneId,label:r.sceneLabel,
    authoredText:arr(r.authoredText).join(" ")}])).values()];
}
function responses(record,start,scene){
 return [...new Map(arr(record.timeline).filter(r=>r.startId===start&&r.sceneId===scene)
  .map(r=>[r.responseId,r.responseLabel])).entries()]
  .map(([id,label])=>({id,label}));
}
export function initializeB27Game(record){
 if(record?.director)return startEncounter(record.director);
 const family=record?.familyId;
 if(family==="balance_move"){
  const a=record.allocation;
  if(!a||!Array.isArray(a.initial)||!Number.isSafeInteger(a.resourceCapacity))return null;
  const owners=[];
  a.initial.forEach((count,i)=>{for(let j=0;j<count;j++)owners.push(i)});
  while(owners.length<a.resourceCapacity)owners.push(a.choices.length);
  return {owners,touched:false,focus:a.lenses?.[0]?.id??null};
 }
 if(family==="tap_pair")return {first:null,pairs:[],touched:false};
 if(family==="decision_cards"||family==="flip_reveal")
  return {start:null,scene:null,response:null,touched:false};
 return null;
}
const counts=(game,n)=>Array.from({length:n},(_,i)=>
 game.owners.filter(x=>x===i).length);
function gameStep(record,game){
 if(record.director)return game?.phase==="complete";
 if(record.familyId==="balance_move")return game?.touched===true;
 if(record.familyId==="tap_pair")return game?.pairs?.length>=1;
 return game?.start!==null&&game?.scene!==null&&game?.response!==null;
}
export function canFinishB27(enc){
 return Boolean(enc?.stage==="play"&&enc?.record&&gameStep(enc.record,enc.game));
}
function assignPiece(record,game,piece,target){
 const count=record.allocation.choices.length,
  max=record.allocation.resourceCapacity;
 if(!safeInt(piece)||piece>=max||!safeInt(target)||
  target>count||target===count&&record.allocation.resourceType!=="cap")
  return false;
 if(game.owners[piece]===target)return false;
 game.owners[piece]=target;game.touched=true;return true;
}
export function adjustB27Game(enc,action,value,other=null){
 if(!enc||enc.stage!=="play"||!enc.record||!enc.game)return false;
 const record=enc.record,family=record.familyId,g=structuredClone(enc.game);
 let changed=false,notice="";
 if(action==="move"&&family==="balance_move"){
  const piece=Number(value),n=record.allocation.choices.length,
   target=Number.isSafeInteger(Number(other))&&other!==null?
    Number(other):(g.owners[piece]+1)%(n+(record.allocation.resourceType==="cap"?1:0));
  changed=assignPiece(record,g,piece,target);
  notice="Token moved.";
 }
 if(action==="slider"&&family==="balance_move"){
  const next=Number(value),n=record.allocation.resourceCapacity;
  const first=counts(g,record.allocation.choices.length)[0];
  if(safeInt(next)&&next<=n&&next!==first){
   let need=Math.abs(next-first);
   for(let i=g.owners.length-1;i>=0&&need;i--){
    if(next>first&&g.owners[i]!==0){g.owners[i]=0;need--}
    else if(next<first&&g.owners[i]===0){
     g.owners[i]=record.allocation.choices.length>1?1:
       record.allocation.choices.length;need--;
    }
   }
   changed=need===0;
   if(changed)g.touched=true;
  }
  notice="Balance adjusted.";
 }
 if(action==="focus"&&family==="balance_move"&&
    record.allocation.lenses?.some(x=>x.id===value)&&g.focus!==value){
  g.focus=value;changed=true;notice="A new perspective selected.";
 }
 if(action==="pair"&&family==="tap_pair"&&record.relation?.cards.some(x=>x.id===value)){
  if(g.first===null){g.first=value;changed=true;notice="One idea selected.";}
  else if(g.first===value){
   // Native Enter+click must be idempotent (B2.6 accessibility fix).
   notice="Choose a second idea.";
  }else{
   const edge=record.relation.edges.find(x=>
    (x.aId===g.first&&x.bId===value)||(x.aId===value&&x.bId===g.first));
   if(!edge){
    g.first=null;changed=true;
    notice="These ideas have no supported connection here.";
   }else if(g.pairs.length>=2||g.pairs.some(p=>
    [p.aId,p.bId].sort().join("|")===[edge.aId,edge.bId].sort().join("|"))){
    g.first=null;changed=true;notice="Connection already made. Undo to revise.";
   }else{
    g.pairs.push({aId:edge.aId,bId:edge.bId,relationId:edge.relationId});
    g.first=null;g.touched=true;changed=true;
    notice="Connection made.";
   }
  }
 }
 if(action==="branch"&&record.director){
  if(!g.options.some(option=>option.id===value))return false;
  const next=chooseAction(record.director,g.history,{choiceId:value,expectedRevision:g.revision});
  if(next.phase!=="reconsider"&&next.phase!=="complete")return false;
  enc.history.push(enc.game);
  enc.game=next;enc.message="";enc.result=null;
  return true;
 }
 if(action==="branch"&&(family==="decision_cards"||family==="flip_reveal")){
  if(g.start===null&&starts(record).some(x=>x.id===value)){
   g.start=value;g.scene=null;g.response=null;changed=true;
  }else if(g.start!==null&&g.scene===null&&
   scenes(record,g.start).some(x=>x.id===value)){
   g.scene=value;g.response=null;changed=true;
  }else if(g.start!==null&&g.scene!==null&&g.response===null&&
   responses(record,g.start,g.scene).some(x=>x.id===value)){
   g.response=value;changed=true;
  }
  if(changed){g.touched=true;
   notice=g.scene===null?"Your direction is set.":
    g.response===null?"A new possibility appears.":
     "Your response is set.";}
 }
 if(!changed){if(notice)enc.message=notice;return false;}
 enc.history=arr(enc.history);
 enc.history.push(structuredClone(enc.game));
 enc.history=enc.history.slice(-60);
 enc.game=g;enc.result=null;enc.message=notice;
 return true;
}
export function canonicalB27Input(enc){
 const rec=enc.record,g=enc.game;
 if(!canFinishB27(enc))return null;
 if(rec.director)return structuredClone(g.canonicalInput);
 if(rec.familyId==="balance_move"){
  const alloc=rec.allocation;
  return {amounts:counts(g,alloc.choices.length),
   budgets:[alloc.resourceCapacity],touched:true,
   ...(alloc.lenses?.length?{focus:g.focus}:{repetitions:alloc.repetitions})};
 }
 if(rec.familyId==="tap_pair")return {pairs:g.pairs.map(p=>({...p}))};
 if(rec.familyId==="decision_cards")return {path:[g.start,g.scene,g.response]};
 if(rec.familyId==="flip_reveal")return {actions:[
  {type:"choose_start",optionId:g.start},
  {type:"explore_authored",sceneId:g.scene},
  {type:"choose_response",optionId:g.response},
  {type:"read_retrospective"}
 ]};
 return null;
}
function tile(options,description){
 return '<div class="b27-cards" role="group" aria-label="'+e(description)+'">'+options.map(x=>
  b("branch",'<span class="b27-card-symbol" aria-hidden="true">✧</span><strong>'+e(x.label)+'</strong>',
   "b27-choice",'data-value="'+e(x.id)+'" aria-label="'+e(x.label)+'"')).join("")+'</div>';
}
function balanceHtml(enc){
 const a=enc.record.allocation,g=enc.game,amounts=counts(g,a.choices.length),
  size=a.choices.length,total=amounts.reduce((n,v)=>n+v,0),
  free=a.resourceCapacity-total;
 const buckets=a.choices.map((x,i)=>
  '<div class="b27-bucket" role="group" aria-label="'+e(x.label)+
   ' destination, '+amounts[i]+' '+e(a.unitName)+'" '+
   'data-b27-bucket="'+i+'" data-b27-destination="'+e(x.id)+'" tabindex="0">'+
  '<div class="b27-bucket-heading"><small>'+e(x.label)+'</small>'+
  '<strong aria-label="'+amounts[i]+' pieces">'+amounts[i]+'</strong></div>'+
  '<div class="b27-pieces" role="group" aria-label="Stack of '+amounts[i]+' movable pieces">'+
   g.owners.map((owner,piece)=>owner===i?
    b("move",'<span aria-hidden="true">✦</span>',"b27-piece",
     'draggable="true" data-b27-piece="'+piece+
     '" aria-label="Move '+e(a.unitName)+' piece '+(piece+1)+
     ' from '+e(x.label)+'; drag it into another destination, or tap to transfer"'):"").join("")+
  '</div><div class="b27-bucket-drop" aria-hidden="true"><span>↘</span> DROP OR TAP</div></div>').join("");
 const slider='<label class="b27-slider-label" for="b27-slider">Adjust '+e(a.choices[0].label)+
  ' <strong>'+amounts[0]+' / '+a.resourceCapacity+' '+e(a.unitName)+'</strong></label>'+
  '<input id="b27-slider" type="range" min="0" max="'+a.resourceCapacity+
  '" step="1" value="'+amounts[0]+'" data-b27-slider aria-label="Allocate '+e(a.unitName)+' to '+e(a.choices[0].label)+'"/>';
 const lenses=arr(a.lenses);
 return '<p class="b27-instruction">Drag or tap a piece to move it.</p>'+
  '<div class="b27-resource-status" role="status"><strong>'+total+' of '+a.resourceCapacity+
  ' placed</strong><span>'+free+' unassigned</span></div>'+
  '<div class="b27-buckets '+(size===3?"b27-three":"")+'" aria-label="Destination areas for finite resources">'+
  buckets+'</div>'+
  '<details class="b27-allocation-meta b27-tuning" '+(enc.tunerOpen?'open':'')+'><summary>Fine-tune balance</summary>'+slider+'</details>'+
  (lenses.length?'<div class="b27-lenses">'+lenses.map(l=>
   b("focus",e(l.label),"b27-lens"+(g.focus===l.id?" selected":""),
    'data-value="'+e(l.id)+'" aria-pressed="'+(g.focus===l.id)+'"')).join("")+'</div>':"");
}
function pairHtml(enc){
 const r=enc.record.relation,g=enc.game;
 const links=g.pairs.map(p=>{
  const edge=r.edges.find(x=>(x.aId===p.aId&&x.bId===p.bId&&x.relationId===p.relationId));
  if(!edge)return "";
  const first=r.cards.find(c=>c.id===edge.aId),second=r.cards.find(c=>c.id===edge.bId);
  return '<div class="b27-relation-evidence"><div class="b27-link-bridge" aria-label="'+
   e((first?.label||edge.aId)+' connected with '+(second?.label||edge.bId))+'">'+
   '<span>'+e(first?.label||edge.aId)+'</span><i class="b27-bridge-trail" aria-hidden="true"></i>'+
   '<span>'+e(second?.label||edge.bId)+'</span></div>'+
   '<strong>✧ '+e(edge.label)+'</strong>'+
   '<div class="b27-relation-meaning">'+e(edge.claim)+'</div>'+
   '<details class="b27-link-explain"><summary>Why these connect</summary>'+
   '<p>This link is an illustration from the authored source, not a score or a judgment about you.</p></details></div>';
 }).join("");
 const candidates=g.first===null?[]:r.edges.filter(edge=>
  edge.aId===g.first||edge.bId===g.first);
 const allowedIds=new Set(candidates.map(edge=>
  edge.aId===g.first?edge.bId:edge.aId));
 const selected=r.cards.find(c=>c.id===g.first);
 const guide=g.pairs.length>=2?
  '<p class="b27-pair-guide" role="status">Two connections to explore.</p>':
  g.first===null?
   '<p class="b27-pair-guide">Tap an idea to begin a connection.</p>':
   '<p class="b27-pair-guide" role="status">You chose <strong>'+e(selected?.label||"an idea")+
    '</strong>. Which other idea does it illuminate?</p>';
 return guide+
  '<div class="b27-concepts" role="group" aria-label="Four large source-authorized concept cards">'+
  r.cards.map((c,i)=>{
   const eligible=g.pairs.length<2&&(g.first===null||c.id===g.first||allowedIds.has(c.id));
   return b("pair",'<span aria-hidden="true" class="b27-concept-icon">'+
    ["✧","◇","✳","✦","✺","❖"][i%6]+'</span><strong>'+e(c.label)+'</strong>',
    "b27-concept"+(g.first===c.id?" active":"")+
     (g.pairs.some(p=>[p.aId,p.bId].includes(c.id))?" connected":"")+
     (g.first!==null&&allowedIds.has(c.id)?" discoverable":""),
    'data-value="'+e(c.id)+'" aria-pressed="'+(g.first===c.id)+'" aria-label="'+e(c.label)+
     ". "+e(c.detail)+'"'+(eligible?"":' disabled aria-disabled="true"'));
  }).join("")+
  '<svg class="b27-link-lines" data-b27-link-layer aria-hidden="true"></svg></div>'+
  '<div class="b27-connections" aria-live="polite" aria-label="Source-supported connections">'+links+'</div>';
}
function selectedChoiceRecap(record,game){
 const start=starts(record).find(x=>x.id===game.start);
 return start?'<p class="b27-choice-recap" role="status"><span aria-hidden="true">✦</span>'+
  'Your move: <strong>'+e(start.label)+'</strong></p>':"";
}
function dilemmaCard(kicker,title,detail){
 return '<div class="b27-dilemma"><span class="b27-dilemma-kicker">'+e(kicker)+
  '</span><h3>'+e(title)+'</h3>'+(detail?'<p>'+e(detail)+'</p>':"")+'</div>';
}
function decisionHtml(enc){
 const g=enc.game,r=enc.record,recap=selectedChoiceRecap(r,g);
 if(g.start===null)return tile(starts(r),"Choose an opening action in this imagined situation");
 if(g.scene===null)return recap+
  dilemmaCard("THE STORY CONTINUES","An unexpected possibility","The next imagined event is not caused by your choice.")+
  tile(scenes(r,g.start),"Explore an independently authored possibility");
 if(g.response===null){
  const scene=scenes(r,g.start).find(x=>x.id===g.scene);
  return recap+dilemmaCard("A NEW POSSIBILITY",scene?.label||"Something changes",
   fullAuthoredDetail({intro:scene?.authoredText||""}))+
   tile(responses(r,g.start,g.scene),"Choose your response");
 }
 const scene=scenes(r,g.start).find(x=>x.id===g.scene);
 const response=responses(r,g.start,g.scene).find(x=>x.id===g.response);
 return '<div class="b27-path-echo" role="status"><span aria-hidden="true">✦</span>'+
  '<p>When <strong>'+e(scene?.label||"the situation")+
  '</strong> appeared, you chose <strong>'+e(response?.label||"a response")+
  '</strong>.</p></div>';
}
function flipHtml(enc){
 const g=enc.game,r=enc.record;
 if(g.start===null)return tile(starts(r),"Choose your approach to this imagined situation");
 const possible=scenes(r,g.start),recap=selectedChoiceRecap(r,g);
 const cards='<div class="b27-flips" role="group" aria-label="Face-down fictional possibility cards">'+
  possible.slice(0,3).map((item,i)=>{
   const selected=g.scene===item.id,locked=g.scene!==null&&!selected;
   // Unopened events and authored text must not enter DOM or aria.
   const back=selected?
     '<strong>'+e(item.label)+'</strong><small>'+e(fullAuthoredDetail({intro:item.authoredText}))+'</small>':
     '<strong>Unknown</strong>';
   return b("branch",
    '<span class="b27-flip-interior"><span class="b27-flip-front">'+
    '<span aria-hidden="true">✧</span><small>SEALED · '+(i+1)+'</small>'+
    '</span><span class="b27-flip-back">'+back+'</span></span>',
    "b27-flip"+(selected?" revealed b27-flip-pending":"")+(locked?" b27-flip-locked":""),
    'data-value="'+e(item.id)+'" data-b27-flip-index="'+i+'" '+
    'aria-pressed="'+selected+'" aria-label="'+e(selected?
      "Revealed fictional event: "+item.label:
      "Face-down possibility "+(i+1)+". Reveal this fictional card")+
    '"'+(locked?' disabled aria-disabled="true"':""));
  }).join("")+'</div>';
 if(g.scene===null)return recap+
  '<p class="b27-instruction">Flip a sealed card to uncover a fictional turn.</p>'+cards;
 if(g.response===null)return recap+cards+
  dilemmaCard("YOUR RESPONSE","What will you do now?",null)+
  tile(responses(r,g.start,g.scene),"Choose your response");
 const response=responses(r,g.start,g.scene).find(x=>x.id===g.response);
 return cards+'<div class="b27-path-echo" role="status"><span aria-hidden="true">✦</span>'+
  '<p>You responded: <strong>'+e(response?.label||"")+'</strong></p></div>';
}
function fullAuthoredDetail(record){
 // Do not trim a source-authored narrative to its first sentence: later
 // sentences can carry the true tension, causality boundary or limitation.
 return String(record.intro||record.humanTension||record.relation?.prompt||"").trim();
}

/* M2: an authored visual mode over the SAME derived Director state.
   Only source-authored presentation data selects it; no author-name or
   source-ID branching, new state machine or independent persistence. */
/* M2 R2: genuine four-beat Social Simulator UI. These are presentational
   projections of the SAME deterministic Director; no new event or fact.
   The independently authored event is revealed after a sent-message beat,
   and the reviewed follow-up choices remain the only participant actions. */
/* CZ-153 M2 R3: the source-authored message_thread is a real messenger
   presentation over the ONE existing Director. Draft selection, waiting and
   revisiting prior context are UI-only; canonical history changes only when
   the participant explicitly Sends or chooses one of the two warranted acts. */
function socialDirectorHtml(state,presentation,presentationBeat,selectedDraftId){
 const first=state.firstAction,second=state.secondAction,observed=state.observation;
 const beat=state.phase==="opening"?"choose":state.phase==="complete"?"complete":
  ["send","wait","reconsider"].includes(presentationBeat)?presentationBeat:"wait";
 const contact=e(presentation.correspondent||"Your friend");
 const contactBar='<header class="b27-r3-contact">'+
  '<span class="b27-r3-avatar" aria-hidden="true">◇</span>'+
  '<div><strong>'+contact+'</strong><small>FICTIONAL CONVERSATION</small></div>'+
  '</header>';
 const sent=first?
  '<section class="b27-transcript b27-social-message b27-r3-sent" aria-label="Your first sent message">'+
   '<blockquote>'+e(first.literal)+'</blockquote><small>Sent</small></section>':"";
 // Both the unanswered FIRST message and the unrelated group announcement
 // are source-authored observations. The notice is not a reaction to the sender.
 const noticeIndex=presentation?.developmentLabel&&Array.isArray(observed?.observed)&&
  observed.observed.length>2?observed.observed.length-1:-1;
 const observedStatus=noticeIndex>1?
  (presentation.firstMessageStatus||observed.observed.slice(0,noticeIndex).join(" ")):observed?.text;
 const separateNotice=noticeIndex>1?
  '<aside class="b27-r4-notice" aria-label="'+e(presentation.developmentLabel)+'">'+
   '<strong>'+e(presentation.developmentLabel)+'</strong>'+
   '<p>'+e(observed.observed[noticeIndex])+'</p></aside>':"";
 const event=observed?
  '<div class="b27-social-event b27-r3-event" id="b27-observation" role="note" aria-label="Independent story observation after the first message">'+
   '<small>AFTER THE FIRST MESSAGE</small>'+
   '<p class="b27-observation">'+e(observedStatus)+'</p>'+
   '<small>READ STATUS UNKNOWN</small>'+separateNotice+'</div>':"";
 const afterSecond=second?second.medium==="public_statement"?
  '<section class="b27-social-public b27-social-second b27-r3-group-post" role="note" aria-label="Your completed public group post">'+
   '<strong>GROUP THREAD · YOUR POST</strong>'+
   '<blockquote>'+e(second.literal)+'</blockquote>'+
   '<small>Posted in this fictional thread · Others\' reactions not observed</small></section>':
  second.medium==="message"?
  '<section class="b27-social-message b27-social-second b27-r3-sent" aria-label="Your second sent message">'+
   '<blockquote>'+e(second.literal)+'</blockquote>'+
   '<small>Sent · Delivery and reply not observed for this second message</small></section>':
  '<aside class="b27-social-private b27-r3-note" role="note" aria-label="Private follow-up, not sent">'+
   '<h3>'+e(second.medium==="private_note"?"PRIVATE NOTE · NOT SENT":"PRIVATE DECISION · NOT SENT")+'</h3>'+
   '<p>'+e(second.literal)+'</p></aside>':"";
 const drafts=state.options.map(choice=>{
  const active=choice.id===selectedDraftId;
  return b("social-pick",
   '<span class="b27-r3-select-circle" aria-hidden="true">'+(active?"✓":"")+'</span>'+
   '<span class="b27-r3-draft-copy">'+e(choice.literal)+'</span>',
   "b27-r3-draft"+(active?" is-selected":""),
   'data-value="'+e(choice.id)+'" aria-pressed="'+(active?"true":"false")+'"');
 }).join("");
 const choosing=beat==="choose"?
  '<main class="b27-r3-conversation b27-r3-choose" aria-label="Conversation context">'+
   '<p class="b27-r3-context">Yesterday you laughed at your friend’s idea in front of the group. They went quiet.</p>'+
   '<span class="b27-r3-thread-quiet" aria-hidden="true">◇</span></main>'+
  '<section class="b27-r3-composer" aria-label="Choose what to send">'+
   '<h3 class="b27-r3-composer-title">Choose your words</h3>'+
   '<div class="b27-r3-drafts" role="group" aria-label="Three possible messages">'+drafts+'</div>'+
   '<div class="b27-r3-sendbar">'+
    '<p class="b27-r3-send-caption" aria-live="polite">'+
     (selectedDraftId?"Your message is ready.":"Select a message to compose.")+'</p>'+
    b("social-send",'<span>Send</span><span aria-hidden="true">↗</span>',
     "b27-r3-send-button",selectedDraftId?'':'disabled aria-disabled="true"')+
   '</div></section>':"";
 const sending=beat==="send"?
  '<main class="b27-r3-conversation b27-r3-sending" aria-label="Message sent">'+
   sent+'<p class="b27-r3-sent-cue" role="status">Message sent</p></main>':"";
 const waiting=beat==="wait"?
  '<main class="b27-r3-conversation b27-r3-waiting" aria-label="An unanswered message">'+
   sent+'<div class="b27-r3-quiet-horizon" aria-hidden="true"><i></i></div>'+
   event+'<p class="b27-r3-quiet-line">'+e(presentation.waitCue||"The conversation is quiet.")+'</p>'+
   '<div class="b27-r3-wait-control">'+
    b("social-reflect",'<span>Consider your next step</span><span aria-hidden="true">↗</span>',
     "b27-r3-continue")+'</div>'+
   '</main>':"";
 const followUps=state.options.map(choice=>b("branch",
  '<span class="b27-r3-action-symbol" aria-hidden="true">↗</span>'+
  '<span class="b27-r3-action-copy"><strong>'+e(choice.label)+'</strong>'+
   '<span class="b27-social-choice-literal">'+e(choice.literal)+'</span></span>',
  "b27-choice b27-social-option b27-r3-followup",
  'data-value="'+e(choice.id)+'"')).join("");
 const recollect=first?
  '<details class="b27-r3-recall"><summary>Earlier in the conversation</summary>'+
   '<div class="b27-r3-recall-body">'+sent+event+'</div></details>':"";
 const reflection=beat==="reconsider"?
  '<main class="b27-r3-reflection" aria-label="Reconsideration">'+
   '<div class="b27-r3-reflection-horizon" aria-hidden="true"><i></i></div>'+
   '<section class="b27-social-reconsider">'+
    '<p class="b27-r3-reflection-eyebrow">A MOMENT TO RECONSIDER</p>'+
    '<h3 class="b27-choice-question" tabindex="-1" aria-describedby="b27-r3-reflection-cue">'+
     e(state.reconsiderationQuestion)+'</h3>'+
    '<p id="b27-r3-reflection-cue" class="b27-r3-reflection-cue">What might you do next?</p>'+
   '</section>'+
   '<div class="b27-social-options b27-message-choices b27-r3-followups" role="group" aria-label="'+e(state.reconsiderationQuestion)+'">'+
    followUps+'</div>'+recollect+
   '</main>':"";
 const complete=beat==="complete"?
  '<main class="b27-r3-conversation b27-r3-finished" aria-label="Your actions so far">'+
   sent+event+afterSecond+
   '<div class="b27-r3-ending" role="status">'+
    '<span>YOUR NEXT ACTION IS RECORDED</span>'+
    '<h3>The story does not tell you their response.</h3>'+
    '<p>'+e(presentation.completionLead||"Only the first message has an observed delivery status.")+'</p></div>'+
   '</main>':"";
 return '<div class="b27-social b27-r3-simulator" data-director-presentation="message_thread"'+
  ' data-social-beat="'+e(beat)+'">'+
  (beat==="reconsider"?"":contactBar)+choosing+sending+waiting+reflection+complete+'</div>';
}
function directedDecisionHtml(state,presentation,presentationBeat,selectedDraftId){
 if(presentation?.kind==="message_thread")return socialDirectorHtml(state,presentation,presentationBeat,selectedDraftId);
 const first=state.firstAction;
 const transcript=first?'<section class="b27-transcript"><h3>What you sent</h3><blockquote>'+e(first.literal)+'</blockquote></section>':"";
 const observation=state.observation?'<p id="b27-observation" class="b27-observation">'+e(state.observation.text)+'</p>':"";
 const followup=state.secondAction?'<section class="b27-transcript"><h3>'+e(state.secondAction.label)+'</h3><p>'+
  e(state.secondAction.literal)+'</p></section>':"";
 const cards=state.options.map(choice=>b("branch",'<strong>'+e(choice.label)+'</strong><span>'+e(choice.literal)+'</span>',
  "b27-choice",'data-value="'+e(choice.id)+'"')).join("");
 const prompt=state.phase==="opening"?"What will you send?":state.phase==="reconsider"?state.reconsiderationQuestion:"";
 return transcript+observation+followup+(prompt?'<h3 class="b27-choice-question" tabindex="-1"'+(state.observation?' aria-describedby="b27-observation"':'')+'>'+e(prompt)+'</h3>':"")+
  (cards?'<div class="b27-cards b27-message-choices" role="group" aria-label="'+e(prompt)+'">'+cards+'</div>':"");
}
function gameHtml(enc){
 if(enc.record.director)return directedDecisionHtml(enc.game,enc.record.narrativeBridge?.directorPresentation,enc.presentationBeat,enc.selectedDraftId);
 if(enc.record.familyId==="balance_move")return balanceHtml(enc);
 if(enc.record.familyId==="tap_pair")return pairHtml(enc);
 if(enc.record.familyId==="decision_cards")return decisionHtml(enc);
 return flipHtml(enc);
}
function resultHtml(enc){
 const v=enc.result?.compact;
 if(!v||v.status!=="ready"||!Array.isArray(v.sections)||v.sections.length!==3)
  return '<p>Unable to display a faithful interpretation.</p>';
 const sections=v.sections,ph=v.philosopher||{};
 const transcript=enc.result.provenance?.directorTranscript;
 // The existing saved fullMeaning already retains the reviewed action medium.
 // Read it back instead of mislabeling a private note as a sent message.
 const chosen=enc.result.fullMeaning?.meaning?.choiceAnalysis;
 const firstMedium=chosen?.initial?.medium,secondMedium=chosen?.response?.medium;
 const firstKind=firstMedium==="message"?"FIRST MESSAGE · SENT":
  firstMedium==="public_statement"?"FIRST PUBLIC STATEMENT":"FIRST ACTION";
 const secondKind=secondMedium==="message"?"SECOND MESSAGE · SENT":
  secondMedium==="private_note"?"PRIVATE NOTE · NOT SENT":
  secondMedium==="commitment"?"PRIVATE DECISION · NOT SENT":
  secondMedium==="public_statement"?"GROUP POST · COMPLETED":"FOLLOW-UP ACTION";
 const originalText=transcript?'<section class="b27-transcript b27-result-trace" aria-label="Recorded fictional actions">'+
  '<h3>'+e(firstKind)+'</h3><blockquote>'+e(transcript.firstMessage)+'</blockquote>'+
  '<div class="b27-result-external"><small>INDEPENDENT STORY EVENT · AFTER FIRST MESSAGE</small><p>'+e(transcript.event)+'</p></div>'+
  '<div class="b27-result-followup"><h3>'+e(secondKind)+'</h3><p>'+e(transcript.secondAction)+'</p>'+
   (secondMedium==="public_statement"?'<small>Posted in the fictional group thread; others\' responses and repair are unknown.</small>':
    secondMedium==="message"?'<small>Second message: sent; delivery and reply not observed.</small>':
    secondMedium==="private_note"||secondMedium==="commitment"?'<small>Private action; not sent to the recipient.</small>':"")+
   '</div>'+
  '</section>':"";
 const fullText=transcript?arr(enc.result.fullExpression?.sections).map(section=>
  '<p>'+e(section.text)+'</p>').join(""):'<p>'+e(v.deepening?.sourceQualification||"")+'</p>';
 return '<div class="b27-result" aria-label="Three-part philosophical discovery">'+
  '<p class="b27-kicker">DISCOVER THE MEANING</p>'+
  '<h2 class="b27-result-headline" tabindex="-1">A different way to see it.</h2>'+
  '<article class="b27-result-section b27-result-personal"><h3>'+e(sections[0].label)+'</h3><p>'+e(sections[0].text)+'</p></article>'+
  '<article class="b27-result-section b27-result-philosophy"><h3>'+e(sections[1].label)+'</h3><p>'+e(sections[1].text)+'</p></article>'+
  '<article class="b27-result-section b27-result-question"><h3>'+e(sections[2].label)+'</h3><p>'+e(sections[2].text)+'</p></article>'+
  originalText+'<details class="b27-deepen"><summary>Go deeper</summary>'+
   '<div class="b27-thinker"><span class="b27-portrait" aria-hidden="true">'+philosopherPortrait(ph.author||"")+'</span>'+
   '<div><strong>'+e(ph.author||"")+'</strong><small>'+e(ph.work||"")+'</small></div></div>'+
   (ph.highlight?'<div class="b27-quote-fragment">“'+e(ph.highlight)+'…”</div>':"")+
   fullText+
   '<p>Full source-grounded interpretation: '+e(v.fullWordCount||"")+
   ' words. This imagined situation does not establish facts about your life or an alternative future.</p>'+
   (ph.sourceUrl?.startsWith("https://")?'<a href="'+e(ph.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Read source text</a>':"")+
   '</details>'+
  '<div class="b27-buttons">'+(enc.record&&!transcript?b("revise","Revise","b27-secondary"):b("replay","Play again","b27-secondary"))+
   (enc.saved?b("world","View in My World","b27-primary"):
    b("save","Finish &amp; Save","b27-primary",enc.saving?"disabled":""))+
  '</div>'+
  (enc.message?'<p class="b27-save-state" role="status">'+e(enc.message)+'</p>':"")+
  '</div>';
}
export function renderB27Encounter(enc,quote){
 const start='<div class="discover-cover" data-action="close-discover"></div>'+
  '<section class="discover-sheet b27-shell" role="dialog" aria-modal="true" aria-label="YourLogos Encounter">'+
  '<div class="b27-head"><span>YOURLOGOS <i aria-hidden="true">✦</i> DISCOVER</span>'+
   '<button type="button" data-action="close-discover" class="b27-close" aria-label="Close Encounter">×</button></div>';
 if(!enc||enc.stage==="loading")
  return start+'<div class="b27-main b27-situation"><p class="b27-kicker">FINDING THE SOURCE</p><h2>From this thought, a possibility.</h2><p role="status">Finding a source-grounded experience…</p></div></section>';
 if(enc.stage==="error")
  return start+'<div class="b27-main"><h2>That thought needs another look.</h2><p role="alert">'+e(enc.message)+'</p></div></section>';
 if(enc.stage==="reading"){
  const q=enc.quote,passage=enc.reading;
  return start+'<div class="b27-main b27-reading"><blockquote>“'+e(q.text)+'”</blockquote>'+
   '<p>— '+e(q.author)+'</p><p class="b27-source-note">'+e(q.work)+'</p>'+
   (passage?.context?'<h2>In the passage</h2><p>'+e(passage.context)+'</p>':"")+
   '<h2>A question to sit with</h2><p>'+e(passage?.question||q.question)+'</p>'+
   (passage?.url?.startsWith("https://")?'<a href="'+e(passage.url)+
    '" target="_blank" rel="noopener noreferrer">Read the passage</a>':"")+
   '</div></section>';
 }
 if(enc.stage==="result")
  return start+'<div class="b27-main b27-reveal">'+resultHtml(enc)+'</div></section>';
 const r=enc.record,author=e(enc.quote?.author||quote?.[1]||"");
 const bridge=r.narrativeBridge;
 if(!bridge||!bridge.bridgeFromSource||!bridge.situationHook||!bridge.playPrompt)
  return start+'<div class="b27-main"><h2>Stay with the quotation.</h2><p>Its imagined situation needs further source review.</p></div></section>';
 const chosenScene=(r.familyId==="decision_cards"||r.familyId==="flip_reveal")&&enc.game?.start&&enc.game?.scene?
  scenes(r,enc.game.start).find(x=>x.id===enc.game.scene):null;
 const context='<details class="b27-context"><summary>About the idea</summary>'+
  '<blockquote>“'+e(enc.quote?.text||quote?.[0])+'”</blockquote>'+
  '<p>— '+author+'</p><p>'+e(r.intro||"")+'</p>'+ 
  (chosenScene?'<p><strong>About the imagined development:</strong> '+e(chosenScene.authoredText)+
  '. The hypothetical development was authored independently of your decision.</p>':"")+
  '<p>'+e(r.epistemicLimits||"This is an imagined illustration, not evidence about your actual life.")+'</p>'+
  '</details>';
 if(enc.beat==="situation")
  return start+'<div class="b27-main b27-situation">'+
   '<div class="b27-story-thread" aria-label="The philosopher’s idea as a human situation">'+
   '<div class="b27-bridge-source"><p class="b27-bridge-label">FROM THE PHILOSOPHER</p>'+
   '<h2 class="b27-bridge-idea">'+e(bridge.bridgeFromSource)+'</h2></div>'+
   '<div class="b27-bridge-link" aria-hidden="true"><span>✦</span><i></i><span>◇</span></div>'+
   '<div class="b27-bridge-scene"><h3 class="b27-bridge-label">IMAGINE THIS</h3>'+
   '<p class="b27-scenario">'+e(bridge.situationHook)+'</p></div></div>'+
   '<div class="b27-buttons">'+b("begin","Step into the moment","b27-primary")+'</div>'+
   '<p class="b27-byline">'+author+'</p>'+context+'</div></section>';
 const done=canFinishB27(enc);
 const phase=r.director?enc.game.phase:enc.game?.start===null?"opening":enc.game?.scene===null?"development":
  enc.game?.response===null?"response":"finished";
 return start+'<div class="b27-main b27-play">'+
  '<div class="b27-play-thread" aria-hidden="true"><i></i><span>✦</span><i></i></div>'+
  (r.director&&bridge.directorPresentation?.kind==="message_thread"?"":'<p class="b27-kicker">YOUR TURN <span>· '+e(pretty[r.familyId]||"ENCOUNTER")+'</span></p>')+
  (r.director&&bridge.directorPresentation?.kind==="message_thread"?"":
   '<p class="b27-play-prompt">'+e(r.director&&bridge.directorPresentation?.kind==="message_thread"?
    bridge.directorPresentation.openingPrompt:r.director?enc.game.opening:bridge.playPrompt)+'</p>')+
  '<div class="b27-game" role="region" tabindex="-1" aria-label="'+e(r.director&&bridge.directorPresentation?.kind==="message_thread"?"Fictional social encounter":"Interactive philosophical game")+'" data-b27-family="'+e(r.familyId)+'" data-b27-phase="'+e(phase)+'">'+gameHtml(enc)+'</div>'+
  '<div class="b27-buttons">'+
   (arr(enc.history).length?b("undo","Undo","b27-secondary"):"")+
   ((enc.game?.touched||enc.game?.revision>0)?b("reset","Reset","b27-secondary"):"")+
   (done?b("complete","Reveal insight","b27-primary",enc.saving?"disabled":""):"")+
  '</div>'+
  (enc.message?'<p class="b27-feedback" role="status" aria-live="polite">'+e(enc.message)+'</p>':"")+
  context+'</div></section>';
}
export function savedB27WorldHtml(entries){
 const saved=arr(entries).slice().reverse();
 return '<section class="b27-world" aria-label="Finished philosophical Encounters">'+
  '<div class="b27-world-title"><span>YOUR COMPLETED ENCOUNTERS</span><strong>'+
   saved.length+' reflections kept</strong></div>'+
  (saved.length?'<div class="b27-world-list">'+saved.map(x=>{
    const v=x.compact,ph=v?.philosopher;
    return '<article class="b27-world-item"><small>'+e(ph?.author||"Philosophical Encounter")+
     ' · '+e(x.savedAt?.slice(0,10)||"")+'</small>'+
     '<p>'+e(v?.sections?.[1]?.text||"A thought you explored")+'</p>'+
     '<div>'+b("reopen","Revisit ↗","b27-secondary",'data-key="'+e(x.saveKey)+'"')+
      b("delete","Remove","b27-secondary",'data-key="'+e(x.saveKey)+'"')+'</div></article>';
   }).join("")+'</div>':'<p class="b27-world-empty">Finish an Encounter to keep its meaning here. Liking a quote remains a separate action.</p>')+
  '<p class="b27-world-note">Stored with your existing local My World data. Account sync is only performed when you choose it in Settings.</p>'+
  '</section>';
}
