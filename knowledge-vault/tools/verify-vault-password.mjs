import { readFile } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const vaultDirectory = resolve(scriptDirectory, "..");
const inputPath = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : join(vaultDirectory, "vault-data.js");
const password = process.env.VAULT_PASSWORD;
const expectedCounts = [
  { modules: 12, lessons: 67, sources: 179 },
  { modules: 15, lessons: 74, sources: 97 },
  { modules: 18, lessons: 89, sources: 68 },
  { modules: 14, lessons: 68, sources: 41 },
  { modules: 15, lessons: 60, sources: 56 },
];

function exactKeys(value, keys) {
  return value
    && typeof value === "object"
    && !Array.isArray(value)
    && Object.keys(value).sort().join("|") === [...keys].sort().join("|");
}

function verifyReleaseShape(value) {
  if (
    !value
    || typeof value !== "object"
    || !Array.isArray(value.domains)
    || value.domains.length !== expectedCounts.length
    || !value.archivedVault
    || !Array.isArray(value.archivedVault.notes)
    || !value.archivedVault.notes.length
  ) return false;

  return value.domains.every((domain, domainIndex) => {
    const expected = expectedCounts[domainIndex];
    if (
      !Array.isArray(domain?.primarySources)
      || domain.primarySources.length !== expected.sources
      || !Array.isArray(domain.modules)
      || domain.modules.length !== expected.modules
    ) return false;
    const lessons = domain.modules.flatMap((module) => Array.isArray(module?.lessons) ? module.lessons : []);
    return lessons.length === expected.lessons
      && lessons.every((lesson) =>
        lesson?.status === "published"
        && Array.isArray(lesson.sections)
        && lesson.sections.length === 11
        && Array.isArray(lesson.references)
        && new Set(lesson.references).size >= 3,
      );
  });
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
