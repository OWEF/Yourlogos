import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {semanticCases} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {reasonSemantically,expressSemantic} from "../philosophy-engine/encounter/semantic-reasoning-v12.js";
import {renderEncounterV20} from "../philosophy-engine/encounter/encounter-v20.js";

export const cases=[
 {id:"dillard-full",source:"dillard",path:{amounts:[6,0,0],budgets:[6],repetitions:5}},
 {id:"dillard-rest",source:"dillard",path:{amounts:[0,0,6],budgets:[6],repetitions:5}},
 {id:"dillard-shared",source:"dillard",path:{amounts:[3,1,2],budgets:[6],repetitions:5}},
 {id:"epictetus-offer",source:"apology",path:{path:["offer","space"]}},
 {id:"epictetus-space",source:"apology",path:{path:["space","space"]}},
 {id:"kierkegaard-move",source:"kierkegaard",path:{path:["change","risk","continue"]}},
 {id:"kierkegaard-stay",source:"kierkegaard",path:{path:["stay","missed","reflect"]}}
];
const samples=cases.map(c=>{
 const p=reasonSemantically(semanticCases[c.source],c.path);
 if(p.status!=="ready")throw Error(c.id+": reasoner "+p.reason);
 const previous=expressSemantic(p),next=renderEncounterV20(p);
 if(previous.status!=="ready"||next.status!=="ready")
  throw Error(c.id+": v1/v2 output not ready "+JSON.stringify({previous,next}));
 return {...c,author:p.author,quote:p.quote,original:{sections:[
  previous.headline+" "+previous.experience,previous.interpretation,previous.proactiveQuestion
 ],words:previous.wordCount},candidate:next};
});
const script=[
 "const samples=JSON.parse(document.getElementById('samples').textContent);",
 "const menu=document.getElementById('menu'),content=document.getElementById('content');",
 "function show(i){",
 " const sample=samples[i];",
 " for(const b of menu.querySelectorAll('button'))b.setAttribute('aria-pressed',String(Number(b.dataset.i)===i));",
 " content.replaceChildren();",
 " const heading=document.createElement('h2');heading.textContent=sample.author+' · '+sample.id;content.append(heading);",
 " const q=document.createElement('blockquote');q.textContent=sample.quote;content.append(q);",
 " const layout=document.createElement('div');layout.className='comparison';",
 " for(const [label,sections] of [['v1.9.6 · baseline',sample.original.sections],['v2.0 · candidate',sample.candidate.sections.map(s=>s.text)]]){",
 "  const column=document.createElement('section');column.className='column';",
 "  const title=document.createElement('h3');title.textContent=label;column.append(title);",
 "  for(let j=0;j<3;j++){const part=document.createElement('article');part.className='section';",
 "   const h=document.createElement('h4');h.textContent=['Your Choice','Back to the Philosopher','One Last Thing…'][j];",
 "   const p=document.createElement('p');p.textContent=sections[j];part.append(h,p);column.append(part);}",
 "  layout.append(column);}",
 " content.append(layout);",
 " const meta=document.createElement('p');meta.className='meta';meta.textContent='Strategy: '+sample.candidate.brief.strategy+' · Source review: provisional · Word count: '+sample.candidate.wordCount;content.append(meta);",
 "}",
 "samples.forEach((x,i)=>{const b=document.createElement('button');b.type='button';b.dataset.i=i;b.textContent=x.id;",
 " b.addEventListener('click',()=>show(i));menu.append(b);});show(0);"
].join("\n");
const css=[
 "*{box-sizing:border-box}html{color-scheme:dark}body{margin:0;background:#111512;color:#f1eedf;font-family:system-ui,-apple-system,sans-serif;line-height:1.55}",
 "main{max-width:1100px;margin:auto;padding:clamp(16px,4vw,38px)}h1{font-size:clamp(25px,4vw,37px)}.lead{color:#cbc7ae}",
 "#menu{display:flex;gap:8px;overflow-x:auto;padding:10px 0 18px}button{flex:0 0 auto;background:#2c332b;color:#f1eedf;border:1px solid #686e5f;border-radius:22px;padding:10px 14px;font:inherit;cursor:pointer}button[aria-pressed=true]{background:#d5c4a3;color:#121510}",
 "button:focus-visible{outline:3px solid #d5c4a3;outline-offset:3px}blockquote{font-family:Georgia,serif;font-size:1.25rem;color:#eee2c5;margin:14px 0 24px;border-left:2px solid #93866c;padding-left:17px}",
 ".comparison{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.column{border:1px solid #3d463d;border-radius:17px;padding:18px;min-width:0}.column h3{font-size:1rem}.section{padding:15px 0;border-top:1px solid #495047}.section h4{font-size:.8rem;color:#cec19c;margin:0 0 8px}.section p{margin:0;overflow-wrap:anywhere}.meta{color:#b6b99e;font-size:.85rem}",
 "@media(max-width:700px){.comparison{grid-template-columns:1fr}.column{padding:13px}}@media(prefers-reduced-motion:no-preference){button{transition:background .15s}}"
].join("\n");
const safeJson=JSON.stringify(samples).replace(/</g,"\\u003c");
const html="<!doctype html>\n<html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>CZ-127 Encounter v2.0 proof · isolated</title><style>"+css+"</style></head><body><main><h1>Encounter v2.0 · research proof</h1><p class=\"lead\">Six-plus contrasting real reasoner paths. Original source status remains provisional. Not production.</p><nav aria-label=\"Select validated path\" id=\"menu\"></nav><div id=\"content\" aria-live=\"polite\"></div></main><script id=\"samples\" type=\"application/json\">"+safeJson+"</script><script>"+script+"</script></body></html>\n";
const path=new URL("../experiments/encounter-v20-proof.html",import.meta.url);
const comparison=new URL("../design-review/encounter-v20-comparison.json",import.meta.url);
if(process.argv.includes("--check")){
 if(readFileSync(path,"utf8")!==html)throw Error("Generated browser artifact differs from exact source.");
 if(readFileSync(comparison,"utf8")!==JSON.stringify(samples,null,2)+"\n")throw Error("Generated comparison fixture differs from source.");
}else{
 mkdirSync(new URL("../design-review/",import.meta.url),{recursive:true});
 writeFileSync(path,html);writeFileSync(comparison,JSON.stringify(samples,null,2)+"\n");
}
for(const x of samples)process.stdout.write("CZ127-EXAMPLE "+JSON.stringify({id:x.id,from:x.original.words,to:x.candidate.wordCount,strategy:x.candidate.brief.strategy,source:x.candidate.source_review,last:x.candidate.sections[2].text})+"\n");

for(const x of samples)process.stdout.write("CZ127-FULL "+JSON.stringify({id:x.id,path:x.path,v196:x.original,candidate:{sections:x.candidate.sections,brief:x.candidate.brief,wordCount:x.candidate.wordCount,sectionWordCounts:x.candidate.sectionWordCounts,source_review:x.candidate.source_review}})+"\n");
