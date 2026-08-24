import { createHash } from "node:crypto";
import { readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const vaultDirectory = resolve(scriptDirectory, "..");
const encryptedPath = process.argv[2]
  ? resolve(process.cwd(), process.argv[2])
  : join(vaultDirectory, "vault-data.js");
const indexPath = join(vaultDirectory, "index.html");
const stylesheetPath = join(vaultDirectory, "vault.css");
const runtimePath = join(vaultDirectory, "vault.js");

if (encryptedPath.toLocaleLowerCase("en-US") !== join(vaultDirectory, "vault-data.js").toLocaleLowerCase("en-US")) {
  throw new Error("Cache-key sync only accepts the canonical public vault-data.js path.");
}

const [stylesheetSource, encryptedSource, runtimeSource] = await Promise.all([
  readFile(stylesheetPath, "utf8"),
  readFile(encryptedPath, "utf8"),
  readFile(runtimePath, "utf8"),
]);
const assignment = encryptedSource.trim().match(/^window\.__KNOWLEDGE_VAULT_DATA__\s*=\s*(\{[\s\S]*\});$/u);
let payload;
try {
  payload = assignment ? JSON.parse(assignment[1]) : null;
} catch {
  payload = null;
}
if (
  !payload
  || !new Set([1, 2]).has(payload.version)
  || typeof payload.ciphertext !== "string"
  || !payload.ciphertext
) {
  throw new Error("Cache-key sync requires a valid encrypted vault envelope.");
}

const digest = createHash("sha256")
  .update("vault.css\0", "utf8")
  .update(stylesheetSource, "utf8")
  .update("\0vault-data.js\0", "utf8")
  .update(encryptedSource, "utf8")
  .update("\0vault.js\0", "utf8")
  .update(runtimeSource, "utf8")
  .digest("hex")
  .slice(0, 16);
const cacheKey = `vault-v${payload.version}-${digest}`;
const indexSource = await readFile(indexPath, "utf8");
const resourcePattern = /((?:href|src)="(?:vault\.css|vault-data\.js|vault\.js)\?v=)([^"\s]+)(")/gu;
const matches = [...indexSource.matchAll(resourcePattern)];
const resourceNames = matches.map((match) => match[1].match(/(?:vault\.css|vault-data\.js|vault\.js)/u)?.[0]);
if (
  matches.length !== 3
  || resourceNames.join("|") !== "vault.css|vault-data.js|vault.js"
  || new Set(matches.map((match) => match[2])).size !== 1
) {
  throw new Error("Cache-key sync found an unexpected versioned-resource contract.");
}

const candidate = indexSource.replace(resourcePattern, `$1${cacheKey}$3`);
if (candidate === indexSource) {
  console.log(`Vault cache key already current: ${cacheKey}.`);
  process.exit(0);
}

const temporaryPath = join(dirname(indexPath), `.${basename(indexPath)}.${process.pid}.tmp`);
try {
  await writeFile(temporaryPath, candidate, { encoding: "utf8", flag: "wx" });
  await rename(temporaryPath, indexPath);
} catch {
  await rm(temporaryPath, { force: true });
  throw new Error("Cache-key sync could not replace index.html atomically.");
}
console.log(`Vault cache key synced: ${cacheKey}.`);
