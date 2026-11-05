import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const observer=path.join(root,'.github/scripts/cz81-e0-diagnostics.mjs');
const wrapper=path.join(root,'.github/scripts/cz81-e0-observed-command.sh');
const create=()=>fs.mkdtempSync(path.join(os.tmpdir(),'cz81-e0-test-'));
const clean=dir=>fs.rmSync(dir,{recursive:true,force:true});
const run=(command,args,env={})=>spawnSync(command,args,{
  cwd:root,encoding:'utf8',timeout:18000,
  env:{...process.env,...env}
});
const invoke=(dir,program,seconds=2)=>{
  const candidate=path.join(dir,'happy.svg');
  const safe=path.join(dir,'safe');
  const proc=run('bash',[wrapper,'--',process.execPath,'-e',program],{
    RUNNER_TEMP:dir,
    OBS_REPORT_DIR:safe,
    OBS_CANDIDATE:candidate,
    OBS_TIMEOUT_SECONDS:String(seconds),
    OBS_SAMPLE_INTERVAL_SECONDS:'1'
  });
  return {proc,candidate,safe,summary:JSON.parse(fs.readFileSync(path.join(safe,'summary.json'),'utf8'))};
};
test('pure status reader syntax checks without any connected model',()=>{
  const x=run(process.execPath,['--check',observer]);
  assert.equal(x.status,0,x.stderr);
  const y=run('bash',['-n',wrapper]);
  assert.equal(y.status,0,y.stderr);
});
test('completed fake command captures useful progress and keeps secrets out of report',()=>{
  const dir=create();try{
    const sentinel='SECRET_TOKEN_TEST_NOREAL';
    const program=[
      "const fs=require('node:fs');",
      "process.stdout.write(JSON.stringify({type:'assistant',content:'"+sentinel+"'})+'\\n');",
      "process.stderr.write('Bearer "+sentinel+" unexpected warning\\n');",
      "fs.writeFileSync(process.env.OBS_CANDIDATE, '<svg id=\"happy\"></svg>');"
    ].join('\n');
    const {proc,safe,summary}=invoke(dir,program);
    assert.equal(proc.status,0,proc.stderr);
    assert.equal(summary.termination,'completed');
    assert.equal(summary.exitCode,0);
    assert.equal(summary.candidatePresent,true);
    assert.equal(summary.candidateBytes,22);
    assert.equal(summary.events.validJsonLines,1);
    assert.equal(summary.events.types.assistant,1);
    assert.ok(summary.modelOutputBytes>0);
    assert.ok(fs.existsSync(path.join(safe,'timeline.ndjson')));
    assert.ok(!fs.readdirSync(dir).some(x=>x.startsWith('cz81-e0-raw.')));
    const all=fs.readFileSync(path.join(safe,'summary.json'),'utf8')+
      fs.readFileSync(path.join(safe,'timeline.ndjson'),'utf8')+proc.stdout;
    assert.equal(all.includes(sentinel),false,'raw model contents MUST NEVER be emitted');
    assert.equal(all.includes('Bearer'),false);
  }finally{clean(dir);}
});
test('timeout with stdout but zero artwork cannot qualify as saved checkpoint',()=>{
  const dir=create();try{
    const program="process.stdout.write(JSON.stringify({type:'status',message:'working'})+'\\n'); setTimeout(()=>{},10000)";
    const {proc,summary,safe}=invoke(dir,program,2);
    assert.equal(proc.status,0,proc.stderr);
    assert.equal(summary.exitCode,124);
    assert.equal(summary.termination,'hard_timeout');
    assert.equal(summary.candidatePresent,false);
    assert.equal(summary.candidateBytes,0);
    assert.equal(summary.noSavedArtifact,true);
    assert.ok(summary.modelOutputBytes>0,'model had activity even though no artifact');
    assert.equal(fs.readdirSync(safe).sort().join(','),'summary.json,timeline.ndjson');
  }finally{clean(dir);}
});
test('nonzero fake process correctly classifies provider hints without publishing text',()=>{
  const dir=create();try{
    const token='NEVER_OUTPUT_FAKE_TOKEN';
    const program="process.stderr.write('429 quota exceeded "+token+"\\n');process.exit(17)";
    const {proc,summary,safe}=invoke(dir,program);
    assert.equal(proc.status,0,proc.stderr);
    assert.equal(summary.exitCode,17);
    assert.equal(summary.termination,'nonzero_exit');
    assert.equal(summary.hints.rateLimitHint,true);
    assert.equal(fs.readFileSync(path.join(safe,'summary.json'),'utf8').includes(token),false);
  }finally{clean(dir);}
});
test('malformed and misleading raw events cannot inject new report fields or arbitrary labels',()=>{
  const dir=create();try{
    const raw=path.join(dir,'raw');const report=path.join(dir,'safe');
    fs.mkdirSync(raw);fs.mkdirSync(report);
    fs.writeFileSync(path.join(raw,'stdout.jsonl'),[
      '{"type":"SECRET_TOKEN_TEST","content":"secret"}',
      'malformed JSON with a malicious secret',
      '{"type":"tool_result","role":"tool","content":"token"}',
      '{"type":"assistant","role":"assistant","message":"private"}'
    ].join('\n'));
    fs.writeFileSync(path.join(raw,'stderr.log'),'Bearer PRIVATE-KEY-AAA');
    const p=run(process.execPath,[observer,'finalize',\`--raw-dir=${raw}\`,\`--report-dir=${report}\`,
      \`--candidate=${path.join(dir,'absent.svg')}\`,'--seconds=34','--exit-code=124']);
    assert.equal(p.status,0,p.stderr);
    const json=fs.readFileSync(path.join(report,'summary.json'),'utf8');
    const s=JSON.parse(json);
    assert.equal(s.events.validJsonLines,3);
    assert.equal(s.events.invalidJsonLines,1);
    assert.equal(s.events.types.unknown,1);
    assert.equal(s.events.types.tool_result,1);
    assert.equal(s.events.roles.tool,1);
    assert.equal(json.includes('PRIVATE-KEY-AAA'),false);
    assert.equal(json.includes('SECRET_TOKEN_TEST'),false);
  }finally{clean(dir);}
});
