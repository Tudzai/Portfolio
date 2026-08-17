import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const repoRoot = path.resolve(import.meta.dirname, "..");
const outputRoot = path.join(repoRoot, "outputs", "model-detail-v140-option-c-20260817");
const manifest = JSON.parse(await fs.readFile(path.join(outputRoot, "manifest.json"), "utf8"));
const reportFlag = process.argv.indexOf("--report");
const reportPath = reportFlag >= 0
  ? path.resolve(process.argv[reportFlag + 1])
  : path.join(outputRoot, "post-export-verification.json");

if (manifest.length !== 24) throw new Error(`Expected 24 Option C detailed workbooks; received ${manifest.length}.`);

const sha256File = async (filePath) => {
  const bytes = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(bytes).digest("hex").toUpperCase();
};

const scanWorkbook = (workbook) => {
  const badValues = [];
  const unsafeFormulas = [];
  const clippedRows = [];
  let formulaCount = 0;
  let populatedCells = 0;
  let textChars = 0;
  let chartCount = 0;
  const sheetStats = {};

  for (const sheet of workbook.worksheets.items) {
    const stats = { formulaCount: 0, populatedCells: 0, textChars: 0, chartCount: sheet.charts?.items?.length || 0 };
    sheetStats[sheet.name] = stats;
    chartCount += stats.chartCount;
    const used = sheet.getUsedRange();
    if (!used) continue;
    const values = used.values || [];
    const formulas = used.formulas || [];
    for (let row = 0; row < values.length; row += 1) {
      const populated = (values[row] || []).some((value) => value !== null && value !== "");
      const width = Math.max(1, values[row]?.length || 1);
      const height = sheet.getRangeByIndexes(row, 0, 1, width).format.rowHeight;
      if (populated && typeof height === "number" && height < 10) {
        clippedRows.push({ sheet: sheet.name, row: row + 1, height });
      }
      for (let column = 0; column < (values[row] || []).length; column += 1) {
        const value = values[row][column];
        const formula = formulas[row]?.[column];
        if (value !== null && value !== "") {
          populatedCells += 1;
          stats.populatedCells += 1;
        }
        if (typeof value === "string") {
          textChars += value.length;
          stats.textChars += value.length;
          if (/^#(?:REF!|DIV\/0!|VALUE!|NAME\?|N\/A|NUM!|NULL!)/i.test(value) || value === "FAIL" || value === "WARN") {
            badValues.push({ sheet: sheet.name, row: row + 1, column: column + 1, value });
          }
          if (/(?:[A-Z]:\\|file:\/\/|OneDrive|connectionString|api[_-]?key|password|secret)/i.test(value)) {
            badValues.push({ sheet: sheet.name, row: row + 1, column: column + 1, value: "private-or-sensitive text" });
          }
        }
        if (typeof formula === "string" && formula.startsWith("=")) {
          formulaCount += 1;
          stats.formulaCount += 1;
          if (/\[[^\]]+\]|INDIRECT\s*\(|OFFSET\s*\(/i.test(formula)) {
            unsafeFormulas.push({ sheet: sheet.name, row: row + 1, column: column + 1, formula });
          }
        }
      }
    }
  }
  return { badValues, unsafeFormulas, clippedRows, formulaCount, populatedCells, textChars, chartCount, sheetStats };
};

const valueChanged = (before, after) => {
  if (typeof before === "number" && typeof after === "number") {
    return Math.abs(before - after) > Math.max(1e-8, Math.abs(before) * 1e-8);
  }
  return before !== after;
};

const results = [];
for (const [index, item] of manifest.entries()) {
  console.log(`[${index + 1}/${manifest.length}] ${item.slug}`);
  const mismatches = [];
  const outputSha256 = await sha256File(item.outputPath);
  if (outputSha256 !== item.sha256) mismatches.push({ kind: "output-hash" });

  const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(item.outputPath));
  const sheetNames = workbook.worksheets.items.map((sheet) => sheet.name);
  const expectedSheets = ["Start", "Inputs", "Model", "Results", "Checks"];
  if (JSON.stringify(sheetNames) !== JSON.stringify(expectedSheets)) {
    mismatches.push({ kind: "sheet-contract", sheetNames });
  }
  if (item.sheetCount !== 5 || item.inputCount < 6 || item.inputCount > 24 || item.checkCount !== 10) {
    mismatches.push({
      kind: "option-c-detail-contract",
      sheetCount: item.sheetCount,
      inputCount: item.inputCount,
      checkCount: item.checkCount,
    });
  }

  const checksStatus = workbook.worksheets.getItem("Checks").getRange("B4").values[0][0];
  if (checksStatus !== "PASS") mismatches.push({ kind: "checks-status", value: checksStatus });
  const checkStatuses = workbook.worksheets.getItem("Checks").getRange("F9:F18").values.flat();
  if (checkStatuses.some((value) => value !== "PASS")) {
    mismatches.push({ kind: "check-rows", values: checkStatuses });
  }

  if (!Array.isArray(item.inputCells) || item.inputCells.length !== item.inputCount) {
    mismatches.push({ kind: "input-address-manifest", inputCells: item.inputCells });
  }
  const inputCells = (item.inputCells || []).map((address) => workbook.worksheets.getItem("Inputs").getRange(address));
  const inputValues = inputCells.map((cell) => cell.values[0][0]);
  const inputFormulas = inputCells.map((cell) => cell.formulas[0][0]);
  if (inputValues.some((value) => typeof value !== "number") || inputFormulas.some(Boolean)) {
    mismatches.push({ kind: "editable-inputs", values: inputValues, formulas: inputFormulas });
  }

  const startValues = workbook.worksheets.getItem("Start").getRange("A1:H31").values.flat().map(String);
  if (!startValues.some((value) => value.includes(item.version))) mismatches.push({ kind: "version" });
  if (!startValues.some((value) => value.includes(item.testedDate))) mismatches.push({ kind: "tested-date" });
  if (!startValues.includes("PASS")) mismatches.push({ kind: "start-status" });

  const scan = scanWorkbook(workbook);
  if (scan.badValues.length) mismatches.push({ kind: "bad-values", values: scan.badValues.slice(0, 10) });
  if (scan.unsafeFormulas.length) mismatches.push({ kind: "unsafe-formulas", formulas: scan.unsafeFormulas.slice(0, 10) });
  if (scan.clippedRows.length) mismatches.push({ kind: "clipped-rows", rows: scan.clippedRows.slice(0, 10) });
  if (scan.formulaCount < 25 || scan.populatedCells > 1600 || scan.textChars > 24000 || scan.chartCount > 1) {
    mismatches.push({
      kind: "complexity-budget",
      formulaCount: scan.formulaCount,
      populatedCells: scan.populatedCells,
      textChars: scan.textChars,
      chartCount: scan.chartCount,
    });
  }

  const modelStats = scan.sheetStats.Model || { formulaCount: 0, populatedCells: 0 };
  const modelFormulas = workbook.worksheets.getItem("Model").getUsedRange()?.formulas.flat()
    .filter((formula) => typeof formula === "string" && formula.startsWith("=")) || [];
  if (
    modelStats.formulaCount < 25
    || modelStats.populatedCells < 30
    || !modelFormulas.some((formula) => /'Inputs'!/.test(formula))
  ) {
    mismatches.push({
      kind: "model-depth",
      formulaCount: modelStats.formulaCount,
      populatedCells: modelStats.populatedCells,
      linksToInputs: modelFormulas.some((formula) => /'Inputs'!/.test(formula)),
    });
  }

  const resultKpiFormulas = workbook.worksheets.getItem("Results").getRange("A6:H8").formulas.flat()
    .filter((formula) => typeof formula === "string" && formula.startsWith("="));
  const directModelLink = /^='Model'!\$?[A-Z]{1,3}\$?\d+$/i;
  if (resultKpiFormulas.length !== 4 || resultKpiFormulas.some((formula) => !directModelLink.test(formula))) {
    mismatches.push({ kind: "results-model-links", formulas: resultKpiFormulas });
  }
  const resultOutcomeFormula = workbook.worksheets.getItem("Results").getRange("G11").formulas[0][0];
  const resultOutcomeValue = workbook.worksheets.getItem("Results").getRange("G11").values[0][0];
  if (!directModelLink.test(resultOutcomeFormula) || resultOutcomeValue === "SEE MODEL DETAIL") {
    mismatches.push({
      kind: "results-outcome-link",
      formula: resultOutcomeFormula,
      value: resultOutcomeValue,
    });
  }

  const kpiRange = workbook.worksheets.getItem("Results").getRange("A6:H8");
  const beforeKpis = kpiRange.values.flat();
  let responsiveInput = false;
  for (let inputIndex = 0; inputIndex < inputValues.length && !responsiveInput; inputIndex += 1) {
    const cell = inputCells[inputIndex];
    const original = inputValues[inputIndex];
    const delta = Math.abs(original) > 1e-9 ? original * 0.01 : 1;
    cell.values = [[original + delta]];
    const afterKpis = kpiRange.values.flat();
    responsiveInput = beforeKpis.some((value, valueIndex) => valueChanged(value, afterKpis[valueIndex]));
    cell.values = [[original]];
  }
  if (!responsiveInput) mismatches.push({ kind: "input-perturbation", message: "No headline KPI changed." });

  const renderManifestPath = path.join(outputRoot, item.slug, "qa-postexport", "render-manifest.json");
  const renders = JSON.parse(await fs.readFile(renderManifestPath, "utf8"));
  const renderedSheets = renders.map((render) => render.sheet);
  if (renders.length !== 5 || JSON.stringify(renderedSheets) !== JSON.stringify(expectedSheets)) {
    mismatches.push({ kind: "render-manifest", renders: renders.map((render) => render.sheet) });
  }
  for (const render of renders) await fs.access(render.path);

  results.push({
    slug: item.slug,
    outputSha256,
    sheets: sheetNames.length,
    inputs: item.inputCount,
    checks: item.checkCount,
    checksStatus,
    formulaCount: scan.formulaCount,
    populatedCells: scan.populatedCells,
    textChars: scan.textChars,
    charts: scan.chartCount,
    modelFormulaCount: modelStats.formulaCount,
    modelPopulatedCells: modelStats.populatedCells,
    resultKpiModelLinks: resultKpiFormulas.length,
    resultOutcomeModelLink: directModelLink.test(resultOutcomeFormula),
    responsiveInput,
    mismatches,
    ok: mismatches.length === 0,
  });
}

await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
const failed = results.filter((item) => !item.ok);
console.log(`Verified ${results.length} Option C detailed workbooks; failures=${failed.length}`);
if (failed.length) {
  console.error(JSON.stringify(failed, null, 2));
  process.exitCode = 1;
}
