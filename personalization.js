// Deterministic first-person personalization for Encounter.
// All signals are volunteered by the user. Reading a quote is not agreement.
// No diagnosis, remote inference or API requests.
import { exploreFor } from "./explore-catalogue.js";
export const CONCERNS={
 identity:{label:"Understanding myself",themes:["Freedom","Meaning","Doubt","Solitude"],context:"understanding yourself"},
 connection:{label:"Relationships & belonging",themes:["Love","Solitude","Freedom","Suffering"],context:"connection and belonging"},
 direction:{label:"Purpose & direction",themes:["Meaning","Action","Time","Freedom"],context:"finding your direction"},
 time:{label:"Time & responsibilities",themes:["Time","Action","Suffering","Meaning"],context:"time and responsibilities"},
 uncertainty:{label:"Decisions & uncertainty",themes:["Doubt","Freedom","Action","Suffering"],context:"uncertainty and decisions"},
 freedom:{label:"Freedom & expectations",themes:["Freedom","Action","Meaning","Love"],context:"independence and expectations"},
 change:{label:"Change & loss",themes:["Suffering","Time","Mortality","Love"],context:"change and loss"},
 fairness:{label:"Fairness & values",themes:["Action","Doubt","Love","Meaning"],context:"fairness and values"}
};
export const APPROACHES={
 reflect:"I think it through",facts:"I look for evidence",talk:"I talk to someone",
 act:"I try something",feel:"I notice how I feel",unsure:"It depends"
};
export const TENSIONS={
 security:{label:"Security and growth",themes:["Freedom","Time","Action"],prompt:"Where does staying safe compete with growing?"},
 belonging:{label:"Independence and connection",themes:["Love","Solitude","Freedom"],prompt:"Where do independence and belonging pull you in different directions?"},
 truth:{label:"Honesty and harmony",themes:["Doubt","Love","Action"],prompt:"Where does speaking honestly risk upsetting the peace?"},
 achievement:{label:"Achievement and rest",themes:["Time","Meaning","Action"],prompt:"Where does the wish to achieve leave little room to rest?"},
 expectations:{label:"My wishes and others' expectations",themes:["Freedom","Love","Meaning"],prompt:"Whose expectations are shaping your next choice?"},
 unsure:{label:"Not sure yet",themes:[],prompt:""}
};
export const STYLES={
 gentle:"A little clarity and calm",challenge:"A question that challenges me",
 practical:"Something to try in everyday life",surprise:"An unexpected perspective"
};
const THEMES=["Meaning","Suffering","Freedom","Mortality","Love","Doubt","Action","Solitude","Beauty","Time"];
// Each of the eight concern lenses has a distinct, quote-theme-specific prompt.
// Editorial questions rather than generating arbitrary mental-health conclusions.
const QUESTIONS={
 identity:[
 "When do you feel that your life has your own meaning, rather than someone else's?",
 "Has a difficult experience ever changed how you see yourself?",
 "What's one choice that feels like it genuinely belongs to you?",
 "What part of who you are do you hope will outlast a particular moment?",
 "Which relationship lets you be most fully yourself?",
 "What belief about yourself might be worth examining again?",
 "When do your actions make you feel most like yourself?",
 "Does being alone help you hear your own thoughts more clearly?",
 "What do you find beautiful that says something about who you are?",
 "Which part of yourself has changed most in the past year?"
 ],
 connection:[
 "When has someone else helped you find a reason to keep going?",
 "When you're struggling, what kind of support actually helps?",
 "Does closeness make you feel freer, or more responsible?",
 "What would you want someone you love to remember about your time together?",
 "What does being understood by someone feel like to you?",
 "When have you misunderstood someone despite caring about them?",
 "What's one small way you show another person that they matter?",
 "When does solitude feel nourishing, and when do you want company?",
 "What's a beautiful moment you remember sharing with someone?",
 "Who would you like to make more time for?"
 ],
 direction:[
 "If you weren't trying to impress anyone, what might feel worth pursuing?",
 "Have challenges made your direction clearer or more uncertain?",
 "Which choice would you make if you cared less about others' approval?",
 "What would make your limited time feel meaningful?",
 "Who or what do you want your efforts to serve?",
 "What might you need to question about the path you're following?",
 "What's one small step that matches the direction you want?",
 "Does time alone help you hear what you actually want?",
 "What kind of beauty makes you want to create something?",
 "What have you postponed that matters to your future?"
 ],
 time:[
 "What important thing keeps getting crowded out by your schedule?",
 "When has being too busy made a hard experience harder?",
 "Do your daily obligations leave room for choices that feel yours?",
 "What would you make time for if you remembered it was limited?",
 "Who deserves more of your unhurried attention?",
 "Does urgency ever make you believe something before checking it?",
 "What could you stop doing to make space for something important?",
 "When did you last enjoy a quiet moment without measuring it?",
 "What ordinary detail do you miss when you're rushing?",
 "Is there something meaningful you keep saving for later?"
 ],
 uncertainty:[
 "Can an uncertain path still have meaning for you?",
 "What helps you face difficulty when you don't know how it will end?",
 "What choice can you make without knowing every outcome?",
 "How does the uncertainty of the future affect the way you live now?",
 "What do you need from others when things feel unclear?",
 "What evidence would actually change your mind about a worry?",
 "What small experiment could teach you more than further guessing?",
 "When does solitude help you think, and when does it become overthinking?",
 "Can something be beautiful even when you don't understand it?",
 "What's one decision that doesn't need a perfect answer today?"
 ],
 freedom:[
 "Which goal is yours, rather than inherited from expectations?",
 "Do you allow yourself to respond to difficulty in your own way?",
 "Where could you claim a little more freedom in daily life?",
 "What would you choose if you had less time to satisfy others?",
 "Which commitment feels freely chosen rather than imposed?",
 "Whose opinions shape your judgment more than you would like?",
 "What's one small action that expresses a value you chose?",
 "Can you enjoy being alone without needing to justify it?",
 "What do you love that others may not understand?",
 "Who decides how your time should be spent?"
 ],
 change:[
 "Has an unexpected change altered what matters to you?",
 "What has helped you live through a change without rushing to explain it?",
 "Can letting go of an old plan create room for a new choice?",
 "What part of a meaningful life remains even when circumstances shift?",
 "How have your relationships changed the way you handle loss?",
 "Is there a belief you held before a change that no longer fits?",
 "What gentle step could make a difficult transition easier?",
 "Do you need company or quiet when you're adjusting to change?",
 "What familiar beauty has helped you through a hard period?",
 "What would you like to carry forward, even as things change?"
 ],
 fairness:[
 "What makes a life fair, not merely successful?",
 "When you see suffering, what makes you feel responsible to help?",
 "Whose freedom should you consider alongside your own?",
 "What do we owe people who won't share our time or place?",
 "What would fairness look like in a relationship you care about?",
 "What assumption of yours might another person reasonably challenge?",
 "What small fair action matters more than a grand statement?",
 "Can stepping away from an argument sometimes be the fairer choice?",
 "Can art help you see a life very different from your own?",
 "Whose time do we tend to value less than our own?"
 ]};
const GUIDANCE={
 reflect:"You can leave this open and see what comes to mind.",
 facts:"Try thinking of one real example, rather than seeking a perfect answer.",
 talk:"You might compare your perspective with someone you trust, if you want.",
 act:"One small experiment may tell you more than a perfect plan.",
 feel:"Notice what the question brings up before trying to explain it.",
 unsure:"There's no preferred way to respond."
};
const STYLE_HINT={
 gentle:"There is no rush to decide.",
 challenge:"You can disagree with this thought.",
 practical:"You might turn this into one small action.",
 surprise:"You might discover that the opposite is also worth considering."
};
function safeProfile(profile){
 const a=profile?.status==="completed"&&profile?.answers&&typeof profile.answers==="object"?profile.answers:null;
 if(!a)return null;
 const selected=Array.isArray(a.concerns)?[...new Set(a.concerns.filter(x=>Object.hasOwn(CONCERNS,x)))].slice(0,3):[];
 return {concerns:selected,approach:Object.hasOwn(APPROACHES,a.approach)?a.approach:"unsure",tension:Object.hasOwn(TENSIONS,a.tension)?a.tension:"unsure",style:Object.hasOwn(STYLES,a.style)?a.style:"surprise"};
}
export function personalizedExplore(quote,id,profile,history=[]){
 const base=exploreFor(quote,id);
 if(!base)return null;
 const a=safeProfile(profile),theme=quote?.[2],themeIndex=THEMES.indexOf(theme);
 if(!a||!a.concerns.length||themeIndex<0)return {...base,personalized:false,nudge:"A question you may carry with you.",why:"This reflection is available to everyone."};
 // Prioritize relevant volunteered topics, breaking ties by original selection order.
 // Earlier exploration supplies very weak evidence of interest, never belief.
 const topic=a.concerns.map((key,index)=>{
   const matching=CONCERNS[key].themes.indexOf(theme);
   const score=matching<0?0.15:3-matching*.43;
   const explorationCount=Array.isArray(history)?history.filter(e=>e?.theme===theme&&e?.depth==="reflection").length:0;
   return {key,score:score+(a.concerns.length-index)*.05+Math.min(.25,explorationCount*.05)};
 }).sort((x,y)=>y.score-x.score)[0].key;
 const person=CONCERNS[topic],tension=TENSIONS[a.tension];
 const relevantTension=tension.themes.includes(theme);
 const personalQuestion=QUESTIONS[topic][themeIndex];
 const nudge=[GUIDANCE[a.approach],STYLE_HINT[a.style]].join(" ");
 // Editorial insight is always primary; never suggest a philosophical belief follows
 // from a person's chosen onboarding answer.
 const connection="You mentioned "+person.context+". This thought offers one way to look at that part of life.";
 const insight=base.insight+" "+connection;
 const reflection=(a.style==="challenge"&&relevantTension)?tension.prompt:personalQuestion;
 return {...base,insight,reflection,nudge,personalized:true,why:"Connected to your selected interest in "+person.context+".",lens:topic,style:a.style};
}
export function validatePersonalization(){
 return THEMES.length===10 && Object.keys(CONCERNS).length===8 &&
   Object.keys(QUESTIONS).every(k=>Object.hasOwn(CONCERNS,k)&&QUESTIONS[k].length===THEMES.length&&QUESTIONS[k].every(q=>q.endsWith("?")));
}
