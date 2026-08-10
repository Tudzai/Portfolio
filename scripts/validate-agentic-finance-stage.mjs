import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const STAGE_ROOT_RELATIVE = path.join("Stage", "agentic-finance");

export function shouldSkipLocalReference(value) {
  return value.includes("${");
}

const isNonLocalUrl = (value) =>
  !value ||
  value.startsWith("#") ||
  value.startsWith("/") ||
  value.startsWith("//") ||
  value.startsWith("mailto:") ||
  value.startsWith("tel:") ||
  value.startsWith("javascript:") ||
  value.startsWith("data:") ||
  /^[a-z][a-z\d+.-]*:/i.test(value);

function stripUrlSuffix(value) {
  return value.match(/^([^?#]*)/)?.[1] ?? value;
}

export function validateStageHtml(html) {
  const errors = [];
  const robots = html.match(/<meta\b[^>]*\bname=["']robots["'][^>]*>/i)?.[0] ?? "";

  if (!/noindex/i.test(robots) || !/nofollow/i.test(robots) || !/noarchive/i.test(robots)) {
    errors.push("robots metadata must be noindex, nofollow, noarchive");
  }

  const unsafePatterns = [
    [/analytics\.js/i, "analytics.js must not load in Stage"],
    [/posthog/i, "posthog/session replay must not load in Stage"],
    [/file:\/\//i, "file:// local paths are not public-safe"],
    [/(?:[A-Z]:[\\/]+Users[\\/]|\/Users\/)/i, "user profile paths are not public-safe"],
    [/SecurityBindings/i, "Power BI security bindings are not public-safe"],
    [/\.(?:pbix|pbit)\b/i, ".pbix/.pbit source artifacts must not appear in Stage"],
    [/(?:api[_-]?key|access[_-]?token|secret[_-]?key)\s*[:=]/i, "credential-like values are not public-safe"],
  ];

  for (const [pattern, message] of unsafePatterns) {
    if (pattern.test(html)) errors.push(message);
  }

  return errors;
}

export function validateStageStructure(html, { template } = {}) {
  const errors = [];
  const headerCount = (html.match(/<header\b[^>]*data-stage-shell\b[^>]*>/gi) ?? []).length;
  const footerCount = (html.match(/<footer\b[^>]*stage-site-footer\b[^>]*>/gi) ?? []).length;

  if (headerCount !== 1) errors.push("must contain one shared stage header");
  if (!html.includes('id="main-content"')) errors.push("must contain a main-content landmark");
  if (!/<main\b[^>]*\bdata-stage-content\b/i.test(html)) errors.push("must contain one stage content boundary");
  if (footerCount !== 1) errors.push("must contain one shared stage footer");
  if (/class=["'][^"']*mobile-nav/i.test(html)) errors.push("legacy mobile navigation must be removed");

  if (template && template !== "homepage") {
    const adapter = `assets/css/templates/${template}.css`;
    if (!html.includes(adapter)) errors.push(`must load ${adapter}`);
  }

  return errors;
}

function loadManifest(source) {
  return [...source.matchAll(/\{\s*source:\s*"([^"]+)",\s*stage:\s*"([^"]+)",\s*family:\s*"([^"]+)",\s*template:\s*"([^"]+)",\s*status:\s*"([^"]+)"\s*\}/g)]
    .map((match) => ({ source: match[1], stage: match[2], family: match[3], template: match[4], status: match[5] }));
}

function resolveLocalReference(stageAbsolute, value) {
  const pathname = stripUrlSuffix(value);
  return path.resolve(path.dirname(stageAbsolute), pathname.replaceAll("/", path.sep));
}

function localReferences(html) {
  return [...html.matchAll(/\b(?:href|src|poster|data-src)=(['"])(.*?)\1/gi)].map((match) => match[2]);
}

export async function validateStage({ repoRoot = DEFAULT_REPO_ROOT } = {}) {
  const manifestPath = path.join(repoRoot, STAGE_ROOT_RELATIVE, "review-data.js");
  const manifestSource = await fs.readFile(manifestPath, "utf8");
  const routes = loadManifest(manifestSource);
  const errors = [];
  const stageRoot = path.resolve(repoRoot, STAGE_ROOT_RELATIVE);

  if (routes.length !== 85) errors.push(`manifest contains ${routes.length} routes; expected 85`);

  for (const route of routes) {
    const stageAbsolute = path.resolve(repoRoot, route.stage.replaceAll("/", path.sep));
    if (!stageAbsolute.startsWith(stageRoot) || !stageAbsolute.endsWith(".html")) {
      errors.push(`${route.source}: stage target escapes Stage/agentic-finance`);
      continue;
    }

    let html;
    try {
      html = await fs.readFile(stageAbsolute, "utf8");
    } catch {
      errors.push(`${route.source}: missing staged file ${route.stage}`);
      continue;
    }

    validateStageHtml(html).forEach((error) => errors.push(`${route.source}: ${error}`));
    validateStageStructure(html, route).forEach((error) => errors.push(`${route.source}: ${error}`));

    for (const value of localReferences(html)) {
      if (shouldSkipLocalReference(value) || isNonLocalUrl(value)) continue;
      const referenced = resolveLocalReference(stageAbsolute, value);
      try {
        await fs.access(referenced);
      } catch {
        errors.push(`${route.source}: missing local reference ${value}`);
        continue;
      }

      if (referenced.endsWith(".html") && !referenced.startsWith(stageRoot)) {
        errors.push(`${route.source}: internal HTML link escapes Stage: ${value}`);
      }
    }
  }

  return { routes, errors };
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (invokedPath === import.meta.url) {
  validateStage()
    .then(({ routes, errors }) => {
      const counts = routes.reduce((summary, route) => {
        summary[route.family] = (summary[route.family] ?? 0) + 1;
        return summary;
      }, {});
      console.log(`Agentic Finance Stage validation: ${routes.length} routes (${Object.entries(counts).map(([family, count]) => `${family} ${count}`).join(", ")}).`);
      if (errors.length) {
        errors.forEach((error) => console.error(`FAIL ${error}`));
        process.exitCode = 1;
        return;
      }
      console.log("PASS noindex, privacy, local-file, and Stage-boundary checks.");
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
