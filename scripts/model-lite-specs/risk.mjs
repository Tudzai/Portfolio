export const createRiskSpecs = (api) => {
  const {
    COLORS,
    FORMATS,
    setCanvas,
    setTitle: baseSetTitle,
    setSection: baseSetSection,
    setFooter: baseSetFooter,
    inputRef,
    writeKpis: baseWriteKpis,
    writeScalarTable: baseWriteScalarTable,
    mergeFormula,
    mergeValue,
  } = api;

  const OPTION_C = {
    charcoal: COLORS.charcoal || "#30273A",
    charcoalSoft: COLORS.charcoalSoft || "#493C50",
    gold: COLORS.gold || "#B88A2A",
    goldText: COLORS.gold || "#B88A2A",
    paleGold: COLORS.paleGold || "#F7F0DC",
    paleGoldStrong: COLORS.paleGold || "#F7F0DC",
    greenLink: COLORS.green || "#008000",
  };

  const setTitle = (sheet, title, subtitle, lastColumn) => {
    baseSetTitle(sheet, title, subtitle, lastColumn);
    sheet.getRange(`A1:${lastColumn}2`).format.fill = OPTION_C.charcoal;
    sheet.getRange(`A3:${lastColumn}3`).format.fill = OPTION_C.gold;
  };

  const setSection = (sheet, row, title, lastColumn) => {
    baseSetSection(sheet, row, title, lastColumn);
    sheet.getRange(`A${row}:${lastColumn}${row}`).format = {
      fill: OPTION_C.charcoalSoft,
      font: { bold: true, color: COLORS.white, fontSize: 9, typeface: "Aptos" },
      horizontalAlignment: "left",
      verticalAlignment: "center",
      borders: { bottom: { style: "thin", color: OPTION_C.gold } },
    };
  };

  const setFooter = (sheet, row, lastColumn, text) => {
    baseSetFooter(sheet, row, lastColumn, text);
    sheet.getRange(`A${row}:${lastColumn}${row}`).format.fill = OPTION_C.charcoal;
  };

  const writeKpis = (sheet, kpis) => {
    const cells = baseWriteKpis(sheet, kpis);
    ["A5:B5", "C5:D5", "E5:F5", "G5:H5"].forEach((address) => {
      sheet.getRange(address).format.fill = OPTION_C.charcoal;
      sheet.getRange(address).format.borders = { preset: "outside", style: "thin", color: OPTION_C.charcoal };
    });
    ["A6:B8", "C6:D8", "E6:F8", "G6:H8"].forEach((address) => {
      sheet.getRange(address).format.font.color = OPTION_C.gold;
    });
    return cells;
  };

  const writeScalarTable = (sheet, config) => {
    const result = baseWriteScalarTable(sheet, config);
    sheet.getRange(`A${config.startRow}:H${config.startRow}`).format = {
      fill: OPTION_C.charcoalSoft,
      font: { bold: true, color: COLORS.white, fontSize: 9, typeface: "Aptos" },
      borders: { bottom: { style: "thin", color: OPTION_C.gold } },
    };
    config.rows.forEach((row, index) => {
      if (row.fill) sheet.getRange(`A${config.startRow + 1 + index}:H${config.startRow + 1 + index}`).format.fill = OPTION_C.paleGold;
    });
    return result;
  };

  const styleInputLinks = (sheet, addresses) => {
    addresses.forEach((address) => {
      sheet.getRange(address).format.font.color = OPTION_C.greenLink;
    });
  };

  const resultRef = (cell) => `'Model'!${cell}`;

  const styleTableHeader = (sheet, row, values) => {
    sheet.getRange(`A${row}:H${row}`).values = [values];
    sheet.getRange(`A${row}:H${row}`).format = {
      fill: OPTION_C.charcoalSoft,
      font: { bold: true, color: COLORS.white, fontSize: 9, typeface: "Aptos" },
      horizontalAlignment: "right",
      borders: { bottom: { style: "thin", color: OPTION_C.gold } },
    };
    sheet.getRange(`A${row}`).format.horizontalAlignment = "left";
  };

  const styleTableRow = (sheet, row, formats = []) => {
    sheet.getRange(`A${row}:H${row}`).format = {
      fill: COLORS.white,
      font: { color: COLORS.ink, fontSize: 9, typeface: "Aptos" },
      borders: { preset: "bottom", style: "thin", color: COLORS.line },
    };
    formats.forEach(([column, format]) => {
      sheet.getRange(`${column}${row}`).format.numberFormat = format;
      sheet.getRange(`${column}${row}`).format.horizontalAlignment = "right";
    });
  };

  const writeOutcome = (sheet, address, formula) => {
    const range = sheet.getRange(address);
    range.merge();
    sheet.getRange(address.split(":")[0]).formulas = [[formula]];
    range.format = {
      fill: OPTION_C.paleGoldStrong,
      font: { bold: true, color: OPTION_C.goldText, fontSize: 9, typeface: "Aptos" },
      horizontalAlignment: "center",
      verticalAlignment: "center",
      wrapText: true,
      borders: { preset: "outside", style: "thin", color: OPTION_C.gold },
    };
  };

  const fxExposureHedge = {
    slug: "fx-exposure-hedge",
    styleVariant: "option-c",
    decision: "How much FX loss remains after one forward hedge?",
    horizon: "Five spot scenarios / one settlement",
    tags: ["FX risk", "Hedge coverage", "Treasury"],
    included: [
      "One net foreign-currency exposure",
      "One forward hedge and five visible spot scenarios",
      "Selected-case bridge plus loss and protection attribution",
    ],
    excluded: "Multiple currencies, maturity ladders, hedge accounting, options, and custom sensitivity grids.",
    inputs: [
      { key: "netExposure", label: "Net foreign amount", value: 60000, unit: "FC", format: FORMATS.whole, help: "Positive = receivable; negative = payable" },
      { key: "spotRate", label: "Spot rate", value: 1.08, unit: "LCY / FC", format: FORMATS.decimal, help: "Current local-currency rate" },
      { key: "hedgeCoverage", label: "Hedge coverage", value: 0.7, unit: "%", format: FORMATS.percent, help: "Share of the net exposure hedged" },
      { key: "forwardRate", label: "Forward rate", value: 1.09, unit: "LCY / FC", format: FORMATS.decimal, help: "Agreed hedge settlement rate" },
      { key: "spotShock", label: "Adverse spot change", value: -0.1, unit: "%", format: FORMATS.percent, help: "Use a negative move for a receivable" },
      { key: "hedgeFee", label: "Hedge fee", value: 0.005, unit: "% hedged LCY", format: FORMATS.percent, help: "Illustrative transaction cost" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      setCanvas(sheet, "H", 38);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Five-scenario one-settlement hedge test`, "H");
      setSection(sheet, 10, "HEDGE BRIDGE", "H");
      const bridge = writeScalarTable(sheet, {
        startRow: 11,
        rows: [
          { key: "exposureLcy", label: "Current exposure", formula: `=${input("netExposure")}*${input("spotRate")}`, unit: "LCY", help: "Net foreign amount at today's spot", format: FORMATS.amount },
          { key: "hedgeAmount", label: "Hedge amount", formula: `=${input("netExposure")}*${input("hedgeCoverage")}`, unit: "FC", help: "Net exposure multiplied by coverage", format: FORMATS.amount },
          { key: "stressedSpot", label: "Stressed spot", formula: `=${input("spotRate")}*(1+${input("spotShock")})`, unit: "LCY / FC", help: "Spot after the selected adverse move", format: FORMATS.decimal },
          { key: "unhedgedImpact", label: "Impact without hedge", formula: `=${input("netExposure")}*(B14-${input("spotRate")})`, unit: "LCY", help: "Change in exposure value", format: FORMATS.amount },
          { key: "hedgeBenefit", label: "Forward hedge benefit", formula: `=B13*(${input("forwardRate")}-B14)`, unit: "LCY", help: "Forward value versus stressed spot", format: FORMATS.amount },
          { key: "hedgeCost", label: "Hedge fee", formula: `=ABS(B13)*${input("spotRate")}*${input("hedgeFee")}`, unit: "LCY", help: "Illustrative fee", format: FORMATS.amount },
          { key: "hedgedImpact", label: "Impact after hedge", formula: "=B15+B16-B17", unit: "LCY", help: "Unhedged impact plus hedge benefit less fee", format: FORMATS.amount, bold: true, fill: COLORS.paleBlue },
          { key: "protection", label: "Protection value", formula: "=B18-B15", unit: "LCY", help: "Improvement versus remaining unhedged", format: FORMATS.amount, bold: true },
          { key: "residualExposure", label: "Residual foreign amount", formula: `=${input("netExposure")}-B13`, unit: "FC", help: "Exposure left after the hedge", format: FORMATS.amount },
        ],
      });
      const kpiCells = writeKpis(sheet, [
        { label: "EXPOSURE VALUE", formula: `=ABS(${bridge.cell("exposureLcy")})`, format: FORMATS.amount },
        { label: "LOSS · NO HEDGE", formula: `=MAX(0,-${bridge.cell("unhedgedImpact")})`, format: FORMATS.amount },
        { label: "LOSS · AFTER HEDGE", formula: `=MAX(0,-${bridge.cell("hedgedImpact")})`, format: FORMATS.amount },
        { label: "PROTECTION", formula: `=MAX(0,${bridge.cell("protection")})`, format: FORMATS.amount },
      ]);
      setSection(sheet, 23, "FIVE-SPOT SCENARIO PATH", "H");
      styleTableHeader(sheet, 24, ["Scenario", "Spot shock", "Stressed spot", "No-hedge impact", "Forward benefit", "Hedge fee", "After hedge", "Protection"]);
      const scenarioFactors = [
        ["Current spot", 0],
        ["Half selected shock", 0.5],
        ["Selected shock", 1],
        ["1.25× selected shock", 1.25],
        ["1.50× selected shock", 1.5],
      ];
      scenarioFactors.forEach(([label, factor], index) => {
        const row = 25 + index;
        sheet.getRange(`A${row}`).values = [[label]];
        sheet.getRange(`B${row}`).formulas = [[factor === 0 ? "=0" : `=${input("spotShock")}*${factor}`]];
        sheet.getRange(`C${row}`).formulas = [[`=${input("spotRate")}*(1+B${row})`]];
        sheet.getRange(`D${row}`).formulas = [[`=${input("netExposure")}*(C${row}-${input("spotRate")})`]];
        sheet.getRange(`E${row}`).formulas = [[`=${input("netExposure")}*${input("hedgeCoverage")}*(${input("forwardRate")}-C${row})`]];
        sheet.getRange(`F${row}`).formulas = [[`=ABS(${input("netExposure")}*${input("hedgeCoverage")})*${input("spotRate")}*${input("hedgeFee")}`]];
        sheet.getRange(`G${row}`).formulas = [[`=D${row}+E${row}-F${row}`]];
        sheet.getRange(`H${row}`).formulas = [[`=G${row}-D${row}`]];
        styleTableRow(sheet, row, [
          ["B", FORMATS.percent], ["C", FORMATS.decimal], ["D", FORMATS.amount], ["E", FORMATS.amount],
          ["F", FORMATS.amount], ["G", FORMATS.amount], ["H", FORMATS.amount],
        ]);
        if (factor === 1) {
          sheet.getRange(`A${row}:H${row}`).format.fill = OPTION_C.paleGold;
          sheet.getRange(`A${row}:H${row}`).format.font.bold = true;
        }
      });
      writeOutcome(sheet, "A32:H33", `=IF(${bridge.cell("hedgedImpact")}>=${bridge.cell("unhedgedImpact")},"Hedge reduces this selected downside","Hedge does not reduce this selected move")`);
      setFooter(sheet, 38, "H", `${model.title} · Five visible spot cases · One-exposure economic scope`);
      return {
        kpiCells,
        outcomeCell: "A32",
        outcomeLabel: "HEDGE OUTCOME",
        checks: [
          {
            label: "Hedge inputs are valid",
            actual: `=IF(AND(${input("spotRate")}>0,${input("forwardRate")}>0,${input("hedgeCoverage")}>=0,${input("hedgeCoverage")}<=1,${input("spotShock")}>-1,${input("hedgeFee")}>=0),1,0)`,
            expected: "=1",
            fix: "Inputs: rates and percentages",
          },
          {
            label: "Hedge does not exceed the exposure",
            actual: `=IF(ABS('Model'!${bridge.cell("hedgeAmount")})<=ABS(${input("netExposure")})+0.0001,1,0)`,
            expected: "=1",
            fix: "Inputs: hedge coverage",
          },
          {
            label: "Hedge impact bridge ties",
            actual: `='Model'!${bridge.cell("hedgedImpact")}-'Model'!${bridge.cell("unhedgedImpact")}-'Model'!${bridge.cell("hedgeBenefit")}+'Model'!${bridge.cell("hedgeCost")}`,
            expected: "=0",
            fix: "Model: hedge bridge",
            format: FORMATS.amount,
          },
          {
            label: "Selected stressed spot traces to the shock",
            actual: `=ABS('Model'!${bridge.cell("stressedSpot")}-${input("spotRate")}*(1+${input("spotShock")}))+MAX(0,-'Model'!${bridge.cell("stressedSpot")})`,
            expected: "=0",
            fix: "Model: selected spot scenario",
            format: FORMATS.amount,
          },
          {
            label: "Hedge amount traces to coverage",
            actual: `='Model'!${bridge.cell("hedgeAmount")}-${input("netExposure")}*${input("hedgeCoverage")}`,
            expected: "=0",
            fix: "Model: hedge amount",
            format: FORMATS.amount,
          },
          {
            label: "Hedge fee traces to the covered amount",
            actual: `='Model'!${bridge.cell("hedgeCost")}-ABS('Model'!${bridge.cell("hedgeAmount")})*${input("spotRate")}*${input("hedgeFee")}`,
            expected: "=0",
            fix: "Model: hedge fee",
            format: FORMATS.amount,
          },
          {
            label: "Residual exposure roll-forward ties",
            actual: `='Model'!${bridge.cell("residualExposure")}+'Model'!${bridge.cell("hedgeAmount")}-${input("netExposure")}`,
            expected: "=0",
            fix: "Model: residual exposure",
            format: FORMATS.amount,
          },
          {
            label: "Selected scenario row ties to the hedge bridge",
            actual: `=SUM(ABS('Model'!C27-'Model'!${bridge.cell("stressedSpot")}),ABS('Model'!D27-'Model'!${bridge.cell("unhedgedImpact")}),ABS('Model'!E27-'Model'!${bridge.cell("hedgeBenefit")}),ABS('Model'!F27-'Model'!${bridge.cell("hedgeCost")}),ABS('Model'!G27-'Model'!${bridge.cell("hedgedImpact")}),ABS('Model'!H27-'Model'!${bridge.cell("protection")}))`,
            expected: "=0",
            fix: "Model: selected scenario row",
            format: FORMATS.amount,
          },
        ],
      };
    },
  };

  const eclCreditStress = {
    slug: "ecl-credit-stress-lite",
    styleVariant: "option-c",
    decision: "What loss allowance results for one portfolio under stress?",
    horizon: "12-month / lifetime",
    tags: ["Credit risk", "Expected loss", "Stress"],
    included: [
      "One portfolio exposure at default",
      "Stage-based PD with one stress multiplier",
      "Selected-case bridge plus visible Stage 1 / 2 / 3 comparison",
    ],
    excluded: "Portfolio segments, SICR, transition matrices, regulatory reporting, and IFRS 9 compliance.",
    inputs: [
      { key: "drawn", label: "Drawn exposure", value: 1000000, unit: "LCY", format: FORMATS.whole, help: "Amount currently outstanding" },
      { key: "undrawn", label: "Undrawn commitment", value: 200000, unit: "LCY", format: FORMATS.whole, help: "Available but not yet drawn" },
      { key: "ccf", label: "Credit conversion factor", value: 0.5, unit: "%", format: FORMATS.percent, help: "Share of undrawn included in EAD" },
      { key: "stage", label: "Illustrative stage", value: 2, unit: "1 / 2 / 3", format: FORMATS.whole, help: "1 = 12-month; 2 = lifetime; 3 = default" },
      { key: "pd12m", label: "12-month PD", value: 0.02, unit: "%", format: FORMATS.percent, help: "Used for Stage 1" },
      { key: "pdLifetime", label: "Lifetime PD", value: 0.08, unit: "%", format: FORMATS.percent, help: "Used for Stage 2" },
      { key: "lgd", label: "Loss given default", value: 0.45, unit: "%", format: FORMATS.percent, help: "Loss after recoveries" },
      { key: "discountFactor", label: "Discount factor", value: 0.97, unit: "%", format: FORMATS.percent, help: "Present-value factor" },
      { key: "pdStress", label: "PD stress multiplier", value: 1.25, unit: "x", format: FORMATS.multiple, help: "Scales the selected PD" },
      { key: "overlay", label: "Management overlay", value: 0.05, unit: "%", format: FORMATS.percent, help: "Adjustment to calculated ECL" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      setCanvas(sheet, "H", 41);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Selected allowance plus three-stage comparison`, "H");
      setSection(sheet, 10, "EXPECTED LOSS BRIDGE", "H");
      const bridge = writeScalarTable(sheet, {
        startRow: 11,
        rows: [
          { key: "drawnComponent", label: "Drawn exposure", formula: `=${input("drawn")}`, unit: "LCY", help: "Outstanding exposure included at 100%", format: FORMATS.amount },
          { key: "undrawnCommitment", label: "Undrawn commitment", formula: `=${input("undrawn")}`, unit: "LCY", help: "Available commitment before conversion", format: FORMATS.amount },
          { key: "convertedUndrawn", label: "Converted undrawn exposure", formula: `=${input("undrawn")}*${input("ccf")}`, unit: "LCY", help: "Undrawn commitment × CCF", format: FORMATS.amount },
          { key: "ead", label: "Exposure at default", formula: "=SUM(B12,B14)", unit: "LCY", help: "Drawn plus converted undrawn", format: FORMATS.amount, bold: true, fill: COLORS.paleBlue },
          { key: "basePd", label: "Stage-selected base PD", formula: `=IF(${input("stage")}=1,${input("pd12m")},IF(${input("stage")}=2,${input("pdLifetime")},1))`, unit: "%", help: "Stage 1 uses 12-month PD; Stage 2 lifetime PD", format: FORMATS.percent },
          { key: "pdStressFactor", label: "PD stress multiplier", formula: `=${input("pdStress")}`, unit: "x", help: "Stress applied to the stage-selected PD", format: FORMATS.multiple },
          { key: "selectedPd", label: "Selected stressed PD", formula: "=MIN(1,B16*B17)", unit: "%", help: "Base PD × stress, capped at 100%", format: FORMATS.percent, bold: true },
          { key: "lgd", label: "Loss given default", formula: `=${input("lgd")}`, unit: "%", help: "Loss severity after recoveries", format: FORMATS.percent },
          { key: "discount", label: "Discount factor", formula: `=${input("discountFactor")}`, unit: "%", help: "Present-value factor", format: FORMATS.percent },
          { key: "preOverlay", label: "ECL before overlay", formula: "=B15*B18*B19*B20", unit: "LCY", help: "EAD × stressed PD × LGD × discount factor", format: FORMATS.amount },
          { key: "overlayRate", label: "Management overlay", formula: `=${input("overlay")}`, unit: "%", help: "Adjustment rate applied to calculated ECL", format: FORMATS.percent },
          { key: "overlayAmount", label: "Overlay amount", formula: "=B21*B22", unit: "LCY", help: "ECL before overlay × overlay rate", format: FORMATS.amount },
          { key: "totalEcl", label: "Expected credit loss", formula: "=SUM(B21,B23)", unit: "LCY", help: "Pre-overlay loss plus overlay", format: FORMATS.amount, bold: true, fill: COLORS.paleGreen },
          { key: "lossRate", label: "ECL / EAD", formula: "=IF(B15=0,0,B24/B15)", unit: "%", help: "Loss allowance as a share of EAD", format: FORMATS.percent, bold: true },
        ],
      });
      const kpiCells = writeKpis(sheet, [
        { label: "EXPOSURE AT DEFAULT", formula: `=${bridge.cell("ead")}`, format: FORMATS.amount },
        { label: "SELECTED PD", formula: `=${bridge.cell("selectedPd")}`, format: FORMATS.percent },
        { label: "EXPECTED LOSS", formula: `=${bridge.cell("totalEcl")}`, format: FORMATS.amount },
        { label: "LOSS RATE", formula: `=${bridge.cell("lossRate")}`, format: FORMATS.percent },
      ]);
      setSection(sheet, 28, "THREE-STAGE ALLOWANCE COMPARISON", "H");
      styleTableHeader(sheet, 29, ["Stage", "Basis / selection", "Base PD", "Stressed PD", "EAD", "Pre-overlay ECL", "Overlay", "Reported ECL"]);
      [1, 2, 3].forEach((stage, index) => {
        const row = 30 + index;
        sheet.getRange(`A${row}`).values = [[stage]];
        sheet.getRange(`B${row}`).formulas = [[`=IF(${input("stage")}=A${row},"SELECTED · ","")&IF(A${row}=1,"12-MONTH",IF(A${row}=2,"LIFETIME","DEFAULT"))`]];
        sheet.getRange(`C${row}`).formulas = [[`=IF(A${row}=1,${input("pd12m")},IF(A${row}=2,${input("pdLifetime")},1))`]];
        sheet.getRange(`D${row}`).formulas = [[`=MIN(1,C${row}*${input("pdStress")})`]];
        sheet.getRange(`E${row}`).formulas = [[`=${bridge.cell("ead")}`]];
        sheet.getRange(`F${row}`).formulas = [[`=E${row}*D${row}*${input("lgd")}*${input("discountFactor")}`]];
        sheet.getRange(`G${row}`).formulas = [[`=F${row}*${input("overlay")}`]];
        sheet.getRange(`H${row}`).formulas = [[`=SUM(F${row}:G${row})`]];
        styleTableRow(sheet, row, [
          ["A", FORMATS.whole], ["C", FORMATS.percent], ["D", FORMATS.percent], ["E", FORMATS.amount],
          ["F", FORMATS.amount], ["G", FORMATS.amount], ["H", FORMATS.amount],
        ]);
      });
      writeOutcome(sheet, "A35:H36", `=IF(${bridge.cell("lossRate")}<=0.03,"Lower illustrative loss rate","Higher illustrative loss rate · review PD and LGD")`);
      setFooter(sheet, 41, "H", `${model.title} · Three stages visible · Educational estimate, not IFRS 9`);
      return {
        kpiCells,
        outcomeCell: "A35",
        outcomeLabel: "ECL OUTCOME",
        checks: [
          {
            label: "Stage and risk inputs are valid",
            actual: `=IF(AND(${input("drawn")}>=0,${input("undrawn")}>=0,OR(${input("stage")}=1,${input("stage")}=2,${input("stage")}=3),${input("ccf")}>=0,${input("ccf")}<=1,${input("pd12m")}>=0,${input("pd12m")}<=1,${input("pdLifetime")}>=0,${input("pdLifetime")}<=1,${input("lgd")}>=0,${input("lgd")}<=1,${input("discountFactor")}>=0,${input("discountFactor")}<=1,${input("pdStress")}>=0,${input("overlay")}>=-1),1,0)`,
            expected: "=1",
            fix: "Inputs: stage and risk rates",
          },
          {
            label: "Exposure at default bridge ties",
            actual: `='Model'!${bridge.cell("ead")}-${input("drawn")}-${input("undrawn")}*${input("ccf")}`,
            expected: "=0",
            fix: "Model: EAD bridge",
            format: FORMATS.amount,
          },
          {
            label: "ECL bridge and non-negativity tie",
            actual: `=IF(AND(ABS('Model'!${bridge.cell("totalEcl")}-'Model'!${bridge.cell("preOverlay")}-'Model'!${bridge.cell("overlayAmount")})<=0.0001,'Model'!${bridge.cell("totalEcl")}>=0),1,0)`,
            expected: "=1",
            fix: "Model: ECL bridge",
          },
          {
            label: "Stage-selected base PD traces correctly",
            actual: `='Model'!${bridge.cell("basePd")}-IF(${input("stage")}=1,${input("pd12m")},IF(${input("stage")}=2,${input("pdLifetime")},1))`,
            expected: "=0",
            fix: "Model: stage PD selection",
            format: FORMATS.percent,
          },
          {
            label: "Stressed PD applies the cap",
            actual: `='Model'!${bridge.cell("selectedPd")}-MIN(1,'Model'!${bridge.cell("basePd")}*${input("pdStress")})`,
            expected: "=0",
            fix: "Model: stressed PD",
            format: FORMATS.percent,
          },
          {
            label: "Pre-overlay expected loss traces",
            actual: `='Model'!${bridge.cell("preOverlay")}-'Model'!${bridge.cell("ead")}*'Model'!${bridge.cell("selectedPd")}*${input("lgd")}*${input("discountFactor")}`,
            expected: "=0",
            fix: "Model: EAD × PD × LGD × discount",
            format: FORMATS.amount,
          },
          {
            label: "Management overlay amount traces",
            actual: `='Model'!${bridge.cell("overlayAmount")}-'Model'!${bridge.cell("preOverlay")}*${input("overlay")}`,
            expected: "=0",
            fix: "Model: management overlay",
            format: FORMATS.amount,
          },
          {
            label: "Selected stage row ties to the allowance bridge",
            actual: `=SUM(ABS(INDEX('Model'!D30:D32,${input("stage")})-'Model'!${bridge.cell("selectedPd")}),ABS(INDEX('Model'!E30:E32,${input("stage")})-'Model'!${bridge.cell("ead")}),ABS(INDEX('Model'!H30:H32,${input("stage")})-'Model'!${bridge.cell("totalEcl")}))`,
            expected: "=0",
            fix: "Model: stage comparison",
            format: FORMATS.amount,
          },
        ],
      };
    },
  };

  const marketPortfolioStress = {
    slug: "market-portfolio-stress",
    styleVariant: "option-c",
    decision: "How much could a three-asset portfolio lose under direct shocks?",
    horizon: "One stress date",
    tags: ["Market risk", "Stress loss", "Concentration"],
    included: [
      "Three asset buckets and direct price shocks",
      "Four-line asset and liquidity loss attribution",
      "Stress and concentration limit headroom",
    ],
    excluded: "VaR, expected shortfall, duration, greeks, correlations, full revaluation, and advice.",
    inputs: [
      { key: "equityValue", label: "Equities", value: 500, unit: "LCY 000", format: FORMATS.amount, help: "Current market value" },
      { key: "bondValue", label: "Bonds", value: 300, unit: "LCY 000", format: FORMATS.amount, help: "Current market value" },
      { key: "otherValue", label: "Other assets", value: 200, unit: "LCY 000", format: FORMATS.amount, help: "Current market value" },
      { key: "equityShock", label: "Equity shock", value: -0.25, unit: "%", format: FORMATS.percent, help: "Direct change in equity value" },
      { key: "bondShock", label: "Bond shock", value: -0.08, unit: "%", format: FORMATS.percent, help: "Direct change in bond value" },
      { key: "otherShock", label: "Other-asset shock", value: -0.15, unit: "%", format: FORMATS.percent, help: "Direct change in other assets" },
      { key: "liquidityHaircut", label: "Liquidity haircut", value: 0.02, unit: "%", format: FORMATS.percent, help: "Extra portfolio-wide loss" },
      { key: "stressLimit", label: "Stress-loss limit", value: 0.2, unit: "% portfolio", format: FORMATS.percent, help: "Maximum accepted stressed loss" },
      { key: "concentrationLimit", label: "Concentration limit", value: 0.55, unit: "% portfolio", format: FORMATS.percent, help: "Maximum one-asset weight" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      setCanvas(sheet, "H", 39);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Three-asset downside and limit attribution`, "H");
      setSection(sheet, 10, "STRESS ATTRIBUTION", "H");
      const bridge = writeScalarTable(sheet, {
        startRow: 11,
        rows: [
          { key: "marketValue", label: "Portfolio market value", formula: `=SUM(${input("equityValue")},${input("bondValue")},${input("otherValue")})`, unit: "LCY 000", help: "Total current value", format: FORMATS.amount, bold: true },
          { key: "equityLoss", label: "Equity impact", formula: `=${input("equityValue")}*${input("equityShock")}`, unit: "LCY 000", help: "Equity value × shock", format: FORMATS.amount },
          { key: "bondLoss", label: "Bond impact", formula: `=${input("bondValue")}*${input("bondShock")}`, unit: "LCY 000", help: "Bond value × shock", format: FORMATS.amount },
          { key: "otherLoss", label: "Other-asset impact", formula: `=${input("otherValue")}*${input("otherShock")}`, unit: "LCY 000", help: "Other value × shock", format: FORMATS.amount },
          { key: "liquidityLoss", label: "Liquidity impact", formula: `=-B12*${input("liquidityHaircut")}`, unit: "LCY 000", help: "Portfolio value × haircut", format: FORMATS.amount },
          { key: "totalLoss", label: "Total stressed impact", formula: "=SUM(B13:B16)", unit: "LCY 000", help: "Sum of all stress impacts", format: FORMATS.amount, bold: true, fill: COLORS.paleBlue },
          { key: "stressPct", label: "Stress loss / portfolio", formula: "=IF(B12=0,0,MAX(0,-B17)/B12)", unit: "%", help: "Downside loss as a share of value", format: FORMATS.percent, bold: true },
          { key: "largestWeight", label: "Largest asset weight", formula: `=IF(B12=0,0,MAX(${input("equityValue")},${input("bondValue")},${input("otherValue")})/B12)`, unit: "%", help: "Largest asset value divided by total", format: FORMATS.percent },
          { key: "lossHeadroom", label: "Loss-limit headroom", formula: `=${input("stressLimit")}-B18`, unit: "% pts", help: "Positive means within the stress limit", format: FORMATS.percent },
          { key: "concentrationHeadroom", label: "Concentration headroom", formula: `=${input("concentrationLimit")}-B19`, unit: "% pts", help: "Positive means within concentration limit", format: FORMATS.percent },
        ],
      });
      const kpiCells = writeKpis(sheet, [
        { label: "PORTFOLIO VALUE", formula: `=${bridge.cell("marketValue")}`, format: FORMATS.amount },
        { label: "STRESSED LOSS", formula: `=MAX(0,-${bridge.cell("totalLoss")})`, format: FORMATS.amount },
        { label: "STRESS LOSS %", formula: `=${bridge.cell("stressPct")}`, format: FORMATS.percent },
        { label: "LOSS HEADROOM", formula: `=${bridge.cell("lossHeadroom")}`, format: FORMATS.percent },
      ]);
      setSection(sheet, 24, "ASSET LOSS ATTRIBUTION", "H");
      styleTableHeader(sheet, 25, ["Asset / layer", "Market value", "Weight", "Shock / haircut", "Impact", "Share of loss", "Stressed value", "Limit view"]);
      const assetRows = [
        { row: 26, label: "Equities", value: input("equityValue"), shock: input("equityShock"), impact: bridge.cell("equityLoss") },
        { row: 27, label: "Bonds", value: input("bondValue"), shock: input("bondShock"), impact: bridge.cell("bondLoss") },
        { row: 28, label: "Other assets", value: input("otherValue"), shock: input("otherShock"), impact: bridge.cell("otherLoss") },
      ];
      assetRows.forEach(({ row, label, value, shock, impact }) => {
        sheet.getRange(`A${row}`).values = [[label]];
        sheet.getRange(`B${row}`).formulas = [[`=${value}`]];
        sheet.getRange(`C${row}`).formulas = [[`=IF(${bridge.cell("marketValue")}=0,0,B${row}/${bridge.cell("marketValue")})`]];
        sheet.getRange(`D${row}`).formulas = [[`=${shock}`]];
        sheet.getRange(`E${row}`).formulas = [[`=${impact}`]];
        sheet.getRange(`F${row}`).formulas = [[`=IF(${bridge.cell("totalLoss")}=0,0,E${row}/${bridge.cell("totalLoss")})`]];
        sheet.getRange(`G${row}`).formulas = [[`=B${row}+E${row}`]];
        sheet.getRange(`H${row}`).formulas = [[`=IF(C${row}>${input("concentrationLimit")},"CONCENTRATION BREACH","Within concentration")`]];
        styleTableRow(sheet, row, [
          ["B", FORMATS.amount], ["C", FORMATS.percent], ["D", FORMATS.percent], ["E", FORMATS.amount],
          ["F", FORMATS.percent], ["G", FORMATS.amount],
        ]);
      });
      sheet.getRange("A29").values = [["Liquidity overlay"]];
      sheet.getRange("B29").formulas = [[`=${bridge.cell("marketValue")}`]];
      sheet.getRange("C29").formulas = [["=1"]];
      sheet.getRange("D29").formulas = [[`=-${input("liquidityHaircut")}`]];
      sheet.getRange("E29").formulas = [[`=${bridge.cell("liquidityLoss")}`]];
      sheet.getRange("F29").formulas = [[`=IF(${bridge.cell("totalLoss")}=0,0,E29/${bridge.cell("totalLoss")})`]];
      sheet.getRange("G29").formulas = [[`=B29+E29`]];
      sheet.getRange("H29").values = [["Portfolio-wide overlay"]];
      styleTableRow(sheet, 29, [["B", FORMATS.amount], ["C", FORMATS.percent], ["D", FORMATS.percent], ["E", FORMATS.amount], ["F", FORMATS.percent], ["G", FORMATS.amount]]);
      sheet.getRange("A30").values = [["TOTAL PORTFOLIO"]];
      sheet.getRange("B30").formulas = [[`=${bridge.cell("marketValue")}`]];
      sheet.getRange("C30").formulas = [["=SUM(C26:C28)"]];
      sheet.getRange("D30").values = [[null]];
      sheet.getRange("E30").formulas = [["=SUM(E26:E29)"]];
      sheet.getRange("F30").formulas = [["=SUM(F26:F29)"]];
      sheet.getRange("G30").formulas = [["=B30+E30"]];
      sheet.getRange("H30").formulas = [[`=IF(AND(${bridge.cell("lossHeadroom")}>=0,${bridge.cell("concentrationHeadroom")}>=0),"WITHIN LIMITS","LIMIT BREACH")`]];
      styleTableRow(sheet, 30, [["B", FORMATS.amount], ["C", FORMATS.percent], ["E", FORMATS.amount], ["F", FORMATS.percent], ["G", FORMATS.amount]]);
      sheet.getRange("A30:H30").format.fill = OPTION_C.paleGold;
      sheet.getRange("A30:H30").format.font.bold = true;
      writeOutcome(sheet, "A33:H34", `=IF(AND(${bridge.cell("lossHeadroom")}>=0,${bridge.cell("concentrationHeadroom")}>=0),"WITHIN SELECTED LIMITS","LIMIT BREACH · review the loss or concentration")`);
      setFooter(sheet, 39, "H", `${model.title} · Asset attribution visible · Deterministic stress only`);
      return {
        kpiCells,
        outcomeCell: "A33",
        outcomeLabel: "PORTFOLIO STRESS OUTCOME",
        checks: [
          {
            label: "Market stress inputs are valid",
            actual: `=IF(AND(${input("equityValue")}>=0,${input("bondValue")}>=0,${input("otherValue")}>=0,${input("equityShock")}>=-1,${input("equityShock")}<=1,${input("bondShock")}>=-1,${input("bondShock")}<=1,${input("otherShock")}>=-1,${input("otherShock")}<=1,${input("liquidityHaircut")}>=0,${input("liquidityHaircut")}<=1,${input("stressLimit")}>=0,${input("stressLimit")}<=1,${input("concentrationLimit")}>=0,${input("concentrationLimit")}<=1),1,0)`,
            expected: "=1",
            fix: "Inputs: values and percentages",
          },
          {
            label: "Asset weights sum to 100%",
            actual: `=IF('Model'!${bridge.cell("marketValue")}=0,1,(${input("equityValue")}+${input("bondValue")}+${input("otherValue")})/'Model'!${bridge.cell("marketValue")})`,
            expected: "=1",
            fix: "Inputs: asset values",
            format: FORMATS.percent,
          },
          {
            label: "Stress attribution ties",
            actual: `='Model'!${bridge.cell("totalLoss")}-SUM('Model'!${bridge.cell("equityLoss")},'Model'!${bridge.cell("bondLoss")},'Model'!${bridge.cell("otherLoss")},'Model'!${bridge.cell("liquidityLoss")})`,
            expected: "=0",
            fix: "Model: stress attribution",
            format: FORMATS.amount,
          },
          {
            label: "Direct asset shocks trace to market values",
            actual: `=SUM(ABS('Model'!${bridge.cell("equityLoss")}-${input("equityValue")}*${input("equityShock")}),ABS('Model'!${bridge.cell("bondLoss")}-${input("bondValue")}*${input("bondShock")}),ABS('Model'!${bridge.cell("otherLoss")}-${input("otherValue")}*${input("otherShock")}))`,
            expected: "=0",
            fix: "Model: direct asset shocks",
            format: FORMATS.amount,
          },
          {
            label: "Liquidity haircut traces to portfolio value",
            actual: `='Model'!${bridge.cell("liquidityLoss")}+'Model'!${bridge.cell("marketValue")}*${input("liquidityHaircut")}`,
            expected: "=0",
            fix: "Model: liquidity overlay",
            format: FORMATS.amount,
          },
          {
            label: "Stress-loss percentage traces",
            actual: `='Model'!${bridge.cell("stressPct")}-IF('Model'!${bridge.cell("marketValue")}=0,0,MAX(0,-'Model'!${bridge.cell("totalLoss")})/'Model'!${bridge.cell("marketValue")})`,
            expected: "=0",
            fix: "Model: stress-loss percentage",
            format: FORMATS.percent,
          },
          {
            label: "Concentration and limit headroom trace",
            actual: `=SUM(ABS('Model'!${bridge.cell("largestWeight")}-IF('Model'!${bridge.cell("marketValue")}=0,0,MAX(${input("equityValue")},${input("bondValue")},${input("otherValue")})/'Model'!${bridge.cell("marketValue")})),ABS('Model'!${bridge.cell("lossHeadroom")}-${input("stressLimit")}+'Model'!${bridge.cell("stressPct")}),ABS('Model'!${bridge.cell("concentrationHeadroom")}-${input("concentrationLimit")}+'Model'!${bridge.cell("largestWeight")}))`,
            expected: "=0",
            fix: "Model: concentration and headroom",
            format: FORMATS.percent,
          },
          {
            label: "Asset attribution table ties to the bridge",
            actual: `=SUM(ABS('Model'!E26-'Model'!${bridge.cell("equityLoss")}),ABS('Model'!E27-'Model'!${bridge.cell("bondLoss")}),ABS('Model'!E28-'Model'!${bridge.cell("otherLoss")}),ABS('Model'!E29-'Model'!${bridge.cell("liquidityLoss")}),ABS('Model'!E30-'Model'!${bridge.cell("totalLoss")}),ABS('Model'!G30-'Model'!${bridge.cell("marketValue")}-'Model'!${bridge.cell("totalLoss")}))`,
            expected: "=0",
            fix: "Model: asset attribution table",
            format: FORMATS.amount,
          },
        ],
      };
    },
  };

  const debtSculptingWaterfall = {
    slug: "debt-sculpting-waterfall",
    styleVariant: "option-c",
    decision: "Can projected cash repay one term loan at the target DSCR?",
    horizon: "Up to 10 years",
    tags: ["Debt capacity", "DSCR", "Cash waterfall"],
    included: [
      "Ten-year CFADS generated from two inputs",
      "Target-DSCR principal sculpting",
      "Debt capacity, balloon, and cash to equity",
    ],
    excluded: "Reserve accounts, lock-ups, multiple tranches, tax waterfalls, iterative solvers, and legal terms.",
    inputs: [
      { key: "openingDebt", label: "Opening debt", value: 280, unit: "LCY m", format: FORMATS.amount, help: "Debt outstanding at the start" },
      { key: "yearOneCfads", label: "Year 1 CFADS", value: 52, unit: "LCY m", format: FORMATS.amount, help: "Cash available for debt service" },
      { key: "cfadsGrowth", label: "Annual CFADS growth", value: 0.05, unit: "%", format: FORMATS.percent, help: "One growth rate across the term" },
      { key: "interestRate", label: "Debt interest rate", value: 0.08, unit: "%", format: FORMATS.percent, help: "Annual rate on opening debt" },
      { key: "targetDscr", label: "Target DSCR", value: 1.3, unit: "x", format: FORMATS.multiple, help: "CFADS divided by debt service" },
      { key: "termYears", label: "Loan term", value: 10, unit: "years", format: FORMATS.whole, help: "Whole years from 1 to 10" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      const firstRow = 20;
      const years = Array.from({ length: 10 }, (_, index) => index + 1);
      setCanvas(sheet, "H", 45);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Ten-year driver, capacity, and repayment schedule`, "H");
      setSection(sheet, 10, "DRIVER & CAPACITY SETUP", "H");
      writeScalarTable(sheet, {
        startRow: 11,
        rows: [
          { key: "openingDebt", label: "Opening debt", formula: `=${input("openingDebt")}`, unit: "LCY m", help: "Debt outstanding before the first sculpted payment", format: FORMATS.amount },
          { key: "yearOneCfads", label: "Year 1 CFADS", formula: `=${input("yearOneCfads")}`, unit: "LCY m", help: "Opening cash available for debt service", format: FORMATS.amount },
          { key: "cfadsGrowth", label: "Annual CFADS growth", formula: `=${input("cfadsGrowth")}`, unit: "%", help: "Copy-across growth driver", format: FORMATS.percent },
          { key: "interestRate", label: "Debt interest rate", formula: `=${input("interestRate")}`, unit: "%", help: "Applied to opening debt each year", format: FORMATS.percent },
          { key: "targetDscr", label: "Target DSCR", formula: `=${input("targetDscr")}`, unit: "x", help: "Sets maximum annual debt service", format: FORMATS.multiple },
          { key: "termYears", label: "Selected loan term", formula: `=${input("termYears")}`, unit: "years", help: "Rows after the selected term remain blank", format: FORMATS.whole },
        ],
      });
      styleInputLinks(sheet, ["B12:B17"]);
      setSection(sheet, 18, "TEN-YEAR DEBT SCHEDULE", "H");
      styleTableHeader(sheet, 19, ["Year", "CFADS", "Interest", "Principal", "Debt service", "Closing debt", "DSCR", "Cash to equity"]);

      years.forEach((year, index) => {
        const row = firstRow + index;
        const priorDebt = index === 0 ? input("openingDebt") : `F${row - 1}`;
        sheet.getRange(`A${row}`).formulas = [[`=IF(${year}<=${input("termYears")},${year},"")`]];
        sheet.getRange(`B${row}`).formulas = [[`=IF(A${row}="","",${input("yearOneCfads")}*(1+${input("cfadsGrowth")})^(A${row}-1))`]];
        sheet.getRange(`C${row}`).formulas = [[`=IF(A${row}="","",${priorDebt}*${input("interestRate")})`]];
        sheet.getRange(`D${row}`).formulas = [[`=IF(A${row}="","",IF(${input("targetDscr")}<=0,0,MIN(${priorDebt},MAX(0,B${row}/${input("targetDscr")}-C${row}))))`]];
        sheet.getRange(`E${row}`).formulas = [[`=IF(A${row}="","",C${row}+D${row})`]];
        sheet.getRange(`F${row}`).formulas = [[`=IF(A${row}="","",MAX(0,${priorDebt}-D${row}))`]];
        sheet.getRange(`G${row}`).formulas = [[`=IF(OR(A${row}="",E${row}=0),"",B${row}/E${row})`]];
        sheet.getRange(`H${row}`).formulas = [[`=IF(A${row}="","",B${row}-E${row})`]];
        styleTableRow(sheet, row, [
          ["A", FORMATS.whole], ["B", FORMATS.amount], ["C", FORMATS.amount], ["D", FORMATS.amount],
          ["E", FORMATS.amount], ["F", FORMATS.amount], ["G", FORMATS.multiple], ["H", FORMATS.amount],
        ]);
      });

      const capacityTerms = years.map((year, index) => {
        const row = firstRow + index;
        return `IF(OR(A${row}="",${input("targetDscr")}<=0,1+${input("interestRate")}<=0),0,B${row}/${input("targetDscr")}/(1+${input("interestRate")})^A${row})`;
      });
      const metrics = writeScalarTable(sheet, {
        startRow: 31,
        rows: [
          { key: "debtCapacity", label: "Debt capacity", formula: `=SUM(${capacityTerms.join(",")})`, unit: "LCY m", help: "PV of target debt service", format: FORMATS.amount, bold: true },
          { key: "closingDebt", label: "Closing debt / balloon", formula: `=INDEX(F${firstRow}:F${firstRow + 9},MAX(1,MIN(10,ROUND(${input("termYears")},0))))`, unit: "LCY m", help: "Debt left at the end of the selected term", format: FORMATS.amount, bold: true },
          { key: "capacityHeadroom", label: "Capacity headroom", formula: `=B32-${input("openingDebt")}`, unit: "LCY m", help: "Debt capacity less opening debt", format: FORMATS.amount },
          { key: "minimumDscr", label: "Minimum active DSCR", formula: `=IF(COUNT(G${firstRow}:G${firstRow + 9})=0,0,MIN(G${firstRow}:G${firstRow + 9}))`, unit: "x", help: "Blank years after repayment are ignored", format: FORMATS.multiple },
          { key: "repaidYear", label: "Debt repaid in year", formula: `=IF(OR(B33>0,COUNTIF(F${firstRow}:F${firstRow + 9},0)=0),0,MATCH(0,F${firstRow}:F${firstRow + 9},0))`, unit: "year", help: "Zero means a balloon remains", format: FORMATS.whole },
          { key: "equityCash", label: "Total cash to equity", formula: `=SUM(H${firstRow}:H${firstRow + 9})`, unit: "LCY m", help: "CFADS left after debt service", format: FORMATS.amount },
        ],
      });
      const kpiCells = writeKpis(sheet, [
        { label: "DEBT CAPACITY", formula: `=${metrics.cell("debtCapacity")}`, format: FORMATS.amount },
        { label: "MINIMUM DSCR", formula: `=${metrics.cell("minimumDscr")}`, format: FORMATS.multiple },
        { label: "CLOSING BALLOON", formula: `=${metrics.cell("closingDebt")}`, format: FORMATS.amount },
        { label: "CASH TO EQUITY", formula: `=${metrics.cell("equityCash")}`, format: FORMATS.amount },
      ]);
      writeOutcome(sheet, "A40:H41", `=IF(${metrics.cell("closingDebt")}<=0.0001,"FITS CAPACITY · debt is repaid","BALLOON REMAINS · reduce debt or extend the term")`);
      setFooter(sheet, 45, "H", `${model.title} · Driver setup + ten annual debt periods · One debt tranche`);

      const rollForwardTerms = years.map((year, index) => {
        const row = firstRow + index;
        const priorDebt = index === 0 ? input("openingDebt") : `'Model'!F${row - 1}`;
        return `IF('Model'!A${row}="",0,ABS('Model'!F${row}-(${priorDebt}-'Model'!D${row}))+MAX(0,-'Model'!D${row})+MAX(0,'Model'!D${row}-${priorDebt}))`;
      });
      const waterfallTerms = years.map((year, index) => {
        const row = firstRow + index;
        return `IF('Model'!A${row}="",0,ABS('Model'!B${row}-'Model'!E${row}-'Model'!H${row}))`;
      });
      const cfadsTerms = years.map((year, index) => {
        const row = firstRow + index;
        return `IF('Model'!A${row}="",0,ABS('Model'!B${row}-${input("yearOneCfads")}*(1+${input("cfadsGrowth")})^('Model'!A${row}-1)))`;
      });
      const interestTerms = years.map((year, index) => {
        const row = firstRow + index;
        const priorDebt = index === 0 ? input("openingDebt") : `'Model'!F${row - 1}`;
        return `IF('Model'!A${row}="",0,ABS('Model'!C${row}-${priorDebt}*${input("interestRate")}))`;
      });
      const serviceTerms = years.map((year, index) => {
        const row = firstRow + index;
        return `IF('Model'!A${row}="",0,ABS('Model'!E${row}-'Model'!C${row}-'Model'!D${row})+IF('Model'!E${row}=0,IF('Model'!G${row}="",0,1),ABS('Model'!G${row}-'Model'!B${row}/'Model'!E${row})))`;
      });
      const principalTerms = years.map((year, index) => {
        const row = firstRow + index;
        const priorDebt = index === 0 ? input("openingDebt") : `'Model'!F${row - 1}`;
        return `IF('Model'!A${row}="",0,ABS('Model'!D${row}-MIN(${priorDebt},MAX(0,'Model'!B${row}/${input("targetDscr")}-'Model'!C${row}))))`;
      });
      return {
        kpiCells,
        outcomeCell: "A40",
        outcomeLabel: "DEBT CAPACITY OUTCOME",
        checks: [
          {
            label: "Debt assumptions are valid",
            actual: `=IF(AND(${input("openingDebt")}>0,${input("yearOneCfads")}>=0,${input("cfadsGrowth")}>-1,${input("interestRate")}>=0,${input("targetDscr")}>1,${input("termYears")}>=1,${input("termYears")}<=10,${input("termYears")}=INT(${input("termYears")})),1,0)`,
            expected: "=1",
            fix: "Inputs: debt assumptions",
          },
          {
            label: "Debt roll-forward ties",
            actual: `=SUM(${rollForwardTerms.join(",")})`,
            expected: "=0",
            fix: "Model: debt schedule",
            format: FORMATS.amount,
          },
          {
            label: "CFADS waterfall ties",
            actual: `=SUM(${waterfallTerms.join(",")})`,
            expected: "=0",
            fix: "Model: cash to equity",
            format: FORMATS.amount,
          },
          {
            label: "CFADS growth schedule traces",
            actual: `=SUM(${cfadsTerms.join(",")})`,
            expected: "=0",
            fix: "Model: CFADS schedule",
            format: FORMATS.amount,
          },
          {
            label: "Interest schedule traces to opening debt",
            actual: `=SUM(${interestTerms.join(",")})`,
            expected: "=0",
            fix: "Model: annual interest",
            format: FORMATS.amount,
          },
          {
            label: "Debt service and DSCR calculations tie",
            actual: `=SUM(${serviceTerms.join(",")})`,
            expected: "=0",
            fix: "Model: debt service and DSCR",
            format: FORMATS.amount,
          },
          {
            label: "Sculpted principal formula traces",
            actual: `=SUM(${principalTerms.join(",")})`,
            expected: "=0",
            fix: "Model: sculpted principal",
            format: FORMATS.amount,
          },
          {
            label: "Debt summary roll-ups tie to the schedule",
            actual: `=SUM(ABS('Model'!${metrics.cell("closingDebt")}-INDEX('Model'!F${firstRow}:F${firstRow + 9},${input("termYears")})),ABS('Model'!${metrics.cell("equityCash")}-SUM('Model'!H${firstRow}:H${firstRow + 9})),ABS('Model'!${metrics.cell("capacityHeadroom")}-'Model'!${metrics.cell("debtCapacity")}+${input("openingDebt")}))`,
            expected: "=0",
            fix: "Model: debt summary",
            format: FORMATS.amount,
          },
        ],
      };
    },
  };

  const personalBudgetNetWorth = {
    slug: "personal-budget-net-worth",
    styleVariant: "option-c",
    decision: "After one year, am I spending within income and building net worth?",
    horizon: "12 months",
    tags: ["Budget", "Debt payoff", "Net worth"],
    included: [
      "One monthly income and two spending totals",
      "Twelve-month debt, cash, and investment roll-forward",
      "Ending net worth and emergency-cash view",
    ],
    excluded: "Detailed categories, monthly manual grids, tax planning, insurance, products, and advice.",
    inputs: [
      { key: "monthlyIncome", label: "Monthly take-home income", value: 8000, unit: "LCY / month", format: FORMATS.whole, help: "Income after tax" },
      { key: "essentialSpending", label: "Essential spending", value: 4150, unit: "LCY / month", format: FORMATS.whole, help: "Housing, food, transport, and bills" },
      { key: "flexibleSpending", label: "Flexible spending", value: 800, unit: "LCY / month", format: FORMATS.whole, help: "All other planned spending" },
      { key: "debtPayment", label: "Planned debt payment", value: 750, unit: "LCY / month", format: FORMATS.whole, help: "Payment is capped when debt is repaid" },
      { key: "investmentContribution", label: "Investment contribution", value: 1000, unit: "LCY / month", format: FORMATS.whole, help: "Regular monthly contribution" },
      { key: "startingCash", label: "Starting cash", value: 12000, unit: "LCY", format: FORMATS.whole, help: "Cash available now" },
      { key: "startingDebt", label: "Starting debt", value: 28000, unit: "LCY", format: FORMATS.whole, help: "Debt outstanding now" },
      { key: "annualDebtRate", label: "Annual debt rate", value: 0.12, unit: "%", format: FORMATS.percent, help: "Annual interest rate" },
      { key: "startingInvestments", label: "Starting investments", value: 20000, unit: "LCY", format: FORMATS.whole, help: "Invested balance now" },
      { key: "annualInvestmentReturn", label: "Annual investment return", value: 0.06, unit: "%", format: FORMATS.percent, help: "Simple monthly-compounded assumption" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      const firstRow = 21;
      const months = Array.from({ length: 12 }, (_, index) => index + 1);
      setCanvas(sheet, "H", 48);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Monthly cash allocation and balance roll-forward`, "H");
      setSection(sheet, 10, "MONTHLY CASH ALLOCATION", "H");
      writeScalarTable(sheet, {
        startRow: 11,
        rows: [
          { key: "income", label: "Take-home income", formula: `=${input("monthlyIncome")}`, unit: "LCY / month", help: "Recurring cash income", format: FORMATS.amount },
          { key: "essential", label: "Essential spending", formula: `=-${input("essentialSpending")}`, unit: "LCY / month", help: "Recurring essential cash outflow", format: FORMATS.amount },
          { key: "flexible", label: "Flexible spending", formula: `=-${input("flexibleSpending")}`, unit: "LCY / month", help: "Recurring discretionary cash outflow", format: FORMATS.amount },
          { key: "debtPayment", label: "Planned debt payment", formula: `=-${input("debtPayment")}`, unit: "LCY / month", help: "Capped once principal is repaid", format: FORMATS.amount },
          { key: "investment", label: "Investment contribution", formula: `=-${input("investmentContribution")}`, unit: "LCY / month", help: "Monthly transfer to investments", format: FORMATS.amount },
          { key: "plannedSurplus", label: "Planned monthly cash left", formula: "=SUM(B12:B16)", unit: "LCY / month", help: "Before the debt-payment cap changes the final months", format: FORMATS.amount, bold: true, fill: COLORS.paleBlue },
        ],
      });
      styleInputLinks(sheet, ["B12:B16"]);
      setSection(sheet, 19, "TWELVE-MONTH BALANCE ROLL-FORWARD", "H");
      styleTableHeader(sheet, 20, ["Month", "Cash", "Debt", "Investments", "Net worth", "Interest", "Principal", "Cash left"]);

      months.forEach((month, index) => {
        const row = firstRow + index;
        const openCash = index === 0 ? input("startingCash") : `B${row - 1}`;
        const openDebt = index === 0 ? input("startingDebt") : `C${row - 1}`;
        const openInvestments = index === 0 ? input("startingInvestments") : `D${row - 1}`;
        const actualPayment = `MIN(${input("debtPayment")},${openDebt}+F${row})`;
        sheet.getRange(`A${row}`).values = [[month]];
        sheet.getRange(`F${row}`).formulas = [[`=${openDebt}*${input("annualDebtRate")}/12`]];
        sheet.getRange(`G${row}`).formulas = [[`=MAX(0,${actualPayment}-F${row})`]];
        sheet.getRange(`C${row}`).formulas = [[`=MAX(0,${openDebt}+F${row}-${actualPayment})`]];
        sheet.getRange(`H${row}`).formulas = [[`=${input("monthlyIncome")}-${input("essentialSpending")}-${input("flexibleSpending")}-${actualPayment}-${input("investmentContribution")}`]];
        sheet.getRange(`B${row}`).formulas = [[`=${openCash}+H${row}`]];
        sheet.getRange(`D${row}`).formulas = [[`=${openInvestments}*(1+${input("annualInvestmentReturn")}/12)+${input("investmentContribution")}`]];
        sheet.getRange(`E${row}`).formulas = [[`=B${row}+D${row}-C${row}`]];
        styleTableRow(sheet, row, [
          ["A", FORMATS.whole], ["B", FORMATS.amount], ["C", FORMATS.amount], ["D", FORMATS.amount],
          ["E", FORMATS.amount], ["F", FORMATS.amount], ["G", FORMATS.amount], ["H", FORMATS.amount],
        ]);
      });

      const lastRow = firstRow + 11;
      const metrics = writeScalarTable(sheet, {
        startRow: 34,
        rows: [
          { key: "endingInvestments", label: "Ending investments", formula: `=D${lastRow}`, unit: "LCY", help: "Balance after twelve contributions and returns", format: FORMATS.amount },
          { key: "debtReduced", label: "Debt reduced", formula: `=${input("startingDebt")}-C${lastRow}`, unit: "LCY", help: "Principal repaid during the year", format: FORMATS.amount },
          { key: "emergencyMonths", label: "Emergency cash", formula: `=IF(${input("essentialSpending")}=0,0,B${lastRow}/${input("essentialSpending")})`, unit: "months", help: "Ending cash divided by essential spending", format: FORMATS.decimal },
          { key: "totalPrincipal", label: "Total principal paid", formula: `=SUM(G${firstRow}:G${lastRow})`, unit: "LCY", help: "Debt payment less interest", format: FORMATS.amount },
          { key: "totalInterest", label: "Total debt interest", formula: `=SUM(F${firstRow}:F${lastRow})`, unit: "LCY", help: "Interest paid across the twelve-month path", format: FORMATS.amount },
          { key: "minimumCash", label: "Minimum cash balance", formula: `=MIN(B${firstRow}:B${lastRow})`, unit: "LCY", help: "Lowest cash point in the plan", format: FORMATS.amount, bold: true, fill: COLORS.paleBlue },
        ],
      });
      const kpiCells = writeKpis(sheet, [
        { label: "MONTH 1 CASH LEFT", formula: `=H${firstRow}`, format: FORMATS.amount },
        { label: "ENDING NET WORTH", formula: `=E${lastRow}`, format: FORMATS.amount },
        { label: "DEBT REDUCED", formula: `=${metrics.cell("debtReduced")}`, format: FORMATS.amount },
        { label: "ENDING CASH", formula: `=B${lastRow}`, format: FORMATS.amount },
      ]);
      writeOutcome(sheet, "A43:H44", `=IF(MIN(B${firstRow}:B${lastRow})<0,"CASH GAP · reduce spending or contributions","POSITIVE CASH PLAN · review the debt and savings mix")`);
      setFooter(sheet, 48, "H", `${model.title} · Cash allocation + twelve monthly balances · Educational planning only`);

      const rollForwardTerms = months.flatMap((month, index) => {
        const row = firstRow + index;
        const openCash = index === 0 ? input("startingCash") : `'Model'!B${row - 1}`;
        const openDebt = index === 0 ? input("startingDebt") : `'Model'!C${row - 1}`;
        const openInvestments = index === 0 ? input("startingInvestments") : `'Model'!D${row - 1}`;
        const actualPayment = `MIN(${input("debtPayment")},${openDebt}+'Model'!F${row})`;
        return [
          `ABS('Model'!B${row}-(${openCash}+'Model'!H${row}))`,
          `ABS('Model'!F${row}-${openDebt}*${input("annualDebtRate")}/12)`,
          `ABS('Model'!C${row}-MAX(0,${openDebt}+'Model'!F${row}-${actualPayment}))`,
          `ABS('Model'!D${row}-(${openInvestments}*(1+${input("annualInvestmentReturn")}/12)+${input("investmentContribution")}))`,
        ];
      });
      const cashAllocationTerms = months.map((month, index) => {
        const row = firstRow + index;
        const openDebt = index === 0 ? input("startingDebt") : `'Model'!C${row - 1}`;
        const actualPayment = `MIN(${input("debtPayment")},${openDebt}+'Model'!F${row})`;
        return `ABS('Model'!H${row}-(${input("monthlyIncome")}-${input("essentialSpending")}-${input("flexibleSpending")}-${actualPayment}-${input("investmentContribution")}))`;
      });
      const netWorthTerms = months.map((month, index) => {
        const row = firstRow + index;
        return `ABS('Model'!E${row}-'Model'!B${row}-'Model'!D${row}+'Model'!C${row})`;
      });
      const debtPaymentTerms = months.map((month, index) => {
        const row = firstRow + index;
        const openDebt = index === 0 ? input("startingDebt") : `'Model'!C${row - 1}`;
        const actualPayment = `MIN(${input("debtPayment")},${openDebt}+'Model'!F${row})`;
        return `ABS('Model'!G${row}-MAX(0,${actualPayment}-'Model'!F${row}))`;
      });
      return {
        kpiCells,
        outcomeCell: "A43",
        outcomeLabel: "NET WORTH OUTCOME",
        checks: [
          {
            label: "Budget and balance inputs are valid",
            actual: `=IF(AND(${input("monthlyIncome")}>=0,${input("essentialSpending")}>=0,${input("flexibleSpending")}>=0,${input("debtPayment")}>=0,${input("investmentContribution")}>=0,${input("startingCash")}>=0,${input("startingDebt")}>=0,${input("annualDebtRate")}>=0,${input("startingInvestments")}>=0,${input("annualInvestmentReturn")}>-1),1,0)`,
            expected: "=1",
            fix: "Inputs: budget and balances",
          },
          {
            label: "Balance roll-forwards tie",
            actual: `=SUM(${rollForwardTerms.join(",")})`,
            expected: "=0",
            fix: "Model: monthly roll-forward",
            format: FORMATS.amount,
          },
          {
            label: "Debt and principal stay non-negative",
            actual: `=IF(AND(MIN('Model'!C${firstRow}:C${lastRow})>=0,MIN('Model'!G${firstRow}:G${lastRow})>=0),1,0)`,
            expected: "=1",
            fix: "Inputs: debt payment and rate",
          },
          {
            label: "Monthly cash allocation ties",
            actual: `=SUM(${cashAllocationTerms.join(",")})`,
            expected: "=0",
            fix: "Model: monthly cash left",
            format: FORMATS.amount,
          },
          {
            label: "Monthly net worth ties",
            actual: `=SUM(${netWorthTerms.join(",")})`,
            expected: "=0",
            fix: "Model: cash + investments - debt",
            format: FORMATS.amount,
          },
          {
            label: "Principal follows payment after interest",
            actual: `=SUM(${debtPaymentTerms.join(",")})`,
            expected: "=0",
            fix: "Model: principal allocation",
            format: FORMATS.amount,
          },
          {
            label: "Planned monthly surplus setup ties",
            actual: "='Model'!B17-SUM('Model'!B12:B16)",
            expected: "=0",
            fix: "Model: monthly cash allocation setup",
            format: FORMATS.amount,
          },
          {
            label: "Annual budget summary ties to month 12",
            actual: `=SUM(ABS('Model'!${metrics.cell("endingInvestments")}-'Model'!D${lastRow}),ABS('Model'!${metrics.cell("debtReduced")}-${input("startingDebt")}+'Model'!C${lastRow}),ABS('Model'!${metrics.cell("totalPrincipal")}-SUM('Model'!G${firstRow}:G${lastRow})),ABS('Model'!${metrics.cell("totalInterest")}-SUM('Model'!F${firstRow}:F${lastRow})),ABS('Model'!${metrics.cell("minimumCash")}-MIN('Model'!B${firstRow}:B${lastRow})))`,
            expected: "=0",
            fix: "Model: annual budget summary",
            format: FORMATS.amount,
          },
        ],
      };
    },
  };

  const retirementScenarioPlanner = {
    slug: "retirement-scenario-planner",
    styleVariant: "option-c",
    decision: "Will savings support the planned withdrawal through the plan age?",
    horizon: "Up to 60 years",
    tags: ["Retirement", "Savings", "Drawdown"],
    included: [
      "One deterministic real-return path",
      "Contributions before retirement and a level net withdrawal",
      "Funding bridge plus seven visible age milestones",
    ],
    excluded: "Probability simulation, taxes, pensions, benefits, fees, product selection, and advice.",
    inputs: [
      { key: "currentAge", label: "Current age", value: 35, unit: "years", format: FORMATS.whole, help: "Age at the start of the plan" },
      { key: "retirementAge", label: "Retirement age", value: 65, unit: "years", format: FORMATS.whole, help: "First retirement year" },
      { key: "planAge", label: "Plan through age", value: 90, unit: "years", format: FORMATS.whole, help: "Last age included" },
      { key: "currentSavings", label: "Current savings", value: 120000, unit: "today's LCY", format: FORMATS.whole, help: "Invested balance now" },
      { key: "annualContribution", label: "Annual contribution", value: 15000, unit: "today's LCY", format: FORMATS.whole, help: "Paid before retirement" },
      { key: "nominalReturn", label: "Nominal return", value: 0.065, unit: "%", format: FORMATS.percent, help: "Annual investment return" },
      { key: "inflation", label: "Inflation", value: 0.025, unit: "%", format: FORMATS.percent, help: "Used to calculate the real return" },
      { key: "retirementSpending", label: "Retirement spending", value: 70000, unit: "today's LCY / year", format: FORMATS.whole, help: "Annual spending after retirement" },
      { key: "otherIncome", label: "Other retirement income", value: 10000, unit: "today's LCY / year", format: FORMATS.whole, help: "Pension or other annual income" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      const realReturn = `IF(OR(1+${input("nominalReturn")}<=0,1+${input("inflation")}<=0),0,(1+${input("nominalReturn")})/(1+${input("inflation")})-1)`;
      const netWithdrawal = `MAX(0,${input("retirementSpending")}-${input("otherIncome")})`;
      const yearsToRetirement = `MAX(0,MIN(60,ROUND(${input("retirementAge")}-${input("currentAge")},0)))`;
      const withdrawalYears = `MAX(0,MIN(61,ROUND(${input("planAge")}-${input("retirementAge")}+1,0)))`;
      setCanvas(sheet, "H", 40);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Deterministic plan in today's money`, "H");
      setSection(sheet, 10, "RETIREMENT FUNDING BRIDGE", "H");
      const metrics = writeScalarTable(sheet, {
        startRow: 11,
        rows: [
          { key: "realReturn", label: "Real annual return", formula: `=${realReturn}`, unit: "%", help: "Nominal return adjusted for inflation", format: FORMATS.percent },
          { key: "yearsToRetirement", label: "Years to retirement", formula: `=${yearsToRetirement}`, unit: "years", help: "Whole-year accumulation period", format: FORMATS.whole },
          { key: "retirementBalance", label: "Projected at retirement", formula: `=IF(B12=0,${input("currentSavings")}+${input("annualContribution")}*B13,${input("currentSavings")}*(1+B12)^B13+${input("annualContribution")}*((1+B12)^B13-1)/B12)`, unit: "today's LCY", help: "Savings plus end-of-year contributions", format: FORMATS.amount, bold: true, fill: COLORS.paleBlue },
          { key: "netWithdrawal", label: "Net annual withdrawal", formula: `=${netWithdrawal}`, unit: "today's LCY", help: "Spending less other income", format: FORMATS.amount },
          { key: "withdrawalYears", label: "Retirement years funded", formula: `=${withdrawalYears}`, unit: "years", help: "Retirement age through plan age", format: FORMATS.whole },
          { key: "requiredBalance", label: "Required at retirement", formula: `=IF(B15<=0,0,IF(B12=0,B15*B16,B15*(1-(1+B12)^(-B16))/B12))`, unit: "today's LCY", help: "Present value of level net withdrawals", format: FORMATS.amount, bold: true },
          { key: "fundingGap", label: "Retirement funding gap", formula: "=MAX(0,B17-B14)", unit: "today's LCY", help: "Required balance less projected balance", format: FORMATS.amount, bold: true, fill: COLORS.paleAmber },
          { key: "fundingSurplus", label: "Retirement funding surplus", formula: "=MAX(0,B14-B17)", unit: "today's LCY", help: "Projected balance above the requirement", format: FORMATS.amount },
          { key: "endingBalance", label: "Ending balance at plan age", formula: `=MAX(0,IF(B12=0,B14-B15*B16,B14*(1+B12)^B16-B15*((1+B12)^B16-1)/B12))`, unit: "today's LCY", help: "Balance after the final planned withdrawal", format: FORMATS.amount, bold: true, fill: COLORS.paleGreen },
          { key: "withdrawalRate", label: "Starting withdrawal rate", formula: "=IF(B14<=0,0,B15/B14)", unit: "%", help: "Net withdrawal divided by retirement balance", format: FORMATS.percent },
        ],
      });
      const kpiCells = writeKpis(sheet, [
        { label: "AT RETIREMENT", formula: `=${metrics.cell("retirementBalance")}`, format: FORMATS.amount },
        { label: "WITHDRAWAL RATE", formula: `=${metrics.cell("withdrawalRate")}`, format: FORMATS.percent },
        { label: "ENDING BALANCE", formula: `=${metrics.cell("endingBalance")}`, format: FORMATS.amount },
        { label: "FUNDING GAP", formula: `=${metrics.cell("fundingGap")}`, format: FORMATS.amount },
      ]);
      setSection(sheet, 23, "SEVEN-MILESTONE SAVING & DRAWDOWN PATH", "H");
      sheet.getRange("A24:H24").values = [["Age", "Milestone", null, "Years from today", "Annual saving / (withdrawal)", null, "Projected balance", null]];
      sheet.getRange("B24:C24").merge();
      sheet.getRange("E24:F24").merge();
      sheet.getRange("G24:H24").merge();
      sheet.getRange("A24:H24").format = {
        fill: OPTION_C.charcoalSoft,
        font: { bold: true, color: COLORS.white, fontSize: 9, typeface: "Aptos" },
        horizontalAlignment: "right",
        borders: { bottom: { style: "thin", color: OPTION_C.gold } },
      };
      sheet.getRange("B24:C24").format.horizontalAlignment = "left";
      const milestoneRows = [25, 26, 27, 28, 29, 30, 31];
      const milestoneNames = ["Today", "Early accumulation", "Late accumulation", "Retirement", "Early retirement", "Late retirement", "Plan age"];
      const ageFormulas = [
        `=${input("currentAge")}`,
        `=ROUND(${input("currentAge")}+(${input("retirementAge")}-${input("currentAge")})/3,0)`,
        `=ROUND(${input("currentAge")}+2*(${input("retirementAge")}-${input("currentAge")})/3,0)`,
        `=${input("retirementAge")}`,
        `=ROUND(${input("retirementAge")}+(${input("planAge")}-${input("retirementAge")})/3,0)`,
        `=ROUND(${input("retirementAge")}+2*(${input("planAge")}-${input("retirementAge")})/3,0)`,
        `=${input("planAge")}`,
      ];
      milestoneRows.forEach((row, index) => {
        sheet.getRange(`A${row}`).formulas = [[ageFormulas[index]]];
        mergeValue(sheet, `B${row}:C${row}`, milestoneNames[index]);
        sheet.getRange(`D${row}`).formulas = [[`=MAX(0,A${row}-${input("currentAge")})`]];
        mergeFormula(sheet, `E${row}:F${row}`, `=IF(A${row}<${input("retirementAge")},${input("annualContribution")},-${metrics.cell("netWithdrawal")})`);
        const accumulationYears = `MAX(0,A${row}-${input("currentAge")})`;
        const drawdownYears = `MAX(0,A${row}-${input("retirementAge")}+1)`;
        const accumulationBalance = `IF(${metrics.cell("realReturn")}=0,${input("currentSavings")}+${input("annualContribution")}*${accumulationYears},${input("currentSavings")}*(1+${metrics.cell("realReturn")})^${accumulationYears}+${input("annualContribution")}*((1+${metrics.cell("realReturn")})^${accumulationYears}-1)/${metrics.cell("realReturn")})`;
        const drawdownBalance = `MAX(0,IF(${metrics.cell("realReturn")}=0,${metrics.cell("retirementBalance")}-${metrics.cell("netWithdrawal")}*${drawdownYears},${metrics.cell("retirementBalance")}*(1+${metrics.cell("realReturn")})^${drawdownYears}-${metrics.cell("netWithdrawal")}*((1+${metrics.cell("realReturn")})^${drawdownYears}-1)/${metrics.cell("realReturn")}))`;
        mergeFormula(sheet, `G${row}:H${row}`, `=IF(A${row}<=${input("retirementAge")},${accumulationBalance},${drawdownBalance})`);
        sheet.getRange(`A${row}:H${row}`).format = {
          fill: index === 3 ? OPTION_C.paleGold : COLORS.white,
          font: { color: COLORS.ink, fontSize: 9, typeface: "Aptos" },
          borders: { preset: "bottom", style: "thin", color: COLORS.line },
        };
        sheet.getRange(`A${row}`).format.numberFormat = FORMATS.whole;
        sheet.getRange(`D${row}`).format.numberFormat = FORMATS.whole;
        sheet.getRange(`E${row}:H${row}`).format.numberFormat = FORMATS.amount;
        sheet.getRange(`A${row}:H${row}`).format.horizontalAlignment = "right";
        sheet.getRange(`B${row}:C${row}`).format.horizontalAlignment = "left";
      });
      writeOutcome(sheet, "A34:H35", `=IF(${metrics.cell("fundingGap")}<=0.01,"FUNDED IN THIS ONE PATH","FUNDING GAP · change saving, timing, return, or spending")`);
      setFooter(sheet, 40, "H", `${model.title} · Seven visible milestones · Deterministic education only`);

      return {
        kpiCells,
        outcomeCell: "A34",
        outcomeLabel: "RETIREMENT OUTCOME",
        checks: [
          {
            label: "Ages and planning inputs are valid",
            actual: `=IF(AND(${input("currentAge")}>=18,${input("currentAge")}<${input("retirementAge")},${input("retirementAge")}<=${input("planAge")},${input("planAge")}-${input("currentAge")}<=60,${input("planAge")}<=120,${input("currentAge")}=ROUND(${input("currentAge")},0),${input("retirementAge")}=ROUND(${input("retirementAge")},0),${input("planAge")}=ROUND(${input("planAge")},0),${input("currentSavings")}>=0,${input("annualContribution")}>=0,${input("nominalReturn")}>-1,${input("inflation")}>-1,${input("retirementSpending")}>=0,${input("otherIncome")}>=0),1,0)`,
            expected: "=1",
            fix: "Inputs: ages, rates, and amounts",
          },
          {
            label: "Retirement accumulation bridge ties",
            actual: `=${resultRef(metrics.cell("retirementBalance"))}`,
            expected: `=IF(${resultRef(metrics.cell("realReturn"))}=0,${input("currentSavings")}+${input("annualContribution")}*${resultRef(metrics.cell("yearsToRetirement"))},${input("currentSavings")}*(1+${resultRef(metrics.cell("realReturn"))})^${resultRef(metrics.cell("yearsToRetirement"))}+${input("annualContribution")}*((1+${resultRef(metrics.cell("realReturn"))})^${resultRef(metrics.cell("yearsToRetirement"))}-1)/${resultRef(metrics.cell("realReturn"))})`,
            fix: "Model: retirement accumulation",
            format: FORMATS.amount,
          },
          {
            label: "Funding bridge ties",
            actual: `=ABS(${resultRef(metrics.cell("requiredBalance"))}-${resultRef(metrics.cell("retirementBalance"))}-${resultRef(metrics.cell("fundingGap"))}+${resultRef(metrics.cell("fundingSurplus"))})+MAX(0,-${resultRef(metrics.cell("endingBalance"))})`,
            expected: "=0",
            fix: "Model: funding bridge",
            format: FORMATS.amount,
          },
          {
            label: "Real return traces to nominal return and inflation",
            actual: `=${resultRef(metrics.cell("realReturn"))}-IF(OR(1+${input("nominalReturn")}<=0,1+${input("inflation")}<=0),0,(1+${input("nominalReturn")})/(1+${input("inflation")})-1)`,
            expected: "=0",
            fix: "Model: real return",
            format: FORMATS.percent,
          },
          {
            label: "Retirement timing and net withdrawal trace",
            actual: `=SUM(ABS(${resultRef(metrics.cell("yearsToRetirement"))}-MAX(0,MIN(60,ROUND(${input("retirementAge")}-${input("currentAge")},0)))),ABS(${resultRef(metrics.cell("withdrawalYears"))}-MAX(0,MIN(61,ROUND(${input("planAge")}-${input("retirementAge")}+1,0)))),ABS(${resultRef(metrics.cell("netWithdrawal"))}-MAX(0,${input("retirementSpending")}-${input("otherIncome")})))`,
            expected: "=0",
            fix: "Model: timing and withdrawal",
            format: FORMATS.amount,
          },
          {
            label: "Required retirement balance traces",
            actual: `=${resultRef(metrics.cell("requiredBalance"))}-IF(${resultRef(metrics.cell("netWithdrawal"))}<=0,0,IF(${resultRef(metrics.cell("realReturn"))}=0,${resultRef(metrics.cell("netWithdrawal"))}*${resultRef(metrics.cell("withdrawalYears"))},${resultRef(metrics.cell("netWithdrawal"))}*(1-(1+${resultRef(metrics.cell("realReturn"))})^(-${resultRef(metrics.cell("withdrawalYears"))}))/${resultRef(metrics.cell("realReturn"))}))`,
            expected: "=0",
            fix: "Model: required retirement balance",
            format: FORMATS.amount,
          },
          {
            label: "Ending drawdown balance traces",
            actual: `=${resultRef(metrics.cell("endingBalance"))}-MAX(0,IF(${resultRef(metrics.cell("realReturn"))}=0,${resultRef(metrics.cell("retirementBalance"))}-${resultRef(metrics.cell("netWithdrawal"))}*${resultRef(metrics.cell("withdrawalYears"))},${resultRef(metrics.cell("retirementBalance"))}*(1+${resultRef(metrics.cell("realReturn"))})^${resultRef(metrics.cell("withdrawalYears"))}-${resultRef(metrics.cell("netWithdrawal"))}*((1+${resultRef(metrics.cell("realReturn"))})^${resultRef(metrics.cell("withdrawalYears"))}-1)/${resultRef(metrics.cell("realReturn"))}))`,
            expected: "=0",
            fix: "Model: retirement drawdown",
            format: FORMATS.amount,
          },
          {
            label: "Milestone path ties to key plan balances",
            actual: `=SUM(ABS('Model'!A25-${input("currentAge")}),ABS('Model'!A28-${input("retirementAge")}),ABS('Model'!A31-${input("planAge")}),ABS('Model'!G25-${input("currentSavings")}),ABS('Model'!G28-${resultRef(metrics.cell("retirementBalance"))}),ABS('Model'!G31-IF(${input("planAge")}=${input("retirementAge")},${resultRef(metrics.cell("retirementBalance"))},${resultRef(metrics.cell("endingBalance"))})))`,
            expected: "=0",
            fix: "Model: milestone path",
            format: FORMATS.amount,
          },
        ],
      };
    },
  };

  const pricingMarginWaterfall = {
    slug: "pricing-margin-waterfall",
    styleVariant: "option-c",
    decision: "Will one price change improve contribution after volume and cost effects?",
    horizon: "One current vs proposed case",
    tags: ["Pricing", "Margin", "Contribution"],
    included: [
      "One current offer and one proposed offer",
      "Direct volume response and unit-cost change",
      "Contribution uplift, break-even volume, and a visible driver waterfall",
    ],
    excluded: "Multiple products, elasticity estimation, freight layers, tax, transfer pricing, and competitor response.",
    inputs: [
      { key: "currentUnits", label: "Current units", value: 1000, unit: "units", format: FORMATS.whole, help: "Current sales volume" },
      { key: "currentPrice", label: "Current list price", value: 100, unit: "LCY / unit", format: FORMATS.amount, help: "Price before discounts" },
      { key: "currentLeakage", label: "Current discount + rebate", value: 0.1, unit: "%", format: FORMATS.percent, help: "Total price leakage" },
      { key: "currentUnitCost", label: "Current variable cost", value: 65, unit: "LCY / unit", format: FORMATS.amount, help: "All variable cost per unit" },
      { key: "priceChange", label: "Proposed price change", value: 0.05, unit: "%", format: FORMATS.percent, help: "Change from current list price" },
      { key: "volumeChange", label: "Expected volume change", value: -0.04, unit: "%", format: FORMATS.percent, help: "Direct expected response" },
      { key: "proposedLeakage", label: "Proposed discount + rebate", value: 0.09, unit: "%", format: FORMATS.percent, help: "Expected leakage after the action" },
      { key: "unitCostChange", label: "Expected unit-cost change", value: 0.02, unit: "%", format: FORMATS.percent, help: "Change from current variable cost" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      setCanvas(sheet, "H", 40);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Price, volume, and cost contribution bridge`, "H");
      setSection(sheet, 10, "CURRENT VS PROPOSED", "H");
      const bridge = writeScalarTable(sheet, {
        startRow: 11,
        rows: [
          { key: "currentNetPrice", label: "Current net price", formula: `=${input("currentPrice")}*(1-${input("currentLeakage")})`, unit: "LCY / unit", help: "List price after leakage", format: FORMATS.amount },
          { key: "currentRevenue", label: "Current net revenue", formula: `=${input("currentUnits")}*B12`, unit: "LCY", help: "Current units × net price", format: FORMATS.amount },
          { key: "currentContribution", label: "Current contribution", formula: `=${input("currentUnits")}*(B12-${input("currentUnitCost")})`, unit: "LCY", help: "Revenue less variable cost", format: FORMATS.amount, bold: true },
          { key: "currentMargin", label: "Current margin", formula: "=IF(B13=0,0,B14/B13)", unit: "%", help: "Contribution / revenue", format: FORMATS.percent },
          { key: "proposedUnits", label: "Proposed units", formula: `=MAX(0,${input("currentUnits")}*(1+${input("volumeChange")}))`, unit: "units", help: "Current units after expected response", format: FORMATS.whole },
          { key: "proposedNetPrice", label: "Proposed net price", formula: `=${input("currentPrice")}*(1+${input("priceChange")})*(1-${input("proposedLeakage")})`, unit: "LCY / unit", help: "Proposed list price after leakage", format: FORMATS.amount },
          { key: "proposedUnitCost", label: "Proposed variable cost", formula: `=${input("currentUnitCost")}*(1+${input("unitCostChange")})`, unit: "LCY / unit", help: "Current cost after the expected change", format: FORMATS.amount },
          { key: "proposedRevenue", label: "Proposed net revenue", formula: "=B16*B17", unit: "LCY", help: "Proposed units × proposed net price", format: FORMATS.amount },
          { key: "proposedContribution", label: "Proposed contribution", formula: "=B16*(B17-B18)", unit: "LCY", help: "Revenue less proposed variable cost", format: FORMATS.amount, bold: true, fill: COLORS.paleBlue },
          { key: "proposedMargin", label: "Proposed margin", formula: "=IF(B19=0,0,B20/B19)", unit: "%", help: "Proposed contribution / revenue", format: FORMATS.percent },
          { key: "uplift", label: "Contribution uplift", formula: "=B20-B14", unit: "LCY", help: "Proposed less current contribution", format: FORMATS.amount, bold: true },
          { key: "breakEvenVolume", label: "Break-even volume change", formula: `=IF(OR(${input("currentUnits")}<=0,B17-B18<=0),"",B14/((B17-B18)*${input("currentUnits")})-1)`, unit: "%", help: "Blank when the current volume or proposed unit contribution is not positive", format: FORMATS.percent },
        ],
      });
      const kpiCells = writeKpis(sheet, [
        { label: "CURRENT CONTRIBUTION", formula: `=${bridge.cell("currentContribution")}`, format: FORMATS.amount },
        { label: "PROPOSED CONTRIBUTION", formula: `=${bridge.cell("proposedContribution")}`, format: FORMATS.amount },
        { label: "UPLIFT", formula: `=${bridge.cell("uplift")}`, format: FORMATS.amount },
        { label: "PROPOSED MARGIN", formula: `=${bridge.cell("proposedMargin")}`, format: FORMATS.percent },
      ]);
      setSection(sheet, 25, "CONTRIBUTION DRIVER WATERFALL", "H");
      styleTableHeader(sheet, 26, ["Step", "Units", "Net price", "Unit cost", "Driver impact", "Cumulative", "Share of uplift", "Trace"]);
      const waterfallRows = [
        {
          row: 27,
          label: "Current contribution",
          units: `=${input("currentUnits")}`,
          netPrice: `=${bridge.cell("currentNetPrice")}`,
          unitCost: `=${input("currentUnitCost")}`,
          impact: "=0",
          cumulative: `=${bridge.cell("currentContribution")}`,
          share: "=0",
          trace: "BASE",
        },
        {
          row: 28,
          label: "Volume effect",
          units: `=${bridge.cell("proposedUnits")}`,
          netPrice: `=${bridge.cell("currentNetPrice")}`,
          unitCost: `=${input("currentUnitCost")}`,
          impact: `=(${bridge.cell("proposedUnits")}-${input("currentUnits")})*(${bridge.cell("currentNetPrice")}-${input("currentUnitCost")})`,
          cumulative: "=F27+E28",
          share: `=IF(${bridge.cell("uplift")}=0,0,E28/${bridge.cell("uplift")})`,
          trace: "UNIT VOLUME",
        },
        {
          row: 29,
          label: "Net-price effect",
          units: `=${bridge.cell("proposedUnits")}`,
          netPrice: `=${bridge.cell("proposedNetPrice")}`,
          unitCost: `=${input("currentUnitCost")}`,
          impact: `=${bridge.cell("proposedUnits")}*(${bridge.cell("proposedNetPrice")}-${bridge.cell("currentNetPrice")})`,
          cumulative: "=F28+E29",
          share: `=IF(${bridge.cell("uplift")}=0,0,E29/${bridge.cell("uplift")})`,
          trace: "PRICE + LEAKAGE",
        },
        {
          row: 30,
          label: "Unit-cost effect",
          units: `=${bridge.cell("proposedUnits")}`,
          netPrice: `=${bridge.cell("proposedNetPrice")}`,
          unitCost: `=${bridge.cell("proposedUnitCost")}`,
          impact: `=-${bridge.cell("proposedUnits")}*(${bridge.cell("proposedUnitCost")}-${input("currentUnitCost")})`,
          cumulative: "=F29+E30",
          share: `=IF(${bridge.cell("uplift")}=0,0,E30/${bridge.cell("uplift")})`,
          trace: "VARIABLE COST",
        },
        {
          row: 31,
          label: "Proposed contribution",
          units: `=${bridge.cell("proposedUnits")}`,
          netPrice: `=${bridge.cell("proposedNetPrice")}`,
          unitCost: `=${bridge.cell("proposedUnitCost")}`,
          impact: "=SUM(E28:E30)",
          cumulative: "=F30",
          share: `=IF(${bridge.cell("uplift")}=0,0,E31/${bridge.cell("uplift")})`,
          trace: "FINAL",
        },
      ];
      waterfallRows.forEach(({ row, label, units, netPrice, unitCost, impact, cumulative, share, trace }, index) => {
        sheet.getRange(`A${row}`).values = [[label]];
        sheet.getRange(`B${row}`).formulas = [[units]];
        sheet.getRange(`C${row}`).formulas = [[netPrice]];
        sheet.getRange(`D${row}`).formulas = [[unitCost]];
        sheet.getRange(`E${row}`).formulas = [[impact]];
        sheet.getRange(`F${row}`).formulas = [[cumulative]];
        sheet.getRange(`G${row}`).formulas = [[share]];
        sheet.getRange(`H${row}`).values = [[trace]];
        styleTableRow(sheet, row, [
          ["B", FORMATS.whole], ["C", FORMATS.amount], ["D", FORMATS.amount], ["E", FORMATS.amount],
          ["F", FORMATS.amount], ["G", FORMATS.percent],
        ]);
        if (index === 0 || index === waterfallRows.length - 1) {
          sheet.getRange(`A${row}:H${row}`).format.fill = OPTION_C.paleGold;
          sheet.getRange(`A${row}:H${row}`).format.font.bold = true;
        }
      });
      writeOutcome(sheet, "A34:H35", `=IF(${bridge.cell("proposedNetPrice")}-${bridge.cell("proposedUnitCost")}<=0,"NO POSITIVE UNIT CONTRIBUTION",IF(${bridge.cell("uplift")}>0,"CONTRIBUTION IMPROVES","CONTRIBUTION DECLINES"))`);
      setFooter(sheet, 40, "H", `${model.title} · Current-to-proposed contribution bridge · One price action`);
      return {
        kpiCells,
        outcomeCell: "A34",
        outcomeLabel: "PRICING OUTCOME",
        checks: [
          {
            label: "Pricing inputs are valid",
            actual: `=IF(AND(${input("currentUnits")}>=0,${input("currentPrice")}>=0,${input("currentUnitCost")}>=0,${input("currentLeakage")}>=0,${input("currentLeakage")}<=1,${input("proposedLeakage")}>=0,${input("proposedLeakage")}<=1,${input("priceChange")}>-1,${input("volumeChange")}>-1,${input("unitCostChange")}>-1),1,0)`,
            expected: "=1",
            fix: "Inputs: price, volume, and cost",
          },
          {
            label: "Current and proposed waterfalls tie",
            actual: `=ABS('Model'!${bridge.cell("currentContribution")}-('Model'!${bridge.cell("currentRevenue")}-${input("currentUnits")}*${input("currentUnitCost")}))+ABS('Model'!${bridge.cell("proposedContribution")}-('Model'!${bridge.cell("proposedRevenue")}-'Model'!${bridge.cell("proposedUnits")}*'Model'!${bridge.cell("proposedUnitCost")}))`,
            expected: "=0",
            fix: "Model: contribution bridge",
            format: FORMATS.amount,
          },
          {
            label: "Contribution driver waterfall ties",
            actual: `=ABS('Model'!${bridge.cell("uplift")}-SUM('Model'!E28:E30))+ABS('Model'!${bridge.cell("proposedContribution")}-'Model'!F31)`,
            expected: "=0",
            fix: "Model: volume, net-price, and unit-cost bridge",
            format: FORMATS.amount,
          },
          {
            label: "Current net price and revenue trace",
            actual: `=SUM(ABS('Model'!${bridge.cell("currentNetPrice")}-${input("currentPrice")}*(1-${input("currentLeakage")})),ABS('Model'!${bridge.cell("currentRevenue")}-${input("currentUnits")}*'Model'!${bridge.cell("currentNetPrice")}))`,
            expected: "=0",
            fix: "Model: current price and revenue",
            format: FORMATS.amount,
          },
          {
            label: "Proposed volume, price, and cost trace",
            actual: `=SUM(ABS('Model'!${bridge.cell("proposedUnits")}-MAX(0,${input("currentUnits")}*(1+${input("volumeChange")}))),ABS('Model'!${bridge.cell("proposedNetPrice")}-${input("currentPrice")}*(1+${input("priceChange")})*(1-${input("proposedLeakage")})),ABS('Model'!${bridge.cell("proposedUnitCost")}-${input("currentUnitCost")}*(1+${input("unitCostChange")})))`,
            expected: "=0",
            fix: "Model: proposed drivers",
            format: FORMATS.amount,
          },
          {
            label: "Current and proposed margin ratios tie",
            actual: `=SUM(ABS('Model'!${bridge.cell("currentMargin")}-IF('Model'!${bridge.cell("currentRevenue")}=0,0,'Model'!${bridge.cell("currentContribution")}/'Model'!${bridge.cell("currentRevenue")})),ABS('Model'!${bridge.cell("proposedMargin")}-IF('Model'!${bridge.cell("proposedRevenue")}=0,0,'Model'!${bridge.cell("proposedContribution")}/'Model'!${bridge.cell("proposedRevenue")})))`,
            expected: "=0",
            fix: "Model: contribution margins",
            format: FORMATS.percent,
          },
          {
            label: "Break-even volume formula traces",
            actual: `=IF(OR(${input("currentUnits")}<=0,'Model'!${bridge.cell("proposedNetPrice")}-'Model'!${bridge.cell("proposedUnitCost")}<=0),IF('Model'!${bridge.cell("breakEvenVolume")}="",0,1),ABS('Model'!${bridge.cell("breakEvenVolume")}-('Model'!${bridge.cell("currentContribution")}/(('Model'!${bridge.cell("proposedNetPrice")}-'Model'!${bridge.cell("proposedUnitCost")})*${input("currentUnits")})-1)))`,
            expected: "=0",
            fix: "Model: break-even volume",
            format: FORMATS.percent,
          },
          {
            label: "Waterfall cumulative contribution chain ties",
            actual: "=SUM(ABS('Model'!F28-'Model'!F27-'Model'!E28),ABS('Model'!F29-'Model'!F28-'Model'!E29),ABS('Model'!F30-'Model'!F29-'Model'!E30),ABS('Model'!F31-'Model'!F30))",
            expected: "=0",
            fix: "Model: cumulative contribution waterfall",
            format: FORMATS.amount,
          },
        ],
      };
    },
  };

  const saasUnitEconomics = {
    slug: "saas-unit-economics",
    styleVariant: "option-c",
    decision: "Does a steady growth plan create efficient ARR without using too much cash?",
    horizon: "12 months",
    tags: ["ARR", "Unit economics", "Cash runway"],
    included: [
      "One steady twelve-month customer plan",
      "ARR, CAC, LTV/CAC, payback, and burn",
      "Monthly MRR, ARR, EBITDA, and cash roll-forward plus an annual bridge",
    ],
    excluded: "Cohorts, expansion, contraction, funding rounds, deferred revenue, GAAP revenue, and fundraising advice.",
    inputs: [
      { key: "openingMrr", label: "Opening MRR", value: 60, unit: "LCY 000 / month", format: FORMATS.amount, help: "Recurring revenue at the start" },
      { key: "newCustomers", label: "New customers", value: 5, unit: "per month", format: FORMATS.whole, help: "Same acquisition pace each month" },
      { key: "arpa", label: "Monthly ARPA", value: 1, unit: "LCY 000 / customer", format: FORMATS.amount, help: "Average recurring revenue per customer" },
      { key: "monthlyChurn", label: "Monthly churn", value: 0.03, unit: "%", format: FORMATS.percent, help: "Applied to customers and MRR" },
      { key: "grossMargin", label: "Gross margin", value: 0.8, unit: "%", format: FORMATS.percent, help: "Recurring revenue less cost of service" },
      { key: "salesMarketing", label: "Sales & marketing", value: 30, unit: "LCY 000 / month", format: FORMATS.amount, help: "Monthly acquisition spend" },
      { key: "otherOpex", label: "Other operating expense", value: 50, unit: "LCY 000 / month", format: FORMATS.amount, help: "All other monthly opex" },
      { key: "openingCash", label: "Opening cash", value: 300, unit: "LCY 000", format: FORMATS.amount, help: "Cash available at the start" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      const firstRow = 12;
      const months = Array.from({ length: 12 }, (_, index) => index + 1);
      const lastRow = firstRow + 11;
      setCanvas(sheet, "H", 47);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Monthly customer, recurring-revenue, and cash path`, "H");
      setSection(sheet, 10, "MONTHLY CUSTOMER, MRR & CASH SCHEDULE", "H");
      styleTableHeader(sheet, 11, ["Month", "Customers", "MRR", "ARR", "CAC", "LTV / CAC", "EBITDA", "Cash"]);

      months.forEach((month, index) => {
        const row = firstRow + index;
        const openingCustomers = index === 0 ? `IF(${input("arpa")}<=0,0,${input("openingMrr")}/${input("arpa")})` : `B${row - 1}`;
        const openingMrr = index === 0 ? input("openingMrr") : `C${row - 1}`;
        sheet.getRange(`A${row}`).values = [[month]];
        sheet.getRange(`B${row}`).formulas = [[`=MAX(0,${openingCustomers}+${input("newCustomers")}-${openingCustomers}*${input("monthlyChurn")})`]];
        sheet.getRange(`C${row}`).formulas = [[`=MAX(0,${openingMrr}+${input("newCustomers")}*${input("arpa")}-${openingMrr}*${input("monthlyChurn")})`]];
        sheet.getRange(`D${row}`).formulas = [[`=C${row}*12`]];
        sheet.getRange(`E${row}`).formulas = [[`=IF(${input("newCustomers")}=0,0,${input("salesMarketing")}/${input("newCustomers")})`]];
        sheet.getRange(`F${row}`).formulas = [[`=IF(OR(${input("monthlyChurn")}<=0,E${row}=0),0,(${input("arpa")}*${input("grossMargin")}/${input("monthlyChurn")})/E${row})`]];
        sheet.getRange(`G${row}`).formulas = [[`=C${row}*${input("grossMargin")}-${input("salesMarketing")}-${input("otherOpex")}`]];
        sheet.getRange(`H${row}`).formulas = [[index === 0 ? `=${input("openingCash")}+G${row}` : `=H${row - 1}+G${row}`]];
        styleTableRow(sheet, row, [
          ["A", FORMATS.whole], ["B", FORMATS.decimal], ["C", FORMATS.amount], ["D", FORMATS.amount],
          ["E", FORMATS.amount], ["F", FORMATS.multiple], ["G", FORMATS.amount], ["H", FORMATS.amount],
        ]);
      });

      const churnTerms = months.map((month, index) => {
        const row = firstRow + index;
        const openingMrr = index === 0 ? input("openingMrr") : `C${row - 1}`;
        return `${openingMrr}*${input("monthlyChurn")}`;
      });
      setSection(sheet, 25, "ANNUAL MRR & CASH BRIDGE", "H");
      const metrics = writeScalarTable(sheet, {
        startRow: 26,
        rows: [
          { key: "endingMrr", label: "Ending MRR", formula: `=C${lastRow}`, unit: "LCY 000 / month", help: "Recurring revenue in month 12", format: FORMATS.amount },
          { key: "grossNewMrr", label: "Gross new MRR added", formula: `=12*${input("newCustomers")}*${input("arpa")}`, unit: "LCY 000", help: "Twelve months of gross customer additions × ARPA", format: FORMATS.amount },
          { key: "churnedMrr", label: "MRR lost to churn", formula: `=SUM(${churnTerms.join(",")})`, unit: "LCY 000", help: "Monthly opening MRR × churn rate", format: FORMATS.amount },
          { key: "netNewArr", label: "Net new ARR", formula: `=(B27-${input("openingMrr")})*12`, unit: "LCY 000", help: "Ending MRR less opening MRR, annualized", format: FORMATS.amount, bold: true, fill: COLORS.paleBlue },
          { key: "totalGrossProfit", label: "Twelve-month gross profit", formula: `=SUM(C${firstRow}:C${lastRow})*${input("grossMargin")}`, unit: "LCY 000", help: "Monthly MRR × gross margin across the plan", format: FORMATS.amount },
          { key: "totalSalesMarketing", label: "Sales & marketing spend", formula: `=12*${input("salesMarketing")}`, unit: "LCY 000", help: "Monthly acquisition spend across twelve months", format: FORMATS.amount },
          { key: "totalOtherOpex", label: "Other operating spend", formula: `=12*${input("otherOpex")}`, unit: "LCY 000", help: "Monthly other opex across twelve months", format: FORMATS.amount },
          { key: "totalEbitda", label: "Twelve-month EBITDA", formula: `=SUM(G${firstRow}:G${lastRow})`, unit: "LCY 000", help: "Gross profit less sales & marketing and other opex", format: FORMATS.amount, bold: true },
          { key: "payback", label: "CAC payback", formula: `=IF(${input("arpa")}*${input("grossMargin")}=0,0,E${lastRow}/(${input("arpa")}*${input("grossMargin")}))`, unit: "months", help: "CAC divided by monthly gross profit per customer", format: FORMATS.decimal },
          { key: "totalBurn", label: "Total burn", formula: `=-SUMIF(G${firstRow}:G${lastRow},"<0",G${firstRow}:G${lastRow})`, unit: "LCY 000", help: "Sum of negative monthly EBITDA", format: FORMATS.amount },
          { key: "burnMultiple", label: "Burn multiple", formula: "=IF(B30<=0,\"N/A\",B36/B30)", unit: "x", help: "Total burn divided by net new ARR; N/A when ARR does not grow", format: FORMATS.multiple },
          { key: "cashOutMonth", label: "First negative-cash month", formula: `=IF(COUNTIF(H${firstRow}:H${lastRow},"<0")=0,0,MINIFS(A${firstRow}:A${lastRow},H${firstRow}:H${lastRow},"<0"))`, unit: "month", help: "Zero means cash stays positive", format: FORMATS.whole },
          { key: "closingCash", label: "Closing cash", formula: `=H${lastRow}`, unit: "LCY 000", help: "Opening cash plus the twelve monthly EBITDA results", format: FORMATS.amount, bold: true, fill: COLORS.paleGreen },
        ],
      });
      const kpiCells = writeKpis(sheet, [
        { label: "ENDING ARR", formula: `=D${lastRow}`, format: FORMATS.amount },
        { label: "LTV / CAC", formula: `=F${lastRow}`, format: FORMATS.multiple },
        { label: "CAC PAYBACK", formula: `=${metrics.cell("payback")}`, format: FORMATS.decimal },
        { label: "CLOSING CASH", formula: `=H${lastRow}`, format: FORMATS.amount },
      ]);
      writeOutcome(sheet, "A42:H43", `=IF(${metrics.cell("cashOutMonth")}>0,"CASH RUNS OUT IN THE PLAN",IF(H${lastRow}<${input("openingCash")},"CASH DECLINES · monitor runway","CASH GROWS IN THIS PLAN"))`);
      setFooter(sheet, 47, "H", `${model.title} · Twelve monthly periods + annual MRR and cash bridge`);

      const arrTerms = months.map((month, index) => {
        const row = firstRow + index;
        return `ABS('Model'!D${row}-'Model'!C${row}*12)`;
      });
      const cashTerms = months.map((month, index) => {
        const row = firstRow + index;
        const openingCash = index === 0 ? input("openingCash") : `'Model'!H${row - 1}`;
        return `ABS('Model'!H${row}-(${openingCash}+'Model'!G${row}))`;
      });
      const customerTerms = months.map((month, index) => {
        const row = firstRow + index;
        const openingCustomers = index === 0 ? `IF(${input("arpa")}<=0,0,${input("openingMrr")}/${input("arpa")})` : `'Model'!B${row - 1}`;
        return `ABS('Model'!B${row}-MAX(0,${openingCustomers}+${input("newCustomers")}-${openingCustomers}*${input("monthlyChurn")}))`;
      });
      const mrrTerms = months.map((month, index) => {
        const row = firstRow + index;
        const openingMrr = index === 0 ? input("openingMrr") : `'Model'!C${row - 1}`;
        return `ABS('Model'!C${row}-MAX(0,${openingMrr}+${input("newCustomers")}*${input("arpa")}-${openingMrr}*${input("monthlyChurn")}))`;
      });
      const cacTerms = months.map((month, index) => {
        const row = firstRow + index;
        return `ABS('Model'!E${row}-IF(${input("newCustomers")}=0,0,${input("salesMarketing")}/${input("newCustomers")}))`;
      });
      const ltvTerms = months.map((month, index) => {
        const row = firstRow + index;
        return `ABS('Model'!F${row}-IF(OR(${input("monthlyChurn")}<=0,'Model'!E${row}=0),0,(${input("arpa")}*${input("grossMargin")}/${input("monthlyChurn")})/'Model'!E${row}))`;
      });
      const ebitdaTerms = months.map((month, index) => {
        const row = firstRow + index;
        return `ABS('Model'!G${row}-('Model'!C${row}*${input("grossMargin")}-${input("salesMarketing")}-${input("otherOpex")}))`;
      });
      return {
        kpiCells,
        outcomeCell: "A42",
        outcomeLabel: "SAAS RUNWAY OUTCOME",
        checks: [
          {
            label: "SaaS assumptions are valid",
            actual: `=IF(AND(${input("openingMrr")}>=0,${input("newCustomers")}>=0,${input("arpa")}>0,${input("monthlyChurn")}>0,${input("monthlyChurn")}<=1,${input("grossMargin")}>=0,${input("grossMargin")}<=1,${input("salesMarketing")}>=0,${input("otherOpex")}>=0,${input("openingCash")}>=0),1,0)`,
            expected: "=1",
            fix: "Inputs: growth, churn, and spend",
          },
          {
            label: "ARR equals MRR × 12",
            actual: `=SUM(${arrTerms.join(",")})`,
            expected: "=0",
            fix: "Model: ARR roll-forward",
            format: FORMATS.amount,
          },
          {
            label: "Customer, MRR, cash, and annual bridges tie",
            actual: `=SUM(${cashTerms.join(",")})+SUM(${customerTerms.join(",")})+SUM(${mrrTerms.join(",")})+ABS('Model'!${metrics.cell("endingMrr")}-${input("openingMrr")}-'Model'!${metrics.cell("grossNewMrr")}+'Model'!${metrics.cell("churnedMrr")})+ABS('Model'!${metrics.cell("totalEbitda")}-'Model'!${metrics.cell("totalGrossProfit")}+'Model'!${metrics.cell("totalSalesMarketing")}+'Model'!${metrics.cell("totalOtherOpex")})+MAX(0,-MIN('Model'!B${firstRow}:B${lastRow}))+MAX(0,-MIN('Model'!C${firstRow}:C${lastRow}))`,
            expected: "=0",
            fix: "Model: customers, MRR, EBITDA, and cash",
            format: FORMATS.amount,
          },
          {
            label: "Monthly CAC traces to acquisition spend",
            actual: `=SUM(${cacTerms.join(",")})`,
            expected: "=0",
            fix: "Model: CAC schedule",
            format: FORMATS.amount,
          },
          {
            label: "Monthly LTV / CAC traces",
            actual: `=SUM(${ltvTerms.join(",")})`,
            expected: "=0",
            fix: "Model: LTV / CAC schedule",
            format: FORMATS.multiple,
          },
          {
            label: "Monthly EBITDA traces",
            actual: `=SUM(${ebitdaTerms.join(",")})`,
            expected: "=0",
            fix: "Model: monthly EBITDA",
            format: FORMATS.amount,
          },
          {
            label: "CAC payback summary traces",
            actual: `='Model'!${metrics.cell("payback")}-IF(${input("arpa")}*${input("grossMargin")}=0,0,'Model'!E${lastRow}/(${input("arpa")}*${input("grossMargin")}))`,
            expected: "=0",
            fix: "Model: CAC payback",
            format: FORMATS.decimal,
          },
          {
            label: "Burn, runway, and closing-cash summaries trace",
            actual: `=ABS('Model'!${metrics.cell("totalBurn")}+SUMIF('Model'!G${firstRow}:G${lastRow},"<0",'Model'!G${firstRow}:G${lastRow}))+IF('Model'!${metrics.cell("netNewArr")}<=0,IF('Model'!${metrics.cell("burnMultiple")}="N/A",0,1),ABS('Model'!${metrics.cell("burnMultiple")}-'Model'!${metrics.cell("totalBurn")}/'Model'!${metrics.cell("netNewArr")}))+ABS('Model'!${metrics.cell("cashOutMonth")}-IF(COUNTIF('Model'!H${firstRow}:H${lastRow},"<0")=0,0,MINIFS('Model'!A${firstRow}:A${lastRow},'Model'!H${firstRow}:H${lastRow},"<0")))+ABS('Model'!${metrics.cell("closingCash")}-'Model'!H${lastRow})`,
            expected: "=0",
            fix: "Model: burn and cash summaries",
            format: FORMATS.amount,
          },
        ],
      };
    },
  };

  return [
    fxExposureHedge,
    eclCreditStress,
    marketPortfolioStress,
    debtSculptingWaterfall,
    personalBudgetNetWorth,
    retirementScenarioPlanner,
    pricingMarginWaterfall,
    saasUnitEconomics,
  ];
};
