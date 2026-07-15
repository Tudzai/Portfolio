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

function validateSource(value) {
  if (!value || typeof value !== "object") throw new Error("Knowledge source must be a JSON object.");
  if (!Array.isArray(value.notes)) throw new Error("Knowledge source must include a notes array.");

  const ids = new Set();
  value.notes.forEach((note, index) => {
    if (!note || typeof note !== "object") throw new Error(`Note ${index + 1} must be an object.`);
    if (typeof note.id !== "string" || !note.id.trim()) throw new Error(`Note ${index + 1} requires an id.`);
    if (ids.has(note.id)) throw new Error(`Duplicate note id: ${note.id}`);
    ids.add(note.id);
    if (typeof note.title !== "string" || !note.title.trim()) throw new Error(`Note ${note.id} requires a title.`);
    if (!Array.isArray(note.content)) throw new Error(`Note ${note.id} content must be an array of paragraphs.`);
  });
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
console.log(`Encrypted ${source.notes.length} note${source.notes.length === 1 ? "" : "s"} into ${outputPath}`);
