# eval-metrics-ts

Small TypeScript metrics for classification and ranking evaluations.

[Live Demo](https://pixelbrew-studio.github.io/eval-metrics-ts/) | [Evalgist](https://evalgist.ai)

[Built by Pixelbrew Studio](https://pixelbrew.studio/work/eval-metrics-ts) as part of its public workbench for evaluation tools and AI-native product experiments.

This repository is a compact public reference implementation: arrays in, numbers out. It is useful for LLM evals, search/ranking checks, classifier tests, and product experiments where a full evaluation framework would be too much.

It exists primarily as a readable, auditable code sample rather than a separately managed distribution surface.

> Use the live demo to test classification and ranking examples in the browser, then inspect the implementation to see the exact scoring behavior with no framework noise and no server-side abstraction.

## Local Use

```bash
npm install
npm test
npm run build:site
npm run preview
```

## Demo

The repository includes a static browser demo in [demo/index.html](demo/index.html) and a GitHub Pages deployment workflow in [.github/workflows/pages.yml](.github/workflows/pages.yml). The demo lets you:

- paste expected and predicted class labels to inspect accuracy, per-label precision/recall/F1, and macro F1
- paste expected and predicted ranking scores to inspect pairwise ranking accuracy and top-k overlap
- load built-in examples, then compare the visible results with the implementation in `src/index.ts`

The published URL is:

`https://pixelbrew-studio.github.io/eval-metrics-ts/`

## Example

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
Ranking functions require finite numeric scores. `topKOverlap` also requires an integer `k`. Invalid numeric inputs throw a `TypeError`.

## Ranking Tie Policy

- Pairs tied in the expected scores are skipped.
- If predicted scores tie for a non-tied expected pair, the pair receives `0.5` credit.
- Top-k tie handling is stable by original index. This keeps the function deterministic and dependency-free.

## Related Work

- [Pixelbrew Studio](https://pixelbrew.studio) - independent AI-native product lab for small tools and public experiments.
- [Evalgist](https://evalgist.ai) - AI-assisted evaluation tools with quoted evidence.
