// Editorially scoped, optional drag-to-substitute examples.
// Word cards replace roles in a NEW paraphrase, never alter the original quote.
// Each quote/lens may choose its own roles and sentence shape.
export const PILOT_DRAG_EXERCISES = Object.freeze({
  "0": [
    {
      "parts": [
        "A reason like ",
        {
          "slot": "why"
        },
        " can help someone endure ",
        {
          "slot": "how"
        },
        "."
      ],
      "slots": [
        {
          "key": "why",
          "hint": "WHY · REASON",
          "word": "bills to pay"
        },
        {
          "key": "how",
          "hint": "HOW · DIFFICULTY",
          "word": "a difficult job"
        }
      ],
      "connection": "The bills are the “why”; the difficult job is the “how.”"
    },
    {
      "parts": [
        {
          "slot": "why"
        },
        " can make ",
        {
          "slot": "how"
        },
        " easier to bear."
      ],
      "slots": [
        {
          "key": "why",
          "hint": "WHY · HOPE",
          "word": "hope for change"
        },
        {
          "key": "how",
          "hint": "HOW · PRESENT",
          "word": "today’s frustrating work"
        }
      ],
      "connection": "Hope for change becomes a “why” for enduring the present “how.”"
    },
    {
      "parts": [
        "Even when ",
        {
          "slot": "why"
        },
        " becomes unclear, someone may keep enduring ",
        {
          "slot": "how"
        },
        "."
      ],
      "slots": [
        {
          "key": "why",
          "hint": "WHY · UNCLEAR",
          "word": "the reason for staying"
        },
        {
          "key": "how",
          "hint": "HOW · DIFFICULTY",
          "word": "the same difficult job"
        }
      ],
      "connection": "The quote invites us to ask what happens when the “why” fades."
    }
  ],
  "31": [
    {
      "parts": [
        "To understand ",
        {
          "slot": "part"
        },
        ", we should consider ",
        {
          "slot": "whole"
        },
        "."
      ],
      "slots": [
        {
          "key": "part",
          "hint": "THE PART",
          "word": "Alex’s silence"
        },
        {
          "key": "whole",
          "hint": "THE WIDER CONTEXT",
          "word": "what happened before"
        }
      ],
      "connection": "What happened before can change what one silent meeting means."
    },
    {
      "parts": [
        "Understanding ",
        {
          "slot": "part"
        },
        " also involves ",
        {
          "slot": "whole"
        },
        "."
      ],
      "slots": [
        {
          "key": "part",
          "hint": "THE EVENT",
          "word": "Alex’s silence"
        },
        {
          "key": "whole",
          "hint": "ITS RELATIONS",
          "word": "how the team was affected"
        }
      ],
      "connection": "The larger situation includes both an action and its consequences."
    },
    {
      "parts": [
        "Seeing ",
        {
          "slot": "part"
        },
        " alone does not reveal ",
        {
          "slot": "whole"
        },
        "."
      ],
      "slots": [
        {
          "key": "part",
          "hint": "WHAT WE SAW",
          "word": "a quiet meeting"
        },
        {
          "key": "whole",
          "hint": "WHAT WE DON'T KNOW",
          "word": "what Alex's silence means"
        }
      ],
      "connection": "An isolated fact is not a sufficient account of the whole."
    }
  ],
  "70": [
    {
      "parts": [
        "Trusting ",
        {
          "slot": "received"
        },
        " isn't the same as using ",
        {
          "slot": "own"
        },
        "."
      ],
      "slots": [
        {
          "key": "received",
          "hint": "RECEIVED AUTHORITY",
          "word": "a reliable colleague"
        },
        {
          "key": "own",
          "hint": "INDEPENDENT JUDGMENT",
          "word": "your own judgment"
        }
      ],
      "connection": "Reasonable trust still differs from surrendering one's judgment."
    },
    {
      "parts": [
        "Instead of repeating ",
        {
          "slot": "received"
        },
        ", examine ",
        {
          "slot": "own"
        },
        "."
      ],
      "slots": [
        {
          "key": "received",
          "hint": "WHAT YOU HEARD",
          "word": "a confident claim"
        },
        {
          "key": "own",
          "hint": "WHAT YOU EXAMINE",
          "word": "the evidence"
        }
      ],
      "connection": "Sapere aude invites you to ask for reasons rather than merely repeat a conclusion."
    },
    {
      "parts": [
        "When you hear ",
        {
          "slot": "received"
        },
        ", ask for ",
        {
          "slot": "own"
        },
        "."
      ],
      "slots": [
        {
          "key": "received",
          "hint": "SOMEBODY'S CLAIM",
          "word": "another person's claim"
        },
        {
          "key": "own",
          "hint": "INQUIRY",
          "word": "their reasons"
        }
      ],
      "connection": "Thinking for yourself can begin with a question rather than an isolated answer."
    }
  ]
});

const safe=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const matches=(record,phrase)=>record&&Array.isArray(record.parts)&&record.parts.some(p=>typeof p!=="string"&&p.slot===phrase);
export function validateDragExercise(record){
 const errors=[];
 if(!record||!Array.isArray(record.parts)||!Array.isArray(record.slots))return ["Missing exercise"];
 const keys=record.slots.map(s=>s?.key);
 if(keys.length!==2||new Set(keys).size!==2||record.slots.some(s=>!s?.key||!s?.word||!s?.hint))
   errors.push("Exactly two distinct labeled word cards required");
 if(!keys.every(k=>matches(record,k)))errors.push("Each role must have a corresponding blank");
 if(record.parts.filter(p=>typeof p!=="string").length!==2)errors.push("Exactly two blanks expected");
 if(!record.connection)errors.push("Quote-specific connection required");
 return errors;
}
export function getDragExercise(quoteId,lensIndex){
 if(!Number.isInteger(quoteId)||!Number.isInteger(lensIndex)||lensIndex<0||lensIndex>=3)return null;
 return PILOT_DRAG_EXERCISES[quoteId]?.[lensIndex]||null;
}
export function quoteDragExerciseHtml(quoteId,lensIndex){
 const record=getDragExercise(quoteId,lensIndex);
 if(!record||validateDragExercise(record).length)return "";
 const banks=[...record.slots].reverse();
 const sentence=record.parts.map(part=>typeof part==="string"
   ?safe(part):'<span class="yl-drag-slot" data-exercise-slot="'+safe(part.slot)+'" tabindex="0" role="button" aria-label="'+safe(record.slots.find(s=>s.key===part.slot)?.hint||part.slot)+'; empty; choose a card" aria-live="polite"><span class="yl-drag-placeholder">Drop here</span></span>').join("");
 return '<section class="yl-quote-drag" data-yl-quote-drag data-quote-id="'+quoteId+'" data-lens-index="'+lensIndex+'" aria-label="Try the idea in everyday words">'+
  '<p class="yl-drag-eyebrow">TRY THE IDEA YOURSELF</p>'+
  '<p class="yl-drag-instruction">Move each word card into the sentence. <span>Drag or tap to place.</span></p>'+
  '<div class="yl-drag-sentence">'+sentence+'</div>'+
  '<div class="yl-drag-bank" aria-label="Movable word cards">'+banks.map(s=>
  '<button type="button" class="yl-drag-tile" data-exercise-card="'+safe(s.key)+'" aria-label="Pick up '+safe(s.word)+'">'+safe(s.word)+'</button>').join("")+'</div>'+
  '<p class="yl-drag-status" aria-live="polite">Choose a card, then a blank.</p>'+
  '<div class="yl-drag-complete" hidden><p class="yl-drag-connection"><strong>Back to the quote</strong> '+safe(record.connection)+'</p></div>'+
  '<button type="button" class="yl-drag-reset" data-exercise-reset>Start again</button>'+
  '</section>';
}
function update(root){
 const record=getDragExercise(Number(root.dataset.quoteId),Number(root.dataset.lensIndex));
 if(!record)return;
 const selected=root.dataset.selected||"";
 const done=record.slots.every(({key})=>root.dataset["answer"+key]===key);
 root.querySelectorAll("[data-exercise-card]").forEach(b=>{
  const key=b.dataset.exerciseCard;
  b.hidden=record.slots.some(({key:k})=>root.dataset["answer"+k]===key);
  b.classList.toggle("is-selected",selected===key);
  b.setAttribute("aria-pressed",String(selected===key));
 });
 root.querySelectorAll("[data-exercise-slot]").forEach(slot=>{
  const key=slot.dataset.exerciseSlot,answer=root.dataset["answer"+key]||"";
  const word=record.slots.find(s=>s.key===answer)?.word;
  slot.classList.toggle("is-filled",!!word);
  slot.innerHTML=word?'<span>'+safe(word)+'</span>':'<span class="yl-drag-placeholder">Drop here</span>';
  slot.setAttribute("aria-label",word?word+"; tap to remove":record.slots.find(s=>s.key===key).hint+"; empty; select a card");
 });
 const status=root.querySelector(".yl-drag-status");
 if(status)status.textContent=done?"The example is complete. Here's how it connects to the original idea.":selected?"Now choose a blank for your card.":"Drag a card to a blank, or tap a card and then a blank.";
 const complete=root.querySelector(".yl-drag-complete");
 if(complete)complete.hidden=!done;
}
function put(root,slotKey,cardKey){
 const record=getDragExercise(Number(root.dataset.quoteId),Number(root.dataset.lensIndex));
 if(!record||!record.slots.some(x=>x.key===slotKey)||!record.slots.some(x=>x.key===cardKey))return;
 for(const s of record.slots)if(root.dataset["answer"+s.key]===cardKey)delete root.dataset["answer"+s.key];
 root.dataset["answer"+slotKey]=cardKey;
 root.dataset.selected="";
 update(root);
}
export function installQuoteDragExercise(doc=typeof document!=="undefined"?document:null){
 if(!doc||doc.__ylQuoteDragInstalled)return;
 doc.__ylQuoteDragInstalled=true;
 let drag=null;
 doc.addEventListener("pointerdown",event=>{
  const tile=event.target.closest?.("[data-exercise-card]");
  const slot=event.target.closest?.("[data-exercise-slot]");
  const root=(tile||slot)?.closest("[data-yl-quote-drag]");
  if(!root||event.button!==0)return;
  const cardKey=tile?.dataset.exerciseCard||(slot&&root.dataset["answer"+slot.dataset.exerciseSlot]);
  if(!cardKey)return;
  drag={id:event.pointerId,root,key:cardKey,x:event.clientX,y:event.clientY,active:false,ghost:null};
 });
 doc.addEventListener("pointermove",event=>{
  if(!drag||drag.id!==event.pointerId)return;
  if(!drag.active&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<8)return;
  if(!drag.active){
   drag.active=true;
   const ghost=doc.createElement("div");
   ghost.className="yl-drag-ghost";
   const record=getDragExercise(Number(drag.root.dataset.quoteId),Number(drag.root.dataset.lensIndex));
   ghost.textContent=record?.slots.find(s=>s.key===drag.key)?.word||"";
   doc.body.appendChild(ghost);drag.ghost=ghost;
  }
  if(event.cancelable)event.preventDefault();
  if(drag.ghost){drag.ghost.style.left=event.clientX+"px";drag.ghost.style.top=event.clientY+"px";}
 });
 const finish=event=>{
  if(!drag||drag.id!==event.pointerId)return;
  const d=drag;drag=null;
  d.ghost?.remove();
  if(!d.active)return;
  const target=doc.elementFromPoint(event.clientX,event.clientY)?.closest?.("[data-exercise-slot]");
  if(target&&target.closest("[data-yl-quote-drag]")===d.root)put(d.root,target.dataset.exerciseSlot,d.key);
  else if(doc.elementFromPoint(event.clientX,event.clientY)?.closest?.(".yl-drag-bank")){
   const spec=getDragExercise(Number(d.root.dataset.quoteId),Number(d.root.dataset.lensIndex));
   for(const role of spec?.slots||[])if(d.root.dataset["answer"+role.key]===d.key)delete d.root.dataset["answer"+role.key];
   update(d.root);
  }
  d.root.dataset.suppressNextClick="yes";
  doc.defaultView?.setTimeout(()=>{if(d.root?.dataset)d.root.dataset.suppressNextClick="";},0);
 };
 doc.addEventListener("pointerup",finish);
 doc.addEventListener("pointercancel",event=>{if(!drag||drag.id!==event.pointerId)return;drag.ghost?.remove();drag=null;});
 doc.addEventListener("click",event=>{
  const target=event.target.closest?.("[data-exercise-reset],[data-exercise-card],[data-exercise-slot]");
  const root=target?.closest("[data-yl-quote-drag]");
  if(!root||root.dataset.suppressNextClick==="yes")return;
  if(target.hasAttribute("data-exercise-reset")){
   const record=getDragExercise(Number(root.dataset.quoteId),Number(root.dataset.lensIndex));
   for(const s of record?.slots||[])delete root.dataset["answer"+s.key];
   root.dataset.selected="";update(root);
  }else if(target.hasAttribute("data-exercise-card")){
   const key=target.dataset.exerciseCard;
   root.dataset.selected=root.dataset.selected===key?"":key;update(root);
  }else{
   const key=target.dataset.exerciseSlot;
   if(root.dataset.selected)put(root,key,root.dataset.selected);
   else if(root.dataset["answer"+key]){delete root.dataset["answer"+key];update(root);}
  }
 });
 doc.addEventListener("keydown",event=>{
  if(!["Enter"," "].includes(event.key))return;
  const slot=event.target.closest?.("[data-exercise-slot]");
  if(!slot)return;
  event.preventDefault();slot.click();
 });
}
if(typeof document!=="undefined")installQuoteDragExercise(document);
