/**
 * CZ-145 B2.7 app-owned Encounter controller.
 * Does not own a shadow store; existing app.js remains the owner of data,
 * persist, quote Like, navigation, export, account sync, delete and readback.
 */
import {
 renderB27Encounter,savedB27WorldHtml,initializeB27Game,adjustB27Game,
 canonicalB27Input,canFinishB27
} from "./b27-encounter-ui.js";
import {
 saveFinishedEncounter,deleteSavedEncounter,validatedSavedEncounters
} from "./b27-saved-encounters.js";
import {B27_INHERITED_COUNT} from "./experiments/yl-b27-quote-ledger.mjs";
import {derivePath,replayEncounter} from "./experiments/yl-cz155-director.mjs";

export function createB27AppRuntime({
 quotes,getData,persist,readback,render,navigateWorld,notify
}){
 let sheet=null,epoch=0, touchDrag=null, suppressPieceClicksUntil=0;
 // An unfinished fictional Director scene is a tab-scoped UI draft, never a
 // saved Encounter, personal profile or source of philosophical authority.
 const DRAFT_KEY="yourlogos-b27-director-draft/1";
 const clearDraft=()=>{try{sessionStorage.removeItem(DRAFT_KEY)}catch{}};
 const resumeDraft=(quoteId,record,sourceVersionHash)=>{
  if(!record?.director)return null;
  try{
   const raw=sessionStorage.getItem(DRAFT_KEY);
   if(!raw)return null;
   const draft=JSON.parse(raw);
   if(draft?.quoteId!==quoteId)return null;
   if(draft.schema!=="b27-session-draft/1"||
      draft.sourceVersionHash!==sourceVersionHash){
    clearDraft();return null;
   }
   // Server supplies the exact reviewed scenario on every open. A browser
   // draft can contribute only a replayable action history, not new facts.
   const game=replayEncounter(record.director,draft.history);
   if(!["reconsider","complete"].includes(game.phase)){
    clearDraft();return null;
   }
   const ids=game.history.events.filter(event=>event.type==="choose").map(event=>event.id);
   const history=ids.map((_,i)=>derivePath(record.director,ids.slice(0,i)));
   return {game,history};
  }catch{clearDraft();return null}
 };
 const persistDraft=()=>{
  if(!sheet?.record?.director)return;
  try{
   if(sheet.stage!=="play"||!sheet.game||sheet.game.revision===0){
    clearDraft();return;
   }
   sessionStorage.setItem(DRAFT_KEY,JSON.stringify({
    schema:"b27-session-draft/1",quoteId:sheet.quoteId,
    sourceVersionHash:sheet.sourceVersionHash,history:sheet.game.history
   }));
  }catch{}
 };
 // Some emulated/mobile browsers report window.innerWidth including the
 // scrollbar gutter. Position the app-owned sheet against the actual visible
 // document box instead of centering it in that wider layout viewport.
 const syncViewport=()=>document.documentElement.style.setProperty(
  "--yl-b27-client-width",document.documentElement.clientWidth+"px");
 const enabled=true;
 const qRequest=id=>{
  const q=quotes()[id];
  if(!q)return null;
  return {quoteId:id,quoteText:q[0],quoteAuthor:q[1],
   quoteWork:q[3],b27DevelopmentOnly:id>=B27_INHERITED_COUNT,
   ...(new URLSearchParams(location.search).get("cz155")==="1"?{cz155Preview:true}:{})};
 };
 const same=token=>token===epoch;
 const draw=()=>{
  render();
  requestAnimationFrame(()=>{
   drawSourceLinks();
   document.querySelectorAll(".b27-flip-pending").forEach(el=>el.classList.add("b27-flipped"));
  });
 };
 function drawSourceLinks(){
  if(sheet?.stage!=="play"||sheet.record?.familyId!=="tap_pair")return;
  const board=document.querySelector(".b27-concepts");
  const svg=board?.querySelector("[data-b27-link-layer]");
  if(!board||!svg)return;
  const rect=board.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  svg.replaceChildren();svg.setAttribute("viewBox","0 0 "+rect.width+" "+rect.height);
  const frame=id=>{
   const btn=[...board.querySelectorAll('[data-b27="pair"]')].find(x=>x.dataset.value===id);
   if(!btn)return null;
   const c=btn.getBoundingClientRect();
   return {x:c.left+c.width/2-rect.left,y:c.top+c.height/2-rect.top,
    left:c.left-rect.left,right:c.right-rect.left,top:c.top-rect.top,
    bottom:c.bottom-rect.top,width:c.width,height:c.height};
  };
  // Keep the line clear of card text by entering through the perimeter.
  // Curved arcs extend into the negative space even between adjacent cards.
  const endpoint=(a,b)=>{
   const dx=b.x-a.x,dy=b.y-a.y;
   if(Math.abs(dy)<a.height*.5)
    return {x:dx>=0?a.right-12:a.left+12,y:a.top+23};
   if(Math.abs(dx)<a.width*.55)
    return {x:a.x,y:dy>=0?a.bottom-10:a.top+10};
   return {x:dx>=0?a.right-12:a.left+12,
    y:dy>=0?a.bottom-15:a.top+15};
  };
  const add=(tag,attrs)=>{
   const node=document.createElementNS("http://www.w3.org/2000/svg",tag);
   Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,String(v)));
   svg.append(node);
  };
  sheet.game?.pairs?.forEach((pair,index)=>{
   const ar=frame(pair.aId),br=frame(pair.bId);
   if(!ar||!br)return;
   const a=endpoint(ar,br),b=endpoint(br,ar);
   const sameRow=Math.abs(ar.y-br.y)<ar.height*.5;
   const sameColumn=Math.abs(ar.x-br.x)<ar.width*.55;
   const cx=sameColumn?Math.max(a.x,b.x)+42:
    (a.x+b.x)/2+(sameRow?0:(index?-14:14));
   const cy=sameRow?Math.min(a.y,b.y)-56:(a.y+b.y)/2;
   const d="M "+a.x+" "+a.y+" Q "+cx+" "+cy+" "+b.x+" "+b.y;
   add("path",{d,pathLength:1,"data-b27-link":pair.relationId,
    "data-b27-link-from":pair.aId,"data-b27-link-to":pair.bId});
   [a,b].forEach(p=>add("circle",{cx:p.x,cy:p.y,r:7}));
  });
 }

 async function open(id){
  const q=qRequest(id);
  if(!q)return false;
  const token=++epoch;
  syncViewport();
  sheet={
   stage:"loading",quoteId:id,
   quote:{text:q.quoteText,author:q.quoteAuthor,
    work:q.quoteWork,question:quotes()[id][4]},
   record:null,game:null,history:[],result:null,saved:false,
   saving:false,message:"",sourceVersionHash:null
  };
  draw();
  try{
   const res=await fetch("/api/b27/start",{
    method:"POST",headers:{"content-type":"application/json"},
    body:JSON.stringify(q)
   }),json=await res.json();
   if(!same(token)||sheet?.quoteId!==id)return true;
   if(json.status==="no_fit"){
    sheet={...sheet,stage:"reading",quote:json.quote,
     reading:json.reading};
   }else if(res.ok&&json.status==="ready"){
    const game=initializeB27Game(json.record);
    if(!game)throw Error("No valid source-authorized input contract was found");
    const restored=resumeDraft(id,json.record,json.sourceVersionHash);
    sheet={...sheet,stage:"play",beat:restored?"play":"situation",quote:json.quote,
     game:restored?.game??game,history:restored?.history??[],
     record:json.record,sourceVersionHash:json.sourceVersionHash,
     quoteFingerprint:json.quoteFingerprint,
     // Presentation-only beat; never part of the versioned replay ledger.
     presentationBeat:restored?.game.phase==="reconsider"?"wait":
      restored?.game.phase??"choose",
     selectedDraftId:null,
     message:restored?"Your earlier choices are restored on this device.":""};
   }else throw Error(json.reason||"Source admission failed");
  }catch{
   if(!same(token))return true;
   sheet={...sheet,stage:"error",message:"Close this page and open Discover again to return to this quotation."};
  }
  draw();return true;
 }
 function close(){
  epoch++;sheet=null;
  document.documentElement.style.removeProperty("--yl-b27-client-width");
 }
 function html(quote){return renderB27Encounter(sheet,quote);}
 function worldHtml(saved){return savedB27WorldHtml(saved);}
 async function action(el){
  const kind=el.dataset.b27;
  if(kind==="reopen"){
   const stored=validatedSavedEncounters(readback()?.savedEncounters)
    .find(x=>x.saveKey===el.dataset.key);
   if(!stored||!quotes()[stored.quoteId]){
    notify?.("This saved Encounter could not be verified.");return false;
   }
   const q=quotes()[stored.quoteId];epoch++;
   syncViewport();
   sheet={stage:"result",quoteId:stored.quoteId,
    quote:{text:q[0],author:q[1],work:q[3],question:q[4]},
    sourceVersionHash:stored.sourceVersionHash,
    record:null,game:null,history:[],saved:true,saving:false,
    message:"This completed Encounter was read back from My World.",
    result:{...stored,compact:stored.compact,fullExpression:stored.fullExpression}};
   draw();return "open_saved";
  }
  if(kind==="delete"){
   const output=deleteSavedEncounter(getData(),el.dataset.key,{persist,readback});
   if(output.status!=="deleted"){
    notify?.("Couldn't confirm removal. Your existing data remains.");
    return false;
   }
   draw();notify?.("Encounter removed from My World");return true;
  }
  if(!sheet)return false;
  if(kind==="world"){close();navigateWorld();return true;}
  if(kind==="begin"){
   if(sheet.stage!=="play"||sheet.beat!=="situation")return false;
   sheet.beat="play";sheet.message="";epoch++;draw();
   // One-shot interaction motion is applied only to this freshly drawn Play
   // subtree. The full shell, backdrop, and quoted homepage never animate.
   // Subsequent decisions rebuild Play without this class.
   document.querySelector(".b27-play")?.classList.add("b27-entering");
   requestAnimationFrame(()=>{
    const game=document.querySelector(".b27-game");
    // A fast keyboard user may already have focused a new game control.
    // Never steal focus away from that live control during this first frame.
    const active=document.activeElement;
    if(!game||(active&&active!==document.body&&active.closest?.(".b27-shell")))return;
    game.focus({preventScroll:true});
   });
   return true;
  }
  if(kind==="replay"){return open(sheet.quoteId);}
  if(kind==="revise"){
   if(!sheet.game)return false;
   epoch++;sheet.stage="play";sheet.beat="play";sheet.saved=false;
   sheet.message="You can revise what you chose.";draw();return true;
  }
  if(kind==="undo"){
   if(!sheet.history.length)return false;
   epoch++;sheet.game=sheet.history.pop();sheet.result=null;
   sheet.presentationBeat=sheet.game.phase==="opening"?"choose":
    sheet.game.phase==="reconsider"?"reconsider":sheet.game.phase;
   sheet.selectedDraftId=null;
   sheet.stage="play";sheet.beat="play";sheet.message="Your previous choice is restored.";
   persistDraft();draw();return true;
  }
  if(kind==="reset"){
   if(!sheet.record)return false;
   epoch++;sheet.game=initializeB27Game(sheet.record);sheet.history=[];
   sheet.result=null;sheet.saved=false;sheet.stage="play";sheet.beat="play";sheet.tunerOpen=false;
   sheet.presentationBeat="choose";sheet.selectedDraftId=null;
   sheet.message="A fresh start. Nothing was saved.";persistDraft();draw();return true;
  }
  // UI draft selection never touches the reviewed Director ledger.
  // Its lifetime is only the current open messenger composer.
  const social=!!sheet?.record?.director&&
   sheet.record.narrativeBridge?.directorPresentation?.kind==="message_thread";
  if(kind==="social-pick"){
   if(!social||sheet.stage!=="play"||sheet.game.phase!=="opening"||
      sheet.presentationBeat!=="choose"||
      !sheet.game.options.some(option=>option.id===el.dataset.value))return false;
   sheet.selectedDraftId=el.dataset.value;
   draw();
   requestAnimationFrame(()=>{
    document.querySelector('[data-b27="social-pick"][data-value="'+
     sheet?.selectedDraftId+'"]')?.focus({preventScroll:true});
   });
   return true;
  }
  if(kind==="social-reflect"){
   if(!social||sheet.stage!=="play"||sheet.game.phase!=="reconsider"||
      sheet.presentationBeat!=="wait")return false;
   epoch++;sheet.presentationBeat="reconsider";draw();
   requestAnimationFrame(()=>{
    const game=document.querySelector(".b27-game"),
     question=game?.querySelector(".b27-social-reconsider .b27-choice-question"),
     firstOption=game?.querySelector(".b27-social-options .b27-choice"),
     shell=document.querySelector(".b27-shell"),header=shell?.querySelector(".b27-head");
    if(!question||!firstOption||!shell)return;
    question.focus({preventScroll:true});
    const q=question.getBoundingClientRect(),first=firstOption.getBoundingClientRect(),
     box=shell.getBoundingClientRect(),h=header?.getBoundingClientRect();
    const needed=Math.max(0,first.bottom-(box.bottom-12));
    const allowed=Math.max(0,q.top-(h?.bottom??box.top)-10);
    if(needed>0&&allowed>0)shell.scrollTop+=Math.min(needed,allowed);
   });
   return true;
  }
  if(["move","pair","branch","focus","social-send"].includes(kind)){
   const isSend=social&&kind==="social-send";
   if(isSend&&(sheet.stage!=="play"||sheet.game.phase!=="opening"||
       sheet.presentationBeat!=="choose"||!sheet.selectedDraftId||
       !sheet.game.options.some(option=>option.id===sheet.selectedDraftId)))
    return false;
   // A source-authored second choice must not be actionable during a visual
   // send/wait beat even if another handler attempts to call it directly.
   if(social&&kind==="branch"&&sheet.game.phase==="reconsider"&&
      sheet.presentationBeat!=="reconsider")return false;
   const value=kind==="move"?el.dataset.b27Piece:
    isSend?sheet.selectedDraftId:el.dataset.value;
   const changed=adjustB27Game(sheet,isSend?"branch":kind,value);
   const justSent=changed&&isSend&&sheet.game.phase==="reconsider";
   if(changed){
    epoch++;
    if(social){
     sheet.presentationBeat=justSent?"send":sheet.game.phase==="complete"?
      "complete":sheet.game.phase==="opening"?"choose":"reconsider";
     if(justSent)sheet.selectedDraftId=null;
    }
    persistDraft();
   }
   draw();
   if(changed&&!justSent)
    document.querySelector(".b27-game")?.classList.add("b27-action-settling");
   if(justSent){
    const token=epoch;
    // The send transition only acknowledges the participant's action.
    // It then reveals the independently authored event; the WAIT remains
    // indefinitely until social-reflect is explicitly activated.
    // No staged timeout can create a Director event or trigger reflection.
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(()=>{
     if(!same(token)||sheet?.game?.phase!=="reconsider"||
        sheet?.presentationBeat!=="send")return;
     sheet.presentationBeat="wait";draw();
     requestAnimationFrame(()=>document.querySelector('[data-b27="social-reflect"]')
      ?.focus({preventScroll:true}));
    },reduced?0:320);
    return true;
   }
   if(changed)requestAnimationFrame(()=>{
    const game=document.querySelector(".b27-game");
    const active=document.activeElement;
    if(game&&active&&active!==document.body&&active!==document.documentElement&&
       game.contains(active))return;
    let next=null;
    if(kind==="pair"||kind==="focus")
     next=[...document.querySelectorAll('[data-b27="'+kind+'"]')]
      .find(x=>x.dataset.value===value&&!x.disabled);
    else if(kind==="move")
     next=document.querySelector('[data-b27-piece="'+value+'"]');
    (next||game)?.focus({preventScroll:true});
   });
   return changed;
  }
  if(kind==="complete"){
   if(!canFinishB27(sheet)||sheet.saving)return false;
   const input=canonicalB27Input(sheet),q=qRequest(sheet.quoteId);
   if(!input||!q)return false;
   const token=++epoch;
   sheet.saving=true;sheet.message="Opening your reflection…";
   draw();
   try{
    const res=await fetch("/api/b27/run",{method:"POST",
     headers:{"content-type":"application/json"},
     body:JSON.stringify({...q,sourceVersionHash:sheet.sourceVersionHash,
      canonicalInput:input})
    });
    const result=await res.json();
    if(!same(token))return false;
    if(!res.ok||result.status!=="ready"||
       result.quoteId!==sheet.quoteId||
       result.sourceVersionHash!==sheet.sourceVersionHash)
     throw Error(result.reason||"Source or canonical choice did not validate");
    sheet.result=result;sheet.stage="result";sheet.saved=false;
    clearDraft();
    sheet.message="Not saved yet; Finish & Save will keep this Encounter in My World.";
   }catch{
    if(same(token))sheet.message="This reflection could not be opened. You can try again or return to the quotation.";
   }finally{
    if(same(token)){sheet.saving=false;draw();
     if(sheet.stage==="result")requestAnimationFrame(()=>
      document.querySelector(".b27-result-headline")?.focus({preventScroll:true}));
    }
   }
   return true;
  }
  if(kind==="save"){
   if(sheet.stage!=="result"||!sheet.result||sheet.saved||sheet.saving)
    return false;
   const output=saveFinishedEncounter(getData(),sheet.result,{persist,readback});
   sheet.saved=output.status==="saved";
   sheet.message=sheet.saved?
    "Saved and verified from the existing My World storage.":
    "Save unconfirmed: "+(output.reason||"Readback failed");
   draw();return sheet.saved;
  }
  return false;
 }
 function install(){
  window.addEventListener("resize",()=>{if(sheet)syncViewport()});
  // iOS Safari does not offer reliable HTML native drag/drop. Pointer
  // gestures use the exact same conserved canonical "move" operation.
  const clearZones=()=>document.querySelectorAll(".b27-bucket.b27-over")
   .forEach(x=>x.classList.remove("b27-over"));
  const cleanupTouch=()=>{touchDrag?.ghost?.remove();clearZones();touchDrag=null;};
  document.addEventListener("pointerdown",evt=>{
   if(sheet?.stage!=="play"||sheet.record?.familyId!=="balance_move"||
    evt.pointerType==="mouse")return;
   const piece=evt.target.closest?.("[data-b27-piece]");
   if(!piece)return;
   touchDrag={pointerId:evt.pointerId,piece:piece.dataset.b27Piece,
    x:evt.clientX,y:evt.clientY,dragged:false,ghost:null};
   piece.setPointerCapture?.(evt.pointerId);
  });
  document.addEventListener("pointermove",evt=>{
   if(!touchDrag||evt.pointerId!==touchDrag.pointerId)return;
   if(!touchDrag.dragged&&Math.hypot(evt.clientX-touchDrag.x,evt.clientY-touchDrag.y)<7)return;
   evt.preventDefault();touchDrag.dragged=true;
   if(!touchDrag.ghost){
    const ghost=document.createElement("div");
    ghost.className="b27-touch-ghost";ghost.textContent="✦";
    ghost.setAttribute("aria-hidden","true");
    document.body.append(ghost);touchDrag.ghost=ghost;
   }
   touchDrag.ghost.style.left=evt.clientX+"px";
   touchDrag.ghost.style.top=evt.clientY+"px";
   clearZones();
   document.elementFromPoint(evt.clientX,evt.clientY)
    ?.closest?.("[data-b27-bucket]")?.classList.add("b27-over");
  },{passive:false});
  document.addEventListener("pointerup",evt=>{
   if(!touchDrag||evt.pointerId!==touchDrag.pointerId)return;
   const prior=touchDrag,wasDragged=prior.dragged;
   const target=wasDragged?document.elementFromPoint(evt.clientX,evt.clientY)
    ?.closest?.("[data-b27-bucket]"):null;
   if(wasDragged){evt.preventDefault();suppressPieceClicksUntil=performance.now()+450;}
   cleanupTouch();
   if(!wasDragged)return;
   if(!target){
    sheet.message="Release the piece over a destination area.";draw();return;
   }
   const id=target.dataset.b27Bucket;
   const changed=adjustB27Game(sheet,"move",prior.piece,id);
   if(changed){epoch++;draw();
    requestAnimationFrame(()=>document.querySelector('[data-b27-bucket="'+id+'"]')?.classList.add("b27-snap"));
   }
  });
  document.addEventListener("pointercancel",evt=>{
   if(touchDrag?.pointerId===evt.pointerId)cleanupTouch();
  });
  document.addEventListener("click",evt=>{
   if(performance.now()>suppressPieceClicksUntil)return;
   if(evt.target.closest?.("[data-b27-piece]")||
     evt.target.closest?.("[data-b27-bucket]")){
    evt.preventDefault();evt.stopImmediatePropagation();
   }
  },true);
  // Accessible deliberate destination: keyboard-focus a piece and press
  // 1/2/3. Enter or Space remains the simpler one-step alternate control.
  document.addEventListener("keydown",evt=>{
   if(sheet?.stage!=="play"||sheet.record?.familyId!=="balance_move")return;
   const piece=evt.target.closest?.("[data-b27-piece]"),dest=Number(evt.key)-1;
   if(!piece||!Number.isInteger(dest)||dest<0||
    dest>=sheet.record.allocation.choices.length)return;
   evt.preventDefault();
   if(adjustB27Game(sheet,"move",piece.dataset.b27Piece,dest)){epoch++;draw();}
  });
  document.addEventListener("dragstart",evt=>{
   const piece=evt.target.closest?.("[data-b27-piece]");
   if(sheet?.stage!=="play"||!piece||!evt.dataTransfer)return;
   evt.dataTransfer.effectAllowed="move";
   evt.dataTransfer.setData("text/plain",piece.dataset.b27Piece);
  });
  document.addEventListener("dragover",evt=>{
   if(sheet?.stage==="play"&&evt.target.closest?.("[data-b27-bucket]"))
    evt.preventDefault();
  });
  document.addEventListener("drop",evt=>{
   if(sheet?.stage!=="play")return;
   const bucket=evt.target.closest?.("[data-b27-bucket]");
   if(!bucket||!evt.dataTransfer)return;
   evt.preventDefault();
   const piece=Number(evt.dataTransfer.getData("text/plain"));
   if(!Number.isSafeInteger(piece))return;
   const changed=adjustB27Game(sheet,"move",String(piece),
    bucket.dataset.b27Bucket);
   clearZones();
   if(changed){epoch++;draw();
    requestAnimationFrame(()=>document.querySelector('[data-b27-bucket="'+bucket.dataset.b27Bucket+'"]')
     ?.classList.add("b27-snap"));
   }
  });
  document.addEventListener("dragend",clearZones);
  document.addEventListener("click",evt=>{
   const summary=evt.target.closest?.(".b27-tuning > summary");
   if(sheet?.stage==="play"&&summary)sheet.tunerOpen=!summary.parentElement.open;
  },true);
  window.addEventListener("resize",()=>requestAnimationFrame(drawSourceLinks));
  document.addEventListener("change",evt=>{
   if(sheet?.stage!=="play")return;
   const slider=evt.target.closest?.("[data-b27-slider]");
   if(!slider)return;
   const active=slider===document.activeElement;
   const changed=adjustB27Game(sheet,"slider",slider.value);
   if(changed){epoch++;draw();
     if(active)document.querySelector("[data-b27-slider]")?.focus({preventScroll:true});
   }
  });
 }
 install();
 const api={open,close,html,worldHtml,action,
  getState:()=>({
   stage:sheet?.stage??null,beat:sheet?.beat??null,quoteId:sheet?.quoteId??null,
   familyId:sheet?.record?.familyId??sheet?.result?.selectedFamilyId??null,
   game:sheet?.game?structuredClone(sheet.game):null,
   saved:sheet?.saved??false,historyLength:sheet?.history?.length??0,
   sourceVersionHash:sheet?.sourceVersionHash??null,
   fullMeaningWordCount:sheet?.result?.fullExpression?.wordCount??null,
   visibleWordCount:sheet?.result?.compact?.visibleWordCount??null
  })
 };
 return Object.freeze(api);
}
