import { readFile, realpath } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const vaultDirectory = resolve(scriptDirectory, "..");
const repositoryRoot = resolve(vaultDirectory, "..");
const argumentsList = process.argv.slice(2);

function argumentValue(flag) {
  const index = argumentsList.indexOf(flag);
  return index >= 0 ? argumentsList[index + 1] || "" : "";
}

function within(parent, candidate) {
  const pathFromParent = relative(parent, candidate);
  return pathFromParent === "" || (!pathFromParent.startsWith("..") && !isAbsolute(pathFromParent));
}

function present(value) {
  return typeof value === "string" && Boolean(value.trim());
}

function blockStrings(block) {
  if (block?.type === "paragraph") return [block.text];
  if (block?.type === "list") return Array.isArray(block.items) ? block.items : [];
  if (block?.type === "callout") return [block.label, block.text];
  if (block?.type === "table") {
    return [
      ...(Array.isArray(block.headers) ? block.headers : []),
      ...(Array.isArray(block.rows) ? block.rows.flat() : []),
    ];
  }
  if (block?.type === "flow") {
    return Array.isArray(block.steps)
      ? block.steps.flatMap((step) => [step?.label, step?.title, step?.detail])
      : [];
  }
  return [];
}

function wordCount(value) {
  return String(value || "")
    .replace(/\[\[[a-z0-9-]+\]\]/giu, "")
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .length;
}

function wordsInBlocks(blocks) {
  return (Array.isArray(blocks) ? blocks : [])
    .flatMap(blockStrings)
    .reduce((total, value) => total + wordCount(value), 0);
}

function normalized(value) {
  return present(value) ? value.trim().replace(/\s+/gu, " ").toLocaleLowerCase("en-US") : "";
}

function substantialAppliedBlock(block) {
  if (block?.type === "flow") return Array.isArray(block.steps) && block.steps.length >= 4;
  if (block?.type === "table") return Array.isArray(block.rows) && block.rows.length >= 4;
  if (block?.type === "list") return Array.isArray(block.items) && block.items.length >= 4;
  return false;
}

const planArgument = argumentValue("--plan");
if (!planArgument) {
  console.error("Lesson-plan audit failed: external plan path (1).");
  process.exit(1);
}

const planPath = resolve(process.cwd(), planArgument);
let repositoryRealPath;
let planRealPath;
let plan;
try {
  [repositoryRealPath, planRealPath, plan] = await Promise.all([
    realpath(repositoryRoot),
    realpath(planPath),
    readFile(planPath, "utf8").then(JSON.parse),
  ]);
} catch {
  console.error("Lesson-plan audit failed: external plan availability (1).");
  process.exit(1);
}

if (within(repositoryRealPath, planRealPath)) {
  console.error("Lesson-plan audit failed: external-plan boundary (1).");
  process.exit(1);
}

const failures = new Map();
function record(category) {
  failures.set(category, (failures.get(category) || 0) + 1);
}

if (
  !plan
  || typeof plan !== "object"
  || Array.isArray(plan)
  || !present(plan.domainId)
  || !Number.isInteger(plan.moduleIndex)
  || plan.moduleIndex < 1
  || !Number.isInteger(plan.lessonIndex)
  || plan.lessonIndex < 1
  || !plan.lesson
  || typeof plan.lesson !== "object"
  || !Array.isArray(plan.sources)
) {
  console.error("Lesson-plan audit failed: plan shape (1).");
  process.exit(1);
}

const sectionTargets = [60, 150, 150, 180, 100, 260, 120, 180, 180, 120, 120];
const sections = Array.isArray(plan.lesson.sections) ? plan.lesson.sections : [];
const blocks = sections.flatMap((section) => Array.isArray(section?.blocks) ? section.blocks : []);
const totalWords = wordsInBlocks(blocks);
const coreWords = wordsInBlocks(blocks.filter((block) => block?.learningLayer === "core"));
const detailWords = wordsInBlocks(blocks.filter((block) => block?.learningLayer === "detail"));

if (totalWords < 2_400 || totalWords > 3_000) record("lesson word band");
if (coreWords < 500) record("beginner core depth");
if (detailWords < 1_150) record("practitioner detail depth");
if (!Number.isInteger(plan.lesson.estimatedMinutes) || plan.lesson.estimatedMinutes < 10) {
  record("estimated reading time");
}
if (
  sections.length !== sectionTargets.length
  || sections.some((section, index) => wordsInBlocks(section?.blocks) < sectionTargets[index])
) record("section depth balance");
if (sections.some((section) => !(section?.blocks || []).some((block) => block?.learningLayer === "core"))) {
  record("section core coverage");
}
if (!(sections[3]?.blocks || []).some((block) => new Set(["flow", "table"]).has(block?.type))) {
  record("mechanism model");
}
if (!(sections[5]?.blocks || []).some(substantialAppliedBlock)) record("applied scenario");
const riskBlocks = sections[7]?.blocks || [];
if (!riskBlocks.some((block) => block?.type === "callout" && block?.tone === "caution")) {
  record("safety boundary");
}
if (riskBlocks.some((block) => block?.learningLayer !== "core")) record("risk layer safety");
if (!(sections[8]?.blocks || []).some((block) => block?.type === "table")) {
  record("context comparison");
}

const sourceMap = new Map(
  plan.sources
    .filter((source) => present(source?.alias))
    .map((source) => [source.alias, source]),
);
const references = [...new Set(Array.isArray(plan.lesson.references) ? plan.lesson.references : [])];
const mappedSources = references.map((reference) => sourceMap.get(reference)).filter(Boolean);
if (mappedSources.length < 4 || mappedSources.length !== references.length) record("source breadth");
if (new Set(mappedSources.map((source) => normalized(source.organization)).filter(Boolean)).size < 3) {
  record("source organization diversity");
}
if (new Set(mappedSources.map((source) => normalized(source.sourceType)).filter(Boolean)).size < 2) {
  record("source-method diversity");
}

const now = new Date();
const currentUtcTime = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
const recentCutoffTime = Date.UTC(now.getUTCFullYear() - 2, now.getUTCMonth(), now.getUTCDate());
const evidenceDates = mappedSources.flatMap((source) => ["publishedAt", "adoptedAt", "updatedAt"]
  .map((field) => source?.[field])
  .filter(present)
  .map((value) => Date.parse(`${value}T00:00:00Z`))
  .filter(Number.isFinite));
if (evidenceDates.some((time) => time > currentUtcTime)) record("future evidence date");
if (!evidenceDates.some((time) => time >= recentCutoffTime && time <= currentUtcTime)) {
  record("recent evidence check");
}

if (failures.size) {
  const summary = [...failures.entries()]
    .sort(([left], [right]) => left.localeCompare(right, "en"))
    .map(([category, count]) => `${category} (${count})`)
    .join(", ");
  console.error(
    `Lesson-plan audit failed at module ${plan.moduleIndex}, lesson ${plan.lessonIndex}: ${summary}; total (${totalWords}), core (${coreWords}), detail (${detailWords}).`,
  );
  process.exit(1);
}

console.log(
  `Lesson-plan audit passed at module ${plan.moduleIndex}, lesson ${plan.lessonIndex}: total (${totalWords}), core (${coreWords}), detail (${detailWords}), sources (${mappedSources.length}).`,
);
