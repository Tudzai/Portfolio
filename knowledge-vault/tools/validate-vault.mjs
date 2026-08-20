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
  { modules: 12, lessons: 67, sources: 179 },
  { modules: 15, lessons: 74, sources: 97 },
  { modules: 18, lessons: 89, sources: 68 },
  { modules: 14, lessons: 68, sources: 41 },
  { modules: 15, lessons: 60, sources: 56 },
  { id: "personal-style", modules: 6, lessons: 18, sources: 12, canonicalSections: true },
  { id: "photography", modules: 6, lessons: 18, sources: 12, canonicalSections: true },
  { id: "cooking", modules: 6, lessons: 18, sources: 12, canonicalSections: true },
];
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

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

function inlineCitationIds(sections) {
  const serialized = JSON.stringify(sections);
  return [...serialized.matchAll(/\[\[([a-z0-9-]+)\]\]/gi)].map((match) => match[1]);
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
  if (![source.publishedAt, source.adoptedAt, source.updatedAt, source.reviewedAt, source.accessedAt].some(present)) {
    issues.add("source dates");
  }
}

function validateLesson(lesson, sourceMap, requirements, usedSources) {
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
  if (
    requirements?.canonicalSections
    && lesson.sections.some((section, index) =>
      section?.id !== canonicalSectionIds[index] || section?.title !== canonicalSectionTitles[index],
    )
  ) {
    issues.add("canonical lesson section order");
  }
  if (
    requirements?.canonicalSections
    && (!datePattern.test(lesson.lastReviewed || "")
      || !Number.isInteger(lesson.estimatedMinutes)
      || lesson.estimatedMinutes < 5
      || lesson.estimatedMinutes > 20)
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

  if (!Array.isArray(lesson.references) || new Set(lesson.references).size < 3) {
    issues.add("lesson source coverage");
    return;
  }
  if (lesson.references.some((sourceId) => !sourceMap.has(sourceId))) issues.add("lesson source mapping");
  lesson.references.forEach((sourceId) => usedSources.add(sourceId));
  const organizations = new Set(
    lesson.references
      .map((sourceId) => sourceMap.get(sourceId)?.organization?.trim().toLocaleLowerCase("en-US"))
      .filter(Boolean),
  );
  if (organizations.size < 2) issues.add("lesson source diversity");
  const citations = new Set(inlineCitationIds(lesson.sections));
  if (lesson.references.some((sourceId) => !citations.has(sourceId))) issues.add("inline citation coverage");
  if ([...citations].some((sourceId) => !lesson.references.includes(sourceId))) issues.add("inline citation mapping");
}

function validateModule(module, sourceMap, requirements, moduleIndex, usedSources) {
  if (!module || typeof module !== "object" || !claimId(module.id, "module identifiers")) return;
  const hasNumber = present(module.number) || Number.isFinite(module.number);
  if (!hasNumber) issues.add("module numbering");
  if (!present(module.title)) issues.add("module titles");
  if (!present(module.level)) issues.add("module levels");
  if (!present(module.description)) issues.add("module descriptions");
  if (
    requirements?.canonicalSections
    && (!present(module.evidenceOutcome) || String(module.number).padStart(2, "0") !== String(moduleIndex + 1).padStart(2, "0"))
  ) {
    issues.add("module release framing");
  }
  // The renderer supplies a short beginner-safe outcome when legacy modules omit this optional field.
  if (!Array.isArray(module.lessons) || !module.lessons.length) {
    issues.add("module lesson coverage");
    return;
  }
  module.lessons.forEach((lesson) => validateLesson(lesson, sourceMap, requirements, usedSources));
}

function validateDomain(domain, domainIndex) {
  if (!domain || typeof domain !== "object" || !claimId(domain.id, "domain identifiers")) return;
  const expected = releaseManifest[domainIndex];
  if (expected?.id && domain.id !== expected.id) issues.add("release manifest identity");
  if (
    !present(domain.mark)
    || !present(domain.title)
    || !present(domain.description)
    || !present(domain.reviewedAt)
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
    domain.modules.forEach((module, moduleIndex) => validateModule(module, sourceMap, expected, moduleIndex, usedSources));
  }
  if (expected?.canonicalSections && usedSources.size !== sourceMap.size) issues.add("domain source use");
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
}
if (!Array.isArray(source.domains) || source.domains.length !== releaseManifest.length) issues.add("domain coverage");
else source.domains.forEach(validateDomain);

if (issues.size) {
  console.error(`Vault validation failed: ${[...issues].sort().join(", ")}.`);
  process.exit(1);
}

console.log("Vault release-schema validation passed: eight-domain counts, 11-section structures, block shapes, and source mappings are valid.");
