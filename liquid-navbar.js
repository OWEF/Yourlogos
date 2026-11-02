/* Waterline for YourLogos' persistent three-button dock.
 * Ported to framework-free ES modules from the supplied Nimbus Liquid Navbar concept.
 * The app remains the authority for navigation, focus and selected route.
 * WebGL paints ONLY the selected liquid capsule; CSS fallback is always available.
 */
const instances = new WeakMap();
const VERT = `attribute vec2 a; void main(){gl_Position=vec4(a,0.,1.);}`;
const FRAG = `
precision highp float;
uniform vec2 uSize;
uniform float uDpr, uTime, uRippleAge;
uniform vec4 uLead, uTail, uRipple, uDots[3];
uniform vec3 uPointer;
float capsule(vec2 p,vec4 b){
  vec2 q=abs(p-b.xy)-vec2(max(0.,b.z*.5-b.w*.5),0.);
  return length(max(q,0.))+min(max(q.x,q.y),0.)-b.w*.5;
}
float softMin(float a,float b,float k){
  float h=clamp(.5+.5*(b-a)/k,0.,1.);
  return mix(b,a,h)-k*h*(1.-h);
}
void main(){
  vec2 p=vec2(gl_FragCoord.x,uSize.y*uDpr-gl_FragCoord.y)/uDpr;
  float d=softMin(capsule(p,uLead),capsule(p,uTail),12.);
  for(int i=0;i<3;i++){
    vec4 dot=uDots[i];
    if(dot.w>0.){
      float ring=length(p-dot.xy)-dot.z;
      d=softMin(d,ring,4.);
    }
  }
  float inside=1.-smoothstep(-1.5,1.4,d);
  float rim=exp(-abs(d)*.54)*inside;
  float depth=clamp(-d/14.,0.,1.);
  float lens=sin(depth*1.570796);
  float wave=.0;
  if(uRipple.w>0.){
    float dist=length(p-uRipple.xy);
    float crest=dist-uRippleAge*245.;
    wave=uRipple.w*exp(-uRippleAge*3.4)*exp(-crest*crest/175.)*sin(crest*.16);
  }
  vec2 mp=p-uPointer.xy;
  float meniscus=uPointer.z*exp(-dot(mp,mp)/1000.);
  float flow=(sin(p.x*.065+uTime*1.15)+sin(p.x*.11-uTime*.8+p.y*.08))*.04;
  float shine=pow(max(0.,1.-abs(p.y-uLead.y-(uLead.w*.30+wave*2.))-8.*meniscus)/5.,3.);
  float glint=pow(max(0.,1.-abs((p.x-uLead.x)*.45+(p.y-uLead.y)*1.1)/25.),3.);
  vec3 ink=vec3(.79,.69,.54);
  vec3 cream=vec3(1.,.96,.86);
  vec3 water=mix(ink,cream,clamp(.18+(.55*rim)+.35*shine+.14*glint+wave*.2+flow,0.,1.));
  float alpha=inside*(.28+.22*lens+.18*rim+.18*shine+.12*glint+meniscus*.07);
  float shadow=exp(-max(d,0.)*.25)*.11;
  vec3 outColor=mix(vec3(.07,.065,.06),water,inside);
  gl_FragColor=vec4(outColor,clamp(alpha+shadow*(1.-inside),0.,.92));
}`;

function makeWebGL(canvas) {
  const gl=canvas.getContext("webgl",{alpha:true,antialias:false,premultipliedAlpha:true});
  if(!gl)return null;
  function compile(type,source){
    const shader=gl.createShader(type);
    gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
      gl.deleteShader(shader);return null;
    }
    return shader;
  }
  const vertex=compile(gl.VERTEX_SHADER,VERT),fragment=compile(gl.FRAGMENT_SHADER,FRAG);
  if(!vertex||!fragment)return null;
  const program=gl.createProgram();
  gl.attachShader(program,vertex);gl.attachShader(program,fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);gl.deleteShader(fragment);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))return null;
  gl.useProgram(program);
  const buffer=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,"a");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const uniforms={};
  for(const name of ["uSize","uDpr","uTime","uLead","uTail","uRipple","uRippleAge","uDots","uPointer"]){
    uniforms[name]=gl.getUniformLocation(program,name);
  }
  return {gl,program,buffer,uniforms};
}
const reduced=()=>window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true;

export function attachLiquidNavbar(nav){
  if(!nav)return;
  const dock=nav.querySelector(".dock-glass");
  if(!dock)return;
  if(instances.has(dock))return instances.get(dock);
  dock.classList.add("waterline-dock");
  const canvas=document.createElement("canvas");
  canvas.className="waterline-canvas";
  canvas.setAttribute("aria-hidden","true");
  canvas.setAttribute("role","presentation");
  dock.insertBefore(canvas,dock.firstChild);
  const state={
    dock,canvas,gl:null,ready:false,visible:true,raf:0,last:0,time:0,until:0,
    lead:0,trail:0,leadV:0,trailV:0,width:72,height:50,centerY:33,targetX:46,
    mouseX:0,mouseY:0,mouseWeight:0,pointer:false,
    ripple:null,splitAt:0,resizeObserver:null,intersectionObserver:null
  };
  instances.set(dock,state);
  const activeButton=()=>dock.querySelector(".dock-btn.active")||dock.querySelector(".dock-btn");
  const bounds=(button)=>{
    if(!button)return null;
    const outer=dock.getBoundingClientRect(),rect=button.getBoundingClientRect();
    return {x:rect.left-outer.left+rect.width/2,y:rect.top-outer.top+rect.height/2,width:rect.width-2,height:rect.height-3};
  };
  const resize=()=>{
    const w=dock.clientWidth,h=dock.clientHeight;
    if(!w||!h)return;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const pw=Math.round(w*dpr),ph=Math.round(h*dpr);
    if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph;}
    const b=bounds(activeButton());
    if(!b)return;
    state.width=b.width;state.height=b.height;state.centerY=b.y;
    if(!state.ready){
      state.lead=state.trail=state.targetX=b.x;
      state.ready=true;
    }
    state.targetX=b.x;
    schedule();
  };
  const stop=()=>{if(state.raf)cancelAnimationFrame(state.raf);state.raf=0;};
  const paint=()=>{
    const ctx=state.gl;
    if(!ctx||!canvas.width||!canvas.height)return;
    const {gl:g,uniforms:u}=ctx;
    const w=dock.clientWidth,h=dock.clientHeight;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    g.viewport(0,0,canvas.width,canvas.height);
    g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT);
    g.useProgram(ctx.program);
    g.uniform2f(u.uSize,w,h);
    g.uniform1f(u.uDpr,dpr);
    g.uniform1f(u.uTime,state.time);
    g.uniform4f(u.uLead,state.lead,state.centerY,state.width,state.height);
    g.uniform4f(u.uTail,state.trail,state.centerY,state.width,state.height);
    const rip=state.ripple,age=rip?state.time-rip.time:0;
    g.uniform4f(u.uRipple,rip?.x||0,rip?.y||0,0,rip?.amp||0);
    g.uniform1f(u.uRippleAge,age);
    const droplets=new Float32Array(12);
    const separation=Math.abs(state.lead-state.trail);
    if(separation>80){
      for(let i=0;i<3;i++){
        const t=(i+1)/4;
        droplets.set([state.trail+(state.lead-state.trail)*t,state.centerY+Math.sin(state.time*15+i)*2,3.5+i*.5,1],i*4);
      }
    }
    g.uniform4fv(u.uDots,droplets);
    g.uniform3f(u.uPointer,state.mouseX,state.mouseY,state.mouseWeight);
    g.drawArrays(g.TRIANGLES,0,3);
  };
  const tick=(now)=>{
    state.raf=0;
    if(!state.dock.isConnected||!state.visible||document.hidden)return;
    const dt=Math.min((now-(state.last||now))/1000,.033);
    state.last=now;state.time+=dt;
    const move=(key,vkey,k,c)=>{
      const delta=state.targetX-state[key];
      state[vkey]+=(delta*k-state[vkey]*c)*dt;
      state[key]+=state[vkey]*dt;
    };
    if(reduced()){
      state.lead=state.trail=state.targetX;state.leadV=state.trailV=0;
    }else{
      move("lead","leadV",245,27);
      move("trail","trailV",80,15);
    }
    state.mouseWeight+=(Number(state.pointer)-state.mouseWeight)*Math.min(1,dt*10);
    if(state.ripple&&state.time-state.ripple.time>1)state.ripple=null;
    paint();
    const moving=Math.abs(state.targetX-state.lead)>.25||
      Math.abs(state.targetX-state.trail)>.25||
      Math.abs(state.leadV)>2||Math.abs(state.trailV)>2;
    if(moving||state.ripple||state.mouseWeight>.01||now<state.until)schedule();
  };
  function schedule(){
    if(!state.raf&&state.visible&&!document.hidden&&dock.isConnected)
      state.raf=requestAnimationFrame(tick);
  }
  function rippleFrom(clientX,clientY){
    if(reduced())return;
    const r=dock.getBoundingClientRect();
    state.ripple={x:clientX-r.left,y:clientY-r.top,amp:1,time:state.time};
    state.until=performance.now()+950;
    schedule();
  }
  state.sync=()=>{
    const b=bounds(activeButton());
    if(!b)return;
    state.width=b.width;state.height=b.height;state.centerY=b.y;
    if(!state.ready){state.lead=state.trail=b.x;state.ready=true;}
    if(Math.abs(state.targetX-b.x)>.5){
      state.targetX=b.x;state.until=performance.now()+1050;schedule();
    }else schedule();
  };
  dock.addEventListener("pointerdown",event=>{
    if(!event.target.closest(".dock-btn"))return;
    rippleFrom(event.clientX,event.clientY);
  });
  dock.addEventListener("pointermove",event=>{
    if(event.pointerType!=="mouse"||reduced())return;
    const r=dock.getBoundingClientRect();
    state.mouseX=event.clientX-r.left;state.mouseY=event.clientY-r.top;
    state.pointer=true;state.until=performance.now()+200;schedule();
  });
  dock.addEventListener("pointerleave",()=>{
    state.pointer=false;state.until=performance.now()+200;schedule();
  });
  dock.addEventListener("keydown",event=>{
    if(event.key!=="ArrowRight"&&event.key!=="ArrowLeft")return;
    const buttons=[...dock.querySelectorAll(".dock-btn")];
    const active=buttons.indexOf(document.activeElement);
    if(active<0)return;
    event.preventDefault();
    const next=buttons[(active+(event.key==="ArrowRight"?1:-1)+buttons.length)%buttons.length];
    next.focus();next.click();
  });
  const contextLost=event=>{
    event.preventDefault();stop();state.gl=null;dock.dataset.waterGl="off";
  };
  canvas.addEventListener("webglcontextlost",contextLost);
  // A reduced-motion user gets an immediate, static, fully functional CSS capsule.
  if(!reduced()){
    try{state.gl=makeWebGL(canvas);}catch{state.gl=null;}
  }
  dock.dataset.waterGl=state.gl?"on":"off";
  state.resizeObserver=new ResizeObserver(resize);
  state.resizeObserver.observe(dock);
  if("IntersectionObserver" in window){
    state.intersectionObserver=new IntersectionObserver(([entry])=>{
      state.visible=Boolean(entry?.isIntersecting);
      if(state.visible)schedule();else stop();
    });
    state.intersectionObserver.observe(dock);
  }
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden)stop();else{state.last=0;schedule();}
  });
  resize();state.sync();
  return state;
}
export function syncLiquidNavbar(nav){
  const dock=nav?.querySelector(".dock-glass");
  const state=dock&&(instances.get(dock)||attachLiquidNavbar(nav));
  state?.sync?.();
}
