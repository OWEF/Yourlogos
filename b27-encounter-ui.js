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
  notice="Moved one shared resource; no new resources were created.";
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
  notice="Slider and pieces now reflect the same conserved choice.";
 }
 if(action==="focus"&&family==="balance_move"&&
    record.allocation.lenses?.some(x=>x.id===value)&&g.focus!==value){
  g.focus=value;changed=true;notice="A different reading of the same resource choice.";
 }
 if(action==="pair"&&family==="tap_pair"&&record.relation?.cards.some(x=>x.id===value)){
  if(g.first===null){g.first=value;changed=true;notice="Tap another idea to explore its relationship.";}
  else if(g.first===value){
   // Native Enter+click must be idempotent (B2.6 accessibility fix).
   notice="Already selected. Choose another idea or Undo.";
  }else{
   const edge=record.relation.edges.find(x=>
    (x.aId===g.first&&x.bId===value)||(x.aId===value&&x.bId===g.first));
   if(!edge){
    g.first=null;changed=true;
    notice="No source-supported connection is established for those two cards.";
   }else if(g.pairs.length>=2||g.pairs.some(p=>
    [p.aId,p.bId].sort().join("|")===[edge.aId,edge.bId].sort().join("|"))){
    g.first=null;changed=true;notice="Already connected or two links reached; Undo to revise.";
   }else{
    g.pairs.push({aId:edge.aId,bId:edge.bId,relationId:edge.relationId});
    g.first=null;g.touched=true;changed=true;
    notice="Source-supported connection made. There is no hidden matching score.";
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
   notice=g.scene===null?"Choose a fictional possibility to examine.":
    g.response===null?"The development is authored, not something you caused.":
     "You can now discover the argument behind your choices.";}
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
  size=a.choices.length;
 const buckets=a.choices.map((x,i)=>'<div class="b27-bucket" data-b27-bucket="'+i+'">'+
  '<small>'+e(x.label)+'</small><strong>'+amounts[i]+'</strong>'+
  '<div class="b27-pieces">'+g.owners.map((owner,piece)=>owner===i?
   b("move",'✦',"b27-piece",'draggable="true" data-b27-piece="'+piece+
    '" aria-label="Move one '+e(a.unitName)+' from '+e(x.label)+' to the next use"'):"").join("")+
  '</div></div>').join("");
 const slider='<label class="b27-slider-label" for="b27-slider">Adjust '+e(a.choices[0].label)+
  ' <strong>'+amounts[0]+' / '+a.resourceCapacity+' '+e(a.unitName)+'</strong></label>'+
  '<input id="b27-slider" type="range" min="0" max="'+a.resourceCapacity+
  '" step="1" value="'+amounts[0]+'" data-b27-slider aria-label="Allocate '+e(a.unitName)+' to '+e(a.choices[0].label)+'"/>';
 const lenses=arr(a.lenses);
 return '<p class="b27-instruction">Tap a piece to move it, drag between containers, or use the slider.</p>'+
  '<div class="b27-buckets '+(size===3?"b27-three":"")+'">'+buckets+'</div>'+
  '<div class="b27-allocation-meta">'+slider+
  '<p>'+amounts.reduce((s,n)=>s+n,0)+' allocated · '+a.resourceCapacity+' available'+
  (a.repetitions===null?"":" · × "+a.repetitions+" imagined repetitions")+'</p></div>'+
  (lenses.length?'<div class="b27-lenses">'+lenses.map(l=>
   b("focus",e(l.label),"b27-lens"+(g.focus===l.id?" selected":""),
    'data-value="'+e(l.id)+'" aria-pressed="'+(g.focus===l.id)+'"')).join("")+'</div>':"");
}
function pairHtml(enc){
 const r=enc.record.relation,g=enc.game;
 const links=g.pairs.map(p=>{
  const edge=r.edges.find(x=>(x.aId===p.aId&&x.bId===p.bId&&x.relationId===p.relationId));
  return '<span class="b27-pair-chip">'+e(edge?.label||"Connected")+'</span>';
 }).join("");
 // The user should never guess a hidden "right" partner. Once an idea is
 // selected, only source-warranted partner buttons remain actionable; spell
 // those possibilities out instead of rejecting arbitrary mystery matches.
 const candidates=g.first===null?[]:r.edges.filter(edge=>
  edge.aId===g.first||edge.bId===g.first);
 const allowedIds=new Set(candidates.map(edge=>
  edge.aId===g.first?edge.bId:edge.aId));
 const labels=r.cards.filter(c=>allowedIds.has(c.id)).map(c=>e(c.label));
 const guide=g.pairs.length>=2?
  '<p class="b27-pair-guide" role="status">Two connections are recorded. Choose Undo to revise them.</p>':
  g.first===null?
   '<p class="b27-pair-guide">Choose any idea first. Supported connections will be shown before your next tap.</p>':
   '<p class="b27-pair-guide" role="status">Source-supported next ideas: '+labels.join(', ')+'.</p>';
 return '<p class="b27-instruction">Connect two ideas to explore a relationship. No secret matching score.</p>'+
  guide+
  '<div class="b27-concepts" role="group" aria-label="Philosophical source-authorized concept cards">'+
  r.cards.map(c=>{
   const eligible=g.pairs.length<2&&(g.first===null||c.id===g.first||allowedIds.has(c.id));
   return b("pair",'<span aria-hidden="true" class="b27-concept-icon">✧</span><strong>'+e(c.label)+'</strong>',
    "b27-concept"+(g.first===c.id?" active":"")+
     (g.pairs.some(p=>[p.aId,p.bId].includes(c.id))?" connected":""),
    'data-value="'+e(c.id)+'" aria-pressed="'+(g.first===c.id)+'" aria-label="'+e(c.label)+
     ". "+e(c.detail)+'"'+(eligible?"":' disabled aria-disabled="true"'));
  }).join("")+'</div>'+
  '<div class="b27-connections" aria-live="polite">'+links+'</div>';
}
function selectedChoiceRecap(record,game){
 const start=starts(record).find(x=>x.id===game.start);
 return start?'<p class="b27-choice-recap">Your initial choice: <strong>'+e(start.label)+'</strong></p>':"";
}
function decisionHtml(enc){
 const g=enc.game,r=enc.record;
 if(g.start===null)return '<p class="b27-instruction">One decision before you know how the story will develop.</p>'+
  tile(starts(r),"Choose your first action");
 const recap=selectedChoiceRecap(r,g);
 if(g.scene===null)return recap+'<p class="b27-instruction">Explore one invented later possibility. This is not a prediction or a consequence you caused.</p>'+
  tile(scenes(r,g.start),"Explore one fictional development");
 if(g.response===null){
  const scene=scenes(r,g.start).find(x=>x.id===g.scene);
  return recap+'<p class="b27-authored">Author-written possibility: '+e(scene?.authoredText||scene?.label)+
   '</p>'+tile(responses(r,g.start,g.scene),"Choose your own response");
 }
 const happened=scenes(r,g.start).find(x=>x.id===g.scene)?.label;
 const response=responses(r,g.start,g.scene).find(x=>x.id===g.response)?.label;
 return recap+'<p class="b27-authored">Imagined development: '+e(happened)+
  '. Your response: '+e(response)+'. The unchosen future remains unknown.</p>';
}
function flipHtml(enc){
 const g=enc.game,r=enc.record;
 if(g.start===null)return '<p class="b27-instruction">What would you choose before seeing any later possibility?</p>'+
  tile(starts(r),"Choose first");
 const possible=scenes(r,g.start),recap=selectedChoiceRecap(r,g);
 const cards='<div class="b27-flips" role="group" aria-label="Two fictional possibilities">'+possible.map((item,i)=>{
  const selected=g.scene===item.id;
  return b("branch",'<span class="b27-flip-interior"><span class="b27-flip-front">✧<small>Possibility '+(i+1)+'</small></span>'+
   '<span class="b27-flip-back"><strong>'+e(item.label)+'</strong><small>'+
    e(selected?item.authoredText:"An unopened possibility")+'</small></span></span>',
   "b27-flip"+(selected?" revealed":""),
   'data-value="'+e(item.id)+'" aria-label="'+e(selected?"Revealed authored possibility: ":"Flip an authored possibility: ")+e(item.label)+'" '+
    (g.scene!==null&&!selected?"disabled":"")
  );
 }).join("")+'</div>';
 if(g.scene===null)return recap+'<p class="b27-instruction">Flip a card to explore a fictional possibility—not your actual future.</p>'+cards;
 if(g.response===null)return recap+cards+'<p class="b27-authored">This was written as a possible development. You did not cause it.</p>'+
  tile(responses(r,g.start,g.scene),"Choose what you would do after this fictional event");
 const response=responses(r,g.start,g.scene).find(x=>x.id===g.response)?.label;
 return recap+cards+'<p class="b27-authored">Your response: '+e(response)+
  '. No unchosen outcome has been established.</p>';
}
function gameHtml(enc){
 if(enc.record.familyId==="balance_move")return balanceHtml(enc);
 if(enc.record.familyId==="tap_pair")return pairHtml(enc);
 if(enc.record.familyId==="decision_cards")return decisionHtml(enc);
 return flipHtml(enc);
}
function resultHtml(enc){
 const v=enc.result?.compact;
 if(!v||v.status!=="ready")return '<p>Unable to display a faithful interpretation.</p>';
 const sections=v.sections;
 return '<div class="b27-result" aria-label="Three-part philosophical discovery">'+
  '<p class="b27-kicker">DISCOVER · REMEMBER</p>'+
  '<article class="b27-result-section"><h3>'+e(sections[0].label)+'</h3><p>'+e(sections[0].text)+'</p></article>'+
  '<article class="b27-result-section b27-education"><h3>'+e(sections[1].label)+'</h3>'+
   '<div class="b27-thinker"><span class="b27-portrait" aria-hidden="true">'+philosopherPortrait(v.philosopher.author)+'</span>'+
   '<div><strong>'+e(v.philosopher.author)+'</strong><small>'+e(v.philosopher.work)+'</small></div></div>'+
   '<div class="b27-quote-fragment" aria-label="An authentic opening phrase from the quotation">“'+e(v.philosopher.highlight)+'…”</div>'+
   '<p>'+e(sections[1].text)+'</p>'+
   '<details class="b27-deepen"><summary>Go deeper · source and qualifications</summary>'+
   '<p>'+e(v.deepening.sourceQualification)+'</p>'+
   '<p>Full source-grounded interpretation: '+v.fullWordCount+' words. This example is fictional, not evidence about your actual character or future.</p>'+
   (v.philosopher.sourceUrl?.startsWith("https://")?'<a href="'+e(v.philosopher.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Read source text</a>':"")+
   '</details></article>'+
  '<article class="b27-result-section"><h3>'+e(sections[2].label)+'</h3><p>'+e(sections[2].text)+'</p></article>'+
  '<div class="b27-buttons">'+b("revise","← Revise choice","b27-secondary")+
   (enc.saved?b("world","View in My World ↗","b27-primary"):
    b("save","Finish &amp; Save ↗","b27-primary",enc.saving?"disabled":""))+
   '</div>'+
   '<p class="b27-save-state" role="status">'+e(enc.message||"This is not saved until you choose Finish & Save.")+'</p>'+
  '</div>';
}
export function renderB27Encounter(enc,quote){
 const start='<div class="discover-cover" data-action="close-discover"></div>'+
  '<section class="discover-sheet b27-shell" role="dialog" aria-modal="true" aria-label="YourLogos Encounter">'+
  '<div class="b27-head"><span>YOURLOGOS · ENCOUNTER</span>'+
   '<button type="button" data-action="close-discover" class="b27-close" aria-label="Close Encounter">×</button></div>';
 if(!enc||enc.stage==="loading")
  return start+'<div class="b27-main"><p class="b27-kicker">FINDING THE SOURCE</p><h2>From this thought, a possibility.</h2><p role="status">Checking which philosophical interpretation the source can support…</p></div></section>';
 if(enc.stage==="error")
  return start+'<div class="b27-main"><h2>That thought needs another look.</h2><p role="alert">'+e(enc.message)+'</p></div></section>';
 if(enc.stage==="reading")
  return start+'<div class="b27-main"><p class="b27-kicker">A READING FIRST · NO GAME FIT</p>'+
   '<h2>Stay with the thought.</h2><blockquote>“'+e(quote?.[0]||enc.quote?.text)+'”</blockquote>'+
   '<p>— '+e(quote?.[1]||enc.quote?.author)+'</p><p>'+e(enc.quote?.question||"What does this idea ask us to examine?")+'</p>'+
   '<p class="b27-source-note">'+e(enc.reason||"This quotation does not yet have a source-warranted mini-game.")+'</p>'+
   '<p class="b27-caveat">The quotation remains in the Library; no philosophical result was fabricated.</p></div></section>';
 const r=enc.record;
 if(enc.stage==="result")return start+'<div class="b27-main">'+resultHtml(enc)+'</div></section>';
 return start+'<div class="b27-main b27-play"><p class="b27-kicker">'+e(pretty[r.familyId]||"ENCOUNTER")+' · PLAY</p>'+
  '<div class="b27-source"><blockquote>“'+e(enc.quote?.text||quote?.[0])+'”</blockquote>'+
  '<span>— '+e(enc.quote?.author||quote?.[1])+'</span></div>'+
  '<h2>'+e(r.title||"Try a different angle")+'</h2>'+
  '<p class="b27-scenario">'+e(r.intro||r.relation?.prompt||"An imagined dilemma")+'</p>'+
  '<p class="b27-limits">A fictional illustration, not a fact about your real life.</p>'+
  '<div class="b27-game" data-b27-family="'+e(r.familyId)+'">'+gameHtml(enc)+'</div>'+
  '<div class="b27-buttons">'+b("undo","Undo","b27-secondary",arr(enc.history).length?"":"disabled")+
   b("reset","Reset","b27-secondary")+
   b("complete","Discover ↗","b27-primary",canFinishB27(enc)&&!enc.saving?"":"disabled")+
  '</div><p class="b27-feedback" role="status" aria-live="polite">'+e(enc.message||"Your choice is yours to revise.")+'</p>'+
  '</div></section>';
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
