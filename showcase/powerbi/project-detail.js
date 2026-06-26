(() => {
  const root = document.querySelector("[data-project-detail]");
  const projectId = document.body.dataset.projectId;
  const projects = window.powerBiProjectDetails || [];
  const project = projects.find((item) => item.no === projectId);
  const repoBase = "https://github.com/Tudzai/powerbi-fpa-analytics-portfolio/tree/main/";
  const proofNotes = {
    "02": {
      question: "Which forecast call changes when volume, rate, cost inflation, hiring, and cash guardrails move?",
      logic: "Revenue is built from volume and rate assumptions, EBITDA reflects cost and headcount phasing, and ending cash is checked against the downside guardrail.",
      recommendation: "Sign the base forecast only after each business owner confirms assumption changes and the downside cash case stays above the CFO guardrail.",
      build: "Forecast pages separate assumptions, bridge, scenario, cash, and owner commentary so the pack can support a real forecast signoff.",
      qa: "Weighted MAPE is read over the last 6 actualized forecast cycles; revenue driver roll-forward and ending cash tie-out are checked before handoff."
    },
    "03": {
      question: "Is ecommerce growth improving margin quality or only increasing volume?",
      logic: "GMV, orders, average order value, refund leakage, and category mix are read together to separate profitable growth from noisy traffic.",
      recommendation: "Scale high-repeat categories while operations fixes refund leakage where it erodes gross profit.",
      build: "Executive KPI, category mix, refund, and customer views are structured for a weekly commercial review.",
      qa: "Gross margin % = gross profit / revenue; GMV, refund value, and order counts reconcile back to the synthetic sales table."
    },
    "04": {
      question: "Where does the acquisition funnel lose the most finance value?",
      logic: "Each funnel step converts traffic into order value, so leakage is shown as estimated gross profit impact, not only conversion percentage.",
      recommendation: "Fix the checkout step with the largest profit leakage before increasing paid traffic spend.",
      build: "The preview keeps segment, channel, and step-level funnel views connected to a finance-sized leakage queue.",
      qa: "Order conversion = orders / sessions; leakage is estimated from drop-off volume multiplied by contribution per order."
    },
    "05": {
      question: "Which cohorts deserve retention spend because the payback is still attractive?",
      logic: "Cohort retention, churn risk, and LTV/CAC are tied to retained revenue value and incentive cost.",
      recommendation: "Prioritize dormant high-LTV cohorts and track recovered value against win-back spend.",
      build: "Cohort curves, churn signal, and action owners are presented in one customer lifecycle view.",
      qa: "LTV/CAC uses cohort gross profit over acquisition cost; retained value is a revenue-at-risk estimate."
    },
    "06": {
      question: "Which marketing budget should be scaled, paused, or reallocated?",
      logic: "ROAS, CAC, payback threshold, and redeployable spend are read by channel to turn campaign reporting into a finance decision.",
      recommendation: "Move budget from channels below the ROAS or CAC payback hurdle into high-intent campaigns.",
      build: "Channel scorecards and action queues separate scale candidates, fix candidates, and spend-at-risk groups.",
      qa: "Budget at risk means spend below the hurdle ROAS or CAC payback threshold; redeployable spend ties to the channel spend sample."
    },
    "07": {
      question: "Which sellers protect marketplace growth quality?",
      logic: "Seller GMV, fulfillment SLA, cancellations, stock risk, and rating are scored together before assigning enablement effort.",
      recommendation: "Focus seller enablement on high-GMV accounts with fulfillment or stockout constraints.",
      build: "Seller ranking, ops risk, and growth pool signals are grouped for marketplace and finance follow-up.",
      qa: "Growth pool is estimated GMV opportunity; cancellation and fulfillment metrics reconcile to seller-level order samples."
    },
    "08": {
      question: "Which merchant segments improve payment unit economics?",
      logic: "TPV, take rate, cost to serve, merchant mix, and unit profit are bridged so fee changes are not made on volume alone.",
      recommendation: "Review low-fee enterprise contracts and processing cost exceptions before expanding volume.",
      build: "Profitability cards connect merchant mix, fee tiers, cost exceptions, and finance owner actions.",
      qa: "Take rate = fee revenue / TPV; unit profit is contribution after processing cost per transaction."
    },
    "09": {
      question: "Is the booked provision enough for the current delinquency and vintage mix?",
      logic: "Loan book, DPD migration, loss rate, and collection lift feed the required provision view.",
      recommendation: "Update the provision sensitivity and tighten exposure for weak merchant cohorts before 60+ DPD migration.",
      build: "Vintage, roll-rate, collections, and provision pages are linked to risk and finance owners.",
      qa: "Provision gap = required provision less booked provision under the ECL policy sample; DPD buckets tie to the loan-book total."
    },
    "10": {
      question: "Which alert patterns create real exposure versus operational noise?",
      logic: "Alert volume, SLA aging, false positives, and exposure are used together to separate high-risk cases from tuning opportunities.",
      recommendation: "Escalate high-exposure clusters while analytics tunes rules with high false-positive rates.",
      build: "Fraud rule, case SLA, exposure, and compliance action views support risk operations governance.",
      qa: "Exposure flagged is a synthetic amount-at-risk estimate; SLA cleared = closed cases / due cases."
    },
    "11": {
      question: "Is neobank growth profitable after activation, retention, and acquisition cost?",
      logic: "Funded accounts, M2 activity, churn, and LTV/CAC are read as a growth quality bridge.",
      recommendation: "Fund users earlier in onboarding and tie channel budget to LTV/CAC rather than signups alone.",
      build: "Onboarding, activation, retention, channel quality, and finance action queues stay in the same review flow.",
      qa: "LTV/CAC uses gross profit over acquisition cost; M2 active = active funded accounts in month two / funded accounts."
    },
    "12": {
      question: "Which AUM is at risk and what action protects fee revenue?",
      logic: "AUM, client retention, suitability risk, market drawdown, and advisor coverage are converted into at-risk AUM.",
      recommendation: "Contact high-AUM at-risk clients and resolve suitability exceptions before outflows translate into fee loss.",
      build: "Portfolio mix, client risk, suitability, and retention action views support advisory and finance follow-up.",
      qa: "At-risk AUM is segmented by outflow signal; fee exposure is derived from AUM multiplied by fee-rate assumptions."
    },
    "13": {
      question: "Can regional leadership trust the country variance bridge before the board pack?",
      logic: "Country/entity variance, FX translation, eliminations, and close exceptions are separated so each owner can sign off.",
      recommendation: "Lock country owner commentary after elimination timing breaks are quantified and the FX bridge is ready for CFO review.",
      build: "Regional pages group entity, currency, elimination, and exception views for an MNC-style close review.",
      qa: "P&L tie-out is complete; remaining recon breaks are quantified by account/entity and FX translation variance is bridged by country."
    },
    "14": {
      question: "Will working-capital pressure constrain the next cash decision?",
      logic: "Opening cash plus collections minus supplier payments, opex, capex, and FX movement rolls to closing cash and runway.",
      recommendation: "Escalate top overdue customers and refresh the downside cash runway before the CFO review.",
      build: "Cash, AR aging, DSO, FX exposure, and collection owner queues are organized for treasury follow-up.",
      qa: "DSO = closing AR / trailing daily revenue; cash roll-forward checks opening cash + inflows - outflows = closing cash."
    },
    "15": {
      question: "Does SaaS growth quality support the board forecast?",
      logic: "ARR, NRR, churn, CAC payback, cohort economics, and sales efficiency are tied to an ARR bridge.",
      recommendation: "Prioritize expansion in healthy cohorts and target SMB churn where payback risk is highest.",
      build: "ARR bridge, retention, efficiency, and cohort views are framed for CFO and board metric review.",
      qa: "NRR = starting ARR + expansion - contraction - churn divided by starting ARR; CAC payback uses gross margin-adjusted acquisition cost recovery."
    },
    "16": {
      question: "Which cost variances are controllable enough to recover margin?",
      logic: "Material price, labor, overhead, yield, idle capacity, and inventory days are decomposed into plant-level action owners.",
      recommendation: "Recover yield on underperforming lines and negotiate material price variance before the next margin review.",
      build: "Cost bridge, capacity, yield, inventory, and owner action views support manufacturing FP&A routines.",
      qa: "Cost variance = actual cost - standard cost; yield and inventory days reconcile to production and inventory samples."
    },
    "17": {
      question: "Which logistics lanes need repricing or operational intervention?",
      logic: "Lane revenue, gross margin %, loss lanes, fuel surcharge, and customer mix are bridged into gross profit recovery.",
      recommendation: "Reprice loss lanes and low-yield accounts while operations attacks exception cost on air lanes.",
      build: "Trade lane, customer margin, service line, and owner action queues support a commercial finance review.",
      qa: "Repricing pool is estimated gross profit recovery from selected loss lanes; gross margin % = gross profit / lane revenue."
    },
    "18": {
      question: "Where does carbon exposure create a finance-owned cost decision?",
      logic: "Scope emissions, carbon cost exposure, supplier intensity, and abatement ROI are connected to payback and governance risk.",
      recommendation: "Prioritize abatement projects with positive ROI and engage high-intensity suppliers first.",
      build: "Emissions, supplier, carbon cost, abatement, and governance views frame sustainability as a finance decision.",
      qa: "Carbon cost exposure = tCO2e multiplied by carbon price assumption; abatement ROI compares avoided cost with project investment."
    },
    "19": {
      question: "Can finance trust the dashboard before close reporting?",
      logic: "Refresh SLA, completeness, reconciliation breaks, mapping gaps, and owner SLA show whether the BI layer is ready for management use.",
      recommendation: "Resolve high-risk mapping gaps and recon breaks before the close pack is published.",
      build: "Data checks, refresh, reconciliation, RLS, and owner escalation views create a governance control layer.",
      qa: "Refresh SLA = successful refreshes / scheduled refreshes; reconciliation breaks are counted by account, entity, and owner."
    }
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function metricCards(items) {
    return items
      .map(
        ([value, label]) => `
          <article class="metric">
            <strong>${escapeHtml(value)}</strong>
            <span>${escapeHtml(label)}</span>
          </article>
        `,
      )
      .join("");
  }

  function barRows(items) {
    return items
      .map(([label, score]) => {
        const bounded = Math.max(12, Math.min(96, Number(score) || 0));
        return `
          <div class="bar-row">
            <span class="bar-label">${escapeHtml(label)}</span>
            <span class="bar-track"><i class="bar-fill" style="width:${bounded}%"></i></span>
            <span class="bar-score">${bounded}%</span>
          </div>
        `;
      })
      .join("");
  }

  function driverRows(items) {
    return items
      .map(
        ([name, impact, isRisk]) => `
          <li>
            <strong>${escapeHtml(name)}</strong>
            <span class="driver-impact${isRisk ? " is-risk" : ""}">${escapeHtml(impact)}</span>
          </li>
        `,
      )
      .join("");
  }

  function actionOwners(items) {
    return items.map(([owner]) => owner).join(" / ");
  }

  function proofFor(project) {
    return proofNotes[project.no] || {
      question: `What decision does ${project.title} support?`,
      logic: `${project.bars.map(([label]) => label).join(", ")} are surfaced with driver pressure and owner context.`,
      recommendation: `${actionOwners(project.actions)} review the action queue before the next management checkpoint.`,
      build: "The preview combines KPI cards, driver bars, and owner actions in a public-safe BI pattern.",
      qa: "Synthetic values are checked for units, formulas, and public-safe delivery before publishing."
    };
  }

  if (!root || !project) {
    document.body.innerHTML = `
      <main class="shell">
        <a class="back" href="../">Back to Power BI hub</a>
        <section class="hero">
          <div>
            <p class="kicker">Power BI project</p>
            <h1>Project not found</h1>
            <p class="lead">The requested project route is not available.</p>
          </div>
        </section>
      </main>
    `;
    return;
  }

  const previewUrl = `../project-preview.html?project=${encodeURIComponent(project.no)}`;
  const embeddedPreviewUrl = `${previewUrl}&embed=1`;
  const repoUrl = repoBase + encodeURIComponent(project.folder);
  const proof = proofFor(project);
  document.title = `${project.title} | Truong Dinh Anh Tu`;

  root.innerHTML = `
    <a class="back" href="../">Back to Power BI hub</a>

    <section class="hero">
      <div>
        <p class="kicker">Project ${escapeHtml(project.no)} / ${escapeHtml(project.lens)}</p>
        <h1>${escapeHtml(project.title)}</h1>
        <p class="lead">${escapeHtml(project.summary)}</p>
        <div class="metrics" aria-label="Project metrics">
          ${metricCards(project.metrics)}
        </div>
        <div class="actions">
          <a class="button" href="${previewUrl}">Open interactive preview</a>
          <a class="button secondary" href="${repoUrl}" target="_blank" rel="noopener">GitHub folder</a>
        </div>
      </div>

      <aside class="chart-card" aria-label="${escapeHtml(project.title)} chart summary">
        <p class="kicker">Dashboard signal</p>
        <h2>${escapeHtml(project.lens)}</h2>
        <p class="chart-subtitle">Primary visual check for the business question behind this BI product.</p>
        <div class="bar-list">
          ${barRows(project.bars)}
        </div>
        <ul class="driver-list" aria-label="Top project drivers">
          ${driverRows(project.drivers)}
        </ul>
      </aside>
    </section>

    <section class="frame-card" aria-label="Interactive ${escapeHtml(project.title)} preview">
      <div class="frame-head">
        <h2>Interactive preview</h2>
        <a class="button secondary" href="${previewUrl}">Open full screen</a>
      </div>
      <iframe src="${embeddedPreviewUrl}" title="${escapeHtml(project.title)} interactive preview"></iframe>
    </section>

    <section class="proof-grid" aria-label="Project decision proof">
      <article class="proof-card">
        <strong>Executive question</strong>
        <p>${escapeHtml(proof.question)}</p>
      </article>
      <article class="proof-card">
        <strong>Finance logic</strong>
        <p>${escapeHtml(proof.logic)}</p>
      </article>
      <article class="proof-card">
        <strong>Recommended action</strong>
        <p>${escapeHtml(proof.recommendation)}</p>
      </article>
      <article class="proof-card">
        <strong>Power BI build proof</strong>
        <p>${escapeHtml(proof.build)}</p>
      </article>
      <article class="proof-card">
        <strong>Metric definitions / QA checks</strong>
        <p>${escapeHtml(proof.qa)}</p>
      </article>
    </section>

    <p class="note">
      This portfolio preview uses synthetic public-safe values to demonstrate BI logic without publishing PBIX, raw data,
      local paths, user settings, security bindings, or company-confidential extracts.
    </p>
  `;
})();
