// Each pair belongs to one validated distinction. The time line uses the
// actual allocation; the temporal pairs distinguish when evidence arrived.
const eveningPairs = {
  "chosen-rest":["Tonight","Rest gets the largest share.","If repeated","Rest would have a regular place."],
  "deliberate-pause":["Tonight","The story can wait.","If repeated","The promised writing session never arrives."],
  "requests-without-writing":["One reply","A request gets an answer.","Repeated evenings","Writing could keep losing its turn."],
  "exception-repeated":["This evening","No time goes to the story.","If repeated","The exception could become the routine."],
  "exclusive-evening":["One sitting","Writing fills the evening.","A routine","Rest and replies need time elsewhere."],
  "writing-sets-budget":["Time set aside","Writing gets most of the evening.","Boundary","Other claims share what remains."],
  "room-for-both":["In this plan","Writing and rest both fit.","An extra half-hour","Something else must give way."],
  "recurring-foothold":["Tonight","There is a writing session.","Still open","The next session has no guarantee."]
};
const routePairs = {
  "feeling-and-forecast":["Then","Distance was something to imagine.","Now","You miss your friends. Continuing is still a step into the unknown."],
  "new-reason-for-action":["Then","The move lay ahead.","Now","Distance gives you a reason to make a plan for your friendships."],
  "continuity-of-place":["Chosen","You could keep your job.","Outside your choice","You could not keep the team from changing."],
  "successive-decisions":["First decision","Stay with a familiar team.","Second decision","Give a changed team more time."],
  "reasons-and-alternatives":["Within reach","Your reasons for staying.","Beyond reach","Experience of the job you turned down."],
  "commitment-without-comparison":["Still unknown","What moving would have brought.","Within reach","What you give your attention to here."],
  "terms-open-to-revision":["At acceptance","The actual hours lay ahead.","At renegotiation","You know their cost in evenings."],
  "cost-of-learning":["To learn","See how the hours feel over time.","What it takes","Live through more of those evenings."]
};

export function encounterDistinction(result, relation) {
  const kind=relation.kind;
  let pair;
  if (kind==="protected-or-remainder"){
    const minutes=relation.premises.writing*60;
    pair=["Allocated",minutes+" minutes for the story.","Protected","These minutes might have been reserved or left over."];
  } else {
    pair=(result.caseId==="dillard"?eveningPairs:routePairs)[kind];
  }
  if (!pair) return null;
  const [firstLabel,firstText,secondLabel,secondText]=pair;
  return {kind,form:result.caseId==="kierkegaard" && ["feeling-and-forecast","new-reason-for-action","successive-decisions","terms-open-to-revision"].includes(kind)?"sequence":"comparison",
    items:[{label:firstLabel,text:firstText},{label:secondLabel,text:secondText}]};
}

// Recognize complete, supported questions in volunteered fields. A word like
// "uncertain", a shared theme, or an app-generated prompt is insufficient.
// Keep the original words; matching a question gives no evidence of agreement.
const priorInquiries = {
  dillard:{
    pattern:/^(?:how (?:do|can) (?:i|we) (?:make|find|protect|set aside) time for (?:what matters(?: most)?|(?:my|our) priorities|writing)|(?:how )?(?:do|can) (?:my|our) (?:daily habits|routines) (?:reflect|shape) (?:what (?:i|we) value|(?:my|our) priorities))\?$/i,
    statement:/^I (?:keep meaning|intend|want) to (?:write|make time for what matters),? but (?:I (?:keep )?(?:end up answering messages|put it off)|other demands keep taking (?:over|my time))\.?$/i,
    connection:"Dillard offers a way to revisit that question by imagining tonight’s arrangement repeated."
  },
  kierkegaard:{
    pattern:/^(?:can (?:careful )?(?:reasoning|reflection|thinking(?: it through)?) (?:ever )?(?:remove|eliminate|resolve) (?:all )?uncertainty(?: before (?:i|we) (?:act|choose|decide))?|how (?:can|could) (?:i|we) know (?:the outcome|what will happen) before (?:i|we) (?:act|choose|decide))\?$/i,
    statement:/^I (?:wonder whether|wish I knew whether|keep asking whether) (?:careful )?(?:reasoning|reflection|thinking it through) (?:can|could) (?:ever )?(?:remove|eliminate|resolve) (?:all )?uncertainty(?: before (?:I|we) (?:act|choose|decide))?[.?]?$/i,
    connection:"Kierkegaard gives that question a limit: part of the evidence arrives through living the choice."
  }
};

export function encounterWorldThread(memory,id){
  const inquiry=priorInquiries[id];
  if (!inquiry || !Array.isArray(memory?.threads)) return null;
  for(const record of [...memory.threads].reverse()){
    if(record?.type!=="thread" || !record.id || !Number.isInteger(record.quoteId)) continue;
    for(const field of ["note","opening"]){
      const words=record[field];
      if(typeof words!=="string" || !(inquiry.pattern.test(words.trim()) || inquiry.statement.test(words.trim()))) continue;
      const fixture=memory.fixture===true;
      return {source:"livingThreads.history",recordId:record.id,field,quoteId:record.quoteId,date:record.date||null,
        fixture,excerpt:words.trim(),interpretation:inquiry.connection,
        text:(fixture?"Sample reflection":"In your earlier reflection")+" — “"+words.trim()+"” "+inquiry.connection};
    }
  }
  return null;
}
