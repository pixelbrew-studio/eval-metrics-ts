# eval-metrics-ts

Small TypeScript metrics for classification and ranking evaluations.

The package is intentionally plain: arrays in, numbers out. It is useful for LLM evals, search/ranking checks, classifier tests, and product experiments where a full evaluation framework would be too much.

## Install

```bash
npm install eval-metrics-ts
```

## Use

```ts
import { accuracy, macroF1, pairwiseRankingAccuracy, topKOverlap } from "eval-metrics-ts";

const expected = ["pass", "review", "fail", "pass"];
const predicted = ["pass", "fail", "fail", "pass"];

console.log(accuracy(expected, predicted)); // 0.75
console.log(macroF1(expected, predicted).macroF1);

const truth = [0.95, 0.7, 0.2, 0.5];
const scores = [0.9, 0.6, 0.3, 0.4];

console.log(pairwiseRankingAccuracy(truth, scores)); // 1
console.log(topKOverlap(truth, scores, 2)); // 1
```

## API

| Function | Purpose |
|---|---|
| `confusionMatrix(expected, predicted, labels?)` | Counts expected-vs-predicted labels. |
| `accuracy(expected, predicted)` | Fraction of exact matches. Empty input returns `0`. |
| `precisionRecallF1(expected, predicted, labels?)` | Per-label precision, recall, F1, and support. |
| `macroF1(expected, predicted, labels?)` | Unweighted average F1 across labels. |
| `pairwiseRankingAccuracy(expectedScores, predictedScores)` | Fraction of item pairs ordered correctly. |
| `topKOverlap(expectedScores, predictedScores, k)` | Overlap between true top-k and predicted top-k. |

All paired arrays must have equal lengths. Length mismatches throw a `RangeError`.

## Ranking Tie Policy

- Pairs tied in the expected scores are skipped.
- If predicted scores tie for a non-tied expected pair, the pair receives `0.5` credit.
- Top-k tie handling is stable by original index. This keeps the function deterministic and dependency-free.

