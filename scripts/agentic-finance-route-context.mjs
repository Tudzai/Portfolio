const CONTEXTS = Object.freeze({
  "core:cv": Object.freeze({
    index: "00",
    label: "Profile / CV",
    flow: Object.freeze(["Experience", "Evidence", "Contact"]),
    evidence: "Public professional profile",
    hubRoute: "index.html",
    hubLabel: "Portfolio home",
  }),
  "core:utility": Object.freeze({
    index: "00",
    label: "Portfolio / Route",
    flow: Object.freeze(["Recover", "Continue", "Explore"]),
    evidence: "Stage review route",
    hubRoute: "index.html",
    hubLabel: "Portfolio home",
  }),
  "blog:hub": Object.freeze({
    index: "05",
    label: "Blog / Library",
    flow: Object.freeze(["Explore", "Read", "Continue"]),
    evidence: "Editorial analysis",
    hubRoute: "index.html",
    hubLabel: "Portfolio home",
  }),
  "blog:article": Object.freeze({
    index: "05",
    label: "Blog / Article",
    flow: Object.freeze(["Idea", "Evidence", "Takeaway"]),
    evidence: "Editorial analysis",
    hubRoute: "blog/index.html",
    hubLabel: "All articles",
  }),
  "blog:deck": Object.freeze({
    index: "05",
    label: "Blog / Interactive Story",
    flow: Object.freeze(["Context", "Story", "Decision"]),
    evidence: "Interactive editorial evidence",
    hubRoute: "blog/index.html",
    hubLabel: "Article page",
  }),
  "fpa:hub": Object.freeze({
    index: "01",
    label: "FP&A / Library",
    flow: Object.freeze(["Explore", "Compare", "Open"]),
    evidence: "Public-safe decision evidence",
    hubRoute: "index.html",
    hubLabel: "Portfolio home",
  }),
  "fpa:case": Object.freeze({
    index: "01",
    label: "FP&A / Case",
    flow: Object.freeze(["Decision", "Drivers", "Action"]),
    evidence: "Public-safe decision evidence",
    hubRoute: "showcase/fpa-decision-cases/index.html",
    hubLabel: "FP&A cases",
  }),
  "automation:hub": Object.freeze({
    index: "02",
    label: "Automation / Library",
    flow: Object.freeze(["Explore", "Compare", "Run"]),
    evidence: "Public-safe runnable samples",
    hubRoute: "index.html",
    hubLabel: "Portfolio home",
  }),
  "automation:case": Object.freeze({
    index: "02",
    label: "Automation / Workflow",
    flow: Object.freeze(["Inputs", "Workflow", "Output"]),
    evidence: "Public-safe runnable sample",
    hubRoute: "showcase/python-automation/index.html",
    hubLabel: "Automation library",
  }),
  "powerbi:hub": Object.freeze({
    index: "03",
    label: "BI / Library",
    flow: Object.freeze(["Explore", "Compare", "Open"]),
    evidence: "Interactive public-safe previews",
    hubRoute: "index.html",
    hubLabel: "Portfolio home",
  }),
  "powerbi:case": Object.freeze({
    index: "03",
    label: "BI / Decision Product",
    flow: Object.freeze(["Signal", "Insight", "Decision"]),
    evidence: "Interactive public-safe preview",
    hubRoute: "showcase/powerbi/index.html",
    hubLabel: "BI dashboards",
  }),
  "powerbi:dashboard-preview": Object.freeze({
    index: "03",
    label: "BI / Interactive Preview",
    flow: Object.freeze(["Signal", "Insight", "Action"]),
    evidence: "Synthetic interactive evidence",
    hubRoute: "showcase/powerbi/index.html",
    hubLabel: "Project page",
  }),
  "models:hub": Object.freeze({
    index: "04",
    label: "Models / Library",
    flow: Object.freeze(["Explore", "Compare", "Download"]),
    evidence: "Governed synthetic workbooks",
    hubRoute: "index.html",
    hubLabel: "Portfolio home",
  }),
  "models:model-detail": Object.freeze({
    index: "04",
    label: "Model / Workbook",
    flow: Object.freeze(["Inputs", "Logic", "Controls"]),
    evidence: "Governed synthetic workbook",
    hubRoute: "showcase/financial-models/index.html",
    hubLabel: "Model library",
  }),
});

function articleRouteForDeck(sourcePath) {
  return sourcePath.replace(/\/deck\/index\.html$/i, "/index.html");
}

function projectRouteForPreview(sourcePath) {
  if (sourcePath === "showcase/powerbi/project-preview.html") {
    return "showcase/powerbi/index.html";
  }
  return sourcePath.replace(/\/preview\.html$/i, "/index.html");
}

export function getStageRouteContext({ sourcePath, family, template }) {
  const base = CONTEXTS[`${family}:${template}`];
  if (!base) {
    throw new Error(`No Agentic Finance route context for ${family}/${template}`);
  }

  let hubRoute = base.hubRoute;
  if (template === "deck") hubRoute = articleRouteForDeck(sourcePath);
  if (template === "dashboard-preview") hubRoute = projectRouteForPreview(sourcePath);

  return {
    ...base,
    flow: [...base.flow],
    hubRoute,
  };
}
