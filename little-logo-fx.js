// LilLogo interaction choreography. All effects are ephemeral visual feedback;
// philosophy/memory are driven by the existing Discover state, never by effects.
const reduceMotion=()=>typeof window!=="undefined"&&window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches===true;
const counts={tap:10,answer:17,round:15,complete:30,world:24};
const lifetimes={tap:650,answer:840,round:820,complete:1250,world:1150};
const variations={tap:0.7,answer:1,round:0.8,complete:1.38,world:1.15};
const fract=x=>x-Math.floor(x);
const pseudo=(seed)=>fract(Math.sin(seed*127.1+78.23)*43758.5453);

export function lilLogoFX(type="tap"){
 if(typeof document==="undefined"||reduceMotion())return;
 if(!Object.prototype.hasOwnProperty.call(counts,type))return;
 const stage=document.querySelector(".yl-discover-immersive .yl-logo-roam-stage");
 const world=document.querySelector(".stage");
 const host=stage||(type==="world"?world:null);
 if(!host)return;
 const now=typeof performance!=="undefined"?performance.now():Date.now();
 // Avoid accidental duplicate bursts on double taps; no permanent animation loop.
 if(host.dataset.lilLastType===type&&now-Number(host.dataset.lilLastTime||0)<200)return;
 host.dataset.lilLastType=type;host.dataset.lilLastTime=String(now);
 host.querySelectorAll(".yl-logo-fx").forEach(node=>node.remove());
 const layer=document.createElement("span");
 layer.className="yl-logo-fx yl-logo-fx-"+type;
 layer.setAttribute("aria-hidden","true");
 const amount=counts[type],strength=variations[type];
 for(let i=0;i<amount;i++){
   const particle=document.createElement("i");
   const angle=(i/amount)*Math.PI*2+(pseudo(i+27)*.36);
   const dist=(28+pseudo(i+3)*61)*strength;
   const dx=Math.cos(angle)*dist;
   const dy=Math.sin(angle)*dist*(type==="complete"?.9:.72)-9*strength;
   const delay=type==="complete"?Math.floor(pseudo(i+7)*150):Math.floor(pseudo(i+7)*80);
   const kind= i%7===0?"leaf":i%3===0?"star":"glow";
   particle.className="yl-logo-fx-particle is-"+kind;
   particle.style.setProperty("--lil-dx",dx.toFixed(1)+"px");
   particle.style.setProperty("--lil-dy",dy.toFixed(1)+"px");
   particle.style.setProperty("--lil-delay",delay+"ms");
   particle.style.setProperty("--lil-size",(2.5+pseudo(i+11)*4.5).toFixed(1)+"px");
   layer.appendChild(particle);
 }
 host.appendChild(layer);
 window.setTimeout(()=>layer.remove(),lifetimes[type]);
}
