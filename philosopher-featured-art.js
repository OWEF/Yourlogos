// Art-directed 32px pixel busts for the featured gallery cast.
// Entirely local SVG geometry; no fetched photography, tracking or attribution uncertainty.
// These are stylized interpretations, not historically authenticated likenesses.
const P={
 "Socrates":{skin:"#c99b78",coat:"#a69578",hair:"bald",beard:"curly",gray:"#c4b5a0",body:"toga",head:"round",eyes:"deep",bg:"#534338"},
 "Plato":{skin:"#d2ac8a",coat:"#a68b6c",hair:"silver-wave",beard:"long",gray:"#d1c4ad",body:"toga",head:"long",bg:"#4f463d"},
 "Aristotle":{skin:"#c9a17d",coat:"#705b48",hair:"short-curls",beard:"short",gray:"#49372f",body:"toga",head:"narrow",bg:"#4a3d34"},
 "Friedrich Nietzsche":{skin:"#d2aa87",coat:"#33383b",hair:"swept",beard:"walrus",gray:"#3b302b",body:"tie",head:"angular",eyes:"deep",bg:"#4b3530"},
 "Immanuel Kant":{skin:"#d6b69b",coat:"#695043",hair:"wig",beard:"none",gray:"#b8b5a5",body:"cravat",head:"narrow",bg:"#514538"},
 "G. W. F. Hegel":{skin:"#d0a989",coat:"#44423f",hair:"receding-wave",beard:"none",gray:"#766c59",body:"cravat",head:"long",eyes:"deep",bg:"#4c3f35"},
 "Karl Marx":{skin:"#cc9d7c",coat:"#3a3c3f",hair:"wild-silver",beard:"great",gray:"#ded3bf",body:"suit",head:"round",eyes:"deep",bg:"#443a36"},
 "Søren Kierkegaard":{skin:"#e0b499",coat:"#333637",hair:"wind",beard:"none",gray:"#75513e",body:"high-collar",head:"narrow",eyes:"deep",bg:"#4e3a2d"},
 "Seneca":{skin:"#bc9174",coat:"#b9a88e",hair:"bald",beard:"short",gray:"#5a4740",body:"toga",head:"long",eyes:"deep",bg:"#504438"},
 "Marcus Aurelius":{skin:"#cba582",coat:"#815443",hair:"roman-curls",beard:"curly",gray:"#49382e",body:"toga",head:"round",accessory:"laurel",bg:"#56412f"},
 "Laozi":{skin:"#d4b28c",coat:"#746e61",hair:"topknot",beard:"long",gray:"#ede1ca",body:"robe",head:"long",eyes:"calm",bg:"#405046"},
 "Confucius":{skin:"#cfaa88",coat:"#444d4a",hair:"scholar-cap",beard:"wispy",gray:"#54483d",body:"robe",head:"long",eyes:"calm",bg:"#404c4c"},
 "Mencius":{skin:"#cba37f",coat:"#4a5966",hair:"scholar-cap",beard:"long-thin",gray:"#a69c8b",body:"robe",head:"narrow",eyes:"calm",bg:"#414853"},
 "Albert Camus":{skin:"#d7ab87",coat:"#3e4246",hair:"slick",beard:"none",gray:"#302927",body:"open-shirt",head:"angular",eyes:"deep",bg:"#45515a"},
 "Simone de Beauvoir":{skin:"#d1a17d",coat:"#39373c",hair:"updo",beard:"none",gray:"#49312a",body:"turtleneck",head:"narrow",accessory:"earrings",bg:"#564440"},
 "Hannah Arendt":{skin:"#d8b194",coat:"#48505c",hair:"bob",beard:"none",gray:"#564a3c",body:"scarf",head:"round",accessory:"glasses",bg:"#47515b"},
 "Jean-Paul Sartre":{skin:"#d1aa89",coat:"#484743",hair:"receding-wave",beard:"none",gray:"#716454",body:"shirt",head:"round",accessory:"glasses",bg:"#514b40"},
 "Albert Einstein":{skin:"#cc9e83",coat:"#5d534a",hair:"wild-silver",beard:"walrus-small",gray:"#e2d8c4",body:"suit",head:"long",bg:"#4a4b50"},
 "René Descartes":{skin:"#bb9679",coat:"#323f42",hair:"long-dark",beard:"mustache-goatee",gray:"#312825",body:"high-collar",head:"long",bg:"#38434a"},
 "Virginia Woolf":{skin:"#d9ad8e",coat:"#56414b",hair:"bob",beard:"none",gray:"#46352c",body:"scarf",head:"narrow",bg:"#513d43"},
 "Mary Wollstonecraft":{skin:"#d7b195",coat:"#6f4e4e",hair:"silver-wave",beard:"none",gray:"#755743",body:"ruffle",head:"round",bg:"#58423f"},
 "Zhuangzi":{skin:"#cda884",coat:"#52635a",hair:"topknot",beard:"wispy",gray:"#7e7060",body:"robe",head:"long",bg:"#3d514a"},
 "Thích Nhất Hạnh":{skin:"#c39776",coat:"#8c6650",hair:"bald",beard:"none",gray:"#5b4a3f",body:"robe",head:"round",eyes:"calm",bg:"#54483a"},
 "William Shakespeare":{skin:"#cfaa8c",coat:"#4e4943",hair:"receding-wave",beard:"mustache-goatee",gray:"#654c39",body:"ruffle",head:"long",bg:"#473f38"},
 "David Hume":{skin:"#d4b69c",coat:"#5c4e49",hair:"wig",beard:"none",gray:"#9b8875",body:"cravat",head:"round",bg:"#4f4037"},
 "Arthur Schopenhauer":{skin:"#d3ac91",coat:"#424446",hair:"silver-wave",beard:"none",gray:"#e1d5ba",body:"cravat",head:"angular",bg:"#46423f"},
 "John Locke":{skin:"#d5b294",coat:"#4b4546",hair:"wig",beard:"none",gray:"#a89a83",body:"cravat",head:"narrow",bg:"#494343"},
 "Epictetus":{skin:"#c89d7d",coat:"#a69a79",hair:"bald",beard:"curly",gray:"#615246",body:"toga",head:"round",bg:"#4e4b3d"}
};
const rect=(x,y,w,h,c)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c+'"/>';
const path=(d,c)=>'<path d="'+d+'" fill="'+c+'"/>';
const dark="#28201f",shine="#efd4b5";
function bust(name,s){
 const sc=s.skin,h=s.gray,coat=s.coat;let out=rect(0,0,32,32,"#1d1d20")+rect(1,1,30,30,s.bg);
 // Small architectural arch keeps the portraits cohesive without framing them as stickers.
 out+=path("M3 25V12Q3 3 16 3Q29 3 29 12V25Z","#ffffff08");
 out+=rect(3,28,26,4,"#1f2023");
 out+=path("M3 32V29L8 26 12 25H20L24 26 29 29V32Z",coat);
 out+=rect(13,24,6,5,sc);
 if(s.body==="toga")out+=path("M3 32V28L11 25 22 32Z","#cbbca1")+rect(11,27,3,5,"#a6947e");
 if(s.body==="robe")out+=path("M14 25L4 32H12L17 27L24 32H29L19 25Z","#d1b793")+rect(15,26,2,6,"#362e28");
 if(s.body==="tie"||s.body==="suit"){out+=path("M11 25L16 31 21 25L18 25 16 28 14 25Z","#d2c6b0");out+=rect(15,28,2,4,"#4c3332")}
 if(s.body==="cravat"||s.body==="high-collar"||s.body==="ruffle"){out+=rect(10,25,4,7,"#eee0c8")+rect(18,25,4,7,"#eee0c8");out+=rect(15,27,2,5,"#baa184")}
 if(s.body==="open-shirt"||s.body==="shirt"){out+=path("M11 25L16 31 21 25L18 25 16 28 14 25Z","#ddd0b7")}
 if(s.body==="turtleneck")out+=rect(11,24,10,7,coat);
 if(s.body==="scarf")out+=path("M10 25H21V28H19V32H15V28H10Z","#a9a4a0");
 const w=s.head==="round"?16:s.head==="narrow"?13:s.head==="angular"?14:14;
 const x=Math.floor((32-w)/2),y=s.head==="long"?9:10,hei=s.head==="long"?17:15;
 out+=rect(x-1,y+4,w+2,hei-4,"#9c7159");
 out+=rect(x,y,w,hei,sc)+rect(x+1,y+3,1,hei-5,"#e9c5a382");
 if(s.head==="round")out+=rect(x-1,y+5,2,8,sc)+rect(x+w-1,y+5,2,8,sc);
 if(s.head==="angular")out+=rect(x+2,y+hei-1,w-4,2,"#9e765e");
 if(s.head==="narrow")out+=rect(x+2,y+hei-1,w-4,2,sc);
 const ey=y+8,ex=x+3;
 out+=rect(ex,ey,2,1,dark)+rect(x+w-5,ey,2,1,dark);
 if(s.eyes==="deep"){out+=rect(ex-1,ey-2,4,1,h)+rect(x+w-6,ey-2,4,1,h)}
 if(s.eyes==="calm"){out+=rect(ex,ey+1,2,1,"#806450")+rect(x+w-5,ey+1,2,1,"#806450")}
 out+=rect(Math.floor(x+w/2),ey+3,1,2,"#a97961");
 out+=rect(Math.floor(x+w/2)-1,y+hei-3,3,1,"#9b6c5a");
 // The silhouette, not just the color, carries each philosopher's identity.
 switch(s.hair){
 case "bald":out+=rect(x+1,y-1,w-2,2,"#e0bc9c99")+rect(x-2,y+5,2,5,h)+rect(x+w,y+5,2,5,h);break;
 case "silver-wave":out+=rect(x-2,y-1,w+4,5,h)+rect(x-4,y+1,4,10,h)+rect(x+w,y,4,11,h)+rect(x+1,y-4,5,5,h)+rect(x+8,y-5,5,6,h)+rect(x+4,y-3,3,2,"#f6e9d1");break;
 case "short-curls":out+=rect(x-2,y-2,w+4,5,h);for(let i=0;i<5;i++)out+=rect(x-2+i*4,y-3-(i%2),4,4,h);out+=rect(x-2,y+3,3,5,h)+rect(x+w-1,y+3,3,5,h);break;
 case "roman-curls":out+=rect(x-2,y-2,w+4,5,h);for(let i=0;i<6;i++)out+=rect(x-2+i*3,y-3-(i%2),3,3,i%2?"#5b4435":h);out+=rect(x-3,y+3,4,7,h)+rect(x+w-1,y+3,4,7,h);break;
 case "swept":out+=path("M"+(x-2)+" "+(y+5)+"V"+(y-1)+"L"+(x+5)+" "+(y-5)+"H"+(x+w)+"V"+(y+4)+"H"+(x+w-2)+"V"+y+"H"+(x+6)+"L"+x+" "+(y+6)+"Z",h);out+=rect(x+w-2,y+3,3,5,h);break;
 case "slick":out+=rect(x-1,y-2,w+2,5,h)+rect(x+1,y-4,w-4,3,h)+rect(x-1,y+1,3,6,h)+rect(x+w-1,y+2,2,5,h);out+=rect(x+4,y-2,w-5,1,"#756052");break;
 case "wig":out+=rect(x-1,y-3,w+2,6,h)+rect(x-5,y+1,6,13,h)+rect(x+w-1,y+1,6,13,h)+rect(x-4,y+5,4,3,"#eee5d0")+rect(x+w,y+5,4,3,"#eee5d0");break;
 case "receding-wave":out+=rect(x-2,y+2,4,11,h)+rect(x+w-2,y+1,4,11,h)+rect(x+2,y-2,w-4,4,h)+rect(x+4,y-4,4,3,h);break;
 case "wild-silver":out+=rect(x-4,y-2,w+8,6,h)+rect(x-6,y+1,6,14,h)+rect(x+w,y+2,6,14,h);for(let i=0;i<6;i++)out+=rect(x-4+i*4,y-5-(i%3),4,5,h);out+=rect(x-5,y+6,3,4,"#eee4d5");break;
 case "wind":out+=rect(x-2,y,w+4,4,h)+rect(x-4,y-3,6,5,h)+rect(x+2,y-6,5,7,h)+rect(x+8,y-8,5,8,h)+rect(x+w-1,y-4,6,6,h)+rect(x+w+3,y-6,3,4,h)+rect(x-2,y+2,3,5,h);break;
 case "topknot":out+=rect(x+4,y-6,6,5,h)+rect(x+6,y-8,3,3,h)+rect(x-1,y-2,w+2,4,h)+rect(x-2,y+2,3,9,h)+rect(x+w-1,y+2,3,9,h);break;
 case "scholar-cap":out+=rect(x-3,y-4,w+6,5,h)+rect(x-5,y,3,2,h)+rect(x+w+2,y,3,2,h)+rect(x+1,y-7,w-2,4,h)+rect(x-1,y+2,3,4,h)+rect(x+w-2,y+2,3,4,h);break;
 case "updo":out+=rect(x-2,y-3,w+4,5,h)+rect(x+3,y-7,10,5,h)+rect(x+7,y-9,5,3,h)+rect(x-2,y+1,3,11,h)+rect(x+w-1,y+1,3,11,h)+rect(x,y+1,w,2,"#a07d67");break;
 case "bob":out+=rect(x-2,y-3,w+4,7,h)+rect(x-4,y+3,5,15,h)+rect(x+w-1,y+3,5,15,h)+rect(x-4,y+16,6,3,h)+rect(x+w-1,y+16,5,3,h);break;
 case "long-dark":out+=rect(x-2,y-3,w+4,6,h)+rect(x-4,y+2,5,17,h)+rect(x+w-1,y+2,5,17,h);break;
 }
 switch(s.beard){
 case "short":out+=rect(x+2,y+hei-5,w-4,5,h)+rect(x+4,y+hei,w-8,1,h);break;
 case "curly":out+=rect(x+1,y+hei-6,w-2,7,h)+rect(x+3,y+hei+1,w-6,3,h)+rect(x+5,y+hei+4,w-10,2,h);out+=rect(x+2,y+hei-5,3,3,"#e5d9c6");break;
 case "long":out+=rect(x+1,y+hei-6,w-2,8,h)+rect(x+3,y+hei+2,w-6,5,h)+rect(x+5,y+hei+7,w-10,2,h);break;
 case "great":out+=rect(x-3,y+hei-8,w+6,11,h)+rect(x-1,y+hei+3,w+2,4,h)+rect(x+3,y+hei+7,w-6,3,h)+rect(x-4,y+hei-6,3,8,h)+rect(x+w+1,y+hei-6,3,8,h);out+=rect(x+2,y+hei-3,w-4,2,"#f6e8d1");break;
 case "wispy":out+=rect(x+3,y+hei-4,w-6,4,h)+rect(x+5,y+hei,w-10,8,h);out+=rect(x-1,y+hei-5,4,1,h)+rect(x+w-3,y+hei-5,4,1,h);break;
 case "long-thin":out+=rect(x+4,y+hei-5,w-8,7,h)+rect(x+5,y+hei+2,w-10,8,h);break;
 case "walrus":out+=rect(x+1,y+hei-6,w-2,5,h)+rect(x-1,y+hei-5,4,4,h)+rect(x+w-3,y+hei-5,4,4,h);break;
 case "walrus-small":out+=rect(x+2,y+hei-6,w-4,3,h)+rect(x+1,y+hei-5,3,3,h)+rect(x+w-4,y+hei-5,3,3,h);break;
 case "mustache-goatee":out+=rect(x+3,y+hei-6,w-6,2,h)+rect(x+5,y+hei-4,w-10,7,h);break;
 }
 if(s.accessory==="glasses")out+='<path d="M'+(x+1)+' '+(ey-1)+'h6v5h-6z m8 0h6v5h-6z m-2 2h2" fill="none" stroke="#dac8a9" stroke-width="1"/>';
 if(s.accessory==="earrings")out+=rect(x-2,y+13,2,3,"#d9bd75")+rect(x+w,y+13,2,3,"#d9bd75");
 if(s.accessory==="laurel")out+=rect(x-3,y-2,5,2,"#d4bb6b")+rect(x+w-2,y-2,5,2,"#d4bb6b")+rect(x-4,y,2,4,"#d4bb6b");
 out+=rect(2,2,28,28,"none")+'<path d="M2 27V2H30V27" fill="none" stroke="#d8b984" stroke-opacity=".36" stroke-width=".55"/>';
 return out;
}
export function featuredPortrait(name){
 const s=P[String(name||"").trim()];
 return s?bust(name,s):null;
}
export function isFeaturedPortrait(name){return Object.hasOwn(P,String(name||"").trim())}
