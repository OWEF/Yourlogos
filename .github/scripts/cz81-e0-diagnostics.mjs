#!/usr/bin/env node
// CZ-81 E0: diagnostics contain COUNTS/BOOLEANS ONLY; never source/model text.
// This tool NEVER launches a model or makes a network request.
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const TYPES = ['assistant','tool_use','tool_result','result','system','status','error','message','event','unknown'];
const ROLES = ['assistant','tool','system','other'];
const arg = (name, fallback=null) => {
  const prefix = '--'+name+'=';
  const item=process.argv.find(x=>x.startsWith(prefix));
  return item===undefined?fallback:item.slice(prefix.length);
};
const bytes = f => { try { return fs.statSync(f).size; } catch { return 0; } };
const exists = f => { try { return fs.statSync(f).isFile(); } catch { return false; } };
const safeNum = (n,min=0,max=1000000000) => Number.isFinite(Number(n))?Math.max(min,Math.min(max,Math.floor(Number(n)))):min;
const writeJson = (file,obj) => fs.writeFileSync(file,JSON.stringify(obj,null,2)+'\n',{mode:0o600});
const reportDir=arg('report-dir');
const rawDir=arg('raw-dir');
const candidate=arg('candidate');
const mode=process.argv[2];
if(!['sample','finalize'].includes(mode)||!reportDir||!rawDir||!candidate) {
  process.stderr.write('Usage: node cz81-e0-diagnostics.mjs sample|finalize --report-dir=PATH --raw-dir=PATH --candidate=PATH [--seconds=N] [--exit-code=N]\n');
  process.exit(2);
}
fs.mkdirSync(reportDir,{recursive:true,mode:0o700});
const stdoutFile=path.join(rawDir,'stdout.jsonl');
const stderrFile=path.join(rawDir,'stderr.log');
const timelineFile=path.join(reportDir,'timeline.ndjson');
const sample=()=>({
  elapsedSeconds:safeNum(arg('seconds')),
  stdoutBytes:bytes(stdoutFile),
  stderrBytes:bytes(stderrFile),
  candidatePresent:exists(candidate),
  candidateBytes:bytes(candidate)
});
if(mode==='sample'){
  fs.appendFileSync(timelineFile,JSON.stringify(sample())+'\n',{mode:0o600});
  process.exit(0);
}

const readSamples=()=>{
  if(!exists(timelineFile))return [];
  const raw=fs.readFileSync(timelineFile,'utf8').split('\n').filter(Boolean).slice(0,3000);
  const out=[];
  for(const line of raw){
    try {
      const o=JSON.parse(line);
      out.push({
        elapsedSeconds:safeNum(o.elapsedSeconds),
        stdoutBytes:safeNum(o.stdoutBytes),
        stderrBytes:safeNum(o.stderrBytes),
        candidateBytes:safeNum(o.candidateBytes),
        candidatePresent:o.candidatePresent===true
      });
    } catch { /* never output raw timeline */ }
  }
  return out;
};
const countEvents=async()=>{
  const types=Object.fromEntries(TYPES.map(x=>[x,0]));
  const roles=Object.fromEntries(ROLES.map(x=>[x,0]));
  let validJsonLines=0,invalidJsonLines=0,nonemptyLines=0,truncated=false;
  if(!exists(stdoutFile))return {validJsonLines,invalidJsonLines,nonemptyLines,truncated,types,roles};
  const rl=readline.createInterface({input:fs.createReadStream(stdoutFile),crlfDelay:Infinity});
  for await(const line of rl){
    if(!line.trim())continue;
    nonemptyLines++;
    if(nonemptyLines>100000){truncated=true;break;}
    if(line.length>200000){invalidJsonLines++;continue;}
    try{
      const value=JSON.parse(line);
      validJsonLines++;
      const rawType=typeof value?.type==='string'?value.type:'unknown';
      const type=TYPES.includes(rawType)?rawType:'unknown';
      types[type]++;
      const rawRole=typeof value?.role==='string'?value.role:'other';
      roles[ROLES.includes(rawRole)?rawRole:'other']++;
    }catch{invalidJsonLines++;}
  }
  return {validJsonLines,invalidJsonLines,nonemptyLines,truncated,types,roles};
};
const stderrHints=()=>{
  let sample='';
  try{
    const fd=fs.openSync(stderrFile,'r');
    const buffer=Buffer.alloc(500000);
    const n=fs.readSync(fd,buffer,0,buffer.length,0);
    fs.closeSync(fd);
    sample=buffer.toString('utf8',0,n).toLowerCase();
  }catch{ /* missing stderr is not proof of health */ }
  return {
    authHint:/\b401\b|\b403\b|unauthori[sz]ed|invalid.api.key/.test(sample),
    rateLimitHint:/\b429\b|rate.limit|quota.exceed|insufficient.credits/.test(sample),
    connectionHint:/econnreset|etimedout|enotfound|connection.refused|network.error/.test(sample),
    timeoutHint:/time.?out|timed.out|deadline.exceeded/.test(sample),
    otherErrorHint:/\berror\b|traceback|exception/.test(sample)
  };
};
const main=async()=>{
  const code=safeNum(arg('exit-code','255'),0,255);
  const samples=readSamples();
  const latest=sample();
  const events=await countEvents();
  const timelineSummary={
    samples:samples.length,
    samplesWithStdoutGrowth:samples.filter((x,i)=>i>0&&x.stdoutBytes>samples[i-1].stdoutBytes).length,
    samplesWithArtifactGrowth:samples.filter((x,i)=>i>0&&x.candidateBytes>samples[i-1].candidateBytes).length,
    lastStdoutProgressSecond:samples.reduce((acc,x,i)=>i>0&&x.stdoutBytes>samples[i-1].stdoutBytes?x.elapsedSeconds:acc,null),
    firstArtifactSecond:samples.find(x=>x.candidateBytes>0)?.elapsedSeconds??null
  };
  const summary={
    schemaVersion:1,
    exitCode:code,
    termination:code===0?'completed':code===124?'hard_timeout':code===137?'killed':'nonzero_exit',
    elapsedSeconds:safeNum(arg('seconds')),
    modelOutputBytes:latest.stdoutBytes,
    modelErrorBytes:latest.stderrBytes,
    candidatePresent:latest.candidatePresent,
    candidateBytes:latest.candidateBytes,
    noSavedArtifact:latest.candidateBytes===0,
    events,
    timeline:timelineSummary,
    hints:stderrHints(),
    note:'Heuristic, redacted metadata only. No raw model text, prompts, stdout/stderr, source art or secrets are published. A timeout alone does not establish its underlying cause.'
  };
  writeJson(path.join(reportDir,'summary.json'),summary);
  process.stdout.write('CZ-81 safe diagnostics: exit '+code+', output bytes '+summary.modelOutputBytes+', candidate bytes '+summary.candidateBytes+'.\n');
};
await main();
