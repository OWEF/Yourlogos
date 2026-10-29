import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {spawn} from 'node:child_process';

test('Studio static files and safeguards are present',()=>{
 const html=readFileSync('studio.html','utf8');
 const js=readFileSync('studio.js','utf8');
 const backend=readFileSync('server.mjs','utf8');
 for(const id of ['panel-overview','panel-board','panel-roadmap','panel-activity','task-dialog','milestone-dialog'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/name="robots" content="noindex,nofollow"/);
 assert.match(js,/from\('studio_tasks'\)/);
 assert.match(js,/from\('studio_milestones'\)/);
 assert.match(js,/from\('studio_updates'\)/);
 assert.match(js,/signInWithOtp/);
 assert.match(js,/shouldCreateUser:true/);
 assert.match(js,/over_email_send_rate_limit/);
 assert.match(html,/id="check-session"/);
 assert.match(js,/emailRedirectTo:location.origin\+'\/studio\.html'/);
 assert.match(js,/esc\(/);
 assert.match(backend,/if\(pathname==="\/api\/studio-feed"\)/);
 assert.match(backend,/api\.github\.com/);
 assert.doesNotMatch(js,/service_role|SECRET_KEY|GH_TOKEN/);
});
test('YourLogos serves Studio files without disrupting existing API',async()=>{
 const port=27000+Math.floor(Math.random()*2000);
 const proc=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
 try{
  let ready=false;
  for(let i=0;i<80;i++){
   if(proc.exitCode!==null)throw Error('Server exited with '+proc.exitCode);
   try{const r=await fetch('http://127.0.0.1:'+port+'/api/health');if(r.ok){ready=true;break}}catch{}
   await new Promise(resolve=>setTimeout(resolve,100));
  }
  assert.ok(ready,'server did not become ready');
  for(const [path,expected] of [['/studio.html','text/html'],['/studio.js','text/javascript'],['/studio.css','text/css'],['/api/health','application/json'],['/api/public-config','application/json']]){
    const res=await fetch('http://127.0.0.1:'+port+path);
    assert.equal(res.status,200,path);
    assert.ok((res.headers.get('content-type')||'').includes(expected),path);
    assert.ok((await res.text()).length>5,path);
  }
  const blocked=await fetch('http://127.0.0.1:'+port+'/api/studio-feed',{method:'POST'});
  assert.equal(blocked.status,405);
  const missing=await fetch('http://127.0.0.1:'+port+'/supabase/migrations/test.sql');
  assert.equal(missing.status,404);
 }finally{proc.kill('SIGTERM')}
});
