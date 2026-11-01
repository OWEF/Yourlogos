// Editorial visualization grammar for the 91 bundled quotations.
// A finite set of readable conceptual relationships, not one invented illustration per quote.
// Each mapping is provisional until a source-aware human review.
import {resolveTension} from "./tension-engine.js";
import {BUNDLED_INTERPRETATION_ROWS,PILOT_ENCOUNTERS} from "./discover-quote-editorial.js";
export const VISUAL_GROUPS={"bridge":[0,7,9,13,16,22,24,34,38,41,43,49,50,70,72,79,90],"balance":[1,2,3,4,8,11,18,21,23,25,26,27,28,29,39,40,44,45,46,47,48,55,56,59,60,64,71,75,77,88],"lens":[5,14,19,20,36,37,42,51,54,57,58,63,67,68,69,74,76,78,82,87],"layers":[10,15,30,31,35,52,61,62,65,73,80,81,84,85,89],"cycle":[12,17,32,33,53,66,83],"path":[6,86]};
export const VISUAL_KINDS=["bridge","balance","lens","layers","cycle","path"];
export const VISUAL_BY_QUOTE=Object.freeze(Object.fromEntries(
 VISUAL_KINDS.flatMap(kind=>VISUAL_GROUPS[kind].map(id=>[id,kind]))
));
const sanitize=x=>String(x??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const JOINER={bridge:"↔",balance:"⇄",lens:"◉",layers:"⊂",cycle:"↻",path:"→"};
const ICON_MOTIFS=[
 [/sky|star|space|cosmos|universe/,"✦"],[/road|route|path|footstep|trail|crossroads/,"➶"],
 [/room|home|house|door|gate|key/,"⌂"],[/book|desk|reading|letter|notebook|journal/,"▤"],
 [/river|water|sea|well|rain|storm/,"≈"],[/mirror|reflection|shadow|glass/,"◉"],
 [/flame|lantern|candle|light|lamp|sunrise|sunlit/,"✧"],[/clock|hour|calendar|time/,"◷"],
 [/heart|love|hand/,"♡"],[/network|city|square|street|people|table/,"◇"],
 [/tree|seed|earth|nature/,"✿"]
];
const motifSymbol=motif=>ICON_MOTIFS.find(([test])=>test.test(motif))?.[1]||"◌";
const normalize=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();

// A visual is earned only by a reviewed scene-to-quote explanation.
// An ID-based diagram assignment is not sufficient evidence that the illustration helps.
// Unreviewed quotations still get a concise verbal clarification, without a misleading diagram.
export function conceptVisualHtml(quote,quoteId,selectedDirection,lensIndex=null){
 const record=resolveTension(quote,quoteId),pilot=PILOT_ENCOUNTERS[quoteId];
 if(!record||!pilot)return "";
 const direction=String(selectedDirection??"").trim().slice(0,280);
 const mapped=Number.isInteger(lensIndex)&&lensIndex>=0&&lensIndex<3
   ?lensIndex:pilot.options.findIndex(x=>normalize(x.label)===normalize(direction));
 if(mapped<0)return ""; // Custom answers require their own grounded explanation from DeepSeek.
 const option=pilot.options[mapped];
 if(!option?.sceneMeaning||!option?.quoteConnection||!option?.sceneLeft||
    !option?.sceneRight||!option?.relation)return "";
 const motif=pilot.visual?.background||BUNDLED_INTERPRETATION_ROWS[quoteId]?.motif||"";
 const alt=option.sceneLeft+"; "+option.relation+"; "+option.sceneRight+
   ". This illustrates: "+option.quoteConnection;
 return '<section class="yl-concept-visual yl-concept-example" data-motif="'+sanitize(motif)+'">'+
  '<span class="yl-concept-overline">SEE IT IN THE EXAMPLE</span>'+
  '<div class="yl-concept-story" role="img" aria-label="'+sanitize(alt)+'">'+
    '<strong>'+sanitize(option.sceneLeft)+'</strong>'+
    '<span class="yl-concept-relation">'+sanitize(option.relation)+'</span>'+
    '<strong>'+sanitize(option.sceneRight)+'</strong>'+
  '</div>'+
  '<p class="yl-concept-backlink"><span>BACK TO THE QUOTE</span>'+sanitize(option.quoteConnection)+'</p>'+
 '</section>';
}
