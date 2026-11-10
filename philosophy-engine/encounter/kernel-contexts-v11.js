// The texts and their limits are editorial inputs. Household purchases, a print
// workshop and the two decision graphs are invented teaching scenarios.
export const transferContexts={
 thoreau:{
  id:"thoreau",author:"Henry David Thoreau",quote:"the cost of a thing is the amount of what I will call life which is required to be exchanged for it",
  source:{work:"Walden · Economy (excerpt)",url:"https://digitalthoreau.org/walden/fluid/text/01.html"},
  scenario:"You are furnishing a room. Each spending token is $20 earned in an extra hour of work. Choose what to buy and how much of the available budget to use.",
  mechanism:"tradeoff",operations:["tradeoff"],assumptions:["Only these purchases require extra shifts, at a constant net wage."],
  operation:"conversion",questions:{zero:"What does deciding against the purchase leave you free to do?"},distinction:"Price paid / time given",relation:"Thoreau considers shelter in terms of the life exchanged for it. An affordable purchase can still claim a portion of a working life.",
  limit:"No price establishes that a purchase is worthwhile or wasteful.",question:"Which purchase looks different when you read its price as part of a working day?",
  model:{resources:[{id:"money",label:"Available $20 tokens",min:4,max:12,type:"cap"}],
   choices:[{id:"repair",label:"chair repairs",cost:[1],max:4},{id:"lamp",label:"reading lamps",cost:[2],max:3},{id:"shelf",label:"shelves",cost:[3],max:3}],
   initial:{amounts:[1,1,0],budgets:[8]},metric:{op:"sum",weights:[1,2,3],unit:"extra working hours"}}
 },
 smith:{
  id:"smith",author:"Adam Smith",quote:"Those ten persons, therefore, could make among them upwards of forty-eight thousand pins in a day.",
  source:{work:"The Wealth of Nations · I.i",url:"https://www.d.umn.edu/cla/faculty/jhamlin/4111/Smith/SmithDV1.html"},
  scenario:"Four volunteers are printing booklets. A press operator prints two sets of pages, and a binder finishes one set. Assign everyone for one shift.",
  mechanism:"tradeoff",operations:["tradeoff"],assumptions:["Each booklet needs both operations; these invented rates hold for this shift."],
  operation:"complementarity",questions:{gain:"How could the same number of workers finish more when one changes tasks?"},distinction:"Hands assigned / work finished",relation:"Smith’s pin makers produce together what an isolated worker could scarcely make alone. Here a printed set still needs a binder: the arrangement of the hands matters as much as their number.",
  limit:"These rates cannot establish historical productivity, welfare, or a universally best division of labour.",question:"What does the last finished booklet owe to the way the work was divided?",
  model:{resources:[{id:"team",label:"Volunteers",min:4,max:4,type:"exact"}],
   choices:[{id:"press",label:"press operators",cost:[1],max:4},{id:"bind",label:"binders",cost:[1],max:4}],
   initial:{amounts:[3,1],budgets:[4]},metric:{op:"minimum",weights:[2,1],unit:"finished booklets"}}
 },
 epictetus:{
  id:"epictetus",author:"Epictetus",quote:"Some things are in our control and others not.",
  source:{work:"Enchiridion · §1, Elizabeth Carter translation",url:"https://barryfvaughan.org/text/philtext/epictetus/enchiridion.html"},
  scenario:"You have one place to apply for a workshop. You can send an application, revise it, or let the deadline pass. The organizer decides whom to admit.",
  mechanism:"decision_map",operations:["decision_map"],assumptions:["Submitting closes editing for this application."],
  operation:"agency",distinction:"One’s own action / another person’s judgment",relation:"The distinction concerns what belongs to your agency. You can decide what to submit; even a careful revision cannot give you the organizer’s power of admission.",
  limit:"No path establishes admission, indifference, or a reader’s character.",question:"Where does your choice end and the organizer’s judgment begin along this route?",
  model:{start:"draft",initial:["Admission belongs to the organizer"],nodes:{
   draft:{prompt:"What do you do with the draft?",options:[
    {id:"send",label:"Send the application",next:"sent",closes:["revise"],reveal:["The submitted draft is final"]},
    {id:"revise",label:"Ask a friend to read it",next:"review",reveal:["Your friend flags an unclear example"]},
    {id:"pass",label:"Let the deadline pass",next:null,reveal:["No application was submitted"]}]},
   review:{prompt:"Your friend flags an unclear example.",options:[
    {id:"edit",label:"Clarify the example and submit",next:"sent",closes:["revise"],reveal:["The submitted draft is final"]},
    {id:"pass",label:"Let the deadline pass",next:null,reveal:["No application was submitted"]}]},
   sent:{prompt:"Your application is in. The organizer has yet to decide.",options:[
    {id:"prepare",label:"Prepare a practice session",next:null},{id:"wait",label:"Wait for the decision",next:null},
    {id:"revise",label:"Revise the submitted draft",next:null}]}
  }}
 },
 descartes:{
  id:"descartes",author:"René Descartes",quote:"The first was never to accept anything for true which I did not clearly know to be such",
  source:{work:"Discourse on the Method · II (excerpt)",url:"https://en.wikisource.org/wiki/Discourse_on_the_Method/Part_2"},
  scenario:"Two summaries of a town vote disagree. A newsletter is due, and you must decide what you can responsibly report.",
  mechanism:"decision_map",operations:["decision_map"],assumptions:["The signed minutes settle the vote in this illustration, not every question about it."],
  operation:"information",questions:{revision:"Which evidence let you change what the newsletter would say before it went to print?"},distinction:"Receiving an assertion / grounds for assent",relation:"Descartes asks what licenses the step from considering a claim to accepting it. A deadline can force an editorial decision while leaving the question of truth open. Checking minutes illustrates only the restraint in his first rule.",
  limit:"A document check is not Cartesian clear and distinct knowledge; neither haste nor doubt proves a claim false.",question:"Which fact available when you acted could actually support the claim you would print?",
  model:{start:"reports",initial:["The two reports disagree"],nodes:{
   reports:{prompt:"Two accounts disagree. What next?",options:[
    {id:"hold",label:"Withhold the figure",next:null},
    {id:"print",label:"Print the first report",next:null,closes:["withdraw-before-print"]},
    {id:"seek",label:"Request the minutes",next:"reply",reveal:["The clerk sends an unsigned draft"]}]},
   reply:{prompt:"The clerk sends an unsigned draft.",options:[
    {id:"qualify",label:"Pencil in a provisional figure",sets:{report:"provisional"},next:"proof",reveal:["The signed minutes arrive before printing"]},
    {id:"verify",label:"Check for a signed version",next:"confirmed",reveal:["The signed minutes confirm the second report"]}]},
   proof:{prompt:"The signed minutes arrive while you can still change the page.",options:[
    {id:"amend",label:"Replace the provisional figure with the signed result",sets:{report:"confirmed"},next:null},
    {id:"omit",label:"Remove the provisional figure",sets:{report:"withheld"},next:null}]},
   confirmed:{prompt:"The signed minutes confirm the second report.",options:[
    {id:"cite",label:"Publish the confirmed figure with its source",next:null,requires:["The signed minutes confirm the second report"]},
    {id:"hold",label:"Defer publication",next:null}]}
  }}
 }
};
