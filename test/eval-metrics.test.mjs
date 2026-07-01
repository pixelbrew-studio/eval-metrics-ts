import assert from "node:assert/strict";
import test from "node:test";

import {
  accuracy,
  confusionMatrix,
  macroF1,
  pairwiseRankingAccuracy,
  precisionRecallF1,
  topKOverlap,
} from "../dist/index.js";

test("scores perfect predictions", () => {
  const expected = ["pass", "review", "fail"];
  const predicted = ["pass", "review", "fail"];

  assert.equal(accuracy(expected, predicted), 1);
  assert.equal(macroF1(expected, predicted).macroF1, 1);
});

test("scores mixed multiclass predictions", () => {
  const expected = ["pass", "review", "fail", "pass"];
  const predicted = ["pass", "fail", "fail", "pass"];
  const metrics = precisionRecallF1(expected, predicted);

  assert.equal(accuracy(expected, predicted), 0.75);
  assert.equal(metrics.get("pass").f1, 1);
  assert.equal(metrics.get("review").support, 1);
  assert.equal(metrics.get("fail").precision, 0.5);
});

test("builds confusion matrices", () => {
  const matrix = confusionMatrix(["a", "a", "b"], ["a", "b", "b"]);

  assert.equal(matrix.counts.get("a").get("a"), 1);
  assert.equal(matrix.counts.get("a").get("b"), 1);
  assert.equal(matrix.counts.get("b").get("b"), 1);
});

test("handles empty inputs", () => {
  assert.equal(accuracy([], []), 0);
  assert.equal(macroF1([], []).macroF1, 0);
  assert.equal(pairwiseRankingAccuracy([], []), 0);
  assert.equal(topKOverlap([], [], 3), 0);
});

test("throws on length mismatches", () => {
  assert.throws(() => accuracy(["a"], []), RangeError);
  assert.throws(() => pairwiseRankingAccuracy([1], []), RangeError);
});

test("rejects invalid ranking inputs", () => {
  assert.throws(() => pairwiseRankingAccuracy([1, 0], [Number.NaN, 0]), TypeError);
  assert.throws(() => topKOverlap([1, 0], [Infinity, 0], 1), TypeError);
  assert.throws(() => topKOverlap([1, 0], [1, 0], 1.5), TypeError);
});

test("scores ranking pairs and ties", () => {
  assert.equal(pairwiseRankingAccuracy([3, 2, 1], [0.9, 0.8, 0.1]), 1);
  assert.equal(pairwiseRankingAccuracy([3, 2], [0.5, 0.5]), 0.5);
  assert.equal(pairwiseRankingAccuracy([1, 1], [0.5, 0.2]), 0);
});

test("scores top-k overlap", () => {
  assert.equal(topKOverlap([10, 9, 1, 0], [9, 10, 1, 0], 2), 1);
  assert.equal(topKOverlap([10, 9, 1, 0], [0, 1, 9, 10], 2), 0);
  assert.equal(topKOverlap([10, 9, 1, 0], [10, 1, 9, 0], 2), 0.5);
});

test("breaks top-k ties by original index", () => {
  // Expected all tie -> top-2 is indices {0,1} (stable by index), not {1,2}.
  // Predicted [1,2,3] top-2 is indices {2,1}; overlap is {1} = 0.5.
  assert.equal(topKOverlap([5, 5, 5], [1, 2, 3], 2), 0.5);
});

test("clamps k above the input length", () => {
  assert.equal(topKOverlap([3, 1], [3, 1], 5), 1);
});

test("honors an explicit label set", () => {
  const matrix = confusionMatrix(["a", "b"], ["a", "a"], ["a", "b", "c"]);

  assert.deepEqual(matrix.labels, ["a", "b", "c"]);
  assert.equal(matrix.counts.get("c").get("c"), 0);
  assert.equal(matrix.counts.get("a").get("a"), 1);
  assert.equal(matrix.counts.get("b").get("a"), 1);
});
