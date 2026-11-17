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

export function createB27AppRuntime({
 quotes,getData,persist,readback,render,navigateWorld,notify
}){
 let sheet=null,epoch=0, touchDrag=null, suppressPieceClicksUntil=0;
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
   quoteWork:q[3],b27DevelopmentOnly:id>=B27_INHERITED_COUNT};
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
  const center=id=>{
   const btn=[...board.querySelectorAll('[data-b27="pair"]')].find(x=>x.dataset.value===id);
   if(!btn)return null;
   const c=btn.getBoundingClientRect();
   return {x:c.left+c.width/2-rect.left,y:c.top+c.height/2-rect.top};
  };
  const add=(tag,attrs)=>{
   const node=document.createElementNS("http://www.w3.org/2000/svg",tag);
   Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,String(v)));
   svg.append(node);
  };
  sheet.game?.pairs?.forEach((pair,i)=>{
   const a=center(pair.aId),b=center(pair.bId);
   if(!a||!b)return;
   const cx=(a.x+b.x)/2+(i? -9:9),cy=(a.y+b.y)/2-9;
   add("path",{d:"M "+a.x+" "+a.y+" Q "+cx+" "+cy+" "+b.x+" "+b.y,
    pathLength:1,"data-b27-link":pair.relationId});
   [a,b].forEach(p=>add("circle",{cx:p.x,cy:p.y,r:5}));
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
     reason:json.reason,capabilityGap:json.capabilityGap};
   }else if(res.ok&&json.status==="ready"){
    const game=initializeB27Game(json.record);
    if(!game)throw Error("No valid source-authorized input contract was found");
    sheet={...sheet,stage:"play",quote:json.quote,game,history:[],
     record:json.record,sourceVersionHash:json.sourceVersionHash,
     quoteFingerprint:json.quoteFingerprint};
   }else throw Error(json.reason||"Source admission failed");
  }catch(error){
   if(!same(token))return true;
   sheet={...sheet,stage:"error",message:"The selected quotation cannot be routed: "+
    String(error?.message||error)};
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
  if(kind==="revise"){
   if(!sheet.game)return false;
   epoch++;sheet.stage="play";sheet.saved=false;
   sheet.message="You can revise what you chose.";draw();return true;
  }
  if(kind==="undo"){
   if(!sheet.history.length)return false;
   epoch++;sheet.game=sheet.history.pop();sheet.result=null;
   sheet.stage="play";sheet.message="Your previous choice is restored.";
   draw();return true;
  }
  if(kind==="reset"){
   if(!sheet.record)return false;
   epoch++;sheet.game=initializeB27Game(sheet.record);sheet.history=[];
   sheet.result=null;sheet.saved=false;sheet.stage="play";
   sheet.message="A fresh start. Nothing was saved.";draw();return true;
  }
  if(["move","pair","branch","focus"].includes(kind)){
   const value=kind==="move"?el.dataset.b27Piece:el.dataset.value;
   const changed=adjustB27Game(sheet,kind,value);
   if(changed)epoch++;draw();return changed;
  }
  if(kind==="complete"){
   if(!canFinishB27(sheet)||sheet.saving)return false;
   const input=canonicalB27Input(sheet),q=qRequest(sheet.quoteId);
   if(!input||!q)return false;
   const token=++epoch;
   sheet.saving=true;sheet.message="Checking the meaning against the original source…";
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
    sheet.message="Not saved yet; Finish & Save will keep this Encounter in My World.";
   }catch(err){
    if(same(token))sheet.message="No unsupported insight was produced: "+
     String(err?.message||err);
   }finally{
    if(same(token)){sheet.saving=false;draw();}
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
  document.addEventListener("dragstart",evt=>{
   const piece=evt.target.closest?.("[data-b27-piece]");
   if(sheet?.stage!=="play"||!piece||!evt.dataTransfer)return;
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
   if(changed)epoch++;draw();
  });
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
   stage:sheet?.stage??null,quoteId:sheet?.quoteId??null,
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
