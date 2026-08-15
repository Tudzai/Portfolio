(() => {
  "use strict";

  // Public-safe local fixture transcribed from apps/backend/src/mockData.ts.
  // Personal identities are replaced with consistent team aliases.
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const actualRevenue = [18.8, 19.5, 20.4, 21.1, 22.8, 23.7, 21.6, 22.5, 22.2, 23.1, 24, 24.8];
  const actualGrossProfit = [5.3, 5.7, 5.9, 6.1, 6.6, 6.9, 6.2, 6.8, 6.5, 6.9, 7.1, 7.4];
  const actualSga = [3, 3.1, 3.2, 3, 3.1, 3.2, 3.1, 3.1, 3.2, 3.3, 3.4, 3.5];

  const makeSeries = (actual, budget, forecast, priorYear) => actual.map((value, index) => ({
    month: months[index],
    actual: value,
    budget: budget[index],
    forecast: forecast[index],
    priorYear: priorYear[index],
    priorYearAvailable: true,
  }));

  const sharedVarianceRows = [
    { label: "Vs Budget", values: ["-0.4%", "+1.2%", "-2.1%", "+0.8%", "-1.5%", "+2.0%"] },
    { label: "Vs Forecast", values: ["+0.5%", "+0.5%", "+1.5%", "-1.4%", "+0.9%", "+0.8%"] },
    { label: "Vs Prior Month", values: ["+2.1%", "+3.7%", "+4.6%", "+3.4%", "+8.1%", "+4.0%"] },
    { label: "VS Prior Year", values: ["+6.2%", "+5.4%", "+7.1%", "+6.8%", "+8.4%", "+9.2%"] },
  ];
  const varianceRows = (actual, budget, forecast) => [
    { label: "Actual", values: actual },
    { label: "Budget", values: budget },
    { label: "Forecast", values: forecast },
    ...sharedVarianceRows.map((row) => ({ ...row, values: [...row.values] })),
  ];

  const sourceMonths = months.map((month, index) => ({ month, index }));
  const sourceValidationProblem = "Revenue!F1: Missing \"Branch\" column.";
  const makeSources = (year, presentThrough = 12) => [
    ...sourceMonths.map(({ month, index }) => {
      const slot = `${String(index + 1).padStart(2, "0")} · ${month}`;
      const fileName = `${String(index + 1).padStart(2, "0")}_${month}.xlsx`;
      if (index < presentThrough) return { slot, fileName, status: "Present", lastUpdate: `29 Jul ${year} · 09:14`, action: "Replace" };
      if (index === presentThrough) return { slot, fileName, status: "Error", lastUpdate: `09 Aug ${year} · 14:32`, action: "Replace", problem: sourceValidationProblem };
      return { slot, fileName: "—", status: "Pending", lastUpdate: "—", action: "Upload" };
    }),
    { slot: "Plan", fileName: `Planning_${year}.xlsx`, status: "Present", lastUpdate: `02 Aug ${year} · 08:45`, action: "Replace" },
  ];

  window.HUB_DATA = Object.freeze({
    months,
    sourceValidationProblem,
    modules: [
      { id: "overview", title: "Overview", description: "Performance snapshot and trends", metric: "$170.4M revenue", route: "overview" },
      { id: "variance", title: "Variance Analysis", description: "Explain plan versus actual", metric: "-$2.5M vs budget", route: "variance" },
      { id: "planning", title: "Budget & Forecast", description: "Build scenarios with confidence", metric: "$172.9M budget", route: "planning" },
      { id: "pnl", title: "P&L", description: "Read the operating result", metric: "$13.2M EBIT", route: "pnl" },
    ],
    kpis: [
      { label: "Revenue", value: "$126.3M", budget: "$126.2M", forecast: "$126.2M", variance: "+0.1%", trend: [52, 58, 61, 66, 72, 78] },
      { label: "Gross Profit", value: "$36.5M", budget: "$36.8M", forecast: "$36.7M", variance: "-0.8%", trend: [42, 48, 47, 55, 58, 63] },
      { label: "Gross Margin", value: "28.9%", budget: "29.2%", forecast: "29.1%", variance: "-0.3 pp", trend: [55, 53, 58, 57, 61, 60] },
      { label: "Employee Cost", value: "$7.1M", budget: "$7.4M", forecast: "$7.2M", variance: "-4.1%", trend: [70, 68, 66, 64, 61, 59] },
      { label: "SG&A", value: "$18.6M", budget: "$19.5M", forecast: "$18.9M", variance: "-4.6%", trend: [68, 65, 63, 64, 60, 58] },
      { label: "EBITDA", value: "$17.9M", budget: "$17.3M", forecast: "$17.8M", variance: "+3.5%", trend: [36, 41, 43, 49, 54, 58] },
      { label: "Depreciation", value: "$1.6M", budget: "$1.6M", forecast: "$1.6M", variance: "0.0%", trend: [52, 52, 51, 52, 52, 51] },
      { label: "EBIT", value: "$16.3M", budget: "$15.7M", forecast: "$16.2M", variance: "+3.8%", trend: [34, 39, 45, 49, 54, 60] },
    ],
    series: {
      revenue: makeSeries(actualRevenue,
        [19.2, 19.8, 20.2, 21.5, 22.4, 23.1, 22.2, 23.4, 22.8, 23.4, 24.2, 25],
        [19, 19.7, 20.3, 21.2, 22.6, 23.4, 21.9, 22.8, 22.4, 23, 24.2, 24.6],
        [17.1, 18, 18.7, 19.2, 20.8, 21.5, 20.2, 21.1, 20.7, 21.6, 22.3, 23]),
      grossProfit: makeSeries(actualGrossProfit,
        [5.5, 5.8, 6, 6.2, 6.5, 6.8, 6.4, 6.7, 6.6, 6.8, 7.2, 7.5],
        [5.4, 5.6, 6, 6, 6.7, 7, 6.3, 6.7, 6.6, 6.8, 7.2, 7.3],
        [4.8, 5, 5.2, 5.4, 5.7, 5.9, 5.6, 5.8, 5.7, 6, 6.2, 6.4]),
      sga: makeSeries(actualSga,
        [3.2, 3.2, 3.3, 3.2, 3.3, 3.3, 3.2, 3.2, 3.3, 3.4, 3.4, 3.6],
        [3.1, 3, 3.3, 2.9, 3.2, 3.4, 3.1, 3.2, 3.2, 3.4, 3.3, 3.6],
        [2.8, 2.9, 3, 2.8, 2.9, 3, 2.9, 2.9, 3, 3.1, 3.2, 3.2]),
    },
    revenueMix: [
      { label: "Export Air", value: "$24.0M", percent: 19, share: "19%" },
      { label: "Export Sea", value: "$21.2M", percent: 17, share: "17%" },
      { label: "Import Air", value: "$18.4M", percent: 15, share: "15%" },
      { label: "Import Sea", value: "$16.8M", percent: 13, share: "13%" },
      { label: "Logistics", value: "$45.9M", percent: 36, share: "36%" },
    ],
    rankings: {
      services: [
        { label: "Export Air", value: "$12.0M", percent: 100, share: "33%" },
        { label: "Export Sea", value: "$10.2M", percent: 85, share: "28%" },
        { label: "Import Air", value: "$4.4M", percent: 37, share: "12%" },
        { label: "Import Sea", value: "$3.5M", percent: 29, share: "10%" },
        { label: "Logistics", value: "$6.4M", percent: 53, share: "17%" },
      ],
      sgaCosts: [
        { label: "Management salary", value: "$2.8M", percent: 82, share: "15%" },
        { label: "Operations salary", value: "$3.4M", percent: 100, share: "18%" },
        { label: "Commercial salary", value: "$2.3M", percent: 68, share: "12%" },
        { label: "Benefits", value: "$1.6M", percent: 47, share: "9%" },
        { label: "Technology", value: "$2.7M", percent: 79, share: "15%" },
        { label: "Facilities", value: "$2.1M", percent: 62, share: "11%" },
        { label: "Sales & Marketing", value: "$2.4M", percent: 71, share: "13%" },
        { label: "Travel & Other", value: "$1.3M", percent: 38, share: "7%" },
      ],
      branches: [
        { label: "Ho Chi Minh", value: "$13.5M", percent: 100, share: "37%" },
        { label: "Hanoi", value: "$12.0M", percent: 89, share: "33%" },
        { label: "Da Nang", value: "$6.2M", percent: 46, share: "17%" },
        { label: "Other", value: "$4.8M", percent: 36, share: "13%" },
      ],
    },
    overviewCustomers: [
      { rank: 1, customer: "Customer A", country: "Vietnam", grossProfit: "$5.8M", margin: "31.5%", trend: "+8.2%", sparkline: [26, 31, 28, 38, 42, 48, 46, 55] },
      { rank: 2, customer: "Customer B", country: "Japan", grossProfit: "$4.1M", margin: "27.5%", trend: "+4.6%", sparkline: [32, 29, 35, 33, 38, 40, 42, 44] },
      { rank: 3, customer: "Customer C", country: "Vietnam", grossProfit: "$3.9M", margin: "30.7%", trend: "-1.2%", sparkline: [44, 42, 46, 43, 40, 42, 39, 38] },
      { rank: 4, customer: "Customer D", country: "Singapore", grossProfit: "$2.8M", margin: "26.4%", trend: "+2.1%", sparkline: [25, 27, 24, 30, 28, 32, 31, 34] },
    ],
    varianceMetrics: [
      { name: "Revenue", rows: varianceRows(["$18.8M", "$19.5M", "$20.4M", "$21.1M", "$22.8M", "$23.7M"], ["$19.0M", "$19.2M", "$20.8M", "$20.9M", "$23.1M", "$24.0M"], ["$18.7M", "$19.4M", "$20.1M", "$21.4M", "$22.6M", "$23.5M"]) },
      { name: "Gross Profit", rows: varianceRows(["$5.2M", "$5.4M", "$5.8M", "$6.0M", "$6.4M", "$6.8M"], ["$5.3M", "$5.3M", "$5.7M", "$5.9M", "$6.5M", "$6.7M"], ["$5.1M", "$5.5M", "$5.8M", "$6.1M", "$6.3M", "$6.9M"]) },
      { name: "EBIT", rows: varianceRows(["$1.4M", "$1.6M", "$1.8M", "$2.0M", "$2.2M", "$2.5M"], ["$1.3M", "$1.5M", "$1.7M", "$1.9M", "$2.1M", "$2.3M"], ["$1.4M", "$1.6M", "$1.8M", "$2.1M", "$2.2M", "$2.5M"]) },
      { name: "Gross Margin", rows: varianceRows(["27.7%", "27.7%", "28.4%", "28.4%", "28.1%", "28.7%"], ["27.4%", "27.8%", "28.2%", "28.0%", "28.3%", "28.5%"], ["27.6%", "27.9%", "28.5%", "28.6%", "28.0%", "28.8%"]) },
    ],
    varianceCustomers: [
      { rank: 1, customer: "Customer A", country: "Vietnam", periodTotal: "$18.4M", monthlyAverage: "$3.1M", volatility: "Low", latestMonth: "$3.4M", latestChange: "+8.2%", sparkline: [18, 22, 21, 28, 26, 32, 35] },
      { rank: 2, customer: "Customer B", country: "Japan", periodTotal: "$14.9M", monthlyAverage: "$2.5M", volatility: "Medium", latestMonth: "$2.7M", latestChange: "+4.6%", sparkline: [28, 26, 29, 25, 31, 30, 33] },
      { rank: 3, customer: "Customer C", country: "Vietnam", periodTotal: "$12.7M", monthlyAverage: "$2.1M", volatility: "Low", latestMonth: "$2.2M", latestChange: "-1.2%", sparkline: [34, 31, 33, 29, 30, 27, 26] },
    ],
    planningFigures: [
      { label: "Actual", value: "$170.4M", detail: "Jan–Jun 2026" },
      { label: "Budget", value: "$172.9M", detail: "FY 2026" },
      { label: "vs Budget", value: "-1.5%", detail: "$2.5M below plan" },
      { label: "Forecast", value: "$169.5M", detail: "Latest outlook" },
      { label: "vs Forecast", value: "+0.5%", detail: "$0.9M above outlook" },
    ],
    planningRows: [
      { label: "Actual", values: ["18.8", "19.5", "20.4", "21.1", "22.8", "23.7", "22.1", "21.8", "—", "—", "—", "—"] },
      { label: "Budget FY", values: ["19.2", "19.8", "20.2", "21.5", "22.4", "23.1", "22.2", "23.4", "23.8", "24.1", "24.6", "25.0"] },
      { label: "Actual vs Budget", values: ["-2.1%", "-1.5%", "+1.0%", "-1.9%", "+1.8%", "+2.6%", "-0.5%", "-6.8%", "—", "—", "—", "—"] },
      { label: "Forecast", values: ["19.0", "19.7", "20.3", "21.2", "22.6", "23.4", "21.9", "22.8", "23.5", "24.0", "24.4", "24.9"] },
      { label: "Actual vs Forecast", values: ["-1.1%", "-1.0%", "+0.5%", "-0.5%", "+0.9%", "+1.3%", "+0.9%", "-4.4%", "—", "—", "—", "—"] },
    ],
    planningSgaRows: [
      { label: "Management salary", actual: "$1.2M", budget: "$1.3M", forecast: "$1.2M" },
      { label: "Operations salary", actual: "$1.8M", budget: "$1.9M", forecast: "$1.8M" },
      { label: "Commercial salary", actual: "$1.1M", budget: "$1.2M", forecast: "$1.1M" },
      { label: "Benefits", actual: "$0.7M", budget: "$0.8M", forecast: "$0.7M" },
      { label: "Salary & Benefits", actual: "$4.8M", budget: "$5.2M", forecast: "$4.8M" },
      { label: "Technology", actual: "$1.4M", budget: "$1.3M", forecast: "$1.4M" },
      { label: "Facilities", actual: "$1.1M", budget: "$1.2M", forecast: "$1.1M" },
      { label: "Sales & Marketing", actual: "$0.9M", budget: "$1.0M", forecast: "$0.9M" },
      { label: "Travel & Other", actual: "$0.6M", budget: "$0.7M", forecast: "$0.6M" },
      { label: "Other SG&A", actual: "$4.0M", budget: "$4.2M", forecast: "$4.0M" },
      { label: "Total SG&A", actual: "$8.8M", budget: "$9.4M", forecast: "$8.8M" },
    ],
    pnlRows: [
      { label: "Revenue", actual: "$170.4M", budget: "$172.9M", forecast: "$169.5M", variance: "-1.5%", total: true },
      { label: "COGS", actual: "($120.9M)", budget: "($123.0M)", forecast: "($120.3M)", variance: "-1.7%", indent: true },
      { label: "Gross Profit", actual: "$49.5M", budget: "$49.9M", forecast: "$49.2M", variance: "-0.8%", subtotal: true },
      { label: "Employee Cost", actual: "($9.4M)", budget: "($9.9M)", forecast: "($9.6M)", variance: "-4.8%", indent: true },
      { label: "Other SG&A", actual: "($15.4M)", budget: "($16.0M)", forecast: "($15.5M)", variance: "-3.8%", indent: true },
      { label: "Total SG&A", actual: "($24.8M)", budget: "($25.9M)", forecast: "($25.1M)", variance: "-4.2%", subtotal: true },
      { label: "EBITDA", actual: "$15.3M", budget: "$14.1M", forecast: "$14.5M", variance: "+8.3%", total: true },
      { label: "DA", actual: "($2.1M)", budget: "($2.1M)", forecast: "($2.1M)", variance: "-2.9%", indent: true },
      { label: "EBIT", actual: "$13.2M", budget: "$11.9M", forecast: "$12.4M", variance: "+10.3%", subtotal: true },
    ],
    tasks: [
      { id: 1, name: "Review June revenue bridge", owner: "Team member A", priority: "High", deadline: "2026-08-09", done: false, createdAt: "2026-08-01 09:14", comments: ["Confirm bridge drivers before the monthly review."] },
      { id: 2, name: "Refresh Vietnam forecast", owner: "Team member B", priority: "Medium", deadline: "2026-08-12", done: false, createdAt: "2026-08-02 11:30", comments: ["Refresh the country assumptions after Data Control sync."] },
      { id: 3, name: "Approve Q3 assumptions", owner: "Team member C", priority: "Low", deadline: "2026-08-18", done: true, createdAt: "2026-07-29 15:05", comments: ["Approved after the Q3 assumptions review."] },
      { id: 4, name: "Reconcile logistics margin", owner: "Team member A", priority: "High", deadline: "2026-08-21", done: false, createdAt: "2026-08-04 08:45", comments: ["Check the logistics margin bridge with the operations team."] },
    ],
    dataYears: [
      { year: "2026", monthlyData: "6 / 12", planningFile: "1 / 1", status: "Connected", sources: makeSources("2026", 6) },
      { year: "2025", monthlyData: "12 / 12", planningFile: "1 / 1", status: "Connected", sources: makeSources("2025") },
    ],
    adminUsers: [
      { name: "Local FP&A Owner", email: "owner@local.test", alias: "workspace-owner", role: "Owner", roleKey: "owner", current: true },
      { name: "Local FP&A Analyst", email: "analyst@local.test", alias: "finance-analyst", role: "Analyst", roleKey: "analyst", current: false },
    ],
    auditEvents: [
      { user: "Local FP&A Owner", email: "owner@local.test", text: "Updated June revenue actuals", actor: "Local FP&A Owner", action: "Updated June revenue actuals", time: "12 min ago" },
      { user: "Local FP&A Analyst", email: "analyst@local.test", text: "Uploaded Vietnam forecast", actor: "Local FP&A Analyst", action: "Uploaded Vietnam forecast", time: "1 hr ago" },
    ],
  });
})();
