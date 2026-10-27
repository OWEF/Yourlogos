// Little Logo v3: a small articulated, reaction-driven canvas companion.
// No network or AI calls. A shared render loop pauses offscreen and on hidden tabs.
const IMAGE_URL="/little-logo-hd-v2.jpg";
const SIZE=320;
const moods=["idle","curious","reflective","surprised","thinking","delighted","encourage"];
const instances=new Map();
let source=null,layers=null,loop=0,lastFrame=0;
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
function canvas(){const c=document.createElement("canvas");c.width=c.height=SIZE;return c}
function region(img,cx,cy,rx,ry){
 const out=canvas(),ctx=out.getContext("2d");
 ctx.drawImage(img,0,0,SIZE,SIZE);
 ctx.globalCompositeOperation="destination-in";
 ctx.save();ctx.translate(cx,cy);ctx.scale(rx,ry);
 const g=ctx.createRadialGradient(0,0,.46,0,0,1);
 g.addColorStop(0,"rgba(0,0,0,1)");
 g.addColorStop(.63,"rgba(0,0,0,.95)");
 g.addColorStop(1,"rgba(0,0,0,0)");
 ctx.fillStyle=g;ctx.fillRect(-1.05,-1.05,2.1,2.1);ctx.restore();
 ctx.globalCompositeOperation="source-over";return out;
}
function warmImage(){
 const img=new Image();img.decoding="async";img.src=IMAGE_URL;
 img.onload=()=>{
  if(img.naturalWidth<200)return;
  const base=canvas(),c=base.getContext("2d",{willReadFrequently:false});
  c.drawImage(img,0,0,SIZE,SIZE);
  source=base;
  layers={hair:region(base,157,89,124,83),scarf:region(base,103,218,100,65),hands:region(base,262,191,47,53)};
  mount();ensureLoop();
 };
}
function getMood(el){
 for(const mood of moods)if(el.classList.contains("yl-logo-pet-"+mood))return mood;
 return "idle";
}
function mount(){
 document.querySelectorAll(".yl-logo-pet").forEach(el=>{
  if(instances.has(el))return;
  const canvasEl=el.querySelector(".yl-logo-pet-canvas");
  if(!canvasEl||!source)return;
  const ctx=canvasEl.getContext("2d",{alpha:true});
  if(!ctx)return;
  instances.set(el,{el,ctx,mood:getMood(el),changed:performance.now(),born:performance.now(),visible:true});
  el.classList.add("yl-pet-is-rigged");
 });
 for(const [node] of instances)if(!node.isConnected)instances.delete(node);
 if(instances.size)ensureLoop();
}
function ensureLoop(){if(!loop&&!reduced.matches&&instances.size&&!document.hidden)loop=requestAnimationFrame(frame)}
function blend(t){const x=Math.max(0,Math.min(1,t));return x*x*(3-2*x)}
function arc(ctx,x,y,r,alpha){
 ctx.globalAlpha=alpha;ctx.fillStyle="#f1d6a1";ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
}
function eyeClose(ctx,cx,cy,rx,ry){
 // Borrow natural forehead texture to close the illustrated eyes (no flat stickers).
 ctx.save();ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.clip();
 ctx.drawImage(source,cx-rx-2,cy-ry-37,rx*2+4,ry*2+4,cx-rx-2,cy-ry-3,rx*2+4,ry*2+7);
 ctx.restore();
 ctx.strokeStyle="rgba(105,67,54,.78)";ctx.lineWidth=1.8;ctx.lineCap="round";
 ctx.beginPath();ctx.moveTo(cx-rx*.75,cy+1);ctx.quadraticCurveTo(cx,cy+ry*.45,cx+rx*.74,cy+1);ctx.stroke();
}
function paint(p,now){
 const {ctx,el}=p;
 const mood=getMood(el);
 if(mood!==p.mood){p.mood=mood;p.changed=now}
 const t=now*.001,elapsed=(now-p.changed)*.001;
 const breath=Math.sin(t*2.15);
 const initial=blend(Math.min(1,elapsed/.5));
 let dx=3*Math.sin(t*.85),dy=2.4*breath,angle=breath*.009,scale=1;
 let blink=(t+(p.born*.001)%2.5)%4.9>4.68;
 if(mood==="curious"){angle+=.12*Math.sin(Math.min(1,elapsed/.8)*Math.PI/2)*Math.max(.38,1-elapsed/2);dx+=7*initial;blink=false}
 if(mood==="reflective"||mood==="encourage"){
  const nod=Math.sin(Math.min(1,elapsed/1.15)*Math.PI*2);
  dy+=8*Math.max(0,nod);angle-=.05*nod;
  blink=elapsed>.22&&elapsed<.48;
 }
 if(mood==="surprised"){
  const kick=Math.max(0,1-elapsed/1.2);
  dy-=26*Math.sin(Math.min(1,elapsed/.7)*Math.PI)*kick;
  scale+=.09*Math.sin(Math.min(1,elapsed/.7)*Math.PI)*kick;
  angle+=.075*kick;blink=false;
 }
 if(mood==="thinking"){
  dy+=5*Math.sin(t*3.6);angle+=.05*Math.sin(t*1.8);
  blink=Math.sin(t*4)>.83;
 }
 if(mood==="delighted"){
  const hop=Math.abs(Math.sin(Math.min(elapsed,1.2)*Math.PI*2.4));
  dy-=23*hop*Math.max(.1,1-elapsed/2);
  angle+=.13*Math.sin(elapsed*10)*Math.max(0,1-elapsed/1.7);
  scale+=.045*hop;
  blink=false;
 }
 ctx.clearRect(0,0,SIZE,SIZE);
 ctx.save();
 ctx.translate(160+dx,169+dy);ctx.rotate(angle);ctx.scale(scale,scale);ctx.translate(-160,-169);
 ctx.drawImage(source,0,0);
 // The hair, scarf and hands are independent feather-masked parts, not one flat picture.
 ctx.save();ctx.translate(157,96);ctx.rotate(.026*Math.sin(t*3.4)+(mood==="surprised"?.12*Math.exp(-elapsed*3):0));ctx.translate(-157,-96);ctx.drawImage(layers.hair,0,0);ctx.restore();
 ctx.save();ctx.translate(123,229);ctx.rotate(.045*Math.sin(t*3.1+1)+(mood==="delighted"?.1*Math.exp(-elapsed*2):0));ctx.translate(-123,-229);ctx.drawImage(layers.scarf,0,0);ctx.restore();
 ctx.save();ctx.translate(267,199);ctx.rotate(.04*Math.sin(t*2.6));ctx.translate(-267,-199);ctx.drawImage(layers.hands,0,0);ctx.restore();
 if(blink){
  eyeClose(ctx,202,133,10.5,13);
  eyeClose(ctx,262,126,8.4,11);
 }
 ctx.restore();
 // Little visual thoughts follow actions; nothing here judges a philosophical stance.
 const flash=Math.max(0,1-elapsed/1.35);
 if(mood==="thinking"){
  for(let i=0;i<3;i++)arc(ctx,225+i*14,33+Math.sin(t*3+i)*5,3+i*.4,.18+Math.max(0,Math.sin(t*2+i))*.55);
 }
 if(mood==="surprised"||mood==="delighted"||mood==="encourage"){
  ctx.save();ctx.translate(160,130);
  for(let i=0;i<5;i++){
   const a=(i/5)*Math.PI*2+t*.3;
   const radius=88+(1-flash)*30;
   arc(ctx,Math.cos(a)*radius,Math.sin(a)*radius*.83,2+i%2,flash*.67);
  }
  ctx.restore();
 }
}
function frame(now){
 loop=0;
 if(document.hidden||reduced.matches||!source)return;
 // Safari/iPhone can invoke a lower display rate; never spin a busy timer.
 if(now-lastFrame>9){
  lastFrame=now;
  for(const p of instances.values()){
   if(!p.el.isConnected){instances.delete(p.el);continue}
   const rect=p.el.getBoundingClientRect();
   if(rect.bottom<0||rect.top>window.innerHeight||!rect.width)continue;
   paint(p,now);
  }
 }
 if(instances.size)loop=requestAnimationFrame(frame);
}
export function startLittleLogoAnimator(){
 warmImage();
 const observer=new MutationObserver(()=>{if(source)mount()});
 observer.observe(document.body,{subtree:true,childList:true});
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)ensureLoop()});
 reduced.addEventListener?.("change",()=>{
  if(reduced.matches){if(loop)cancelAnimationFrame(loop);loop=0;
   instances.forEach(p=>p.el.classList.remove("yl-pet-is-rigged"))}
  else {instances.forEach(p=>p.el.classList.add("yl-pet-is-rigged"));ensureLoop()}
 });
}
