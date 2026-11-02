/* Waterline entrance slider: visual-only enhancement.
 * Uses the existing "yourlogos:slider-progress" event from welcome.js.
 * Never takes ownership of the swipe, keyboard, focus, or entry behavior.
 */
const attached = new WeakMap();
const VERT = `attribute vec2 aPos;
void main(){gl_Position=vec4(aPos,0.,1.);}`;
const FRAG = `
precision highp float;
uniform vec2 uSize;
uniform float uDpr, uProgress, uTime, uMotion, uPulse;
float roundedBox(vec2 p,vec2 halfSize,float radius){
  vec2 q=abs(p)-halfSize+radius;
  return length(max(q,0.))+min(max(q.x,q.y),0.)-radius;
}
float smoothUnion(float a,float b,float k){
  float h=clamp(.5+.5*(b-a)/k,0.,1.);
  return mix(b,a,h)-k*h*(1.-h);
}
void main(){
  vec2 p=vec2(gl_FragCoord.x,uSize.y*uDpr-gl_FragCoord.y)/uDpr;
  float front=mix(29.,uSize.x-7.,uProgress);
  float amp=(.7+uMotion*2.0)*smoothstep(.02,.16,uProgress);
  vec2 warped=p;
  warped.x+=amp*(sin(p.y*.16+uTime*7.)*.67+sin(p.y*.28-uTime*4.)*.33)
          *smoothstep(front-45.,front-2.,p.x);
  vec2 center=vec2((front+4.)*.5,uSize.y*.5);
  vec2 halfSize=vec2(max(7.,(front-4.)*.5),max(8.,uSize.y*.5-2.));
  float radius=min(min(halfSize.x,halfSize.y),30.);
  float body=roundedBox(warped-center,halfSize,radius);
  float head=length(p-vec2(front-5.,center.y))-min(25.,uSize.y*.36);
  float d=smoothUnion(body,head,7.);
  float cover=1.-smoothstep(-1.3,1.6,d);
  float edge=exp(-abs(d)*.49)*cover;
  float topGlow=pow(max(0.,1.-abs(p.y-(uSize.y*.23))/19.),3.);
  float lightBand=pow(max(0.,1.-abs((p.x-front)*.4+(p.y-center.y)*1.6)/30.),3.);
  float ripple=sin((front-p.x)*.14-uTime*11.)*exp(-abs(front-p.x)*.05)*uMotion*.10;
  vec3 brass=vec3(.72,.55,.35);
  vec3 pearl=vec3(1.,.96,.86);
  vec3 water=mix(brass,pearl,clamp(.20+edge*.61+topGlow*.20+lightBand*.29+ripple+uPulse*.09,0.,1.));
  float alpha=cover*(.30+edge*.26+topGlow*.13+lightBand*.12+uPulse*.09);
  float shadow=exp(-max(d,0.)*.29)*.08*(1.-cover);
  gl_FragColor=vec4(water,clamp(alpha+shadow,0.,.90));
}`;

function makeGL(canvas){
  const gl=canvas.getContext("webgl",{alpha:true,antialias:false,premultipliedAlpha:true,preserveDrawingBuffer:false});
  if(!gl)return null;
  function shader(type,source){
    const s=gl.createShader(type);
    if(!s)return null;
    gl.shaderSource(s,source);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null;}
    return s;
  }
  const vert=shader(gl.VERTEX_SHADER,VERT),frag=shader(gl.FRAGMENT_SHADER,FRAG);
  if(!vert||!frag)return null;
  const prog=gl.createProgram();
  if(!prog)return null;
  gl.attachShader(prog,vert);gl.attachShader(prog,frag);gl.linkProgram(prog);
  gl.deleteShader(vert);gl.deleteShader(frag);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS))return null;
  const buf=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  gl.useProgram(prog);
  const attr=gl.getAttribLocation(prog,"aPos");
  gl.enableVertexAttribArray(attr);
  gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
  const uniforms={};
  for(const key of ["uSize","uDpr","uProgress","uTime","uMotion","uPulse"])
    uniforms[key]=gl.getUniformLocation(prog,key);
  return {gl,prog,buf,uniforms};
}

export function enhanceEntranceSlider(slider,track,root){
  if(!slider||!track)return null;
  if(attached.has(track))return attached.get(track);
  slider.classList.add("waterline-slider");
  const canvas=document.createElement("canvas");
  canvas.className="yl-liquid-slider-canvas";
  canvas.setAttribute("aria-hidden","true");
  canvas.setAttribute("role","presentation");
  track.insertBefore(canvas,track.firstChild);
  const reduced=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true;
  const state={
    slider,track,canvas,ctx:null,progress:0,lastProgress:0,
    time:0,lastFrame:0,motion:0,pulse:0,frame:0,runUntil:0,visible:true
  };
  attached.set(track,state);
  function fallback(){state.ctx=null;slider.dataset.liquidGl="off";}
  function paint(){
    const ctx=state.ctx;if(!ctx)return;
    const {gl,uniforms:u}=ctx;
    const w=canvas.clientWidth,h=canvas.clientHeight;
    if(!w||!h)return;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const pw=Math.round(w*dpr),ph=Math.round(h*dpr);
    if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph;}
    gl.viewport(0,0,pw,ph);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(ctx.prog);
    gl.uniform2f(u.uSize,w,h);gl.uniform1f(u.uDpr,dpr);
    gl.uniform1f(u.uProgress,state.progress);
    gl.uniform1f(u.uTime,state.time);
    gl.uniform1f(u.uMotion,state.motion);
    gl.uniform1f(u.uPulse,state.pulse);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }
  function tick(now){
    state.frame=0;
    if(document.hidden||!state.visible||root?.hidden)return;
    const dt=Math.min(Math.max(0,now-(state.lastFrame||now)),40)/1000;
    state.lastFrame=now;state.time+=dt;
    state.motion*=Math.exp(-dt*5.5);
    state.pulse*=Math.exp(-dt*4.5);
    try{paint();}catch{fallback();return;}
    if(now<state.runUntil || state.motion>.01 || state.pulse>.01)schedule();
  }
  function schedule(){
    if(!state.frame&&state.ctx&&state.visible&&!document.hidden&&!root?.hidden)
      state.frame=requestAnimationFrame(tick);
  }
  function sync(event){
    const p=Number(event?.detail?.progress);
    const next=Number.isFinite(p)?Math.max(0,Math.min(1,p)):
      Math.max(0,Math.min(1,Number(track.style.getPropertyValue("--intensity"))||0));
    const delta=next-state.progress;
    state.lastProgress=state.progress;state.progress=next;
    if(!reduced()){
      state.motion=Math.max(state.motion,Math.min(1.6,Math.abs(delta)*18));
      if(next>=.995&&state.lastProgress<.995)state.pulse=1.0;
    }
    state.runUntil=performance.now()+850;
    schedule();
  }
  state.sync=sync;
  track.addEventListener("yourlogos:slider-progress",sync);
  canvas.addEventListener("webglcontextlost",event=>{
    event.preventDefault();if(state.frame)cancelAnimationFrame(state.frame);
    state.frame=0;fallback();
  });
  canvas.addEventListener("webglcontextrestored",()=>{
    if(reduced())return;
    try{state.ctx=makeGL(canvas)}catch{state.ctx=null}
    slider.dataset.liquidGl=state.ctx?"on":"off";
    state.runUntil=performance.now()+800;schedule();
  });
  if(!reduced()){
    try{state.ctx=makeGL(canvas)}catch{state.ctx=null;}
  }
  slider.dataset.liquidGl=state.ctx?"on":"off";
  if("ResizeObserver" in window){
    const observer=new ResizeObserver(()=>{
      state.runUntil=performance.now()+450;schedule();
    });
    observer.observe(track);state.observer=observer;
  }else window.addEventListener("resize",()=>{state.runUntil=performance.now()+450;schedule();},{passive:true});
  if("IntersectionObserver" in window){
    const observer=new IntersectionObserver(([entry])=>{
      state.visible=Boolean(entry?.isIntersecting);
      if(state.visible){state.lastFrame=0;schedule();}
      else if(state.frame){cancelAnimationFrame(state.frame);state.frame=0;}
    });
    observer.observe(track);state.visibilityObserver=observer;
  }
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden){if(state.frame)cancelAnimationFrame(state.frame);state.frame=0;}
    else{state.lastFrame=0;state.runUntil=performance.now()+600;schedule();}
  });
  // Our shader is purely decorative; the original CSS progress fill stays active
  // when WebGL is blocked, lost, or motion is reduced.
  sync();
  return state;
}

if(typeof window!=="undefined"&&typeof document!=="undefined"){
  const start=()=>enhanceEntranceSlider(
    document.getElementById("yl-slider"),
    document.getElementById("yl-slider-track"),
    document.getElementById("yl-entrance")
  );
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
}
