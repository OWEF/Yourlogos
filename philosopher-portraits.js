import {featuredPortrait} from "./philosopher-featured-art.js";
// Individually seeded, locally rendered pixel portraits: one consistent art direction,
// distinct silhouette, hair, clothes, motifs and face for each canonical Discover source.
// Editorial stylizations, not claims of historically exact likeness.
export const PORTRAIT_AUTHORS=["Friedrich Nietzsche","Albert Camus","Socrates","Seneca","Jean-Paul Sartre","Laozi","Marcus Aurelius","Antoine de Saint-Exupéry","Ludwig Wittgenstein","Blaise Pascal","Immanuel Kant","Annie Dillard","René Descartes","Zen koan (Dizang)","Henry David Thoreau","Thích Nhất Hạnh","Henrik Ibsen","Albert Einstein","John Stuart Mill","Karl Marx","Mary Wollstonecraft","Baruch Spinoza","David Hume","Thomas Hobbes","Virginia Woolf","William Shakespeare","Aristotle","G. W. F. Hegel","John Milton","Søren Kierkegaard","Carl Jung","Arthur Schopenhauer","Rainer Maria Rilke","Franklin D. Roosevelt","George Orwell","Charlotte Brontë","Epicurus","Epictetus","Ralph Waldo Emerson","John Locke","George Berkeley","Jean-Jacques Rousseau","Karl Marx and Friedrich Engels","Bertrand Russell","Simone de Beauvoir","The Heart Sutra","The Dhammapada","Zhuangzi","Confucius","Michel de Montaigne","Heraclitus","Augustine of Hippo","Lucretius","Oscar Wilde","Mary Shelley","Mencius"];
const SKIN=["#d9b99b","#cba78a","#e3c6a8","#b99076","#dfbda1","#c69d7c"];
const HAIR=["#332721","#625047","#b1a18b","#29262b","#6e5c43","#4c352c","#8b7962","#252527"];
const COAT=["#34454b","#533d40","#504b39","#364540","#3a3754","#5a4637","#415158","#473b45"];
const special={
 "Friedrich Nietzsche":{moustache:2,hair:1}, "Karl Marx":{beard:2,hair:5}, "Karl Marx and Friedrich Engels":{beard:2,duo:true},
 "Søren Kierkegaard":{hair:6,collar:true}, "Immanuel Kant":{hair:2,wigs:true},"G. W. F. Hegel":{hair:4},
 "Albert Einstein":{hair:2,halo:true},"Jean-Paul Sartre":{glasses:true},"Hannah Arendt":{glasses:true},
 "Simone de Beauvoir":{hair:3,headband:true},"Oscar Wilde":{flower:true},"Virginia Woolf":{hair:3},
 "Laozi":{beard:2,hair:2},"Confucius":{beard:1,cap:true},"Zhuangzi":{beard:1,cap:true},
 "Thích Nhất Hạnh":{bald:true,robe:true},"Epictetus":{bald:true,robe:true},"Socrates":{bald:true,beard:1},
 "Marcus Aurelius":{beard:1,laurel:true},"Aristotle":{beard:1,robe:true},"Mary Wollstonecraft":{hair:6},
 "René Descartes":{hair:3,collar:true},"William Shakespeare":{ruff:true},"John Milton":{hair:6},
 "Bertrand Russell":{hair:2,moustache:1},"David Hume":{hair:4},"Mary Shelley":{hair:3},
 "The Heart Sutra":{symbol:"lotus"},"The Dhammapada":{symbol:"wheel"},"Zen koan (Dizang)":{symbol:"enso"}
};
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0}
function R(x,y,w,h,c){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c+'"/>'}
function portrait(author){
 const n=String(author||"").trim(),index=PORTRAIT_AUTHORS.indexOf(n);
 const seed=hash(n),p=special[n]||{},palette= index<0?seed:index;
 const hair=p.hair??(seed%HAIR.length),skin=SKIN[(seed>>>6)%SKIN.length],coat=COAT[(seed>>>11)%COAT.length];
 const hairColor=HAIR[hair];let x=R(0,0,24,24,"#241e1c")+R(1,1,22,22,"#392e2a")+R(2,2,20,20,"#42332b");
 x+=R(2,18,20,5,"#2b2727")+R(5,17,14,6,coat)+R(10,17,4,4,"#e5d5b8");
 if(p.symbol){const motif=p.symbol==="lotus"?'<path d="M12 5 8 12l4 6 4-6-4-7zm-7 8 7 6 7-6" fill="none" stroke="#d9c09a" stroke-width="1.7"/>':p.symbol==="wheel"?'<circle cx="12" cy="12" r="7" fill="none" stroke="#d9c09a" stroke-width="1.8"/><path d="M12 5v14M5 12h14M7 7l10 10M17 7 7 17" stroke="#d9c09a"/>':'<path d="M17 7a8 8 0 1 0 2 8" fill="none" stroke="#d9c09a" stroke-width="3"/>';return x+motif}
 x+=R(7,7,10,11,skin)+R(6,10,1,4,skin)+R(17,10,1,4,skin);
 if(!p.bald){
  const top=(seed%4===0)?4:5;
  x+=R(6,top,12,4,hairColor)+R(5,7,2,6,hairColor)+R(17,7,2,4,hairColor);
  if(hair===2||p.halo)x+=R(4,6,3,4,hairColor)+R(17,5,3,5,hairColor)+R(7,3,3,3,hairColor);
  if(hair===3)x+=R(4,7,2,12,hairColor)+R(18,7,2,12,hairColor);
  if(p.wigs)x+=R(3,7,3,9,hairColor)+R(18,7,3,9,hairColor);
 }
 x+=R(8,11,2,1,"#262324")+R(14,11,2,1,"#262324")+R(11,13,2,1,"#af836a");
 if(p.glasses)x+='<path d="M7 10h4v3H7zm6 0h4v3h-4zm-2 1h2" fill="none" stroke="#9c825d" stroke-width=".7"/>';
 if(p.moustache||seed%11===0)x+=R(9,15,6,1,hairColor)+(p.moustache===2?R(8,14,2,2,hairColor)+R(14,14,2,2,hairColor):"");
 if(p.beard)x+=R(8,17,8,2,hairColor)+(p.beard===2?R(9,19,6,2,hairColor):"");
 if(p.laurel)x+=R(5,5,3,1,"#c8aa68")+R(16,5,3,1,"#c8aa68");
 if(p.cap)x+=R(5,4,14,2,"#40362e")+R(7,2,10,2,"#40362e");
 if(p.headband)x+=R(6,6,12,1,"#c2ad84");
 if(p.ruff)x+=R(5,17,14,2,"#d7d1c3");
 if(p.collar)x+=R(6,17,4,3,"#e6d4bd")+R(14,17,4,3,"#e6d4bd");
 if(p.robe)x+=R(5,18,5,5,"#aa8762");
 if(p.flower)x+=R(18,19,3,3,"#c89d8a");
 if(p.duo)x+=R(18,8,5,8,"#c1a48b")+R(18,6,5,2,"#84766b");
 // Individually recognizable small embroidered motif in the border.
 const mark=palette%10; x+=R(2+mark*2,22,2,1,"#bfa27d");
 return x;
}
export function philosopherPortrait(author){
 const n=String(author||"").trim(),id=PORTRAIT_AUTHORS.indexOf(n);
 const featured=featuredPortrait(n);
 const svg=featured||portrait(n);
 return '<svg class="yl-thinker-pixel" data-thinker-id="'+id+'" data-featured-art="'+(featured?"true":"false")+'" role="img" aria-label="Stylized pixel portrait of '+n.replace(/[&<>"]/g,"")+'" viewBox="0 0 '+(featured?"32 32":"24 24")+'" shape-rendering="crispEdges">'+svg+'</svg>';
}
