import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {featuredPortrait} from "../philosopher-featured-art.js";
import {philosopherPortrait} from "../philosopher-portraits.js";
import {philosopherEntries,philosopherGalleryHtml,philosopherProfileHtml} from "../philosopher-gallery.js";

const FEATURED=[
 "Socrates","Plato","Aristotle","Friedrich Nietzsche","Immanuel Kant",
 "G. W. F. Hegel","Karl Marx","Søren Kierkegaard","Seneca",
 "Marcus Aurelius","Laozi","Confucius","Mencius","Albert Camus",
 "Simone de Beauvoir","Hannah Arendt"
];

test("every featured thinker has individually drawn, local SVG portrait",()=>{
 const designs=new Set();
 for(const name of FEATURED){
  const art=featuredPortrait(name);
  assert.ok(art?.includes("<rect"),name);
  assert.ok(!art.includes("<image"),name+" must not fetch remote images");
  assert.ok(!art.includes("<script"),name);
  assert.ok(!designs.has(art),name+" art must not repeat another portrait");
  designs.add(art);
  const portrait=philosopherPortrait(name);
  assert.match(portrait,/viewBox="0 0 32 32"/,name);
  assert.match(portrait,/data-featured-art="true"/,name);
 }
 assert.equal(designs.size,FEATURED.length);
});
test("nonfeatured author retains a generated local fallback",()=>{
 const html=philosopherPortrait("John Stuart Mill");
 assert.match(html,/viewBox="0 0 24 24"/);
 assert.match(html,/data-featured-art="false"/);
});
test("gallery preserves all featured identities and links to existing quotation records",()=>{
 const q=[["An examined life","Socrates","Meaning","Apology"],
          ["Choice before certainty","Søren Kierkegaard","Freedom","Works"],
          ["One more question","Socrates","Doubt","Apology"]];
 const entries=philosopherEntries(q);
 assert.equal(entries.filter(e=>e.featured).length,FEATURED.length);
 assert.deepEqual(entries.find(e=>e.name==="Socrates").quoteIds,[0,2]);
 const html=philosopherGalleryHtml(q);
 assert.match(html,/data-philosopher-search/);
 assert.equal((html.match(/class="yl-philosopher-card"/g)||[]).length,FEATURED.length);
 const firstCard=html.split('class="yl-philosopher-card"')[1].split('</button>')[0];
 assert.doesNotMatch(firstCard,/<small>/);
 const detail=philosopherProfileHtml(q,0);
 assert.match(detail,/An examined life/);
 assert.match(detail,/data-philosopher-quote="0"/);
 assert.match(detail,/data-philosopher-quote="2"/);
});
test("gallery content escapes user-visible text without raw HTML injection",()=>{
 const malicious=[["<img src=x onerror=alert(1)>","Imaginary <script>","Doubt","A work"]];
 const html=philosopherGalleryHtml(malicious);
 assert.doesNotMatch(html,/<script>/);
 assert.match(html,/Imaginary &lt;script&gt;/);
 const detail=philosopherProfileHtml(malicious,FEATURED.length);
 assert.doesNotMatch(detail,/<img src=x/);
});
test("compact gallery styles and PWA assets are loaded",()=>{
 const css=readFileSync(new URL("../philosopher-gallery-v2.css",import.meta.url),"utf8");
 const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
 const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
 assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 for(const file of ["philosopher-featured-art.js","philosopher-gallery-v2.css"]){
  assert.ok(sw.includes('"\/'+file+'"'),file+" should be precached");
 }
 assert.match(html,/philosopher-gallery-v2\.css/);
});
