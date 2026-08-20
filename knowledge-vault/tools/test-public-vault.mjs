import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const vaultDirectory = resolve(scriptDirectory, "..");
const [html, css, js, encryptedData] = await Promise.all([
  readFile(join(vaultDirectory, "index.html"), "utf8"),
  readFile(join(vaultDirectory, "vault.css"), "utf8"),
  readFile(join(vaultDirectory, "vault.js"), "utf8"),
  readFile(join(vaultDirectory, "vault-data.js"), "utf8"),
]);

const failures = [];
const requireMatch = (value, pattern, label) => {
  if (!pattern.test(value)) failures.push(label);
};
const forbidMatch = (value, pattern, label) => {
  if (pattern.test(value)) failures.push(label);
};

function collectStartTags(source, tagName) {
  const cleaned = source.replace(/<!--[\s\S]*?-->/g, "");
  const lower = cleaned.toLocaleLowerCase("en-US");
  const needle = `<${tagName.toLocaleLowerCase("en-US")}`;
  const tags = [];
  let cursor = 0;
  while ((cursor = lower.indexOf(needle, cursor)) >= 0) {
    const boundary = lower[cursor + needle.length];
    if (boundary && !/[\s/>]/.test(boundary)) {
      cursor += needle.length;
      continue;
    }
    let end = cursor + needle.length;
    let quote = null;
    for (; end < cleaned.length; end += 1) {
      const character = cleaned[end];
      if (quote) {
        if (character === quote) quote = null;
      } else if (character === '"' || character === "'") {
        quote = character;
      } else if (character === ">") {
        break;
      }
    }
    if (end >= cleaned.length) {
      failures.push(`unterminated ${tagName} tag`);
      break;
    }
    const rawAttributes = cleaned.slice(cursor + needle.length, end);
    const attributes = {};
    const attributePattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
    let match;
    while ((match = attributePattern.exec(rawAttributes)) !== null) {
      attributes[match[1].toLocaleLowerCase("en-US")] = match[2] ?? match[3] ?? match[4] ?? "";
    }
    tags.push(attributes);
    cursor = end + 1;
  }
  return tags;
}

const expectedCsp = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
const cspMetas = collectStartTags(html, "meta").filter(
  (attributes) => attributes["http-equiv"]?.toLocaleLowerCase("en-US") === "content-security-policy",
);
if (cspMetas.length !== 1 || cspMetas[0].content !== expectedCsp) failures.push("exact restrictive CSP");

const scriptTags = collectStartTags(html, "script");
const scriptSources = scriptTags.map((attributes) => attributes.src).filter(Boolean);
if (scriptSources.join("|") !== "vault-data.js?v=20260819-expanded-domains|vault.js?v=20260819-expanded-domains") {
  failures.push("script resource allowlist");
}
if (scriptTags.some((attributes) => !attributes.src)) failures.push("inline script");
const linkTags = collectStartTags(html, "link");
const stylesheetSources = linkTags
  .filter((attributes) => attributes.rel?.toLocaleLowerCase("en-US").split(/\s+/u).includes("stylesheet"))
  .map((attributes) => attributes.href);
if (stylesheetSources.join("|") !== "vault.css?v=20260819-expanded-domains") failures.push("stylesheet resource allowlist");
const iconAllowed = linkTags.some((attributes) => attributes.rel === "icon" && attributes.href === "../assets/favicon.svg");
if (linkTags.length !== 2 || !iconAllowed) failures.push("link resource allowlist");
if (["iframe", "embed", "object"].some((tagName) => collectStartTags(html, tagName).length)) {
  failures.push("embedded resource");
}

forbidMatch(html, /posthog|analytics\.js|https?:\/\//i, "external script or endpoint in vault HTML");
forbidMatch(js, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/, "network API in vault runtime");
forbidMatch(js, /\b(?:innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval|Function)\b/, "unsafe rendering sink");
forbidMatch(js, /\bnew\s+Image\b|\.src\s*=|\blocation\s*=/, "background navigation or image exfiltration sink");
forbidMatch(css, /@import|url\(\s*["']?(?:https?:)?\/\//i, "remote CSS dependency");

try {
  new Function(js);
} catch {
  failures.push("vault JavaScript syntax");
}

const envelopeMatch = encryptedData.trim().match(/^window\.__KNOWLEDGE_VAULT_DATA__\s*=\s*(\{[\s\S]*\});$/);
let envelope = null;
try {
  envelope = envelopeMatch ? JSON.parse(envelopeMatch[1]) : null;
} catch {
  envelope = null;
}
const exactKeys = (value, keys) => value
  && typeof value === "object"
  && !Array.isArray(value)
  && Object.keys(value).sort().join("|") === [...keys].sort().join("|");
const canonicalBase64 = (value, expectedBytes = null) => {
  if (typeof value !== "string" || !value.length || value.length % 4 !== 0) return false;
  const padding = value.endsWith("==") ? 2 : value.endsWith("=") ? 1 : 0;
  const contentLength = value.length - padding;
  for (let index = 0; index < contentLength; index += 1) {
    const code = value.charCodeAt(index);
    const allowed = (code >= 48 && code <= 57)
      || (code >= 65 && code <= 90)
      || (code >= 97 && code <= 122)
      || code === 43
      || code === 47;
    if (!allowed) return false;
  }
  if (value.slice(0, contentLength).includes("=") || /[^=]/.test(value.slice(contentLength))) return false;
  const decoded = Buffer.from(value, "base64");
  return decoded.toString("base64") === value && (expectedBytes === null || decoded.length === expectedBytes);
};
const envelopeValid = exactKeys(envelope, ["version", "kdf", "cipher", "ciphertext"])
  && envelope.version === 1
  && exactKeys(envelope.kdf, ["name", "hash", "iterations", "salt"])
  && envelope.kdf.name === "PBKDF2"
  && envelope.kdf.hash === "SHA-256"
  && envelope.kdf.iterations === 600_000
  && canonicalBase64(envelope.kdf.salt, 16)
  && exactKeys(envelope.cipher, ["name", "keyLength", "tagLength", "iv"])
  && envelope.cipher.name === "AES-GCM"
  && envelope.cipher.keyLength === 256
  && envelope.cipher.tagLength === 128
  && canonicalBase64(envelope.cipher.iv, 12)
  && canonicalBase64(envelope.ciphertext)
  && Buffer.from(envelope.ciphertext, "base64").length > 16;
if (!envelopeValid) {
  failures.push("ciphertext-only encrypted envelope shape");
} else {
  const ciphertextBytes = Buffer.from(envelope.ciphertext, "base64");
  const frequencies = new Uint32Array(256);
  ciphertextBytes.forEach((byte) => { frequencies[byte] += 1; });
  const entropy = frequencies.reduce((total, count) => {
    if (!count) return total;
    const probability = count / ciphertextBytes.length;
    return total - probability * Math.log2(probability);
  }, 0);
  const prefix = ciphertextBytes.subarray(0, 64).toString("utf8").trimStart();
  if (entropy < 7.95 || prefix.startsWith("{") || prefix.startsWith("[")) {
    failures.push("ciphertext plausibility");
  }
}

const repositoryRoot = resolve(vaultDirectory, "..");
const allowedVaultFiles = new Set([
  "knowledge-vault/AGENTS.md",
  "knowledge-vault/README.md",
  "knowledge-vault/index.html",
  "knowledge-vault/knowledge.example.json",
  "knowledge-vault/private/.gitignore",
  "knowledge-vault/tools/encrypt-vault.mjs",
  "knowledge-vault/tools/encrypt-vault.ps1",
  "knowledge-vault/tools/test-public-vault.mjs",
  "knowledge-vault/tools/validate-vault.mjs",
  "knowledge-vault/tools/verify-vault-password.mjs",
  "knowledge-vault/vault-data.js",
  "knowledge-vault/vault.css",
  "knowledge-vault/vault.js",
]);
const visibleVaultFiles = spawnSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "--", "knowledge-vault"],
  { cwd: repositoryRoot, encoding: "utf8" },
);
const visibleVaultPaths = visibleVaultFiles.status === 0
  ? visibleVaultFiles.stdout.split(/\r?\n/u).filter(Boolean)
  : [];
if (
  visibleVaultFiles.status !== 0
  || visibleVaultPaths.some((file) => !allowedVaultFiles.has(file.replaceAll("\\", "/")))
) failures.push("Git vault-file allowlist");
const trackedPrivate = spawnSync(
  "git",
  ["ls-files", "--cached", "--", "knowledge-vault/private"],
  { cwd: repositoryRoot, encoding: "utf8" },
);
const trackedPrivateFiles = trackedPrivate.status === 0
  ? trackedPrivate.stdout.split(/\r?\n/u).filter(Boolean)
  : [];
if (
  trackedPrivate.status !== 0
  || trackedPrivateFiles.some((file) => file !== "knowledge-vault/private/.gitignore")
) failures.push("Git private-file publish boundary");
const trackedAuthoringWorkspace = spawnSync(
  "git",
  ["ls-files", "--cached", "--", "tmp/knowledge-vault-new-domains"],
  { cwd: repositoryRoot, encoding: "utf8" },
);
if (trackedAuthoringWorkspace.status !== 0 || trackedAuthoringWorkspace.stdout.trim()) {
  failures.push("Git plaintext authoring-workspace boundary");
}
const ignoredPlaintext = spawnSync(
  "git",
  ["check-ignore", "--quiet", "--no-index", "knowledge-vault/private/knowledge.json"],
  { cwd: repositoryRoot },
);
if (ignoredPlaintext.status !== 0) failures.push("plaintext ignore rule");

[
  "data-tools-toggle",
  "data-resume-button",
  "data-random-button",
  "data-bookmarks-button",
  "data-reading-mode-button",
  "data-text-size-button",
  "data-theme-tool-button",
  "data-focus-button",
  "data-shortcuts-dialog",
  "role=\"combobox\"",
  "role=\"listbox\"",
].forEach((token) => requireMatch(html, new RegExp(token), `missing interface contract: ${token}`));

[
  "validateLibraryCompleteness",
  "renderBookmarksHome",
  "selectRandomLesson",
  "createLessonOutline",
  "createQuickGuide",
  "readableChunks",
  "handleSearchKeydown",
  "setFocusMode",
  "setReadingMode",
  "cycleTextSize",
].forEach((token) => requireMatch(js, new RegExp(`function ${token}\\b`), `missing behavior contract: ${token}`));

[
  ".tools-popover",
  ".path-panel",
  ".quick-guide",
  ".lesson-outline",
  "body.essentials-mode",
  "body.focus-mode",
  "prefers-reduced-motion",
  "data-domain-tone",
].forEach((token) => requireMatch(css, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing style contract: ${token}`));

requireMatch(js, /document\.createTextNode|\.textContent\s*=/, "safe text rendering");
requireMatch(js, /window\.crypto\.subtle\.decrypt/, "local cryptographic decryption");
requireMatch(js, /state\.data\s*=\s*null/, "lock clears decrypted data reference");
requireMatch(js, /lessonReader\.replaceChildren\(\)/, "lock clears rendered lesson content");

if (failures.length) {
  console.error(`Public vault checks failed: ${failures.join(", ")}.`);
  process.exit(1);
}

console.log("Public vault static checks passed: resource allowlist, CSP, JavaScript syntax, encrypted-envelope plausibility, Git privacy boundary, and interface markers are valid; browser behavior was not exercised.");
