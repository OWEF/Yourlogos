/**
 * CZ-13 source-witness registry (editorially curated, NOT scholarly verification).
 * This separate, quote-agnostic table binds a displayed excerpt and an exact
 * human-proposed thesis. Its existence does not prove that thesis follows from
 * the passage. Do not replace qualified primary-source review with this check.
 *
 * No quote-ID dispatch in the core; unknown sources may be rendered only as
 * explicitly unverified proposals.
 */
export const SOURCE_PASSAGE_WITNESSES=Object.freeze([
 {url:'https://digitalthoreau.org/walden/fluid/text/01.html',
  excerpt:'the cost of a thing is the amount of what I will call life which is required to be exchanged for it',
  centralClaim:'Thoreau asks us to consider the life exchanged to obtain a possession, not merely its price.'},
 {url:'https://www.d.umn.edu/cla/faculty/jhamlin/4111/Smith/SmithDV1.html',
  excerpt:'Those ten persons, therefore, could make among them upwards of forty-eight thousand pins in a day.',
  centralClaim:'Smith explains productivity gains from dividing and specializing labour, not simply a numerical bottleneck.'},
 {url:'https://barryfvaughan.org/text/philtext/epictetus/enchiridion.html',
  excerpt:'Some things are in our control and others not.',
  centralClaim:'Epictetus distinguishes choices and judgments within rational agency from outcomes that depend on others.'},
 {url:'https://en.wikisource.org/wiki/Discourse_on_the_Method/Part_2',
  excerpt:'The first was never to accept anything for true which I did not clearly know to be such',
  centralClaim:'Descartes cautions against assent that exceeds what is clearly and distinctly understood.'},
 {url:'https://www.dltn.io/posts/annie-dillard-keep-a-daily-routine',
  excerpt:'How we spend our days is, of course, how we spend our lives.',
  centralClaim:'Dillard draws attention to the way the arrangement of days accumulates into a life.'},
 {url:'https://homepage.divms.uiowa.edu/~jorgen/kierkegaardquotesource.html',
  excerpt:'Life can only be understood backwards; but it must be lived forwards.',
  centralClaim:'A life must be lived forward even though an account of it is formed retrospectively, never from outside time.'}
]);
const normalize=x=>String(x||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function traceSourcePassage(admission,quote){
 const witness=SOURCE_PASSAGE_WITNESSES.find(w=>w.url===admission?.sourceUrl);
 if(!witness)return {status:'unverified',reason:'No independently curated source-passage witness for this source.'};
 if(normalize(witness.excerpt)!==normalize(quote)||witness.centralClaim!==admission.centralClaim)
  return {status:'mismatch',reason:'The claim or displayed excerpt differs from the independent source-passage witness.'};
 return {status:'curated_passage_match',excerpt:witness.excerpt,independentlySourceVerified:false};
}
