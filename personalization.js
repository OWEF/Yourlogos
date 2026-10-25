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
const PERSONAL_VOICE={
  "identity": [
    "You've been thinking about who you are. What matters to you may be changing, and that doesn't make your earlier answers meaningless.",
    "You might learn something about yourself from a difficult moment. You don't have to let that moment define you.",
    "You can ask which choices genuinely feel like yours, rather than the ones you've learned to make for other people.",
    "You don't need a finished picture of yourself to decide what you want your time to stand for.",
    "You may notice different sides of yourself around different people. Who gives you room to be yourself?",
    "You can question an old story about yourself without losing everything that makes you you.",
    "You can think about who you are for years. Sometimes a small choice teaches you something thinking alone can't.",
    "You might hear your own voice more clearly when you're alone. You can still need other people's company.",
    "You may recognize yourself in the things you find beautiful, even before you know how to explain why.",
    "You aren't exactly who you were a year ago. That might be part of becoming yourself, not moving away from it."
  ],
  "connection": [
    "You've said connection matters to you. Sometimes meaning grows from the people you make room for, not just the goals you chase.",
    "When life is hard, you don't necessarily need someone to solve it. Sometimes being understood is enough.",
    "You can want closeness and still want freedom. A relationship doesn't have to erase either need.",
    "You can't hold on to every shared moment. You can still choose how you show up for someone today.",
    "You might find that being loved and being understood are not quite the same thing. Both can matter to you.",
    "You can care deeply about someone and still get them wrong. Curiosity can make more room for the other person.",
    "You don't have to make a grand gesture to show someone they matter. Often the small things carry the meaning.",
    "You can genuinely enjoy being alone and still wish someone were there sometimes. Those two feelings can live together.",
    "You may remember a beautiful moment because of who shared it with you, not only because of what you saw.",
    "You've been thinking about belonging. What would giving someone your undivided time look like this week?"
  ],
  "direction": [
    "You've been thinking about where you're headed. Your direction doesn't need to look impressive to mean something to you.",
    "You may feel clearer about what you want after a setback—or less certain. Neither response means you've failed to grow.",
    "You can hear many opinions about what your life should be. The difficult part is noticing which choices are yours.",
    "You don't have unlimited time for every possible path. What might feel worth making room for now?",
    "You may find your sense of purpose in what you offer others, not only in what you achieve for yourself.",
    "You can follow a plan for a long time before asking whether you still want it. You're allowed to ask again.",
    "You don't have to map out your entire future to begin. One honest step can give you new information.",
    "You might need a quiet moment to hear what you want, especially when everyone seems to have advice.",
    "You may be drawn toward making something even before you know what it will become.",
    "You've been thinking about your direction. Is there something you keep postponing until you feel more ready?"
  ],
  "time": [
    "You've had time and responsibilities on your mind. Sometimes the next thing you need to do makes the present moment feel like a waiting room.",
    "You may have days when there's little room to recover. You don't have to turn every difficult moment into something productive.",
    "You can have responsibilities and still ask which parts of your day genuinely belong to you.",
    "You can't make time endless. You can decide which ordinary moments deserve a little more of it.",
    "You might be so busy making things work that you forget to be fully present with someone you care about.",
    "When you're in a hurry, it's easier to mistake your first thought for the whole truth. You can give yourself a moment to look again.",
    "You may have a long list of things to do. One small action you actually care about can count, too.",
    "You don't have to make every quiet moment useful. Sometimes it's enough to have a moment that's yours.",
    "When your day moves quickly, beauty can be easy to miss. What would you notice if you slowed down just a little?",
    "You've been thinking about time. Planning for tomorrow can help you—but it shouldn't take all of today."
  ],
  "uncertainty": [
    "You've said uncertainty is on your mind. You can still move toward something meaningful without knowing exactly how it will turn out.",
    "You don't have to understand every difficult moment while you're living through it.",
    "You can make a thoughtful choice even when you can't control everything that follows.",
    "When the future feels unclear, you can still decide what deserves your attention today.",
    "You don't need other people to have every answer. Sometimes you just need someone who can stay with an unanswered question.",
    "You can take a worry seriously without treating it as a prediction. What would actually help you know more?",
    "You might learn more from trying a small step than from running through every possible outcome in your head.",
    "You may need time alone to think clearly. If your thoughts start circling, another perspective could help.",
    "You don't need to explain everything you find beautiful. Not knowing can leave room for wonder.",
    "You've been considering uncertain choices. Maybe the next step isn't certainty—just enough clarity to move."
  ],
  "freedom": [
    "You've been thinking about expectations. You can ask whether the life you're working toward still feels like yours.",
    "You can't choose every circumstance, but you may still have room to choose your response.",
    "You don't need to change everything to experience a little freedom. One deliberate choice can matter.",
    "You have limited time. It can be worth asking how much of it you spend meeting someone else's idea of success.",
    "You can choose to care for someone without losing the freedom that made the choice meaningful.",
    "You can respect another person's judgment without letting it become the final word on your life.",
    "You don't have to rebel against everything to act independently. Sometimes you just choose what matters to you.",
    "You can enjoy being alone without treating it as something you need to defend.",
    "You may love something other people don't understand. It doesn't have to win their approval to matter to you.",
    "You've been thinking about your freedom. Who gets to decide how you spend an ordinary day?"
  ],
  "change": [
    "You've mentioned change. What matters to you may shift when life changes, without making your earlier hopes foolish.",
    "You don't have to discover a lesson in a painful change immediately. You can give it time.",
    "You might have to release an old plan to make room for a choice you couldn't see before.",
    "When things change unexpectedly, you can still carry pieces of a meaningful life with you.",
    "You may need people differently as your life changes. That's not the same as losing your independence.",
    "You can question a belief that no longer fits your experience. Changing your mind can be part of moving forward.",
    "You don't have to make a difficult transition all at once. A small, kind step counts.",
    "You may want company one day and quiet the next while you adjust. You don't need one fixed way to cope.",
    "You may hold onto something beautiful because it reminds you that change isn't the whole story.",
    "You can't keep every part of the past. You can decide what you'd like to carry into what comes next."
  ],
  "fairness": [
    "You've said fairness and values matter to you. A good life may involve more than what you manage to achieve for yourself.",
    "You don't have to solve every injustice to let another person's suffering matter to you.",
    "Your freedom matters. So does the question of how your choices affect someone else's room to choose.",
    "You may never meet the people affected by a decision. That doesn't make their lives less real.",
    "You can care about someone and still need to ask what fair treatment means from their side.",
    "You can feel sure you're right and still leave room for another person's experience to complicate the picture.",
    "You don't need a grand speech to live by your values. A quiet fair choice can matter.",
    "You don't always have to win an argument. Sometimes hearing the other person is the more generous response.",
    "You may understand someone differently after seeing the world through their eyes, even briefly.",
    "You've been thinking about fairness. Whose time or effort might be easy to overlook, including your own?"
  ]
};
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
 // Lead with a short, directly addressed thought specifically written for the
 // volunteered concern and today's quote theme; don't paste a generic insight
 // beside a mechanical "you mentioned..." sentence.
 const insight=PERSONAL_VOICE[topic][themeIndex];
 const reflection=(a.style==="challenge"&&relevantTension)?tension.prompt:personalQuestion;
 return {...base,insight,quoteNote:base.insight,reflection,nudge,personalized:true,
    why:"This connects with "+person.label.toLowerCase()+", which you selected during your introduction.",
    lens:topic,style:a.style};
}
export function validatePersonalization(){
 return THEMES.length===10 && Object.keys(CONCERNS).length===8 &&
   Object.keys(QUESTIONS).every(k=>Object.hasOwn(CONCERNS,k)&&QUESTIONS[k].length===THEMES.length&&QUESTIONS[k].every(q=>q.endsWith("?"))) &&
   Object.keys(PERSONAL_VOICE).length===8 &&
   Object.entries(PERSONAL_VOICE).every(([key,rows])=>Object.hasOwn(CONCERNS,key)&&rows.length===THEMES.length&&rows.every(line=>line.length>=60&&line.length<=235&&/\byou\b/i.test(line)));
}
