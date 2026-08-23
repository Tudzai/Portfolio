import { constants } from "node:fs";
import { copyFile, lstat, readFile, readdir, realpath, rename, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const vaultDirectory = resolve(scriptDirectory, "..");
const repositoryRoot = resolve(vaultDirectory, "..");
const privateDirectory = join(vaultDirectory, "private");
const inputPath = join(privateDirectory, "knowledge.json");
const argumentsList = process.argv.slice(2);

function argumentValue(flag) {
  const index = argumentsList.indexOf(flag);
  return index >= 0 ? argumentsList[index + 1] || "" : "";
}

function within(parent, candidate) {
  const pathFromParent = relative(parent, candidate);
  return pathFromParent === "" || (!pathFromParent.startsWith("..") && !isAbsolute(pathFromParent));
}

const domainId = argumentValue("--domain");
if (!/^[a-z0-9-]+$/u.test(domainId)) {
  console.error("Domain recovery failed: a public domain ID is required.");
  process.exit(1);
}

let privateRealPath;
let inputRealPath;
let inputStats;
try {
  [privateRealPath, inputRealPath, inputStats] = await Promise.all([
    realpath(privateDirectory),
    realpath(inputPath),
    lstat(inputPath),
  ]);
} catch {
  console.error("Domain recovery failed: private target availability.");
  process.exit(1);
}

if (!within(privateRealPath, inputRealPath) || inputStats.isSymbolicLink()) {
  console.error("Domain recovery failed: private target boundary.");
  process.exit(1);
}

let recoveryCandidates;
try {
  const entries = await readdir(privateDirectory, { withFileTypes: true });
  const prefix = `knowledge.pre-${domainId}-`;
  recoveryCandidates = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.startsWith(prefix) && entry.name.endsWith(".json"))
      .map(async (entry) => {
        const path = join(privateDirectory, entry.name);
        const [resolvedPath, fileStats] = await Promise.all([realpath(path), stat(path)]);
        return { path, resolvedPath, modifiedAt: fileStats.mtimeMs };
      }),
  );
} catch {
  console.error("Domain recovery failed: recovery snapshot discovery.");
  process.exit(1);
}

const recovery = recoveryCandidates
  .filter((candidate) => within(privateRealPath, candidate.resolvedPath))
  .sort((left, right) => left.modifiedAt - right.modifiedAt)[0];
if (!recovery) {
  console.error("Domain recovery failed: no eligible recovery snapshot.");
  process.exit(1);
}

let current;
let snapshot;
try {
  [current, snapshot] = await Promise.all([
    readFile(inputPath, "utf8").then(JSON.parse),
    readFile(recovery.path, "utf8").then(JSON.parse),
  ]);
} catch {
  console.error("Domain recovery failed: private source parsing.");
  process.exit(1);
}

const currentIndex = Array.isArray(current?.domains)
  ? current.domains.findIndex((domain) => domain?.id === domainId)
  : -1;
const snapshotDomain = Array.isArray(snapshot?.domains)
  ? snapshot.domains.find((domain) => domain?.id === domainId)
  : null;
if (currentIndex < 0 || !snapshotDomain) {
  console.error("Domain recovery failed: selected domain availability.");
  process.exit(1);
}

current.domains[currentIndex] = structuredClone(snapshotDomain);
const serialized = `${JSON.stringify(current, null, 2)}\n`;
const temporaryPath = `${inputPath}.domain-recovery-${process.pid}.tmp`;
const timestamp = new Date().toISOString().replace(/[:.]/gu, "-");
const backupPath = join(privateDirectory, `knowledge.pre-${domainId}-stopped-${timestamp}.json`);

try {
  await writeFile(temporaryPath, serialized, { encoding: "utf8", flag: "wx" });
  const schemaGate = spawnSync(
    process.execPath,
    [join(scriptDirectory, "validate-vault.mjs"), temporaryPath],
    { cwd: repositoryRoot, encoding: "utf8", windowsHide: true },
  );
  if (schemaGate.status !== 0) {
    await unlink(temporaryPath);
    const safeSchemaCategory = String(schemaGate.stderr || "")
      .trim()
      .match(/^Vault validation failed: ([a-z0-9, -]+)\.$/u)?.[1];
    console.error(
      safeSchemaCategory
        ? `Domain recovery failed: candidate schema gate (${safeSchemaCategory}).`
        : "Domain recovery failed: candidate schema gate.",
    );
    process.exit(1);
  }
  await copyFile(inputPath, backupPath, constants.COPYFILE_EXCL);
  await rename(temporaryPath, inputPath);
} catch {
  await unlink(temporaryPath).catch(() => {});
  console.error("Domain recovery failed: private source was not replaced; recovery copy was retained if created.");
  process.exit(1);
}

console.log(`Domain recovery applied: modules (${snapshotDomain.modules.length}), sources (${snapshotDomain.primarySources.length}).`);
console.log(`Private recovery copy created: ${basename(backupPath)}.`);
