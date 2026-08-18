import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  classifyRoute,
  composeStageDocument,
  isScopedHtmlRoute,
  templateStylesheetFor,
} from "./build-agentic-finance-stage.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const STAGE_PREFIX = "Stage/agentic-finance/";
const THEME_ROOT = "assets/agentic-home";
const THEME_VERSION = "routes-20260818-responsive-all1";
const SKIPPED_ROUTES = new Set([
  "index.html",
  "404.html",
]);
const THEME_FILES = [
  "css/tokens.css",
  "css/base.css",
  "css/shell.css",
  "css/components.css",
  "css/templates.css",
  "css/templates/hub.css",
  "css/templates/case.css",
  "css/templates/dashboard-preview.css",
  "css/templates/model-detail.css",
  "css/templates/article.css",
  "css/templates/deck.css",
  "css/templates/cv.css",
  "css/templates/utility.css",
  "js/navigation.js",
  "js/site.js",
];
const EXCLUDED_ROOT_DIRECTORIES = new Set([
  "Stage",
  "assets",
  "BI",
  "collections-agent",
  "knowledge-vault",
  "node_modules",
  "output",
  "outputs",
  "scripts",
  "test-results",
  "tmp",
]);

const toPosix = (value) => value.replaceAll(path.sep, "/");
const normalizeRoute = (value) => toPosix(value).replace(/^\.\//, "");

export function isSkippedRoute(route) {
  return SKIPPED_ROUTES.has(route) || /^showcase\/powerbi\/[^/]+\/preview\.html$/.test(route);
}

async function walkProductionHtml(directory, repoRoot, result = []) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      if (directory === repoRoot && EXCLUDED_ROOT_DIRECTORIES.has(entry.name)) continue;
      await walkProductionHtml(absolute, repoRoot, result);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const route = normalizeRoute(path.relative(repoRoot, absolute));
    if (isScopedHtmlRoute(route)) result.push(route);
  }
  return result.sort();
}

function relativeLink(fromFile, toFile) {
  return toPosix(path.posix.relative(path.posix.dirname(fromFile), toFile)) || path.posix.basename(toFile);
}

function splitUrl(value) {
  const match = value.match(/^([^?#]*)([?#].*)?$/);
  return { pathname: match?.[1] ?? value, suffix: match?.[2] ?? "" };
}

function isNonLocalUrl(value) {
  return (
    !value ||
    value.includes("${") ||
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

export function cleanExistingTheme(html) {
  return html
    .replace(/\s*<link\b(?![^>]*\bdata-model-variant\b)(?=[^>]*(?:data-agentic-(?:stage|theme)|assets\/agentic-home\/css\/))[^>]*>/gi, "")
    .replace(/\s*<script\b[^>]*\bsrc=["'][^"']*assets\/agentic-home\/js\/(?:navigation|site)\.js[^"']*["'][^>]*>\s*<\/script>/gi, "")
    .replace(/\s*<section\b[^>]*\bdata-stage-route-intro\b[^>]*>[\s\S]*?<\/section>/gi, "")
    .replace(/\s*<div\b[^>]*\bid=["']main-content["'][^>]*>\s*<\/div>/gi, "");
}

function stageAssetLinks(stagePath, template) {
  const stageDir = path.posix.dirname(stagePath);
  const cssRoot = toPosix(path.posix.relative(stageDir, `${STAGE_PREFIX}assets/css`));
  const jsRoot = toPosix(path.posix.relative(stageDir, `${STAGE_PREFIX}assets/js`));
  const styles = [
    "tokens.css",
    "base.css",
    "shell.css",
    "components.css",
    "templates.css",
    templateStylesheetFor(template),
  ].map((file) => `<link rel="stylesheet" data-agentic-theme href="${cssRoot}/${file}?v=${THEME_VERSION}">`).join("\n    ");
  const scripts = ["navigation.js", "site.js"]
    .map((file) => `<script data-agentic-theme src="${jsRoot}/${file}?v=${THEME_VERSION}"></script>`)
    .join("\n    ");
  return { styles, scripts };
}

function mapStageReference(value, { repoRoot, stageAbsolute, productionRoute }) {
  if (isNonLocalUrl(value)) return value;
  const { pathname, suffix } = splitUrl(value);
  if (!pathname) return value;

  const stageRoot = path.resolve(repoRoot, "Stage", "agentic-finance");
  const resolved = path.resolve(path.dirname(stageAbsolute), pathname.replaceAll("/", path.sep));
  if (!resolved.startsWith(repoRoot)) {
    throw new Error(`${productionRoute}: local reference escapes repository: ${value}`);
  }

  let target;
  if (resolved.startsWith(stageRoot)) {
    const insideStage = normalizeRoute(path.relative(stageRoot, resolved));
    if (insideStage.startsWith("assets/")) {
      target = `${THEME_ROOT}/${insideStage.slice("assets/".length)}`;
    } else if (insideStage === "styles.css") {
      target = `${THEME_ROOT}/css/homepage.css`;
    } else if (insideStage === "script.js") {
      target = `${THEME_ROOT}/js/homepage.js`;
    } else {
      target = insideStage;
    }
  } else {
    target = normalizeRoute(path.relative(repoRoot, resolved));
  }

  return `${relativeLink(productionRoute, target)}${suffix}`;
}

export function promoteStageHtml(html, { repoRoot, sourceRoute }) {
  const stagePath = `${STAGE_PREFIX}${sourceRoute}`;
  const stageAbsolute = path.resolve(repoRoot, stagePath.replaceAll("/", path.sep));
  let result = html.replace(
    /\b(?:href|src|poster|data-src)=(['"])(.*?)\1/gi,
    (match, quote, value) => {
      const attribute = match.slice(0, match.indexOf("="));
      const mapped = mapStageReference(value, { repoRoot, stageAbsolute, productionRoute: sourceRoute });
      return `${attribute}=${quote}${mapped}${quote}`;
    },
  );

  result = result
    .replace(/<meta\b[^>]*\bname=["']robots["'][^>]*>/i, '<meta name="robots" content="index, follow">')
    .replace(/\sdata-agentic-stage(?=\s|>)/gi, " data-agentic-theme")
    .replaceAll("hybrid-20260810", THEME_VERSION)
    .replace(/\s*<link\b[^>]*\bhref=["']data:image\/svg\+xml,[^"']*["'][^>]*>/gi, "");

  if (!/analytics\.js/i.test(result)) {
    const analyticsHref = `${relativeLink(sourceRoute, "analytics.js")}?v=${THEME_VERSION}`;
    result = result.replace(/<\/head>/i, `    <script src="${analyticsHref}"></script>\n  </head>`);
  }

  if (/Stage\/agentic-finance/i.test(result)) {
    throw new Error(`${sourceRoute}: Stage URL remained after promotion`);
  }
  return result.replace(/^[\t ]+$/gm, "");
}

async function copyThemeAssets(repoRoot) {
  const stageThemeRoot = path.join(repoRoot, "Stage", "agentic-finance", "assets");
  const canonicalThemeRoot = path.join(repoRoot, ...THEME_ROOT.split("/"));
  for (const relative of THEME_FILES) {
    const source = path.join(stageThemeRoot, ...relative.split("/"));
    const target = path.join(canonicalThemeRoot, ...relative.split("/"));
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(source, target);
  }
}

export async function promoteAgenticFinance({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const routes = await walkProductionHtml(repoRoot, repoRoot);
  if (routes.length !== 86) {
    throw new Error(`Expected 86 recruiter-facing production routes, found ${routes.length}`);
  }

  await copyThemeAssets(repoRoot);
  const scopedRoutes = new Set(routes);
  let promoted = 0;

  for (const sourceRoute of routes) {
    if (isSkippedRoute(sourceRoute)) continue;
    const sourceAbsolute = path.join(repoRoot, ...sourceRoute.split("/"));
    const sourceHtml = cleanExistingTheme(await fs.readFile(sourceAbsolute, "utf8"));
    const stagePath = `${STAGE_PREFIX}${sourceRoute}`;
    const routeInfo = classifyRoute(sourceRoute);
    const stageLikeHtml = composeStageDocument(sourceHtml, {
      sourcePath: sourceRoute,
      stagePath,
      scopedRoutes,
    });
    const { styles, scripts } = stageAssetLinks(stagePath, routeInfo.template);
    const withThemeAssets = stageLikeHtml
      .replace(/<\/head>/i, `    ${styles}\n  </head>`)
      .replace(/<\/body>/i, `    ${scripts}\n  </body>`);
    const productionHtml = promoteStageHtml(withThemeAssets, { repoRoot, sourceRoute });
    await fs.writeFile(sourceAbsolute, productionHtml, "utf8");
    promoted += 1;
  }

  return { discovered: routes.length, promoted, skipped: routes.length - promoted };
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (invokedPath === import.meta.url) {
  promoteAgenticFinance()
    .then(({ discovered, promoted, skipped }) => {
      console.log(`Agentic Finance production promotion: ${promoted} promoted, ${skipped} skipped, ${discovered} routes discovered.`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
