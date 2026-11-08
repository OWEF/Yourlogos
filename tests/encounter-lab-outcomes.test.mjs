import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const html=readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../experiments/encounter-lab.html'),'utf8');
const part=(from,to)=>{
 const i=html.indexOf(from),j=html.indexOf(to,i+from.length);
 assert.ok(i>=0&&j>i,'Missing outcome code: '+from+' -> '+to);
 return html.slice(i,j);
};
const sources={
 time:part('const hourNames=', 'function mapResult(){'),
 map:part('function mapResult(){','function builderResult(){'),
 builder:part('function builderResult(){','function switchResult(){'),
 switch:part('function switchResult(){','function counterResult(){'),
 counter:part('function counterResult(){','function evidenceResult(){'),
 evidence:part('function evidenceResult(){','function endingData(){'),
 builderOptions:part('const builderOptions=', 'const evidenceCases='),
 evidenceCases:part('const evidenceCases=', 'const hourNames='),
 branches:part('const branches=', 'function decision(){'),
 views:part('const views=', 'function perspective(){'),
 cases:part('const cases=', 'function counter(){')
};
const outcome=(type,state)=>{
 const extras={map:[sources.branches],builder:[sources.builderOptions],switch:[sources.views],counter:[sources.cases],evidence:[sources.evidenceCases]}[type]||[];
 const method={time:'timeResult',map:'mapResult',builder:'builderResult',switch:'switchResult',counter:'counterResult',evidence:'evidenceResult'}[type];
 return new Function('state',[...extras,sources[type],'return '+method+'('+(type==='time'?'state.hours':'')+');'].join('\n'))(state);
};
test('Trade-Off distinguishes exclusive, dominant, majority, partial and distributed allocations',()=>{
 const samples=[[8,0,0],[6,1,1],[5,2,1],[4,2,2],[3,3,2]].map(hours=>outcome('time',{hours}));
 assert.equal(new Set(samples.map(x=>x.headline)).size,5);
 assert.match(samples[0].detail,/100%/);
 assert.match(samples[1].weight,/75%/);
 assert.match(samples[2].weight,/63%/);
 assert.match(samples[3].weight,/50%/);
 assert.match(samples[4].weight,/NO MAJORITY/);
});
test('Trade-Off responds to omission, secondary priorities and contextual humor',()=>{
 const noRest=outcome('time',{hours:[0,5,3]});
 assert.match(noRest.headline,/Rest has vanished/);
 assert.match(noRest.aside,/Buddy/);
 assert.notEqual(outcome('time',{hours:[5,2,1]}).detail,outcome('time',{hours:[5,1,2]}).detail);
});
test('Decision Map considers the intervention and support intensity',()=>{
 const low=outcome('map',{mapChoice:'income',mapBranch:0,mapSupport:0});
 const mid=outcome('map',{mapChoice:'income',mapBranch:0,mapSupport:50});
 const high=outcome('map',{mapChoice:'income',mapBranch:0,mapSupport:100});
 assert.equal(new Set([low.headline,mid.headline,high.headline]).size,3);
 assert.notEqual(high.detail,outcome('map',{mapChoice:'room',mapBranch:0,mapSupport:100}).detail);
});
test('Concept Builder varies the rule from one to many to everyone',()=>{
 const variants=[0,1,2].map(builderReach=>outcome('builder',{builderChoice:0,builderReach}));
 assert.equal(new Set(variants.map(x=>x.headline)).size,3);
 assert.notEqual(variants[2].detail,outcome('builder',{builderChoice:1,builderReach:2}).detail);
});
test('Perspective depends on viewpoint, objection and followup',()=>{
 const open=outcome('switch',{perspective:0,challenge:0,followup:0});
 const closed=outcome('switch',{perspective:0,challenge:0,followup:1});
 assert.notEqual(open.headline,closed.headline);
 assert.notEqual(open.detail,outcome('switch',{perspective:1,challenge:0,followup:0}).detail);
});
test('Counterexample distinguishes all, most and some',()=>{
 const results=['all','most','some'].map(claimScope=>outcome('counter',{claimScope,counter:1}));
 assert.equal(new Set(results.map(x=>x.headline)).size,3);
 assert.match(results[1].detail,/single case cannot show/);
});
test('Evidence Lens verifies source and timing without fictional probabilities',()=>{
 const weak=outcome('evidence',{evidence:1,sourceChecked:false,freshChecked:false});
 const strong=outcome('evidence',{evidence:1,sourceChecked:true,freshChecked:true});
 assert.notEqual(weak.headline,strong.headline);
 assert.match(strong.weight,/NOT A PROBABILITY/);
 assert.match(outcome('evidence',{evidence:0,sourceChecked:false,freshChecked:false}).detail,/repost/);
});
