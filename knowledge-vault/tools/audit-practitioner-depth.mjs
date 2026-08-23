import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const vaultDirectory = resolve(scriptDirectory, "..");
const argumentsList = process.argv.slice(2);

function argumentValue(flag) {
  const index = argumentsList.indexOf(flag);
  if (index < 0) return "";
  return argumentsList[index + 1] || "";
}

const inputPath = argumentValue("--input")
  ? resolve(process.cwd(), argumentValue("--input"))
  : join(vaultDirectory, "private", "knowledge.json");
const selectedDomainId = argumentValue("--domain") || "relationships-boundaries";

const sectionWordTargets = [60, 150, 150, 180, 100, 260, 120, 180, 180, 120, 120];
const evidenceDateFields = ["publishedAt", "adoptedAt", "updatedAt"];
const now = new Date();
const currentUtcTime = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
const recentEvidenceCutoffTime = Date.UTC(now.getUTCFullYear() - 2, now.getUTCMonth(), now.getUTCDate());

function present(value) {
  return typeof value === "string" && Boolean(value.trim());
}

function blockStrings(block) {
  if (!block || typeof block !== "object") return [];
  if (block.type === "paragraph") return [block.text];
  if (block.type === "list") return Array.isArray(block.items) ? block.items : [];
  if (block.type === "callout") return [block.label, block.text];
  if (block.type === "table") {
    return [
      ...(Array.isArray(block.headers) ? block.headers : []),
      ...(Array.isArray(block.rows) ? block.rows.flatMap((row) => Array.isArray(row) ? row : []) : []),
    ];
  }
  if (block.type === "flow") {
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

function wordsInSection(section) {
  return wordsInBlocks(section?.blocks);
}

function wordsInLesson(lesson) {
  return (Array.isArray(lesson?.sections) ? lesson.sections : [])
    .reduce((total, section) => total + wordsInSection(section), 0);
}

function evidenceTimes(source) {
  return evidenceDateFields
    .map((field) => source?.[field])
    .filter(present)
    .map((value) => Date.parse(`${value}T00:00:00Z`))
    .filter(Number.isFinite);
}

function normalizedLabel(value) {
  return present(value)
    ? value.trim().replace(/\s+/gu, " ").toLocaleLowerCase("en-US")
    : "";
}

function substantialAppliedBlock(block) {
  if (block?.type === "flow") return Array.isArray(block.steps) && block.steps.length >= 4;
  if (block?.type === "table") return Array.isArray(block.rows) && block.rows.length >= 4;
  if (block?.type === "list") return Array.isArray(block.items) && block.items.length >= 4;
  return false;
}

let source;
try {
  source = JSON.parse(await readFile(inputPath, "utf8"));
} catch {
  console.error("Practitioner-depth audit failed: source availability (1).");
  process.exit(1);
}

const domain = Array.isArray(source?.domains)
  ? source.domains.find((entry) => entry?.id === selectedDomainId)
  : null;

if (!domain) {
  console.error("Practitioner-depth audit failed: domain selection (1).");
  process.exit(1);
}

const sourceMap = new Map(
  (Array.isArray(domain.primarySources) ? domain.primarySources : [])
    .filter((entry) => present(entry?.id))
    .map((entry) => [entry.id, entry]),
);
const failures = new Map();

function record(category) {
  failures.set(category, (failures.get(category) || 0) + 1);
}

const modules = Array.isArray(domain.modules) ? domain.modules : [];
if (!modules.length) record("domain module coverage");

for (const module of modules) {
  if (!Array.isArray(module?.lessons) || !module.lessons.length) {
    record("module lesson coverage");
  }
  if (!present(module?.evidenceOutcome) || wordCount(module.evidenceOutcome) < 28) {
    record("module evidence standard");
  }
}

const lessons = modules.flatMap((module) => Array.isArray(module?.lessons) ? module.lessons : []);

for (const lesson of lessons) {
  const sections = Array.isArray(lesson?.sections) ? lesson.sections : [];
  const blocks = sections.flatMap((section) => Array.isArray(section?.blocks) ? section.blocks : []);
  const totalWords = wordsInLesson(lesson);
  const coreWords = wordsInBlocks(blocks.filter((block) => block?.learningLayer === "core"));
  const detailWords = wordsInBlocks(blocks.filter((block) => block?.learningLayer === "detail"));

  if (
    totalWords < 1_800
    || !Number.isInteger(lesson?.estimatedMinutes)
    || lesson.estimatedMinutes < 10
  ) record("lesson depth");
  if (coreWords < 500) record("beginner core depth");
  if (detailWords < 1_100) record("practitioner detail depth");
  if (
    sections.length !== sectionWordTargets.length
    || sections.some((section, index) => wordsInSection(section) < sectionWordTargets[index])
  ) record("section depth balance");

  const mechanismBlocks = sections[3]?.blocks || [];
  if (!mechanismBlocks.some((block) => new Set(["flow", "table"]).has(block?.type))) {
    record("mechanism model");
  }

  const exampleBlocks = sections[5]?.blocks || [];
  if (!exampleBlocks.some(substantialAppliedBlock)) record("applied scenario");

  const riskBlocks = sections[7]?.blocks || [];
  if (!riskBlocks.some((block) => block?.type === "callout" && block?.tone === "caution")) {
    record("safety and escalation boundary");
  }

  const differenceBlocks = sections[8]?.blocks || [];
  if (!differenceBlocks.some((block) => block?.type === "table")) record("context comparison");

  const references = Array.isArray(lesson?.references) ? lesson.references : [];
  const mappedSources = [...new Set(references)]
    .map((reference) => sourceMap.get(reference))
    .filter(Boolean);
  if (mappedSources.length < 4) record("source breadth");

  const organizations = new Set(
    mappedSources
      .map((sourceEntry) => normalizedLabel(sourceEntry?.organization))
      .filter(Boolean),
  );
  if (organizations.size < 3) record("source organization diversity");

  const sourceTypes = new Set(
    mappedSources
      .map((sourceEntry) => normalizedLabel(sourceEntry?.sourceType))
      .filter(Boolean),
  );
  if (sourceTypes.size < 2) record("source-method diversity");

  const datedTimes = mappedSources.flatMap(evidenceTimes);
  if (datedTimes.some((time) => time > currentUtcTime)) record("future evidence date");
  if (!datedTimes.some((time) => time >= recentEvidenceCutoffTime && time <= currentUtcTime)) {
    record("recent evidence check");
  }
}

if (failures.size) {
  const summary = [...failures.entries()]
    .sort(([left], [right]) => left.localeCompare(right, "en"))
    .map(([category, count]) => `${category} (${count})`)
    .join(", ");
  console.error(`Practitioner-depth audit failed: ${summary}.`);
  process.exit(1);
}

console.log(`Practitioner-depth audit passed: lessons (${lessons.length}).`);
