import {AUTH_URL,AUTH_PUBLISHABLE_KEY} from './auth-config.js';

const q=(sel,root=document)=>root.querySelector(sel);
const qa=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
const STATUSES=[['backlog','Backlog'],['todo','To do'],['progress','In progress'],['review','In review'],['done','Done']];
const PRIORITY_ORDER={urgent:0,high:1,medium:2,low:3};
const BASE_PLAN=[
  ['Product foundation','Clarify the product promise, user journey and technical foundations.','active'],
  ['Discover & engagement','Deliver a coherent philosophy experience with thoughtful, reliable interactions.','planned'],
  ['Private beta & quality','Validate usability, privacy, accessibility, content and reliability with real testers.','planned'],
  ['Commercial readiness','Confirm positioning, measurement, onboarding and sustainable monetization.','planned'],
  ['Public launch & growth','Release intentionally, gather feedback and establish a repeatable growth loop.','planned']
];
const STARTER_TASKS=[
 ['Define target user and core value proposition','Document the user problem, initial audience and what differentiates YourLogos.','high','Product','Product foundation'],
 ['Audit the current three-tab user journey','Walk through Discover, Library and Constellation on iPhone and desktop; record UX blockers.','high','Design','Product foundation'],
 ['Verify Discover v3 on real devices','Regression-test the new portraits, LilLogo animations and AI fallback including reduced motion.','high','Engineering','Discover & engagement'],
 ['Clarify the philosophy fingerprint model','Define which behaviors change a user profile and make the logic explainable.','high','Product','Discover & engagement'],
 ['Define activation and retention events','Choose privacy-conscious metrics for first meaningful encounter and return behavior.','medium','Growth','Commercial readiness'],
 ['Create a small private beta feedback process','Recruit initial testers, collect feedback with consent and prioritize blockers.','high','Product','Private beta & quality'],
 ['Security and privacy release checklist','Review Supabase RLS, consent, account sync, data export and API rate limits.','urgent','Engineering','Private beta & quality'],
 ['Design monetization hypotheses','Define potential customer value, willingness-to-pay assumptions and what stays free.','medium','Growth','Commercial readiness'],
 ['Write launch readiness criteria','Define go/no-go checks for reliability, content, onboarding and support.','high','Operations','Public launch & growth']
];
const state={client:null,user:null,tasks:[],milestones:[],notes:[],feed:null,tab:'overview',editingTask:null,editingMilestone:null,loading:false};
const formatDate=(d,withTime=false)=>{if(!d)return 'Not set';let x=new Date(d);if(Number.isNaN(+x))return '';return x.toLocaleString(undefined,withTime?{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}:{month:'short',day:'numeric',year:'numeric'})};
const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ago=(date)=>{const d=(Date.now()-new Date(date).getTime())/1000;if(!Number.isFinite(d))return '';if(d<60)return 'just now';if(d<3600)return Math.floor(d/60)+'m ago';if(d<86400)return Math.floor(d/3600)+'h ago';if(d<604800)return Math.floor(d/86400)+'d ago';return formatDate(date)};
function toast(message,error=false){let e=q('#toast');e.textContent=message;e.style.borderColor=error?'#a65866':'#7462ba';e.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>e.hidden=true,4300)}
function showLogin(message=''){q('#workspace').hidden=true;q('#login-screen').hidden=false;if(message)q('#login-status').textContent=message}
function showWorkspace(){q('#login-screen').hidden=true;q('#workspace').hidden=false}
async function makeClient(){
 if(state.client)return state.client;
 if(!AUTH_URL||!AUTH_PUBLISHABLE_KEY)throw new Error('YourLogos sign-in is not configured. Check the existing application account settings.');
 const {createClient}=await import('https://esm.sh/@supabase/supabase-js@2.57.0');
 state.client=createClient(AUTH_URL,AUTH_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
 return state.client;
}
async function init(){
 bind();
 try{
  const c=await makeClient();
  const {data,error}=await c.auth.getUser();
  if(error||!data?.user){showLogin();return}
  state.user=data.user;
  showWorkspace();
  await loadAll();
 }catch(err){showLogin(err.message||'Could not connect to sign-in.')}
}
async function refreshIdentity(){
 const {data,error}=await state.client.auth.getUser();
 if(error||!data?.user){showLogin('Your session has ended. Please sign in again.');return false}
 state.user=data.user;return true;
}
async function loadAll(){
 if(state.loading)return;
 state.loading=true;
 q('#sync-label').textContent='Syncing';
 try{
  const c=state.client;
  if(!await refreshIdentity())return;
  const out=await Promise.all([
   c.from('studio_tasks').select('*').order('updated_at',{ascending:false}).limit(500),
   c.from('studio_milestones').select('*').order('sort_order',{ascending:true}).limit(100),
   c.from('studio_updates').select('*').order('created_at',{ascending:false}).limit(100),
   fetch('/api/studio-feed',{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error('GitHub feed unavailable');return r.json()}).catch(e=>({error:e.message}))
  ]);
  for(let i=0;i<3;i++)if(out[i].error)throw out[i].error;
  state.tasks=out[0].data||[];state.milestones=out[1].data||[];state.notes=out[2].data||[];
  state.feed=out[3];
  render();
  q('#sync-label').textContent='Updated '+new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});
  q('#sync-dot').classList.toggle('offline',Boolean(out[3]?.error));
 }catch(e){
  q('#sync-label').textContent='Sync issue';
  q('#sync-dot').classList.add('offline');
  toast('Could not load your private workspace: '+e.message,true);
 }finally{state.loading=false}
}
function navigate(tab){
 if(!['overview','board','roadmap','activity'].includes(tab))return;
 state.tab=tab;
 qa('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
 qa('.tab-panel').forEach(el=>el.hidden=el.id!=='panel-'+tab);
 q('#breadcrumb-current').textContent={overview:'Overview',board:'Task board',roadmap:'Roadmap',activity:'Activity log'}[tab];
 history.replaceState(null,'','#'+tab);
 window.scrollTo({top:0,behavior:'instant'});
}
function bind(){
 qa('.nav-btn').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.tab)));
 qa('[data-goto]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.goto)));
 q('#refresh-btn').addEventListener('click',loadAll);

 q('#check-session').addEventListener('click',async()=>{
  const button=q('#check-session');
  button.disabled=true;
  q('#login-status').textContent='Checking for an existing signed-in session…';
  try{
   const c=await makeClient();
   const {data,error}=await c.auth.getUser();
   if(error||!data?.user){
    q('#login-status').textContent='No active session found in this browser. Your account is confirmed, but this device still needs to sign in once the email quota recovers or a custom SMTP sender is configured.';
    return;
   }
   state.user=data.user;
   showWorkspace();
   await loadAll();
  }catch(err){
   q('#login-status').textContent='Session check failed: '+(err.message||'unknown error');
  }finally{button.disabled=false}
 });
 q('#login-form').addEventListener('submit',async e=>{
  e.preventDefault();
  q('#login-submit').disabled=true;
  q('#login-status').textContent='Sending a secure sign-in email…';
  try{
   const c=await makeClient();
   const email=q('#login-email').value.trim();
   const {error}=await c.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+'/studio.html',shouldCreateUser:true}});
   if(error)throw error;
   q('#login-status').textContent='Check your email and open the new secure link in the same browser. It should return to Studio.';
  }catch(err){
   const code=String(err.code||'').toLowerCase();
   const message=String(err.message||'');
   if(code==='over_email_send_rate_limit'||/email rate limit exceeded/i.test(message)){
    q('#login-status').textContent='Supabase has reached its project-wide email quota (2 messages per hour with its built-in sender). No new link was sent. Stop retrying for now. Try “Check existing session” or configure a custom SMTP sender under Supabase Authentication settings.';
   }else if(code==='otp_disabled'){
    q('#login-status').textContent='Supabase rejected passwordless login. Check Supabase Authentication → Providers → Email. Your confirmed account has not been deleted.';
   }else{
    q('#login-status').textContent=message||'Could not send sign-in email';
   }
  }finally{q('#login-submit').disabled=false}
 });
 q('#sign-out').addEventListener('click',async()=>{if(state.client)await state.client.auth.signOut();state.user=null;showLogin('Signed out.');});
 ['overview-new-task','board-new-task','quick-new-task'].forEach(id=>q('#'+id).addEventListener('click',()=>openTask()));
 q('#task-form').addEventListener('submit',saveTask);
 q('#delete-task').addEventListener('click',deleteTask);
 q('#new-milestone').addEventListener('click',()=>openMilestone());
 q('#milestone-form').addEventListener('submit',saveMilestone);
 q('#delete-milestone').addEventListener('click',deleteMilestone);
 qa('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
 q('#task-search').addEventListener('input',renderBoard);
 q('#task-area-filter').addEventListener('change',renderBoard);
 q('#seed-board').addEventListener('click',seedPlan);
 q('#new-note').addEventListener('click',()=>{navigate('activity');q('#log-body').focus()});
 q('#quick-log-form').addEventListener('submit',saveNote);
 q('#board-columns').addEventListener('click',e=>{let card=e.target.closest('[data-task-id]');if(card&&e.target.tagName!=='SELECT')openTask(card.dataset.taskId)});
 q('#board-columns').addEventListener('change',async e=>{if(e.target.matches('.ticket-status')){let task=state.tasks.find(t=>t.id===e.target.dataset.id);if(task)await setTaskStatus(task,e.target.value)}});
 q('#board-columns').addEventListener('dragstart',e=>{const card=e.target.closest('[data-task-id]');if(card){e.dataTransfer.setData('text/plain',card.dataset.taskId);card.classList.add('dragging')}});
 q('#board-columns').addEventListener('dragend',()=>qa('.dragging,.drag-over').forEach(el=>el.classList.remove('dragging','drag-over')));
 q('#board-columns').addEventListener('dragover',e=>{let col=e.target.closest('.board-column');if(col){e.preventDefault();col.classList.add('drag-over')}});
 q('#board-columns').addEventListener('dragleave',e=>{let col=e.target.closest('.board-column');if(col&&!col.contains(e.relatedTarget))col.classList.remove('drag-over')});
 q('#board-columns').addEventListener('drop',async e=>{let col=e.target.closest('.board-column');if(!col)return;e.preventDefault();col.classList.remove('drag-over');let t=state.tasks.find(t=>t.id===e.dataTransfer.getData('text/plain'));if(t)await setTaskStatus(t,col.dataset.status)});
 q('#milestone-list').addEventListener('click',e=>{let b=e.target.closest('[data-edit-milestone]');if(b)openMilestone(b.dataset.editMilestone)});
 q('#milestone-list').addEventListener('change',async e=>{if(e.target.matches('[data-status-milestone]'))await changeMilestoneStatus(e.target.dataset.statusMilestone,e.target.value)});
 q('#manual-activity').addEventListener('click',async e=>{let b=e.target.closest('[data-delete-note]');if(!b)return;if(!confirm('Delete this journal entry?'))return;try{const {error}=await state.client.from('studio_updates').delete().eq('id',b.dataset.deleteNote);if(error)throw error;await reloadPrivate();toast('Entry deleted')}catch(err){toast(err.message,true)}});
 if(location.hash)navigate(location.hash.slice(1));
}
async function reloadPrivate(){
 const c=state.client;
 const [a,b,d]=await Promise.all([
  c.from('studio_tasks').select('*').order('updated_at',{ascending:false}).limit(500),
  c.from('studio_milestones').select('*').order('sort_order',{ascending:true}).limit(100),
  c.from('studio_updates').select('*').order('created_at',{ascending:false}).limit(100)
 ]);
 for(const x of [a,b,d])if(x.error)throw x.error;
 state.tasks=a.data||[];state.milestones=b.data||[];state.notes=d.data||[];render();
}
function render(){
 renderOverview();renderBoard();renderRoadmap();renderActivity();
 q('#milestone-options').innerHTML=state.milestones.map(m=>'<option value="'+esc(m.title)+'"></option>').join('');
}
function renderOverview(){
 const todo=state.tasks.filter(t=>['backlog','todo'].includes(t.status)).length;
 const active=state.tasks.filter(t=>['progress','review'].includes(t.status)).length;
 const done=state.tasks.filter(t=>t.status==='done').length;
 const n=state.tasks.length;
 q('#stat-planned').textContent=todo;q('#stat-active').textContent=active;q('#stat-done').textContent=done;
 q('#stat-merged').textContent=state.feed?.pullRequests?state.feed.pullRequests.filter(p=>p.merged_at&&Date.now()-new Date(p.merged_at).getTime()<604800000).length:'—';
 const pct=n?Math.round(done*100/n):null;
 q('#progress-number').textContent=pct===null?'—':pct+'%';
 q('#progress-fill').style.width=(pct||0)+'%';
 q('#progress-pill').textContent=n?'Tasks completed':'Not baselined';
 q('#progress-detail').textContent=n?done+' of '+n+' tracked tasks marked done. Measures only tasks created in Studio, not all product functionality.':'Add tasks or import the proposed plan to establish a measurable baseline.';
 q('#overview-milestones').innerHTML=state.milestones.length?state.milestones.slice(0,3).map(m=>'<div class="mini-line"><span class="circle '+(m.status==='done'?'done':'')+'">'+(m.status==='done'?'✓':'◇')+'</span><span class="mini-text"><b>'+esc(m.title)+'</b><small>'+esc({planned:'Planned',active:'In motion',done:'Completed'}[m.status])+'</small></span></div>').join(''):'<p class="empty">No milestones yet. Define launch gates in the Roadmap tab.</p>';
 const next=state.tasks.filter(t=>t.status!=='done').sort((a,b)=>(PRIORITY_ORDER[a.priority]??2)-(PRIORITY_ORDER[b.priority]??2)).slice(0,4);
 q('#overview-next').innerHTML=next.length?next.map(t=>'<div class="task-mini"><span class="mini-text"><b>'+esc(t.title)+'</b><small>'+esc(t.area)+' · '+esc(STATUSES.find(x=>x[0]===t.status)?.[1])+'</small></span><span class="priority '+esc(t.priority)+'">'+esc(t.priority.toUpperCase())+'</span></div>').join(''):'<p class="empty">No open tasks. Add your next priority to get started.</p>';
 let gates=state.milestones.filter(m=>/beta|commercial|launch/i.test(m.title));
 if(!gates.length)gates=state.milestones.slice(-3);
 q('#overview-launch').innerHTML=gates.length?gates.map(m=>'<div class="launch-line"><span class="launch-icon '+(m.status==='done'?'done':'')+'">'+(m.status==='done'?'✓':'◇')+'</span><span class="mini-text"><b>'+esc(m.title)+'</b><small>'+esc(m.status==='done'?'Verified complete by founder':m.status==='active'?'In progress':'Not yet approved')+'</small></span></div>').join(''):'<p class="empty">Commercial readiness is not yet assessed. Set milestone success criteria before assigning a launch status.</p>';
 let feed=state.feed||{};
 const oneDay=Date.now()-86400000;
 const commits=(feed.commits||[]).filter(c=>new Date(c.date).getTime()>oneDay);
 const merges=(feed.pullRequests||[]).filter(p=>p.merged_at&&new Date(p.merged_at).getTime()>oneDay);
 q('#yesterday-label').textContent='Past 24 hours';
 q('#yesterday-stats').innerHTML='<span>'+commits.length+' commits</span><span>'+merges.length+' merged PRs</span><span>'+state.notes.filter(x=>new Date(x.created_at).getTime()>oneDay).length+' notes</span>';
 q('#overview-activity').innerHTML=feed.error?'<p class="empty">GitHub feed is temporarily unavailable. Your manual data is safe.</p>':commits.length?commits.slice(0,3).map(c=>'<div class="activity-mini"><span class="event-icon">⑂</span><span class="activity-text"><b>'+esc(c.message)+'</b><small>'+esc(ago(c.date))+' · '+esc(c.sha.slice(0,7))+'</small></span></div>').join(''):'<p class="empty">No commits in the last 24 hours. Browse Activity for earlier work.</p>';
}
function renderBoard(){
 const filter=q('#task-area-filter').value;
 const needle=q('#task-search').value.trim().toLowerCase();
 const tasks=state.tasks.filter(t=>(!filter||t.area===filter)&&(!needle||(t.title+' '+t.description+' '+t.milestone).toLowerCase().includes(needle)));
 q('#board-columns').innerHTML=STATUSES.map(([code,name])=>{
  let items=tasks.filter(t=>t.status===code).sort((a,b)=>(PRIORITY_ORDER[a.priority]??2)-(PRIORITY_ORDER[b.priority]??2));
  return '<section class="board-column" data-status="'+code+'"><div class="board-heading"><span><span class="status-dot"></span>'+name+'</span><span class="count">'+items.length+'</span></div><div>'+items.map(t=>
  '<article class="ticket" draggable="true" data-task-id="'+esc(t.id)+'" tabindex="0" aria-label="Edit '+esc(t.title)+'"><div class="ticket-title">'+esc(t.title)+'</div>'+(t.description?'<div class="ticket-description">'+esc(t.description.slice(0,105))+(t.description.length>105?'…':'')+'</div>':'')+'<div class="ticket-footer"><span class="tag">'+esc(t.area)+'</span><span class="priority '+esc(t.priority)+'">'+esc(t.priority.toUpperCase())+'</span></div><select class="ticket-status" data-id="'+esc(t.id)+'" aria-label="Change status for '+esc(t.title)+'">'+STATUSES.map(([s,n])=>'<option value="'+s+'" '+(s===t.status?'selected':'')+'>'+n+'</option>').join('')+'</select></article>').join('')+'</div>'+(items.length?'':'<div class="board-empty">Drop tasks here</div>')+'</section>';
 }).join('');
 qa('.ticket').forEach(e=>e.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.target.matches('select'))openTask(e.dataset.taskId)}));
}
function renderRoadmap(){
 q('#milestone-list').innerHTML=state.milestones.length?state.milestones.map((m,i)=>{
  const linked=state.tasks.filter(t=>t.milestone===m.title);
  const done=linked.filter(t=>t.status==='done').length;
  return '<article class="milestone-card"><div class="milestone-number">'+String(i+1).padStart(2,'0')+'</div><div class="milestone-main"><h3>'+esc(m.title)+'</h3><p>'+esc(m.description||'Define success criteria for this milestone.')+'</p><div class="milestone-meta">'+linked.length+' linked tasks · '+done+' completed'+(m.target_date?' · Target '+esc(formatDate(m.target_date)):'')+'</div></div><div class="milestone-actions"><select data-status-milestone="'+esc(m.id)+'" aria-label="Status of '+esc(m.title)+'"><option value="planned" '+(m.status==='planned'?'selected':'')+'>Planned</option><option value="active" '+(m.status==='active'?'selected':'')+'>Active</option><option value="done" '+(m.status==='done'?'selected':'')+'>Done</option></select><button data-edit-milestone="'+esc(m.id)+'">Edit</button></div></article>'
 }).join(''):'<div class="surface"><p class="empty">No roadmap milestones yet. Add one, or import the proposed starter plan from Task board.</p></div>';
}
function renderActivity(){
 const feed=state.feed||{};
 const events=[...(feed.commits||[]).map(c=>({type:'commit',date:c.date,title:c.message,url:c.url,desc:'Commit '+c.sha.slice(0,7)})),...(feed.pullRequests||[]).filter(p=>p.merged_at).map(p=>({type:'merge',date:p.merged_at,title:p.title,url:p.url,desc:'Merged pull request #'+p.number}))].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,55);
 q('#all-git-activity').innerHTML=feed.error?'<p class="empty">GitHub status unavailable: '+esc(feed.error)+'</p>':events.length?events.map(e=>'<div class="git-event"><span class="event-icon '+(e.type==='merge'?'deploy':'')+'">'+(e.type==='merge'?'✓':'⑂')+'</span><span class="event-body"><b><a target="_blank" rel="noopener" href="'+esc(e.url)+'">'+esc(e.title)+'</a></b><small>'+esc(e.desc)+' · '+esc(formatDate(e.date,true))+'</small></span></div>').join(''):'<p class="empty">No GitHub activity returned.</p>';
 const liveSha=feed.production?.commit||null;
 if(liveSha){
  const aligned=feed.commits?.[0]?.sha===liveSha;
  const label=aligned?'Production aligned with GitHub main':'Live production commit (may trail GitHub main)';
  q('#all-git-activity').insertAdjacentHTML('afterbegin','<div class="git-event"><span class="event-icon deploy">✓</span><span class="event-body"><b>'+esc(label)+'</b><small>Railway · release '+esc(liveSha.slice(0,10))+' · commit reported by running service</small></span></div>');
 }
 q('#manual-activity').innerHTML=state.notes.length?state.notes.map(n=>'<div class="note-event"><span class="event-icon">'+esc({note:'✎',decision:'◇',blocker:'!',release:'↗'}[n.kind]||'✎')+'</span><span class="event-body"><b>'+esc((n.kind||'note').toUpperCase())+'</b><small class="note-text">'+esc(n.body)+'</small><small>'+esc(formatDate(n.created_at,true))+'</small></span><button class="small-btn" data-delete-note="'+esc(n.id)+'" aria-label="Delete note">✕</button></div>').join(''):'<p class="empty">Your founder journal is empty. Record decisions, blockers, test results or learnings here.</p>';
}
function openTask(id){
 const t=state.tasks.find(t=>t.id===id);
 state.editingTask=t?.id||null;
 q('#task-modal-title').textContent=t?'Edit task':'New task';
 q('#task-title').value=t?.title||'';
 q('#task-description').value=t?.description||'';
 q('#task-status').value=t?.status||'backlog';
 q('#task-priority').value=t?.priority||'medium';
 q('#task-area').value=t?.area||'Product';
 q('#task-due').value=t?.due_date||'';
 q('#task-milestone').value=t?.milestone||state.milestones.find(m=>m.status==='active')?.title||'Product foundation';
 q('#delete-task').hidden=!t;
 q('#task-dialog').showModal();
}
async function saveTask(e){
 e.preventDefault();
 const title=q('#task-title').value.trim();
 if(!title)return;
 const status=q('#task-status').value;
 const prior=state.tasks.find(t=>t.id===state.editingTask);
 const data={title,description:q('#task-description').value.trim(),status,priority:q('#task-priority').value,area:q('#task-area').value,milestone:q('#task-milestone').value.trim()||'Product foundation',due_date:q('#task-due').value||null,updated_at:new Date().toISOString(),completed_at:status==='done'?(prior?.completed_at||new Date().toISOString()):null};
 try{
  const c=state.client;
  const result=state.editingTask?await c.from('studio_tasks').update(data).eq('id',state.editingTask):await c.from('studio_tasks').insert(data);
  if(result.error)throw result.error;
  q('#task-dialog').close();await reloadPrivate();toast('Task saved');
 }catch(err){toast(err.message||'Could not save task',true)}
}
async function setTaskStatus(task,status){
 if(task.status===status)return;
 const {error}=await state.client.from('studio_tasks').update({status,updated_at:new Date().toISOString(),completed_at:status==='done'?(task.completed_at||new Date().toISOString()):null}).eq('id',task.id);
 if(error){toast(error.message,true);renderBoard();return}
 await reloadPrivate();toast('Moved to '+(STATUSES.find(s=>s[0]===status)?.[1]||status));
}
async function deleteTask(){
 if(!state.editingTask||!confirm('Delete this task permanently?'))return;
 const {error}=await state.client.from('studio_tasks').delete().eq('id',state.editingTask);
 if(error){toast(error.message,true);return}
 q('#task-dialog').close();await reloadPrivate();toast('Task deleted');
}
function openMilestone(id){
 const m=state.milestones.find(m=>m.id===id);
 state.editingMilestone=m?.id||null;
 q('#milestone-modal-title').textContent=m?'Edit milestone':'New milestone';
 q('#milestone-title').value=m?.title||'';
 q('#milestone-description').value=m?.description||'';
 q('#milestone-status').value=m?.status||'planned';
 q('#milestone-target').value=m?.target_date||'';
 q('#delete-milestone').hidden=!m;
 q('#milestone-dialog').showModal();
}
async function saveMilestone(e){
 e.preventDefault();
 const title=q('#milestone-title').value.trim();if(!title)return;
 const data={title,description:q('#milestone-description').value.trim(),status:q('#milestone-status').value,target_date:q('#milestone-target').value||null,updated_at:new Date().toISOString()};
 if(!state.editingMilestone)data.sort_order=state.milestones.length;
 try{
  const result=state.editingMilestone?await state.client.from('studio_milestones').update(data).eq('id',state.editingMilestone):await state.client.from('studio_milestones').insert(data);
  if(result.error)throw result.error;
  q('#milestone-dialog').close();await reloadPrivate();toast('Milestone saved');
 }catch(err){toast(err.message,true)}
}
async function changeMilestoneStatus(id,status){
 const {error}=await state.client.from('studio_milestones').update({status,updated_at:new Date().toISOString()}).eq('id',id);
 if(error){toast(error.message,true);renderRoadmap();return}
 await reloadPrivate();toast('Milestone updated');
}
async function deleteMilestone(){
 if(!state.editingMilestone||!confirm('Delete this milestone? Linked tasks will stay in your board.'))return;
 const {error}=await state.client.from('studio_milestones').delete().eq('id',state.editingMilestone);
 if(error){toast(error.message,true);return}
 q('#milestone-dialog').close();await reloadPrivate();toast('Milestone deleted');
}
async function saveNote(e){
 e.preventDefault();
 const body=q('#log-body').value.trim();if(!body)return;
 try{
  const {error}=await state.client.from('studio_updates').insert({body,kind:q('#log-kind').value});
  if(error)throw error;
  q('#log-body').value='';await reloadPrivate();toast('Update recorded');
 }catch(err){toast(err.message,true)}
}
async function seedPlan(){
 const existing=state.tasks.length+state.milestones.length;
 if(existing&&!confirm('Add the proposed starter plan alongside your existing items? This creates planned tasks and milestones, not completed work.'))return;
 q('#seed-board').disabled=true;
 try{
  const added=new Set(state.milestones.map(m=>m.title));
  const milestones=BASE_PLAN.filter(m=>!added.has(m[0])).map(([title,description,status],i)=>({title,description,status,sort_order:state.milestones.length+i}));
  if(milestones.length){const {error}=await state.client.from('studio_milestones').insert(milestones);if(error)throw error}
  const current=new Set(state.tasks.map(t=>t.title));
  const tasks=STARTER_TASKS.filter(x=>!current.has(x[0])).map(([title,description,priority,area,milestone])=>({title,description,priority,area,milestone,status:'backlog'}));
  if(tasks.length){const {error}=await state.client.from('studio_tasks').insert(tasks);if(error)throw error}
  await reloadPrivate();toast('Starter roadmap added — all tasks are unverified');
 }catch(err){toast('Could not import plan: '+err.message,true)}finally{q('#seed-board').disabled=false}
}
init();
