import { readFile, writeFile } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import { dirname, join, resolve } from "node:path";
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

function toBase64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

function validateNotes(notes, label = "Note") {
  if (!Array.isArray(notes)) throw new Error(`${label} collection must be an array.`);
  const ids = new Set();
  notes.forEach((note, index) => {
    if (!note || typeof note !== "object") throw new Error(`${label} ${index + 1} must be an object.`);
    if (typeof note.id !== "string" || !note.id.trim()) throw new Error(`${label} ${index + 1} requires an id.`);
    if (ids.has(note.id)) throw new Error(`Duplicate ${label.toLowerCase()} id: ${note.id}`);
    ids.add(note.id);
    if (typeof note.title !== "string" || !note.title.trim()) throw new Error(`${label} ${note.id} requires a title.`);
    if (!Array.isArray(note.content)) throw new Error(`${label} ${note.id} content must be an array of paragraphs.`);
  });
  return ids;
}

function validateSource(value) {
  if (!value || typeof value !== "object") throw new Error("Knowledge source must be a JSON object.");
  if (Array.isArray(value.modules)) {
    const sourceIds = new Set();
    if (!Array.isArray(value.primarySources)) throw new Error("FinTech source must include primarySources.");
    value.primarySources.forEach((source, index) => {
      if (!source || typeof source !== "object") throw new Error(`Source ${index + 1} must be an object.`);
      if (typeof source.id !== "string" || !source.id.trim()) throw new Error(`Source ${index + 1} requires an id.`);
      if (sourceIds.has(source.id)) throw new Error(`Duplicate source id: ${source.id}`);
      sourceIds.add(source.id);
      if (typeof source.title !== "string" || !source.title.trim()) throw new Error(`Source ${source.id} requires a title.`);
      if (typeof source.organization !== "string" || !source.organization.trim()) {
        throw new Error(`Source ${source.id} requires an organization.`);
      }
      if (typeof source.publishedAt !== "string" || !source.publishedAt.trim()) {
        throw new Error(`Source ${source.id} requires a publication or access date.`);
      }
    });

    const moduleIds = new Set();
    const lessonIds = new Set();
    value.modules.forEach((module, moduleIndex) => {
      if (!module || typeof module !== "object") throw new Error(`Module ${moduleIndex + 1} must be an object.`);
      if (typeof module.id !== "string" || !module.id.trim()) throw new Error(`Module ${moduleIndex + 1} requires an id.`);
      if (moduleIds.has(module.id)) throw new Error(`Duplicate module id: ${module.id}`);
      moduleIds.add(module.id);
      if (typeof module.title !== "string" || !module.title.trim()) throw new Error(`Module ${module.id} requires a title.`);
      if (!Array.isArray(module.lessons) || module.lessons.length === 0) {
        throw new Error(`Module ${module.id} requires at least one lesson.`);
      }

      module.lessons.forEach((lesson, lessonIndex) => {
        if (!lesson || typeof lesson !== "object") throw new Error(`Lesson ${lessonIndex + 1} in ${module.id} must be an object.`);
        if (typeof lesson.id !== "string" || !lesson.id.trim()) throw new Error(`Lesson ${lessonIndex + 1} in ${module.id} requires an id.`);
        if (lessonIds.has(lesson.id)) throw new Error(`Duplicate lesson id: ${lesson.id}`);
        lessonIds.add(lesson.id);
        if (typeof lesson.title !== "string" || !lesson.title.trim()) throw new Error(`Lesson ${lesson.id} requires a title.`);
        if (!new Set(["published", "planned"]).has(lesson.status)) {
          throw new Error(`Lesson ${lesson.id} status must be published or planned.`);
        }
        if (lesson.status === "published") {
          if (!Array.isArray(lesson.sections) || lesson.sections.length !== 11) {
            throw new Error(`Published lesson ${lesson.id} must contain 11 content sections; references render as section 12.`);
          }
          if (!Array.isArray(lesson.references) || lesson.references.length < 3) {
            throw new Error(`Published lesson ${lesson.id} requires at least three references.`);
          }
          lesson.references.forEach((sourceId) => {
            if (!sourceIds.has(sourceId)) throw new Error(`Lesson ${lesson.id} references unknown source: ${sourceId}`);
          });
        }
      });
    });
    if (value.archivedVault !== undefined) {
      if (!value.archivedVault || typeof value.archivedVault !== "object") {
        throw new Error("archivedVault must be an object when provided.");
      }
      const archivedIds = validateNotes(value.archivedVault.notes, "Archived note");
      archivedIds.forEach((id) => {
        if (lessonIds.has(id)) throw new Error(`Archived note id conflicts with lesson id: ${id}`);
      });
    }
    return;
  }

  if (!Array.isArray(value.notes)) throw new Error("Knowledge source must include either modules or notes.");
  validateNotes(value.notes);
}

const sourceText = await readFile(inputPath, "utf8");
const source = JSON.parse(sourceText);
validateSource(source);

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
  ["encrypt"],
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

await writeFile(outputPath, `window.__KNOWLEDGE_VAULT_DATA__ = ${JSON.stringify(payload, null, 2)};\n`, "utf8");
const itemSummary = Array.isArray(source.modules)
  ? `${source.modules.reduce((count, module) => count + module.lessons.length, 0)} lessons across ${source.modules.length} modules and ${source.archivedVault?.notes?.length || 0} preserved notes`
  : `${source.notes.length} note${source.notes.length === 1 ? "" : "s"}`;
console.log(`Encrypted ${itemSummary} into ${outputPath}`);
