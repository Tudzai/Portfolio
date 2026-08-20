import { readFile } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const vaultDirectory = resolve(scriptDirectory, "..");
const inputPath = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : join(vaultDirectory, "vault-data.js");
const password = process.env.VAULT_PASSWORD;
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
const legacyReleaseManifest = releaseManifest.slice(0, 5);
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const sourceDateFields = ["publishedAt", "adoptedAt", "updatedAt", "reviewedAt", "accessedAt"];

function exactKeys(value, keys) {
  return value
    && typeof value === "object"
    && !Array.isArray(value)
    && Object.keys(value).sort().join("|") === [...keys].sort().join("|");
}

function present(value) {
  return typeof value === "string" && Boolean(value.trim());
}

function normalizedOrganization(value) {
  return present(value) ? value.trim().replace(/\s+/gu, " ").toLocaleLowerCase("en-US") : "";
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

function validBlock(block) {
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
        present(step?.label) && present(step?.title) && present(step?.detail) && step.detail.length <= 900,
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

function matchesHistoricalRelease(value, manifest) {
  return Array.isArray(value?.domains)
    && value.domains.length === manifest.length
    && value.domains.every((domain, domainIndex) => {
      const expected = manifest[domainIndex];
      if (
        domain?.id !== expected.id
        || !Array.isArray(domain.primarySources)
        || domain.primarySources.length !== expected.sources
        || !Array.isArray(domain.modules)
        || domain.modules.length !== expected.modules
      ) return false;
      const lessons = domain.modules.flatMap((module) => Array.isArray(module?.lessons) ? module.lessons : []);
      return lessons.length === expected.lessons
        && lessons.every((lesson) =>
          lesson?.status === "published"
          && Array.isArray(lesson.sections)
          && lesson.sections.length === expectedSectionCount
          && Array.isArray(lesson.references)
          && new Set(lesson.references).size >= 3,
        );
    });
}

function matchesLegacyRelease(value) {
  return matchesHistoricalRelease(value, legacyReleaseManifest);
}

// Migration-only compatibility for the exact eight-domain release that preceded
// the uniform schema. New plaintext and new ciphertext still pass the strict gate.
function matchesPreviousEightDomainRelease(value) {
  return matchesHistoricalRelease(value, releaseManifest);
}

function matchesCurrentRelease(value) {
  if (!Array.isArray(value?.domains) || value.domains.length !== releaseManifest.length) return false;
  const claimedIds = new Set();
  let valid = present(value.title)
    && present(value.description)
    && value.archivedVault
    && Array.isArray(value.archivedVault.notes)
    && value.archivedVault.notes.length > 0;
  const claimId = (id) => {
    if (!present(id) || id !== id.trim() || !idPattern.test(id) || claimedIds.has(id)) return false;
    claimedIds.add(id);
    return true;
  };
  claimId("personal-notes");
  claimId("legacy-notes");
  value.archivedVault.notes.forEach((note, index) => {
    if (
      !note
      || typeof note !== "object"
      || !claimId(note.id)
      || !present(note.title)
      || !Array.isArray(note.content)
      || !note.content.length
      || !note.content.every(present)
      || (note.sourceUrl !== undefined && note.sourceUrl !== "" && !isHttps(note.sourceUrl))
    ) valid = false;
    if (present(note?.sourceLabel) || present(note?.sourceUrl)) claimId(`legacy-source-${index + 1}`);
  });

  value.domains.forEach((domain, domainIndex) => {
    const expected = releaseManifest[domainIndex];
    if (
      !domain
      || typeof domain !== "object"
      || !claimId(domain.id)
      || domain.id !== expected.id
      || !present(domain.mark)
      || !present(domain.title)
      || !present(domain.description)
      || !isIsoDate(domain.reviewedAt)
      || !Array.isArray(domain.mentalModel)
      || domain.mentalModel.length < 3
      || !domain.mentalModel.every(present)
      || !Array.isArray(domain.sourcePolicy)
      || domain.sourcePolicy.length < 3
      || !domain.sourcePolicy.every((item) => present(item?.title) && present(item?.description))
      || !Array.isArray(domain.primarySources)
      || domain.primarySources.length !== expected.sources
      || !Array.isArray(domain.modules)
      || domain.modules.length !== expected.modules
    ) valid = false;

    const sourceMap = new Map();
    const usedSources = new Set();
    domain.primarySources?.forEach((source) => {
      if (!source || typeof source !== "object" || !claimId(source.id)) {
        valid = false;
        return;
      }
      sourceMap.set(source.id, source);
      const dates = sourceDateFields
        .map((field) => source[field])
        .filter((date) => date !== undefined && date !== null && date !== "");
      if (
        !present(source.title)
        || !present(source.organization)
        || !present(source.scope)
        || !present(source.sourceType)
        || !isHttps(source.url)
        || !dates.length
        || dates.some((date) => !isIsoDate(date))
      ) valid = false;
    });

    let lessonCount = 0;
    domain.modules?.forEach((module, moduleIndex) => {
      lessonCount += Array.isArray(module?.lessons) ? module.lessons.length : 0;
      if (
        !module
        || typeof module !== "object"
        || !claimId(module.id)
        || !(present(module.number) || Number.isFinite(module.number))
        || !present(module.title)
        || !present(module.level)
        || !present(module.description)
        || !present(module.evidenceOutcome)
        || String(module.number).padStart(2, "0") !== String(moduleIndex + 1).padStart(2, "0")
        || !Array.isArray(module.lessons)
        || !module.lessons.length
      ) valid = false;

      module.lessons?.forEach((lesson) => {
        const sectionIds = Array.isArray(lesson?.sections) ? lesson.sections.map((section) => section?.id) : [];
        const references = Array.isArray(lesson?.references) ? lesson.references : [];
        if (
          !lesson
          || typeof lesson !== "object"
          || !claimId(lesson.id)
          || !present(lesson.title)
          || !present(lesson.summary)
          || lesson.status !== "published"
          || sectionIds.length !== expectedSectionCount
          || new Set(sectionIds).size !== expectedSectionCount
          || sectionIds.some((id) => !present(id) || id !== id.trim() || !idPattern.test(id))
          || lesson.sections.some((section, sectionIndex) =>
            section?.id !== canonicalSectionIds[sectionIndex]
            || section?.title !== canonicalSectionTitles[sectionIndex]
          )
          || !isIsoDate(lesson.lastReviewed)
          || !Number.isInteger(lesson.estimatedMinutes)
          || lesson.estimatedMinutes < 5
          || lesson.estimatedMinutes > 20
          || !lesson.sections.every((section) =>
            present(section?.title)
            && Array.isArray(section.blocks)
            && section.blocks.length > 0
            && section.blocks.every(validBlock)
          )
          || new Set(references).size < 3
          || new Set(references).size !== references.length
          || references.some((sourceId) => !sourceMap.has(sourceId))
        ) valid = false;
        references.filter((sourceId) => sourceMap.has(sourceId)).forEach((sourceId) => usedSources.add(sourceId));
        const organizations = new Set(
          references
            .map((sourceId) => normalizedOrganization(sourceMap.get(sourceId)?.organization))
            .filter(Boolean),
        );
        const citations = new Set(inlineCitationIds(lesson?.sections));
        if (
          organizations.size < 2
          || references.some((sourceId) => !citations.has(sourceId))
          || [...citations].some((sourceId) => !references.includes(sourceId))
        ) valid = false;
      });
    });
    if (lessonCount !== expected.lessons || usedSources.size !== sourceMap.size) valid = false;
  });
  return Boolean(valid);
}

function verifyReleaseShape(value) {
  if (
    !value
    || typeof value !== "object"
    || !Array.isArray(value.domains)
    || !value.archivedVault
    || !Array.isArray(value.archivedVault.notes)
    || !value.archivedVault.notes.length
  ) return false;
  return matchesCurrentRelease(value)
    || matchesPreviousEightDomainRelease(value)
    || matchesLegacyRelease(value);
}

try {
  if (!password) throw new Error();
  const source = await readFile(inputPath, "utf8");
  const assignment = source.trim().match(/^window\.__KNOWLEDGE_VAULT_DATA__\s*=\s*(\{[\s\S]*\});$/);
  const payload = assignment ? JSON.parse(assignment[1]) : null;
  if (
    !exactKeys(payload, ["version", "kdf", "cipher", "ciphertext"])
    || payload.version !== 1
    || !exactKeys(payload.kdf, ["name", "hash", "iterations", "salt"])
    || payload.kdf.name !== "PBKDF2"
    || payload.kdf.hash !== "SHA-256"
    || payload.kdf.iterations !== 600_000
    || Buffer.from(payload.kdf.salt, "base64").length !== 16
    || !exactKeys(payload.cipher, ["name", "keyLength", "tagLength", "iv"])
    || payload.cipher.name !== "AES-GCM"
    || payload.cipher.keyLength !== 256
    || payload.cipher.tagLength !== 128
    || Buffer.from(payload.cipher.iv, "base64").length !== 12
  ) throw new Error();

  const encoder = new TextEncoder();
  const sourceKey = await webcrypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  const key = await webcrypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: Buffer.from(payload.kdf.salt, "base64"),
      iterations: 600_000,
    },
    sourceKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
  const plaintext = await webcrypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: Buffer.from(payload.cipher.iv, "base64"),
      additionalData: encoder.encode("knowledge-vault:v1"),
      tagLength: 128,
    },
    key,
    Buffer.from(payload.ciphertext, "base64"),
  );
  const parsed = JSON.parse(new TextDecoder().decode(plaintext));
  if (!verifyReleaseShape(parsed)) throw new Error();
  console.log("Existing vault password and release shape verified.");
} catch {
  console.error("Existing vault password verification failed.");
  process.exit(1);
}
