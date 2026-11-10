/**
 * CZ-115 read-only bridge for YourLogos' CURRENT fingerprint data shapes.
 *
 * Existing app.js uses data.saved (catalogue quote IDs) and data.encounterEvents
 * (source, theme, quoteId). Its fingerprint is a history of exploration, not
 * beliefs, identity, aptitude, mood or a philosophical rating.
 *
 * Pure adapter: caller supplies data + QUOTES. Never reads localStorage,
 * connects accounts, writes state, or exports user event history.
 */
export function adaptYourLogosFingerprint(data,quotes) {
 if(!data||typeof data!=="object"||!Array.isArray(quotes))
  throw new TypeError("Provide existing app data and its quote catalogue");
 const events=[];
 const saved=Array.isArray(data.saved)?data.saved:[];
 for(const quoteId of saved.slice(-100)){
   if(!Number.isInteger(quoteId)||quoteId<0||quoteId>=quotes.length)continue;
   const q=quotes[quoteId];
   if(typeof q?.[2]!=="string"||!q[2])continue;
   events.push({source:"saved",quoteId,theme:q[2]});
 }
 const encounters=Array.isArray(data.encounterEvents)?data.encounterEvents:[];
 for(const event of encounters.slice(-120)){
   if(!event||typeof event!=="object"||event.source!=="encounter"||
     typeof event.theme!=="string"||!event.theme||
     !(Number.isInteger(event.quoteId)&&event.quoteId>=0&&event.quoteId<quotes.length))
     continue;
   if(quotes[event.quoteId]?.[2]!==event.theme)continue;
   events.push({source:"encounter",quoteId:event.quoteId,theme:event.theme});
 }
 return {schemaVersion:1,events};
}
