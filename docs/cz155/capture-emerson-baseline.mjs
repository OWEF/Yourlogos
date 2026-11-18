// From a clean checkout of the specified baseline:
// node path/to/capture-emerson-baseline.mjs > /tmp/emerson-baseline.json
import assert from "node:assert/strict";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";

const sha = "493cb1471814fba9feb4cbeab6ae96b8e46565d6";
const blobs = {
  "experiments/yl-b27-route.mjs": "c1d6f99d8c35eaa4a230d4db0e74f82da6c84263",
  "experiments/yl-cz147-sources.mjs": "f5ea3ef28c71539fb80b71997001492c3f124428",
  "experiments/yl-cz147-engines.mjs": "9500612a8b902b8b5051cc19e4382cfb3d62874e",
  "experiments/yl-b27-quote-ledger.mjs": "c7004e5e4c7deaa9a9918ab578d64f626f0b24ae"
};
for (const [file, expected] of Object.entries(blobs)) {
  const bytes = readFileSync(file);
  const hash = createHash("sha1").update("blob " + bytes.length + "\0").update(bytes).digest("hex");
  assert.equal(hash, expected, "Replay on the frozen baseline: " + file);
}
const moduleFromRoot = file => import(pathToFileURL(resolve(file)));
const {resolveQuoteB27, runQuoteEncounterB27} = await moduleFromRoot("experiments/yl-b27-route.mjs");
const {CZ147_SOURCE_RECORDS} = await moduleFromRoot("experiments/yl-cz147-sources.mjs");
const source = CZ147_SOURCE_RECORDS.find(record => record.quoteId === 55);
const request = {quoteId: 55, quoteText: source.source.text, quoteAuthor: source.source.author,
  quoteWork: source.source.work, b27DevelopmentOnly: false};
const admitted = resolveQuoteB27(request);
assert.equal(admitted.status, "ready");
const paths = source.timeline.map(route => {
  const payload = {...request, sourceVersionHash: admitted.sourceVersionHash, canonicalInput: {path: route.path}};
  const result = runQuoteEncounterB27(payload);
  assert.equal(result.status, "ready");
  assert.deepEqual(result, runQuoteEncounterB27(payload));
  assert.equal(result.fullMeaning.meaning.choiceAnalysis.development.causedByInitialChoice, false);
  return {path: route.path, canonical: result.canonical_choice, reasoning: result.fullMeaning,
    emotion: result.emotion, full: result.fullExpression, compact: result.compact};
});
assert.equal(paths.length, 8);
const withoutRecap = result => JSON.stringify(result.compact.sections.slice(1).map(section => section.text));
const maintain = paths.filter(sample => sample.path[0] === "maintain");
assert.equal(new Set(maintain.map(withoutRecap)).size, 1);
assert.equal(new Set(maintain.map(sample => sample.compact.sections[0].text)).size, 4);
assert.deepEqual([...new Set(paths.map(sample => sample.emotion.strategy))], ["revisability"]);
const packet = {appSha: sha, validatedBlobs: blobs, quote: admitted.quote,
  sourceVersionHash: admitted.sourceVersionHash, record: source, paths};
process.stdout.write(JSON.stringify(packet, null, 2) + "\n");
