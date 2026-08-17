import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { FileBlob, SpreadsheetFile, Workbook } from "@oai/artifact-tool";
import { createCoreSpecs } from "./model-lite-specs/core.mjs";
import { createRiskSpecs } from "./model-lite-specs/risk.mjs";
import { createValuationSpecs } from "./model-lite-specs/valuation.mjs";

const repoRoot = path.resolve(import.meta.dirname, "..");
const publicRoot = path.join(repoRoot, "showcase", "financial-models");
const outputRoot = path.join(repoRoot, "outputs", "model-detail-v140-option-c-20260817");
const registryCode = await fs.readFile(path.join(publicRoot, "model-data.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(registryCode, sandbox, { filename: "model-data.js" });

const requestedSlug = process.argv.includes("--slug")
  ? process.argv[process.argv.indexOf("--slug") + 1]
  : null;
const version = "1.4.0";
const testedDate = "2026-08-17";

const EXECUTIVE_COLORS = {
  dark: "#1C2430",
  dark2: "#303B49",
  accent: "#B5883A",
  accent2: "#D3AE64",
  canvas: "#F5F6F8",
  white: "#FFFFFF",
  ink: "#202833",
  muted: "#68717C",
  line: "#D7DBE0",
  paleAccent: "#F2E8D5",
  paleNeutral: "#ECEFF2",
  green: "#247252",
  paleGreen: "#E6F2EB",
  red: "#B42318",
  paleRed: "#FDECEA",
  amber: "#805C19",
  paleAmber: "#F8EBCF",
  inputBlue: "#0000FF",
  linkGreen: "#008000",
};

// Keep the legacy color names available to every existing specification while
// standardizing all shared surfaces on the approved charcoal-and-gold theme.
const COLORS = {
  ...EXECUTIVE_COLORS,
  charcoal: EXECUTIVE_COLORS.dark,
  charcoalSoft: EXECUTIVE_COLORS.dark2,
  gold: EXECUTIVE_COLORS.accent,
  paleGold: EXECUTIVE_COLORS.paleAccent,
  navy: EXECUTIVE_COLORS.dark,
  blue: EXECUTIVE_COLORS.accent,
  paleBlue: EXECUTIVE_COLORS.paleAccent,
  blueText: EXECUTIVE_COLORS.inputBlue,
};

const FORMATS = {
  amount: "#,##0.0;[Red](#,##0.0);-",
  whole: "#,##0;[Red](#,##0);-",
  percent: "0.0%;[Red](0.0%);-",
  multiple: "0.0x;[Red](0.0x);-",
  perShare: "0.00;[Red](0.00);-",
  decimal: "0.00;[Red](0.00);-",
  status: "General",
};

const sha256File = async (filePath) => {
  const bytes = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(bytes).digest("hex").toUpperCase();
};

const columnName = (index) => {
  let value = index + 1;
  let result = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }
  return result;
};

const setCanvas = (sheet, lastColumn, lastRow) => {
  sheet.showGridLines = false;
  sheet.freezePanes.unfreeze();
  const range = sheet.getRange(`A1:${lastColumn}${lastRow}`);
  range.format = {
    fill: COLORS.canvas,
    font: { color: COLORS.ink, fontSize: 10, typeface: "Aptos" },
    verticalAlignment: "center",
  };
  range.format.rowHeight = 20;
  sheet.getRange(`A1:A${lastRow}`).format.columnWidth = 30;
  for (let column = 1; column < 20; column += 1) {
    const name = columnName(column);
    if (name > lastColumn) break;
    sheet.getRange(`${name}1:${name}${lastRow}`).format.columnWidth = 13;
  }
};

const mergeValue = (sheet, address, value) => {
  const range = sheet.getRange(address);
  range.merge();
  sheet.getRange(address.split(":")[0]).values = [[value]];
  return range;
};

const mergeFormula = (sheet, address, formula) => {
  const range = sheet.getRange(address);
  range.merge();
  sheet.getRange(address.split(":")[0]).formulas = [[formula]];
  return range;
};

const setTitle = (sheet, title, subtitle, lastColumn) => {
  mergeValue(sheet, `A1:${lastColumn}2`, title).format = {
    fill: COLORS.dark,
    font: { bold: true, color: COLORS.white, fontSize: 17, typeface: "Aptos Display" },
    horizontalAlignment: "left",
    verticalAlignment: "center",
  };
  mergeValue(sheet, `A3:${lastColumn}3`, subtitle).format = {
    fill: COLORS.accent,
    font: { bold: true, color: COLORS.white, fontSize: 9, typeface: "Aptos" },
    horizontalAlignment: "left",
    verticalAlignment: "center",
  };
  sheet.getRange("1:2").format.rowHeight = 27;
  sheet.getRange("3:3").format.rowHeight = 20;
};

const setSection = (sheet, row, title, lastColumn) => {
  mergeValue(sheet, `A${row}:${lastColumn}${row}`, title).format = {
    fill: COLORS.dark2,
    font: { bold: true, color: COLORS.white, fontSize: 9, typeface: "Aptos" },
    horizontalAlignment: "left",
    verticalAlignment: "center",
    borders: { bottom: { style: "medium", color: COLORS.accent } },
  };
  sheet.getRange(`${row}:${row}`).format.rowHeight = 20;
};

const setFooter = (sheet, row, lastColumn, text) => {
  mergeValue(sheet, `A${row}:${lastColumn}${row}`, text).format = {
    fill: COLORS.dark,
    font: { bold: true, color: COLORS.white, fontSize: 8, typeface: "Aptos" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
  };
};

const formatStatusRange = (range, fontSize = 12) => {
  range.format = {
    fill: COLORS.white,
    font: { bold: true, color: COLORS.green, fontSize, typeface: "Aptos Display" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    borders: { preset: "outside", style: "thin", color: COLORS.line },
  };
  range.conditionalFormats.add("containsText", {
    text: "FAIL",
    format: { fill: COLORS.paleRed, font: { bold: true, color: COLORS.red } },
  });
  range.conditionalFormats.add("containsText", {
    text: "PASS",
    format: { fill: COLORS.paleGreen, font: { bold: true, color: COLORS.green } },
  });
};

const inputRef = (refs, key) => {
  const address = refs.get(key);
  if (!address) throw new Error(`Unknown input key: ${key}`);
  return `'Inputs'!$${address.column}$${address.row}`;
};

const writeInputs = (sheet, model, spec) => {
  const inputs = spec.inputs.map((input) => ({
    ...input,
    group: input.group || "Core assumptions",
  }));
  const groupCount = inputs.reduce((count, input, index) => (
    index === 0 || input.group !== inputs[index - 1].group ? count + 1 : count
  ), 0);
  const lastRow = Math.max(24, 14 + inputs.length + groupCount * 2);
  setCanvas(sheet, "H", lastRow);
  setTitle(sheet, "INPUTS", `${model.title} · Only blue cells are editable`, "H");
  mergeValue(sheet, "A5:H6", "Change the blue assumptions below. The Model sheet expands them into visible formulas, schedules, and roll-forwards.").format = {
    fill: COLORS.paleAccent,
    font: { bold: true, color: COLORS.ink, fontSize: 10, typeface: "Aptos" },
    wrapText: true,
    borders: { preset: "outside", style: "thin", color: COLORS.line },
  };

  const refs = new Map();
  let row = 8;
  let currentGroup = null;
  for (const input of inputs) {
    if (input.group !== currentGroup) {
      currentGroup = input.group;
      mergeValue(sheet, `A${row}:H${row}`, String(currentGroup).toUpperCase()).format = {
        fill: COLORS.dark2,
        font: { bold: true, color: COLORS.white, fontSize: 8, typeface: "Aptos" },
        borders: { bottom: { style: "medium", color: COLORS.accent } },
      };
      row += 1;
      sheet.getRange(`A${row}:H${row}`).values = [["Input", "Value", "Unit", "Purpose", null, null, null, null]];
      sheet.getRange(`D${row}:H${row}`).merge();
      sheet.getRange(`A${row}:H${row}`).format = {
        fill: COLORS.paleNeutral,
        font: { bold: true, color: COLORS.ink, fontSize: 8, typeface: "Aptos" },
        borders: { preset: "bottom", style: "thin", color: COLORS.line },
      };
      row += 1;
    }
    sheet.getRange(`A${row}`).values = [[input.label]];
    sheet.getRange(`B${row}`).values = [[input.value]];
    sheet.getRange(`B${row}`).format = {
      fill: COLORS.white,
      font: { bold: true, color: COLORS.inputBlue, fontSize: 10, typeface: "Aptos" },
      numberFormat: input.format || FORMATS.amount,
      horizontalAlignment: "right",
      borders: { preset: "outside", style: "thin", color: COLORS.accent2 },
    };
    sheet.getRange(`C${row}`).values = [[input.unit || ""]];
    mergeValue(sheet, `D${row}:H${row}`, input.help || input.note || "").format = {
      fill: COLORS.white,
      font: { color: COLORS.muted, fontSize: 9, typeface: "Aptos" },
      wrapText: true,
      borders: {
        bottom: { style: "thin", color: COLORS.line },
        left: { style: "thin", color: COLORS.line },
      },
    };
    sheet.getRange(`A${row}:C${row}`).format.borders = {
      preset: "bottom",
      style: "thin",
      color: COLORS.line,
    };
    refs.set(input.key, { column: "B", row });
    row += 1;
  }

  const noteRow = row + 1;
  mergeValue(sheet, `A${noteRow}:H${noteRow + 1}`, "Synthetic example. Replace only the blue values, trace the calculation on Model, then review Results and Checks.").format = {
    fill: COLORS.paleAmber,
    font: { color: COLORS.amber, fontSize: 9, typeface: "Aptos" },
    wrapText: true,
    borders: { preset: "outside", style: "thin", color: COLORS.accent2 },
  };
  setFooter(sheet, lastRow, "H", `${model.title} · ${inputs.length} editable assumptions · v${version}`);
  sheet.getRange("A:A").format.columnWidth = 30;
  sheet.getRange("B:B").format.columnWidth = 14;
  sheet.getRange("C:C").format.columnWidth = 20;
  for (const column of ["D", "E", "F", "G", "H"]) {
    sheet.getRange(`${column}:${column}`).format.columnWidth = 15;
  }
  sheet.freezePanes.freezeRows(6);
  return refs;
};

const writeKpis = (sheet, kpis) => {
  if (kpis.length !== 4) throw new Error(`Expected four headline KPIs; received ${kpis.length}.`);
  const cards = [
    ["A5:B5", "A6:B8"],
    ["C5:D5", "C6:D8"],
    ["E5:F5", "E6:F8"],
    ["G5:H5", "G6:H8"],
  ];
  const cells = [];
  kpis.forEach((kpi, index) => {
    const [labelRange, valueRange] = cards[index];
    mergeValue(sheet, labelRange, kpi.label).format = {
      fill: COLORS.dark,
      font: { bold: true, color: COLORS.white, fontSize: 8, typeface: "Aptos" },
      horizontalAlignment: "center",
      borders: { preset: "outside", style: "thin", color: COLORS.dark },
    };
    const valueCell = valueRange.split(":")[0];
    mergeFormula(sheet, valueRange, kpi.formula).format = {
      fill: kpi.fill || COLORS.white,
      font: { bold: true, color: kpi.color || COLORS.accent, fontSize: 16, typeface: "Aptos Display" },
      numberFormat: kpi.format || FORMATS.amount,
      horizontalAlignment: "center",
      verticalAlignment: "center",
      borders: { preset: "outside", style: "thin", color: COLORS.line },
    };
    cells.push(valueCell);
  });
  cells.metadata = kpis.map((kpi, index) => ({ ...kpi, cell: cells[index] }));
  return cells;
};

const writeSummaryResults = (sheet, model, spec, modelKpiCells, modelInfo = {}) => {
  if (!Array.isArray(modelKpiCells?.metadata) || modelKpiCells.metadata.length !== 4) {
    throw new Error(`${model.slug} is missing four KPI definitions for the Results summary.`);
  }

  setCanvas(sheet, "H", 31);
  setTitle(sheet, "RESULTS", `${model.title} · Decision view linked to the detailed Model sheet`, "H");
  const summaryKpiCells = writeKpis(sheet, modelKpiCells.metadata.map((kpi) => ({
    label: kpi.label,
    formula: `='Model'!${kpi.cell}`,
    format: kpi.format,
    fill: kpi.fill,
    color: kpi.color,
  })));

  setSection(sheet, 10, "DECISION VIEW", "H");
  mergeValue(sheet, "A11:B11", "CALCULATION STATUS").format = {
    fill: COLORS.paleNeutral,
    font: { bold: true, color: COLORS.muted, fontSize: 8, typeface: "Aptos" },
    horizontalAlignment: "center",
  };
  const statusRange = mergeFormula(sheet, "C11:D11", "='Checks'!B4");
  formatStatusRange(statusRange, 10);
  mergeValue(sheet, "E11:F11", modelInfo.outcomeLabel || "BUSINESS OUTCOME").format = {
    fill: COLORS.paleNeutral,
    font: { bold: true, color: COLORS.muted, fontSize: 8, typeface: "Aptos" },
    horizontalAlignment: "center",
  };
  const outcomeRange = sheet.getRange("G11:H11");
  outcomeRange.merge();
  if (modelInfo.outcomeFormula) {
    sheet.getRange("G11").formulas = [[modelInfo.outcomeFormula]];
  } else if (modelInfo.outcomeCell) {
    sheet.getRange("G11").formulas = [[`='Model'!${modelInfo.outcomeCell}`]];
  } else {
    sheet.getRange("G11").values = [[modelInfo.businessOutcome || spec.businessOutcome || "SEE MODEL DETAIL"]];
  }
  outcomeRange.format = {
    fill: COLORS.paleAmber,
    font: { bold: true, color: COLORS.amber, fontSize: 9, typeface: "Aptos" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "outside", style: "thin", color: COLORS.line },
  };
  sheet.getRange("11:11").format.rowHeight = 34;

  setSection(sheet, 13, "WHAT IT ANSWERS", "H");
  mergeValue(sheet, "A14:H15", spec.decision || model.decision).format = {
    fill: COLORS.white,
    font: { bold: true, color: COLORS.ink, fontSize: 11, typeface: "Aptos" },
    wrapText: true,
    borders: { preset: "outside", style: "thin", color: COLORS.line },
  };

  setSection(sheet, 17, "MODEL DEPTH", "H");
  const modelFacts = [
    ["Forecast", spec.horizon || model.horizon || "Model-specific horizon"],
    ["Editable inputs", String(spec.inputs.length)],
    ["Calculation detail", "Visible formulas, schedules, roll-forwards, and bridges"],
    ["Workbook flow", "Start → Inputs → Model → Results → Checks"],
  ];
  modelFacts.forEach(([label, description], index) => {
    const row = 18 + index;
    mergeValue(sheet, `A${row}:B${row}`, label).format = {
      fill: COLORS.paleNeutral,
      font: { bold: true, color: COLORS.muted, fontSize: 9, typeface: "Aptos" },
      borders: { preset: "bottom", style: "thin", color: COLORS.line },
    };
    mergeValue(sheet, `C${row}:H${row}`, description).format = {
      fill: COLORS.white,
      font: { bold: true, color: COLORS.ink, fontSize: 9, typeface: "Aptos" },
      borders: { preset: "bottom", style: "thin", color: COLORS.line },
    };
  });

  setSection(sheet, 23, "SCOPE", "H");
  mergeValue(sheet, "A24:H26", `Included: ${spec.included.join(" · ")}`).format = {
    fill: COLORS.white,
    font: { color: COLORS.ink, fontSize: 9, typeface: "Aptos" },
    wrapText: true,
    borders: { preset: "outside", style: "thin", color: COLORS.line },
  };
  mergeValue(sheet, "A27:H28", `Outside this model: ${spec.excluded}`).format = {
    fill: COLORS.paleAmber,
    font: { color: COLORS.amber, fontSize: 9, typeface: "Aptos" },
    wrapText: true,
    borders: { preset: "outside", style: "thin", color: COLORS.accent2 },
  };
  mergeValue(sheet, "A29:H29", "Five visible tabs · No hidden calculations · Calculation status and business outcome are reported separately.").format = {
    fill: COLORS.paleAccent,
    font: { bold: true, color: COLORS.ink, fontSize: 9, typeface: "Aptos" },
    horizontalAlignment: "center",
    borders: { preset: "outside", style: "thin", color: COLORS.line },
  };
  setFooter(sheet, 31, "H", `${model.title} · v${version} · Linked summary only · Trace all formulas on Model`);
  sheet.getRange("A:A").format.columnWidth = 27;
  for (const column of ["B", "C", "D", "E", "F", "G", "H"]) {
    sheet.getRange(`${column}:${column}`).format.columnWidth = 14;
  }
  return summaryKpiCells;
};

const writeTimeSeries = (sheet, config) => {
  const { startRow, periods, rows } = config;
  const lastColumn = columnName(periods.length);
  const notesEnabled = config.notes !== false && periods.length <= 6;
  const noteStartColumn = notesEnabled ? columnName(periods.length + 1) : null;
  const rowByKey = new Map(rows.map((row, index) => [row.key, startRow + 1 + index]));
  const cell = (key, periodIndex) => `${columnName(periodIndex + 1)}${rowByKey.get(key)}`;
  const context = (periodIndex) => ({
    periodIndex,
    input: config.input,
    cell,
    column: columnName(periodIndex + 1),
    previousColumn: periodIndex > 0 ? columnName(periodIndex) : null,
  });

  sheet.getRange(`A${startRow}:${lastColumn}${startRow}`).values = [["Metric", ...periods]];
  sheet.getRange(`A${startRow}:${lastColumn}${startRow}`).format = {
    fill: COLORS.paleNeutral,
    font: { bold: true, color: COLORS.ink, fontSize: 8, typeface: "Aptos" },
    horizontalAlignment: "right",
    borders: { preset: "bottom", style: "thin", color: COLORS.line },
  };
  sheet.getRange(`A${startRow}`).format.horizontalAlignment = "left";
  if (notesEnabled) {
    mergeValue(sheet, `${noteStartColumn}${startRow}:H${startRow}`, "Notes").format = {
      fill: COLORS.paleNeutral,
      font: { bold: true, color: COLORS.muted, fontSize: 8, typeface: "Aptos" },
      borders: {
        bottom: { style: "thin", color: COLORS.line },
        left: { style: "thin", color: COLORS.line },
      },
    };
  }

  rows.forEach((row, rowIndex) => {
    const targetRow = startRow + 1 + rowIndex;
    sheet.getRange(`A${targetRow}`).values = [[row.label]];
    for (let periodIndex = 0; periodIndex < periods.length; periodIndex += 1) {
      const target = cell(row.key, periodIndex);
      const formula = typeof row.formula === "function" ? row.formula(context(periodIndex)) : row.formula;
      const isInputLink = row.crossSheet === true
        || row.crossSheet?.includes?.(periodIndex)
        || String(formula).includes("'Inputs'!");
      sheet.getRange(target).formulas = [[formula]];
      sheet.getRange(target).format = {
        font: {
          bold: Boolean(row.bold),
          color: row.color || (isInputLink ? COLORS.linkGreen : COLORS.ink),
          fontSize: 9,
          typeface: "Aptos",
        },
        numberFormat: row.format || FORMATS.amount,
        horizontalAlignment: "right",
      };
    }
    const fill = row.fill || (row.bold ? COLORS.paleAccent : COLORS.white);
    sheet.getRange(`A${targetRow}:${lastColumn}${targetRow}`).format.fill = fill;
    sheet.getRange(`A${targetRow}:${lastColumn}${targetRow}`).format.borders = {
      preset: "bottom",
      style: "thin",
      color: COLORS.line,
    };
    if (row.bold) sheet.getRange(`A${targetRow}:${lastColumn}${targetRow}`).format.font.bold = true;
    if (notesEnabled) {
      mergeValue(sheet, `${noteStartColumn}${targetRow}:H${targetRow}`, row.note || row.help || "").format = {
        fill,
        font: { color: COLORS.muted, fontSize: 8, typeface: "Aptos" },
        wrapText: true,
        borders: {
          bottom: { style: "thin", color: COLORS.line },
          left: { style: "thin", color: COLORS.line },
        },
      };
    }
  });
  if (notesEnabled) {
    for (let index = periods.length + 1; index <= 7; index += 1) {
      const column = columnName(index);
      sheet.getRange(`${column}:${column}`).format.columnWidth = periods.length === 6 ? 44 : 22;
    }
  }
  return {
    cell,
    rowByKey,
    lastColumn,
    lastRow: startRow + rows.length,
    noteStartColumn,
  };
};

const writeScalarTable = (sheet, config) => {
  const { startRow, rows } = config;
  sheet.getRange(`A${startRow}:H${startRow}`).values = [["Metric", "Value", "Unit", "Notes", null, null, null, null]];
  sheet.getRange(`A${startRow}:H${startRow}`).format = {
    fill: COLORS.paleNeutral,
    font: { bold: true, color: COLORS.ink, fontSize: 8, typeface: "Aptos" },
    borders: { preset: "bottom", style: "thin", color: COLORS.line },
  };
  sheet.getRange(`D${startRow}:H${startRow}`).merge();
  sheet.getRange(`D${startRow}:H${startRow}`).format.borders = {
    bottom: { style: "thin", color: COLORS.line },
    left: { style: "thin", color: COLORS.line },
  };
  const cells = new Map();
  rows.forEach((row, index) => {
    const targetRow = startRow + 1 + index;
    const fill = row.fill || (row.bold ? COLORS.paleAccent : COLORS.white);
    const isInputLink = row.crossSheet === true || String(row.formula).includes("'Inputs'!");
    sheet.getRange(`A${targetRow}`).values = [[row.label]];
    sheet.getRange(`B${targetRow}`).formulas = [[row.formula]];
    sheet.getRange(`B${targetRow}`).format = {
      fill,
      font: {
        bold: Boolean(row.bold),
        color: row.color || (isInputLink ? COLORS.linkGreen : COLORS.ink),
        fontSize: 9,
        typeface: "Aptos",
      },
      numberFormat: row.format || FORMATS.amount,
      horizontalAlignment: "right",
    };
    sheet.getRange(`C${targetRow}`).values = [[row.unit || ""]];
    mergeValue(sheet, `D${targetRow}:H${targetRow}`, row.help || row.note || "").format = {
      fill,
      font: { color: COLORS.muted, fontSize: 9, typeface: "Aptos" },
      wrapText: true,
      borders: {
        bottom: { style: "thin", color: COLORS.line },
        left: { style: "thin", color: COLORS.line },
      },
    };
    sheet.getRange(`A${targetRow}:C${targetRow}`).format.fill = fill;
    sheet.getRange(`A${targetRow}:C${targetRow}`).format.borders = {
      preset: "bottom",
      style: "thin",
      color: COLORS.line,
    };
    if (row.bold) sheet.getRange(`A${targetRow}:C${targetRow}`).format.font.bold = true;
    cells.set(row.key, `B${targetRow}`);
  });
  sheet.getRange("A:A").format.columnWidth = 31;
  sheet.getRange("B:B").format.columnWidth = 14;
  sheet.getRange("C:C").format.columnWidth = 20;
  for (const column of ["D", "E", "F", "G", "H"]) {
    sheet.getRange(`${column}:${column}`).format.columnWidth = 15;
  }
  return { cell: (key) => cells.get(key), lastRow: startRow + rows.length };
};

const writeChecks = (sheet, model, spec, kpiCells, checks, options = {}) => {
  const refs = options.refs instanceof Map ? options.refs : null;
  const inputCells = spec.inputs.map((input, index) => {
    const ref = refs?.get(input.key);
    return ref ? `'Inputs'!${ref.column}${ref.row}` : `'Inputs'!B${7 + index}`;
  });
  const percentageCells = spec.inputs
    .map((input, index) => ({ input, cell: inputCells[index] }))
    .filter(({ input }) => input.format === FORMATS.percent || String(input.unit || "").includes("%"))
    .map(({ cell }) => cell);
  const resultCells = kpiCells.map((cell) => `'Results'!${cell}`);
  const rawModelKpiCells = options.modelKpiCells || [];
  const modelCells = rawModelKpiCells.length === 4
    ? rawModelKpiCells.map((cell) => `'Model'!${cell}`)
    : resultCells;
  const formulaList = (name, cells) => `=${name}(${cells.join(",")})`;
  const percentRangeFormula = percentageCells.length
    ? `=IFERROR(IF(AND(${percentageCells.flatMap((cell) => [`${cell}>=-1`, `${cell}<=1`]).join(",")}),1,0),0)`
    : "=1";
  const resultLinkFormula = `=IFERROR(SUM(${resultCells.map((cell, index) => `ABS(${cell}-${modelCells[index]})`).join(",")}),1E+99)`;
  const sharedControls = [
    {
      label: "All editable inputs are numeric",
      actual: formulaList("COUNT", inputCells),
      expected: `=${spec.inputs.length}`,
      tolerance: 0,
      fix: "Complete the blue cells on Inputs",
      format: FORMATS.whole,
    },
    {
      label: "Percentage assumptions stay within ±100%",
      actual: percentRangeFormula,
      expected: "=1",
      tolerance: 0,
      fix: "Review percentage assumptions on Inputs",
      format: FORMATS.whole,
    },
    {
      label: "Four Model headline KPIs are numeric",
      actual: formulaList("COUNT", modelCells),
      expected: "=4",
      tolerance: 0,
      fix: "Trace the headline KPI formulas on Model",
      format: FORMATS.whole,
    },
    {
      label: "Four Results headline KPIs are numeric",
      actual: formulaList("COUNT", resultCells),
      expected: "=4",
      tolerance: 0,
      fix: "Review the linked KPI cards on Results",
      format: FORMATS.whole,
    },
    {
      label: "Results headline KPIs reconcile to Model",
      actual: resultLinkFormula,
      expected: "=0",
      tolerance: 0.0001,
      fix: "Review Results-to-Model links",
      format: FORMATS.decimal,
    },
  ];
  const paddingControls = [
    {
      label: "All required input cells are populated",
      actual: formulaList("COUNTA", inputCells),
      expected: `=${spec.inputs.length}`,
      tolerance: 0,
      fix: "Complete any blank blue input cell",
      format: FORMATS.whole,
    },
    {
      label: "All Model headline KPI cells are populated",
      actual: formulaList("COUNTA", modelCells),
      expected: "=4",
      tolerance: 0,
      fix: "Review Model headline KPI cells",
      format: FORMATS.whole,
    },
    {
      label: "All Results headline KPI cells are populated",
      actual: formulaList("COUNTA", resultCells),
      expected: "=4",
      tolerance: 0,
      fix: "Review Results headline KPI cells",
      format: FORMATS.whole,
    },
    {
      label: "Input values match the model definition count",
      actual: formulaList("COUNT", inputCells),
      expected: `=${spec.inputs.length}`,
      tolerance: 0,
      fix: "Review the Inputs specification",
      format: FORMATS.whole,
    },
    {
      label: "Headline KPI links are finite and calculable",
      actual: resultLinkFormula,
      expected: "=0",
      tolerance: 0.0001,
      fix: "Trace any error from Results back to Model",
      format: FORMATS.decimal,
    },
  ];
  const domainControls = Array.isArray(checks) ? checks.slice(0, 10) : [];
  const genericControls = [
    sharedControls[0],
    sharedControls[4],
    sharedControls[1],
    sharedControls[2],
    sharedControls[3],
    ...paddingControls,
  ];
  const genericSlots = Math.max(0, 10 - domainControls.length);
  const allChecks = [...genericControls.slice(0, genericSlots), ...domainControls].slice(0, 10);
  const lastRow = 20;
  setCanvas(sheet, "H", lastRow);
  sheet.getRange(`A1:A${lastRow}`).format.columnWidth = 38;
  setTitle(sheet, "CHECKS", `${model.title} · Calculation controls only; business outcomes are shown separately`, "H");
  sheet.getRange("B4:H4").merge();
  sheet.getRange("B4").formulas = [[`=IF(COUNTIF(F9:F18,"PASS")=10,"PASS","FAIL")`]];
  sheet.getRange("B4:H4").format.rowHeight = 12;
  sheet.getRange("B4:H4").format.font = { color: COLORS.canvas, fontSize: 1, typeface: "Aptos" };
  mergeValue(sheet, "A5:B5", "MODEL STATUS").format = {
    fill: COLORS.dark,
    font: { bold: true, color: COLORS.white, fontSize: 8, typeface: "Aptos" },
    horizontalAlignment: "center",
  };
  const visibleStatus = mergeFormula(sheet, "C5:H5", "=B4");
  formatStatusRange(visibleStatus, 13);

  setSection(sheet, 7, `${allChecks.length} CALCULATION CONTROLS`, "H");
  sheet.getRange("A8:H8").values = [["Control", "Actual", "Expected", "Difference", "Tolerance", "Status", "Where to fix", null]];
  sheet.getRange("G8:H8").merge();
  sheet.getRange("A8:H8").format = {
    fill: COLORS.paleNeutral,
    font: { bold: true, color: COLORS.ink, fontSize: 8, typeface: "Aptos" },
    borders: { preset: "bottom", style: "thin", color: COLORS.line },
  };

  allChecks.forEach((check, index) => {
    const row = 9 + index;
    const tolerance = check.tolerance ?? 0.0001;
    const rawActualFormula = String(check.actual || "=0");
    const displayedActualFormula = rawActualFormula.startsWith("=")
      ? `=ROUND(${rawActualFormula.slice(1)},6)`
      : `=ROUND(${rawActualFormula},6)`;
    const toleranceFormula = typeof tolerance === "number"
      ? `=${tolerance}`
      : String(tolerance).startsWith("=") ? String(tolerance) : `=${tolerance}`;
    sheet.getRange(`A${row}`).values = [[check.label]];
    // Normalize floating-point dust in the visible Actual column so a passing
    // tie-out never renders as a red "(0.0)" warning.
    sheet.getRange(`B${row}`).formulas = [[displayedActualFormula]];
    sheet.getRange(`C${row}`).formulas = [[check.expected]];
    sheet.getRange(`D${row}`).formulas = [[check.difference || `=ROUND(B${row}-C${row},6)`]];
    sheet.getRange(`E${row}`).formulas = [[toleranceFormula]];
    sheet.getRange(`F${row}`).formulas = [[check.status || `=IF(ABS(ROUND(D${row},6))<=E${row},"PASS","FAIL")`]];
    mergeValue(sheet, `G${row}:H${row}`, check.fix || "Review Model calculation");
    sheet.getRange(`B${row}:E${row}`).format.numberFormat = check.format || FORMATS.decimal;
    sheet.getRange(`A${row}:H${row}`).format = {
      fill: COLORS.white,
      font: { color: COLORS.ink, fontSize: 9, typeface: "Aptos" },
      wrapText: true,
      verticalAlignment: "center",
      borders: { preset: "bottom", style: "thin", color: COLORS.line },
    };
    sheet.getRange(`${row}:${row}`).format.rowHeight = 26;
    sheet.getRange(`F${row}`).format.font = { bold: true, color: COLORS.green, fontSize: 9, typeface: "Aptos" };
    sheet.getRange(`F${row}`).conditionalFormats.add("containsText", {
      text: "FAIL",
      format: { fill: COLORS.paleRed, font: { bold: true, color: COLORS.red } },
    });
    sheet.getRange(`F${row}`).conditionalFormats.add("containsText", {
      text: "PASS",
      format: { fill: COLORS.paleGreen, font: { bold: true, color: COLORS.green } },
    });
  });
  mergeValue(sheet, "A19:H19", "A warning business outcome can still pass these controls; review Model and Results before making a decision.").format = {
    fill: COLORS.paleAmber,
    font: { color: COLORS.amber, fontSize: 8, typeface: "Aptos" },
    horizontalAlignment: "center",
    borders: { preset: "outside", style: "thin", color: COLORS.line },
  };
  setFooter(sheet, lastRow, "H", `${model.title} · ${allChecks.length} / ${allChecks.length} controls should show PASS · v${version}`);
  sheet.getRange("A:A").format.columnWidth = 42;
  for (const column of ["B", "C", "D", "E", "F"]) {
    sheet.getRange(`${column}:${column}`).format.columnWidth = 13;
  }
  sheet.getRange("G:G").format.columnWidth = 23;
  sheet.getRange("H:H").format.columnWidth = 16;
  sheet.freezePanes.freezeRows(8);
  return allChecks.length;
};

const writeStart = (sheet, model, spec) => {
  const setupTime = spec.setup || (spec.inputs.length >= 20
    ? "20–30 minutes"
    : spec.inputs.length >= 10 ? "15–20 minutes" : "10–15 minutes");
  setCanvas(sheet, "H", 31);
  setTitle(sheet, "TDAT FINANCIAL MODEL", `${model.id} · ${spec.horizon || model.horizon || "Model-specific horizon"} · v${version} · Five visible tabs`, "H");
  mergeValue(sheet, "A5:F7", model.title).format = {
    fill: COLORS.paleAccent,
    font: { bold: true, color: COLORS.ink, fontSize: 18, typeface: "Aptos Display" },
    horizontalAlignment: "left",
    verticalAlignment: "center",
    borders: { preset: "outside", style: "thin", color: COLORS.line },
  };
  mergeValue(sheet, "G5:H5", "MODEL STATUS").format = {
    fill: COLORS.dark,
    font: { bold: true, color: COLORS.white, fontSize: 8, typeface: "Aptos" },
    horizontalAlignment: "center",
  };
  const statusRange = mergeFormula(sheet, "G6:H7", "='Checks'!B4");
  formatStatusRange(statusRange, 14);

  setSection(sheet, 9, "WHAT THIS MODEL IS FOR", "H");
  mergeValue(sheet, "A10:H11", spec.decision || model.decision).format = {
    fill: COLORS.white,
    font: { bold: true, color: COLORS.ink, fontSize: 11, typeface: "Aptos" },
    wrapText: true,
    borders: { preset: "outside", style: "thin", color: COLORS.line },
  };

  setSection(sheet, 13, "USE IT IN FOUR STEPS", "H");
  const steps = [
    ["1 · INPUTS", "Edit only blue cells"],
    ["2 · MODEL", "Trace schedules and formulas"],
    ["3 · RESULTS", "Read the linked decision view"],
    ["4 · CHECKS", "Resolve every FAIL"],
  ];
  steps.forEach(([label, text], index) => {
    const left = columnName(index * 2);
    const right = columnName(index * 2 + 1);
    mergeValue(sheet, `${left}14:${right}14`, label).format = {
      fill: COLORS.paleAccent,
      font: { bold: true, color: COLORS.accent, fontSize: 9, typeface: "Aptos" },
      horizontalAlignment: "center",
      borders: { preset: "outside", style: "thin", color: COLORS.line },
    };
    mergeValue(sheet, `${left}15:${right}16`, text).format = {
      fill: COLORS.white,
      font: { color: COLORS.ink, fontSize: 10, typeface: "Aptos" },
      horizontalAlignment: "center",
      verticalAlignment: "center",
      wrapText: true,
      borders: { preset: "outside", style: "thin", color: COLORS.line },
    };
  });

  setSection(sheet, 18, "DEPTH WITHOUT EXTRA TABS", "H");
  const modelFacts = [
    ["Forecast", spec.horizon || model.horizon || "Model-specific horizon"],
    ["Editable inputs", String(spec.inputs.length)],
    ["Visible sheets", "5"],
    ["Setup", setupTime],
  ];
  modelFacts.forEach(([label, value], index) => {
    const row = 19 + index;
    mergeValue(sheet, `A${row}:B${row}`, label).format = {
      fill: COLORS.paleNeutral,
      font: { bold: true, color: COLORS.muted, fontSize: 9, typeface: "Aptos" },
      borders: { preset: "bottom", style: "thin", color: COLORS.line },
    };
    mergeValue(sheet, `C${row}:H${row}`, value).format = {
      fill: COLORS.white,
      font: { bold: true, color: COLORS.ink, fontSize: 9, typeface: "Aptos" },
      borders: { preset: "bottom", style: "thin", color: COLORS.line },
    };
  });

  setSection(sheet, 24, "FIT & SCOPE", "H");
  mergeValue(sheet, "A25:H26", `Included: ${spec.included.join(" · ")}`).format = {
    fill: COLORS.white,
    font: { color: COLORS.ink, fontSize: 10, typeface: "Aptos" },
    wrapText: true,
    borders: { preset: "outside", style: "thin", color: COLORS.line },
  };
  mergeValue(sheet, "A27:H28", `Scope boundary: ${spec.excluded}`).format = {
    fill: COLORS.paleAmber,
    font: { color: COLORS.amber, fontSize: 10, typeface: "Aptos" },
    wrapText: true,
    borders: { preset: "outside", style: "thin", color: COLORS.line },
  };
  mergeValue(sheet, "A29:H29", `Synthetic demonstration only · Tested ${testedDate} · Excel 365 · Macro-free · No external links`).format = {
    fill: COLORS.white,
    font: { bold: true, color: COLORS.muted, fontSize: 8, typeface: "Aptos" },
    horizontalAlignment: "center",
  };
  setFooter(sheet, 31, "H", `${model.title} · Start → Inputs → Model → Results → Checks`);
  sheet.getRange("A:A").format.columnWidth = 22;
  for (const column of ["B", "C", "D", "E", "F", "G", "H"]) {
    sheet.getRange(`${column}:${column}`).format.columnWidth = 14;
  }
};

const dcfSpec = {
  slug: "dcf-valuation",
  styleVariant: "option-c",
  checkLimit: 10,
  decision: "What are the business and equity worth under one driver-based operating case?",
  horizon: "5 years",
  tags: ["DCF", "Free Cash Flow", "Enterprise Value"],
  included: ["Five-year driver-based free-cash-flow build", "Terminal-value and enterprise-to-equity bridges", "Value per share and ten calculation controls"],
  excluded: "Detailed tax schedules, leases, pensions, dilution, reverse DCF, and valuation advice.",
  inputs: [
    { key: "startingRevenue", group: "OPERATING CASE", label: "Starting revenue", value: 500, unit: "LCY m", format: FORMATS.amount, help: "Latest annual revenue" },
    { key: "revenueGrowth", group: "OPERATING CASE", label: "Annual revenue growth", value: 0.07, unit: "%", format: FORMATS.percent, help: "One growth rate for five years" },
    { key: "ebitdaMargin", group: "OPERATING CASE", label: "EBITDA margin", value: 0.22, unit: "%", format: FORMATS.percent, help: "Operating margin before D&A" },
    { key: "taxRate", group: "OPERATING CASE", label: "Cash tax rate", value: 0.2, unit: "%", format: FORMATS.percent, help: "Cash tax applied to positive EBIT" },
    { key: "depreciationRate", group: "REINVESTMENT", label: "D&A / revenue", value: 0.03, unit: "%", format: FORMATS.percent, help: "Non-cash depreciation rate" },
    { key: "capexRate", group: "REINVESTMENT", label: "Capex / revenue", value: 0.05, unit: "%", format: FORMATS.percent, help: "Annual reinvestment rate" },
    { key: "nwcRate", group: "REINVESTMENT", label: "NWC / revenue", value: 0.1, unit: "%", format: FORMATS.percent, help: "Working-capital investment on revenue growth" },
    { key: "wacc", group: "VALUATION", label: "Discount rate (WACC)", value: 0.105, unit: "%", format: FORMATS.percent, help: "Required return" },
    { key: "terminalGrowth", group: "VALUATION", label: "Terminal growth", value: 0.025, unit: "%", format: FORMATS.percent, help: "Long-run growth after year five" },
    { key: "netDebt", group: "VALUATION", label: "Net debt", value: 125, unit: "LCY m", format: FORMATS.amount, help: "Debt less cash" },
    { key: "shares", group: "VALUATION", label: "Shares outstanding", value: 75, unit: "m", format: FORMATS.amount, help: "Diluted shares" },
  ],
  buildResults(sheet, model, refs) {
    setCanvas(sheet, "H", 38);
    setTitle(sheet, "MODEL DETAIL", `${model.title} · Five-year driver-based valuation`, "H");
    setSection(sheet, 10, "FIVE-YEAR FREE CASH FLOW BUILD", "H");
    const input = (key) => inputRef(refs, key);
    const series = writeTimeSeries(sheet, {
      startRow: 11,
      periods: ["Y1", "Y2", "Y3", "Y4", "Y5"],
      input,
      rows: [
        {
          key: "revenue",
          label: "Revenue",
          format: FORMATS.amount,
          formula: ({ periodIndex, cell }) => periodIndex === 0
            ? `=${input("startingRevenue")}*(1+${input("revenueGrowth")})`
            : `=${cell("revenue", periodIndex - 1)}*(1+${input("revenueGrowth")})`,
        },
        {
          key: "ebitda",
          label: "EBITDA",
          format: FORMATS.amount,
          bold: true,
          fill: COLORS.paleBlue,
          formula: ({ periodIndex, cell }) => `=${cell("revenue", periodIndex)}*${input("ebitdaMargin")}`,
        },
        {
          key: "depreciation",
          label: "D&A",
          format: FORMATS.amount,
          formula: ({ periodIndex, cell }) => `=-${cell("revenue", periodIndex)}*${input("depreciationRate")}`,
        },
        {
          key: "ebit",
          label: "EBIT",
          format: FORMATS.amount,
          bold: true,
          formula: ({ periodIndex, cell }) => `=SUM(${cell("ebitda", periodIndex)},${cell("depreciation", periodIndex)})`,
        },
        {
          key: "cashTax",
          label: "Cash tax",
          format: FORMATS.amount,
          formula: ({ periodIndex, cell }) => `=-MAX(0,${cell("ebit", periodIndex)}*${input("taxRate")})`,
        },
        {
          key: "nopat",
          label: "NOPAT",
          format: FORMATS.amount,
          bold: true,
          formula: ({ periodIndex, cell }) => `=SUM(${cell("ebit", periodIndex)},${cell("cashTax", periodIndex)})`,
        },
        {
          key: "daAddBack",
          label: "D&A add-back",
          format: FORMATS.amount,
          formula: ({ periodIndex, cell }) => `=-${cell("depreciation", periodIndex)}`,
        },
        {
          key: "capex",
          label: "Capex",
          format: FORMATS.amount,
          formula: ({ periodIndex, cell }) => `=-${cell("revenue", periodIndex)}*${input("capexRate")}`,
        },
        {
          key: "changeNwc",
          label: "Change in NWC",
          format: FORMATS.amount,
          formula: ({ periodIndex, cell }) => periodIndex === 0
            ? `=-(${cell("revenue", periodIndex)}-${input("startingRevenue")})*${input("nwcRate")}`
            : `=-(${cell("revenue", periodIndex)}-${cell("revenue", periodIndex - 1)})*${input("nwcRate")}`,
        },
        {
          key: "fcf",
          label: "Free cash flow",
          format: FORMATS.amount,
          fill: COLORS.paleGreen,
          bold: true,
          formula: ({ periodIndex, cell }) => `=SUM(${cell("nopat", periodIndex)},${cell("daAddBack", periodIndex)},${cell("capex", periodIndex)},${cell("changeNwc", periodIndex)})`,
        },
        {
          key: "discount",
          label: "Discount factor",
          format: FORMATS.decimal,
          formula: ({ periodIndex }) => `=1/(1+${input("wacc")})^${periodIndex + 1}`,
        },
        {
          key: "pvFcf",
          label: "Present value of FCF",
          format: FORMATS.amount,
          bold: true,
          formula: ({ periodIndex, cell }) => `=${cell("fcf", periodIndex)}*${cell("discount", periodIndex)}`,
        },
      ],
    });
    setSection(sheet, 25, "VALUATION BRIDGE", "H");
    const bridge = writeScalarTable(sheet, {
      startRow: 26,
      rows: [
        { key: "terminalFcf", label: "Terminal-year FCF", formula: `=${series.cell("fcf", 4)}*(1+${input("terminalGrowth")})`, unit: "LCY m", help: "Year five FCF grown once", format: FORMATS.amount },
        { key: "terminalValue", label: "Terminal value", formula: `=IF(OR(${input("wacc")}<=${input("terminalGrowth")},${input("wacc")}<=-1),0,B27/(${input("wacc")}-${input("terminalGrowth")}))`, unit: "LCY m", help: "Gordon growth method", format: FORMATS.amount },
        { key: "pvTerminal", label: "PV of terminal value", formula: `=B28*${series.cell("discount", 4)}`, unit: "LCY m", help: "Terminal value discounted to today", format: FORMATS.amount },
        { key: "enterpriseValue", label: "Enterprise value", formula: `=SUM(${series.cell("pvFcf", 0)}:${series.cell("pvFcf", 4)})+B29`, unit: "LCY m", help: "PV of forecast FCF plus terminal value", format: FORMATS.amount, bold: true, fill: COLORS.paleBlue },
        { key: "equityValue", label: "Equity value", formula: `=B30-${input("netDebt")}`, unit: "LCY m", help: "Enterprise value less net debt", format: FORMATS.amount, bold: true },
        { key: "valuePerShare", label: "Value per share", formula: `=IF(${input("shares")}<=0,0,B31/${input("shares")})`, unit: "LCY", help: "Equity value divided by shares", format: FORMATS.perShare, bold: true },
      ],
    });
    const kpiCells = writeKpis(sheet, [
      { label: "ENTERPRISE VALUE", formula: `=${bridge.cell("enterpriseValue")}`, format: FORMATS.amount },
      { label: "EQUITY VALUE", formula: `=${bridge.cell("equityValue")}`, format: FORMATS.amount },
      { label: "VALUE / SHARE", formula: `=${bridge.cell("valuePerShare")}`, format: FORMATS.perShare },
      { label: "YEAR 5 FCF", formula: `=${series.cell("fcf", 4)}`, format: FORMATS.amount },
    ]);
    mergeFormula(sheet, "A34:H36", `=IF(${bridge.cell("equityValue")}>=0,"POSITIVE EQUITY VALUE · Review terminal-value share","NEGATIVE EQUITY VALUE · Review assumptions and net debt")`).format = {
      fill: COLORS.paleAmber,
      font: { color: COLORS.amber, fontSize: 9, typeface: "Aptos" },
      wrapText: true,
      borders: { preset: "outside", style: "thin", color: "#F2D58A" },
    };
    setFooter(sheet, 38, "H", `${model.title} · v${version}`);
    return {
      kpiCells,
      outcomeCell: "A34",
      outcomeLabel: "VALUATION OUTCOME",
      checks: [
        { label: "Valuation inputs are valid", actual: `=IF(AND(${input("startingRevenue")}>=0,${input("revenueGrowth")}>-1,${input("revenueGrowth")}<=1,${input("ebitdaMargin")}>=0,${input("ebitdaMargin")}<=1,${input("depreciationRate")}>=0,${input("depreciationRate")}<=1,${input("capexRate")}>=0,${input("capexRate")}<=1,${input("nwcRate")}>=0,${input("nwcRate")}<=1,${input("taxRate")}>=0,${input("taxRate")}<=1,${input("wacc")}>${input("terminalGrowth")},${input("wacc")}>-1,${input("shares")}>0),1,0)`, expected: "=1", fix: "Inputs: operating and valuation drivers" },
        { label: "Revenue roll-forward ties", actual: `=MAX(${Array.from({ length: 5 }, (_, index) => index === 0 ? `ABS('Model'!${series.cell("revenue", 0)}-${input("startingRevenue")}*(1+${input("revenueGrowth")}))` : `ABS('Model'!${series.cell("revenue", index)}-'Model'!${series.cell("revenue", index - 1)}*(1+${input("revenueGrowth")}))`).join(",")})`, expected: "=0", fix: "Model: revenue forecast", format: FORMATS.amount },
        { label: "Operating profit bridge ties", actual: `=MAX(${Array.from({ length: 5 }, (_, index) => `ABS('Model'!${series.cell("ebitda", index)}-'Model'!${series.cell("revenue", index)}*${input("ebitdaMargin")})+ABS('Model'!${series.cell("ebit", index)}-SUM('Model'!${series.cell("ebitda", index)},'Model'!${series.cell("depreciation", index)}))`).join(",")})`, expected: "=0", fix: "Model: EBITDA and EBIT", format: FORMATS.amount },
        { label: "Tax and NOPAT bridge ties", actual: `=MAX(${Array.from({ length: 5 }, (_, index) => `ABS('Model'!${series.cell("cashTax", index)}+MAX(0,'Model'!${series.cell("ebit", index)}*${input("taxRate")}))+ABS('Model'!${series.cell("nopat", index)}-SUM('Model'!${series.cell("ebit", index)},'Model'!${series.cell("cashTax", index)}))`).join(",")})`, expected: "=0", fix: "Model: tax and NOPAT", format: FORMATS.amount },
        { label: "Free-cash-flow build ties", actual: `=MAX(${Array.from({ length: 5 }, (_, index) => `ABS('Model'!${series.cell("fcf", index)}-SUM('Model'!${series.cell("nopat", index)},'Model'!${series.cell("daAddBack", index)},'Model'!${series.cell("capex", index)},'Model'!${series.cell("changeNwc", index)}))`).join(",")})`, expected: "=0", fix: "Model: free-cash-flow build", format: FORMATS.amount },
        { label: "Discount factors and PVs tie", actual: `=MAX(${Array.from({ length: 5 }, (_, index) => `ABS('Model'!${series.cell("discount", index)}-1/(1+${input("wacc")})^${index + 1})+ABS('Model'!${series.cell("pvFcf", index)}-'Model'!${series.cell("fcf", index)}*'Model'!${series.cell("discount", index)})`).join(",")})`, expected: "=0", fix: "Model: discount factors and PV", format: FORMATS.amount },
        { label: "Terminal-value bridge ties", actual: `=ABS('Model'!${bridge.cell("terminalValue")}-'Model'!${bridge.cell("terminalFcf")}/(${input("wacc")}-${input("terminalGrowth")}))+ABS('Model'!${bridge.cell("pvTerminal")}-'Model'!${bridge.cell("terminalValue")}*'Model'!${series.cell("discount", 4)})`, expected: "=0", fix: "Model: terminal value", format: FORMATS.amount },
        { label: "Enterprise, equity, and per-share bridges tie", actual: `=ABS('Model'!${bridge.cell("enterpriseValue")}-(SUM('Model'!${series.cell("pvFcf", 0)}:'Model'!${series.cell("pvFcf", 4)})+'Model'!${bridge.cell("pvTerminal")}))+ABS('Model'!${bridge.cell("equityValue")}-('Model'!${bridge.cell("enterpriseValue")}-${input("netDebt")}))+ABS('Model'!${bridge.cell("valuePerShare")}-'Model'!${bridge.cell("equityValue")}/${input("shares")})`, expected: "=0", fix: "Model: valuation bridges", format: FORMATS.amount },
      ],
    };
  },
};

const specApi = {
  COLORS,
  FORMATS,
  formatStatusRange,
  inputRef,
  mergeFormula,
  mergeValue,
  setCanvas,
  setFooter,
  setSection,
  setTitle,
  writeKpis,
  writeScalarTable,
  writeTimeSeries,
  version,
  testedDate,
};
const allSpecs = [
  dcfSpec,
  ...createCoreSpecs(specApi),
  ...createValuationSpecs(specApi),
  ...createRiskSpecs(specApi),
];
const specs = new Map(allSpecs.map((spec) => [spec.slug, spec]));
if (specs.size !== allSpecs.length) throw new Error("Duplicate financial-model slug.");
const registryModels = sandbox.window.TDAT_MODEL_LIBRARY;
const registrySlugs = new Set(registryModels.map((model) => model.slug));
const missingSpecs = [...registrySlugs].filter((slug) => !specs.has(slug));
const unexpectedSpecs = [...specs.keys()].filter((slug) => !registrySlugs.has(slug));
if (registryModels.length !== 24 || specs.size !== 24 || missingSpecs.length || unexpectedSpecs.length) {
  throw new Error(`Financial-model specification coverage mismatch. registry=${registryModels.length}; specs=${specs.size}; missing=${missingSpecs.join(",") || "none"}; unexpected=${unexpectedSpecs.join(",") || "none"}.`);
}
const models = registryModels.filter((model) => {
  if (!specs.has(model.slug)) return false;
  return !requestedSlug || model.slug === requestedSlug;
});

if (requestedSlug && models.length !== 1) {
  throw new Error(`No financial-model specification found for ${requestedSlug}.`);
}

await fs.mkdir(outputRoot, { recursive: true });
const manifest = [];
for (const [index, model] of models.entries()) {
  const spec = specs.get(model.slug);
  console.log(`[${index + 1}/${models.length}] ${model.slug}`);
  const workbook = Workbook.create();
  const start = workbook.worksheets.add("Start");
  const inputs = workbook.worksheets.add("Inputs");
  const modelDetail = workbook.worksheets.add("Model");
  const results = workbook.worksheets.add("Results");
  const checks = workbook.worksheets.add("Checks");

  const refs = writeInputs(inputs, model, spec);
  const modelInfo = spec.buildResults(modelDetail, model, refs);
  modelDetail.getRange("A1").values = [["MODEL DETAIL"]];
  modelDetail.freezePanes.freezeRows(10);
  modelDetail.freezePanes.freezeColumns(1);
  const resultKpiCells = writeSummaryResults(results, model, spec, modelInfo.kpiCells, modelInfo);
  const checkCount = writeChecks(checks, model, spec, resultKpiCells, modelInfo.checks, {
    refs,
    modelKpiCells: modelInfo.kpiCells,
  });
  writeStart(start, model, spec);

  const modelDir = path.join(outputRoot, model.slug);
  if (path.dirname(path.resolve(modelDir)) !== path.resolve(outputRoot)) {
    throw new Error(`Unsafe financial-model output directory for ${model.slug}.`);
  }
  await fs.rm(modelDir, { recursive: true, force: true });
  const qaDir = path.join(modelDir, "qa-postexport");
  await fs.mkdir(qaDir, { recursive: true });
  const fileName = path.posix.basename(model.file.path);
  const outputPath = path.join(modelDir, fileName);
  const exported = await SpreadsheetFile.exportXlsx(workbook);
  await exported.save(outputPath);

  const reopened = await SpreadsheetFile.importXlsx(await FileBlob.load(outputPath));
  const status = reopened.worksheets.getItem("Checks").getRange("B4").values[0][0];
  if (status !== "PASS") throw new Error(`${model.slug} reopened with status ${status}.`);
  const renderManifest = [];
  for (const sheet of reopened.worksheets.items) {
    const render = await reopened.render({ sheetName: sheet.name, autoCrop: "all", scale: 1.5, format: "png" });
    const renderPath = path.join(qaDir, `${String(renderManifest.length + 1).padStart(2, "0")}-${sheet.name.toLowerCase()}.png`);
    await fs.writeFile(renderPath, new Uint8Array(await render.arrayBuffer()));
    renderManifest.push({ sheet: sheet.name, path: renderPath });
  }
  await fs.writeFile(path.join(qaDir, "render-manifest.json"), JSON.stringify(renderManifest, null, 2));
  const sizeBytes = (await fs.stat(outputPath)).size;
  manifest.push({
    slug: model.slug,
    title: model.title,
    sourcePath: path.join(publicRoot, ...model.file.path.split("/")),
    outputPath,
    version,
    testedDate,
    sizeBytes,
    sha256: await sha256File(outputPath),
    sheetCount: reopened.worksheets.items.length,
    inputCount: spec.inputs.length,
    inputCells: spec.inputs.map((input) => {
      const ref = refs.get(input.key);
      return `${ref.column}${ref.row}`;
    }),
    checkCount,
    decision: spec.decision || model.decision,
    description: spec.description || spec.included.join(". "),
    excluded: spec.excluded,
    horizon: spec.horizon || model.horizon,
    tags: spec.tags || model.tags,
    renderCount: renderManifest.length,
  });
}

const manifestName = requestedSlug ? `manifest-${requestedSlug}.json` : "manifest.json";
await fs.writeFile(path.join(outputRoot, manifestName), JSON.stringify(manifest, null, 2));
console.log(`Built ${manifest.length} Option C detailed workbook${manifest.length === 1 ? "" : "s"}.`);
