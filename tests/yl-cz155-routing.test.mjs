import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {B27_APP_QUOTES,B27_INHERITED_COUNT} from "../experiments/yl-b27-quote-ledger.mjs";
import {reportB27Coverage} from "../experiments/yl-b27-editorial-ledger.mjs";
import {CZ147_APP_ADMITTED_IDS,resolveQuoteB27} from "../experiments/yl-b27-route.mjs";
import {resolvePilot} from "../experiments/yl-cz155-pilot.mjs";

const exactQuote=id=>({quoteId:id,quoteText:B27_APP_QUOTES[id][0],
 quoteAuthor:B27_APP_QUOTES[id][1],quoteWork:B27_APP_QUOTES[id][3],
 b27DevelopmentOnly:id>=B27_INHERITED_COUNT});
const dailyList=()=>{
 const app=readFileSync(new URL("../app.js",import.meta.url),"utf8");
 const match=app.match(/const DAILY_FEATURE_IDS=\[([\d,\s]+)\];/);
 assert.ok(match,"Current app daily quote list must remain inspectable");
 const ids=match[1].split(",").map(x=>Number(x.trim()));
 assert.equal(new Set(ids).size,ids.length);
 return ids;
};

test("Exact current inherited, development and daily-feature eligibility denominators",()=>{
 const coverage=reportB27Coverage();
 assert.equal(coverage.original,91);
 assert.equal(coverage.developmentOnly,4);
 const editorialPlayable=coverage.rows.filter(row=>row.status==="playable").map(row=>row.quoteId);
 // The B2.7 editorial ledger and CZ-147 generalized registry are separate
 // sources of playable routes; counting either alone understates coverage.
 const allPlayable=[...new Set([...editorialPlayable,...CZ147_APP_ADMITTED_IDS])];
 const inherited=allPlayable.filter(id=>id<91).sort((a,b)=>a-b);
 const development=allPlayable.filter(id=>id>=91).sort((a,b)=>a-b);
 assert.deepEqual(inherited,[12,23,34,48,49,55]);
 assert.deepEqual(development,[91,92,93,94]);
 assert.deepEqual([...CZ147_APP_ADMITTED_IDS].sort((a,b)=>a-b),[23,48,49,55]);
 const daily=dailyList();
 assert.equal(daily.length,56);
 assert.deepEqual(daily.filter(id=>inherited.includes(id)).sort((a,b)=>a-b),[12,23,34,48,49]);
 assert.ok(daily.includes(47));
 assert.ok(!daily.includes(55));
});

test("Long 47 stays reading-first outside the dual-gated pilot; Carter 92 stays distinct",()=>{
 const long=exactQuote(47),carter=exactQuote(92);
 const ordinary=resolveQuoteB27(long);
 assert.equal(ordinary.status,"no_fit");
 assert.equal(ordinary.quoteId,47);
 assert.match(ordinary.reading.url,/perseus-eng3:1/);
 assert.match(ordinary.reading.context,/Epictetus counts judgment/);
 assert.equal(ordinary.publicationAllowed,false);
 const old=resolveQuoteB27(carter);
 assert.equal(old.status,"ready");
 assert.equal(old.selectedFamilyId,"tap_pair");
 assert.equal(old.record.director,undefined);
 assert.notEqual(long.quoteText,carter.quoteText);
 assert.notEqual(long.quoteWork,carter.quoteWork);
 assert.equal(resolvePilot(long),null);
 assert.equal(resolvePilot({...carter,cz155Preview:true}),null);
 const newPilot=resolvePilot({...long,cz155Preview:true});
 assert.equal(newPilot.status,"ready");
 assert.equal(newPilot.record.director.source.translation,"George Long");
 assert.equal(newPilot.publicationAllowed,false);
 assert.equal(resolvePilot({...long,cz155Preview:true,quoteWork:carter.quoteWork}).status,"blocked");
});
