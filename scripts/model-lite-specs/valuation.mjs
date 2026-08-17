export const createValuationSpecs = (api) => {
  const {
    COLORS,
    FORMATS,
    inputRef,
    mergeFormula,
    mergeValue,
    setCanvas,
    setFooter,
    setSection,
    setTitle,
    writeKpis,
    writeScalarTable,
  } = api;

  const resultRef = (cell) => `'Model'!${cell}`;
  const resultRange = (start, end) => `'Model'!${start}:${end}`;
  const fiveYearPeriods = ["BASE / ENTRY", "YEAR 1", "YEAR 2", "YEAR 3", "YEAR 4", "YEAR 5"];
  const forecastIndexes = [1, 2, 3, 4, 5];

  const optionCColors = {
    charcoal: COLORS.charcoal || "#30273A",
    charcoalSoft: COLORS.charcoalSoft || "#493C50",
    gold: COLORS.gold || "#B88A2A",
    paleGold: COLORS.paleGold || "#F7F0DC",
    line: COLORS.line || "#D8E1EC",
    ink: COLORS.ink || "#172033",
    muted: COLORS.muted || "#5D6878",
    white: COLORS.white || "#FFFFFF",
  };

  const columnName = (index) => {
    let value = index + 1;
    let name = "";
    while (value > 0) {
      const remainder = (value - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      value = Math.floor((value - 1) / 26);
    }
    return name;
  };

  const writeAnalystSchedule = (sheet, config) => {
    const {
      startRow,
      periods,
      rows,
      noteColumnWidth = 30,
      noteCharsPerLine = 24,
      noteLineHeight = 14,
      maxNoteHeight = 72,
    } = config;
    const periodColumns = periods.map((_, index) => columnName(index + 1));
    const noteColumn = columnName(periods.length + 1);
    const rowByKey = new Map(rows.map((row, index) => [row.key, startRow + 1 + index]));
    const cell = (key, periodIndex) => `${periodColumns[periodIndex]}${rowByKey.get(key)}`;
    const context = (periodIndex) => ({
      periodIndex,
      cell,
      column: periodColumns[periodIndex],
      previousColumn: periodIndex > 0 ? periodColumns[periodIndex - 1] : null,
    });

    sheet.getRange(`A${startRow}:${noteColumn}${startRow}`).values = [["Metric", ...periods, "How to read it"]];
    sheet.getRange(`A${startRow}:${noteColumn}${startRow}`).format = {
      fill: optionCColors.charcoal,
      font: { bold: true, color: optionCColors.white, fontSize: 9, typeface: "Aptos" },
      horizontalAlignment: "right",
      borders: { preset: "bottom", style: "medium", color: optionCColors.gold },
    };
    sheet.getRange(`A${startRow}`).format.horizontalAlignment = "left";
    sheet.getRange(`${noteColumn}${startRow}`).format.horizontalAlignment = "left";
    sheet.getRange(`${noteColumn}1:${noteColumn}${startRow + rows.length}`).format.columnWidth = noteColumnWidth;

    rows.forEach((row, rowIndex) => {
      const targetRow = startRow + 1 + rowIndex;
      const note = row.note || "";
      const noteLines = Math.max(1, Math.ceil(note.length / noteCharsPerLine));
      sheet.getRange(`A${targetRow}:${noteColumn}${targetRow}`).format.rowHeight = Math.min(maxNoteHeight, Math.max(22, noteLines * noteLineHeight));
      sheet.getRange(`A${targetRow}`).values = [[row.label]];
      periods.forEach((_, periodIndex) => {
        const target = cell(row.key, periodIndex);
        const rawFormula = row.formula(context(periodIndex));
        const isControlRow = /(?:check|control)$/i.test(row.key) || /\b(?:check|control)\b/i.test(row.label);
        const formula = isControlRow && rawFormula.startsWith("=")
          ? `=ROUND(${rawFormula.slice(1)},6)`
          : rawFormula;
        sheet.getRange(target).formulas = [[formula]];
        sheet.getRange(target).format = {
          font: {
            bold: Boolean(row.bold),
            color: row.linked ? (COLORS.green || "#008000") : optionCColors.ink,
            fontSize: 9,
            typeface: "Aptos",
          },
          numberFormat: row.format || FORMATS.amount,
          horizontalAlignment: "right",
        };
      });
      sheet.getRange(`${noteColumn}${targetRow}`).values = [[note]];
      sheet.getRange(`${noteColumn}${targetRow}`).format = {
        font: { color: optionCColors.muted, fontSize: 8, typeface: "Aptos" },
        wrapText: true,
        horizontalAlignment: "left",
      };
      sheet.getRange(`A${targetRow}:${noteColumn}${targetRow}`).format.fill = row.fill || optionCColors.white;
      sheet.getRange(`A${targetRow}:${noteColumn}${targetRow}`).format.borders = {
        preset: "bottom",
        style: "thin",
        color: optionCColors.line,
      };
      if (row.bold) sheet.getRange(`A${targetRow}:${noteColumn}${targetRow}`).format.font.bold = true;
    });

    return {
      cell,
      lastColumn: noteColumn,
      lastPeriodColumn: periodColumns.at(-1),
      lastRow: startRow + rows.length,
      periods,
    };
  };

  const writeCue = (sheet, address, text) => {
    mergeValue(sheet, address, text).format = {
      fill: optionCColors.paleGold,
      font: { color: optionCColors.gold, fontSize: 9, typeface: "Aptos" },
      wrapText: true,
      borders: { preset: "outside", style: "thin", color: optionCColors.gold },
    };
  };

  const writeOutcome = (sheet, address, formula) => {
    mergeFormula(sheet, address, formula).format = {
      fill: optionCColors.paleGold,
      font: { bold: true, color: optionCColors.gold, fontSize: 9, typeface: "Aptos" },
      horizontalAlignment: "center",
      verticalAlignment: "center",
      wrapText: true,
      borders: { preset: "outside", style: "thin", color: optionCColors.gold },
    };
  };

  const maxModelAbs = (cells) => `=MAX(${cells.map((cell) => `ABS(${resultRef(cell)})`).join(",")})`;
  const minModel = (cells) => `=MIN(${cells.map((cell) => resultRef(cell)).join(",")})`;

  const tradingComps = {
    slug: "trading-comps",
    styleVariant: "option-c",
    checkLimit: 10,
    decision: "What share price does the peer set imply as EBITDA and net debt evolve over five years?",
    horizon: "Base plus five forecast years",
    tags: ["Comps", "EV / EBITDA", "Share price"],
    included: [
      "Visible peer calibration and five-year EBITDA schedule",
      "Multiple ramp and enterprise-to-equity bridge",
      "Net-debt roll-forward, implied share price, and upside",
    ],
    excluded: "Full peer financial statements, other valuation multiples, transaction premiums, and valuation advice.",
    inputs: [
      { key: "peerA", label: "Peer A EV / EBITDA", value: 20.2, unit: "x", format: FORMATS.multiple, help: "First selected comparable" },
      { key: "peerB", label: "Peer B EV / EBITDA", value: 20.1, unit: "x", format: FORMATS.multiple, help: "Second selected comparable" },
      { key: "peerC", label: "Peer C EV / EBITDA", value: 15.7, unit: "x", format: FORMATS.multiple, help: "Third selected comparable" },
      { key: "targetEbitda", label: "Target base EBITDA", value: 96, unit: "LCY m", format: FORMATS.amount, help: "Base-year earnings used to seed the schedule" },
      { key: "ebitdaGrowth", label: "Annual EBITDA growth", value: 0.05, unit: "%", format: FORMATS.percent, help: "Applied consistently through Year 5" },
      { key: "yearFiveMultiple", label: "Year-5 applied multiple", value: 18, unit: "x", format: FORMATS.multiple, help: "The peer median fades to this exit level" },
      { key: "netDebt", label: "Opening net debt", value: 125, unit: "LCY m", format: FORMATS.amount, help: "Debt less cash at the base date" },
      { key: "annualNetDebtReduction", label: "Annual net-debt reduction", value: 10, unit: "LCY m", format: FORMATS.amount, help: "Capped at the balance outstanding" },
      { key: "shares", label: "Diluted shares", value: 75, unit: "m", format: FORMATS.amount, help: "Held constant in this simple bridge" },
      { key: "currentPrice", label: "Current share price", value: 18, unit: "LCY", format: FORMATS.perShare, help: "Reference price for upside" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      setCanvas(sheet, "H", 47);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Five-year analyst valuation bridge`, "H");

      setSection(sheet, 10, "PEER CALIBRATION", "H");
      const peers = writeScalarTable(sheet, {
        startRow: 11,
        rows: [
          { key: "peerA", label: "Peer A EV / EBITDA", formula: `=${input("peerA")}`, unit: "x", help: "Selected comparable", format: FORMATS.multiple },
          { key: "peerB", label: "Peer B EV / EBITDA", formula: `=${input("peerB")}`, unit: "x", help: "Selected comparable", format: FORMATS.multiple },
          { key: "peerC", label: "Peer C EV / EBITDA", formula: `=${input("peerC")}`, unit: "x", help: "Selected comparable", format: FORMATS.multiple },
          { key: "low", label: "Peer low", formula: "=MIN(B12:B14)", unit: "x", help: "Lowest selected multiple", format: FORMATS.multiple },
          { key: "median", label: "Peer median", formula: "=MEDIAN(B12:B14)", unit: "x", help: "Starting applied multiple", format: FORMATS.multiple, bold: true, fill: optionCColors.paleGold },
          { key: "high", label: "Peer high", formula: "=MAX(B12:B14)", unit: "x", help: "Highest selected multiple", format: FORMATS.multiple },
        ],
      });

      setSection(sheet, 19, "FIVE-YEAR VALUE BRIDGE", "H");
      const schedule = writeAnalystSchedule(sheet, {
        startRow: 20,
        periods: fiveYearPeriods,
        rows: [
          { key: "ebitda", label: "Target EBITDA", format: FORMATS.amount, bold: true, note: "Base EBITDA compounds at the selected annual rate.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("targetEbitda")}` : `=${cell("ebitda", periodIndex - 1)}*(1+${input("ebitdaGrowth")})` },
          { key: "multiple", label: "Applied EV / EBITDA", format: FORMATS.multiple, bold: true, fill: optionCColors.paleGold, note: "Straight-line fade from peer median to the Year-5 multiple.", formula: ({ periodIndex }) => periodIndex === 0 ? `=${peers.cell("median")}` : `=${peers.cell("median")}+(${input("yearFiveMultiple")}-${peers.cell("median")})*${periodIndex}/5` },
          { key: "enterpriseValue", label: "Enterprise value", format: FORMATS.amount, note: "EBITDA multiplied by the applied multiple.", formula: ({ periodIndex, cell }) => `=${cell("ebitda", periodIndex)}*${cell("multiple", periodIndex)}` },
          { key: "netDebt", label: "Net debt", format: FORMATS.amount, note: "Opening balance less the annual reduction; floored at zero.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("netDebt")}` : `=MAX(0,${cell("netDebt", periodIndex - 1)}-${input("annualNetDebtReduction")})` },
          { key: "equityValue", label: "Equity value", format: FORMATS.amount, bold: true, note: "Enterprise value less net debt.", formula: ({ periodIndex, cell }) => `=${cell("enterpriseValue", periodIndex)}-${cell("netDebt", periodIndex)}` },
          { key: "shares", label: "Diluted shares", format: FORMATS.amount, note: "Held constant in this focused valuation bridge.", formula: () => `=${input("shares")}` },
          { key: "sharePrice", label: "Implied share price", format: FORMATS.perShare, bold: true, fill: COLORS.paleGreen, note: "Equity value divided by diluted shares.", formula: ({ periodIndex, cell }) => `=IF(${cell("shares", periodIndex)}<=0,0,${cell("equityValue", periodIndex)}/${cell("shares", periodIndex)})` },
          { key: "upside", label: "Upside / (downside)", format: FORMATS.percent, bold: true, note: "Implied price compared with the current share price.", formula: ({ periodIndex, cell }) => `=IF(${input("currentPrice")}<=0,0,${cell("sharePrice", periodIndex)}/${input("currentPrice")}-1)` },
          { key: "ebitdaCheck", label: "EBITDA roll-forward check", format: FORMATS.amount, note: "Must equal zero in every forecast year.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=${cell("ebitda", periodIndex)}-${cell("ebitda", periodIndex - 1)}*(1+${input("ebitdaGrowth")})` },
          { key: "multipleCheck", label: "Multiple ramp check", format: FORMATS.multiple, note: "Must equal zero against the visible ramp.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("multiple", 0)}-${peers.cell("median")}` : `=${cell("multiple", periodIndex)}-${peers.cell("median")}-(${input("yearFiveMultiple")}-${peers.cell("median")})*${periodIndex}/5` },
          { key: "netDebtCheck", label: "Net-debt roll-forward check", format: FORMATS.amount, note: "Must equal zero after the debt floor.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("netDebt", 0)}-${input("netDebt")}` : `=${cell("netDebt", periodIndex)}-MAX(0,${cell("netDebt", periodIndex - 1)}-${input("annualNetDebtReduction")})` },
          { key: "valueCheck", label: "EV and equity bridge check", format: FORMATS.amount, note: "Combines the enterprise and equity bridge controls.", formula: ({ periodIndex, cell }) => `=ABS(${cell("enterpriseValue", periodIndex)}-${cell("ebitda", periodIndex)}*${cell("multiple", periodIndex)})+ABS(${cell("equityValue", periodIndex)}-${cell("enterpriseValue", periodIndex)}+${cell("netDebt", periodIndex)})` },
          { key: "priceCheck", label: "Per-share bridge check", format: FORMATS.perShare, note: "Must equal zero when the share denominator is positive.", formula: ({ periodIndex, cell }) => `=${cell("sharePrice", periodIndex)}-IF(${cell("shares", periodIndex)}<=0,0,${cell("equityValue", periodIndex)}/${cell("shares", periodIndex)})` },
        ],
      });

      const final = 5;
      const kpiCells = writeKpis(sheet, [
        { label: "YEAR-5 MULTIPLE", formula: `=${schedule.cell("multiple", final)}`, format: FORMATS.multiple },
        { label: "YEAR-5 SHARE PRICE", formula: `=${schedule.cell("sharePrice", final)}`, format: FORMATS.perShare },
        { label: "YEAR-5 UPSIDE", formula: `=${schedule.cell("upside", final)}`, format: FORMATS.percent },
        { label: "YEAR-5 EQUITY VALUE", formula: `=${schedule.cell("equityValue", final)}`, format: FORMATS.amount },
      ]);
      writeOutcome(sheet, "A36:H38", `=IF(${schedule.cell("upside", final)}>=0,"YEAR-5 IMPLIED UPSIDE OF "&TEXT(${schedule.cell("upside", final)},"0.0%"),"YEAR-5 IMPLIED DOWNSIDE OF "&TEXT(ABS(${schedule.cell("upside", final)}),"0.0%"))&" · challenge growth, multiple fade, and net debt"`);
      setFooter(sheet, 47, "H", `${model.title} · Option C standard · Base + five years`);

      const forecastCells = (key) => forecastIndexes.map((index) => schedule.cell(key, index));
      return {
        kpiCells,
        outcomeCell: "A36",
        outcomeLabel: "VALUATION OUTCOME",
        checks: [
          { label: "Peer and valuation inputs are valid", actual: `=IF(AND(MIN(${input("peerA")},${input("peerB")},${input("peerC")})>0,${input("targetEbitda")}>0,${input("ebitdaGrowth")}>-1,${input("yearFiveMultiple")}>0,${input("netDebt")}>=0,${input("annualNetDebtReduction")}>=0,${input("shares")}>0,${input("currentPrice")}>0),1,0)`, expected: "=1", fix: "Inputs: peer, operating, and bridge assumptions" },
          { label: "Peer statistics are ordered", actual: `=IF(AND(${resultRef(peers.cell("low"))}<=${resultRef(peers.cell("median"))},${resultRef(peers.cell("median"))}<=${resultRef(peers.cell("high"))}),1,0)`, expected: "=1", fix: "Model: peer calibration" },
          { label: "EBITDA roll-forward ties", actual: maxModelAbs(forecastCells("ebitdaCheck")), expected: "=0", tolerance: 0.01, fix: "Model: EBITDA schedule", format: FORMATS.amount },
          { label: "Applied multiple ramp ties", actual: maxModelAbs(forecastCells("multipleCheck")), expected: "=0", tolerance: 0.001, fix: "Model: multiple ramp", format: FORMATS.multiple },
          { label: "Net-debt roll-forward ties", actual: maxModelAbs(forecastCells("netDebtCheck")), expected: "=0", tolerance: 0.01, fix: "Model: net-debt schedule", format: FORMATS.amount },
          { label: "EV and equity bridges tie", actual: maxModelAbs(forecastCells("valueCheck")), expected: "=0", tolerance: 0.01, fix: "Model: value bridge", format: FORMATS.amount },
          { label: "Per-share bridge ties", actual: maxModelAbs(forecastCells("priceCheck")), expected: "=0", tolerance: 0.001, fix: "Model: per-share bridge", format: FORMATS.perShare },
          { label: "Year-5 endpoint ties", actual: `=${resultRef(schedule.cell("multiple", final))}`, expected: `=${input("yearFiveMultiple")}`, tolerance: 0.001, fix: "Inputs: Year-5 multiple", format: FORMATS.multiple },
        ],
      };
    },
  };

  const maAccretionDilution = {
    slug: "ma-accretion-dilution",
    styleVariant: "option-c",
    checkLimit: 10,
    decision: "How do funding, synergy capture, and debt paydown affect EPS accretion over five years?",
    horizon: "Base plus five forecast years",
    tags: ["M&A", "EPS", "Funding mix"],
    included: [
      "Cash-and-stock consideration bridge",
      "Five-year earnings, synergy, and acquisition-debt schedule",
      "Pro forma EPS and accretion / dilution by year",
    ],
    excluded: "Detailed purchase accounting, goodwill impairment, integration workstreams, tax attributes, and transaction advice.",
    inputs: [
      { key: "buyerNetIncome", label: "Buyer base net income", value: 220, unit: "LCY m", format: FORMATS.amount, help: "Standalone earnings at entry" },
      { key: "buyerGrowth", label: "Buyer net-income growth", value: 0.04, unit: "%", format: FORMATS.percent, help: "Applied annually through Year 5" },
      { key: "buyerShares", label: "Buyer diluted shares", value: 100, unit: "m", format: FORMATS.amount, help: "Standalone shares" },
      { key: "buyerPrice", label: "Buyer share price", value: 25, unit: "LCY", format: FORMATS.perShare, help: "Stock consideration price" },
      { key: "targetNetIncome", label: "Target base net income", value: 55, unit: "LCY m", format: FORMATS.amount, help: "Target standalone earnings" },
      { key: "targetGrowth", label: "Target net-income growth", value: 0.05, unit: "%", format: FORMATS.percent, help: "Applied annually through Year 5" },
      { key: "purchaseValue", label: "Purchase equity value", value: 720, unit: "LCY m", format: FORMATS.amount, help: "Total offer value" },
      { key: "cashMix", label: "Cash consideration", value: 0.6, unit: "%", format: FORMATS.percent, help: "Stock funds the remainder" },
      { key: "fundingRate", label: "Acquisition debt rate", value: 0.07, unit: "%", format: FORMATS.percent, help: "Applied to average acquisition debt" },
      { key: "annualDebtRepayment", label: "Annual acquisition-debt repayment", value: 50, unit: "LCY m", format: FORMATS.amount, help: "Capped at debt outstanding" },
      { key: "taxRate", label: "Tax rate", value: 0.21, unit: "%", format: FORMATS.percent, help: "Applied to synergy and interest" },
      { key: "yearOneSynergy", label: "Year-1 pretax synergies", value: 17.5, unit: "LCY m", format: FORMATS.amount, help: "First-year captured benefit" },
      { key: "yearFiveSynergy", label: "Year-5 pretax synergies", value: 35, unit: "LCY m", format: FORMATS.amount, help: "Straight-line ramp endpoint" },
      { key: "otherDealCosts", label: "Year-1 after-tax deal costs", value: 33.8, unit: "LCY m", format: FORMATS.amount, help: "One-time PPA, fees, and lost yield" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      setCanvas(sheet, "H", 54);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Five-year EPS and funding bridge`, "H");

      setSection(sheet, 10, "CONSIDERATION & SHARE ISSUANCE", "H");
      const funding = writeScalarTable(sheet, {
        startRow: 11,
        rows: [
          { key: "cashAmount", label: "Cash consideration", formula: `=${input("purchaseValue")}*${input("cashMix")}`, unit: "LCY m", help: "Acquisition debt funded", format: FORMATS.amount },
          { key: "stockAmount", label: "Stock consideration", formula: `=${input("purchaseValue")}-B12`, unit: "LCY m", help: "Offer value not funded with cash", format: FORMATS.amount },
          { key: "newShares", label: "New buyer shares", formula: `=IF(${input("buyerPrice")}<=0,0,B13/${input("buyerPrice")})`, unit: "m", help: "Stock consideration / buyer price", format: FORMATS.amount, bold: true },
          { key: "proFormaShares", label: "Pro forma diluted shares", formula: `=${input("buyerShares")}+B14`, unit: "m", help: "Buyer shares plus issued shares", format: FORMATS.amount, bold: true, fill: optionCColors.paleGold },
        ],
      });

      setSection(sheet, 18, "FIVE-YEAR ACCRETION / DILUTION", "H");
      const schedule = writeAnalystSchedule(sheet, {
        startRow: 19,
        periods: fiveYearPeriods,
        rows: [
          { key: "buyerIncome", label: "Buyer net income", format: FORMATS.amount, note: "Standalone buyer earnings compound annually.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("buyerNetIncome")}` : `=${cell("buyerIncome", periodIndex - 1)}*(1+${input("buyerGrowth")})` },
          { key: "targetIncome", label: "Target net income", format: FORMATS.amount, note: "Standalone target earnings compound annually.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("targetNetIncome")}` : `=${cell("targetIncome", periodIndex - 1)}*(1+${input("targetGrowth")})` },
          { key: "pretaxSynergy", label: "Pretax synergies", format: FORMATS.amount, note: "Straight-line ramp from Year 1 to Year 5.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=${input("yearOneSynergy")}+(${input("yearFiveSynergy")}-${input("yearOneSynergy")})*(${periodIndex}-1)/4` },
          { key: "afterTaxSynergy", label: "After-tax synergies", format: FORMATS.amount, note: "Pretax synergies after the selected tax rate.", formula: ({ periodIndex, cell }) => `=${cell("pretaxSynergy", periodIndex)}*(1-${input("taxRate")})` },
          { key: "openingDebt", label: "Opening acquisition debt", format: FORMATS.amount, note: "Cash consideration is drawn at entry; later years roll from prior close.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : periodIndex === 1 ? `=${funding.cell("cashAmount")}` : `=${cell("closingDebt", periodIndex - 1)}` },
          { key: "repayment", label: "Debt repayment", format: FORMATS.amount, note: "Positive schedule amount; capped at opening debt.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=MIN(MAX(0,${cell("openingDebt", periodIndex)}),MAX(0,${input("annualDebtRepayment")}))` },
          { key: "closingDebt", label: "Closing acquisition debt", format: FORMATS.amount, bold: true, fill: optionCColors.paleGold, note: "Opening acquisition debt less repayment.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${funding.cell("cashAmount")}` : `=MAX(0,${cell("openingDebt", periodIndex)}-${cell("repayment", periodIndex)})` },
          { key: "averageDebt", label: "Average acquisition debt", format: FORMATS.amount, note: "Average opening and closing balance for interest.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("closingDebt", 0)}` : `=AVERAGE(${cell("openingDebt", periodIndex)},${cell("closingDebt", periodIndex)})` },
          { key: "afterTaxInterest", label: "After-tax funding cost", format: FORMATS.amount, note: "Average debt × rate × (1 − tax rate).", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=${cell("averageDebt", periodIndex)}*${input("fundingRate")}*(1-${input("taxRate")})` },
          { key: "dealCosts", label: "After-tax deal costs", format: FORMATS.amount, note: "One-time cost in Year 1 only.", formula: ({ periodIndex }) => periodIndex === 1 ? `=${input("otherDealCosts")}` : "=0" },
          { key: "proFormaIncome", label: "Pro forma net income", format: FORMATS.amount, bold: true, note: "Buyer + target + synergy − funding cost − deal costs.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("buyerIncome", 0)}` : `=${cell("buyerIncome", periodIndex)}+${cell("targetIncome", periodIndex)}+${cell("afterTaxSynergy", periodIndex)}-${cell("afterTaxInterest", periodIndex)}-${cell("dealCosts", periodIndex)}` },
          { key: "standaloneEps", label: "Buyer standalone EPS", format: FORMATS.perShare, note: "Buyer net income / original diluted shares.", formula: ({ periodIndex, cell }) => `=IF(${input("buyerShares")}<=0,0,${cell("buyerIncome", periodIndex)}/${input("buyerShares")})` },
          { key: "proFormaEps", label: "Pro forma EPS", format: FORMATS.perShare, bold: true, fill: COLORS.paleGreen, note: "Pro forma net income / pro forma diluted shares.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("standaloneEps", 0)}` : `=IF(${funding.cell("proFormaShares")}<=0,0,${cell("proFormaIncome", periodIndex)}/${funding.cell("proFormaShares")})` },
          { key: "accretion", label: "EPS accretion / (dilution)", format: FORMATS.percent, bold: true, note: "Pro forma EPS relative to standalone buyer EPS.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=IF(${cell("standaloneEps", periodIndex)}=0,0,${cell("proFormaEps", periodIndex)}/${cell("standaloneEps", periodIndex)}-1)` },
          { key: "debtCheck", label: "Debt roll-forward check", format: FORMATS.amount, note: "Must equal zero in every forecast year.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("closingDebt", 0)}-${funding.cell("cashAmount")}` : `=${cell("closingDebt", periodIndex)}-${cell("openingDebt", periodIndex)}+${cell("repayment", periodIndex)}` },
          { key: "incomeCheck", label: "Net-income bridge check", format: FORMATS.amount, note: "Must equal zero against the visible earnings bridge.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=${cell("proFormaIncome", periodIndex)}-${cell("buyerIncome", periodIndex)}-${cell("targetIncome", periodIndex)}-${cell("afterTaxSynergy", periodIndex)}+${cell("afterTaxInterest", periodIndex)}+${cell("dealCosts", periodIndex)}` },
          { key: "epsCheck", label: "EPS bridge check", format: FORMATS.perShare, note: "Must equal zero against pro forma income and shares.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=${cell("proFormaEps", periodIndex)}-IF(${funding.cell("proFormaShares")}<=0,0,${cell("proFormaIncome", periodIndex)}/${funding.cell("proFormaShares")})` },
        ],
      });

      const final = 5;
      const kpiCells = writeKpis(sheet, [
        { label: "YEAR-5 EPS A / (D)", formula: `=${schedule.cell("accretion", final)}`, format: FORMATS.percent },
        { label: "YEAR-5 PRO FORMA EPS", formula: `=${schedule.cell("proFormaEps", final)}`, format: FORMATS.perShare },
        { label: "NEW SHARES", formula: `=${funding.cell("newShares")}`, format: FORMATS.amount },
        { label: "YEAR-5 ACQUISITION DEBT", formula: `=${schedule.cell("closingDebt", final)}`, format: FORMATS.amount },
      ]);
      writeOutcome(sheet, "A39:H41", `=IF(${schedule.cell("accretion", final)}>=0,"YEAR-5 ACCRETIVE · challenge timing and funding assumptions","YEAR-5 DILUTIVE · review price, mix, synergies, and costs")`);
      setFooter(sheet, 54, "H", `${model.title} · Option C standard · Base + five years`);

      const forecastCells = (key) => forecastIndexes.map((index) => schedule.cell(key, index));
      return {
        kpiCells,
        outcomeCell: "A39",
        outcomeLabel: "EPS OUTCOME",
        checks: [
          { label: "Funding, growth, and tax inputs are valid", actual: `=IF(AND(${input("buyerNetIncome")}>=0,${input("buyerGrowth")}>-1,${input("buyerShares")}>0,${input("buyerPrice")}>0,${input("targetNetIncome")}>=0,${input("targetGrowth")}>-1,${input("purchaseValue")}>=0,${input("cashMix")}>=0,${input("cashMix")}<=1,${input("fundingRate")}>=0,${input("annualDebtRepayment")}>=0,${input("taxRate")}>=0,${input("taxRate")}<1,${input("yearOneSynergy")}>=0,${input("yearFiveSynergy")}>=0,${input("otherDealCosts")}>=0),1,0)`, expected: "=1", fix: "Inputs: operating, funding, tax, and synergy assumptions" },
          { label: "Consideration bridge ties", actual: `=${resultRef(funding.cell("cashAmount"))}+${resultRef(funding.cell("stockAmount"))}`, expected: `=${input("purchaseValue")}`, tolerance: 0.01, fix: "Model: consideration bridge", format: FORMATS.amount },
          { label: "Share issuance bridge ties", actual: `=${resultRef(funding.cell("newShares"))}`, expected: `=IF(${input("buyerPrice")}<=0,0,${resultRef(funding.cell("stockAmount"))}/${input("buyerPrice")})`, tolerance: 0.001, fix: "Model: share issuance", format: FORMATS.amount },
          { label: "Acquisition-debt roll-forward ties", actual: maxModelAbs(forecastCells("debtCheck")), expected: "=0", tolerance: 0.01, fix: "Model: acquisition debt", format: FORMATS.amount },
          { label: "Pro forma income bridge ties", actual: maxModelAbs(forecastCells("incomeCheck")), expected: "=0", tolerance: 0.01, fix: "Model: net-income bridge", format: FORMATS.amount },
          { label: "Pro forma EPS bridge ties", actual: maxModelAbs(forecastCells("epsCheck")), expected: "=0", tolerance: 0.001, fix: "Model: EPS bridge", format: FORMATS.perShare },
          { label: "Synergy ramp reaches Year 5", actual: `=${resultRef(schedule.cell("pretaxSynergy", final))}`, expected: `=${input("yearFiveSynergy")}`, tolerance: 0.01, fix: "Inputs: synergy ramp", format: FORMATS.amount },
          { label: "Debt and shares remain non-negative", actual: `=IF(AND(${minModel(forecastCells("closingDebt")).slice(1)}>=0,${resultRef(funding.cell("proFormaShares"))}>0),1,0)`, expected: "=1", fix: "Model: debt and share schedules" },
        ],
      };
    },
  };

  const debtCovenant = {
    slug: "debt-covenant-model",
    styleVariant: "option-c",
    checkLimit: 10,
    decision: "Does the five-year forecast remain inside leverage, coverage, and DSCR covenants?",
    horizon: "Base plus five forecast years",
    tags: ["Debt", "Covenants", "DSCR"],
    included: [
      "Five-year EBITDA and debt roll-forward",
      "Interest, CFADS, and debt-service bridge",
      "Leverage, coverage, DSCR, and covenant headroom by year",
    ],
    excluded: "Multiple tranches, revolver mechanics, legal covenant definitions, cure rights, and refinancing advice.",
    inputs: [
      { key: "openingDebt", label: "Opening gross debt", value: 310, unit: "LCY m", format: FORMATS.amount, help: "Debt at the base date" },
      { key: "annualNewBorrowing", label: "Annual new borrowing", value: 0, unit: "LCY m", format: FORMATS.amount, help: "Repeated in each forecast year" },
      { key: "ebitda", label: "Base covenant EBITDA", value: 105, unit: "LCY m", format: FORMATS.amount, help: "Starting covenant earnings base" },
      { key: "ebitdaGrowth", label: "Annual EBITDA growth", value: 0.04, unit: "%", format: FORMATS.percent, help: "Applied consistently through Year 5" },
      { key: "interestRate", label: "Cash interest rate", value: 0.075, unit: "%", format: FORMATS.percent, help: "Applied to average debt" },
      { key: "capex", label: "Annual cash capex", value: 24, unit: "LCY m", format: FORMATS.amount, help: "Recurring annual cash spend" },
      { key: "nwc", label: "Annual increase in NWC", value: 5, unit: "LCY m", format: FORMATS.amount, help: "Recurring cash absorbed" },
      { key: "cashTax", label: "Annual cash tax", value: 12, unit: "LCY m", format: FORMATS.amount, help: "Recurring cash tax" },
      { key: "principal", label: "Annual contractual principal", value: 22, unit: "LCY m", format: FORMATS.amount, help: "Capped at debt available" },
      { key: "maxLeverage", label: "Maximum gross leverage", value: 3.25, unit: "x", format: FORMATS.multiple, help: "Closing debt / EBITDA limit" },
      { key: "minCoverage", label: "Minimum interest coverage", value: 3, unit: "x", format: FORMATS.multiple, help: "EBITDA / interest floor" },
      { key: "minDscr", label: "Minimum DSCR", value: 1.25, unit: "x", format: FORMATS.multiple, help: "CFADS / debt service floor" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      setCanvas(sheet, "H", 48);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Five-year covenant forecast`, "H");
      setSection(sheet, 10, "DEBT, CASH FLOW & COVENANTS", "H");
      const schedule = writeAnalystSchedule(sheet, {
        startRow: 11,
        periods: fiveYearPeriods,
        rows: [
          { key: "ebitda", label: "Covenant EBITDA", format: FORMATS.amount, bold: true, note: "Base EBITDA compounds at the selected growth rate.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("ebitda")}` : `=${cell("ebitda", periodIndex - 1)}*(1+${input("ebitdaGrowth")})` },
          { key: "openingDebt", label: "Opening debt", format: FORMATS.amount, note: "Each forecast year opens at the prior-year closing balance.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("openingDebt")}` : `=${cell("closingDebt", periodIndex - 1)}` },
          { key: "newBorrowing", label: "New borrowing", format: FORMATS.amount, note: "Positive financing inflow repeated annually.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=${input("annualNewBorrowing")}` },
          { key: "principalPaid", label: "Principal paid", format: FORMATS.amount, note: "Capped at opening debt plus new borrowing.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=MIN(MAX(0,${cell("openingDebt", periodIndex)}+${cell("newBorrowing", periodIndex)}),MAX(0,${input("principal")}))` },
          { key: "closingDebt", label: "Closing debt", format: FORMATS.amount, bold: true, fill: optionCColors.paleGold, note: "Opening debt + borrowing − principal paid.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("openingDebt")}` : `=MAX(0,${cell("openingDebt", periodIndex)}+${cell("newBorrowing", periodIndex)}-${cell("principalPaid", periodIndex)})` },
          { key: "averageDebt", label: "Average debt", format: FORMATS.amount, note: "Average opening and closing balance for cash interest.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("openingDebt", 0)}` : `=AVERAGE(${cell("openingDebt", periodIndex)},${cell("closingDebt", periodIndex)})` },
          { key: "cashInterest", label: "Cash interest", format: FORMATS.amount, note: "Average debt multiplied by the cash interest rate.", formula: ({ periodIndex, cell }) => `=${cell("averageDebt", periodIndex)}*MAX(0,${input("interestRate")})` },
          { key: "capex", label: "Cash capex", format: FORMATS.amount, note: "Recurring annual cash use.", formula: () => `=${input("capex")}` },
          { key: "nwc", label: "Increase in NWC", format: FORMATS.amount, note: "Recurring annual working-capital use.", formula: () => `=${input("nwc")}` },
          { key: "cashTax", label: "Cash tax", format: FORMATS.amount, note: "Recurring annual cash tax.", formula: () => `=${input("cashTax")}` },
          { key: "cfads", label: "CFADS", format: FORMATS.amount, bold: true, fill: COLORS.paleGreen, note: "EBITDA less capex, NWC investment, and cash tax.", formula: ({ periodIndex, cell }) => `=${cell("ebitda", periodIndex)}-${cell("capex", periodIndex)}-${cell("nwc", periodIndex)}-${cell("cashTax", periodIndex)}` },
          { key: "debtService", label: "Debt service", format: FORMATS.amount, note: "Cash interest plus principal paid.", formula: ({ periodIndex, cell }) => `=${cell("cashInterest", periodIndex)}+${cell("principalPaid", periodIndex)}` },
          { key: "leverage", label: "Gross leverage", format: FORMATS.multiple, bold: true, note: "Closing debt / covenant EBITDA.", formula: ({ periodIndex, cell }) => `=IF(${cell("ebitda", periodIndex)}<=0,0,${cell("closingDebt", periodIndex)}/${cell("ebitda", periodIndex)})` },
          { key: "coverage", label: "Interest coverage", format: FORMATS.multiple, bold: true, note: "Covenant EBITDA / cash interest.", formula: ({ periodIndex, cell }) => `=IF(${cell("cashInterest", periodIndex)}<=0,0,${cell("ebitda", periodIndex)}/${cell("cashInterest", periodIndex)})` },
          { key: "dscr", label: "DSCR", format: FORMATS.multiple, bold: true, fill: COLORS.paleGreen, note: "CFADS / debt service.", formula: ({ periodIndex, cell }) => `=IF(${cell("debtService", periodIndex)}<=0,0,${cell("cfads", periodIndex)}/${cell("debtService", periodIndex)})` },
          { key: "leverageHeadroom", label: "Leverage headroom", format: FORMATS.multiple, note: "Positive means leverage is below the limit.", formula: ({ periodIndex, cell }) => `=${input("maxLeverage")}-${cell("leverage", periodIndex)}` },
          { key: "coverageHeadroom", label: "Coverage headroom", format: FORMATS.multiple, note: "Positive means coverage is above the floor.", formula: ({ periodIndex, cell }) => `=${cell("coverage", periodIndex)}-${input("minCoverage")}` },
          { key: "dscrHeadroom", label: "DSCR headroom", format: FORMATS.multiple, note: "Positive means DSCR is above the floor.", formula: ({ periodIndex, cell }) => `=${cell("dscr", periodIndex)}-${input("minDscr")}` },
          { key: "compliance", label: "All covenants passed", format: FORMATS.whole, bold: true, note: "One means all three selected thresholds pass.", formula: ({ periodIndex, cell }) => `=IF(AND(${cell("leverageHeadroom", periodIndex)}>=0,${cell("coverageHeadroom", periodIndex)}>=0,${cell("dscrHeadroom", periodIndex)}>=0),1,0)` },
          { key: "debtCheck", label: "Debt roll-forward check", format: FORMATS.amount, note: "Must equal zero.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("closingDebt", 0)}-${input("openingDebt")}` : `=${cell("closingDebt", periodIndex)}-${cell("openingDebt", periodIndex)}-${cell("newBorrowing", periodIndex)}+${cell("principalPaid", periodIndex)}` },
          { key: "interestCheck", label: "Interest calculation check", format: FORMATS.amount, note: "Must equal zero against average debt × rate.", formula: ({ periodIndex, cell }) => `=${cell("cashInterest", periodIndex)}-${cell("averageDebt", periodIndex)}*MAX(0,${input("interestRate")})` },
          { key: "cfadsCheck", label: "CFADS bridge check", format: FORMATS.amount, note: "Must equal zero against EBITDA and cash uses.", formula: ({ periodIndex, cell }) => `=${cell("cfads", periodIndex)}-${cell("ebitda", periodIndex)}+${cell("capex", periodIndex)}+${cell("nwc", periodIndex)}+${cell("cashTax", periodIndex)}` },
          { key: "serviceCheck", label: "Debt-service bridge check", format: FORMATS.amount, note: "Must equal zero against interest and principal.", formula: ({ periodIndex, cell }) => `=${cell("debtService", periodIndex)}-${cell("cashInterest", periodIndex)}-${cell("principalPaid", periodIndex)}` },
          { key: "ratioCheck", label: "Covenant-ratio check", format: FORMATS.decimal, note: "Combined leverage, coverage, and DSCR formula control.", formula: ({ periodIndex, cell }) => `=ABS(${cell("leverage", periodIndex)}-IF(${cell("ebitda", periodIndex)}<=0,0,${cell("closingDebt", periodIndex)}/${cell("ebitda", periodIndex)}))+ABS(${cell("coverage", periodIndex)}-IF(${cell("cashInterest", periodIndex)}<=0,0,${cell("ebitda", periodIndex)}/${cell("cashInterest", periodIndex)}))+ABS(${cell("dscr", periodIndex)}-IF(${cell("debtService", periodIndex)}<=0,0,${cell("cfads", periodIndex)}/${cell("debtService", periodIndex)}))` },
        ],
      });

      const forecastCells = (key) => forecastIndexes.map((index) => schedule.cell(key, index));
      const final = 5;
      const kpiCells = writeKpis(sheet, [
        { label: "MINIMUM DSCR", formula: `=MIN(${resultRange(schedule.cell("dscr", 1), schedule.cell("dscr", final))})`, format: FORMATS.multiple },
        { label: "MAXIMUM LEVERAGE", formula: `=MAX(${resultRange(schedule.cell("leverage", 1), schedule.cell("leverage", final))})`, format: FORMATS.multiple },
        { label: "MINIMUM COVERAGE", formula: `=MIN(${resultRange(schedule.cell("coverage", 1), schedule.cell("coverage", final))})`, format: FORMATS.multiple },
        { label: "YEAR-5 DEBT", formula: `=${schedule.cell("closingDebt", final)}`, format: FORMATS.amount },
      ]);
      writeOutcome(sheet, "A38:H40", `=IF(MIN(${schedule.cell("compliance", 1)}:${schedule.cell("compliance", final)})=1,"WITHIN SELECTED COVENANTS IN ALL YEARS","COVENANT BREACH · inspect the first failed year")`);
      setFooter(sheet, 48, "H", `${model.title} · Option C standard · Base + five years`);

      return {
        kpiCells,
        outcomeCell: "A38",
        outcomeLabel: "COVENANT OUTCOME",
        checks: [
          { label: "Debt, cash-flow, and threshold inputs are valid", actual: `=IF(AND(${input("openingDebt")}>=0,${input("annualNewBorrowing")}>=0,${input("ebitda")}>0,${input("ebitdaGrowth")}>-1,${input("interestRate")}>=0,${input("capex")}>=0,${input("nwc")}>=0,${input("cashTax")}>=0,${input("principal")}>=0,${input("maxLeverage")}>0,${input("minCoverage")}>0,${input("minDscr")}>0),1,0)`, expected: "=1", fix: "Inputs: debt, cash flow, and covenant assumptions" },
          { label: "Debt roll-forward ties", actual: maxModelAbs(forecastCells("debtCheck")), expected: "=0", tolerance: 0.01, fix: "Model: debt schedule", format: FORMATS.amount },
          { label: "Interest calculation ties", actual: maxModelAbs(forecastCells("interestCheck")), expected: "=0", tolerance: 0.01, fix: "Model: interest schedule", format: FORMATS.amount },
          { label: "CFADS bridge ties", actual: maxModelAbs(forecastCells("cfadsCheck")), expected: "=0", tolerance: 0.01, fix: "Model: CFADS bridge", format: FORMATS.amount },
          { label: "Debt-service bridge ties", actual: maxModelAbs(forecastCells("serviceCheck")), expected: "=0", tolerance: 0.01, fix: "Model: debt service", format: FORMATS.amount },
          { label: "Covenant ratios recalculate", actual: maxModelAbs(forecastCells("ratioCheck")), expected: "=0", tolerance: 0.001, fix: "Model: covenant ratios", format: FORMATS.decimal },
          { label: "Debt remains non-negative", actual: `=IF(${minModel(forecastCells("closingDebt")).slice(1)}>=0,1,0)`, expected: "=1", fix: "Model: debt schedule" },
          { label: "Compliance flags are complete", actual: `=COUNT(${forecastCells("compliance").map(resultRef).join(",")})`, expected: "=5", fix: "Model: covenant flags" },
        ],
      };
    },
  };

  const creditUnderwriting = {
    slug: "credit-underwriting-dscr",
    styleVariant: "option-c",
    checkLimit: 10,
    decision: "Can the borrower support the requested debt through a five-year underwritten forecast?",
    horizon: "Base plus five forecast years",
    tags: ["Credit", "DSCR", "Leverage"],
    included: [
      "Five-year normalized and underwritten EBITDA build",
      "CFADS, debt service, and principal roll-forward",
      "DSCR, leverage, cash headroom, and debt headroom",
    ],
    excluded: "Collateral, guarantees, undrawn exposure, ratings migration, recovery analysis, and formal credit approval.",
    inputs: [
      { key: "reportedEbitda", label: "Base reported EBITDA", value: 82, unit: "LCY m", format: FORMATS.amount, help: "Starting reported earnings" },
      { key: "ebitdaGrowth", label: "Annual reported EBITDA growth", value: 0.03, unit: "%", format: FORMATS.percent, help: "Applied through Year 5" },
      { key: "netAdjustments", label: "Annual net EBITDA adjustments", value: 2, unit: "LCY m", format: FORMATS.amount, help: "Add-backs less deductions" },
      { key: "haircut", label: "Underwriting haircut", value: 0.1, unit: "%", format: FORMATS.percent, help: "Conservative reduction to normalized EBITDA" },
      { key: "capex", label: "Annual maintenance capex", value: 14, unit: "LCY m", format: FORMATS.amount, help: "Recurring cash need" },
      { key: "nwc", label: "Annual increase in NWC", value: 4, unit: "LCY m", format: FORMATS.amount, help: "Recurring cash absorbed" },
      { key: "cashTax", label: "Annual cash tax", value: 9, unit: "LCY m", format: FORMATS.amount, help: "Recurring annual cash tax" },
      { key: "debtService", label: "Annual debt service", value: 31, unit: "LCY m", format: FORMATS.amount, help: "All-in interest and principal payment" },
      { key: "grossDebt", label: "Opening gross debt", value: 230, unit: "LCY m", format: FORMATS.amount, help: "Requested debt to underwrite" },
      { key: "principalRepayment", label: "Annual principal repayment", value: 18, unit: "LCY m", format: FORMATS.amount, help: "Capped at opening debt" },
      { key: "minDscr", label: "Minimum DSCR", value: 1.25, unit: "x", format: FORMATS.multiple, help: "Coverage floor" },
      { key: "maxLeverage", label: "Maximum gross leverage", value: 3.25, unit: "x", format: FORMATS.multiple, help: "Closing debt / underwritten EBITDA limit" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      setCanvas(sheet, "H", 46);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Five-year conservative credit screen`, "H");
      setSection(sheet, 10, "UNDERWRITTEN CASH FLOW & DEBT CAPACITY", "H");
      const schedule = writeAnalystSchedule(sheet, {
        startRow: 11,
        periods: fiveYearPeriods,
        rows: [
          { key: "reportedEbitda", label: "Reported EBITDA", format: FORMATS.amount, note: "Base reported EBITDA compounds annually.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("reportedEbitda")}` : `=${cell("reportedEbitda", periodIndex - 1)}*(1+${input("ebitdaGrowth")})` },
          { key: "adjustments", label: "Net EBITDA adjustments", format: FORMATS.amount, note: "Recurring add-backs less deductions.", formula: () => `=${input("netAdjustments")}` },
          { key: "normalizedEbitda", label: "Normalized EBITDA", format: FORMATS.amount, bold: true, note: "Reported EBITDA plus net adjustments.", formula: ({ periodIndex, cell }) => `=${cell("reportedEbitda", periodIndex)}+${cell("adjustments", periodIndex)}` },
          { key: "haircutAmount", label: "Underwriting haircut", format: FORMATS.amount, note: "Negative conservative reduction.", formula: ({ periodIndex, cell }) => `=-${cell("normalizedEbitda", periodIndex)}*${input("haircut")}` },
          { key: "underwrittenEbitda", label: "Underwritten EBITDA", format: FORMATS.amount, bold: true, fill: optionCColors.paleGold, note: "Normalized EBITDA after the haircut.", formula: ({ periodIndex, cell }) => `=${cell("normalizedEbitda", periodIndex)}+${cell("haircutAmount", periodIndex)}` },
          { key: "capex", label: "Maintenance capex", format: FORMATS.amount, note: "Negative recurring cash use.", formula: () => `=-${input("capex")}` },
          { key: "nwc", label: "Increase in NWC", format: FORMATS.amount, note: "Negative recurring working-capital use.", formula: () => `=-${input("nwc")}` },
          { key: "cashTax", label: "Cash tax", format: FORMATS.amount, note: "Negative recurring cash tax.", formula: () => `=-${input("cashTax")}` },
          { key: "cfads", label: "CFADS", format: FORMATS.amount, bold: true, fill: COLORS.paleGreen, note: "Underwritten EBITDA after cash uses.", formula: ({ periodIndex, cell }) => `=${cell("underwrittenEbitda", periodIndex)}+${cell("capex", periodIndex)}+${cell("nwc", periodIndex)}+${cell("cashTax", periodIndex)}` },
          { key: "debtService", label: "Debt service", format: FORMATS.amount, note: "All-in annual interest and principal payment.", formula: () => `=${input("debtService")}` },
          { key: "dscr", label: "DSCR", format: FORMATS.multiple, bold: true, note: "CFADS / debt service.", formula: ({ periodIndex, cell }) => `=IF(${cell("debtService", periodIndex)}<=0,0,${cell("cfads", periodIndex)}/${cell("debtService", periodIndex)})` },
          { key: "openingDebt", label: "Opening gross debt", format: FORMATS.amount, note: "Forecast years roll from prior closing debt.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("grossDebt")}` : `=${cell("closingDebt", periodIndex - 1)}` },
          { key: "principalPaid", label: "Principal paid", format: FORMATS.amount, note: "Capped at opening debt.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=MIN(MAX(0,${cell("openingDebt", periodIndex)}),MAX(0,${input("principalRepayment")}))` },
          { key: "closingDebt", label: "Closing gross debt", format: FORMATS.amount, bold: true, note: "Opening debt less principal paid.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("grossDebt")}` : `=MAX(0,${cell("openingDebt", periodIndex)}-${cell("principalPaid", periodIndex)})` },
          { key: "leverage", label: "Gross leverage", format: FORMATS.multiple, bold: true, fill: optionCColors.paleGold, note: "Closing debt / underwritten EBITDA.", formula: ({ periodIndex, cell }) => `=IF(${cell("underwrittenEbitda", periodIndex)}<=0,0,${cell("closingDebt", periodIndex)}/${cell("underwrittenEbitda", periodIndex)})` },
          { key: "cashHeadroom", label: "DSCR cash headroom", format: FORMATS.amount, note: "CFADS less required cash at the minimum DSCR.", formula: ({ periodIndex, cell }) => `=${cell("cfads", periodIndex)}-${cell("debtService", periodIndex)}*${input("minDscr")}` },
          { key: "debtHeadroom", label: "Leverage debt headroom", format: FORMATS.amount, note: "Maximum debt less closing gross debt.", formula: ({ periodIndex, cell }) => `=${cell("underwrittenEbitda", periodIndex)}*${input("maxLeverage")}-${cell("closingDebt", periodIndex)}` },
          { key: "passed", label: "Thresholds passed", format: FORMATS.whole, bold: true, note: "One means DSCR and leverage both pass.", formula: ({ periodIndex, cell }) => `=IF(AND(${cell("dscr", periodIndex)}>=${input("minDscr")},${cell("leverage", periodIndex)}<=${input("maxLeverage")}),1,0)` },
          { key: "normalizedCheck", label: "Normalized EBITDA check", format: FORMATS.amount, note: "Must equal zero.", formula: ({ periodIndex, cell }) => `=${cell("normalizedEbitda", periodIndex)}-${cell("reportedEbitda", periodIndex)}-${cell("adjustments", periodIndex)}` },
          { key: "underwrittenCheck", label: "Underwritten EBITDA check", format: FORMATS.amount, note: "Must equal zero.", formula: ({ periodIndex, cell }) => `=${cell("underwrittenEbitda", periodIndex)}-${cell("normalizedEbitda", periodIndex)}-${cell("haircutAmount", periodIndex)}` },
          { key: "cfadsCheck", label: "CFADS bridge check", format: FORMATS.amount, note: "Must equal zero against EBITDA and cash uses.", formula: ({ periodIndex, cell }) => `=${cell("cfads", periodIndex)}-${cell("underwrittenEbitda", periodIndex)}-${cell("capex", periodIndex)}-${cell("nwc", periodIndex)}-${cell("cashTax", periodIndex)}` },
          { key: "debtCheck", label: "Debt roll-forward check", format: FORMATS.amount, note: "Must equal zero.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("closingDebt", 0)}-${input("grossDebt")}` : `=${cell("closingDebt", periodIndex)}-${cell("openingDebt", periodIndex)}+${cell("principalPaid", periodIndex)}` },
          { key: "ratioCheck", label: "DSCR and leverage check", format: FORMATS.decimal, note: "Combined ratio formula control.", formula: ({ periodIndex, cell }) => `=ABS(${cell("dscr", periodIndex)}-IF(${cell("debtService", periodIndex)}<=0,0,${cell("cfads", periodIndex)}/${cell("debtService", periodIndex)}))+ABS(${cell("leverage", periodIndex)}-IF(${cell("underwrittenEbitda", periodIndex)}<=0,0,${cell("closingDebt", periodIndex)}/${cell("underwrittenEbitda", periodIndex)}))` },
          { key: "headroomCheck", label: "Headroom bridge check", format: FORMATS.amount, note: "Combined cash and debt headroom control.", formula: ({ periodIndex, cell }) => `=ABS(${cell("cashHeadroom", periodIndex)}-${cell("cfads", periodIndex)}+${cell("debtService", periodIndex)}*${input("minDscr")})+ABS(${cell("debtHeadroom", periodIndex)}-${cell("underwrittenEbitda", periodIndex)}*${input("maxLeverage")}+${cell("closingDebt", periodIndex)})` },
        ],
      });

      const forecastCells = (key) => forecastIndexes.map((index) => schedule.cell(key, index));
      const final = 5;
      const kpiCells = writeKpis(sheet, [
        { label: "MINIMUM DSCR", formula: `=MIN(${resultRange(schedule.cell("dscr", 1), schedule.cell("dscr", final))})`, format: FORMATS.multiple },
        { label: "MAXIMUM LEVERAGE", formula: `=MAX(${resultRange(schedule.cell("leverage", 1), schedule.cell("leverage", final))})`, format: FORMATS.multiple },
        { label: "YEAR-5 CASH HEADROOM", formula: `=${schedule.cell("cashHeadroom", final)}`, format: FORMATS.amount },
        { label: "YEAR-5 DEBT HEADROOM", formula: `=${schedule.cell("debtHeadroom", final)}`, format: FORMATS.amount },
      ]);
      writeOutcome(sheet, "A37:H39", `=IF(MIN(${schedule.cell("passed", 1)}:${schedule.cell("passed", final)})=1,"REQUEST FITS SELECTED THRESHOLDS IN ALL YEARS","THRESHOLD BREACH · inspect DSCR, leverage, and the first failed year")`);
      setFooter(sheet, 46, "H", `${model.title} · Option C standard · Base + five years`);

      return {
        kpiCells,
        outcomeCell: "A37",
        outcomeLabel: "CREDIT OUTCOME",
        checks: [
          { label: "Haircut, debt, and cash-flow inputs are valid", actual: `=IF(AND(${input("reportedEbitda")}>0,${input("ebitdaGrowth")}>-1,${input("haircut")}>=0,${input("haircut")}<1,${input("capex")}>=0,${input("nwc")}>=0,${input("cashTax")}>=0,${input("debtService")}>0,${input("grossDebt")}>=0,${input("principalRepayment")}>=0,${input("minDscr")}>0,${input("maxLeverage")}>0),1,0)`, expected: "=1", fix: "Inputs: underwriting and debt assumptions" },
          { label: "Normalized EBITDA bridge ties", actual: maxModelAbs(forecastCells("normalizedCheck")), expected: "=0", tolerance: 0.01, fix: "Model: normalized EBITDA", format: FORMATS.amount },
          { label: "Underwritten EBITDA bridge ties", actual: maxModelAbs(forecastCells("underwrittenCheck")), expected: "=0", tolerance: 0.01, fix: "Model: underwritten EBITDA", format: FORMATS.amount },
          { label: "CFADS bridge ties", actual: maxModelAbs(forecastCells("cfadsCheck")), expected: "=0", tolerance: 0.01, fix: "Model: CFADS", format: FORMATS.amount },
          { label: "Debt roll-forward ties", actual: maxModelAbs(forecastCells("debtCheck")), expected: "=0", tolerance: 0.01, fix: "Model: debt schedule", format: FORMATS.amount },
          { label: "DSCR and leverage formulas tie", actual: maxModelAbs(forecastCells("ratioCheck")), expected: "=0", tolerance: 0.001, fix: "Model: credit ratios", format: FORMATS.decimal },
          { label: "Headroom bridges tie", actual: maxModelAbs(forecastCells("headroomCheck")), expected: "=0", tolerance: 0.01, fix: "Model: headroom bridge", format: FORMATS.amount },
          { label: "Underwritten EBITDA and debt remain valid", actual: `=IF(AND(${minModel(forecastCells("underwrittenEbitda")).slice(1)}>0,${minModel(forecastCells("closingDebt")).slice(1)}>=0),1,0)`, expected: "=1", fix: "Model: EBITDA and debt schedules" },
        ],
      };
    },
  };

  const projectFinance = {
    slug: "project-finance-lite",
    styleVariant: "option-c",
    checkLimit: 10,
    decision: "Can the project fund construction, service debt, and deliver acceptable project and equity returns?",
    horizon: "Funding at Year 0 plus five operating years",
    tags: ["Project finance", "DSCR", "IRR"],
    included: [
      "Construction funding and debt / equity sources bridge",
      "Five-year operating cash flow and level debt-service schedule",
      "Project IRR, equity IRR, DSCR, and debt paydown",
    ],
    excluded: "Construction-interest circularity, DSRA, detailed tax losses, contractual waterfalls, lender terms, and a bankability opinion.",
    inputs: [
      { key: "capex", label: "Initial project capex", value: 300, unit: "LCY m", format: FORMATS.amount, help: "Total Year-0 construction funding need" },
      { key: "debtFunding", label: "Debt funding share", value: 0.65, unit: "%", format: FORMATS.percent, help: "Debt as a share of initial capex" },
      { key: "interestRate", label: "Debt interest rate", value: 0.075, unit: "%", format: FORMATS.percent, help: "Annual cash rate on opening debt" },
      { key: "debtTenor", label: "Debt tenor", value: 5, unit: "years", format: FORMATS.whole, help: "Level debt service over one to five years" },
      { key: "yearOneRevenue", label: "Year-1 revenue", value: 210, unit: "LCY m", format: FORMATS.amount, help: "First full operating-year revenue" },
      { key: "revenueGrowth", label: "Annual revenue growth", value: 0.04, unit: "%", format: FORMATS.percent, help: "Applied from Year 2 onward" },
      { key: "yearOneOpex", label: "Year-1 operating cost", value: 70, unit: "LCY m", format: FORMATS.amount, help: "Cash operating cost before maintenance capex" },
      { key: "opexGrowth", label: "Annual operating-cost growth", value: 0.03, unit: "%", format: FORMATS.percent, help: "Applied from Year 2 onward" },
      { key: "maintenanceCapex", label: "Annual maintenance capex", value: 8, unit: "LCY m", format: FORMATS.amount, help: "Recurring sustaining investment" },
      { key: "taxRate", label: "Cash tax rate", value: 0.2, unit: "%", format: FORMATS.percent, help: "Simplified tax on positive EBITDA" },
      { key: "targetDscr", label: "Target minimum DSCR", value: 1.3, unit: "x", format: FORMATS.multiple, help: "Reference coverage threshold" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      const periods = ["Y0 / FUNDING", "YEAR 1", "YEAR 2", "YEAR 3", "YEAR 4", "YEAR 5"];
      setCanvas(sheet, "H", 50);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Funding, debt service, and returns`, "H");
      setSection(sheet, 10, "PROJECT CASH FLOW & DEBT SCHEDULE", "H");

      const schedule = writeAnalystSchedule(sheet, {
        startRow: 11,
        periods,
        noteColumnWidth: 36,
        noteCharsPerLine: 16,
        noteLineHeight: 18,
        maxNoteHeight: 144,
        rows: [
          { key: "revenue", label: "Revenue", format: FORMATS.amount, bold: true, note: "Operations begin in Year 1; revenue then compounds at the selected growth rate.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : periodIndex === 1 ? `=${input("yearOneRevenue")}` : `=${cell("revenue", periodIndex - 1)}*(1+${input("revenueGrowth")})` },
          { key: "opex", label: "Cash operating cost", format: FORMATS.amount, note: "Positive cash cost; it grows independently from revenue.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : periodIndex === 1 ? `=${input("yearOneOpex")}` : `=${cell("opex", periodIndex - 1)}*(1+${input("opexGrowth")})` },
          { key: "ebitda", label: "Project EBITDA", format: FORMATS.amount, bold: true, fill: optionCColors.paleGold, note: "Revenue less cash operating cost.", formula: ({ periodIndex, cell }) => `=${cell("revenue", periodIndex)}-${cell("opex", periodIndex)}` },
          { key: "cashTax", label: "Cash tax", format: FORMATS.amount, note: "Simplified cash tax on positive EBITDA; no tax-loss carryforward modeled.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=MAX(0,${cell("ebitda", periodIndex)}*${input("taxRate")})` },
          { key: "maintenanceCapex", label: "Maintenance capex", format: FORMATS.amount, note: "Recurring operating-period cash investment.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=${input("maintenanceCapex")}` },
          { key: "cfads", label: "CFADS", format: FORMATS.amount, bold: true, fill: COLORS.paleGreen, note: "EBITDA less cash tax and maintenance capex, before debt service.", formula: ({ periodIndex, cell }) => `=${cell("ebitda", periodIndex)}-${cell("cashTax", periodIndex)}-${cell("maintenanceCapex", periodIndex)}` },
          { key: "debtDraw", label: "Debt draw", format: FORMATS.amount, note: "Debt is drawn once at construction close.", formula: ({ periodIndex }) => periodIndex === 0 ? `=${input("capex")}*${input("debtFunding")}` : "=0" },
          { key: "equityFunding", label: "Sponsor equity funding", format: FORMATS.amount, bold: true, note: "Residual initial capex funded by the sponsor.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("capex")}-${cell("debtDraw", 0)}` : "=0" },
          { key: "openingDebt", label: "Opening debt", format: FORMATS.amount, note: "Each operating year opens at the prior closing balance.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=${cell("closingDebt", periodIndex - 1)}` },
          { key: "cashInterest", label: "Cash interest", format: FORMATS.amount, note: "Opening debt multiplied by the annual rate.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=${cell("openingDebt", periodIndex)}*${input("interestRate")}` },
          { key: "debtService", label: "Scheduled debt service", format: FORMATS.amount, note: "Level annual payment through the selected tenor, capped at debt plus interest.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=IF(${periodIndex}>MAX(1,MIN(5,ROUND(${input("debtTenor")},0))),0,MIN(${cell("openingDebt", periodIndex)}+${cell("cashInterest", periodIndex)},IF(${input("interestRate")}=0,${cell("debtDraw", 0)}/MAX(1,MIN(5,ROUND(${input("debtTenor")},0))),-PMT(${input("interestRate")},MAX(1,MIN(5,ROUND(${input("debtTenor")},0))),${cell("debtDraw", 0)}))))` },
          { key: "principalPaid", label: "Principal paid", format: FORMATS.amount, note: "Debt service less interest, capped at opening debt.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=MIN(${cell("openingDebt", periodIndex)},MAX(0,${cell("debtService", periodIndex)}-${cell("cashInterest", periodIndex)}))` },
          { key: "closingDebt", label: "Closing debt", format: FORMATS.amount, bold: true, note: "Year 0 equals the construction draw; operating years deduct principal.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("debtDraw", 0)}` : `=MAX(0,${cell("openingDebt", periodIndex)}-${cell("principalPaid", periodIndex)})` },
          { key: "dscr", label: "DSCR", format: FORMATS.multiple, bold: true, fill: optionCColors.paleGold, note: "CFADS divided by scheduled debt service; blank after debt is repaid.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? '=""' : `=IF(${cell("debtService", periodIndex)}<=0,"",${cell("cfads", periodIndex)}/${cell("debtService", periodIndex)})` },
          { key: "projectCashFlow", label: "Project cash flow", format: FORMATS.amount, bold: true, note: "Initial capex outflow followed by unlevered CFADS.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=-${input("capex")}` : `=${cell("cfads", periodIndex)}` },
          { key: "equityCashFlow", label: "Equity cash flow", format: FORMATS.amount, bold: true, note: "Initial sponsor funding followed by CFADS after debt service.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=-${cell("equityFunding", 0)}` : `=${cell("cfads", periodIndex)}-${cell("debtService", periodIndex)}` },
          { key: "fundingCheck", label: "Funding bridge check", format: FORMATS.amount, note: "Debt plus equity must equal initial capex.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("debtDraw", 0)}+${cell("equityFunding", 0)}-${input("capex")}` : "=0" },
          { key: "ebitdaCheck", label: "EBITDA bridge check", format: FORMATS.amount, note: "Must equal zero in each operating year.", formula: ({ periodIndex, cell }) => `=${cell("ebitda", periodIndex)}-${cell("revenue", periodIndex)}+${cell("opex", periodIndex)}` },
          { key: "cfadsCheck", label: "CFADS bridge check", format: FORMATS.amount, note: "Must equal zero against EBITDA and cash uses.", formula: ({ periodIndex, cell }) => `=${cell("cfads", periodIndex)}-${cell("ebitda", periodIndex)}+${cell("cashTax", periodIndex)}+${cell("maintenanceCapex", periodIndex)}` },
          { key: "serviceCheck", label: "Debt-service bridge check", format: FORMATS.amount, note: "Must equal zero against interest and principal.", formula: ({ periodIndex, cell }) => `=${cell("debtService", periodIndex)}-${cell("cashInterest", periodIndex)}-${cell("principalPaid", periodIndex)}` },
          { key: "debtCheck", label: "Debt roll-forward check", format: FORMATS.amount, note: "Must equal zero in every period.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("closingDebt", 0)}-${cell("debtDraw", 0)}` : `=${cell("closingDebt", periodIndex)}-${cell("openingDebt", periodIndex)}+${cell("principalPaid", periodIndex)}` },
          { key: "cashFlowCheck", label: "Project / equity cash-flow check", format: FORMATS.amount, note: "Combined control over the unlevered and equity cash-flow bridges.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=ABS(${cell("projectCashFlow", 0)}+${input("capex")})+ABS(${cell("equityCashFlow", 0)}+${cell("equityFunding", 0)})` : `=ABS(${cell("projectCashFlow", periodIndex)}-${cell("cfads", periodIndex)})+ABS(${cell("equityCashFlow", periodIndex)}-${cell("cfads", periodIndex)}+${cell("debtService", periodIndex)})` },
        ],
      });

      setSection(sheet, 35, "RETURN & COVERAGE SUMMARY", "H");
      const summary = writeScalarTable(sheet, {
        startRow: 36,
        rows: [
          { key: "initialDebt", label: "Initial debt funding", formula: `=${schedule.cell("debtDraw", 0)}`, unit: "LCY m", help: "Construction debt drawn at Year 0", format: FORMATS.amount },
          { key: "initialEquity", label: "Initial sponsor equity", formula: `=${schedule.cell("equityFunding", 0)}`, unit: "LCY m", help: "Sponsor funding at Year 0", format: FORMATS.amount },
          { key: "minimumDscr", label: "Minimum debt-period DSCR", formula: `=MIN(${schedule.cell("dscr", 1)}:${schedule.cell("dscr", 5)})`, unit: "x", help: "Lowest coverage while debt service is scheduled", format: FORMATS.multiple, bold: true, fill: optionCColors.paleGold },
          { key: "projectIrr", label: "Project IRR", formula: `=IF(AND(COUNTIF(${schedule.cell("projectCashFlow", 0)}:${schedule.cell("projectCashFlow", 5)},"<0")>0,COUNTIF(${schedule.cell("projectCashFlow", 0)}:${schedule.cell("projectCashFlow", 5)},">0")>0),IRR(${schedule.cell("projectCashFlow", 0)}:${schedule.cell("projectCashFlow", 5)}),0)`, unit: "%", help: "IRR on initial capex and unlevered operating cash flow", format: FORMATS.percent, bold: true },
          { key: "equityIrr", label: "Equity IRR", formula: `=IF(AND(COUNTIF(${schedule.cell("equityCashFlow", 0)}:${schedule.cell("equityCashFlow", 5)},"<0")>0,COUNTIF(${schedule.cell("equityCashFlow", 0)}:${schedule.cell("equityCashFlow", 5)},">0")>0),IRR(${schedule.cell("equityCashFlow", 0)}:${schedule.cell("equityCashFlow", 5)}),0)`, unit: "%", help: "IRR on sponsor cash flows after debt service", format: FORMATS.percent, bold: true },
          { key: "closingDebt", label: "Year-5 closing debt", formula: `=${schedule.cell("closingDebt", 5)}`, unit: "LCY m", help: "Should be nil when tenor is no more than five years", format: FORMATS.amount },
        ],
      });

      const kpiCells = writeKpis(sheet, [
        { label: "MINIMUM DSCR", formula: `=${summary.cell("minimumDscr")}`, format: FORMATS.multiple },
        { label: "PROJECT IRR", formula: `=${summary.cell("projectIrr")}`, format: FORMATS.percent },
        { label: "EQUITY IRR", formula: `=${summary.cell("equityIrr")}`, format: FORMATS.percent },
        { label: "YEAR-5 DEBT", formula: `=${summary.cell("closingDebt")}`, format: FORMATS.amount },
      ]);
      writeOutcome(sheet, "A44:H46", `=IF(AND(${summary.cell("minimumDscr")}>=${input("targetDscr")},ABS(${summary.cell("closingDebt")})<=0.01),"COVERAGE MEETS TARGET AND DEBT AMORTIZES","REVIEW COVERAGE OR DEBT STRUCTURE")`);
      setFooter(sheet, 50, "H", `${model.title} · Option C standard · Funding + five operating years`);

      const operatingCells = (key) => forecastIndexes.map((index) => schedule.cell(key, index));
      return {
        kpiCells,
        outcomeCell: "A44",
        outcomeLabel: "PROJECT FINANCE OUTCOME",
        checks: [
          { label: "Funding, operating, and return inputs are valid", actual: `=IF(AND(${input("capex")}>0,${input("debtFunding")}>0,${input("debtFunding")}<=1,${input("interestRate")}>=0,${input("debtTenor")}>=1,${input("debtTenor")}<=5,${input("yearOneRevenue")}>0,${input("revenueGrowth")}>-1,${input("yearOneOpex")}>=0,${input("opexGrowth")}>-1,${input("maintenanceCapex")}>=0,${input("taxRate")}>=0,${input("taxRate")}<=1,${input("targetDscr")}>0),1,0)`, expected: "=1", fix: "Inputs: funding, operations, and coverage assumptions" },
          { label: "Sources and uses bridge ties", actual: `=ABS(${resultRef(schedule.cell("fundingCheck", 0))})`, expected: "=0", tolerance: 0.01, fix: "Model: Year-0 funding bridge", format: FORMATS.amount },
          { label: "EBITDA bridge ties", actual: maxModelAbs(operatingCells("ebitdaCheck")), expected: "=0", tolerance: 0.01, fix: "Model: operating schedule", format: FORMATS.amount },
          { label: "CFADS bridge ties", actual: maxModelAbs(operatingCells("cfadsCheck")), expected: "=0", tolerance: 0.01, fix: "Model: CFADS schedule", format: FORMATS.amount },
          { label: "Debt-service bridge ties", actual: maxModelAbs(operatingCells("serviceCheck")), expected: "=0", tolerance: 0.01, fix: "Model: debt service", format: FORMATS.amount },
          { label: "Debt roll-forward ties", actual: maxModelAbs([schedule.cell("debtCheck", 0), ...operatingCells("debtCheck")]), expected: "=0", tolerance: 0.01, fix: "Model: debt schedule", format: FORMATS.amount },
          { label: "Project and equity cash-flow bridges tie", actual: maxModelAbs([schedule.cell("cashFlowCheck", 0), ...operatingCells("cashFlowCheck")]), expected: "=0", tolerance: 0.01, fix: "Model: cash-flow bridges", format: FORMATS.amount },
          { label: "Debt fully amortizes within the selected tenor", actual: `=${resultRef(schedule.cell("closingDebt", 5))}`, expected: "=0", tolerance: 0.01, fix: "Inputs: tenor, rate, or funding share", format: FORMATS.amount },
        ],
      };
    },
  };

  const smeForecast = {
    slug: "sme-integrated-forecast",
    styleVariant: "option-c",
    checkLimit: 10,
    decision: "When does the business reach EBITDA break-even, and how much liquidity is required over the next 12 months?",
    horizon: "Twelve monthly forecast periods",
    tags: ["SME", "Forecast", "Liquidity"],
    included: [
      "Monthly revenue, gross profit, and EBITDA forecast",
      "Receivables, payables, and net-working-capital bridge",
      "Cash roll-forward, minimum-cash funding, and break-even timing",
    ],
    excluded: "Detailed product mix, inventory, debt terms, tax schedules, seasonality, and a financing recommendation.",
    inputs: [
      { key: "currentRevenue", label: "Current monthly revenue", value: 80, unit: "LCY m", format: FORMATS.amount, help: "Run-rate revenue before Month 1" },
      { key: "monthlyGrowth", label: "Monthly revenue growth", value: 0.035, unit: "%", format: FORMATS.percent, help: "Applied to each forecast month" },
      { key: "grossMargin", label: "Gross margin", value: 0.42, unit: "%", format: FORMATS.percent, help: "Held constant in the 12-month forecast" },
      { key: "payroll", label: "Monthly payroll", value: 32, unit: "LCY m", format: FORMATS.amount, help: "Recurring fixed people cost" },
      { key: "fixedOpex", label: "Other monthly fixed opex", value: 18, unit: "LCY m", format: FORMATS.amount, help: "Recurring overhead excluding payroll" },
      { key: "collectionDays", label: "Customer collection days", value: 35, unit: "days", format: FORMATS.whole, help: "Receivables expressed on a 30-day month" },
      { key: "paymentDays", label: "Supplier payment days", value: 30, unit: "days", format: FORMATS.whole, help: "Payables based on monthly cost of goods sold" },
      { key: "openingCash", label: "Opening cash", value: 90, unit: "LCY m", format: FORMATS.amount, help: "Cash available before Month 1" },
      { key: "minimumCash", label: "Minimum cash reserve", value: 30, unit: "LCY m", format: FORMATS.amount, help: "Any shortfall is funded in the same month" },
      { key: "monthOneCapex", label: "Month-1 capex", value: 15, unit: "LCY m", format: FORMATS.amount, help: "One-time investment; later months are nil" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      const periods = Array.from({ length: 12 }, (_, index) => `M${index + 1}`);
      const monthIndexes = periods.map((_, index) => index);
      setCanvas(sheet, "N", 56);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Monthly earnings, working capital, and cash`, "N");

      setSection(sheet, 10, "OPENING WORKING-CAPITAL POSITION", "H");
      const opening = writeScalarTable(sheet, {
        startRow: 11,
        rows: [
          { key: "revenue", label: "Current monthly revenue", formula: `=${input("currentRevenue")}`, unit: "LCY m", help: "Pre-forecast run rate", format: FORMATS.amount },
          { key: "cogs", label: "Current monthly COGS", formula: `=B12*(1-${input("grossMargin")})`, unit: "LCY m", help: "Revenue multiplied by one minus gross margin", format: FORMATS.amount },
          { key: "receivables", label: "Opening receivables", formula: `=B12*${input("collectionDays")}/30`, unit: "LCY m", help: "Revenue run rate × collection days / 30", format: FORMATS.amount },
          { key: "payables", label: "Opening payables", formula: `=B13*${input("paymentDays")}/30`, unit: "LCY m", help: "COGS run rate × payment days / 30", format: FORMATS.amount },
          { key: "nwc", label: "Opening operating NWC", formula: "=B14-B15", unit: "LCY m", help: "Receivables less payables; inventory is excluded", format: FORMATS.amount, bold: true, fill: optionCColors.paleGold },
        ],
      });

      setSection(sheet, 17, "TWELVE-MONTH FORECAST", "N");
      const schedule = writeAnalystSchedule(sheet, {
        startRow: 18,
        periods,
        rows: [
          { key: "revenue", label: "Revenue", format: FORMATS.amount, bold: true, note: "Current run rate grows by the monthly assumption.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("currentRevenue")}*(1+${input("monthlyGrowth")})` : `=${cell("revenue", periodIndex - 1)}*(1+${input("monthlyGrowth")})` },
          { key: "cogs", label: "Cost of goods sold", format: FORMATS.amount, note: "Positive cost equal to revenue × one minus gross margin.", formula: ({ periodIndex, cell }) => `=${cell("revenue", periodIndex)}*(1-${input("grossMargin")})` },
          { key: "grossProfit", label: "Gross profit", format: FORMATS.amount, bold: true, note: "Revenue less cost of goods sold.", formula: ({ periodIndex, cell }) => `=${cell("revenue", periodIndex)}-${cell("cogs", periodIndex)}` },
          { key: "payroll", label: "Payroll", format: FORMATS.amount, note: "Recurring monthly people cost.", formula: () => `=${input("payroll")}` },
          { key: "fixedOpex", label: "Other fixed opex", format: FORMATS.amount, note: "Recurring fixed overhead outside payroll.", formula: () => `=${input("fixedOpex")}` },
          { key: "ebitda", label: "EBITDA", format: FORMATS.amount, bold: true, fill: optionCColors.paleGold, note: "Gross profit less payroll and other fixed opex.", formula: ({ periodIndex, cell }) => `=${cell("grossProfit", periodIndex)}-${cell("payroll", periodIndex)}-${cell("fixedOpex", periodIndex)}` },
          { key: "ebitdaMargin", label: "EBITDA margin", format: FORMATS.percent, bold: true, note: "EBITDA divided by revenue.", formula: ({ periodIndex, cell }) => `=IF(${cell("revenue", periodIndex)}<=0,0,${cell("ebitda", periodIndex)}/${cell("revenue", periodIndex)})` },
          { key: "receivables", label: "Receivables", format: FORMATS.amount, note: "Revenue × collection days / 30.", formula: ({ periodIndex, cell }) => `=${cell("revenue", periodIndex)}*${input("collectionDays")}/30` },
          { key: "payables", label: "Payables", format: FORMATS.amount, note: "COGS × payment days / 30.", formula: ({ periodIndex, cell }) => `=${cell("cogs", periodIndex)}*${input("paymentDays")}/30` },
          { key: "nwc", label: "Operating NWC", format: FORMATS.amount, bold: true, note: "Receivables less payables; inventory is excluded.", formula: ({ periodIndex, cell }) => `=${cell("receivables", periodIndex)}-${cell("payables", periodIndex)}` },
          { key: "changeNwc", label: "Increase in NWC", format: FORMATS.amount, note: "Current NWC less prior month; positive values consume cash.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("nwc", 0)}-${opening.cell("nwc")}` : `=${cell("nwc", periodIndex)}-${cell("nwc", periodIndex - 1)}` },
          { key: "openingCash", label: "Opening cash", format: FORMATS.amount, note: "Month 1 links to the input; later months roll from prior closing cash.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("openingCash")}` : `=${cell("closingCash", periodIndex - 1)}` },
          { key: "capex", label: "Capex", format: FORMATS.amount, note: "The selected one-time investment occurs in Month 1.", formula: ({ periodIndex }) => periodIndex === 0 ? `=${input("monthOneCapex")}` : "=0" },
          { key: "preFundingCash", label: "Cash before funding", format: FORMATS.amount, bold: true, note: "Opening cash plus EBITDA, less NWC investment and capex.", formula: ({ periodIndex, cell }) => `=${cell("openingCash", periodIndex)}+${cell("ebitda", periodIndex)}-${cell("changeNwc", periodIndex)}-${cell("capex", periodIndex)}` },
          { key: "funding", label: "External funding required", format: FORMATS.amount, bold: true, fill: COLORS.paleAmber, note: "Same-month funding needed to restore the minimum cash reserve.", formula: ({ periodIndex, cell }) => `=MAX(0,${input("minimumCash")}-${cell("preFundingCash", periodIndex)})` },
          { key: "closingCash", label: "Closing cash", format: FORMATS.amount, bold: true, fill: COLORS.paleGreen, note: "Cash before funding plus external funding.", formula: ({ periodIndex, cell }) => `=${cell("preFundingCash", periodIndex)}+${cell("funding", periodIndex)}` },
          { key: "breakEvenFlag", label: "EBITDA break-even flag", format: FORMATS.whole, note: "One indicates non-negative monthly EBITDA.", formula: ({ periodIndex, cell }) => `=IF(${cell("ebitda", periodIndex)}>=0,1,0)` },
          { key: "revenueCheck", label: "Revenue roll-forward check", format: FORMATS.amount, note: "Must equal zero against the monthly growth formula.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("revenue", 0)}-${input("currentRevenue")}*(1+${input("monthlyGrowth")})` : `=${cell("revenue", periodIndex)}-${cell("revenue", periodIndex - 1)}*(1+${input("monthlyGrowth")})` },
          { key: "profitCheck", label: "Gross profit / EBITDA check", format: FORMATS.amount, note: "Combined control over both profit bridges.", formula: ({ periodIndex, cell }) => `=ABS(${cell("grossProfit", periodIndex)}-${cell("revenue", periodIndex)}+${cell("cogs", periodIndex)})+ABS(${cell("ebitda", periodIndex)}-${cell("grossProfit", periodIndex)}+${cell("payroll", periodIndex)}+${cell("fixedOpex", periodIndex)})` },
          { key: "nwcCheck", label: "NWC roll-forward check", format: FORMATS.amount, note: "Combined control over NWC and its monthly change.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=ABS(${cell("nwc", 0)}-${cell("receivables", 0)}+${cell("payables", 0)})+ABS(${cell("changeNwc", 0)}-${cell("nwc", 0)}+${opening.cell("nwc")})` : `=ABS(${cell("nwc", periodIndex)}-${cell("receivables", periodIndex)}+${cell("payables", periodIndex)})+ABS(${cell("changeNwc", periodIndex)}-${cell("nwc", periodIndex)}+${cell("nwc", periodIndex - 1)})` },
          { key: "cashCheck", label: "Cash roll-forward check", format: FORMATS.amount, note: "Must equal zero after EBITDA, NWC, capex, and funding.", formula: ({ periodIndex, cell }) => `=${cell("closingCash", periodIndex)}-${cell("openingCash", periodIndex)}-${cell("ebitda", periodIndex)}+${cell("changeNwc", periodIndex)}+${cell("capex", periodIndex)}-${cell("funding", periodIndex)}` },
        ],
      });

      setSection(sheet, 42, "FORECAST SUMMARY", "H");
      const summary = writeScalarTable(sheet, {
        startRow: 43,
        rows: [
          { key: "breakEvenMonth", label: "First EBITDA break-even month", formula: `=IFERROR(MATCH(1,${schedule.cell("breakEvenFlag", 0)}:${schedule.cell("breakEvenFlag", 11)},0),0)`, unit: "month", help: "Zero means break-even is not reached in the forecast", format: FORMATS.whole, bold: true },
          { key: "totalFunding", label: "Total external funding", formula: `=SUM(${schedule.cell("funding", 0)}:${schedule.cell("funding", 11)})`, unit: "LCY m", help: "Cumulative liquidity injected to maintain minimum cash", format: FORMATS.amount, bold: true },
          { key: "monthTwelveRevenue", label: "Month-12 revenue", formula: `=${schedule.cell("revenue", 11)}`, unit: "LCY m", help: "End-of-horizon monthly revenue run rate", format: FORMATS.amount },
          { key: "monthTwelveEbitda", label: "Month-12 EBITDA", formula: `=${schedule.cell("ebitda", 11)}`, unit: "LCY m", help: "End-of-horizon monthly EBITDA", format: FORMATS.amount },
          { key: "monthTwelveMargin", label: "Month-12 EBITDA margin", formula: `=${schedule.cell("ebitdaMargin", 11)}`, unit: "%", help: "End-of-horizon EBITDA / revenue", format: FORMATS.percent },
          { key: "closingCash", label: "Month-12 closing cash", formula: `=${schedule.cell("closingCash", 11)}`, unit: "LCY m", help: "Cash after any required funding", format: FORMATS.amount },
        ],
      });

      const kpiCells = writeKpis(sheet, [
        { label: "BREAK-EVEN MONTH", formula: `=${summary.cell("breakEvenMonth")}`, format: FORMATS.whole },
        { label: "TOTAL FUNDING", formula: `=${summary.cell("totalFunding")}`, format: FORMATS.amount },
        { label: "M12 EBITDA", formula: `=${summary.cell("monthTwelveEbitda")}`, format: FORMATS.amount },
        { label: "M12 CLOSING CASH", formula: `=${summary.cell("closingCash")}`, format: FORMATS.amount },
      ]);
      writeOutcome(sheet, "A51:N53", `=IF(${summary.cell("breakEvenMonth")}>0,"EBITDA BREAK-EVEN IN MONTH "&TEXT(${summary.cell("breakEvenMonth")},"0"),"NO EBITDA BREAK-EVEN IN 12 MONTHS")&" · TOTAL FUNDING "&TEXT(${summary.cell("totalFunding")},"#,##0.0")`);
      setFooter(sheet, 56, "N", `${model.title} · Option C standard · 12-month operating and liquidity view`);

      const monthCells = (key) => monthIndexes.map((index) => schedule.cell(key, index));
      return {
        kpiCells,
        outcomeCell: "A51",
        outcomeLabel: "FORECAST OUTCOME",
        checks: [
          { label: "Growth, margin, working-capital, and cash inputs are valid", actual: `=IF(AND(${input("currentRevenue")}>0,${input("monthlyGrowth")}>-1,${input("grossMargin")}>0,${input("grossMargin")}<=1,${input("payroll")}>=0,${input("fixedOpex")}>=0,${input("collectionDays")}>=0,${input("collectionDays")}<=365,${input("paymentDays")}>=0,${input("paymentDays")}<=365,${input("openingCash")}>=0,${input("minimumCash")}>=0,${input("monthOneCapex")}>=0),1,0)`, expected: "=1", fix: "Inputs: operating, working-capital, and cash assumptions" },
          { label: "Opening working-capital bridge ties", actual: `=ABS(${resultRef(opening.cell("nwc"))}-${resultRef(opening.cell("receivables"))}+${resultRef(opening.cell("payables"))})`, expected: "=0", tolerance: 0.01, fix: "Model: opening working capital", format: FORMATS.amount },
          { label: "Revenue roll-forward ties", actual: maxModelAbs(monthCells("revenueCheck")), expected: "=0", tolerance: 0.01, fix: "Model: monthly revenue", format: FORMATS.amount },
          { label: "Gross profit and EBITDA bridges tie", actual: maxModelAbs(monthCells("profitCheck")), expected: "=0", tolerance: 0.01, fix: "Model: profit schedule", format: FORMATS.amount },
          { label: "Working-capital roll-forward ties", actual: maxModelAbs(monthCells("nwcCheck")), expected: "=0", tolerance: 0.01, fix: "Model: working-capital schedule", format: FORMATS.amount },
          { label: "Cash roll-forward ties", actual: maxModelAbs(monthCells("cashCheck")), expected: "=0", tolerance: 0.01, fix: "Model: cash schedule", format: FORMATS.amount },
          { label: "Funding is non-negative and minimum cash is maintained", actual: `=IF(AND(MIN(${resultRange(schedule.cell("funding", 0), schedule.cell("funding", 11))})>=0,MIN(${resultRange(schedule.cell("closingCash", 0), schedule.cell("closingCash", 11))})>=${input("minimumCash")}-0.01),1,0)`, expected: "=1", fix: "Model: funding and minimum-cash logic" },
          { label: "Break-even flags are complete and binary", actual: `=IF(AND(COUNT(${resultRange(schedule.cell("breakEvenFlag", 0), schedule.cell("breakEvenFlag", 11))})=12,MIN(${resultRange(schedule.cell("breakEvenFlag", 0), schedule.cell("breakEvenFlag", 11))})>=0,MAX(${resultRange(schedule.cell("breakEvenFlag", 0), schedule.cell("breakEvenFlag", 11))})<=1),1,0)`, expected: "=1", fix: "Model: break-even flags" },
        ],
      };
    },
  };

  const multiEntity = {
    slug: "multi-entity-consolidation-fx",
    styleVariant: "option-c",
    checkLimit: 10,
    decision: "How do entity growth, intercompany eliminations, and FX translation shape consolidated performance?",
    horizon: "Base plus five forecast years",
    tags: ["Consolidation", "FX", "Multi-entity"],
    included: [
      "Parent and subsidiary operating schedules",
      "Five-year FX translation ramp and intercompany eliminations",
      "Reported-versus-constant-FX EBITDA bridge",
    ],
    excluded: "Statutory consolidation, historic-rate equity, NCI presentation, cash-flow consolidation, and tax consolidation.",
    inputs: [
      { key: "parentRevenue", label: "Parent base revenue", value: 420, unit: "LCY m", format: FORMATS.amount, help: "Base revenue in reporting currency" },
      { key: "parentOpex", label: "Parent base operating cost", value: 330, unit: "LCY m", format: FORMATS.amount, help: "Base cash operating cost in reporting currency" },
      { key: "parentGrowth", label: "Parent annual growth", value: 0.03, unit: "%", format: FORMATS.percent, help: "Applied to both parent revenue and cost" },
      { key: "subRevenueLocal", label: "Subsidiary base revenue", value: 300, unit: "local m", format: FORMATS.amount, help: "Base subsidiary revenue in local currency" },
      { key: "subOpexLocal", label: "Subsidiary base operating cost", value: 210, unit: "local m", format: FORMATS.amount, help: "Base subsidiary cost in local currency" },
      { key: "subGrowth", label: "Subsidiary annual growth", value: 0.05, unit: "%", format: FORMATS.percent, help: "Applied to both subsidiary revenue and cost" },
      { key: "baseFxRate", label: "Base FX translation rate", value: 0.25, unit: "LCY / local", format: FORMATS.decimal, help: "Reporting-currency units per local-currency unit" },
      { key: "yearFiveFxShock", label: "Year-5 FX shock vs base", value: -0.1, unit: "%", format: FORMATS.percent, help: "Straight-line change from the base rate to Year 5" },
      { key: "intercompanySales", label: "Base intercompany sales", value: 20, unit: "LCY m", format: FORMATS.amount, help: "Equal revenue and cost eliminated on consolidation" },
      { key: "intercompanyGrowth", label: "Intercompany annual growth", value: 0.03, unit: "%", format: FORMATS.percent, help: "Applied to the elimination balance" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      const allIndexes = [0, ...forecastIndexes];
      setCanvas(sheet, "H", 45);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Entity, translation, and elimination bridge`, "H");
      setSection(sheet, 10, "FIVE-YEAR CONSOLIDATION & FX SCHEDULE", "H");

      const schedule = writeAnalystSchedule(sheet, {
        startRow: 11,
        periods: fiveYearPeriods,
        rows: [
          { key: "parentRevenue", label: "Parent revenue", format: FORMATS.amount, bold: true, note: "Reporting-currency revenue grows at the parent rate.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("parentRevenue")}` : `=${cell("parentRevenue", periodIndex - 1)}*(1+${input("parentGrowth")})` },
          { key: "parentOpex", label: "Parent operating cost", format: FORMATS.amount, note: "Parent cost grows at the selected parent rate.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("parentOpex")}` : `=${cell("parentOpex", periodIndex - 1)}*(1+${input("parentGrowth")})` },
          { key: "parentEbitda", label: "Parent EBITDA", format: FORMATS.amount, bold: true, note: "Parent revenue less parent operating cost.", formula: ({ periodIndex, cell }) => `=${cell("parentRevenue", periodIndex)}-${cell("parentOpex", periodIndex)}` },
          { key: "subRevenueLocal", label: "Subsidiary revenue · local", format: FORMATS.amount, bold: true, note: "Local-currency revenue grows at the subsidiary rate.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("subRevenueLocal")}` : `=${cell("subRevenueLocal", periodIndex - 1)}*(1+${input("subGrowth")})` },
          { key: "subOpexLocal", label: "Subsidiary operating cost · local", format: FORMATS.amount, note: "Local-currency cost grows at the selected subsidiary rate.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("subOpexLocal")}` : `=${cell("subOpexLocal", periodIndex - 1)}*(1+${input("subGrowth")})` },
          { key: "subEbitdaLocal", label: "Subsidiary EBITDA · local", format: FORMATS.amount, bold: true, note: "Local revenue less local operating cost.", formula: ({ periodIndex, cell }) => `=${cell("subRevenueLocal", periodIndex)}-${cell("subOpexLocal", periodIndex)}` },
          { key: "effectiveFx", label: "Effective FX rate", format: FORMATS.decimal, bold: true, fill: optionCColors.paleGold, note: "Straight-line ramp from the base translation rate to the Year-5 shock.", formula: ({ periodIndex }) => `=${input("baseFxRate")}*(1+${input("yearFiveFxShock")}*${periodIndex}/5)` },
          { key: "translatedRevenue", label: "Subsidiary revenue · translated", format: FORMATS.amount, note: "Local revenue multiplied by the effective FX rate.", formula: ({ periodIndex, cell }) => `=${cell("subRevenueLocal", periodIndex)}*${cell("effectiveFx", periodIndex)}` },
          { key: "translatedOpex", label: "Subsidiary operating cost · translated", format: FORMATS.amount, note: "Local operating cost multiplied by the effective FX rate.", formula: ({ periodIndex, cell }) => `=${cell("subOpexLocal", periodIndex)}*${cell("effectiveFx", periodIndex)}` },
          { key: "translatedEbitda", label: "Subsidiary EBITDA · translated", format: FORMATS.amount, bold: true, note: "Translated revenue less translated operating cost.", formula: ({ periodIndex, cell }) => `=${cell("translatedRevenue", periodIndex)}-${cell("translatedOpex", periodIndex)}` },
          { key: "intercompanySales", label: "Intercompany elimination", format: FORMATS.amount, note: "Equal reduction to revenue and operating cost; EBITDA-neutral.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("intercompanySales")}` : `=${cell("intercompanySales", periodIndex - 1)}*(1+${input("intercompanyGrowth")})` },
          { key: "consolidatedRevenue", label: "Consolidated revenue", format: FORMATS.amount, bold: true, note: "Parent plus translated subsidiary revenue, less intercompany sales.", formula: ({ periodIndex, cell }) => `=${cell("parentRevenue", periodIndex)}+${cell("translatedRevenue", periodIndex)}-${cell("intercompanySales", periodIndex)}` },
          { key: "consolidatedOpex", label: "Consolidated operating cost", format: FORMATS.amount, note: "Parent plus translated subsidiary cost, less matching intercompany cost.", formula: ({ periodIndex, cell }) => `=${cell("parentOpex", periodIndex)}+${cell("translatedOpex", periodIndex)}-${cell("intercompanySales", periodIndex)}` },
          { key: "consolidatedEbitda", label: "Consolidated EBITDA", format: FORMATS.amount, bold: true, fill: COLORS.paleGreen, note: "Consolidated revenue less consolidated operating cost.", formula: ({ periodIndex, cell }) => `=${cell("consolidatedRevenue", periodIndex)}-${cell("consolidatedOpex", periodIndex)}` },
          { key: "consolidatedMargin", label: "Consolidated EBITDA margin", format: FORMATS.percent, bold: true, note: "Consolidated EBITDA divided by consolidated revenue.", formula: ({ periodIndex, cell }) => `=IF(${cell("consolidatedRevenue", periodIndex)}<=0,0,${cell("consolidatedEbitda", periodIndex)}/${cell("consolidatedRevenue", periodIndex)})` },
          { key: "constantFxSubEbitda", label: "Subsidiary EBITDA · constant FX", format: FORMATS.amount, note: "Local EBITDA translated at the base rate.", formula: ({ periodIndex, cell }) => `=${cell("subEbitdaLocal", periodIndex)}*${input("baseFxRate")}` },
          { key: "constantFxGroupEbitda", label: "Group EBITDA · constant FX", format: FORMATS.amount, bold: true, note: "Parent EBITDA plus subsidiary EBITDA at base FX.", formula: ({ periodIndex, cell }) => `=${cell("parentEbitda", periodIndex)}+${cell("constantFxSubEbitda", periodIndex)}` },
          { key: "fxImpact", label: "FX impact on EBITDA", format: FORMATS.amount, bold: true, fill: optionCColors.paleGold, note: "Reported consolidated EBITDA less constant-FX EBITDA.", formula: ({ periodIndex, cell }) => `=${cell("consolidatedEbitda", periodIndex)}-${cell("constantFxGroupEbitda", periodIndex)}` },
          { key: "fxRampCheck", label: "FX ramp check", format: FORMATS.decimal, note: "Must equal zero against the visible straight-line ramp.", formula: ({ periodIndex, cell }) => `=${cell("effectiveFx", periodIndex)}-${input("baseFxRate")}*(1+${input("yearFiveFxShock")}*${periodIndex}/5)` },
          { key: "parentCheck", label: "Parent EBITDA check", format: FORMATS.amount, note: "Must equal zero.", formula: ({ periodIndex, cell }) => `=${cell("parentEbitda", periodIndex)}-${cell("parentRevenue", periodIndex)}+${cell("parentOpex", periodIndex)}` },
          { key: "subCheck", label: "Subsidiary local EBITDA check", format: FORMATS.amount, note: "Must equal zero.", formula: ({ periodIndex, cell }) => `=${cell("subEbitdaLocal", periodIndex)}-${cell("subRevenueLocal", periodIndex)}+${cell("subOpexLocal", periodIndex)}` },
          { key: "translationCheck", label: "Translation bridge check", format: FORMATS.amount, note: "Combined control over translated revenue, cost, and EBITDA.", formula: ({ periodIndex, cell }) => `=ABS(${cell("translatedRevenue", periodIndex)}-${cell("subRevenueLocal", periodIndex)}*${cell("effectiveFx", periodIndex)})+ABS(${cell("translatedOpex", periodIndex)}-${cell("subOpexLocal", periodIndex)}*${cell("effectiveFx", periodIndex)})+ABS(${cell("translatedEbitda", periodIndex)}-${cell("subEbitdaLocal", periodIndex)}*${cell("effectiveFx", periodIndex)})` },
          { key: "consolidationCheck", label: "Consolidation / elimination check", format: FORMATS.amount, note: "Revenue, cost, and EBITDA must all tie after elimination.", formula: ({ periodIndex, cell }) => `=ABS(${cell("consolidatedRevenue", periodIndex)}-${cell("parentRevenue", periodIndex)}-${cell("translatedRevenue", periodIndex)}+${cell("intercompanySales", periodIndex)})+ABS(${cell("consolidatedOpex", periodIndex)}-${cell("parentOpex", periodIndex)}-${cell("translatedOpex", periodIndex)}+${cell("intercompanySales", periodIndex)})+ABS(${cell("consolidatedEbitda", periodIndex)}-${cell("parentEbitda", periodIndex)}-${cell("translatedEbitda", periodIndex)})` },
          { key: "fxImpactCheck", label: "FX impact bridge check", format: FORMATS.amount, note: "Must equal zero against reported and constant-FX EBITDA.", formula: ({ periodIndex, cell }) => `=${cell("fxImpact", periodIndex)}-${cell("consolidatedEbitda", periodIndex)}+${cell("constantFxGroupEbitda", periodIndex)}` },
          { key: "marginCheck", label: "Consolidated margin check", format: FORMATS.decimal, note: "Must equal zero against EBITDA divided by revenue.", formula: ({ periodIndex, cell }) => `=${cell("consolidatedMargin", periodIndex)}-IF(${cell("consolidatedRevenue", periodIndex)}<=0,0,${cell("consolidatedEbitda", periodIndex)}/${cell("consolidatedRevenue", periodIndex)})` },
        ],
      });

      const final = 5;
      const kpiCells = writeKpis(sheet, [
        { label: "YEAR-5 GROUP REVENUE", formula: `=${schedule.cell("consolidatedRevenue", final)}`, format: FORMATS.amount },
        { label: "YEAR-5 GROUP EBITDA", formula: `=${schedule.cell("consolidatedEbitda", final)}`, format: FORMATS.amount },
        { label: "YEAR-5 EBITDA MARGIN", formula: `=${schedule.cell("consolidatedMargin", final)}`, format: FORMATS.percent },
        { label: "YEAR-5 FX IMPACT", formula: `=${schedule.cell("fxImpact", final)}`, format: FORMATS.amount },
      ]);
      writeOutcome(sheet, "A38:H40", `=IF(${schedule.cell("fxImpact", final)}<0,"YEAR-5 FX HEADWIND OF "&TEXT(ABS(${schedule.cell("fxImpact", final)}),"#,##0.0"),"YEAR-5 FX TAILWIND OF "&TEXT(${schedule.cell("fxImpact", final)},"#,##0.0"))&" · intercompany sales are fully eliminated"`);
      setFooter(sheet, 45, "H", `${model.title} · Option C standard · Base + five years`);

      const allCells = (key) => allIndexes.map((index) => schedule.cell(key, index));
      return {
        kpiCells,
        outcomeCell: "A38",
        outcomeLabel: "FX OUTCOME",
        checks: [
          { label: "Entity, growth, FX, and elimination inputs are valid", actual: `=IF(AND(${input("parentRevenue")}>0,${input("parentOpex")}>=0,${input("parentGrowth")}>-1,${input("subRevenueLocal")}>0,${input("subOpexLocal")}>=0,${input("subGrowth")}>-1,${input("baseFxRate")}>0,${input("yearFiveFxShock")}>-1,${input("intercompanySales")}>=0,${input("intercompanyGrowth")}>-1),1,0)`, expected: "=1", fix: "Inputs: entity, growth, FX, and elimination assumptions" },
          { label: "FX rate ramp ties and stays positive", actual: `=IF(AND(${maxModelAbs(allCells("fxRampCheck")).slice(1)}<=0.000001,${minModel(allCells("effectiveFx")).slice(1)}>0),1,0)`, expected: "=1", fix: "Model: FX rate ramp" },
          { label: "Parent EBITDA bridge ties", actual: maxModelAbs(allCells("parentCheck")), expected: "=0", tolerance: 0.01, fix: "Model: parent schedule", format: FORMATS.amount },
          { label: "Subsidiary local EBITDA bridge ties", actual: maxModelAbs(allCells("subCheck")), expected: "=0", tolerance: 0.01, fix: "Model: subsidiary local schedule", format: FORMATS.amount },
          { label: "FX translation bridge ties", actual: maxModelAbs(allCells("translationCheck")), expected: "=0", tolerance: 0.01, fix: "Model: translation schedule", format: FORMATS.amount },
          { label: "Consolidation and eliminations tie", actual: maxModelAbs(allCells("consolidationCheck")), expected: "=0", tolerance: 0.01, fix: "Model: consolidation bridge", format: FORMATS.amount },
          { label: "FX impact bridge ties", actual: maxModelAbs(allCells("fxImpactCheck")), expected: "=0", tolerance: 0.01, fix: "Model: constant-FX bridge", format: FORMATS.amount },
          { label: "Consolidated EBITDA margin ties", actual: maxModelAbs(allCells("marginCheck")), expected: "=0", tolerance: 0.0001, fix: "Model: consolidated margin", format: FORMATS.decimal },
        ],
      };
    },
  };

  const lboReturns = {
    slug: "lbo-returns-model",
    styleVariant: "option-c",
    checkLimit: 10,
    decision: "How do EBITDA growth, cash conversion, debt paydown, and exit assumptions drive sponsor returns?",
    horizon: "Entry plus five forecast years",
    tags: ["LBO", "Debt paydown", "Sponsor returns"],
    included: [
      "Entry sources and uses with sponsor equity plug",
      "Five-year EBITDA, cash generation, and cash-sweep debt schedule",
      "Hold-period exit bridge, sponsor cash flows, MOIC, and IRR",
    ],
    excluded: "Funded debt commitments, covenant EBITDA, revolver circularity, management dilution, purchase accounting, and investment advice.",
    inputs: [
      { key: "entryEbitda", label: "Entry EBITDA", value: 90, unit: "LCY m", format: FORMATS.amount, help: "Starting earnings at transaction close" },
      { key: "entryMultiple", label: "Entry EV / EBITDA", value: 9, unit: "x", format: FORMATS.multiple, help: "Purchase enterprise-value multiple" },
      { key: "openingLeverage", label: "Opening debt / EBITDA", value: 5, unit: "x", format: FORMATS.multiple, help: "Debt funded at entry" },
      { key: "entryFees", label: "Transaction fees", value: 18, unit: "LCY m", format: FORMATS.amount, help: "Sponsor-funded fees in addition to enterprise value" },
      { key: "ebitdaGrowth", label: "Annual EBITDA growth", value: 0.105, unit: "%", format: FORMATS.percent, help: "Applied through Year 5" },
      { key: "fcfConversion", label: "FCF conversion before interest", value: 0.64, unit: "%", format: FORMATS.percent, help: "Free cash flow before interest as a share of EBITDA" },
      { key: "interestRate", label: "Cash interest rate", value: 0.08, unit: "%", format: FORMATS.percent, help: "Applied to opening debt" },
      { key: "cashSweep", label: "Cash sweep", value: 0.75, unit: "%", format: FORMATS.percent, help: "Share of positive cash after interest used to repay debt" },
      { key: "exitMultiple", label: "Exit EV / EBITDA", value: 10, unit: "x", format: FORMATS.multiple, help: "Applied in the selected exit year" },
      { key: "holdPeriod", label: "Hold period", value: 5, unit: "years", format: FORMATS.whole, help: "Rounded and capped between Year 1 and Year 5" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      const allIndexes = [0, ...forecastIndexes];
      setCanvas(sheet, "H", 60);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Entry, deleveraging, and sponsor returns`, "H");

      setSection(sheet, 10, "ENTRY SOURCES & USES", "H");
      const entry = writeScalarTable(sheet, {
        startRow: 11,
        rows: [
          { key: "enterpriseValue", label: "Entry enterprise value", formula: `=${input("entryEbitda")}*${input("entryMultiple")}`, unit: "LCY m", help: "Entry EBITDA × purchase multiple", format: FORMATS.amount, bold: true },
          { key: "openingDebt", label: "Opening debt", formula: `=${input("entryEbitda")}*${input("openingLeverage")}`, unit: "LCY m", help: "Entry EBITDA × opening leverage", format: FORMATS.amount },
          { key: "sponsorEquity", label: "Sponsor equity", formula: `=B12+${input("entryFees")}-B13`, unit: "LCY m", help: "Equity plug after debt funds enterprise value and fees", format: FORMATS.amount, bold: true, fill: optionCColors.paleGold },
          { key: "sources", label: "Total sources", formula: "=B13+B14", unit: "LCY m", help: "Opening debt plus sponsor equity", format: FORMATS.amount },
          { key: "uses", label: "Total uses", formula: `=B12+${input("entryFees")}`, unit: "LCY m", help: "Enterprise value plus transaction fees", format: FORMATS.amount },
          { key: "sourcesUsesCheck", label: "Sources / uses check", formula: "=ROUND(B15-B16,6)", unit: "LCY m", help: "Must equal zero", format: FORMATS.amount },
        ],
      });

      setSection(sheet, 19, "FIVE-YEAR OPERATING & DEBT SCHEDULE", "H");
      const schedule = writeAnalystSchedule(sheet, {
        startRow: 20,
        periods: fiveYearPeriods,
        noteColumnWidth: 36,
        noteCharsPerLine: 16,
        noteLineHeight: 18,
        maxNoteHeight: 144,
        rows: [
          { key: "ebitda", label: "EBITDA", format: FORMATS.amount, bold: true, fill: optionCColors.paleGold, note: "Entry EBITDA compounds at the selected annual growth rate.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("entryEbitda")}` : `=${cell("ebitda", periodIndex - 1)}*(1+${input("ebitdaGrowth")})` },
          { key: "fcfBeforeInterest", label: "FCF before interest", format: FORMATS.amount, bold: true, note: "Forecast EBITDA multiplied by the selected cash-conversion rate.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=${cell("ebitda", periodIndex)}*${input("fcfConversion")}` },
          { key: "openingDebt", label: "Opening debt", format: FORMATS.amount, note: "Year 1 opens at transaction debt; later years roll from prior closing debt.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : periodIndex === 1 ? `=${entry.cell("openingDebt")}` : `=${cell("closingDebt", periodIndex - 1)}` },
          { key: "cashInterest", label: "Cash interest", format: FORMATS.amount, note: "Opening debt multiplied by the cash interest rate.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=${cell("openingDebt", periodIndex)}*${input("interestRate")}` },
          { key: "cashAfterInterest", label: "Cash after interest", format: FORMATS.amount, bold: true, note: "FCF before interest less cash interest; negative values signal a funding gap outside scope.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=${cell("fcfBeforeInterest", periodIndex)}-${cell("cashInterest", periodIndex)}` },
          { key: "cashSweepPaydown", label: "Cash-sweep debt paydown", format: FORMATS.amount, note: "Selected share of positive cash after interest, capped at opening debt.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=MIN(${cell("openingDebt", periodIndex)},MAX(0,${cell("cashAfterInterest", periodIndex)})*${input("cashSweep")})` },
          { key: "sponsorDistribution", label: "Sponsor distribution", format: FORMATS.amount, note: "Positive cash after interest not used for the debt sweep.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=MAX(0,${cell("cashAfterInterest", periodIndex)})-${cell("cashSweepPaydown", periodIndex)}` },
          { key: "closingDebt", label: "Closing debt", format: FORMATS.amount, bold: true, fill: COLORS.paleGreen, note: "Entry column shows opening transaction debt; forecast years deduct cash sweep paydown.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${entry.cell("openingDebt")}` : `=MAX(0,${cell("openingDebt", periodIndex)}-${cell("cashSweepPaydown", periodIndex)})` },
          { key: "debtToEbitda", label: "Debt / EBITDA", format: FORMATS.multiple, bold: true, note: "Closing debt divided by EBITDA.", formula: ({ periodIndex, cell }) => `=IF(${cell("ebitda", periodIndex)}<=0,0,${cell("closingDebt", periodIndex)}/${cell("ebitda", periodIndex)})` },
          { key: "cumulativePaydown", label: "Cumulative debt paydown", format: FORMATS.amount, note: "Entry debt less the current closing balance.", formula: ({ periodIndex, cell }) => `=${entry.cell("openingDebt")}-${cell("closingDebt", periodIndex)}` },
          { key: "exitEnterpriseValue", label: "Exit enterprise value", format: FORMATS.amount, bold: true, note: "EBITDA × exit multiple only in the selected hold year.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=IF(${periodIndex}=MAX(1,MIN(5,ROUND(${input("holdPeriod")},0))),${cell("ebitda", periodIndex)}*${input("exitMultiple")},0)` },
          { key: "exitEquity", label: "Exit equity value", format: FORMATS.amount, bold: true, fill: optionCColors.paleGold, note: "Exit enterprise value less closing debt, floored at zero.", formula: ({ periodIndex, cell }) => `=IF(${cell("exitEnterpriseValue", periodIndex)}=0,0,MAX(0,${cell("exitEnterpriseValue", periodIndex)}-${cell("closingDebt", periodIndex)}))` },
          { key: "sponsorCashFlow", label: "Sponsor cash flow", format: FORMATS.amount, bold: true, note: "Entry equity outflow, interim distributions, and exit equity in the selected hold year.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=-${entry.cell("sponsorEquity")}` : `=IF(${periodIndex}<=MAX(1,MIN(5,ROUND(${input("holdPeriod")},0))),${cell("sponsorDistribution", periodIndex)}+${cell("exitEquity", periodIndex)},0)` },
          { key: "ebitdaCheck", label: "EBITDA roll-forward check", format: FORMATS.amount, note: "Must equal zero.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("ebitda", 0)}-${input("entryEbitda")}` : `=${cell("ebitda", periodIndex)}-${cell("ebitda", periodIndex - 1)}*(1+${input("ebitdaGrowth")})` },
          { key: "fcfCheck", label: "FCF conversion check", format: FORMATS.amount, note: "Must equal zero against EBITDA × conversion.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("fcfBeforeInterest", 0)}` : `=${cell("fcfBeforeInterest", periodIndex)}-${cell("ebitda", periodIndex)}*${input("fcfConversion")}` },
          { key: "interestCheck", label: "Interest calculation check", format: FORMATS.amount, note: "Must equal zero against opening debt × rate.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("cashInterest", 0)}` : `=${cell("cashInterest", periodIndex)}-${cell("openingDebt", periodIndex)}*${input("interestRate")}` },
          { key: "debtCheck", label: "Debt roll-forward check", format: FORMATS.amount, note: "Must equal zero in every period.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("closingDebt", 0)}-${entry.cell("openingDebt")}` : `=${cell("closingDebt", periodIndex)}-${cell("openingDebt", periodIndex)}+${cell("cashSweepPaydown", periodIndex)}` },
          { key: "exitCheck", label: "Exit value bridge check", format: FORMATS.amount, note: "Controls exit enterprise value and equity value in the selected year.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=ABS(${cell("exitEnterpriseValue", 0)})+ABS(${cell("exitEquity", 0)})` : `=ABS(${cell("exitEnterpriseValue", periodIndex)}-IF(${periodIndex}=MAX(1,MIN(5,ROUND(${input("holdPeriod")},0))),${cell("ebitda", periodIndex)}*${input("exitMultiple")},0))+ABS(${cell("exitEquity", periodIndex)}-IF(${cell("exitEnterpriseValue", periodIndex)}=0,0,MAX(0,${cell("exitEnterpriseValue", periodIndex)}-${cell("closingDebt", periodIndex)})))` },
          { key: "sponsorCashFlowCheck", label: "Sponsor cash-flow check", format: FORMATS.amount, note: "Must equal zero against entry, distributions, and exit proceeds.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("sponsorCashFlow", 0)}+${entry.cell("sponsorEquity")}` : `=${cell("sponsorCashFlow", periodIndex)}-IF(${periodIndex}<=MAX(1,MIN(5,ROUND(${input("holdPeriod")},0))),${cell("sponsorDistribution", periodIndex)}+${cell("exitEquity", periodIndex)},0)` },
        ],
      });

      setSection(sheet, 42, "HOLD-PERIOD RETURN SUMMARY", "H");
      const summary = writeScalarTable(sheet, {
        startRow: 43,
        rows: [
          { key: "holdPeriod", label: "Selected hold period", formula: `=MAX(1,MIN(5,ROUND(${input("holdPeriod")},0)))`, unit: "years", help: "Rounded and capped between Year 1 and Year 5", format: FORMATS.whole },
          { key: "exitEbitda", label: "Exit EBITDA", formula: `=INDEX(${schedule.cell("ebitda", 1)}:${schedule.cell("ebitda", 5)},1,B44)`, unit: "LCY m", help: "EBITDA in the selected hold year", format: FORMATS.amount },
          { key: "exitDebt", label: "Exit debt", formula: `=INDEX(${schedule.cell("closingDebt", 1)}:${schedule.cell("closingDebt", 5)},1,B44)`, unit: "LCY m", help: "Closing debt in the selected hold year", format: FORMATS.amount },
          { key: "exitEnterpriseValue", label: "Exit enterprise value", formula: "=B45*" + input("exitMultiple"), unit: "LCY m", help: "Exit EBITDA × exit multiple", format: FORMATS.amount },
          { key: "exitEquity", label: "Exit equity value", formula: "=MAX(0,B47-B46)", unit: "LCY m", help: "Exit enterprise value less exit debt", format: FORMATS.amount, bold: true, fill: optionCColors.paleGold },
          { key: "totalProceeds", label: "Total sponsor proceeds", formula: `=SUM(${schedule.cell("sponsorCashFlow", 1)}:${schedule.cell("sponsorCashFlow", 5)})`, unit: "LCY m", help: "Interim distributions plus exit equity", format: FORMATS.amount },
          { key: "moic", label: "Sponsor MOIC", formula: `=IF(${entry.cell("sponsorEquity")}<=0,0,B49/${entry.cell("sponsorEquity")})`, unit: "x", help: "Total sponsor proceeds / entry sponsor equity", format: FORMATS.multiple, bold: true },
          { key: "irr", label: "Sponsor IRR", formula: `=IF(AND(COUNTIF(${schedule.cell("sponsorCashFlow", 0)}:${schedule.cell("sponsorCashFlow", 5)},"<0")>0,COUNTIF(${schedule.cell("sponsorCashFlow", 0)}:${schedule.cell("sponsorCashFlow", 5)},">0")>0),IRR(${schedule.cell("sponsorCashFlow", 0)}:${schedule.cell("sponsorCashFlow", 5)}),0)`, unit: "%", help: "IRR on the visible sponsor cash-flow timeline", format: FORMATS.percent, bold: true },
        ],
      });

      const kpiCells = writeKpis(sheet, [
        { label: "EXIT EBITDA", formula: `=${summary.cell("exitEbitda")}`, format: FORMATS.amount },
        { label: "EXIT EQUITY VALUE", formula: `=${summary.cell("exitEquity")}`, format: FORMATS.amount },
        { label: "SPONSOR MOIC", formula: `=${summary.cell("moic")}`, format: FORMATS.multiple },
        { label: "SPONSOR IRR", formula: `=${summary.cell("irr")}`, format: FORMATS.percent },
      ]);
      writeOutcome(sheet, "A54:H56", `=IF(${summary.cell("moic")}>=2,"RETURN CASE EXCEEDS 2.0x MOIC","RETURN CASE BELOW 2.0x MOIC")&" · exit leverage "&TEXT(IF(${summary.cell("exitEbitda")}<=0,0,${summary.cell("exitDebt")}/${summary.cell("exitEbitda")}),"0.0x")`);
      setFooter(sheet, 60, "H", `${model.title} · Option C standard · Entry + five years`);

      const allCells = (key) => allIndexes.map((index) => schedule.cell(key, index));
      const sponsorRange = resultRange(schedule.cell("sponsorCashFlow", 0), schedule.cell("sponsorCashFlow", 5));
      return {
        kpiCells,
        outcomeCell: "A54",
        outcomeLabel: "SPONSOR RETURN OUTCOME",
        checks: [
          { label: "Entry, operating, financing, and exit inputs are valid", actual: `=IF(AND(${input("entryEbitda")}>0,${input("entryMultiple")}>0,${input("openingLeverage")}>=0,${input("entryFees")}>=0,${input("ebitdaGrowth")}>-1,${input("fcfConversion")}>=0,${input("fcfConversion")}<=1,${input("interestRate")}>=0,${input("cashSweep")}>=0,${input("cashSweep")}<=1,${input("exitMultiple")}>0,${input("holdPeriod")}>=1,${input("holdPeriod")}<=5,${input("entryEbitda")}*${input("entryMultiple")}+${input("entryFees")}-${input("entryEbitda")}*${input("openingLeverage")}>0),1,0)`, expected: "=1", fix: "Inputs: entry, operating, financing, and exit assumptions" },
          { label: "Entry sources and uses tie", actual: `=ABS(${resultRef(entry.cell("sourcesUsesCheck"))})`, expected: "=0", tolerance: 0.01, fix: "Model: entry sources and uses", format: FORMATS.amount },
          { label: "EBITDA roll-forward ties", actual: maxModelAbs(allCells("ebitdaCheck")), expected: "=0", tolerance: 0.01, fix: "Model: EBITDA schedule", format: FORMATS.amount },
          { label: "FCF conversion bridge ties", actual: maxModelAbs(allCells("fcfCheck")), expected: "=0", tolerance: 0.01, fix: "Model: free-cash-flow schedule", format: FORMATS.amount },
          { label: "Cash interest calculation ties", actual: maxModelAbs(allCells("interestCheck")), expected: "=0", tolerance: 0.01, fix: "Model: interest schedule", format: FORMATS.amount },
          { label: "Debt roll-forward ties", actual: maxModelAbs(allCells("debtCheck")), expected: "=0", tolerance: 0.01, fix: "Model: debt paydown", format: FORMATS.amount },
          { label: "Exit value bridge ties", actual: maxModelAbs(allCells("exitCheck")), expected: "=0", tolerance: 0.01, fix: "Model: exit value bridge", format: FORMATS.amount },
          { label: "Sponsor cash flows and return metrics tie", actual: `=MAX(${maxModelAbs(allCells("sponsorCashFlowCheck")).slice(1)},ABS(${resultRef(summary.cell("moic"))}-IF(${resultRef(entry.cell("sponsorEquity"))}<=0,0,${resultRef(summary.cell("totalProceeds"))}/${resultRef(entry.cell("sponsorEquity"))})),ABS(${resultRef(summary.cell("irr"))}-IF(AND(COUNTIF(${sponsorRange},"<0")>0,COUNTIF(${sponsorRange},">0")>0),IRR(${sponsorRange}),0)))`, expected: "=0", tolerance: 0.001, fix: "Model: sponsor cash flows and return summary", format: FORMATS.decimal },
        ],
      };
    },
  };

  return [tradingComps, maAccretionDilution, debtCovenant, creditUnderwriting, projectFinance, smeForecast, multiEntity, lboReturns];
};

export default createValuationSpecs;
