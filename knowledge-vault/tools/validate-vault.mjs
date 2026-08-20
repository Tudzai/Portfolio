import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const vaultDirectory = resolve(scriptDirectory, "..");
const inputPath = process.argv[2]
  ? resolve(process.cwd(), process.argv[2])
  : join(vaultDirectory, "private", "knowledge.json");

const expectedSectionCount = 11;
const canonicalSectionIds = [
  "muc-tieu",
  "khai-niem",
  "vi-sao-quan-trong",
  "cach-hoat-dong",
  "ben-lien-quan",
  "vi-du",
  "tac-dong",
  "rui-ro",
  "khac-biet",
  "thuat-ngu",
  "tom-tat",
];
const canonicalSectionTitles = [
  "Mục tiêu của bài học",
  "Khái niệm chính",
  "Vì sao nội dung này quan trọng",
  "Cách nó hoạt động",
  "Các bên liên quan",
  "Ví dụ thực tế đơn giản",
  "Mô hình doanh thu hoặc tác động tài chính",
  "Rủi ro và hạn chế",
  "Sự khác biệt giữa các thị trường hoặc quy định",
  "Các thuật ngữ cần nhớ",
  "Tóm tắt bài học",
];
const releaseManifest = [
  { id: "fintech-domain", modules: 12, lessons: 67, sources: 179 },
  { id: "fin-domain", modules: 15, lessons: 74, sources: 97 },
  { id: "rtcfo-domain", modules: 18, lessons: 89, sources: 68 },
  { id: "brk-domain-breaking", modules: 14, lessons: 68, sources: 41 },
  { id: "mrel-domain", modules: 15, lessons: 60, sources: 56 },
  { id: "personal-style", modules: 6, lessons: 18, sources: 12 },
  { id: "photography", modules: 6, lessons: 18, sources: 12 },
  { id: "cooking", modules: 6, lessons: 18, sources: 12 },
];
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const sourceDateFields = ["publishedAt", "adoptedAt", "updatedAt", "reviewedAt", "accessedAt"];

const issues = new Set();
const globalIds = new Set();

function present(value) {
  return typeof value === "string" && Boolean(value.trim());
}

function claimId(value, category) {
  if (!present(value) || value !== value.trim() || !idPattern.test(value) || globalIds.has(value)) {
    issues.add(category);
    return false;
  }
  globalIds.add(value);
  return true;
}

function isHttps(value) {
  if (!present(value)) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isIsoDate(value) {
  if (!present(value) || !datePattern.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
}

function validateBlock(block) {
  if (!block || typeof block !== "object" || !present(block.type)) return false;
  if (block.type === "paragraph") return present(block.text) && block.text.length <= 1_600;
  if (block.type === "list") {
    return Array.isArray(block.items)
      && block.items.length > 0
      && block.items.every((item) => present(item) && item.length <= 1_000);
  }
  if (block.type === "callout") {
    return present(block.label)
      && present(block.text)
      && block.text.length <= 1_600
      && new Set(["note", "caution"]).has(block.tone);
  }
  if (block.type === "table") {
    return Array.isArray(block.headers)
      && block.headers.length > 0
      && block.headers.every(present)
      && Array.isArray(block.rows)
      && block.rows.length > 0
      && block.rows.every((row) =>
        Array.isArray(row) && row.length === block.headers.length && row.every((cell) => present(cell) && cell.length <= 800),
      );
  }
  if (block.type === "flow") {
    return Array.isArray(block.steps)
      && block.steps.length > 0
      && block.steps.every((step) =>
        present(step?.label)
        && present(step?.title)
        && present(step?.detail)
        && step.detail.length <= 900,
      );
  }
  return false;
}

function visibleBlockStrings(block) {
  if (!block || typeof block !== "object") return [];
  if (block.type === "paragraph") return [block.text];
  if (block.type === "list") return Array.isArray(block.items) ? block.items : [];
  if (block.type === "callout") return [block.text];
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

function inlineCitationIds(sections) {
  const renderedText = (Array.isArray(sections) ? sections : [])
    .flatMap((section) => Array.isArray(section?.blocks) ? section.blocks.flatMap(visibleBlockStrings) : [])
    .filter((value) => typeof value === "string")
    .join("\n");
  return [...renderedText.matchAll(/\[\[([a-z0-9-]+)\]\]/gi)].map((match) => match[1]);
}

function validateSource(source, sourceMap) {
  if (!source || typeof source !== "object" || !claimId(source.id, "source identifiers")) return;
  sourceMap.set(source.id, source);
  if (
    !present(source.title)
    || !present(source.organization)
    || !present(source.scope)
    || !present(source.sourceType)
    || !isHttps(source.url)
  ) issues.add("source completeness");
  const sourceDates = sourceDateFields
    .map((field) => source[field])
    .filter((value) => value !== undefined && value !== null && value !== "");
  if (!sourceDates.length || sourceDates.some((value) => !isIsoDate(value))) {
    issues.add("source dates");
  }
}

function normalizedOrganization(value) {
  return present(value) ? value.trim().replace(/\s+/gu, " ").toLocaleLowerCase("en-US") : "";
}

function validateLesson(lesson, sourceMap, usedSources) {
  if (!lesson || typeof lesson !== "object" || !claimId(lesson.id, "lesson identifiers")) return;
  if (!present(lesson.title) || !present(lesson.summary)) issues.add("lesson framing");
  if (lesson.status !== "published") issues.add("publication coverage");
  if (!Array.isArray(lesson.sections) || lesson.sections.length !== expectedSectionCount) {
    issues.add("lesson section coverage");
    return;
  }

  const sectionIds = lesson.sections.map((section) => section?.id);
  if (
    new Set(sectionIds).size !== expectedSectionCount
    || sectionIds.some((id) => !present(id) || id !== id.trim() || !idPattern.test(id))
  ) {
    issues.add("lesson section identifiers");
  }
  if (lesson.sections.some((section, index) =>
    section?.id !== canonicalSectionIds[index] || section?.title !== canonicalSectionTitles[index],
  )) {
    issues.add("canonical lesson section order");
  }
  if (
    !isIsoDate(lesson.lastReviewed)
    || !Number.isInteger(lesson.estimatedMinutes)
    || lesson.estimatedMinutes < 5
    || lesson.estimatedMinutes > 20
  ) {
    issues.add("lesson review metadata");
  }
  lesson.sections.forEach((section) => {
    if (!present(section?.title) || !Array.isArray(section.blocks) || !section.blocks.length) {
      issues.add("lesson section content");
      return;
    }
    if (!section.blocks.every(validateBlock)) issues.add("content block shape");
  });

  const uniqueReferences = Array.isArray(lesson.references) ? new Set(lesson.references) : new Set();
  if (
    !Array.isArray(lesson.references)
    || uniqueReferences.size < 3
    || uniqueReferences.size !== lesson.references.length
  ) {
    issues.add("lesson source coverage");
    return;
  }
  if (lesson.references.some((sourceId) => !sourceMap.has(sourceId))) issues.add("lesson source mapping");
  lesson.references.filter((sourceId) => sourceMap.has(sourceId)).forEach((sourceId) => usedSources.add(sourceId));
  const organizations = new Set(
    lesson.references
      .map((sourceId) => normalizedOrganization(sourceMap.get(sourceId)?.organization))
      .filter(Boolean),
  );
  if (organizations.size < 2) issues.add("lesson source diversity");
  const citations = new Set(inlineCitationIds(lesson.sections));
  if (lesson.references.some((sourceId) => !citations.has(sourceId))) issues.add("inline citation coverage");
  if ([...citations].some((sourceId) => !lesson.references.includes(sourceId))) issues.add("inline citation mapping");
}

function validateModule(module, sourceMap, moduleIndex, usedSources) {
  if (!module || typeof module !== "object" || !claimId(module.id, "module identifiers")) return;
  const hasNumber = present(module.number) || Number.isFinite(module.number);
  if (!hasNumber) issues.add("module numbering");
  if (!present(module.title)) issues.add("module titles");
  if (!present(module.level)) issues.add("module levels");
  if (!present(module.description)) issues.add("module descriptions");
  if (
    !present(module.evidenceOutcome)
    || String(module.number).padStart(2, "0") !== String(moduleIndex + 1).padStart(2, "0")
  ) {
    issues.add("module release framing");
  }
  if (!Array.isArray(module.lessons) || !module.lessons.length) {
    issues.add("module lesson coverage");
    return;
  }
  module.lessons.forEach((lesson) => validateLesson(lesson, sourceMap, usedSources));
}

function validateDomain(domain, domainIndex) {
  if (!domain || typeof domain !== "object" || !claimId(domain.id, "domain identifiers")) return;
  const expected = releaseManifest[domainIndex];
  if (!expected || domain.id !== expected.id) issues.add("release manifest identity");
  if (
    !present(domain.mark)
    || !present(domain.title)
    || !present(domain.description)
    || !isIsoDate(domain.reviewedAt)
  ) {
    issues.add("domain framing");
  }
  if (!Array.isArray(domain.mentalModel) || domain.mentalModel.length < 3 || !domain.mentalModel.every(present)) {
    issues.add("domain mental model");
  }
  if (
    !Array.isArray(domain.sourcePolicy)
    || domain.sourcePolicy.length < 3
    || !domain.sourcePolicy.every((item) => present(item?.title) && present(item?.description))
  ) {
    issues.add("domain source policy");
  }

  const sourceMap = new Map();
  const usedSources = new Set();
  if (!Array.isArray(domain.primarySources) || !domain.primarySources.length) {
    issues.add("domain sources");
  } else {
    domain.primarySources.forEach((source) => validateSource(source, sourceMap));
  }
  if (!Array.isArray(domain.modules) || !domain.modules.length) {
    issues.add("domain modules");
  } else {
    domain.modules.forEach((module, moduleIndex) => validateModule(module, sourceMap, moduleIndex, usedSources));
  }
  if (usedSources.size !== sourceMap.size) issues.add("domain source use");
  const lessonCount = Array.isArray(domain.modules)
    ? domain.modules.reduce((total, module) => total + (Array.isArray(module?.lessons) ? module.lessons.length : 0), 0)
    : 0;
  if (
    !expected
    || domain.primarySources?.length !== expected.sources
    || domain.modules?.length !== expected.modules
    || lessonCount !== expected.lessons
  ) {
    issues.add("release manifest counts");
  }
}

let source;
try {
  source = JSON.parse(await readFile(inputPath, "utf8"));
} catch {
  console.error("Vault validation failed: the private source could not be parsed.");
  process.exit(1);
}

if (!source || typeof source !== "object" || !present(source.title) || !present(source.description)) {
  issues.add("library framing");
}
if (!source.archivedVault || !Array.isArray(source.archivedVault.notes) || !source.archivedVault.notes.length) {
  issues.add("archived note preservation");
} else {
  claimId("personal-notes", "archived note identifiers");
  claimId("legacy-notes", "archived note identifiers");
  source.archivedVault.notes.forEach((note, index) => {
    if (!note || typeof note !== "object" || !claimId(note.id, "archived note identifiers")) return;
    if (
      !present(note.title)
      || !Array.isArray(note.content)
      || !note.content.length
      || !note.content.every(present)
      || (note.sourceUrl !== undefined && note.sourceUrl !== "" && !isHttps(note.sourceUrl))
    ) issues.add("archived note completeness");
    if (present(note.sourceLabel) || present(note.sourceUrl)) {
      claimId(`legacy-source-${index + 1}`, "archived source identifiers");
    }
  });
}
if (!Array.isArray(source.domains) || source.domains.length !== releaseManifest.length) issues.add("domain coverage");
else source.domains.forEach(validateDomain);

if (issues.size) {
  console.error(`Vault validation failed: ${[...issues].sort().join(", ")}.`);
  process.exit(1);
}

console.log("Vault release-schema validation passed: all eight domains meet the same identity, review-metadata, canonical-section, block-shape, and source-coverage contract.");
