export type Label = string | number | symbol;

export type ConfusionMatrix<L extends Label = string> = {
  labels: L[];
  counts: Map<L, Map<L, number>>;
};

export type LabelMetrics = {
  precision: number;
  recall: number;
  f1: number;
  support: number;
};

export function confusionMatrix<L extends Label>(
  expected: readonly L[],
  predicted: readonly L[],
  labels: readonly L[] = uniqueLabels(expected, predicted),
): ConfusionMatrix<L> {
  assertSameLength(expected, predicted);

  const counts = new Map<L, Map<L, number>>();
  for (const actual of labels) {
    const row = new Map<L, number>();
    for (const guess of labels) row.set(guess, 0);
    counts.set(actual, row);
  }

  for (let index = 0; index < expected.length; index += 1) {
    const actual = expected[index]!;
    const guess = predicted[index]!;
    if (!counts.has(actual)) counts.set(actual, new Map());
    const row = counts.get(actual)!;
    row.set(guess, (row.get(guess) ?? 0) + 1);
  }

  return { labels: [...labels], counts };
}

export function accuracy<L extends Label>(expected: readonly L[], predicted: readonly L[]): number {
  assertSameLength(expected, predicted);
  if (expected.length === 0) return 0;

  let correct = 0;
  for (let index = 0; index < expected.length; index += 1) {
    if (Object.is(expected[index], predicted[index])) correct += 1;
  }
  return correct / expected.length;
}

export function precisionRecallF1<L extends Label>(
  expected: readonly L[],
  predicted: readonly L[],
  labels: readonly L[] = uniqueLabels(expected, predicted),
): Map<L, LabelMetrics> {
  const matrix = confusionMatrix(expected, predicted, labels);
  const result = new Map<L, LabelMetrics>();

  for (const label of matrix.labels) {
    const truePositive = matrix.counts.get(label)?.get(label) ?? 0;
    const falsePositive = sumColumn(matrix, label) - truePositive;
    const falseNegative = sumRow(matrix, label) - truePositive;
    const support = sumRow(matrix, label);
    const precision = divide(truePositive, truePositive + falsePositive);
    const recall = divide(truePositive, truePositive + falseNegative);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

    result.set(label, { precision, recall, f1, support });
  }

  return result;
}

export function macroF1<L extends Label>(
  expected: readonly L[],
  predicted: readonly L[],
  labels?: readonly L[],
): { macroF1: number; byLabel: Map<L, LabelMetrics> } {
  const byLabel = precisionRecallF1(expected, predicted, labels);
  if (byLabel.size === 0) return { macroF1: 0, byLabel };

  const total = [...byLabel.values()].reduce((sum, metrics) => sum + metrics.f1, 0);
  return { macroF1: total / byLabel.size, byLabel };
}

export function pairwiseRankingAccuracy(
  expectedScores: readonly number[],
  predictedScores: readonly number[],
): number {
  assertSameLength(expectedScores, predictedScores);
  assertFiniteNumbers(expectedScores, "expectedScores");
  assertFiniteNumbers(predictedScores, "predictedScores");

  let scoredPairs = 0;
  let credit = 0;

  for (let left = 0; left < expectedScores.length; left += 1) {
    for (let right = left + 1; right < expectedScores.length; right += 1) {
      const expectedOrder = Math.sign(expectedScores[left]! - expectedScores[right]!);
      if (expectedOrder === 0) continue;

      const predictedOrder = Math.sign(predictedScores[left]! - predictedScores[right]!);
      scoredPairs += 1;
      if (predictedOrder === expectedOrder) credit += 1;
      if (predictedOrder === 0) credit += 0.5;
    }
  }

  return scoredPairs === 0 ? 0 : credit / scoredPairs;
}

export function topKOverlap(
  expectedScores: readonly number[],
  predictedScores: readonly number[],
  k: number,
): number {
  assertSameLength(expectedScores, predictedScores);
  assertFiniteNumbers(expectedScores, "expectedScores");
  assertFiniteNumbers(predictedScores, "predictedScores");
  assertInteger(k, "k");
  if (k <= 0 || expectedScores.length === 0) return 0;

  const limit = Math.min(k, expectedScores.length);
  const expectedTop = new Set(topIndexes(expectedScores, limit));
  const predictedTop = topIndexes(predictedScores, limit);
  const overlap = predictedTop.filter((index) => expectedTop.has(index)).length;

  return overlap / limit;
}

function assertSameLength(left: readonly unknown[], right: readonly unknown[]): void {
  if (left.length !== right.length) {
    throw new RangeError(`Expected arrays with equal length, received ${left.length} and ${right.length}.`);
  }
}

function uniqueLabels<L extends Label>(expected: readonly L[], predicted: readonly L[]): L[] {
  return [...new Set([...expected, ...predicted])];
}

function sumRow<L extends Label>(matrix: ConfusionMatrix<L>, label: L): number {
  return [...(matrix.counts.get(label)?.values() ?? [])].reduce((sum, value) => sum + value, 0);
}

function sumColumn<L extends Label>(matrix: ConfusionMatrix<L>, label: L): number {
  return [...matrix.counts.values()].reduce((sum, row) => sum + (row.get(label) ?? 0), 0);
}

function divide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

function assertFiniteNumbers(values: readonly number[], name: string): void {
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]!;
    if (!Number.isFinite(value)) {
      throw new TypeError(`Expected ${name} to contain only finite numbers, received ${String(value)} at index ${index}.`);
    }
  }
}

function assertInteger(value: number, name: string): void {
  if (!Number.isInteger(value)) {
    throw new TypeError(`Expected ${name} to be an integer, received ${String(value)}.`);
  }
}

function topIndexes(scores: readonly number[], k: number): number[] {
  return scores
    .map((score, index) => ({ score, index }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, k)
    .map((item) => item.index);
}
