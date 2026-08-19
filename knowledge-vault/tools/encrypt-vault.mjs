import { access, readFile, rename, rm, writeFile } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import { spawnSync } from "node:child_process";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const { subtle } = webcrypto;
const encoder = new TextEncoder();
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const vaultDirectory = resolve(scriptDirectory, "..");
const inputPath = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : join(vaultDirectory, "private", "knowledge.json");
const outputPath = process.argv[3] ? resolve(process.cwd(), process.argv[3]) : join(vaultDirectory, "vault-data.js");
const password = process.env.VAULT_PASSWORD;
const iterations = 600_000;
const additionalData = encoder.encode("knowledge-vault:v1");

if (!password) {
  throw new Error("VAULT_PASSWORD is required. Use the PowerShell wrapper for a hidden password prompt.");
}
if (inputPath.toLocaleLowerCase("en-US") === outputPath.toLocaleLowerCase("en-US")) {
  throw new Error("The plaintext input and encrypted output must be different files.");
}

function toBase64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

function validateId(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} requires an id.`);
  const id = value.trim();
  if (value !== id) throw new Error(`${label} id must not include leading or trailing whitespace: ${JSON.stringify(value)}`);
  return id;
}

function validateNotes(notes, label = "Note") {
  if (!Array.isArray(notes)) throw new Error(`${label} collection must be an array.`);
  const ids = new Set();
  notes.forEach((note, index) => {
    if (!note || typeof note !== "object") throw new Error(`${label} ${index + 1} must be an object.`);
    const noteId = validateId(note.id, `${label} ${index + 1}`);
    if (ids.has(noteId)) throw new Error(`Duplicate ${label.toLowerCase()} id: ${noteId}`);
    ids.add(noteId);
    if (typeof note.title !== "string" || !note.title.trim()) throw new Error(`${label} ${noteId} requires a title.`);
    if (!Array.isArray(note.content)) throw new Error(`${label} ${noteId} content must be an array of paragraphs.`);
  });
  return ids;
}

function validateDomain(domain, domainIndex, globalIds) {
  if (!domain || typeof domain !== "object") throw new Error(`Domain ${domainIndex + 1} must be an object.`);
  const domainId = validateId(domain.id, `Domain ${domainIndex + 1}`);
  if (globalIds.domains.has(domainId)) throw new Error(`Duplicate domain id: ${domainId}`);
  globalIds.domains.add(domainId);
  if (typeof domain.title !== "string" || !domain.title.trim()) throw new Error(`Domain ${domainId} requires a title.`);
  if (!Array.isArray(domain.primarySources)) throw new Error(`Domain ${domainId} must include primarySources.`);
  if (!Array.isArray(domain.modules) || domain.modules.length === 0) {
    throw new Error(`Domain ${domainId} requires at least one module.`);
  }

  const sourceIds = new Set();
  domain.primarySources.forEach((source, index) => {
    if (!source || typeof source !== "object") throw new Error(`Source ${index + 1} in ${domainId} must be an object.`);
    const sourceId = validateId(source.id, `Source ${index + 1} in ${domainId}`);
    if (sourceIds.has(sourceId) || globalIds.sources.has(sourceId)) throw new Error(`Duplicate source id: ${sourceId}`);
    sourceIds.add(sourceId);
    globalIds.sources.add(sourceId);
    if (typeof source.title !== "string" || !source.title.trim()) throw new Error(`Source ${sourceId} requires a title.`);
    if (typeof source.organization !== "string" || !source.organization.trim()) {
      throw new Error(`Source ${sourceId} requires an organization.`);
    }
    const sourceDate = source.publishedAt || source.adoptedAt || source.updatedAt || source.reviewedAt || source.accessedAt;
    if (typeof sourceDate !== "string" || !sourceDate.trim()) {
      throw new Error(`Source ${sourceId} requires a publication, review, update, adoption, or access date.`);
    }
    if (typeof source.publishedAt === "string" && /^accessed:?\s+/i.test(source.publishedAt.trim())) {
      throw new Error(`Source ${sourceId} must store access dates in accessedAt, not publishedAt.`);
    }
    if (source.url !== undefined) {
      try {
        const url = new URL(source.url);
        if (url.protocol !== "https:") throw new Error();
      } catch {
        throw new Error(`Source ${sourceId} requires a valid HTTP(S) URL.`);
      }
    }
  });

  domain.modules.forEach((module, moduleIndex) => {
    if (!module || typeof module !== "object") throw new Error(`Module ${moduleIndex + 1} in ${domainId} must be an object.`);
    const moduleId = validateId(module.id, `Module ${moduleIndex + 1} in ${domainId}`);
    if (globalIds.modules.has(moduleId)) throw new Error(`Duplicate module id: ${moduleId}`);
    globalIds.modules.add(moduleId);
    if (typeof module.title !== "string" || !module.title.trim()) throw new Error(`Module ${moduleId} requires a title.`);
    if (!Array.isArray(module.lessons) || module.lessons.length === 0) {
      throw new Error(`Module ${moduleId} requires at least one lesson.`);
    }

    module.lessons.forEach((lesson, lessonIndex) => {
      if (!lesson || typeof lesson !== "object") throw new Error(`Lesson ${lessonIndex + 1} in ${moduleId} must be an object.`);
      const lessonId = validateId(lesson.id, `Lesson ${lessonIndex + 1} in ${moduleId}`);
      if (globalIds.lessons.has(lessonId)) throw new Error(`Duplicate lesson id: ${lessonId}`);
      globalIds.lessons.add(lessonId);
      if (typeof lesson.title !== "string" || !lesson.title.trim()) throw new Error(`Lesson ${lessonId} requires a title.`);
      if (!new Set(["published", "planned"]).has(lesson.status)) {
        throw new Error(`Lesson ${lessonId} status must be published or planned.`);
      }
      if (lesson.status === "published" && (!Array.isArray(lesson.sections) || lesson.sections.length !== 11)) {
        throw new Error(`Published lesson ${lessonId} must contain 11 content sections; references render as section 12.`);
      }
      if (!Array.isArray(lesson.references)) {
        throw new Error(`Lesson ${lessonId} must use at least three distinct references.`);
      }
      const referenceIds = lesson.references.map((sourceId, referenceIndex) =>
        validateId(sourceId, `Reference ${referenceIndex + 1} in lesson ${lessonId}`),
      );
      if (new Set(referenceIds).size < 3) {
        throw new Error(`Lesson ${lessonId} must use at least three distinct references.`);
      }
      referenceIds.forEach((sourceId) => {
        if (!sourceIds.has(sourceId)) throw new Error(`Lesson ${lessonId} references unknown source: ${sourceId}`);
      });
    });
  });
}

function validateSource(value) {
  if (!value || typeof value !== "object") throw new Error("Knowledge source must be a JSON object.");
  if (Array.isArray(value.notes) && !Array.isArray(value.modules) && !Array.isArray(value.domains)) {
    if (value.notes.length === 0) throw new Error("A notes-only knowledge source requires at least one note.");
    validateNotes(value.notes);
    return;
  }

  const domains = Array.isArray(value.domains)
    ? value.domains
    : Array.isArray(value.modules)
      ? [
          {
            id: "fintech-domain",
            title: value.title,
            primarySources: value.primarySources,
            modules: value.modules,
          },
        ]
      : [];
  if (!domains.length) throw new Error("Knowledge source must include at least one domain, module list, or note collection.");

  const globalIds = {
    domains: new Set(),
    sources: new Set(),
    modules: new Set(),
    lessons: new Set(),
  };
  domains.forEach((domain, index) => validateDomain(domain, index, globalIds));

  if (value.archivedVault !== undefined) {
    if (!value.archivedVault || typeof value.archivedVault !== "object") {
      throw new Error("archivedVault must be an object when provided.");
    }
    const archivedIds = validateNotes(value.archivedVault.notes, "Archived note");
    if (archivedIds.size > 0) {
      if (globalIds.domains.has("personal-notes")) {
        throw new Error("Domain id personal-notes is reserved for the archived note collection.");
      }
      if (globalIds.modules.has("legacy-notes")) {
        throw new Error("Module id legacy-notes is reserved for the archived note collection.");
      }
      value.archivedVault.notes.forEach((note, index) => {
        if (!note.sourceLabel && !note.sourceUrl) return;
        const generatedSourceId = `legacy-source-${index + 1}`;
        if (globalIds.sources.has(generatedSourceId)) {
          throw new Error(`Source id ${generatedSourceId} is reserved for an archived note source.`);
        }
      });
    }
    archivedIds.forEach((id) => {
      if (globalIds.lessons.has(id)) throw new Error(`Archived note id conflicts with lesson id: ${id}`);
    });
  }
}

const validatorEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !new Set(["VAULT_PASSWORD", "VAULT_CURRENT_PASSWORD"]).has(key)),
);
let outputExists = true;
try {
  await access(outputPath);
} catch {
  outputExists = false;
}
if (outputExists) {
  const existingPassword = process.env.VAULT_CURRENT_PASSWORD || password;
  const existingVerification = spawnSync(
    process.execPath,
    [join(scriptDirectory, "verify-vault-password.mjs"), outputPath],
    {
      env: { ...validatorEnvironment, VAULT_PASSWORD: existingPassword },
      stdio: ["ignore", "inherit", "inherit"],
    },
  );
  if (existingVerification.status !== 0) {
    throw new Error("The existing vault password could not be verified; the encrypted payload was not changed.");
  }
}
const validation = spawnSync(
  process.execPath,
  [join(scriptDirectory, "validate-vault.mjs"), inputPath],
  { env: validatorEnvironment, stdio: ["ignore", "inherit", "inherit"] },
);
if (validation.status !== 0) throw new Error("The knowledge source did not pass the release-schema gate.");

let sourceText;
let source;
try {
  sourceText = await readFile(inputPath, "utf8");
  source = JSON.parse(sourceText);
  validateSource(source);
} catch {
  throw new Error("The knowledge source failed encryption validation.");
}

const salt = webcrypto.getRandomValues(new Uint8Array(16));
const iv = webcrypto.getRandomValues(new Uint8Array(12));
const sourceKey = await subtle.importKey("raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]);
const key = await subtle.deriveKey(
  {
    name: "PBKDF2",
    hash: "SHA-256",
    salt,
    iterations,
  },
  sourceKey,
  { name: "AES-GCM", length: 256 },
  false,
  ["encrypt", "decrypt"],
);

const ciphertext = await subtle.encrypt(
  {
    name: "AES-GCM",
    iv,
    additionalData,
    tagLength: 128,
  },
  key,
  encoder.encode(JSON.stringify(source)),
);

const verifiedPlaintext = await subtle.decrypt(
  {
    name: "AES-GCM",
    iv,
    additionalData,
    tagLength: 128,
  },
  key,
  ciphertext,
);
try {
  validateSource(JSON.parse(new TextDecoder().decode(verifiedPlaintext)));
} catch {
  throw new Error("The encrypted round trip failed its private-safe schema verification.");
}

const wrongSourceKey = await subtle.importKey(
  "raw",
  encoder.encode(`${password}\u0000wrong-password-check`),
  { name: "PBKDF2" },
  false,
  ["deriveKey"],
);
const wrongKey = await subtle.deriveKey(
  {
    name: "PBKDF2",
    hash: "SHA-256",
    salt,
    iterations,
  },
  wrongSourceKey,
  { name: "AES-GCM", length: 256 },
  false,
  ["decrypt"],
);
let wrongPasswordRejected = false;
try {
  await subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
      additionalData,
      tagLength: 128,
    },
    wrongKey,
    ciphertext,
  );
} catch {
  wrongPasswordRejected = true;
}
if (!wrongPasswordRejected) throw new Error("AES-GCM verification failed to reject a wrong password.");

const payload = {
  version: 1,
  kdf: {
    name: "PBKDF2",
    hash: "SHA-256",
    iterations,
    salt: toBase64(salt),
  },
  cipher: {
    name: "AES-GCM",
    keyLength: 256,
    tagLength: 128,
    iv: toBase64(iv),
  },
  ciphertext: toBase64(new Uint8Array(ciphertext)),
};

const temporaryOutputPath = join(dirname(outputPath), `.${basename(outputPath)}.${process.pid}.tmp`);
try {
  await writeFile(temporaryOutputPath, `window.__KNOWLEDGE_VAULT_DATA__ = ${JSON.stringify(payload, null, 2)};\n`, { encoding: "utf8", flag: "wx" });
  await rename(temporaryOutputPath, outputPath);
} catch {
  await rm(temporaryOutputPath, { force: true });
  throw new Error("The verified encrypted payload could not be published atomically.");
}
console.log(`Encrypted and verified the knowledge source into ${outputPath}`);
