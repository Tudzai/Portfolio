import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getStageRouteContext } from "./agentic-finance-route-context.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const STAGE_PREFIX = "Stage/agentic-finance/";
const STAGE_ASSET_VERSION = "responsive-all-20260818";
const STAGE_FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%231d1329'/%3E%3Ctext x='32' y='39' text-anchor='middle' font-family='Arial,sans-serif' font-size='24' font-weight='700' fill='white'%3ETA%3C/text%3E%3C/svg%3E";
const EXCLUDED_PREFIXES = [
  "Stage/",
  "assets/",
  "knowledge-vault/",
  "collections-agent/",
  "BI/",
  "output/",
  "outputs/",
  "test-results/",
  "tmp/",
  "scripts/",
  "node_modules/",
];
const CUSTOM_STAGE_FILES = new Set([
  "Stage/agentic-finance/index.html",
  "Stage/agentic-finance/film.html",
]);
const TEMPLATE_STYLESHEETS = new Map([
  ["hub", "templates/hub.css"],
  ["case", "templates/case.css"],
  ["dashboard-preview", "templates/dashboard-preview.css"],
  ["model-detail", "templates/model-detail.css"],
  ["article", "templates/article.css"],
  ["deck", "templates/deck.css"],
  ["cv", "templates/cv.css"],
  ["utility", "templates/utility.css"],
]);
const STAGE_HOMEPAGE_FRAGMENT_MAP = new Map([
  ["#top", "#hero"],
  ["#fit", "#experience"],
  ["#proof", "#work"],
  ["#decision-cases", "#work"],
  ["#value", "#work"],
  ["#approach", "#demo"],
  ["#bi-products", "#work"],
  ["#automation", "#case-automation"],
]);

const toPosix = (value) => value.replaceAll(path.sep, "/");

function normalizeRoute(value) {
  return toPosix(value).replace(/^\.\//, "");
}

export function isScopedHtmlRoute(route) {
  const normalized = normalizeRoute(route);
  return (
    normalized.endsWith(".html") &&
    normalized !== "cv-pdf.html" &&
    !EXCLUDED_PREFIXES.some((prefix) => normalized.startsWith(prefix)) &&
    !normalized.includes("/node_modules/")
  );
}

export function classifyRoute(route) {
  const normalized = normalizeRoute(route);

  if (normalized === "index.html") return { family: "core", template: "homepage" };
  if (normalized === "cv.html") return { family: "core", template: "cv" };
  if (normalized === "404.html" || normalized === "share.html") {
    return { family: "core", template: "utility" };
  }

  if (normalized === "blog/index.html") return { family: "blog", template: "hub" };
  if (normalized.startsWith("blog/") && normalized.includes("/deck/")) {
    return { family: "blog", template: "deck" };
  }
  if (normalized.startsWith("blog/")) return { family: "blog", template: "article" };

  if (normalized === "showcase/fpa-decision-cases/index.html") {
    return { family: "fpa", template: "hub" };
  }
  if (normalized.startsWith("showcase/fpa-decision-cases/")) {
    return { family: "fpa", template: "case" };
  }
  if (normalized === "showcase/workspace-hub/index.html") {
    return { family: "fpa", template: "case" };
  }

  if (normalized === "showcase/powerbi/index.html") {
    return { family: "powerbi", template: "hub" };
  }
  if (normalized === "showcase/powerbi/project-preview.html" || normalized.endsWith("/preview.html")) {
    return { family: "powerbi", template: "dashboard-preview" };
  }
  if (normalized.startsWith("showcase/powerbi/")) {
    return { family: "powerbi", template: "case" };
  }

  if (normalized === "showcase/financial-models/index.html") {
    return { family: "models", template: "hub" };
  }
  if (normalized.startsWith("showcase/financial-models/")) {
    return { family: "models", template: "model-detail" };
  }

  if (normalized === "showcase/python-automation/index.html") {
    return { family: "automation", template: "hub" };
  }
  if (normalized.startsWith("showcase/python-automation/")) {
    return { family: "automation", template: "case" };
  }

  return { family: "core", template: "utility" };
}

export function templateStylesheetFor(template) {
  const stylesheet = TEMPLATE_STYLESHEETS.get(template);
  if (!stylesheet) throw new Error(`Unknown Agentic Finance stage template: ${template}`);
  return stylesheet;
}

async function walkHtml(directory, repoRoot, result = []) {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const absolute = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      await walkHtml(absolute, repoRoot, result);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const relative = normalizeRoute(path.relative(repoRoot, absolute));
    if (isScopedHtmlRoute(relative)) result.push(relative);
  }

  return result.sort();
}

function splitUrl(value) {
  const match = value.match(/^([^?#]*)([?#].*)?$/);
  return { pathname: match?.[1] ?? value, suffix: match?.[2] ?? "" };
}

function isNonLocalUrl(value) {
  return (
    value.startsWith("#") ||
    value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("javascript:") ||
    value.startsWith("data:") ||
    /^[a-z][a-z\d+.-]*:/i.test(value)
  );
}

function relativeLink(fromFile, toFile) {
  const relative = toPosix(path.posix.relative(path.posix.dirname(fromFile), toFile));
  return relative || path.posix.basename(toFile);
}

function resolveScopedRoute(sourcePath, sourceUrl, scopedRoutes) {
  const sourceDir = path.posix.dirname(sourcePath);
  const candidate = path.posix.normalize(path.posix.join(sourceDir, sourceUrl));
  const candidates = [candidate];

  if (candidate.endsWith("/")) candidates.push(`${candidate}index.html`);
  if (!candidate.endsWith(".html")) candidates.push(`${candidate}/index.html`);

  return candidates.find((route) => scopedRoutes.has(route));
}

function stagePathFor(sourceRoute) {
  return `${STAGE_PREFIX}${sourceRoute}`;
}

function stageSuffixFor(stagedRoute, suffix) {
  if (stagedRoute !== "index.html") return suffix;
  return STAGE_HOMEPAGE_FRAGMENT_MAP.get(suffix) ?? suffix;
}

function stageHref(stagePath, target, suffix = "") {
  return `${relativeLink(stagePath, stagePathFor(target))}${suffix}`;
}

export function renderStageHeader({ stagePath, family }) {
  const href = (target, suffix = "") => stageHref(stagePath, target, suffix);
  const current = (candidate) => candidate === family ? ' aria-current="page"' : "";

  return `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="site-header stage-shell-header" data-stage-shell data-header>
      <div class="page-shell header-inner stage-shell-inner">
        <a class="brand stage-shell-brand" href="${href("index.html", "#hero")}" aria-label="Truong Dinh Anh Tu, homepage">
          <span class="brand-mark stage-shell-brand-mark" aria-hidden="true">TA</span>
          <span class="brand-copy stage-shell-brand-copy"><strong>Truong Dinh Anh Tu</strong><small>FP&amp;A &times; AI</small></span>
        </a>
        <div class="header-actions stage-shell-actions">
          <button class="menu-button stage-shell-menu-button" type="button" data-stage-menu-toggle aria-expanded="false"
            aria-controls="primary-navigation" aria-label="Open capabilities menu">
            <span>Capabilities</span><i aria-hidden="true"></i>
          </button>
          <a class="header-link" href="${href("index.html", "#experience")}">Experience</a>
          <a class="header-link" href="${href("index.html", "#contact")}">Contact</a>
          <a class="header-link" href="${href("blog/index.html")}">Blog</a>
          <a class="nav-cv" href="${href("cv.html")}">View CV</a>
        </div>
        <nav class="stage-shell-menu" id="primary-navigation" data-stage-menu aria-label="Capabilities" aria-hidden="true" inert>
          <p class="nav-panel-label">Capabilities</p>
          <div class="capability-nav stage-shell-capabilities">
            <a href="${href("showcase/fpa-decision-cases/index.html")}"${current("fpa")}><span>01</span>FP&amp;A <i aria-hidden="true">&rarr;</i></a>
            <a href="${href("showcase/python-automation/index.html")}"${current("automation")}><span>02</span>Automation <i aria-hidden="true">&rarr;</i></a>
            <a href="${href("showcase/powerbi/index.html")}"${current("powerbi")}><span>03</span>BI Dashboards <i aria-hidden="true">&rarr;</i></a>
            <a href="${href("showcase/financial-models/index.html")}"${current("models")}><span>04</span>Financial Models <i aria-hidden="true">&rarr;</i></a>
            <a href="${href("index.html", "#case-agentic")}"><span>05</span>Agentic AI <i aria-hidden="true">&rarr;</i></a>
          </div>
          <div class="nav-utility-links stage-shell-utilities">
            <a href="${href("index.html", "#demo")}">Demo</a>
            <a href="${href("index.html", "#experience")}">Experience</a>
            <a href="${href("index.html", "#contact")}">Contact</a>
            <a href="${href("blog/index.html")}">Blog</a>
            <a href="${href("cv.html")}">View CV</a>
          </div>
        </nav>
      </div>
    </header>`;
}

export function renderStageFooter({ stagePath }) {
  const home = stageHref(stagePath, "index.html");
  return `
    <footer class="stage-site-footer stage-shell-footer" data-stage-shell>
      <div class="page-shell stage-shell-footer-inner">
        <span>&copy; <span data-current-year>2026</span> Truong Dinh Anh Tu</span>
        <a class="back-to-top stage-back-to-top" href="#main-content" aria-label="Back to top" tabindex="-1">
          <span aria-hidden="true">&uarr;</span>
        </a>
      </div>
    </footer>`;
}

export function renderStageRouteIntro({ stagePath, sourcePath, routeInfo }) {
  const context = getStageRouteContext({ sourcePath, ...routeInfo });
  const flow = context.flow.map((step) => `<li>${step}</li>`).join("\n          ");
  const hubHref = stageHref(stagePath, context.hubRoute);

  return `
      <section class="stage-route-intro" data-stage-route-intro aria-label="Page context">
        <div class="stage-route-identity">
          <span class="stage-route-index">${context.index}</span>
          <span class="stage-route-label">${context.label}</span>
        </div>
        <ol class="stage-route-flow" aria-label="Page flow">
          ${flow}
        </ol>
        <p class="stage-route-evidence">${context.evidence}</p>
        <a class="stage-route-link" href="${hubHref}">
          ${context.hubLabel}<span aria-hidden="true">&nearr;</span>
        </a>
      </section>`;
}

function stripLegacyShell(html) {
  return html
    .replace(/\s*<a\b[^>]*class=["'][^"']*\bskip-link\b[^"']*["'][^>]*>[\s\S]*?<\/a>/i, "")
    .replace(/\s*<header\b[^>]*class=["'][^"']*\bsite-header\b[^"']*["'][^>]*>[\s\S]*?<\/header>/i, "")
    .replace(/\s*<nav\b[^>]*class=["'][^"']*\bmobile-nav\b[^"']*["'][^>]*>[\s\S]*?<\/nav>/i, "")
    .replace(/\s*<section\b[^>]*\bdata-stage-route-intro\b[^>]*>[\s\S]*?<\/section>/gi, "")
    .replace(/\s*<footer\b[^>]*class=["'][^"']*\b(?:site-footer|stage-site-footer)\b[^"']*["'][^>]*>[\s\S]*?<\/footer>/gi, "");
}

function removeStageOnlyRedirects(html, sourcePath) {
  if (normalizeRoute(sourcePath) !== "404.html") return html;
  return html
    .replace(/\s*<meta\b(?=[^>]*\bhttp-equiv=["']refresh["'])[^>]*>/gi, "")
    .replace(/\s*<script\b[^>]*>[\s\S]*?window\.location\.replace\([\s\S]*?<\/script>/gi, "");
}

function prepareStageMain(html) {
  if (!/<main\b/i.test(html)) {
    return html.replace(/<\/body>/i, '<main id="main-content" data-stage-content></main>\n  </body>');
  }

  let prepared = html.replace(/<main\b([^>]*)>/i, (match, attributes) => {
    if (/\bdata-stage-content\b/i.test(attributes)) return match;
    return `<main${attributes} data-stage-content>`;
  });

  if (!/\bid=["']main-content["']/i.test(prepared)) {
    prepared = prepared.replace(/<main\b/i, '<div id="main-content" tabindex="-1"></div>\n    <main');
  }
  return prepared;
}

export function composeStageDocument(html, context) {
  const routeInfo = classifyRoute(context.sourcePath);
  const rewritten = rewriteHtmlForStage(removeStageOnlyRedirects(html, context.sourcePath), context);
  const withoutLegacyShell = stripLegacyShell(rewritten);
  const withMainId = prepareStageMain(withoutLegacyShell);
  const routeIntro = routeInfo.template === "homepage"
    ? ""
    : renderStageRouteIntro({
      stagePath: context.stagePath,
      sourcePath: context.sourcePath,
      routeInfo,
    });
  let withRouteIntro = withMainId;
  if (routeInfo.template === "deck") {
    withRouteIntro = withMainId.replace(
      /<div\b(?=[^>]*\bclass=["'][^"']*\bdeck-viewport\b[^"']*["'])[^>]*>/i,
      (viewport) => `${routeIntro}\n    ${viewport}`,
    );
  } else if (routeInfo.template !== "homepage") {
    withRouteIntro = withMainId.replace(
      /<main\b[^>]*>/i,
      (main) => `${main}${routeIntro}`,
    );
  }
  const withHeader = withRouteIntro.replace(/<body([^>]*)>/i, `$&${renderStageHeader({
    stagePath: context.stagePath,
    family: routeInfo.family,
  })}`);
  return withHeader.replace(/[\t ]*<\/body>/i, `${renderStageFooter({ stagePath: context.stagePath })}\n  </body>`);
}

function replaceRobotsMeta(html) {
  const robots = '<meta name="robots" content="noindex, nofollow, noarchive">';
  const robotsPattern = /<meta\b[^>]*\bname=["']robots["'][^>]*>/i;
  if (robotsPattern.test(html)) return html.replace(robotsPattern, robots);
  return html.replace(/<head([^>]*)>/i, `<head$1>\n    ${robots}`);
}

function removeAnalyticsScripts(html) {
  return html.replace(
    /\s*<script\b[^>]*\bsrc=["'][^"']*analytics\.js[^"']*["'][^>]*>\s*<\/script>/gi,
    "",
  );
}

function replaceLocalUrl(value, { sourcePath, stagePath, scopedRoutes }) {
  if (!value || value.includes("${") || isNonLocalUrl(value)) return value;
  const { pathname, suffix } = splitUrl(value);
  if (!pathname) return value;

  const sourceDir = path.posix.dirname(sourcePath);
  const sourceResolved = path.posix.normalize(path.posix.join(sourceDir, pathname));
  const stagedRoute = resolveScopedRoute(sourcePath, pathname, scopedRoutes);

  if (stagedRoute) {
    return `${relativeLink(stagePath, stagePathFor(stagedRoute))}${stageSuffixFor(stagedRoute, suffix)}`;
  }

  return `${relativeLink(stagePath, sourceResolved)}${suffix}`;
}

export function rewriteHtmlForStage(html, { sourcePath, stagePath, scopedRoutes }) {
  let result = html;
  const routeInfo = classifyRoute(sourcePath);

  result = removeAnalyticsScripts(result);
  result = replaceRobotsMeta(result);
  result = result.replace(
    /\b(?:href|src|poster|data-src)=(['"])(.*?)\1/gi,
    (_match, quote, value) =>
      `${_match.slice(0, _match.indexOf("="))}=${quote}${replaceLocalUrl(value, {
        sourcePath,
        stagePath,
        scopedRoutes,
      })}${quote}`,
  );

  result = result.replace(/<body([^>]*)>/i, (_match, attributes) => {
    const withoutStageAttrs = attributes
      .replace(/\sdata-stage-family=(['"]).*?\1/gi, "")
      .replace(/\sdata-stage-template=(['"]).*?\1/gi, "");
    return `<body${withoutStageAttrs} data-stage-family="${routeInfo.family}" data-stage-template="${routeInfo.template}">`;
  });

  return result;
}

export function isSelfContainedPowerBiPreview(route) {
  return /^showcase\/powerbi\/[^/]+\/preview\.html$/.test(normalizeRoute(route));
}

export async function buildStage({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const stageRoot = path.join(repoRoot, STAGE_PREFIX.replaceAll("/", path.sep));
  const sourceRoutes = await walkHtml(repoRoot, repoRoot);
  const scopedRoutes = new Set(sourceRoutes);

  if (sourceRoutes.length !== 86) {
    throw new Error(`Expected 86 scoped HTML routes, found ${sourceRoutes.length}`);
  }

  let generated = 0;
  for (const sourceRoute of sourceRoutes) {
    const stagePath = stagePathFor(sourceRoute);
    if (CUSTOM_STAGE_FILES.has(stagePath)) continue;

    const sourceAbsolute = path.join(repoRoot, sourceRoute.replaceAll("/", path.sep));
    const stageAbsolute = path.join(repoRoot, stagePath.replaceAll("/", path.sep));
    const sourceHtml = await fs.readFile(sourceAbsolute, "utf8");
    const context = {
      sourcePath: sourceRoute,
      stagePath,
      scopedRoutes,
    };
    const dashboardOnly = isSelfContainedPowerBiPreview(sourceRoute);
    const transformed = dashboardOnly
      ? rewriteHtmlForStage(removeStageOnlyRedirects(sourceHtml, sourceRoute), context)
      : composeStageDocument(sourceHtml, context);
    const stageDir = path.dirname(stageAbsolute);
    const cssDir = toPosix(path.relative(stageDir, path.join(stageRoot, "assets", "css")));
    const jsDir = toPosix(path.relative(stageDir, path.join(stageRoot, "assets", "js")));
    const routeInfo = classifyRoute(sourceRoute);
    const cssLinks = ["tokens.css", "base.css", "shell.css", "components.css", "templates.css", templateStylesheetFor(routeInfo.template)]
      .map((file) => `<link rel="stylesheet" data-agentic-stage href="${cssDir}/${file}?v=${STAGE_ASSET_VERSION}">`)
      .join("\n    ");
    const jsLinks = ["navigation.js", "site.js"]
      .map((file) => `<script src="${jsDir}/${file}?v=${STAGE_ASSET_VERSION}"></script>`)
      .join("\n    ");
    const withStageAssets = dashboardOnly
      ? transformed
      : transformed
        .replace(/<\/head>/i, `    <link rel="icon" href="${STAGE_FAVICON}">\n    ${cssLinks}\n  </head>`)
        .replace(/<\/body>/i, `    ${jsLinks}\n  </body>`);
    const normalizedStageAssets = withStageAssets.replace(/^[\t ]+$/gm, "");

    await fs.mkdir(stageDir, { recursive: true });
    await fs.writeFile(stageAbsolute, normalizedStageAssets, "utf8");
    generated += 1;
  }

  return { discovered: sourceRoutes.length, generated, skipped: sourceRoutes.length - generated };
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (invokedPath === import.meta.url) {
  buildStage()
    .then((summary) => {
      console.log(`Agentic Finance Stage built: ${summary.generated} generated, ${summary.skipped} custom/skipped, ${summary.discovered} routes discovered.`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
