export const createCoreSpecs = (api) => {
  const {
    COLORS,
    FORMATS,
    inputRef,
    mergeValue,
    setCanvas,
    setFooter,
    setSection,
    setTitle,
    writeKpis,
    writeScalarTable,
    writeTimeSeries,
    version,
  } = api;

  const resultRef = (cell) => `'Model'!${cell}`;
  const resultRange = (startCell, endCell) => `'Model'!${startCell}:${endCell}`;

  const writeOutcome = (sheet, address, formula) => {
    const range = sheet.getRange(address);
    range.merge();
    sheet.getRange(address.split(":")[0]).formulas = [[formula]];
    range.format = {
      fill: COLORS.paleAmber,
      font: { bold: true, color: COLORS.amber, fontSize: 9, typeface: "Aptos" },
      horizontalAlignment: "center",
      verticalAlignment: "center",
      wrapText: true,
      borders: { preset: "outside", style: "thin", color: "#F2D58A" },
    };
  };

  const threeStatement = {
    slug: "three-statement-model",
    styleVariant: "option-c",
    checkLimit: 10,
    decision: "How do five years of operating drivers flow through profit, cash, debt, and the balance sheet?",
    horizon: "Base plus five-year forecast",
    tags: ["Three statements", "Driver ramps", "Balance-sheet roll-forwards"],
    included: [
      "Five-year integrated income statement, cash flow, and balance sheet",
      "Explicit working-capital, PP&E, debt, and retained-earnings schedules",
      "Visible driver ramps with ten calculation controls",
    ],
    excluded: "Monthly phasing, multiple scenarios, lease accounting, deferred tax, share issuance, and external-data automation.",
    inputs: [
      { key: "startingRevenue", group: "BASE", label: "Base revenue", value: 1200, unit: "LCY m", format: FORMATS.amount, help: "Reference revenue for Year 1." },
      { key: "growthY1", group: "DRIVER RAMP", label: "Revenue growth — Year 1", value: 0.08, unit: "%", format: FORMATS.percent, help: "Starting point of the five-year growth ramp." },
      { key: "growthY5", group: "DRIVER RAMP", label: "Revenue growth — Year 5", value: 0.05, unit: "%", format: FORMATS.percent, help: "Ending point; Years 2–4 interpolate automatically." },
      { key: "grossMarginY1", group: "DRIVER RAMP", label: "Gross margin — Year 1", value: 0.36, unit: "%", format: FORMATS.percent, help: "Starting gross-margin assumption." },
      { key: "grossMarginY5", group: "DRIVER RAMP", label: "Gross margin — Year 5", value: 0.38, unit: "%", format: FORMATS.percent, help: "Ending gross-margin assumption." },
      { key: "opexRateY1", group: "DRIVER RAMP", label: "Opex / revenue — Year 1", value: 0.20, unit: "%", format: FORMATS.percent, help: "Starting operating-expense ratio." },
      { key: "opexRateY5", group: "DRIVER RAMP", label: "Opex / revenue — Year 5", value: 0.18, unit: "%", format: FORMATS.percent, help: "Ending operating-expense ratio." },
      { key: "taxRate", group: "DRIVER RAMP", label: "Cash tax rate", value: 0.20, unit: "%", format: FORMATS.percent, help: "Applied only to positive earnings before tax." },
      { key: "dsoY1", group: "WORKING CAPITAL RAMP", label: "Receivable days — Year 1", value: 45, unit: "Days", format: FORMATS.whole, help: "Starting DSO." },
      { key: "dsoY5", group: "WORKING CAPITAL RAMP", label: "Receivable days — Year 5", value: 40, unit: "Days", format: FORMATS.whole, help: "Ending DSO; intermediate years interpolate." },
      { key: "dioY1", group: "WORKING CAPITAL RAMP", label: "Inventory days — Year 1", value: 35, unit: "Days", format: FORMATS.whole, help: "Starting DIO." },
      { key: "dioY5", group: "WORKING CAPITAL RAMP", label: "Inventory days — Year 5", value: 30, unit: "Days", format: FORMATS.whole, help: "Ending DIO." },
      { key: "dpoY1", group: "WORKING CAPITAL RAMP", label: "Payable days — Year 1", value: 40, unit: "Days", format: FORMATS.whole, help: "Starting DPO." },
      { key: "dpoY5", group: "WORKING CAPITAL RAMP", label: "Payable days — Year 5", value: 45, unit: "Days", format: FORMATS.whole, help: "Ending DPO." },
      { key: "openingCash", group: "OPENING BALANCES", label: "Opening cash", value: 130, unit: "LCY m", format: FORMATS.amount, help: "Starting cash balance." },
      { key: "openingPpe", group: "OPENING BALANCES", label: "Opening net PP&E", value: 350, unit: "LCY m", format: FORMATS.amount, help: "Starting property, plant, and equipment." },
      { key: "capexRate", group: "OPENING BALANCES", label: "Capex / revenue", value: 0.045, unit: "%", format: FORMATS.percent, help: "Held constant across the five forecast years." },
      { key: "depreciationRate", group: "OPENING BALANCES", label: "Depreciation / opening PP&E", value: 0.10, unit: "%", format: FORMATS.percent, help: "No same-year depreciation is applied to new capex." },
      { key: "openingDebt", group: "FINANCING", label: "Opening debt", value: 210, unit: "LCY m", format: FORMATS.amount, help: "Starting gross debt." },
      { key: "newBorrowing", group: "FINANCING", label: "New borrowing per year", value: 0, unit: "LCY m", format: FORMATS.amount, help: "Repeated annually." },
      { key: "requestedRepayment", group: "FINANCING", label: "Requested repayment per year", value: 20, unit: "LCY m", format: FORMATS.amount, help: "Capped at available debt." },
      { key: "interestRate", group: "FINANCING", label: "Cash interest rate", value: 0.06, unit: "%", format: FORMATS.percent, help: "Applied to average debt." },
      { key: "shareCapital", group: "FINANCING", label: "Opening share capital", value: 200, unit: "LCY m", format: FORMATS.amount, help: "Retained earnings are derived at opening." },
      { key: "dividendPayout", group: "FINANCING", label: "Dividend payout / net income", value: 0.20, unit: "%", format: FORMATS.percent, help: "Applied only to positive net income." },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      const periods = ["BASE / OPENING", "YEAR 1", "YEAR 2", "YEAR 3", "YEAR 4", "YEAR 5"];
      const forecastIndexes = [1, 2, 3, 4, 5];
      const interpolate = (startKey, endKey, periodIndex) => periodIndex === 0
        ? `=${input(startKey)}`
        : `=${input(startKey)}+(${input(endKey)}-${input(startKey)})*${periodIndex - 1}/4`;
      const maxAbs = (series, key, indexes = forecastIndexes) => `=MAX(${indexes.map((index) => `ABS(${series.cell(key, index)})`).join(",")})`;

      setCanvas(sheet, "H", 119);
      setTitle(sheet, "MODEL", `${model.title} · Detailed five-year planner · Full statements and schedules remain visible`, "H");
      sheet.getRange("A1:A119").format.columnWidth = 30;
      sheet.getRange("B1:G119").format.columnWidth = 16;
      sheet.getRange("H1:H119").format.columnWidth = 44;

      mergeValue(sheet, "A10:H11", "Base financial metrics provide the reference case. Opening balances seed the roll-forwards; closing cash is calculated only by the cash flow statement and then linked to the balance sheet.").format = {
        fill: COLORS.paleGold || COLORS.paleAmber,
        font: { color: COLORS.amber, fontSize: 9, typeface: "Aptos" },
        wrapText: true,
        borders: { preset: "outside", style: "thin", color: COLORS.gold || COLORS.line },
      };

      setSection(sheet, 13, "DRIVER RAMP", "H");
      const driverRows = [
        { key: "growth", label: "Revenue growth", format: FORMATS.percent, note: "Applied to prior-year revenue.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : interpolate("growthY1", "growthY5", periodIndex) },
        { key: "grossMargin", label: "Gross margin", format: FORMATS.percent, note: "Revenue less cost of goods sold.", formula: ({ periodIndex }) => interpolate("grossMarginY1", "grossMarginY5", periodIndex) },
        { key: "opexRate", label: "Opex / revenue", format: FORMATS.percent, note: "Recurring operating-cost ratio.", formula: ({ periodIndex }) => interpolate("opexRateY1", "opexRateY5", periodIndex) },
        { key: "dso", label: "Receivable days (DSO)", format: FORMATS.whole, note: "Drives accounts receivable.", formula: ({ periodIndex }) => interpolate("dsoY1", "dsoY5", periodIndex) },
        { key: "dio", label: "Inventory days (DIO)", format: FORMATS.whole, note: "Drives inventory.", formula: ({ periodIndex }) => interpolate("dioY1", "dioY5", periodIndex) },
        { key: "dpo", label: "Payable days (DPO)", format: FORMATS.whole, note: "Drives accounts payable.", formula: ({ periodIndex }) => interpolate("dpoY1", "dpoY5", periodIndex) },
        { key: "capexRate", label: "Capex / revenue", format: FORMATS.percent, note: "Capital-expenditure intensity.", formula: () => `=${input("capexRate")}` },
        { key: "interestRate", label: "Cash interest rate", format: FORMATS.percent, note: "Applied to average debt.", formula: () => `=${input("interestRate")}` },
        { key: "newBorrowing", label: "New borrowing", format: FORMATS.amount, note: "Annual financing inflow.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=${input("newBorrowing")}` },
        { key: "repayment", label: "Requested repayment", format: FORMATS.amount, note: "Capped at available debt.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=${input("requestedRepayment")}` },
        { key: "payout", label: "Dividend payout", format: FORMATS.percent, note: "Applied only to positive net income.", formula: () => `=${input("dividendPayout")}` },
      ];
      const drivers = writeTimeSeries(sheet, { startRow: 14, periods, input, rows: driverRows });

      setSection(sheet, 27, "INCOME STATEMENT", "H");
      const incomeRows = [
        { key: "revenue", label: "Revenue", bold: true, note: "Base is the reference; forecasts roll from the prior year.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("startingRevenue")}` : `=MAX(0,${cell("revenue", periodIndex - 1)}*(1+${drivers.cell("growth", periodIndex)}))` },
        { key: "growth", label: "Growth", format: FORMATS.percent, note: "Forecast driver shown for traceability.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=${drivers.cell("growth", periodIndex)}` },
        { key: "cogs", label: "Cost of goods sold", note: "Negative expense convention.", formula: ({ periodIndex, cell }) => `=-${cell("revenue", periodIndex)}*(1-${drivers.cell("grossMargin", periodIndex)})` },
        { key: "grossProfit", label: "Gross profit", bold: true, fill: COLORS.paleGold || COLORS.paleBlue, note: "Revenue plus cost of goods sold.", formula: ({ periodIndex, cell }) => `=${cell("revenue", periodIndex)}+${cell("cogs", periodIndex)}` },
        { key: "grossMargin", label: "Gross margin", format: FORMATS.percent, note: "Calculated margin check.", formula: ({ periodIndex, cell }) => `=IF(${cell("revenue", periodIndex)}=0,0,${cell("grossProfit", periodIndex)}/${cell("revenue", periodIndex)})` },
        { key: "opex", label: "Operating expenses", note: "Negative expense convention.", formula: ({ periodIndex, cell }) => `=-${cell("revenue", periodIndex)}*${drivers.cell("opexRate", periodIndex)}` },
        { key: "ebitda", label: "EBITDA", bold: true, fill: COLORS.paleGold || COLORS.paleBlue, note: "Gross profit plus operating expenses.", formula: ({ periodIndex, cell }) => `=${cell("grossProfit", periodIndex)}+${cell("opex", periodIndex)}` },
        { key: "ebitdaMargin", label: "EBITDA margin", format: FORMATS.percent, note: "EBITDA divided by revenue.", formula: ({ periodIndex, cell }) => `=IF(${cell("revenue", periodIndex)}=0,0,${cell("ebitda", periodIndex)}/${cell("revenue", periodIndex)})` },
        { key: "depreciation", label: "Depreciation & amortization", note: "Forecast links to the PP&E schedule.", formula: ({ periodIndex }) => periodIndex === 0 ? `=-MIN(MAX(0,${input("openingPpe")}),MAX(0,${input("openingPpe")})*${input("depreciationRate")})` : "=0" },
        { key: "ebit", label: "EBIT", bold: true, note: "EBITDA after depreciation.", formula: ({ periodIndex, cell }) => `=${cell("ebitda", periodIndex)}+${cell("depreciation", periodIndex)}` },
        { key: "interest", label: "Cash interest", note: "Forecast links to average debt.", formula: ({ periodIndex }) => periodIndex === 0 ? `=-MAX(0,${input("openingDebt")})*${input("interestRate")}` : "=0" },
        { key: "ebt", label: "Earnings before tax", bold: true, note: "EBIT after cash interest.", formula: ({ periodIndex, cell }) => `=${cell("ebit", periodIndex)}+${cell("interest", periodIndex)}` },
        { key: "tax", label: "Cash tax", note: "No tax benefit is modeled for losses.", formula: ({ periodIndex, cell }) => `=-MAX(0,${cell("ebt", periodIndex)})*${input("taxRate")}` },
        { key: "netIncome", label: "Net income", bold: true, fill: COLORS.paleGold || COLORS.paleGreen, note: "Flows into retained earnings and cash flow.", formula: ({ periodIndex, cell }) => `=${cell("ebt", periodIndex)}+${cell("tax", periodIndex)}` },
      ];
      const income = writeTimeSeries(sheet, { startRow: 28, periods, input, rows: incomeRows });

      setSection(sheet, 44, "WORKING CAPITAL SCHEDULE", "H");
      const workingCapitalRows = [
        { key: "ar", label: "Accounts receivable", note: "Revenue × DSO / 365.", formula: ({ periodIndex }) => `=${income.cell("revenue", periodIndex)}/365*${drivers.cell("dso", periodIndex)}` },
        { key: "inventory", label: "Inventory", note: "COGS × DIO / 365.", formula: ({ periodIndex }) => `=ABS(${income.cell("cogs", periodIndex)})/365*${drivers.cell("dio", periodIndex)}` },
        { key: "ap", label: "Accounts payable", note: "COGS × DPO / 365.", formula: ({ periodIndex }) => `=ABS(${income.cell("cogs", periodIndex)})/365*${drivers.cell("dpo", periodIndex)}` },
        { key: "nwc", label: "Operating net working capital", bold: true, fill: COLORS.paleGold || COLORS.paleBlue, note: "AR + inventory − AP.", formula: ({ periodIndex, cell }) => `=${cell("ar", periodIndex)}+${cell("inventory", periodIndex)}-${cell("ap", periodIndex)}` },
        { key: "deltaNwc", label: "Change in NWC", note: "Increase is a use of cash.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=${cell("nwc", periodIndex)}-${cell("nwc", periodIndex - 1)}` },
        { key: "cashEffect", label: "Cash effect of NWC", bold: true, note: "Negative of the change in NWC.", formula: ({ periodIndex, cell }) => `=-${cell("deltaNwc", periodIndex)}` },
      ];
      const workingCapital = writeTimeSeries(sheet, { startRow: 45, periods, input, rows: workingCapitalRows });

      setSection(sheet, 53, "PP&E ROLL-FORWARD", "H");
      const ppeRows = [
        { key: "opening", label: "Opening net PP&E", note: "Prior closing balance seeds the next year.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("openingPpe")}` : `=${cell("closing", periodIndex - 1)}` },
        { key: "capex", label: "Capital expenditure", note: "Added to the asset base.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=${income.cell("revenue", periodIndex)}*${drivers.cell("capexRate", periodIndex)}` },
        { key: "depreciation", label: "Depreciation", note: "No same-year depreciation on new capex.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=-MIN(MAX(0,${cell("opening", periodIndex)}+${cell("capex", periodIndex)}),MAX(0,${cell("opening", periodIndex)})*${input("depreciationRate")})` },
        { key: "closing", label: "Closing net PP&E", bold: true, fill: COLORS.paleGold || COLORS.paleBlue, note: "Opening + capex + depreciation.", formula: ({ periodIndex, cell }) => `=SUM(${cell("opening", periodIndex)}:${cell("depreciation", periodIndex)})` },
      ];
      const ppe = writeTimeSeries(sheet, { startRow: 54, periods, input, rows: ppeRows });
      forecastIndexes.forEach((index) => {
        sheet.getRange(income.cell("depreciation", index)).formulas = [[`=${ppe.cell("depreciation", index)}`]];
      });

      setSection(sheet, 60, "DEBT SCHEDULE", "H");
      const debtRows = [
        { key: "opening", label: "Opening debt", note: "Prior closing balance seeds the next year.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("openingDebt")}` : `=${cell("closing", periodIndex - 1)}` },
        { key: "borrowing", label: "New borrowing", note: "Positive financing inflow.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=${drivers.cell("newBorrowing", periodIndex)}` },
        { key: "requested", label: "Requested repayment", note: "User request before the debt cap.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=${drivers.cell("repayment", periodIndex)}` },
        { key: "actual", label: "Actual repayment", note: "Negative cash outflow; cannot exceed debt.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=-MIN(MAX(0,${cell("opening", periodIndex)}+${cell("borrowing", periodIndex)}),MAX(0,${cell("requested", periodIndex)}))` },
        { key: "closing", label: "Closing debt", bold: true, fill: COLORS.paleGold || COLORS.paleBlue, note: "Opening + borrowing + actual repayment.", formula: ({ periodIndex, cell }) => `=${cell("opening", periodIndex)}+${cell("borrowing", periodIndex)}+${cell("actual", periodIndex)}` },
        { key: "average", label: "Average debt", note: "Used for cash interest.", formula: ({ periodIndex, cell }) => `=AVERAGE(${cell("opening", periodIndex)},${cell("closing", periodIndex)})` },
        { key: "interest", label: "Cash interest", bold: true, note: "Negative income-statement expense.", formula: ({ periodIndex, cell }) => `=-${cell("average", periodIndex)}*${drivers.cell("interestRate", periodIndex)}` },
      ];
      const debt = writeTimeSeries(sheet, { startRow: 61, periods, input, rows: debtRows });
      forecastIndexes.forEach((index) => { sheet.getRange(income.cell("interest", index)).formulas = [[`=${debt.cell("interest", index)}`]]; });

      setSection(sheet, 70, "EQUITY & RETAINED EARNINGS", "H");
      const equityRows = [
        { key: "shareCapital", label: "Share capital", note: "Held constant in this planning model.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("shareCapital")}` : `=${cell("shareCapital", periodIndex - 1)}` },
        { key: "openingRe", label: "Opening retained earnings", note: "Base is derived to make the opening balance sheet explicit.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=${cell("closingRe", periodIndex - 1)}` },
        { key: "netIncome", label: "Net income added", note: "Forecast net income increases retained earnings.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=${income.cell("netIncome", periodIndex)}` },
        { key: "dividends", label: "Dividends", note: "Negative equity and financing cash flow.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=-MAX(0,${cell("netIncome", periodIndex)})*${drivers.cell("payout", periodIndex)}` },
        { key: "closingRe", label: "Closing retained earnings", bold: true, fill: COLORS.paleGold || COLORS.paleBlue, note: "Opening retained earnings + net income + dividends.", formula: ({ periodIndex, cell }) => `=SUM(${cell("openingRe", periodIndex)}:${cell("dividends", periodIndex)})` },
        { key: "totalEquity", label: "Total equity", bold: true, note: "Share capital plus retained earnings.", formula: ({ periodIndex, cell }) => `=${cell("shareCapital", periodIndex)}+${cell("closingRe", periodIndex)}` },
      ];
      const equity = writeTimeSeries(sheet, { startRow: 71, periods, input, rows: equityRows });

      setSection(sheet, 79, "CASH FLOW STATEMENT", "H");
      const cashRows = [
        { key: "netIncome", label: "Net income", note: "Starting point for operating cash flow.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=${income.cell("netIncome", periodIndex)}` },
        { key: "da", label: "D&A add-back", note: "Non-cash expense is added back.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=-${income.cell("depreciation", periodIndex)}` },
        { key: "changeAr", label: "Change in accounts receivable", note: "Increase in AR uses cash.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=-(${workingCapital.cell("ar", periodIndex)}-${workingCapital.cell("ar", periodIndex - 1)})` },
        { key: "changeInventory", label: "Change in inventory", note: "Increase in inventory uses cash.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=-(${workingCapital.cell("inventory", periodIndex)}-${workingCapital.cell("inventory", periodIndex - 1)})` },
        { key: "changeAp", label: "Change in accounts payable", note: "Increase in AP provides cash.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=${workingCapital.cell("ap", periodIndex)}-${workingCapital.cell("ap", periodIndex - 1)}` },
        { key: "cfo", label: "Cash flow from operations", bold: true, fill: COLORS.paleGold || COLORS.paleBlue, note: "Net income adjusted for non-cash and working-capital movements.", formula: ({ periodIndex, cell }) => `=SUM(${cell("netIncome", periodIndex)}:${cell("changeAp", periodIndex)})` },
        { key: "capex", label: "Capital expenditure", note: "Investing cash outflow.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=-${ppe.cell("capex", periodIndex)}` },
        { key: "cfi", label: "Cash flow from investing", bold: true, note: "Capex only in this planning scope.", formula: ({ periodIndex, cell }) => `=${cell("capex", periodIndex)}` },
        { key: "borrowing", label: "New borrowing", note: "Financing cash inflow.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=${debt.cell("borrowing", periodIndex)}` },
        { key: "repayment", label: "Debt repayment", note: "Financing cash outflow.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=${debt.cell("actual", periodIndex)}` },
        { key: "dividends", label: "Dividends", note: "Financing cash outflow.", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=${equity.cell("dividends", periodIndex)}` },
        { key: "cff", label: "Cash flow from financing", bold: true, note: "Borrowing less repayment and dividends.", formula: ({ periodIndex, cell }) => `=SUM(${cell("borrowing", periodIndex)}:${cell("dividends", periodIndex)})` },
        { key: "netChange", label: "Net change in cash", bold: true, fill: COLORS.paleGold || COLORS.paleBlue, note: "CFO + CFI + CFF.", formula: ({ periodIndex, cell }) => `=SUM(${cell("cfo", periodIndex)},${cell("cfi", periodIndex)},${cell("cff", periodIndex)})` },
        { key: "openingCash", label: "Opening cash", note: "Prior closing cash seeds the next year.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("openingCash")}` : `=${cell("closingCash", periodIndex - 1)}` },
        { key: "closingCash", label: "Closing cash", bold: true, fill: COLORS.paleGold || COLORS.paleGreen, note: "Calculated once here, then linked into the balance sheet.", formula: ({ periodIndex, cell }) => `=${cell("openingCash", periodIndex)}+${cell("netChange", periodIndex)}` },
        { key: "cashCheck", label: "Cash roll-forward check", note: "Must equal zero.", formula: ({ periodIndex, cell }) => `=ROUND(${cell("closingCash", periodIndex)}-${cell("openingCash", periodIndex)}-${cell("netChange", periodIndex)},6)` },
      ];
      const cash = writeTimeSeries(sheet, { startRow: 80, periods, input, rows: cashRows });

      setSection(sheet, 98, "BALANCE SHEET", "H");
      const balanceRows = [
        { key: "cash", label: "Cash", note: "Linked directly from the cash flow statement.", formula: ({ periodIndex }) => `=${cash.cell("closingCash", periodIndex)}` },
        { key: "ar", label: "Accounts receivable", note: "Linked from the working-capital schedule.", formula: ({ periodIndex }) => `=${workingCapital.cell("ar", periodIndex)}` },
        { key: "inventory", label: "Inventory", note: "Linked from the working-capital schedule.", formula: ({ periodIndex }) => `=${workingCapital.cell("inventory", periodIndex)}` },
        { key: "ppe", label: "Net PP&E", note: "Linked from the PP&E roll-forward.", formula: ({ periodIndex }) => `=${ppe.cell("closing", periodIndex)}` },
        { key: "totalAssets", label: "Total assets", bold: true, fill: COLORS.paleGold || COLORS.paleBlue, note: "Cash + AR + inventory + PP&E.", formula: ({ periodIndex, cell }) => `=SUM(${cell("cash", periodIndex)}:${cell("ppe", periodIndex)})` },
        { key: "ap", label: "Accounts payable", note: "Linked from the working-capital schedule.", formula: ({ periodIndex }) => `=${workingCapital.cell("ap", periodIndex)}` },
        { key: "debt", label: "Debt", note: "Linked from the debt schedule.", formula: ({ periodIndex }) => `=${debt.cell("closing", periodIndex)}` },
        { key: "shareCapital", label: "Share capital", note: "Linked from the equity schedule.", formula: ({ periodIndex }) => `=${equity.cell("shareCapital", periodIndex)}` },
        { key: "retainedEarnings", label: "Retained earnings", note: "Linked from the retained-earnings roll-forward.", formula: ({ periodIndex }) => `=${equity.cell("closingRe", periodIndex)}` },
        { key: "totalLiabilitiesEquity", label: "Total liabilities & equity", bold: true, fill: COLORS.paleGold || COLORS.paleBlue, note: "AP + debt + share capital + retained earnings.", formula: ({ periodIndex, cell }) => `=SUM(${cell("ap", periodIndex)}:${cell("retainedEarnings", periodIndex)})` },
        { key: "balanceCheck", label: "Balance check", bold: true, note: "Must equal zero in every period.", formula: ({ periodIndex, cell }) => `=ROUND(${cell("totalAssets", periodIndex)}-${cell("totalLiabilitiesEquity", periodIndex)},6)` },
      ];
      const balance = writeTimeSeries(sheet, { startRow: 99, periods, input, rows: balanceRows });
      sheet.getRange(equity.cell("openingRe", 0)).formulas = [[`=${balance.cell("totalAssets", 0)}-${balance.cell("ap", 0)}-${balance.cell("debt", 0)}-${balance.cell("shareCapital", 0)}`]];

      setSection(sheet, 112, "MODEL CONTROL & BUSINESS OUTCOME", "H");
      const controlRows = [
        { key: "maxBalance", label: "Maximum balance-sheet difference", bold: true, note: "Consolidated control shown in Base column.", formula: ({ periodIndex }) => periodIndex === 0 ? maxAbs(balance, "balanceCheck", [0, 1, 2, 3, 4, 5]) : "=0" },
        { key: "maxCash", label: "Maximum cash roll-forward difference", bold: true, note: "Consolidated control shown in Base column.", formula: ({ periodIndex }) => periodIndex === 0 ? maxAbs(cash, "cashCheck", [0, 1, 2, 3, 4, 5]) : "=0" },
        { key: "minimumCash", label: "Minimum forecast cash", bold: true, note: "Negative cash is an outcome warning, not a formula error.", formula: ({ periodIndex }) => periodIndex === 0 ? `=MIN(${forecastIndexes.map((index) => cash.cell("closingCash", index)).join(",")})` : "=0" },
        { key: "outcome", label: "Funding outcome", bold: true, fill: COLORS.paleGold || COLORS.paleAmber, format: FORMATS.status || "General", note: "Separate from calculation status.", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=IF(${cell("minimumCash", 0)}<0,"FUNDING NEEDED","SELF-FUNDED")` : `=""` },
      ];
      const controls = writeTimeSeries(sheet, { startRow: 113, periods, input, rows: controlRows });

      const kpiCells = writeKpis(sheet, [
        { label: "FINAL REVENUE", formula: `=${income.cell("revenue", 5)}`, format: FORMATS.amount },
        { label: "FINAL EBITDA", formula: `=${income.cell("ebitda", 5)}`, format: FORMATS.amount },
        { label: "FINAL NET INCOME", formula: `=${income.cell("netIncome", 5)}`, format: FORMATS.amount },
        { label: "FINAL CASH", formula: `=${cash.cell("closingCash", 5)}`, format: FORMATS.amount },
      ]);
      setFooter(sheet, 119, "H", `${model.title} · v${version} · Green = links to Inputs · Black = calculated formulas`);

      const isResiduals = forecastIndexes.flatMap((index) => [
        `ABS(${resultRef(income.cell("grossProfit", index))}-(${resultRef(income.cell("revenue", index))}+${resultRef(income.cell("cogs", index))}))`,
        `ABS(${resultRef(income.cell("ebitda", index))}-(${resultRef(income.cell("grossProfit", index))}+${resultRef(income.cell("opex", index))}))`,
        `ABS(${resultRef(income.cell("ebit", index))}-(${resultRef(income.cell("ebitda", index))}+${resultRef(income.cell("depreciation", index))}))`,
        `ABS(${resultRef(income.cell("netIncome", index))}-(${resultRef(income.cell("ebt", index))}+${resultRef(income.cell("tax", index))}))`,
      ]);
      return {
        kpiCells,
        outcomeCell: controls.cell("outcome", 0),
        outcomeLabel: "FUNDING OUTCOME",
        checks: [
          { label: "Input ranges are valid", actual: `=IF(AND(${input("startingRevenue")}>=0,${input("growthY1")}>-1,${input("growthY1")}<=1,${input("growthY5")}>-1,${input("growthY5")}<=1,${input("grossMarginY1")}>=0,${input("grossMarginY1")}<=1,${input("grossMarginY5")}>=0,${input("grossMarginY5")}<=1,${input("opexRateY1")}>=0,${input("opexRateY1")}<=1,${input("opexRateY5")}>=0,${input("opexRateY5")}<=1,${input("taxRate")}>=0,${input("taxRate")}<=1,${input("dsoY1")}>=0,${input("dsoY5")}>=0,${input("dioY1")}>=0,${input("dioY5")}>=0,${input("dpoY1")}>=0,${input("dpoY5")}>=0,${input("openingCash")}>=0,${input("openingPpe")}>=0,${input("capexRate")}>=0,${input("capexRate")}<=1,${input("depreciationRate")}>=0,${input("depreciationRate")}<=1,${input("openingDebt")}>=0,${input("newBorrowing")}>=0,${input("requestedRepayment")}>=0,${input("interestRate")}>=0,${input("interestRate")}<=1,${input("shareCapital")}>=0,${input("dividendPayout")}>=0,${input("dividendPayout")}<=1),1,0)`, expected: "=1", fix: "Inputs: review highlighted assumptions" },
          { label: "Income-statement arithmetic ties", actual: `=MAX(${isResiduals.join(",")})`, expected: "=0", fix: "Model: income statement", format: FORMATS.amount },
          { label: "Working-capital schedule ties", actual: `=MAX(${forecastIndexes.flatMap((index) => [`ABS(${resultRef(workingCapital.cell("nwc", index))}-(${resultRef(workingCapital.cell("ar", index))}+${resultRef(workingCapital.cell("inventory", index))}-${resultRef(workingCapital.cell("ap", index))}))`, `ABS(${resultRef(workingCapital.cell("cashEffect", index))}+${resultRef(workingCapital.cell("deltaNwc", index))})`]).join(",")})`, expected: "=0", fix: "Model: working capital", format: FORMATS.amount },
          { label: "PP&E roll-forward ties", actual: `=MAX(${forecastIndexes.map((index) => `ABS(${resultRef(ppe.cell("closing", index))}-SUM(${resultRef(ppe.cell("opening", index))},${resultRef(ppe.cell("capex", index))},${resultRef(ppe.cell("depreciation", index))}))`).join(",")})`, expected: "=0", fix: "Model: PP&E roll-forward", format: FORMATS.amount },
          { label: "Debt roll-forward ties", actual: `=MAX(${forecastIndexes.map((index) => `ABS(${resultRef(debt.cell("closing", index))}-SUM(${resultRef(debt.cell("opening", index))},${resultRef(debt.cell("borrowing", index))},${resultRef(debt.cell("actual", index))}))`).join(",")})`, expected: "=0", fix: "Model: debt schedule", format: FORMATS.amount },
          { label: "Retained earnings roll-forward ties", actual: `=MAX(${forecastIndexes.map((index) => `ABS(${resultRef(equity.cell("closingRe", index))}-SUM(${resultRef(equity.cell("openingRe", index))},${resultRef(equity.cell("netIncome", index))},${resultRef(equity.cell("dividends", index))}))`).join(",")})`, expected: "=0", fix: "Model: equity schedule", format: FORMATS.amount },
          { label: "Cash roll-forward and BS link tie", actual: `=MAX(${[0, 1, 2, 3, 4, 5].flatMap((index) => [`ABS(${resultRef(cash.cell("cashCheck", index))})`, `ABS(${resultRef(cash.cell("closingCash", index))}-${resultRef(balance.cell("cash", index))})`]).join(",")})`, expected: "=0", fix: "Model: cash flow and balance sheet", format: FORMATS.amount },
          { label: "Balance sheet ties and schedules stay nonnegative", actual: `=IF(AND(MAX(${[0, 1, 2, 3, 4, 5].map((index) => `ABS(${resultRef(balance.cell("balanceCheck", index))})`).join(",")})<=0.0001,MIN(${forecastIndexes.flatMap((index) => [resultRef(income.cell("revenue", index)), resultRef(workingCapital.cell("ar", index)), resultRef(workingCapital.cell("inventory", index)), resultRef(ppe.cell("closing", index)), resultRef(debt.cell("closing", index))]).join(",")})>=0),1,0)`, expected: "=1", fix: "Model: balance sheet and roll-forwards" },
        ],
      };
    },
  };

  const budgetForecast = {
    slug: "budget-rolling-forecast",
    styleVariant: "option-c",
    checkLimit: 10,
    decision: "Where will the next 12 months land versus budget?",
    horizon: "Next 12 months",
    tags: ["Budget", "Rolling forecast", "EBITDA"],
    included: ["One 12-month revenue forecast", "Revenue and EBITDA budget gaps", "A simple operating cash proxy"],
    excluded: "Monthly source grids, prior year, WAPE, scenarios, sensitivities, and department workflows.",
    inputs: [
      { key: "startingRevenue", group: "FORECAST DRIVERS", label: "Starting monthly revenue", value: 100, unit: "LCY000", format: FORMATS.amount, help: "Latest monthly run rate" },
      { key: "monthlyGrowth", group: "FORECAST DRIVERS", label: "Monthly revenue growth", value: 0.03, unit: "%", format: FORMATS.percent, help: "One rate for 12 months" },
      { key: "grossMargin", group: "FORECAST DRIVERS", label: "Gross margin", value: 0.38, unit: "%", format: FORMATS.percent, help: "Revenue after direct cost" },
      { key: "opexRate", group: "FORECAST DRIVERS", label: "Opex / revenue", value: 0.22, unit: "%", format: FORMATS.percent, help: "Operating expense rate" },
      { key: "revenueBudget", group: "BUDGET & CASH", label: "Annual revenue budget", value: 1329, unit: "LCY000", format: FORMATS.amount, help: "Approved full-year target" },
      { key: "ebitdaBudget", group: "BUDGET & CASH", label: "Annual EBITDA budget", value: 199.8, unit: "LCY000", format: FORMATS.amount, help: "Approved full-year target" },
      { key: "cashConversion", group: "BUDGET & CASH", label: "EBITDA cash conversion", value: 0.72, unit: "%", format: FORMATS.percent, help: "EBITDA converted to cash" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      setCanvas(sheet, "M", 38);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Twelve-month outlook`, "M");
      setSection(sheet, 10, "MONTHLY FORECAST", "M");
      const series = writeTimeSeries(sheet, {
        startRow: 11,
        periods: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        input,
        rows: [
          { key: "revenue", label: "Forecast revenue", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("startingRevenue")}*(1+${input("monthlyGrowth")})` : `=${cell("revenue", periodIndex - 1)}*(1+${input("monthlyGrowth")})`, format: FORMATS.amount, bold: true },
          { key: "budgetRevenue", label: "Budget revenue", formula: () => `=${input("revenueBudget")}/12`, format: FORMATS.amount },
          { key: "revenueVariance", label: "Revenue variance", formula: ({ periodIndex, cell }) => `=${cell("revenue", periodIndex)}-${cell("budgetRevenue", periodIndex)}`, format: FORMATS.amount, bold: true, fill: COLORS.paleGold || COLORS.paleBlue },
          { key: "grossProfit", label: "Gross profit", formula: ({ periodIndex, cell }) => `=${cell("revenue", periodIndex)}*${input("grossMargin")}`, format: FORMATS.amount },
          { key: "opex", label: "Operating expense", formula: ({ periodIndex, cell }) => `=-${cell("revenue", periodIndex)}*${input("opexRate")}`, format: FORMATS.amount },
          { key: "ebitda", label: "Forecast EBITDA", formula: ({ periodIndex, cell }) => `=${cell("grossProfit", periodIndex)}+${cell("opex", periodIndex)}`, format: FORMATS.amount, bold: true, fill: COLORS.paleGold || COLORS.paleGreen },
          { key: "budgetEbitda", label: "Budget EBITDA", formula: () => `=${input("ebitdaBudget")}/12`, format: FORMATS.amount },
          { key: "ebitdaVariance", label: "EBITDA variance", formula: ({ periodIndex, cell }) => `=${cell("ebitda", periodIndex)}-${cell("budgetEbitda", periodIndex)}`, format: FORMATS.amount, bold: true },
          { key: "cash", label: "Operating cash", formula: ({ periodIndex, cell }) => `=${cell("ebitda", periodIndex)}*${input("cashConversion")}`, format: FORMATS.amount },
          { key: "cumulativeCash", label: "Cumulative operating cash", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("cash", periodIndex)}` : `=${cell("cumulativeCash", periodIndex - 1)}+${cell("cash", periodIndex)}`, format: FORMATS.amount, bold: true },
        ],
      });
      setSection(sheet, 23, "ANNUAL SUMMARY", "M");
      const summary = writeScalarTable(sheet, {
        startRow: 24,
        rows: [
          { key: "annualRevenue", label: "12-month revenue", formula: `=SUM(${series.cell("revenue", 0)}:${series.cell("revenue", 11)})`, unit: "LCY000", help: "Sum of monthly forecast", format: FORMATS.amount, bold: true },
          { key: "revenueVariance", label: "Revenue vs budget", formula: `=B25-${input("revenueBudget")}`, unit: "LCY000", help: "Positive is favorable", format: FORMATS.amount, bold: true },
          { key: "annualEbitda", label: "12-month EBITDA", formula: `=SUM(${series.cell("ebitda", 0)}:${series.cell("ebitda", 11)})`, unit: "LCY000", help: "Sum of monthly EBITDA", format: FORMATS.amount, bold: true },
          { key: "ebitdaVariance", label: "EBITDA vs budget", formula: `=B27-${input("ebitdaBudget")}`, unit: "LCY000", help: "Positive is favorable", format: FORMATS.amount, bold: true },
          { key: "annualCash", label: "Operating cash", formula: `=SUM(${series.cell("cash", 0)}:${series.cell("cash", 11)})`, unit: "LCY000", help: "Simple cash proxy", format: FORMATS.amount },
          { key: "endingRevenue", label: "Month 12 revenue", formula: `=${series.cell("revenue", 11)}`, unit: "LCY000", help: "Exit run rate", format: FORMATS.amount },
        ],
      });
      const kpiCells = writeKpis(sheet, [
        { label: "12M REVENUE", formula: `=${summary.cell("annualRevenue")}`, format: FORMATS.amount },
        { label: "REVENUE GAP", formula: `=${summary.cell("revenueVariance")}`, format: FORMATS.amount },
        { label: "12M EBITDA", formula: `=${summary.cell("annualEbitda")}`, format: FORMATS.amount },
        { label: "EBITDA GAP", formula: `=${summary.cell("ebitdaVariance")}`, format: FORMATS.amount },
      ]);
      writeOutcome(sheet, "A34:M35", `=IF(AND(${summary.cell("revenueVariance")}>=0,${summary.cell("ebitdaVariance")}>=0),"OUTCOME: Revenue and EBITDA are above budget.",IF(${summary.cell("revenueVariance")}>=0,"OUTCOME: Revenue is above budget, but EBITDA is below.","OUTCOME: Revenue is below budget."))`);
      setFooter(sheet, 38, "M", `${model.title} · v${version}`);
      return {
        kpiCells,
        outcomeCell: "A34",
        outcomeLabel: "BUDGET OUTCOME",
        checks: [
          { label: "Forecast inputs are valid", actual: `=IF(AND(${input("startingRevenue")}>=0,${input("monthlyGrowth")}>-1,${input("monthlyGrowth")}<=1,${input("grossMargin")}>=0,${input("grossMargin")}<=1,${input("opexRate")}>=0,${input("opexRate")}<=1,${input("revenueBudget")}>=0,${input("ebitdaBudget")}>=0,${input("cashConversion")}>=0,${input("cashConversion")}<=1),1,0)`, expected: "=1", fix: "Inputs: forecast and budget drivers" },
          { label: "Revenue roll-forward is consistent", actual: `=MAX(${Array.from({ length: 12 }, (_, index) => index === 0 ? `ABS(${resultRef(series.cell("revenue", 0))}-${input("startingRevenue")}*(1+${input("monthlyGrowth")}))` : `ABS(${resultRef(series.cell("revenue", index))}-${resultRef(series.cell("revenue", index - 1))}*(1+${input("monthlyGrowth")}))`).join(",")})`, expected: "=0", fix: "Model: monthly revenue", format: FORMATS.amount },
          { label: "Monthly gross profit ties", actual: `=MAX(${Array.from({ length: 12 }, (_, index) => `ABS(${resultRef(series.cell("grossProfit", index))}-${resultRef(series.cell("revenue", index))}*${input("grossMargin")})`).join(",")})`, expected: "=0", fix: "Model: gross profit", format: FORMATS.amount },
          { label: "Monthly EBITDA bridge ties", actual: `=MAX(${Array.from({ length: 12 }, (_, index) => `ABS(${resultRef(series.cell("ebitda", index))}-(${resultRef(series.cell("grossProfit", index))}+${resultRef(series.cell("opex", index))}))`).join(",")})`, expected: "=0", fix: "Model: EBITDA", format: FORMATS.amount },
          { label: "Annual revenue and gap tie", actual: `=ABS(${resultRef(summary.cell("annualRevenue"))}-SUM(${resultRange(series.cell("revenue", 0), series.cell("revenue", 11))}))+ABS(${resultRef(summary.cell("revenueVariance"))}-(${resultRef(summary.cell("annualRevenue"))}-${input("revenueBudget")}))`, expected: "=0", fix: "Model: revenue summary", format: FORMATS.amount },
          { label: "Annual EBITDA and gap tie", actual: `=ABS(${resultRef(summary.cell("annualEbitda"))}-SUM(${resultRange(series.cell("ebitda", 0), series.cell("ebitda", 11))}))+ABS(${resultRef(summary.cell("ebitdaVariance"))}-(${resultRef(summary.cell("annualEbitda"))}-${input("ebitdaBudget")}))`, expected: "=0", fix: "Model: EBITDA summary", format: FORMATS.amount },
          { label: "Operating cash conversion ties", actual: `=MAX(${Array.from({ length: 12 }, (_, index) => `ABS(${resultRef(series.cell("cash", index))}-${resultRef(series.cell("ebitda", index))}*${input("cashConversion")})`).join(",")})`, expected: "=0", fix: "Model: operating cash", format: FORMATS.amount },
          { label: "Cumulative cash roll-forward ties", actual: `=ABS(${resultRef(series.cell("cumulativeCash", 11))}-SUM(${resultRange(series.cell("cash", 0), series.cell("cash", 11))}))`, expected: "=0", fix: "Model: cumulative cash", format: FORMATS.amount },
        ],
      };
    },
  };

  const cashFlow13Week = {
    slug: "thirteen-week-cash-flow",
    styleVariant: "option-c",
    checkLimit: 10,
    decision: "When will cash tighten, and how much facility is needed?",
    horizon: "13 weeks",
    tags: ["Liquidity", "Cash runway", "Facility draw"],
    included: ["A 13-week direct cash forecast", "Automatic facility draw and repayment", "Peak funding and closing liquidity"],
    excluded: "Invoice-level inputs, payment priority law, bank feeds, interest, scenarios, and sensitivities.",
    inputs: [
      { key: "openingCash", group: "OPENING LIQUIDITY", label: "Opening cash", value: 90, unit: "LCY000", format: FORMATS.amount, help: "Cash before week one" },
      { key: "minimumCash", group: "OPENING LIQUIDITY", label: "Minimum cash", value: 55, unit: "LCY000", format: FORMATS.amount, help: "Policy floor" },
      { key: "facilityLimit", group: "OPENING LIQUIDITY", label: "Facility limit", value: 140, unit: "LCY000", format: FORMATS.amount, help: "Maximum committed funding" },
      { key: "weeklyReceipts", group: "WEEKLY OPERATIONS", label: "Scheduled receipts / week", value: 60, unit: "LCY000", format: FORMATS.amount, help: "Same simple weekly run rate" },
      { key: "receiptRate", group: "WEEKLY OPERATIONS", label: "Receipt realization", value: 0.9, unit: "%", format: FORMATS.percent, help: "Share collected on time" },
      { key: "supplierPayments", group: "WEEKLY OPERATIONS", label: "Supplier payments / week", value: 45, unit: "LCY000", format: FORMATS.amount, help: "Weekly supplier cash outflow" },
      { key: "payroll", group: "WEEKLY OPERATIONS", label: "Payroll every second week", value: 20, unit: "LCY000", format: FORMATS.amount, help: "Paid in W1, W3, W5, and so on" },
      { key: "otherOutflows", group: "WEEKLY OPERATIONS", label: "Other outflows / week", value: 5, unit: "LCY000", format: FORMATS.amount, help: "Recurring operating cash outflow" },
      { key: "taxPayment", group: "TIMED PAYMENT", label: "Tax payment", value: 10, unit: "LCY000", format: FORMATS.amount, help: "One payment in the selected week" },
      { key: "taxWeek", group: "TIMED PAYMENT", label: "Tax payment week", value: 5, unit: "Week", format: FORMATS.whole, help: "Whole number from 1 to 13" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      setCanvas(sheet, "N", 39);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Thirteen-week liquidity view`, "N");
      setSection(sheet, 10, "WEEKLY CASH", "N");
      const series = writeTimeSeries(sheet, {
        startRow: 11,
        periods: Array.from({ length: 13 }, (_, index) => `W${index + 1}`),
        input,
        rows: [
          { key: "openingCash", label: "Opening cash", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("openingCash")}` : `=${cell("closingCash", periodIndex - 1)}`, format: FORMATS.amount },
          { key: "receipts", label: "Receipts", formula: () => `=${input("weeklyReceipts")}*${input("receiptRate")}`, format: FORMATS.amount },
          { key: "suppliers", label: "Supplier payments", formula: () => `=-${input("supplierPayments")}`, format: FORMATS.amount },
          { key: "payroll", label: "Payroll", formula: ({ periodIndex }) => `=IF(MOD(${periodIndex + 1},2)=1,-${input("payroll")},0)`, format: FORMATS.amount },
          { key: "tax", label: "Tax", formula: ({ periodIndex }) => `=IF(${periodIndex + 1}=${input("taxWeek")},-${input("taxPayment")},0)`, format: FORMATS.amount },
          { key: "other", label: "Other outflows", formula: () => `=-${input("otherOutflows")}`, format: FORMATS.amount },
          { key: "preFunding", label: "Cash before funding", formula: ({ periodIndex, cell }) => `=SUM(${cell("openingCash", periodIndex)}:${cell("other", periodIndex)})`, format: FORMATS.amount, bold: true },
          { key: "openingFacility", label: "Opening facility", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=${cell("closingFacility", periodIndex - 1)}`, format: FORMATS.amount },
          { key: "draw", label: "Facility draw", formula: ({ periodIndex, cell }) => `=MIN(MAX(0,${input("facilityLimit")}-${cell("openingFacility", periodIndex)}),MAX(0,${input("minimumCash")}-${cell("preFunding", periodIndex)}))`, format: FORMATS.amount },
          { key: "repayment", label: "Facility repayment", formula: ({ periodIndex, cell }) => `=-MIN(${cell("openingFacility", periodIndex)}+${cell("draw", periodIndex)},MAX(0,${cell("preFunding", periodIndex)}-${input("minimumCash")}))`, format: FORMATS.amount },
          { key: "closingFacility", label: "Closing facility", formula: ({ periodIndex, cell }) => `=SUM(${cell("openingFacility", periodIndex)}:${cell("repayment", periodIndex)})`, format: FORMATS.amount, bold: true },
          { key: "closingCash", label: "Closing cash", formula: ({ periodIndex, cell }) => `=SUM(${cell("preFunding", periodIndex)},${cell("draw", periodIndex)},${cell("repayment", periodIndex)})`, format: FORMATS.amount, bold: true, fill: COLORS.paleGreen },
          { key: "fundingGap", label: "Unfunded gap", formula: ({ periodIndex, cell }) => `=MAX(0,${input("minimumCash")}-${cell("closingCash", periodIndex)})`, format: FORMATS.amount },
          { key: "cashCheck", label: "Cash check", formula: ({ periodIndex, cell }) => `=${cell("closingCash", periodIndex)}-SUM(${cell("openingCash", periodIndex)},${cell("receipts", periodIndex)},${cell("suppliers", periodIndex)},${cell("payroll", periodIndex)},${cell("tax", periodIndex)},${cell("other", periodIndex)},${cell("draw", periodIndex)},${cell("repayment", periodIndex)})`, format: FORMATS.amount },
          { key: "facilityCheck", label: "Facility check", formula: ({ periodIndex, cell }) => `=${cell("closingFacility", periodIndex)}-SUM(${cell("openingFacility", periodIndex)},${cell("draw", periodIndex)},${cell("repayment", periodIndex)})`, format: FORMATS.amount },
        ],
      });
      setSection(sheet, 28, "LIQUIDITY SUMMARY", "N");
      const summary = writeScalarTable(sheet, {
        startRow: 29,
        rows: [
          { key: "minimumClosingCash", label: "Minimum closing cash", formula: `=MIN(${series.cell("closingCash", 0)}:${series.cell("closingCash", 12)})`, unit: "LCY000", help: "Lowest funded cash balance", format: FORMATS.amount },
          { key: "peakFacility", label: "Peak facility draw", formula: `=MAX(${series.cell("closingFacility", 0)}:${series.cell("closingFacility", 12)})`, unit: "LCY000", help: "Maximum funding used", format: FORMATS.amount, bold: true },
          { key: "closingCash", label: "Week 13 closing cash", formula: `=${series.cell("closingCash", 12)}`, unit: "LCY000", help: "Ending liquidity", format: FORMATS.amount, bold: true },
          { key: "unusedFacility", label: "Unused facility", formula: `=MAX(0,${input("facilityLimit")}-B31)`, unit: "LCY000", help: "Limit less peak use", format: FORMATS.amount },
          { key: "peakGap", label: "Peak unfunded gap", formula: `=MAX(${series.cell("fundingGap", 0)}:${series.cell("fundingGap", 12)})`, unit: "LCY000", help: "Liquidity not covered by facility", format: FORMATS.amount },
        ],
      });
      const kpiCells = writeKpis(sheet, [
        { label: "MINIMUM CASH", formula: `=${summary.cell("minimumClosingCash")}`, format: FORMATS.amount },
        { label: "PEAK FACILITY", formula: `=${summary.cell("peakFacility")}`, format: FORMATS.amount },
        { label: "CLOSING CASH", formula: `=${summary.cell("closingCash")}`, format: FORMATS.amount },
        { label: "FACILITY LEFT", formula: `=${summary.cell("unusedFacility")}`, format: FORMATS.amount },
      ]);
      writeOutcome(sheet, "A36:N37", `=IF(${summary.cell("peakGap")}>0,"OUTCOME: Facility is not enough.",IF(${summary.cell("peakFacility")}>0,"OUTCOME: A facility draw is required.","OUTCOME: No facility draw is required."))`);
      setFooter(sheet, 39, "N", `${model.title} · v${version}`);
      return {
        kpiCells,
        outcomeCell: "A36",
        outcomeLabel: "LIQUIDITY OUTCOME",
        checks: [
          { label: "Liquidity inputs are valid", actual: `=IF(AND(${input("openingCash")}>=0,${input("minimumCash")}>=0,${input("facilityLimit")}>=0,${input("weeklyReceipts")}>=0,${input("receiptRate")}>=0,${input("receiptRate")}<=1,${input("supplierPayments")}>=0,${input("payroll")}>=0,${input("otherOutflows")}>=0,${input("taxPayment")}>=0),1,0)`, expected: "=1", fix: "Inputs: liquidity and weekly cash drivers" },
          { label: "Tax week is valid", actual: `=IF(AND(${input("taxWeek")}>=1,${input("taxWeek")}<=13,${input("taxWeek")}=INT(${input("taxWeek")})),1,0)`, expected: "=1", fix: "Inputs: tax week" },
          { label: "Weekly receipts are calculated", actual: `=MAX(${Array.from({ length: 13 }, (_, index) => `ABS(${resultRef(series.cell("receipts", index))}-${input("weeklyReceipts")}*${input("receiptRate")})`).join(",")})`, expected: "=0", fix: "Model: receipts", format: FORMATS.amount },
          { label: "Cash before funding bridge ties", actual: `=MAX(${Array.from({ length: 13 }, (_, index) => `ABS(${resultRef(series.cell("preFunding", index))}-SUM(${resultRef(series.cell("openingCash", index))},${resultRef(series.cell("receipts", index))},${resultRef(series.cell("suppliers", index))},${resultRef(series.cell("payroll", index))},${resultRef(series.cell("tax", index))},${resultRef(series.cell("other", index))}))`).join(",")})`, expected: "=0", fix: "Model: pre-funding cash", format: FORMATS.amount },
          { label: "Funding mechanics respect the facility", actual: `=IF(AND(MIN(${resultRange(series.cell("draw", 0), series.cell("draw", 12))})>=0,MAX(${resultRange(series.cell("closingFacility", 0), series.cell("closingFacility", 12))})<=${input("facilityLimit")}+0.0001,MAX(${resultRange(series.cell("repayment", 0), series.cell("repayment", 12))})<=0),1,0)`, expected: "=1", fix: "Model: draw and repayment" },
          { label: "Cash roll-forward ties", actual: `=MAX(${Array.from({ length: 13 }, (_, index) => `ABS(${resultRef(series.cell("cashCheck", index))})`).join(",")})`, expected: "=0", fix: "Model: weekly cash", format: FORMATS.amount },
          { label: "Facility roll-forward ties", actual: `=MAX(${Array.from({ length: 13 }, (_, index) => `ABS(${resultRef(series.cell("facilityCheck", index))})`).join(",")})`, expected: "=0", fix: "Model: facility", format: FORMATS.amount },
          { label: "Liquidity summary ties", actual: `=ABS(${resultRef(summary.cell("minimumClosingCash"))}-MIN(${resultRange(series.cell("closingCash", 0), series.cell("closingCash", 12))}))+ABS(${resultRef(summary.cell("peakFacility"))}-MAX(${resultRange(series.cell("closingFacility", 0), series.cell("closingFacility", 12))}))+ABS(${resultRef(summary.cell("closingCash"))}-${resultRef(series.cell("closingCash", 12))})`, expected: "=0", fix: "Model: liquidity summary", format: FORMATS.amount },
        ],
      };
    },
  };

  const capexBusinessCase = {
    slug: "capex-business-case",
    styleVariant: "option-c",
    checkLimit: 10,
    decision: "Does this investment create value and repay itself fast enough?",
    horizon: "Year 0 plus five years",
    tags: ["Capex", "NPV", "Payback"],
    included: ["One investment and one benefit stream", "NPV, IRR, and payback", "Final salvage and working-capital recovery"],
    excluded: "Monthly phasing, financing, tax depreciation, scenarios, sensitivities, incentives, and real options.",
    inputs: [
      { key: "investment", group: "INITIAL FUNDING", label: "Initial investment", value: 300, unit: "LCY000", format: FORMATS.amount, help: "Cash paid at year zero" },
      { key: "workingCapital", group: "INITIAL FUNDING", label: "Initial working capital", value: 15, unit: "LCY000", format: FORMATS.amount, help: "Invested at start; recovered at end" },
      { key: "annualBenefit", group: "OPERATING CASE", label: "Annual gross benefit", value: 180, unit: "LCY000", format: FORMATS.amount, help: "Revenue or savings before costs" },
      { key: "realization", group: "OPERATING CASE", label: "Benefit realization", value: 0.9, unit: "%", format: FORMATS.percent, help: "Share of gross benefit achieved" },
      { key: "variableCost", group: "OPERATING CASE", label: "Variable cost / benefit", value: 0.32, unit: "%", format: FORMATS.percent, help: "Cost linked to realized benefit" },
      { key: "fixedCost", group: "OPERATING CASE", label: "Annual fixed cost", value: 15, unit: "LCY000", format: FORMATS.amount, help: "Recurring operating cost" },
      { key: "projectLife", group: "VALUATION", label: "Project life", value: 5, unit: "Years", format: FORMATS.whole, help: "Whole number from 1 to 5" },
      { key: "taxRate", group: "VALUATION", label: "Tax rate", value: 0.2, unit: "%", format: FORMATS.percent, help: "Cash tax on positive EBIT" },
      { key: "discountRate", group: "VALUATION", label: "Discount rate", value: 0.12, unit: "%", format: FORMATS.percent, help: "Required return" },
      { key: "salvage", group: "VALUATION", label: "Salvage value", value: 20, unit: "LCY000", format: FORMATS.amount, help: "Recovered in final year" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      setCanvas(sheet, "H", 34);
      setTitle(sheet, "MODEL DETAIL", `${model.title} · Five-year investment test`, "H");
      setSection(sheet, 10, "PROJECT CASH FLOW", "H");
      const series = writeTimeSeries(sheet, {
        startRow: 11,
        periods: ["Y0", "Y1", "Y2", "Y3", "Y4", "Y5"],
        input,
        rows: [
          { key: "benefit", label: "Realized benefit", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=IF(${periodIndex}<=${input("projectLife")},${input("annualBenefit")}*${input("realization")},0)`, format: FORMATS.amount },
          { key: "variableCost", label: "Variable cost", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=-${cell("benefit", periodIndex)}*${input("variableCost")}`, format: FORMATS.amount },
          { key: "fixedCost", label: "Fixed cost", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=IF(${periodIndex}<=${input("projectLife")},-${input("fixedCost")},0)`, format: FORMATS.amount },
          { key: "depreciation", label: "Depreciation", formula: ({ periodIndex }) => periodIndex === 0 ? "=0" : `=IF(${periodIndex}<=${input("projectLife")},-${input("investment")}/MAX(1,${input("projectLife")}),0)`, format: FORMATS.amount },
          { key: "ebit", label: "EBIT", formula: ({ periodIndex, cell }) => `=SUM(${cell("benefit", periodIndex)}:${cell("depreciation", periodIndex)})`, format: FORMATS.amount },
          { key: "tax", label: "Tax", formula: ({ periodIndex, cell }) => `=-MAX(0,${cell("ebit", periodIndex)}*${input("taxRate")})`, format: FORMATS.amount },
          { key: "operatingCash", label: "Operating cash flow", formula: ({ periodIndex, cell }) => `=SUM(${cell("ebit", periodIndex)},${cell("tax", periodIndex)},-${cell("depreciation", periodIndex)})`, format: FORMATS.amount, bold: true },
          { key: "investmentRecovery", label: "Investment / recovery", formula: ({ periodIndex }) => periodIndex === 0 ? `=-${input("investment")}-${input("workingCapital")}` : `=IF(${periodIndex}=${input("projectLife")},${input("salvage")}*(1-${input("taxRate")})+${input("workingCapital")},0)`, format: FORMATS.amount },
          { key: "fcf", label: "Free cash flow", formula: ({ periodIndex, cell }) => `=SUM(${cell("operatingCash", periodIndex)},${cell("investmentRecovery", periodIndex)})`, format: FORMATS.amount, bold: true, fill: COLORS.paleGreen },
          { key: "discount", label: "Discount factor", formula: ({ periodIndex }) => periodIndex === 0 ? "=1" : `=1/(1+MAX(-99%,${input("discountRate")}))^${periodIndex}`, format: FORMATS.decimal },
          { key: "pv", label: "Present value", formula: ({ periodIndex, cell }) => `=${cell("fcf", periodIndex)}*${cell("discount", periodIndex)}`, format: FORMATS.amount },
          { key: "cumulative", label: "Cumulative cash", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("fcf", 0)}` : `=${cell("cumulative", periodIndex - 1)}+${cell("fcf", periodIndex)}`, format: FORMATS.amount },
        ],
      });
      setSection(sheet, 25, "INVESTMENT SUMMARY", "H");
      const fcfRange = `${series.cell("fcf", 0)}:${series.cell("fcf", 5)}`;
      const pvRange = `${series.cell("pv", 0)}:${series.cell("pv", 5)}`;
      const summary = writeScalarTable(sheet, {
        startRow: 26,
        rows: [
          { key: "npv", label: "Net present value", formula: `=SUM(${pvRange})`, unit: "LCY000", help: "Value created above required return", format: FORMATS.amount, bold: true, fill: COLORS.paleBlue },
          { key: "irr", label: "Internal rate of return", formula: `=IF(AND(MIN(${fcfRange})<0,MAX(${fcfRange})>0),IFERROR(IRR(${fcfRange}),0),0)`, unit: "%", help: "Guarded for valid cash-flow signs", format: FORMATS.percent, bold: true },
          { key: "payback", label: "Payback", formula: `=IF(${series.cell("cumulative", 1)}>=0,-${series.cell("cumulative", 0)}/${series.cell("fcf", 1)},IF(${series.cell("cumulative", 2)}>=0,1-${series.cell("cumulative", 1)}/${series.cell("fcf", 2)},IF(${series.cell("cumulative", 3)}>=0,2-${series.cell("cumulative", 2)}/${series.cell("fcf", 3)},IF(${series.cell("cumulative", 4)}>=0,3-${series.cell("cumulative", 3)}/${series.cell("fcf", 4)},IF(${series.cell("cumulative", 5)}>=0,4-${series.cell("cumulative", 4)}/${series.cell("fcf", 5)},0)))))`, unit: "Years", help: "Zero means no payback in five years", format: FORMATS.decimal },
          { key: "funding", label: "Initial funding", formula: `=${input("investment")}+${input("workingCapital")}`, unit: "LCY000", help: "Investment plus working capital", format: FORMATS.amount },
        ],
      });
      const kpiCells = writeKpis(sheet, [
        { label: "NPV", formula: `=${summary.cell("npv")}`, format: FORMATS.amount },
        { label: "IRR", formula: `=${summary.cell("irr")}`, format: FORMATS.percent },
        { label: "PAYBACK", formula: `=${summary.cell("payback")}`, format: FORMATS.decimal },
        { label: "INITIAL FUNDING", formula: `=${summary.cell("funding")}`, format: FORMATS.amount },
      ]);
      writeOutcome(sheet, "A32:H33", `=IF(${summary.cell("npv")}>=0,"OUTCOME: The sample has positive NPV.","OUTCOME: The sample has negative NPV.")`);
      setFooter(sheet, 34, "H", `${model.title} · v${version}`);
      return {
        kpiCells,
        outcomeCell: "A32",
        outcomeLabel: "INVESTMENT OUTCOME",
        checks: [
          { label: "Project inputs are valid", actual: `=IF(AND(${input("investment")}>=0,${input("workingCapital")}>=0,${input("annualBenefit")}>=0,${input("realization")}>=0,${input("realization")}<=1,${input("variableCost")}>=0,${input("variableCost")}<=1,${input("fixedCost")}>=0,${input("taxRate")}>=0,${input("taxRate")}<=1,${input("discountRate")}>-1,${input("salvage")}>=0),1,0)`, expected: "=1", fix: "Inputs: funding, operating, and valuation drivers" },
          { label: "Project life is valid", actual: `=IF(AND(${input("projectLife")}>=1,${input("projectLife")}<=5,${input("projectLife")}=INT(${input("projectLife")})),1,0)`, expected: "=1", fix: "Inputs: project life" },
          { label: "EBIT bridge ties", actual: `=MAX(${Array.from({ length: 6 }, (_, index) => `ABS(${resultRef(series.cell("ebit", index))}-SUM(${resultRef(series.cell("benefit", index))},${resultRef(series.cell("variableCost", index))},${resultRef(series.cell("fixedCost", index))},${resultRef(series.cell("depreciation", index))}))`).join(",")})`, expected: "=0", fix: "Model: EBIT bridge", format: FORMATS.amount },
          { label: "Operating cash bridge ties", actual: `=MAX(${Array.from({ length: 6 }, (_, index) => `ABS(${resultRef(series.cell("operatingCash", index))}-SUM(${resultRef(series.cell("ebit", index))},${resultRef(series.cell("tax", index))},-${resultRef(series.cell("depreciation", index))}))`).join(",")})`, expected: "=0", fix: "Model: operating cash", format: FORMATS.amount },
          { label: "FCF bridge ties", actual: `=MAX(${Array.from({ length: 6 }, (_, index) => `ABS(${resultRef(series.cell("fcf", index))}-(${resultRef(series.cell("operatingCash", index))}+${resultRef(series.cell("investmentRecovery", index))}))`).join(",")})`, expected: "=0", fix: "Model: free cash flow", format: FORMATS.amount },
          { label: "Discount factors are correct", actual: `=MAX(${Array.from({ length: 6 }, (_, index) => index === 0 ? `ABS(${resultRef(series.cell("discount", 0))}-1)` : `ABS(${resultRef(series.cell("discount", index))}-1/(1+MAX(-99%,${input("discountRate")}))^${index})`).join(",")})`, expected: "=0", fix: "Model: discount factors", format: FORMATS.decimal },
          { label: "NPV equals PV total", actual: `=${resultRef(summary.cell("npv"))}`, expected: `=SUM(${resultRange(series.cell("pv", 0), series.cell("pv", 5))})`, fix: "Model: present values", format: FORMATS.amount },
          { label: "Cumulative cash roll-forward ties", actual: `=MAX(${Array.from({ length: 6 }, (_, index) => index === 0 ? `ABS(${resultRef(series.cell("cumulative", 0))}-${resultRef(series.cell("fcf", 0))})` : `ABS(${resultRef(series.cell("cumulative", index))}-${resultRef(series.cell("cumulative", index - 1))}-${resultRef(series.cell("fcf", index))})`).join(",")})`, expected: "=0", fix: "Model: cumulative cash", format: FORMATS.amount },
        ],
      };
    },
  };

  const workingCapital = {
    slug: "working-capital-planner",
    styleVariant: "option-c",
    checkLimit: 10,
    decision: "How much cash would better DSO, DIO, and DPO release?",
    horizon: "Current plus four-step improvement path",
    tags: ["Working capital", "Cash release", "CCC"],
    included: ["Current-to-target five-column phase-in", "DSO, DIO, and DPO balance schedules", "Incremental and cumulative cash release"],
    excluded: "Invoice detail, SKU detail, seasonality, collection probability, supplier constraints, and multiple scenarios.",
    inputs: [
      { key: "revenue", group: "OPERATING BASE", label: "Annual revenue", value: 1200, unit: "LCY000", format: FORMATS.amount, help: "Annualized sales" },
      { key: "cogs", group: "OPERATING BASE", label: "Annual COGS", value: 744, unit: "LCY000", format: FORMATS.amount, help: "Annualized direct cost" },
      { key: "currentDso", group: "CURRENT DAYS", label: "Current DSO", value: 58, unit: "Days", format: FORMATS.whole, help: "Receivable days today" },
      { key: "currentDio", group: "CURRENT DAYS", label: "Current DIO", value: 46, unit: "Days", format: FORMATS.whole, help: "Inventory days today" },
      { key: "currentDpo", group: "CURRENT DAYS", label: "Current DPO", value: 38, unit: "Days", format: FORMATS.whole, help: "Payable days today" },
      { key: "targetDso", group: "TARGET DAYS", label: "Target DSO", value: 48, unit: "Days", format: FORMATS.whole, help: "Receivable goal" },
      { key: "targetDio", group: "TARGET DAYS", label: "Target DIO", value: 38, unit: "Days", format: FORMATS.whole, help: "Inventory goal" },
      { key: "targetDpo", group: "TARGET DAYS", label: "Target DPO", value: 48, unit: "Days", format: FORMATS.whole, help: "Payable goal" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      const periods = ["CURRENT", "STEP 1", "STEP 2", "STEP 3", "TARGET"];
      const ramp = (currentKey, targetKey, periodIndex) => `=${input(currentKey)}+(${input(targetKey)}-${input(currentKey)})*${periodIndex}/4`;
      setCanvas(sheet, "H", 36);
      setTitle(sheet, "MODEL", `${model.title} · Current-to-target working-capital path`, "H");
      setSection(sheet, 10, "DRIVER AND BALANCE SCHEDULE", "H");
      const series = writeTimeSeries(sheet, {
        startRow: 11,
        periods,
        input,
        rows: [
          { key: "dso", label: "Receivable days (DSO)", formula: ({ periodIndex }) => ramp("currentDso", "targetDso", periodIndex), format: FORMATS.whole },
          { key: "dio", label: "Inventory days (DIO)", formula: ({ periodIndex }) => ramp("currentDio", "targetDio", periodIndex), format: FORMATS.whole },
          { key: "dpo", label: "Payable days (DPO)", formula: ({ periodIndex }) => ramp("currentDpo", "targetDpo", periodIndex), format: FORMATS.whole },
          { key: "ar", label: "Accounts receivable", formula: ({ periodIndex, cell }) => `=${input("revenue")}/365*${cell("dso", periodIndex)}`, format: FORMATS.amount },
          { key: "inventory", label: "Inventory", formula: ({ periodIndex, cell }) => `=${input("cogs")}/365*${cell("dio", periodIndex)}`, format: FORMATS.amount },
          { key: "ap", label: "Accounts payable", formula: ({ periodIndex, cell }) => `=${input("cogs")}/365*${cell("dpo", periodIndex)}`, format: FORMATS.amount },
          { key: "nwc", label: "Operating net working capital", formula: ({ periodIndex, cell }) => `=${cell("ar", periodIndex)}+${cell("inventory", periodIndex)}-${cell("ap", periodIndex)}`, format: FORMATS.amount, bold: true, fill: COLORS.paleGold || COLORS.paleBlue },
          { key: "incrementalRelease", label: "Incremental cash release", formula: ({ periodIndex, cell }) => periodIndex === 0 ? "=0" : `=${cell("nwc", periodIndex - 1)}-${cell("nwc", periodIndex)}`, format: FORMATS.amount },
          { key: "cumulativeRelease", label: "Cumulative cash release", formula: ({ periodIndex, cell }) => `=${cell("nwc", 0)}-${cell("nwc", periodIndex)}`, format: FORMATS.amount, bold: true, fill: COLORS.paleGold || COLORS.paleGreen },
          { key: "ccc", label: "Cash conversion cycle", formula: ({ periodIndex, cell }) => `=${cell("dso", periodIndex)}+${cell("dio", periodIndex)}-${cell("dpo", periodIndex)}`, format: FORMATS.whole },
          { key: "cccImprovement", label: "CCC improvement", formula: ({ periodIndex, cell }) => `=${cell("ccc", 0)}-${cell("ccc", periodIndex)}`, format: FORMATS.whole, bold: true },
        ],
      });
      setSection(sheet, 24, "TARGET SUMMARY", "H");
      const table = writeScalarTable(sheet, {
        startRow: 25,
        rows: [
          { key: "currentNwc", label: "Current operating NWC", formula: `=${series.cell("nwc", 0)}`, unit: "LCY000", help: "Opening point", format: FORMATS.amount },
          { key: "targetNwc", label: "Target operating NWC", formula: `=${series.cell("nwc", 4)}`, unit: "LCY000", help: "End of the improvement path", format: FORMATS.amount, bold: true },
          { key: "cashRelease", label: "Cash release", formula: `=${series.cell("cumulativeRelease", 4)}`, unit: "LCY000", help: "Current NWC less target NWC", format: FORMATS.amount, bold: true, fill: COLORS.paleGold || COLORS.paleGreen },
          { key: "currentCcc", label: "Current cash conversion cycle", formula: `=${series.cell("ccc", 0)}`, unit: "Days", help: "DSO + DIO − DPO", format: FORMATS.whole },
          { key: "targetCcc", label: "Target cash conversion cycle", formula: `=${series.cell("ccc", 4)}`, unit: "Days", help: "Target DSO + DIO − DPO", format: FORMATS.whole },
          { key: "cccImprovement", label: "CCC improvement", formula: `=${series.cell("cccImprovement", 4)}`, unit: "Days", help: "Positive means faster conversion", format: FORMATS.whole },
        ],
      });
      const kpiCells = writeKpis(sheet, [
        { label: "CASH RELEASE", formula: `=${table.cell("cashRelease")}`, format: FORMATS.amount },
        { label: "TARGET NWC", formula: `=${table.cell("targetNwc")}`, format: FORMATS.amount },
        { label: "CCC IMPROVEMENT", formula: `=${table.cell("cccImprovement")}`, format: FORMATS.whole },
        { label: "CURRENT NWC", formula: `=${table.cell("currentNwc")}`, format: FORMATS.amount },
      ]);
      writeOutcome(sheet, "A33:H34", `=IF(${table.cell("cashRelease")}>=0,"OUTCOME: The target releases cash.","OUTCOME: The target consumes cash.")`);
      setFooter(sheet, 36, "H", `${model.title} · v${version}`);
      return {
        kpiCells,
        outcomeCell: "A33",
        outcomeLabel: "CASH OUTCOME",
        checks: [
          { label: "Inputs are valid", actual: `=IF(AND(${input("revenue")}>=0,${input("cogs")}>=0,${input("currentDso")}>=0,${input("currentDio")}>=0,${input("currentDpo")}>=0,${input("targetDso")}>=0,${input("targetDio")}>=0,${input("targetDpo")}>=0),1,0)`, expected: "=1", fix: "Inputs: revenue, COGS, and day assumptions" },
          { label: "Driver ramp reaches its endpoints", actual: `=ABS(${resultRef(series.cell("dso", 0))}-${input("currentDso")})+ABS(${resultRef(series.cell("dso", 4))}-${input("targetDso")})+ABS(${resultRef(series.cell("dio", 0))}-${input("currentDio")})+ABS(${resultRef(series.cell("dio", 4))}-${input("targetDio")})+ABS(${resultRef(series.cell("dpo", 0))}-${input("currentDpo")})+ABS(${resultRef(series.cell("dpo", 4))}-${input("targetDpo")})`, expected: "=0", fix: "Model: driver path", format: FORMATS.decimal },
          { label: "Accounts receivable schedule ties", actual: `=MAX(${Array.from({ length: 5 }, (_, index) => `ABS(${resultRef(series.cell("ar", index))}-${input("revenue")}/365*${resultRef(series.cell("dso", index))})`).join(",")})`, expected: "=0", fix: "Model: receivables", format: FORMATS.amount },
          { label: "Inventory schedule ties", actual: `=MAX(${Array.from({ length: 5 }, (_, index) => `ABS(${resultRef(series.cell("inventory", index))}-${input("cogs")}/365*${resultRef(series.cell("dio", index))})`).join(",")})`, expected: "=0", fix: "Model: inventory", format: FORMATS.amount },
          { label: "Accounts payable schedule ties", actual: `=MAX(${Array.from({ length: 5 }, (_, index) => `ABS(${resultRef(series.cell("ap", index))}-${input("cogs")}/365*${resultRef(series.cell("dpo", index))})`).join(",")})`, expected: "=0", fix: "Model: payables", format: FORMATS.amount },
          { label: "NWC schedule ties", actual: `=MAX(${Array.from({ length: 5 }, (_, index) => `ABS(${resultRef(series.cell("nwc", index))}-(${resultRef(series.cell("ar", index))}+${resultRef(series.cell("inventory", index))}-${resultRef(series.cell("ap", index))}))`).join(",")})`, expected: "=0", fix: "Model: operating NWC", format: FORMATS.amount },
          { label: "Cash release bridge ties", actual: `=MAX(${Array.from({ length: 5 }, (_, index) => `ABS(${resultRef(series.cell("cumulativeRelease", index))}-(${resultRef(series.cell("nwc", 0))}-${resultRef(series.cell("nwc", index))}))`).join(",")})`, expected: "=0", fix: "Model: cumulative cash release", format: FORMATS.amount },
          { label: "CCC schedule ties", actual: `=MAX(${Array.from({ length: 5 }, (_, index) => `ABS(${resultRef(series.cell("ccc", index))}-(${resultRef(series.cell("dso", index))}+${resultRef(series.cell("dio", index))}-${resultRef(series.cell("dpo", index))}))`).join(",")})`, expected: "=0", fix: "Model: cash conversion cycle", format: FORMATS.whole },
        ],
      };
    },
  };

  const varianceBridge = {
    slug: "variance-bridge-forecast-accuracy",
    styleVariant: "option-c",
    checkLimit: 10,
    decision: "Which driver caused the EBITDA gap versus budget?",
    horizon: "One period",
    tags: ["Variance bridge", "Price-volume-cost", "Forecast accuracy"],
    included: ["Budget and actual operating P&Ls", "Price, volume, cost, and opex bridge", "Revenue forecast accuracy and ten controls"],
    excluded: "Segments, mix effects, allocations, owner matrices, multi-period trend analysis, and statistical forecasting.",
    inputs: [
      { key: "budgetUnits", group: "VOLUME", label: "Budget units", value: 1150, unit: "Units", format: FORMATS.whole, help: "Planned sales volume" },
      { key: "actualUnits", group: "VOLUME", label: "Actual units", value: 1200, unit: "Units", format: FORMATS.whole, help: "Actual sales volume" },
      { key: "budgetPrice", group: "PRICE", label: "Budget price / unit", value: 12, unit: "LCY", format: FORMATS.decimal, help: "Planned net price" },
      { key: "actualPrice", group: "PRICE", label: "Actual price / unit", value: 12.4, unit: "LCY", format: FORMATS.decimal, help: "Actual net price" },
      { key: "budgetCost", group: "COST", label: "Budget variable cost / unit", value: 7, unit: "LCY", format: FORMATS.decimal, help: "Planned unit cost" },
      { key: "actualCost", group: "COST", label: "Actual variable cost / unit", value: 7.1, unit: "LCY", format: FORMATS.decimal, help: "Actual unit cost" },
      { key: "budgetOpex", group: "OPEX & FORECAST", label: "Budget controllable opex", value: 1650, unit: "LCY", format: FORMATS.amount, help: "Planned controllable expense" },
      { key: "actualOpex", group: "OPEX & FORECAST", label: "Actual controllable opex", value: 1700, unit: "LCY", format: FORMATS.amount, help: "Actual controllable expense" },
      { key: "forecastRevenue", group: "OPEX & FORECAST", label: "Latest revenue forecast", value: 14500, unit: "LCY", format: FORMATS.amount, help: "Forecast made before actual" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      setCanvas(sheet, "H", 40);
      setTitle(sheet, "MODEL", `${model.title} · Budget-to-actual P&L and driver bridge`, "H");
      setSection(sheet, 10, "BUDGET / ACTUAL OPERATING P&L", "H");
      const comparison = writeTimeSeries(sheet, {
        startRow: 11,
        periods: ["BUDGET", "ACTUAL", "VARIANCE"],
        input,
        rows: [
          { key: "units", label: "Units", format: FORMATS.whole, formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("budgetUnits")}` : periodIndex === 1 ? `=${input("actualUnits")}` : `=${cell("units", 1)}-${cell("units", 0)}` },
          { key: "price", label: "Net price / unit", format: FORMATS.decimal, formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("budgetPrice")}` : periodIndex === 1 ? `=${input("actualPrice")}` : `=${cell("price", 1)}-${cell("price", 0)}` },
          { key: "revenue", label: "Revenue", bold: true, fill: COLORS.paleGold || COLORS.paleBlue, formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("units", 0)}*${cell("price", 0)}` : periodIndex === 1 ? `=${cell("units", 1)}*${cell("price", 1)}` : `=${cell("revenue", 1)}-${cell("revenue", 0)}` },
          { key: "unitCost", label: "Variable cost / unit", format: FORMATS.decimal, formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("budgetCost")}` : periodIndex === 1 ? `=${input("actualCost")}` : `=${cell("unitCost", 1)}-${cell("unitCost", 0)}` },
          { key: "variableCost", label: "Variable cost", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=-${cell("units", 0)}*${cell("unitCost", 0)}` : periodIndex === 1 ? `=-${cell("units", 1)}*${cell("unitCost", 1)}` : `=${cell("variableCost", 1)}-${cell("variableCost", 0)}` },
          { key: "contribution", label: "Contribution", bold: true, formula: ({ periodIndex, cell }) => periodIndex < 2 ? `=${cell("revenue", periodIndex)}+${cell("variableCost", periodIndex)}` : `=${cell("contribution", 1)}-${cell("contribution", 0)}` },
          { key: "opex", label: "Controllable opex", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=-${input("budgetOpex")}` : periodIndex === 1 ? `=-${input("actualOpex")}` : `=${cell("opex", 1)}-${cell("opex", 0)}` },
          { key: "ebitda", label: "EBITDA", bold: true, fill: COLORS.paleGold || COLORS.paleGreen, formula: ({ periodIndex, cell }) => periodIndex < 2 ? `=${cell("contribution", periodIndex)}+${cell("opex", periodIndex)}` : `=${cell("ebitda", 1)}-${cell("ebitda", 0)}` },
        ],
      });
      setSection(sheet, 21, "FAVORABLE / (UNFAVORABLE) DRIVER BRIDGE", "H");
      const table = writeScalarTable(sheet, {
        startRow: 22,
        rows: [
          { key: "budgetRevenue", label: "Budget revenue", formula: `=${comparison.cell("revenue", 0)}`, unit: "LCY", help: "Budget units × budget price", format: FORMATS.amount },
          { key: "actualRevenue", label: "Actual revenue", formula: `=${comparison.cell("revenue", 1)}`, unit: "LCY", help: "Actual units × actual price", format: FORMATS.amount },
          { key: "revenueVariance", label: "Revenue variance", formula: `=${comparison.cell("revenue", 2)}`, unit: "LCY", help: "Actual less budget", format: FORMATS.amount, bold: true },
          { key: "budgetEbitda", label: "Budget EBITDA", formula: `=${comparison.cell("ebitda", 0)}`, unit: "LCY", help: "Budget operating P&L", format: FORMATS.amount },
          { key: "volume", label: "Volume effect", formula: `=(${input("actualUnits")}-${input("budgetUnits")})*${input("budgetPrice")}`, unit: "LCY", help: "Volume change at budget price", format: FORMATS.amount },
          { key: "price", label: "Price effect", formula: `=${input("actualUnits")}*(${input("actualPrice")}-${input("budgetPrice")})`, unit: "LCY", help: "Price change on actual units", format: FORMATS.amount },
          { key: "costVolume", label: "Cost-volume effect", formula: `=-(${input("actualUnits")}-${input("budgetUnits")})*${input("budgetCost")}`, unit: "LCY", help: "Cost of extra or fewer units", format: FORMATS.amount },
          { key: "costRate", label: "Unit-cost effect", formula: `=-${input("actualUnits")}*(${input("actualCost")}-${input("budgetCost")})`, unit: "LCY", help: "Unit-cost change on actual units", format: FORMATS.amount },
          { key: "opex", label: "Opex variance", formula: `=${input("budgetOpex")}-${input("actualOpex")}`, unit: "LCY", help: "Positive is favorable", format: FORMATS.amount },
          { key: "ebitda", label: "EBITDA variance", formula: `=SUM(B27:B31)`, unit: "LCY", help: "Volume + price + cost + opex effects", format: FORMATS.amount, bold: true, fill: COLORS.paleGold || COLORS.paleGreen },
          { key: "bridgeActual", label: "Bridge-implied actual EBITDA", formula: `=B26+B32`, unit: "LCY", help: "Budget EBITDA plus driver effects", format: FORMATS.amount, bold: true },
          { key: "actualEbitda", label: "Actual EBITDA", formula: `=${comparison.cell("ebitda", 1)}`, unit: "LCY", help: "Actual operating P&L", format: FORMATS.amount, bold: true },
          { key: "bridgeCheck", label: "Bridge check", formula: "=B33-B34", unit: "LCY", help: "Must equal zero", format: FORMATS.amount },
          { key: "forecastError", label: "Forecast revenue error", formula: `=B24-${input("forecastRevenue")}`, unit: "LCY", help: "Actual less latest forecast", format: FORMATS.amount },
          { key: "forecastAccuracy", label: "Forecast accuracy", formula: "=IF(ABS(B24)<0.000001,0,MAX(0,1-ABS(B36)/ABS(B24)))", unit: "%", help: "One minus absolute error rate", format: FORMATS.percent, bold: true },
        ],
      });
      const kpiCells = writeKpis(sheet, [
        { label: "REVENUE VARIANCE", formula: `=${table.cell("revenueVariance")}`, format: FORMATS.amount },
        { label: "EBITDA VARIANCE", formula: `=${table.cell("ebitda")}`, format: FORMATS.amount },
        { label: "FORECAST ACCURACY", formula: `=${table.cell("forecastAccuracy")}`, format: FORMATS.percent },
        { label: "PRICE EFFECT", formula: `=${table.cell("price")}`, format: FORMATS.amount },
      ]);
      writeOutcome(sheet, "A38:H39", `=IF(${table.cell("ebitda")}>=0,"OUTCOME: EBITDA is above budget.","OUTCOME: EBITDA is below budget.")`);
      setFooter(sheet, 40, "H", `${model.title} · v${version}`);
      return {
        kpiCells,
        outcomeCell: "A38",
        outcomeLabel: "PERFORMANCE OUTCOME",
        checks: [
          { label: "Inputs are valid", actual: `=IF(AND(${input("budgetUnits")}>=0,${input("actualUnits")}>=0,${input("budgetPrice")}>=0,${input("actualPrice")}>=0,${input("budgetCost")}>=0,${input("actualCost")}>=0,${input("budgetOpex")}>=0,${input("actualOpex")}>=0,${input("forecastRevenue")}>=0),1,0)`, expected: "=1", fix: "Inputs: budget, actual, and forecast values" },
          { label: "Budget operating P&L ties", actual: `=ABS(${resultRef(comparison.cell("revenue", 0))}-${input("budgetUnits")}*${input("budgetPrice")})+ABS(${resultRef(comparison.cell("ebitda", 0))}-(${resultRef(comparison.cell("contribution", 0))}+${resultRef(comparison.cell("opex", 0))}))`, expected: "=0", fix: "Model: budget P&L", format: FORMATS.amount },
          { label: "Actual operating P&L ties", actual: `=ABS(${resultRef(comparison.cell("revenue", 1))}-${input("actualUnits")}*${input("actualPrice")})+ABS(${resultRef(comparison.cell("ebitda", 1))}-(${resultRef(comparison.cell("contribution", 1))}+${resultRef(comparison.cell("opex", 1))}))`, expected: "=0", fix: "Model: actual P&L", format: FORMATS.amount },
          { label: "Comparison variances tie", actual: `=MAX(${["revenue", "variableCost", "contribution", "opex", "ebitda"].map((key) => `ABS(${resultRef(comparison.cell(key, 2))}-(${resultRef(comparison.cell(key, 1))}-${resultRef(comparison.cell(key, 0))}))`).join(",")})`, expected: "=0", fix: "Model: budget versus actual", format: FORMATS.amount },
          { label: "Revenue bridge ties", actual: `=${resultRef(table.cell("revenueVariance"))}`, expected: `=${resultRef(table.cell("volume"))}+${resultRef(table.cell("price"))}`, fix: "Model: revenue effects", format: FORMATS.amount },
          { label: "Variable-cost bridge ties", actual: `=${resultRef(comparison.cell("variableCost", 2))}`, expected: `=${resultRef(table.cell("costVolume"))}+${resultRef(table.cell("costRate"))}`, fix: "Model: cost effects", format: FORMATS.amount },
          { label: "EBITDA bridge ties", actual: `=${resultRef(table.cell("bridgeCheck"))}`, expected: "=0", fix: "Model: EBITDA bridge", format: FORMATS.amount },
          { label: "Forecast accuracy calculation ties", actual: `=${resultRef(table.cell("forecastAccuracy"))}`, expected: `=IF(ABS(${resultRef(table.cell("actualRevenue"))})<0.000001,0,MAX(0,1-ABS(${resultRef(table.cell("forecastError"))})/ABS(${resultRef(table.cell("actualRevenue"))})))`, fix: "Model: forecast accuracy", format: FORMATS.percent },
        ],
      };
    },
  };

  const headcountPlan = {
    slug: "headcount-compensation-plan",
    styleVariant: "option-c",
    checkLimit: 10,
    decision: "What will the hiring plan cost, and is it within budget?",
    horizon: "One-year plan",
    tags: ["Headcount", "Personnel cost", "Capacity"],
    included: ["Twelve-month headcount roll-forward", "Monthly salary, benefit, bonus, and payroll-tax build", "Cumulative personnel cost, budget variance, and capacity"],
    excluded: "Employee-level records, exact start dates, countries, HRIS integrations, equity compensation, and multiple scenarios.",
    inputs: [
      { key: "openingHeadcount", group: "WORKFORCE PLAN", label: "Opening headcount", value: 120, unit: "FTE", format: FORMATS.whole, help: "FTE at plan start" },
      { key: "hires", group: "WORKFORCE PLAN", label: "Planned hires", value: 45, unit: "FTE", format: FORMATS.whole, help: "Total hires spread evenly over the year" },
      { key: "exits", group: "WORKFORCE PLAN", label: "Planned exits", value: 27, unit: "FTE", format: FORMATS.whole, help: "Total exits spread evenly over the year" },
      { key: "salary", group: "COMPENSATION", label: "Annual salary / FTE", value: 36, unit: "LCY000", format: FORMATS.amount, help: "Average annual base salary" },
      { key: "merit", group: "COMPENSATION", label: "Merit increase", value: 0.05, unit: "%", format: FORMATS.percent, help: "Applied from plan start" },
      { key: "benefits", group: "COMPENSATION", label: "Benefits / base pay", value: 0.18, unit: "%", format: FORMATS.percent, help: "Benefits load" },
      { key: "bonus", group: "COMPENSATION", label: "Bonus / base pay", value: 0.1, unit: "%", format: FORMATS.percent, help: "Target bonus load" },
      { key: "payrollTax", group: "COMPENSATION", label: "Payroll tax / base pay", value: 0.08, unit: "%", format: FORMATS.percent, help: "Employer payroll tax" },
      { key: "capacity", group: "BUDGET & CAPACITY", label: "Capacity / FTE / month", value: 100, unit: "Units", format: FORMATS.whole, help: "Simple productivity assumption" },
      { key: "costBudget", group: "BUDGET & CAPACITY", label: "Personnel cost budget", value: 6500, unit: "LCY000", format: FORMATS.amount, help: "Approved annual budget" },
    ],
    buildResults(sheet, model, refs) {
      const input = (key) => inputRef(refs, key);
      setCanvas(sheet, "M", 40);
      setTitle(sheet, "MODEL", `${model.title} · Twelve-month workforce and compensation plan`, "M");
      setSection(sheet, 10, "MONTHLY HEADCOUNT, COST, AND CAPACITY", "M");
      const series = writeTimeSeries(sheet, {
        startRow: 11,
        periods: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        input,
        rows: [
          { key: "openingHeadcount", label: "Opening headcount", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${input("openingHeadcount")}` : `=${cell("closingHeadcount", periodIndex - 1)}`, format: FORMATS.decimal },
          { key: "hires", label: "Planned hires", formula: () => `=${input("hires")}/12`, format: FORMATS.decimal },
          { key: "exits", label: "Planned exits", formula: ({ periodIndex, cell }) => `=-MIN(${cell("openingHeadcount", periodIndex)}+${cell("hires", periodIndex)},${input("exits")}/12)`, format: FORMATS.decimal },
          { key: "closingHeadcount", label: "Closing headcount", formula: ({ periodIndex, cell }) => `=SUM(${cell("openingHeadcount", periodIndex)}:${cell("exits", periodIndex)})`, format: FORMATS.decimal, bold: true, fill: COLORS.paleGold || COLORS.paleBlue },
          { key: "averageHeadcount", label: "Average headcount", formula: ({ periodIndex, cell }) => `=AVERAGE(${cell("openingHeadcount", periodIndex)},${cell("closingHeadcount", periodIndex)})`, format: FORMATS.decimal },
          { key: "monthlySalary", label: "Monthly salary / FTE", formula: () => `=${input("salary")}*(1+${input("merit")})/12`, format: FORMATS.amount },
          { key: "basePay", label: "Base pay", formula: ({ periodIndex, cell }) => `=${cell("averageHeadcount", periodIndex)}*${cell("monthlySalary", periodIndex)}`, format: FORMATS.amount },
          { key: "benefits", label: "Benefits", formula: ({ periodIndex, cell }) => `=${cell("basePay", periodIndex)}*${input("benefits")}`, format: FORMATS.amount },
          { key: "bonus", label: "Bonus", formula: ({ periodIndex, cell }) => `=${cell("basePay", periodIndex)}*${input("bonus")}`, format: FORMATS.amount },
          { key: "payrollTax", label: "Payroll tax", formula: ({ periodIndex, cell }) => `=${cell("basePay", periodIndex)}*${input("payrollTax")}`, format: FORMATS.amount },
          { key: "totalCost", label: "Total personnel cost", formula: ({ periodIndex, cell }) => `=SUM(${cell("basePay", periodIndex)}:${cell("payrollTax", periodIndex)})`, format: FORMATS.amount, bold: true, fill: COLORS.paleGold || COLORS.paleGreen },
          { key: "monthlyBudget", label: "Monthly cost budget", formula: () => `=${input("costBudget")}/12`, format: FORMATS.amount },
          { key: "budgetVariance", label: "Budget variance", formula: ({ periodIndex, cell }) => `=${cell("monthlyBudget", periodIndex)}-${cell("totalCost", periodIndex)}`, format: FORMATS.amount, bold: true },
          { key: "capacity", label: "Monthly capacity", formula: ({ periodIndex, cell }) => `=MAX(0,${cell("closingHeadcount", periodIndex)})*${input("capacity")}`, format: FORMATS.whole },
          { key: "cumulativeCost", label: "Cumulative personnel cost", formula: ({ periodIndex, cell }) => periodIndex === 0 ? `=${cell("totalCost", periodIndex)}` : `=${cell("cumulativeCost", periodIndex - 1)}+${cell("totalCost", periodIndex)}`, format: FORMATS.amount, bold: true },
        ],
      });
      setSection(sheet, 29, "ANNUAL SUMMARY", "M");
      const table = writeScalarTable(sheet, {
        startRow: 30,
        rows: [
          { key: "closingHeadcount", label: "Closing headcount", formula: `=${series.cell("closingHeadcount", 11)}`, unit: "FTE", help: "December closing FTE", format: FORMATS.decimal, bold: true },
          { key: "totalCost", label: "Total personnel cost", formula: `=SUM(${series.cell("totalCost", 0)}:${series.cell("totalCost", 11)})`, unit: "LCY000", help: "Sum of monthly cost", format: FORMATS.amount, bold: true, fill: COLORS.paleGold || COLORS.paleGreen },
          { key: "budgetVariance", label: "Annual budget variance", formula: `=${input("costBudget")}-B32`, unit: "LCY000", help: "Positive is favorable", format: FORMATS.amount, bold: true },
          { key: "capacity", label: "Ending monthly capacity", formula: `=${series.cell("capacity", 11)}`, unit: "Units", help: "December closing FTE × capacity", format: FORMATS.whole },
          { key: "annualHires", label: "Planned hires deployed", formula: `=SUM(${series.cell("hires", 0)}:${series.cell("hires", 11)})`, unit: "FTE", help: "Twelve monthly hire allocations", format: FORMATS.decimal },
          { key: "annualExits", label: "Planned exits deployed", formula: `=-SUM(${series.cell("exits", 0)}:${series.cell("exits", 11)})`, unit: "FTE", help: "Twelve monthly exit allocations", format: FORMATS.decimal },
        ],
      });
      const kpiCells = writeKpis(sheet, [
        { label: "CLOSING HEADCOUNT", formula: `=${table.cell("closingHeadcount")}`, format: FORMATS.whole },
        { label: "PERSONNEL COST", formula: `=${table.cell("totalCost")}`, format: FORMATS.amount },
        { label: "BUDGET VARIANCE", formula: `=${table.cell("budgetVariance")}`, format: FORMATS.amount },
        { label: "MONTHLY CAPACITY", formula: `=${table.cell("capacity")}`, format: FORMATS.whole },
      ]);
      writeOutcome(sheet, "A38:M39", `=IF(${table.cell("closingHeadcount")}<0,"OUTCOME: Exits exceed available headcount.",IF(${table.cell("budgetVariance")}>=0,"OUTCOME: The plan is within budget.","OUTCOME: The plan is over budget."))`);
      setFooter(sheet, 40, "M", `${model.title} · v${version}`);
      return {
        kpiCells,
        outcomeCell: "A38",
        outcomeLabel: "WORKFORCE OUTCOME",
        checks: [
          { label: "Inputs and rates are valid", actual: `=IF(AND(${input("openingHeadcount")}>=0,${input("hires")}>=0,${input("exits")}>=0,${input("exits")}<=${input("openingHeadcount")}+${input("hires")},${input("salary")}>=0,${input("merit")}>=0,${input("merit")}<=1,${input("benefits")}>=0,${input("benefits")}<=1,${input("bonus")}>=0,${input("bonus")}<=1,${input("payrollTax")}>=0,${input("payrollTax")}<=1,${input("capacity")}>=0,${input("costBudget")}>=0),1,0)`, expected: "=1", fix: "Inputs: workforce, compensation, and budget" },
          { label: "Monthly headcount roll-forward ties", actual: `=MAX(${Array.from({ length: 12 }, (_, index) => `ABS(${resultRef(series.cell("closingHeadcount", index))}-SUM(${resultRef(series.cell("openingHeadcount", index))},${resultRef(series.cell("hires", index))},${resultRef(series.cell("exits", index))}))`).join(",")})`, expected: "=0", fix: "Model: headcount roll-forward", format: FORMATS.decimal },
          { label: "Annual hires and exits tie", actual: `=ABS(${resultRef(table.cell("annualHires"))}-${input("hires")})+ABS(${resultRef(table.cell("annualExits"))}-${input("exits")})`, expected: "=0", fix: "Model: monthly hiring allocation", format: FORMATS.decimal },
          { label: "Average headcount is correct", actual: `=MAX(${Array.from({ length: 12 }, (_, index) => `ABS(${resultRef(series.cell("averageHeadcount", index))}-AVERAGE(${resultRef(series.cell("openingHeadcount", index))},${resultRef(series.cell("closingHeadcount", index))}))`).join(",")})`, expected: "=0", fix: "Model: average headcount", format: FORMATS.decimal },
          { label: "Monthly base pay ties", actual: `=MAX(${Array.from({ length: 12 }, (_, index) => `ABS(${resultRef(series.cell("basePay", index))}-${resultRef(series.cell("averageHeadcount", index))}*${resultRef(series.cell("monthlySalary", index))})`).join(",")})`, expected: "=0", fix: "Model: base pay", format: FORMATS.amount },
          { label: "Compensation loads tie", actual: `=MAX(${Array.from({ length: 12 }, (_, index) => `ABS(${resultRef(series.cell("benefits", index))}-${resultRef(series.cell("basePay", index))}*${input("benefits")})+ABS(${resultRef(series.cell("bonus", index))}-${resultRef(series.cell("basePay", index))}*${input("bonus")})+ABS(${resultRef(series.cell("payrollTax", index))}-${resultRef(series.cell("basePay", index))}*${input("payrollTax")})`).join(",")})`, expected: "=0", fix: "Model: benefit, bonus, and payroll tax", format: FORMATS.amount },
          { label: "Monthly personnel cost ties", actual: `=MAX(${Array.from({ length: 12 }, (_, index) => `ABS(${resultRef(series.cell("totalCost", index))}-SUM(${resultRef(series.cell("basePay", index))},${resultRef(series.cell("benefits", index))},${resultRef(series.cell("bonus", index))},${resultRef(series.cell("payrollTax", index))}))`).join(",")})`, expected: "=0", fix: "Model: monthly personnel cost", format: FORMATS.amount },
          { label: "Annual cost and budget bridge tie", actual: `=ABS(${resultRef(table.cell("totalCost"))}-SUM(${resultRange(series.cell("totalCost", 0), series.cell("totalCost", 11))}))+ABS(${resultRef(table.cell("budgetVariance"))}-(${input("costBudget")}-${resultRef(table.cell("totalCost"))}))`, expected: "=0", fix: "Model: annual summary", format: FORMATS.amount },
        ],
      };
    },
  };

  return [
    threeStatement,
    budgetForecast,
    cashFlow13Week,
    capexBusinessCase,
    workingCapital,
    varianceBridge,
    headcountPlan,
  ];
};
