import { readFile } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const vaultDirectory = resolve(scriptDirectory, "..");
const commandArguments = process.argv.slice(2);
const requireCurrentRelease = commandArguments.includes("--require-current");
const inputArgument = commandArguments.find((argument) => !argument.startsWith("--"));
const inputPath = inputArgument ? resolve(process.cwd(), inputArgument) : join(vaultDirectory, "vault-data.js");
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
  { id: "mrel-domain", modules: 15, lessons: 60, sources: 57 },
  { id: "personal-style", modules: 6, lessons: 18, sources: 12 },
  { id: "photography", modules: 6, lessons: 18, sources: 12 },
  { id: "cooking", modules: 6, lessons: 18, sources: 36 },
  { id: "bar-drinks", modules: 6, lessons: 18, sources: 25 },
  { id: "coffee", modules: 6, lessons: 18, sources: 24 },
  { id: "japanese-culture", modules: 6, lessons: 18, sources: 20 },
  { id: "art-visual-culture", modules: 6, lessons: 18, sources: 20 },
  { id: "architecture-design-living", modules: 6, lessons: 18, sources: 25 },
  { id: "self-psychology", modules: 6, lessons: 18, sources: 33 },
  { id: "communication-conflict", modules: 6, lessons: 18, sources: 35 },
  { id: "relationships-boundaries", modules: 6, lessons: 18, sources: 16 },
];
const v1PublishedReleaseManifest = [
  { id: "fintech-domain", modules: 12, lessons: 67, sources: 179 },
  { id: "fin-domain", modules: 15, lessons: 74, sources: 97 },
  { id: "rtcfo-domain", modules: 18, lessons: 89, sources: 68 },
  { id: "brk-domain-breaking", modules: 14, lessons: 68, sources: 41 },
  { id: "mrel-domain", modules: 15, lessons: 60, sources: 56 },
  { id: "personal-style", modules: 6, lessons: 18, sources: 12 },
  { id: "photography", modules: 6, lessons: 18, sources: 12 },
  { id: "cooking", modules: 6, lessons: 18, sources: 12 },
  { id: "bar-drinks", modules: 6, lessons: 18, sources: 25 },
  { id: "coffee", modules: 6, lessons: 18, sources: 24 },
  { id: "japanese-culture", modules: 6, lessons: 18, sources: 20 },
  { id: "art-visual-culture", modules: 6, lessons: 18, sources: 20 },
  { id: "architecture-design-living", modules: 6, lessons: 18, sources: 25 },
  { id: "self-psychology", modules: 6, lessons: 18, sources: 33 },
  { id: "communication-conflict", modules: 6, lessons: 18, sources: 35 },
  { id: "relationships-boundaries", modules: 6, lessons: 18, sources: 16 },
];
const previousSixteenDomainReleaseManifest = releaseManifest.map((entry, index) => ({
  ...entry,
  sources: index < 8 ? entry.sources : 12,
}));
const legacyReleaseManifest = releaseManifest.slice(0, 5);
const previousEightDomainReleaseManifest = releaseManifest.slice(0, 8);
const previousTenDomainReleaseManifest = releaseManifest.slice(0, 10);
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const sourceDateFields = ["publishedAt", "adoptedAt", "updatedAt", "reviewedAt", "accessedAt"];

function exactKeys(value, keys) {
  return value
    && typeof value === "object"
    && !Array.isArray(value)
    && Object.keys(value).sort().join("|") === [...keys].sort().join("|");
}

function sameReleaseManifest(left, right) {
  return Array.isArray(left)
    && Array.isArray(right)
    && left.length === right.length
    && left.every((entry, index) => {
      const expected = right[index];
      return entry?.id === expected?.id
        && entry?.modules === expected?.modules
        && entry?.lessons === expected?.lessons
        && entry?.sources === expected?.sources;
    });
}

function validEnvelopeReleaseManifest(manifest) {
  return Array.isArray(manifest)
    && manifest.length === releaseManifest.length
    && manifest.every((entry, index) =>
      exactKeys(entry, ["id", "modules", "lessons", "sources"])
      && entry.id === releaseManifest[index].id
      && Number.isInteger(entry.modules)
      && entry.modules > 0
      && Number.isInteger(entry.lessons)
      && entry.lessons > 0
      && Number.isInteger(entry.sources)
      && entry.sources > 0,
    );
}

function releaseAdditionalData(payload, encoder) {
  if (payload.version === 1) return encoder.encode("knowledge-vault:v1");
  const compactManifest = payload.release
    .map(({ id, modules, lessons, sources }) => `${id}:${modules}:${lessons}:${sources}`)
    .join("|");
  return encoder.encode(`knowledge-vault:v2:${compactManifest}`);
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

function hasExactTerm(field, term) {
  const needle = String(term ?? "").toLocaleLowerCase("vi");
  const word = (character) => Boolean(character && /[\p{L}\p{N}]/u.test(character));
  return String(field ?? "").split(/\[\[[a-z0-9-]+\]\]/gi).some((segment) => {
    const text = segment.toLocaleLowerCase("vi");
    let index = text.indexOf(needle);
    while (needle && index >= 0) {
      const before = index > 0 ? text[index - 1] : "";
      const after = index + needle.length < text.length ? text[index + needle.length] : "";
      if ((!word(needle[0]) || !word(before)) && (!word(needle.at(-1)) || !word(after))) return true;
      index = text.indexOf(needle, index + Math.max(1, needle.length));
    }
    return false;
  });
}

function validBlock(block) {
  if (!block || typeof block !== "object" || !present(block.type)) return false;
  if (block.learningLayer !== undefined && !new Set(["core", "detail"]).has(block.learningLayer)) return false;
  if (block.type === "paragraph") return present(block.text) && block.text.length <= 1_600;
  if (block.type === "list") {
    return Array.isArray(block.items)
      && block.items.length > 0
      && block.items.every((item) => present(item) && item.length <= 1_000);
  }
  if (block.type === "callout") {
    return present(block.label)
      && !/\[\[|\]\]/u.test(block.label)
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

function learningBlockStrings(block) {
  if (block?.type === "callout") return [block.label, block.text];
  return visibleBlockStrings(block);
}

function inlineCitationIds(sections) {
  const renderedText = (Array.isArray(sections) ? sections : [])
    .flatMap((section) => Array.isArray(section?.blocks) ? section.blocks.flatMap(visibleBlockStrings) : [])
    .filter((value) => typeof value === "string")
    .join("\n");
  return [...renderedText.matchAll(/\[\[([a-z0-9-]+)\]\]/gi)].map((match) => match[1]);
}

function validLearningMetadata(lesson) {
  if (!Array.isArray(lesson?.sections) || lesson.sections.some((section) => !Array.isArray(section?.blocks))) return false;
  const blocks = lesson.sections.flatMap((section) => section.blocks);
  const layeredBlocks = blocks.filter((block) => block.learningLayer !== undefined);
  if (layeredBlocks.length) {
    if (
      layeredBlocks.length !== blocks.length
      || !Number.isInteger(lesson.coreEstimatedMinutes)
      || lesson.coreEstimatedMinutes < 4
      || lesson.coreEstimatedMinutes > 20
      || lesson.sections.some((section) => !section.blocks.some((block) => block.learningLayer === "core"))
      || lesson.sections[7].blocks.some((block) => block.learningLayer !== "core")
      || blocks.some((block) =>
        block.type === "callout" && block.tone === "caution" && block.learningLayer !== "core",
      )
    ) return false;
  } else if (lesson.coreEstimatedMinutes !== undefined) {
    return false;
  }

  if (lesson.firstUseHints === undefined) return true;
  if (layeredBlocks.length !== blocks.length) return false;
  if (!Array.isArray(lesson.firstUseHints) || lesson.firstUseHints.length > 24) return false;
  const terms = lesson.firstUseHints
    .map((hint) => String(hint?.term || "").trim().toLocaleLowerCase("vi"));
  const preGlossaryFields = lesson.sections.slice(0, 9)
    .flatMap((section) => section.blocks.flatMap(learningBlockStrings))
    .filter((value) => typeof value === "string");
  return new Set(terms).size === terms.length
    && lesson.firstUseHints.every((hint) =>
      present(hint?.term)
      && hint.term.length <= 80
      && present(hint?.explanation)
      && hint.explanation.length <= 600
      && !/\[\[|\]\]/u.test(`${hint.term} ${hint.explanation}`)
      && preGlossaryFields.some((field) => hasExactTerm(field, hint.term)),
    );
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

// Migration-only compatibility for the exact sixteen-domain release that
// preceded the completed Topic 16-to-9 source expansion. Strict verification
// still requires the current manifest before new ciphertext can be published.
function matchesPreviousSixteenDomainRelease(value) {
  return matchesHistoricalRelease(value, previousSixteenDomainReleaseManifest);
}

function matchesV1PublishedRelease(value) {
  return matchesHistoricalRelease(value, v1PublishedReleaseManifest);
}

// Migration-only compatibility for the exact eight-domain release that preceded
// the historical ten-domain manifest. New plaintext and new ciphertext still pass the strict gate.
function matchesPreviousEightDomainRelease(value) {
  return matchesHistoricalRelease(value, previousEightDomainReleaseManifest);
}

// Migration-only compatibility for the exact ten-domain release that preceded
// the sixteen-domain manifest. Strict verification never accepts this shape.
function matchesPreviousTenDomainRelease(value) {
  return matchesHistoricalRelease(value, previousTenDomainReleaseManifest);
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
          || !validLearningMetadata(lesson)
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

function verifyReleaseShape(value, payload) {
  if (
    !value
    || typeof value !== "object"
    || !Array.isArray(value.domains)
    || !value.archivedVault
    || !Array.isArray(value.archivedVault.notes)
    || !value.archivedVault.notes.length
  ) return false;
  if (payload.version === 2) {
    if (requireCurrentRelease && !sameReleaseManifest(payload.release, releaseManifest)) return false;
    return sameReleaseManifest(payload.release, releaseManifest)
      ? matchesCurrentRelease(value)
      : matchesHistoricalRelease(value, payload.release);
  }
  if (requireCurrentRelease) return matchesCurrentRelease(value);
  return matchesCurrentRelease(value)
    || matchesV1PublishedRelease(value)
    || matchesPreviousSixteenDomainRelease(value)
    || matchesPreviousTenDomainRelease(value)
    || matchesPreviousEightDomainRelease(value)
    || matchesLegacyRelease(value);
}

try {
  if (!password) throw new Error();
  const source = await readFile(inputPath, "utf8");
  const assignment = source.trim().match(/^window\.__KNOWLEDGE_VAULT_DATA__\s*=\s*(\{[\s\S]*\});$/);
  const payload = assignment ? JSON.parse(assignment[1]) : null;
  const validVersion = (
    payload?.version === 1
    && exactKeys(payload, ["version", "kdf", "cipher", "ciphertext"])
  ) || (
    payload?.version === 2
    && exactKeys(payload, ["version", "release", "kdf", "cipher", "ciphertext"])
    && validEnvelopeReleaseManifest(payload.release)
  );
  if (
    !validVersion
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
      additionalData: releaseAdditionalData(payload, encoder),
      tagLength: 128,
    },
    key,
    Buffer.from(payload.ciphertext, "base64"),
  );
  const parsed = JSON.parse(new TextDecoder().decode(plaintext));
  if (!verifyReleaseShape(parsed, payload)) throw new Error();
  console.log(requireCurrentRelease
    ? "Vault password and current sixteen-domain release shape verified."
    : "Existing vault password and release shape verified.");
} catch {
  console.error("Existing vault password verification failed.");
  process.exit(1);
}
