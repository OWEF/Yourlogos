/**
 * CZ-145 B2.7: REAL app Discover renderer, quote-first not a lab catalogue.
 * Pure markup/state helpers: existing app.js owns routing, persist(), Like,
 * My World, and the asynchronous server-side Reasoning/Emotion/Expression.
 */
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
 return '<p class="b27-instruction">Move the tokens. Every choice uses the same limited supply.</p>'+
  '<div class="b27-resource-status" role="status"><strong>'+total+' of '+a.resourceCapacity+
  ' placed</strong><span>'+free+' unassigned</span></div>'+
  '<div class="b27-buckets '+(size===3?"b27-three":"")+'" aria-label="Destination areas for finite resources">'+
  buckets+'</div>'+
  '<details class="b27-allocation-meta b27-tuning"><summary>Fine-tune balance</summary>'+slider+'</details>'+
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
   '<strong>✧ '+e(edge.label)+'</strong><details class="b27-link-explain"><summary>Why these connect</summary><p>'+e(edge.claim)+'</p></details></div>';
 }).join("");
 const candidates=g.first===null?[]:r.edges.filter(edge=>
  edge.aId===g.first||edge.bId===g.first);
 const allowedIds=new Set(candidates.map(edge=>
  edge.aId===g.first?edge.bId:edge.aId));
 const labels=r.cards.filter(c=>allowedIds.has(c.id)).map(c=>e(c.label));
 const guide=g.pairs.length>=2?
  '<p class="b27-pair-guide" role="status">Two connections made.</p>':
  g.first===null?
   '<p class="b27-pair-guide">Tap two ideas to connect them.</p>':
   '<p class="b27-pair-guide" role="status">Choose the connected idea.</p>';
 return guide+
  '<div class="b27-concepts" role="group" aria-label="Four large source-authorized concept cards">'+
  r.cards.map((c,i)=>{
   const eligible=g.pairs.length<2&&(g.first===null||c.id===g.first||allowedIds.has(c.id));
   return b("pair",'<span aria-hidden="true" class="b27-concept-icon">'+
    ["✧","◇","✳","✦","✺","❖"][i%6]+'</span><strong>'+e(c.label)+'</strong>',
    "b27-concept"+(g.first===c.id?" active":"")+
     (g.pairs.some(p=>[p.aId,p.bId].includes(c.id))?" connected":""),
    'data-value="'+e(c.id)+'" aria-pressed="'+(g.first===c.id)+'" aria-label="'+e(c.label)+
     ". "+e(c.detail)+'"'+(eligible?"":' disabled aria-disabled="true"'));
  }).join("")+
  '<svg class="b27-link-lines" data-b27-link-layer aria-hidden="true"></svg></div>'+
  '<div class="b27-connections" aria-live="polite" aria-label="Source-supported connections">'+links+'</div>';
}
function selectedChoiceRecap(record,game){
 const start=starts(record).find(x=>x.id===game.start);
 return start?'<p class="b27-choice-recap">Your initial choice: <strong>'+e(start.label)+'</strong></p>':"";
}
function dilemmaCard(kicker,title,detail){
 return '<div class="b27-dilemma"><span class="b27-dilemma-kicker">'+e(kicker)+
  '</span><h3>'+e(title)+'</h3>'+(detail?'<p>'+e(detail)+'</p>':"")+'</div>';
}
function decisionHtml(enc){
 const g=enc.game,r=enc.record,recap=selectedChoiceRecap(r,g);
 if(g.start===null)return dilemmaCard("YOUR MOVE",r.title||"Which path would you take?","")+
  tile(starts(r),"Choose your opening decision");
 if(g.scene===null)return recap+
  dilemmaCard("AN UNEXPECTED TURN","What might happen next?","")+
  tile(scenes(r,g.start),"Explore one independently authored hypothetical development");
 if(g.response===null){
  const scene=scenes(r,g.start).find(x=>x.id===g.scene);
  return recap+dilemmaCard("A NEW POSSIBILITY",scene?.label||"Something changes",
   conciseDilemma({intro:scene?.authoredText||""}))+
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
 if(g.start===null)return dilemmaCard("BEFORE THE UNKNOWN",
  r.title||"What can you choose?",null)+
  tile(starts(r),"Choose one opening action");
 const possible=scenes(r,g.start),recap=selectedChoiceRecap(r,g);
 const cards='<div class="b27-flips" role="group" aria-label="Face-down fictional possibility cards">'+
  possible.slice(0,3).map((item,i)=>{
   const selected=g.scene===item.id,locked=g.scene!==null&&!selected;
   // Unopened events and authored text must not enter DOM or aria.
   const back=selected?
     '<strong>'+e(item.label)+'</strong><small>'+e(conciseDilemma({intro:item.authoredText}))+'</small>':
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
  '<p class="b27-instruction">Pick a sealed card to reveal what changes.</p>'+cards;
 if(g.response===null)return recap+cards+
  dilemmaCard("YOUR RESPONSE","What will you do now?",null)+
  tile(responses(r,g.start,g.scene),"Choose your response");
 const response=responses(r,g.start,g.scene).find(x=>x.id===g.response);
 return cards+'<div class="b27-path-echo" role="status"><span aria-hidden="true">✦</span>'+
  '<p>You responded: <strong>'+e(response?.label||"")+'</strong></p></div>';
}
function conciseDilemma(record){
 // One legible source-authored sentence. Full claims remain in About the idea.
 const text=String(record.humanTension||record.intro||record.relation?.prompt||
  "An imagined dilemma").trim();
 const sentence=(text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[text])[0].trim();
 if(sentence.length<=172)return sentence;
 const cut=sentence.slice(0,169).replace(/\s+\S*$/,"").trim();
 return cut+"…";
}
function gameHtml(enc){
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
 return '<div class="b27-result" aria-label="Three-part philosophical discovery">'+
  '<p class="b27-kicker">03 / DISCOVER</p>'+
  '<h2 class="b27-result-headline" tabindex="-1">A different way to see it.</h2>'+
  '<article class="b27-result-section b27-result-personal"><h3>'+e(sections[0].label)+'</h3><p>'+e(sections[0].text)+'</p></article>'+
  '<article class="b27-result-section b27-result-philosophy"><h3>'+e(sections[1].label)+'</h3><p>'+e(sections[1].text)+'</p></article>'+
  '<article class="b27-result-section b27-result-question"><h3>'+e(sections[2].label)+'</h3><p>'+e(sections[2].text)+'</p></article>'+
  '<details class="b27-deepen"><summary>Go deeper</summary>'+
   '<div class="b27-thinker"><span class="b27-portrait" aria-hidden="true">'+philosopherPortrait(ph.author||"")+'</span>'+
   '<div><strong>'+e(ph.author||"")+'</strong><small>'+e(ph.work||"")+'</small></div></div>'+
   (ph.highlight?'<div class="b27-quote-fragment">“'+e(ph.highlight)+'…”</div>':"")+
   '<p>'+e(v.deepening?.sourceQualification||"")+'</p>'+
   '<p>Full source-grounded interpretation: '+e(v.fullWordCount||"")+
   ' words. This imagined situation does not establish facts about your life or an alternative future.</p>'+
   (ph.sourceUrl?.startsWith("https://")?'<a href="'+e(ph.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Read source text</a>':"")+
   '</details>'+
  '<div class="b27-buttons">'+b("revise","Revise","b27-secondary")+
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
 if(enc.stage==="reading")
  return start+'<div class="b27-main"><p class="b27-kicker">ABOUT THIS THOUGHT</p>'+
   '<h2>Stay with the idea.</h2><blockquote>“'+e(quote?.[0]||enc.quote?.text)+'”</blockquote>'+
   '<p>— '+e(quote?.[1]||enc.quote?.author)+'</p><p>'+e(enc.quote?.question||"What does this idea ask us to examine?")+'</p>'+
   '<p class="b27-source-note">'+e(enc.reason||"This quotation does not yet have a source-warranted mini-game.")+'</p>'+
   '<p class="b27-caveat">No philosophical result was invented.</p></div></section>';
 if(enc.stage==="result")
  return start+'<div class="b27-main b27-reveal">'+resultHtml(enc)+'</div></section>';
 const r=enc.record,author=e(enc.quote?.author||quote?.[1]||"");
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
   '<p class="b27-kicker">01 / SITUATION</p>'+
   '<h2>'+e(r.title||"A choice worth considering")+'</h2>'+
   '<p class="b27-scenario">'+e(conciseDilemma(r))+'</p>'+
   '<div class="b27-situation-symbol" aria-hidden="true"><span>✦</span><i></i><span>◇</span></div>'+
   '<div class="b27-buttons">'+b("begin","Begin","b27-primary")+'</div>'+
   '<p class="b27-byline">'+author+'</p>'+context+'</div></section>';
 const done=canFinishB27(enc);
 return start+'<div class="b27-main b27-play">'+
  '<p class="b27-kicker">02 / PLAY <span>· '+e(pretty[r.familyId]||"ENCOUNTER")+'</span></p>'+
  (r.familyId==="balance_move"||r.familyId==="tap_pair"?
   '<h2 class="b27-play-title">'+e(r.title||"Make your move")+'</h2>':"")+
  '<div class="b27-game" role="region" tabindex="-1" aria-label="Interactive philosophical game" data-b27-family="'+e(r.familyId)+'">'+gameHtml(enc)+'</div>'+
  '<div class="b27-buttons">'+
   (arr(enc.history).length?b("undo","Undo","b27-secondary"):"")+
   (enc.game?.touched?b("reset","Reset","b27-secondary"):"")+
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
