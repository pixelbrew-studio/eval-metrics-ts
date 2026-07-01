import { accuracy, confusionMatrix, macroF1, pairwiseRankingAccuracy, precisionRecallF1, topKOverlap } from "../dist/index.js";

const classificationExample = {
  expected: "pass, review, fail, pass",
  predicted: "pass, fail, fail, pass",
};

const rankingExample = {
  expected: "0.95, 0.7, 0.2, 0.5",
  predicted: "0.9, 0.6, 0.3, 0.4",
  k: "2",
};

const classificationExpectedInput = document.querySelector("#classification-expected");
const classificationPredictedInput = document.querySelector("#classification-predicted");
const classificationRunButton = document.querySelector("#classification-run");
const classificationFillButton = document.querySelector("#classification-fill");
const classificationError = document.querySelector("#classification-error");
const classificationStats = document.querySelector("#classification-stats");
const classificationMetricsHead = document.querySelector("#classification-metrics-head");
const classificationMetricsBody = document.querySelector("#classification-metrics-body");

const rankingExpectedInput = document.querySelector("#ranking-expected");
const rankingPredictedInput = document.querySelector("#ranking-predicted");
const rankingKInput = document.querySelector("#ranking-k");
const rankingRunButton = document.querySelector("#ranking-run");
const rankingFillButton = document.querySelector("#ranking-fill");
const rankingError = document.querySelector("#ranking-error");
const rankingStats = document.querySelector("#ranking-stats");

classificationFillButton?.addEventListener("click", () => {
  classificationExpectedInput.value = classificationExample.expected;
  classificationPredictedInput.value = classificationExample.predicted;
  runClassification();
});

classificationRunButton?.addEventListener("click", runClassification);

rankingFillButton?.addEventListener("click", () => {
  rankingExpectedInput.value = rankingExample.expected;
  rankingPredictedInput.value = rankingExample.predicted;
  rankingKInput.value = rankingExample.k;
  runRanking();
});

rankingRunButton?.addEventListener("click", runRanking);

runClassification();
runRanking();

function runClassification() {
  clearError(classificationError);

  try {
    const expected = parseTokens(classificationExpectedInput.value);
    const predicted = parseTokens(classificationPredictedInput.value);

    const byLabel = precisionRecallF1(expected, predicted);
    const matrix = confusionMatrix(expected, predicted);
    const summary = macroF1(expected, predicted);

    renderStats(classificationStats, [
      { label: "Samples", value: String(expected.length) },
      { label: "Accuracy", value: formatNumber(accuracy(expected, predicted)) },
      {
        label: "Macro F1",
        value: formatNumber(summary.macroF1),
        hint: "Per-label F1 scores averaged evenly, so rare labels count as much as common ones.",
      },
      { label: "Labels", value: String(matrix.labels.length) },
    ]);

    classificationMetricsHead.innerHTML = [
      "<tr>",
      "<th>Label</th>",
      "<th>Precision</th>",
      "<th>Recall</th>",
      "<th>F1</th>",
      "<th>Support</th>",
      "</tr>",
    ].join("");

    classificationMetricsBody.innerHTML = matrix.labels
      .map((label) => {
        const metrics = byLabel.get(label);
        return [
          "<tr>",
          `<td>${escapeHtml(String(label))}</td>`,
          `<td>${formatNumber(metrics?.precision ?? 0)}</td>`,
          `<td>${formatNumber(metrics?.recall ?? 0)}</td>`,
          `<td>${formatNumber(metrics?.f1 ?? 0)}</td>`,
          `<td>${metrics?.support ?? 0}</td>`,
          "</tr>",
        ].join("");
      })
      .join("");
  } catch (error) {
    renderStats(classificationStats, []);
    classificationMetricsHead.innerHTML = "";
    classificationMetricsBody.innerHTML = "";
    renderError(classificationError, error);
  }
}

function runRanking() {
  clearError(rankingError);

  try {
    const expected = parseNumbers(rankingExpectedInput.value);
    const predicted = parseNumbers(rankingPredictedInput.value);
    const k = Number.parseInt(rankingKInput.value, 10);

    renderStats(rankingStats, [
      { label: "Samples", value: String(expected.length) },
      { label: "Pairwise", value: formatNumber(pairwiseRankingAccuracy(expected, predicted)) },
      { label: "Top-k", value: formatNumber(topKOverlap(expected, predicted, k)) },
      { label: "k", value: String(k), hint: "Number of top-ranked items compared for top-k overlap." },
    ]);
  } catch (error) {
    renderStats(rankingStats, []);
    renderError(rankingError, error);
  }
}

function parseTokens(input) {
  return input
    .split(/[\n,]/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseNumbers(input) {
  const tokens = parseTokens(input);
  return tokens.map((token, index) => {
    const value = Number(token);
    if (!Number.isFinite(value)) {
      throw new TypeError(`Expected a finite number at position ${index + 1}, received "${token}".`);
    }
    return value;
  });
}

function renderStats(container, stats) {
  container.innerHTML = stats
    .map(
      ({ label, value, hint }) => `
        <div class="border color-border-default rounded-2 p-3 color-bg-subtle"${hint ? ` title="${escapeHtml(hint)}"` : ""}>
          <span class="text-small text-semibold color-fg-muted text-uppercase d-block">${escapeHtml(label)}</span>
          <span class="f3 lh-condensed d-block mt-2">${escapeHtml(value)}</span>
        </div>
      `,
    )
    .join("");
}

function renderError(element, error) {
  element.textContent = error instanceof Error ? error.message : String(error);
}

function clearError(element) {
  element.textContent = "";
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
