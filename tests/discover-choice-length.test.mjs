import test from "node:test";
import assert from "node:assert/strict";
import {validateDiscoverTurn} from "../discover-ai-server.mjs";

const opening = {
  reply: "A difficult choice can reveal what really matters.",
  followUp: "Imagine deciding whether to remain in a demanding job. What guides your decision?",
  choices: [
    "Stay because the commitment still matters",
    "Leave because my circumstances have changed",
    "Ask what I hope this effort will accomplish"
  ]
};

test("accepts meaningful short opening lenses without silently rewriting them", () => {
  const parsed = validateDiscoverTurn(opening, 0);
  assert.deepEqual(parsed.choices, opening.choices);
  assert.equal(parsed.complete, false);
});

test("rejects an overlength raw choice rather than accepting its truncated prefix", () => {
  const tooLong = "Consider the consequences for everyone involved before deciding on a course of action. ".repeat(2);
  assert.ok(tooLong.length > 82, "fixture must exceed the contractual limit");
  assert.throws(
    () => validateDiscoverTurn({...opening, choices: [opening.choices[0], tooLong, opening.choices[2]]}, 0),
    /Invalid philosophical choices/
  );
});

test("accepts a choice at the exact 82-character boundary", () => {
  const boundary = "A difficult choice can still carry genuine consequences for other people".padEnd(82, ".");
  assert.equal(boundary.length, 82);
  const parsed = validateDiscoverTurn({...opening, choices: [opening.choices[0], boundary, opening.choices[2]]}, 0);
  assert.equal(parsed.choices[1], boundary);
});

test("the final turn still requires no choices and remains complete", () => {
  const final = {
    reply: "A commitment can matter without becoming a permanent obligation to endure every difficulty.",
    followUp: "What would make your next decision feel more deliberate?",
    choices: []
  };
  assert.deepEqual(validateDiscoverTurn(final, 1), {...final, complete: true});
  assert.throws(() => validateDiscoverTurn({...final, choices: [opening.choices[0]]}, 1), /Final reflection/);
});
