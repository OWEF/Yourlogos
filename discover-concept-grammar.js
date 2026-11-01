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

export function conceptVisualHtml(quote,quoteId,selectedDirection){
 const record=resolveTension(quote,quoteId),kind=VISUAL_BY_QUOTE[quoteId];
 const metadata=BUNDLED_INTERPRETATION_ROWS[quoteId],pilot=PILOT_ENCOUNTERS[quoteId];
 if(!record||!kind||!metadata)return "";
 const visual=pilot?.visual||{};
 const left=visual.left||record.poles[0],right=visual.right||record.poles[1];
 const selection=String(selectedDirection??"").trim().slice(0,150);
 const selected=pilot?.options.find(x=>normalize(x.label)===normalize(selection));
 const lens=selected?.focus||selection;
 const motif=visual.background||metadata.motif;
 const glyph=motifSymbol(motif);
 const hue=(quoteId*37+24)%360;
 const alt="Original idea: "+left+" in relation to "+right+
   (lens?". Highlighted perspective: "+lens:"");
 return '<section class="yl-concept-visual yl-concept-'+kind+
   '" data-motif="'+sanitize(motif)+'" style="--motif-hue:'+hue+
   '" aria-label="A conceptual visualization of the quote">'+
   '<div class="yl-concept-overline">THE IDEA, IN RELATION</div>'+
   '<div class="yl-concept-diagram" role="img" aria-label="'+sanitize(alt)+'">'+
     '<div class="yl-concept-node yl-concept-left"><span class="yl-concept-graphic" aria-hidden="true">'+sanitize(glyph)+'</span><strong>'+sanitize(left)+'</strong></div>'+
     '<div class="yl-concept-link" aria-hidden="true"><span>'+JOINER[visual.template||kind]+'</span></div>'+
     '<div class="yl-concept-node yl-concept-right"><span class="yl-concept-graphic" aria-hidden="true">◇</span><strong>'+sanitize(right)+'</strong></div>'+
   '</div>'+
   (lens?'<p class="yl-concept-lens"><span>THE PERSPECTIVE</span> '+sanitize(lens)+'</p>':"")+
   '</section>';
}
