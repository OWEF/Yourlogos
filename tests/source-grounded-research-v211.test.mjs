import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {semanticCases} from "../philosophy-engine/encounter/semantic-cases-v12.js";
import {reasonSemantically} from "../philosophy-engine/encounter/semantic-reasoning-v12.js";
import {renderEncounterV20} from "../philosophy-engine/encounter/encounter-v20.js";
import {researchContentFromTrustedContextV211}
 from "../philosophy-engine/content/source-intake-research-v211.js";
import {renderSourceGroundedResearchV211,validateSourceGroundedResearchV211,COMPOSITION_VERSION}
 from "../philosophy-engine/content/source-grounded-composer-v211.js";
import {validateChoiceV21,validateContentRecordV21,canPublishEncounterV21}
 from "../philosophy-engine/content/content-contract-v21.js";
import {HEGEL_NO_FIT_V21,DILLARD_V21}
 from "../philosophy-engine/content/research-fixtures-v21.js";
const env={isolated:true,publicVisibility:false,provisionalDisclosure:true};
const moneyChoice={gameId:"trade_off",amounts:[1,0,1],repetitions:5};
const get=ctx=>{const r=researchContentFromTrustedContextV211(ctx);assert.equal(r.status,"ready",JSON.stringify(r));return r.record;};
test("E SOURCE→CONTENT→CANONICAL→MEANING→V21 EMOTION/EXPRESSION: unfamiliar to v2.0 Thoreau",()=>{
 const money=semanticCases.money;
 const record=get(money);
 assert.equal(validateContentRecordV21(record).status,"valid_research_record");
 assert.deepEqual(record.gameCompatibility.filter(x=>x.eligible).map(x=>x.id),["trade_off"]);
 const admitted=validateChoiceV21(record,moneyChoice);
 assert.equal(admitted.status,"ready",JSON.stringify(admitted));
 assert.deepEqual(admitted.canonical,{amounts:[1,0,1],budgets:[8],repetitions:5});
 const packet=reasonSemantically(money,admitted.canonical);
 assert.equal(packet.status,"ready");assert.equal(packet.meaning.kind,"conversion");
 assert.notEqual(renderEncounterV20(packet).status,"ready","Legacy v2 composer remains FROZEN and declines this source");
 const out=renderSourceGroundedResearchV211(record,moneyChoice,env);
 assert.equal(out.status,"ready",JSON.stringify(out));
 assert.equal(out.version,COMPOSITION_VERSION);
 assert.equal(out.brief.rhetorical_angle.operator,"conversion");
 assert.equal(out.preserved_frozen_v20,false);
 assert.deepEqual(out.sections.map(s=>s.label),["Your Choice","Back to the Philosopher","One Last Thing…"]);
 assert.ok(out.wordCount>=80&&out.wordCount<=120,JSON.stringify(out.sectionWordCounts));
 assert.ok(out.sectionWordCounts[0]>=10&&out.sectionWordCounts[0]<=48);
 assert.ok(out.sectionWordCounts[1]>=18&&out.sectionWordCounts[1]<=65);
 assert.ok(out.sectionWordCounts[2]>=9&&out.sectionWordCounts[2]<=26);
 assert.match(out.sections[0].text,/extra working hours/);
 assert.match(out.sections[1].text,/Thoreau asks us to consider the life exchanged/);
 assert.match(out.sections[2].text,/No price establishes/);
 assert.equal(out.source_url,money.source.url);
 assert.equal(out.source_work,money.source.work);
 assert.equal(out.source_review,"curated_provisional");
 assert.equal(canPublishEncounterV21(record,{founderAuthorized:true}),false);
 assert.equal(validateSourceGroundedResearchV211(record,moneyChoice,env,out).status,"ready");
 const altered=structuredClone(out);altered.sections[1].text+=" You will be happier.";
 assert.notEqual(validateSourceGroundedResearchV211(record,moneyChoice,env,altered).status,"ready");
 console.log("CZ130-SOURCE-TRANSFER THOREAU "+JSON.stringify({
  content:"valid",canonical:admitted.canonical,meaning:packet.meaning.kind,
  frozen:renderEncounterV20(packet).status,research:out.status,words:out.wordCount,
  sectionWords:out.sectionWordCounts,source:out.source_work,public:false
 }));
});
test("E SECOND structurally distinct source: specialization effects do not become historical productivity",()=>{
 const workshop=semanticCases.workshop;
 const record=get(workshop);
 assert.equal(validateContentRecordV21(record).status,"valid_research_record");
 const choice={gameId:"trade_off",amounts:[3,1]};
 const accepted=validateChoiceV21(record,choice);
 assert.equal(accepted.status,"ready",JSON.stringify(accepted));
 assert.deepEqual(accepted.canonical,{amounts:[3,1],budgets:[4]});
 const packet=reasonSemantically(workshop,accepted.canonical);
 assert.equal(packet.status,"ready");
 assert.equal(packet.meaning.kind,"specialization_effect");
 assert.notEqual(renderEncounterV20(packet).status,"ready");
 const out=renderSourceGroundedResearchV211(record,choice,env);
 assert.equal(out.status,"ready",JSON.stringify(out));
 assert.equal(out.brief.rhetorical_angle.operator,"specialization_effect");
 assert.match(out.sections[0].text,/invented task rates/);
 assert.match(out.sections[1].text,/Smith explains productivity gains/);
 assert.match(out.sections[2].text,/rates cannot establish historical productivity/);
 assert.equal(validateSourceGroundedResearchV211(record,choice,env,out).status,"ready");
 console.log("CZ130-SOURCE-TRANSFER SMITH "+JSON.stringify({
  source:out.source_work,meaning:packet.meaning.kind,status:out.status,words:out.wordCount,
  sectionWords:out.sectionWordCounts,public:false
 }));
});
test("E fail-closed: unregistered, cloned, forged, unsupported content never gets research READY",()=>{
 const cloned=structuredClone(semanticCases.money);
 assert.equal(researchContentFromTrustedContextV211(cloned).status,"needs_source_review");
 const record=get(semanticCases.money);
 const bad={...moneyChoice,amounts:[0,4,0]}; // 4 lamps exceeds frozen max 3 despite budget 8
 assert.equal(validateChoiceV21(record,bad).status,"rejected");
 assert.notEqual(renderSourceGroundedResearchV211(record,bad,env).status,"ready");
 assert.notEqual(renderSourceGroundedResearchV211(record,moneyChoice,
  {...env,publicVisibility:true}).status,"ready");
 const forged=structuredClone(record);
 forged.source.quote="New quotation invented in the same work";
 assert.equal(validateContentRecordV21(forged).status,"invalid");
 assert.notEqual(renderSourceGroundedResearchV211(forged,moneyChoice,env).status,"ready");
 assert.equal(validateContentRecordV21(HEGEL_NO_FIT_V21).status,"inventory_no_fit");
 assert.notEqual(renderSourceGroundedResearchV211(HEGEL_NO_FIT_V21,moneyChoice,env).status,"ready");
});
test("E frozen Dillard stays exactly on v2.0 validated composer",()=>{
 const record=DILLARD_V21,choice={gameId:"token_studio",amounts:[3,1,2],repetitions:5};
 const out=renderSourceGroundedResearchV211(record,choice,env);
 assert.equal(out.status,"ready",JSON.stringify(out));
 assert.equal(out.preserved_frozen_v20,true);
 const packet=reasonSemantically(semanticCases.dillard,{amounts:[3,1,2],budgets:[6],repetitions:5});
 const frozen=renderEncounterV20(packet);
 assert.deepEqual(out.sections,frozen.sections);
 assert.deepEqual(out.brief,frozen.brief);
});
test("E adapter contains no philosopher-name routing",()=>{
 const paths=["../philosophy-engine/content/source-intake-research-v211.js",
              "../philosophy-engine/content/source-grounded-composer-v211.js",
              "../philosophy-engine/content/content-capabilities-v211.js"];
 for(const p of paths){
  const source=readFileSync(new URL(p,import.meta.url),"utf8");
  for(const name of ["thoreau","smith","dillard","kierkegaard","descartes","epictetus"])
   assert.equal(new RegExp("\\b"+name+"\\b","i").test(source),false,p+" contains author-specific branch "+name);
 }
});
