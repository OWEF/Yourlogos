/* YourLogos personal space; deliberately separate from the star renderer. */
const PEOPLE=[
{id:"socrates",name:"Socrates",themes:["Doubt","Meaning"],responses:["curious","ambivalent"],lenses:["reason","others"],description:"You return to challenging familiar assumptions rather than holding onto certainty.",file:"Socrate du Louvre.jpg",credit:"Socrates bust photograph: Eric Gaba (Sting), Wikimedia Commons, CC BY-SA 2.5"},
{id:"nietzsche",name:"Friedrich Nietzsche",themes:["Meaning","Freedom"],responses:["resist","curious"],lenses:["reason","time"],description:"You are drawn to examining inherited values and asking how a life becomes one's own.",file:"Nietzsche1882.jpg",credit:"Friedrich Nietzsche, Gustav-Adolf Schultze (1882), public domain"},
{id:"marcus",name:"Marcus Aurelius",themes:["Action","Suffering","Mortality"],responses:["resonate","ambivalent"],lenses:["experience","time"],description:"You revisit the distinction between the events you meet and your response to them.",file:"Rome Capitoline Marcus Aurelius statue original.jpg",credit:"Capitoline Museum, image Wikimedia Commons"},
{id:"kant",name:"Immanuel Kant",themes:["Doubt","Action","Meaning"],responses:["resist","ambivalent"],lenses:["reason","others"],description:"You seek the principles beneath judgments and ask what duties remain when convenience changes.",file:"Immanuel Kant portrait c1790.jpg",credit:"Anonymous portrait of Immanuel Kant, c.1790, public domain"}
];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const url=p=>"https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent(p.file);
export function philosopherEvidence(saved,discovery){
  const entries=Object.values(discovery||{}).filter(x=>x&&x.response);
  const result=PEOPLE.map(person=>{
    let points=0,matching=[];
    for(const theme of person.themes){const matches=saved.filter(q=>q?.[2]===theme).length;if(matches){points+=matches*2;matching.push(theme)}}
    for(const e of entries){if(person.responses.includes(e.response))points++;if(person.lenses.includes(e.lens))points++}
    return {...person,score:points,matching};
  }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  return {person:result[0],ready:saved.length>=3&&entries.length>=2&&result[0].score>=5,saved:saved.length,responses:entries.length};
}
export function portrait(p,cls="large"){
  return '<div class="world-portrait '+cls+'"><img src="'+url(p)+'" alt="Portrait of '+esc(p.name)+'" loading="lazy" onerror="this.hidden=true"/><div class="portrait-initial" aria-hidden="true">'+p.name.charAt(0)+'</div><div class="portrait-shade"></div></div>';
}
export function worldHomeHtml({saved,discovery,name}){
  const e=philosopherEvidence(saved,discovery);
  return '<section class="world-home view" aria-label="My World">'+
    '<div class="world-home-header"><div class="world-kicker">A PERSONAL UNIVERSE</div><h1>My World<span>.</span></h1><p>'+(name?esc(name)+', this is':'This is')+' a portrait made of the questions you return to.</p></div>'+
    '<button type="button" data-world-pane="sky" class="world-sky-card" aria-label="Enter your living sky">'+
      '<div class="world-sky-stars" aria-hidden="true">'+Array.from({length:54},(_,i)=>'<i style="--x:'+((i*71+27)%97)+'%;--y:'+((i*43+13)%96)+'%;--s:'+(i%8===0?3:1)+'px;--delay:'+(i%9)*.2+'s"></i>').join("")+
      '<svg class="world-sky-lines" viewBox="0 0 330 195" aria-hidden="true"><path d="M48 136Q116 30 170 96T281 44M170 96L218 38" stroke="#d0b48a" stroke-width=".7" fill="none" opacity=".45"/><circle cx="48" cy="136" r="3" fill="#deb889"/><circle cx="170" cy="96" r="5" fill="#f4daaa"/><circle cx="218" cy="38" r="3.5" fill="#b7cfe9"/><circle cx="281" cy="44" r="3" fill="#d8aeb9"/></svg></div>'+
      '<div class="world-sky-title"><span><small>THE LIVING SKY</small><strong>Travel through ideas that stayed with you.</strong></span><span class="world-arrow">↗</span></div></button>'+
    '<div class="world-grid"><button type="button" data-world-pane="saved" class="world-tile"><span class="world-tile-icon">✧</span><strong>Saved thoughts</strong><small>'+saved.length+' encounters kept</small></button>'+
    '<button type="button" data-world-pane="fingerprint" class="world-tile"><span class="world-tile-icon">◎</span><strong>Fingerprint</strong><small>Patterns of your curiosity</small></button></div>'+
    '<button type="button" data-world-pane="mirror" class="world-mirror-teaser">'+portrait(e.person,"small")+
      '<span class="world-mirror-caption"><small>THE PHILOSOPHER’S MIRROR</small><strong>Who might you think alongside?</strong><span>'+(e.ready?esc(e.person.name)+" · current companion":"Your portrait is still forming")+'</span></span><b>↗</b></button></section>';
}
export function mirrorHtml(saved,discovery){
 const e=philosopherEvidence(saved,discovery),p=e.person;
 return '<section class="world-mirror view" aria-label="Philosopher’s Mirror">'+
  '<div class="world-kicker">THE PHILOSOPHER’S MIRROR</div><h1>Who would you be?</h1>'+
  '<p class="world-sub">A playful philosophical companion—not a personality diagnosis or proof of agreement.</p>'+
  portrait(p,"large")+
  '<div class="mirror-result"><small>'+(e.ready?"YOUR CURRENT PHILOSOPHICAL COMPANION":"AN UNFINISHED PORTRAIT")+'</small>'+
  '<h2>'+(e.ready?esc(p.name):"Keep exploring.")+'</h2>'+
  '<p>'+(e.ready?esc(p.description):"Save a few more thoughts and explore their tensions in Discover. Your current companion will appear once there is enough evidence.")+'</p>'+
  (e.ready?'<p class="mirror-reasons">Based on recurring interests: '+esc(p.matching.join(" · ")||"questions and contrasting perspectives")+'</p>':
   '<p class="mirror-reasons">'+e.saved+' saved thoughts · '+e.responses+' Discover responses. Suggested minimum: three saved thoughts and two responses.</p>')+
  '<button type="button" data-world-pane="fingerprint">Explore your fingerprint ↗</button>'+
  '<p class="mirror-credit">'+esc(p.credit)+'</p></div></section>';
}
