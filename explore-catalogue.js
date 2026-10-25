// YourLogos — One-tap Explore editorial v1.
// Interpretive invitations, NOT statements attributed to the quoted authors.
// Stable quote IDs 0..90. Quotes and all existing tension records are unchanged.
// Remote/unreviewed quotes do not receive invented exploration content.
import { resolveTension } from "./tension-engine.js";
export const EXPLORE=[
  [
    "A reason to keep going can be powerful. But it can also make us stay somewhere that hurts us.",
    "Think of something you've kept doing for a reason. Does that reason still matter to you?",
    "existentialism"
  ],
  [
    "Wanting to become different is human. Yet accepting part of yourself can also be a form of growth.",
    "Is there something about yourself you've tried to fix that might deserve understanding instead?",
    "existentialism"
  ],
  [
    "Reflection helps us notice how we live. It becomes less useful if we never act on what we notice.",
    "What's one thing you've thought about often but haven't tried yet?",
    "skepticism"
  ],
  [
    "A worry can hurt even if the event never happens. The feeling is real; the prediction may not be.",
    "Remember a worry that didn't come true. What did it feel like while you were waiting?",
    "stoicism"
  ],
  [
    "We don't choose every circumstance. But even within limits, some responses remain ours.",
    "Recall a choice you made under pressure. What was and wasn't in your control?",
    "existentialism"
  ],
  [
    "Other people help us see ourselves. We often learn who we are through relationships, not just solitude.",
    "Who has shown you something about yourself that you hadn't noticed?",
    "daoism"
  ],
  [
    "Fear of wasting life can push us to live. It can also stop us enjoying the life already here.",
    "What have you been saving for 'someday' that you might enjoy now?",
    "stoicism"
  ],
  [
    "Sharing a direction brings people together. When paths change, care may need a different form.",
    "Have you ever grown in a different direction from someone you cared about?",
    "existentialism"
  ],
  [
    "Some experiences matter before we can explain them. Silence can be honest rather than empty.",
    "When was the last time you struggled to put an experience into words?",
    "skepticism"
  ],
  [
    "It's easy to discuss what a good person should do. Daily choices reveal what our values mean.",
    "What's a small act of kindness that mattered more than a long explanation?",
    "stoicism"
  ],
  [
    "Quiet time can reveal what distractions hide. But being alone is not the same as feeling connected.",
    "When you put your phone away, what thought usually arrives first?",
    "buddhism"
  ],
  [
    "Looking at the stars can make us feel small. Yet our choices about other people still matter close to home.",
    "When have you felt wonder about the world and responsibility for someone at the same time?",
    "stoicism"
  ],
  [
    "A life doesn't happen only in big moments. Ordinary afternoons become part of its story.",
    "What does a typical day of yours say about what you value?",
    "stoicism"
  ],
  [
    "Knowing a lot isn't the same as using what you know well. Judgment matters as much as intelligence.",
    "When has a simple decision been wiser than a clever one?",
    "skepticism"
  ],
  [
    "Not knowing doesn't always mean being lost. Sometimes it leaves room for real attention.",
    "Can you remember being curious without needing an answer immediately?",
    "buddhism"
  ],
  [
    "Being alone can feel peaceful when you choose it. Loneliness is different: you may want company and not have it.",
    "Think of the last time you wanted to be alone. Were you recharging, or wishing someone understood you?",
    "daoism"
  ],
  [
    "A first step matters, but moving isn't the same as moving in the right direction.",
    "What's one small beginning you could try without committing to the whole journey?",
    "daoism"
  ],
  [
    "We only act in the present. Still, what we do today shapes the future we'll have to meet.",
    "What's one small thing you could do today for your future self?",
    "buddhism"
  ],
  [
    "Standing apart from a crowd can take courage. Listening to criticism can take courage too.",
    "When have you held your ground and still learned from someone else?",
    "existentialism"
  ],
  [
    "Wonder gives us a reason to investigate, not necessarily a reason to stop asking.",
    "What mystery do you enjoy even though you've learned more about it?",
    "skepticism"
  ],
  [
    "You can be certain that you're thinking without having an easy answer to who you are.",
    "When do you feel most like yourself: while thinking, acting, or being with others?",
    "skepticism"
  ],
  [
    "Hearing disagreement doesn't mean surrendering your view. It can help you discover what supports it.",
    "What's a belief you understand better because someone challenged it?",
    "skepticism"
  ],
  [
    "Understanding the world changes what we notice. Changing it requires deciding what to do with that understanding.",
    "Is there something you understand well but wish you could improve in practice?",
    "existentialism"
  ],
  [
    "Helping someone become independent isn't the same as deciding their life for them.",
    "When has someone supported your choice without trying to make it for you?",
    "existentialism"
  ],
  [
    "Something ordinary can be deeply valuable even if it isn't rare or difficult.",
    "What simple part of your life would you miss more than an impressive achievement?",
    "stoicism"
  ],
  [
    "Feelings can tell us what matters, but they don't always tell us what is true.",
    "When did a strong feeling make sense only after you looked at it again?",
    "skepticism"
  ],
  [
    "Reason can help us choose how to pursue a desire. It can also ask whether that desire serves us.",
    "What's something you've wanted and later discovered you didn't need?",
    "stoicism"
  ],
  [
    "Rules can protect people from harm. Too much power, though, can become another source of fear.",
    "Where in everyday life does a useful rule start feeling controlling?",
    "skepticism"
  ],
  [
    "Creative freedom needs more than talent. It also needs time, security, and space to begin.",
    "What helps you make room for your own ideas?",
    "existentialism"
  ],
  [
    "The way we describe an event changes our experience of it. That doesn't make every event harmless.",
    "Has a different perspective helped you face something that was still genuinely difficult?",
    "stoicism"
  ],
  [
    "We grow among other people. Yet the communities that support us can also leave people outside.",
    "When have you felt included—or noticed someone else being left out?",
    "existentialism"
  ],
  [
    "One fact can be true and still mislead us if we ignore the larger story.",
    "What's something you understood differently after learning its background?",
    "skepticism"
  ],
  [
    "Our minds can make a hard situation harder or more bearable. They cannot always remove the situation itself.",
    "Has your mood ever changed how you experienced the same familiar place?",
    "stoicism"
  ],
  [
    "Sometimes a painful uncertainty lasts longer than the event we fear.",
    "Is there something you're waiting to know that is harder than acting without certainty?",
    "existentialism"
  ],
  [
    "We often understand choices only after living with them. That doesn't mean we must wait for certainty.",
    "What lesson from a past choice would you carry into a decision today?",
    "existentialism"
  ],
  [
    "A safe home depends on a world beyond its walls. Our private lives are connected to shared conditions.",
    "What place outside your home makes it feel more like home?",
    "daoism"
  ],
  [
    "Facing an uncomfortable side of yourself can open change. Staring at it endlessly can also keep you stuck.",
    "What have you learned from admitting something difficult about yourself?",
    "buddhism"
  ],
  [
    "Our view of the world is shaped by perception. But the world can still surprise and resist our expectations.",
    "When did something turn out differently from the way you saw it?",
    "skepticism"
  ],
  [
    "Art can interrupt an ordinary day and make us imagine living differently.",
    "Has a song, painting, or story ever changed what you wanted to do?",
    "existentialism"
  ],
  [
    "Fear sometimes exaggerates danger. Sometimes it warns us about something real.",
    "How do you usually tell useful caution from worry that keeps growing?",
    "stoicism"
  ],
  [
    "Speaking freely matters most when people disagree. Listening and answering are part of that freedom too.",
    "When did hearing an uncomfortable opinion teach you something?",
    "skepticism"
  ],
  [
    "Freedom doesn't always mean having no ties. A relationship can be a commitment you freely choose.",
    "What connection in your life feels chosen rather than imposed?",
    "existentialism"
  ],
  [
    "Curiosity comes naturally, but being wrong can feel uncomfortable enough to make us stop asking.",
    "What question have you avoided because the answer might change your mind?",
    "skepticism"
  ],
  [
    "Doing what you believe is right may not make you happy immediately. A good life may involve more than pleasure.",
    "When have you done something meaningful that wasn't particularly enjoyable?",
    "stoicism"
  ],
  [
    "Death may not be an experience we can describe. We can still fear losing the life we hoped to live.",
    "What would you regret not making time for, even in a small way?",
    "buddhism"
  ],
  [
    "Peace can come from needing less. Wanting more doesn't always bring more satisfaction.",
    "What's a simple pleasure that feels complete without needing an upgrade?",
    "buddhism"
  ],
  [
    "Two people can face the same setback differently. Their judgments matter, though the pain may still be real.",
    "Has changing your attitude ever made a hard day a little easier?",
    "stoicism"
  ],
  [
    "You may not control the result of an action. The choice to act can still belong to you.",
    "What worthwhile thing would you try even if success weren't guaranteed?",
    "stoicism"
  ],
  [
    "Accepting what has already happened doesn't mean approving of it. You can still decide what to change next.",
    "Can you name something you accepted before you were ready to move forward?",
    "stoicism"
  ],
  [
    "A full life isn't measured by the same list for everyone. What counts as worthwhile can differ.",
    "What makes a day feel well spent to you, even when it looks ordinary?",
    "stoicism"
  ],
  [
    "Preparing for the future helps. But constant postponement can make today disappear.",
    "What's something small you keep promising yourself you'll do later?",
    "stoicism"
  ],
  [
    "Some days are quiet, tired, or difficult. They still belong to our lives.",
    "What helps you be kinder to yourself on a day when little gets done?",
    "buddhism"
  ],
  [
    "Ordinary work can hold meaning, but it can also become a routine we never question.",
    "Which routine gives your life purpose, and which one merely fills time?",
    "existentialism"
  ],
  [
    "Removing clutter can make space for what matters. Yet relationships and commitments can also make life rich.",
    "If you could simplify one thing this week, what would you keep?",
    "daoism"
  ],
  [
    "Trusting your judgment is important. Real confidence can also make room for correction.",
    "When did changing your mind require more confidence than holding firm?",
    "skepticism"
  ],
  [
    "Changing your mind can show growth. Staying with a good commitment can show integrity.",
    "What's a value you'd keep even if some of your opinions changed?",
    "stoicism"
  ],
  [
    "Evidence can guide belief without giving perfect certainty. At some point, decisions still have to be made.",
    "When have you acted on the best information you had, knowing it might be incomplete?",
    "skepticism"
  ],
  [
    "Experience teaches us much, but no single person's experience covers the whole world.",
    "What have you learned by listening to someone whose life differs from yours?",
    "skepticism"
  ],
  [
    "We experience the world through perception. That raises the question of what continues when nobody is looking.",
    "Think of a place you know well. What happens there when you aren't around?",
    "skepticism"
  ],
  [
    "Freedom without any limits can collide with another person's freedom.",
    "Where does one person's choice begin to affect someone else's?",
    "existentialism"
  ],
  [
    "Your body and mind are yours. Yet some of your decisions also have consequences for other people.",
    "Can you think of a personal decision that needed a conversation with someone else?",
    "existentialism"
  ],
  [
    "Things that seem permanent can change quickly. That makes shared life uncertain—and open to change.",
    "What's something you once assumed would always stay the same?",
    "existentialism"
  ],
  [
    "Where we grow up shapes what feels normal. We can begin questioning those habits once we notice them.",
    "What belief felt obvious to you until you met someone who lived differently?",
    "skepticism"
  ],
  [
    "Wisdom often arrives after events unfold. Hindsight can still help with the next decision.",
    "What do you understand now that you couldn't see while something was happening?",
    "skepticism"
  ],
  [
    "Having choices is exciting, but each possibility also means giving something else up.",
    "When did having too many options make a decision harder?",
    "existentialism"
  ],
  [
    "You're shaped by circumstances you didn't choose. Your actions can still change who you're becoming.",
    "What's one part of your life you've shaped through repeated small choices?",
    "existentialism"
  ],
  [
    "A repetitive task may not change. The way a person meets it can still become meaningful.",
    "Is there a routine you experience differently depending on why you do it?",
    "existentialism"
  ],
  [
    "Words help us describe experience, but some feelings resist easy names.",
    "What's something you understand well but struggle to explain?",
    "skepticism"
  ],
  [
    "A gesture or shared silence can communicate what a long explanation misses.",
    "When has someone's action told you more than their words?",
    "skepticism"
  ],
  [
    "Facts describe what happens. They don't always settle what an experience means to us.",
    "Think of one fact about your life. What does it leave out?",
    "skepticism"
  ],
  [
    "Thinking for yourself doesn't mean learning nothing from others. It means taking responsibility for your judgment.",
    "When have you reconsidered advice instead of simply following it?",
    "skepticism"
  ],
  [
    "Rules help us think about fairness. Real people and circumstances can test how we apply them.",
    "Would you want others to follow a rule you make for yourself?",
    "stoicism"
  ],
  [
    "Care and knowledge can correct each other: good intentions matter, and so does understanding their effects.",
    "When has learning more about someone changed how you helped them?",
    "buddhism"
  ],
  [
    "Social expectations influence who we become. They need not decide every possibility open to us.",
    "What's something you were expected to be that you later questioned?",
    "existentialism"
  ],
  [
    "Things depend on other things to exist as they do. Dependence doesn't make them unimportant.",
    "Pick a simple object near you. How many people and conditions helped bring it here?",
    "buddhism"
  ],
  [
    "Answering cruelty with more hatred can continue the harm. Resisting harm doesn't have to mean becoming cruel.",
    "Have you ever ended a conflict by refusing to copy someone else's anger?",
    "buddhism"
  ],
  [
    "A familiar world can seem like the whole world—until we encounter something beyond it.",
    "What's a place, person, or idea that made your world suddenly feel bigger?",
    "daoism"
  ],
  [
    "Learning gives us ideas to work with. Thinking helps us decide what those ideas mean.",
    "When has a lesson only made sense after you tried it yourself?",
    "skepticism"
  ],
  [
    "Recognizing what you don't know can be more useful than pretending to know everything.",
    "What's one thing you'd feel comfortable saying 'I don't know' about?",
    "skepticism"
  ],
  [
    "Uncertainty can unsettle us. It can also make space for imagination and new ideas.",
    "Has a messy period of life ever led you to create something?",
    "existentialism"
  ],
  [
    "Becoming yourself may mean growing rather than uncovering a fixed identity.",
    "What part of yourself has changed in a way you now value?",
    "existentialism"
  ],
  [
    "When old certainties lose their power, people face the difficult task of finding new reasons to live.",
    "Have you ever changed what gives your life meaning?",
    "existentialism"
  ],
  [
    "Writing about ordinary experience can help others recognize something in their own lives.",
    "What's a small story from your life that someone else might understand?",
    "skepticism"
  ],
  [
    "A single path can look different depending on the direction you're traveling.",
    "When did returning to a familiar place feel different from arriving there?",
    "daoism"
  ],
  [
    "Longing can keep us moving. Finding peace may change our searching rather than end it.",
    "What do you keep looking for even when many things in life are going well?",
    "existentialism"
  ],
  [
    "New things often grow out of what already exists. A change can be new without appearing from nowhere.",
    "What have you made by combining things you already knew?",
    "skepticism"
  ],
  [
    "Hope lets us look beyond hardship. It matters most when we don't ignore the hardship in front of us.",
    "What gives you hope without making you overlook a real problem?",
    "existentialism"
  ],
  [
    "The familiar can hide its own wonder. Looking closely sometimes changes an ordinary sight.",
    "What everyday thing would you like to look at with fresh eyes?",
    "daoism"
  ],
  [
    "Ideas need bodies to carry them. Rest, food, and security shape our ability to think and create.",
    "When do you notice that caring for your body helps your mind?",
    "buddhism"
  ],
  [
    "Sudden change can hurt because it breaks expectations. Over time, it can also make different futures possible.",
    "What's a change that felt difficult first but later opened a door?",
    "existentialism"
  ],
  [
    "Compassion often begins with noticing another person's pain before we've found the perfect words.",
    "When did you understand someone's struggle without needing them to explain everything?",
    "buddhism"
  ]
];
export function exploreFor(quote,quoteId){
  if(!resolveTension(quote,quoteId)||!Number.isInteger(quoteId))return null;
  const row=EXPLORE[quoteId];
  return row?{insight:row[0],reflection:row[1],school:row[2]}:null;
}
export function validateExplore(){
  const allowed=new Set(["stoicism","existentialism","nihilism","skepticism","daoism","buddhism"]);
  return EXPLORE.length===91&&EXPLORE.every(row=>Array.isArray(row)&&row.length===3&&row[0].length>25&&row[1].endsWith("?")&&allowed.has(row[2]));
}
