// YourLogos Philosopher Gallery — a browsable index, never a personality score.
// Built from existing editorial quote records; no additional user data is stored.
import {philosopherPortrait} from "./philosopher-portraits.js";
const escapeHTML=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const normalize=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const FEATURED=[
 ["Socrates","The examined life","What do we really know about ourselves?","socrates"],
 ["Plato","Justice and appearance","What makes something more than it appears?","plato"],
 ["Aristotle","Virtue and flourishing","What does it take to live well?","aristotle"],
 ["Friedrich Nietzsche","Values and becoming","Which ideals are truly your own?","nietzsche"],
 ["Immanuel Kant","Freedom and duty","Could the reason behind your choice hold for everyone?","kant"],
 ["G. W. F. Hegel","History and recognition","Can anything be understood apart from its relations?","hegel"],
 ["Karl Marx","Work and society","How does the world we build shape the way we think?","marx"],
 ["Søren Kierkegaard","Choice and responsibility","How do we choose before certainty arrives?","kierkegaard"],
 ["Seneca","Time and resilience","What deserves the limited time we have?","seneca"],
 ["Marcus Aurelius","Judgment and attention","What is yours to decide when events are not?","marcus"],
 ["Laozi","The way of things","When might less effort reveal a better path?","laozi"],
 ["Confucius","Learning and responsibility","How do thought and practice sustain each other?","confucius"],
 ["Mencius","Care and moral growth","How does concern for others first arise?","mencius"],
 ["Albert Camus","Absurdity and revolt","What makes living meaningful without easy answers?","camus"],
 ["Simone de Beauvoir","Freedom and becoming","Who gets to define the person we become?","beauvoir"],
 ["Hannah Arendt","Thinking and judgment","What happens when we stop examining our actions?","arendt"]
];
const TEXTS=new Set(["Zen koan (Dizang)","The Heart Sutra","The Dhammapada"]);
export function philosopherEntries(quotes){
 const groups=new Map();
 (Array.isArray(quotes)?quotes:[]).forEach((q,index)=>{
  const author=String(q?.[1]||"").trim();
  if(!author)return;
  const key=normalize(author);
  if(!groups.has(key))groups.set(key,{name:author,quoteIds:[]});
  groups.get(key).quoteIds.push(index);
 });
 const featured=FEATURED.map(([name,focus,question,key])=>{
  const record=groups.get(normalize(name));
  groups.delete(normalize(name));
  return {name,focus,question,key,featured:true,quoteIds:record?.quoteIds||[],type:"thinker"};
 });
 const others=[...groups.values()].sort((a,b)=>a.name.localeCompare(b.name,"en")).map((record)=>({
  ...record,key:normalize(record.name),featured:false,
  focus:TEXTS.has(record.name)?"A text or tradition represented in YourLogos":"An author in the YourLogos collection",
  question:"Explore the ideas this voice brings into our collection.",
  type:TEXTS.has(record.name)?"text":"voice"
 }));
 return [...featured,...others];
}
export const philosopherCount=quotes=>philosopherEntries(quotes).length;
const badges=entry=>(entry.quoteIds.length?entry.quoteIds.length+" reading"+(entry.quoteIds.length===1?"":"s"):"Readings coming soon");
function avatar(entry){
 return '<span class="yl-philosopher-avatar'+(entry.type==="text"?" is-text":"")+'" aria-hidden="true">'+
 (entry.type==="text"?'<span class="yl-philosopher-textmark">✧</span>':philosopherPortrait(entry.name))+'</span>';
}
function card(entry,index){
 return '<button type="button" class="yl-philosopher-card" data-philosopher="'+index+'" data-search-key="'+escapeHTML(normalize(entry.name+" "+entry.focus+" "+entry.question))+'" aria-label="Explore '+escapeHTML(entry.name)+'">'+
 avatar(entry)+'<strong>'+escapeHTML(entry.name)+'</strong><small>'+escapeHTML(entry.focus)+'</small>'+
 '<span class="yl-philosopher-count">'+badges(entry)+'</span></button>';
}
export function philosopherGalleryHtml(quotes){
 const entries=philosopherEntries(quotes),featured=entries.map((e,i)=>[e,i]).filter(([e])=>e.featured);
 const others=entries.map((e,i)=>[e,i]).filter(([e])=>!e.featured);
 return '<section class="view yl-philosopher-gallery" aria-label="Philosopher Gallery">'+
 '<div class="world-kicker">THE PEOPLE BEHIND THE IDEAS</div>'+
 '<h1>Meet the thinkers<span>.</span></h1>'+
 '<p class="yl-philosopher-lead">Philosophy has faces, histories, and disagreements. Come meet the minds behind the questions.</p>'+
 '<label class="yl-philosopher-search"><span aria-hidden="true">⌕</span><input type="search" data-philosopher-search placeholder="Find a thinker or an idea" aria-label="Search philosophers by name or idea" autocomplete="off"></label>'+
 '<div class="yl-philosopher-section" data-gallery-section><div class="yl-philosopher-section-head"><h2>Featured thinkers</h2><small>'+featured.length+' portraits</small></div>'+
 '<div class="yl-philosopher-grid">'+featured.map(([e,i])=>card(e,i)).join("")+'</div></div>'+
 '<div class="yl-philosopher-section" data-gallery-section><div class="yl-philosopher-section-head"><h2>More voices & texts</h2><small>'+others.length+' in the collection</small></div>'+
 '<div class="yl-philosopher-grid">'+others.map(([e,i])=>card(e,i)).join("")+'</div></div>'+
 '<p class="yl-philosopher-empty" data-philosopher-empty hidden>No thinkers match that search.</p>'+
 '<p class="yl-philosopher-footnote">Portraits are stylized illustrations, not verified historical likenesses. Questions are editorial invitations, not verbatim quotations.</p>'+
 '</section>';
}
export function philosopherProfileHtml(quotes,index){
 const entries=philosopherEntries(quotes);
 const entry=entries[index];
 if(!entry)return philosopherGalleryHtml(quotes);
 const works=entry.quoteIds.map(i=>({id:i,quote:quotes[i]})).filter(x=>Array.isArray(x.quote));
 return '<section class="view yl-philosopher-profile" aria-label="Explore '+escapeHTML(entry.name)+'">'+
 '<div class="yl-philosopher-hero">'+avatar(entry)+
 '<div><div class="world-kicker">'+(entry.featured?"FEATURED THINKER":entry.type==="text"?"PHILOSOPHICAL TEXT":"A VOICE IN YOURLOGOS")+'</div>'+
 '<h1>'+escapeHTML(entry.name)+'</h1><p>'+escapeHTML(entry.focus)+'</p></div></div>'+
 '<div class="yl-philosopher-question"><small>A QUESTION TO LIVE WITH</small><h2>'+escapeHTML(entry.question)+'</h2></div>'+
 '<div class="yl-philosopher-section-head"><h2>Explore their words</h2><small>'+works.length+' reading'+(works.length===1?"":"s")+'</small></div>'+
 (works.length?'<div class="yl-philosopher-readings">'+works.map(({id,quote})=>
  '<button type="button" class="yl-philosopher-reading" data-philosopher-quote="'+id+'" aria-label="Read quotation from '+escapeHTML(entry.name)+'">'+
  '<span class="yl-philosopher-quote">“'+escapeHTML(quote[0])+'”</span>'+
  '<span class="yl-philosopher-source">'+escapeHTML(quote[3]||"Source under review")+'<span aria-hidden="true">↗</span></span></button>').join("")+'</div>':
 '<p class="yl-philosopher-coming">This thinker has a place in the gallery. Curated quotations are coming later.</p>')+
 '<p class="yl-philosopher-footnote">Quotation wording, attribution and translation may vary. Open a reading to see its context and questions. This page does not infer what you believe.</p>'+
 '</section>';
}
