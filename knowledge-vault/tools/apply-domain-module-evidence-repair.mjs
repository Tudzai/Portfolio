import { constants } from "node:fs";
import { copyFile, lstat, readFile, realpath, rename, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const vaultDirectory = resolve(scriptDirectory, "..");
const repositoryRoot = resolve(vaultDirectory, "..");
const privateDirectory = join(vaultDirectory, "private");
const argumentsList = process.argv.slice(2);

function argumentValue(flag) {
  const index = argumentsList.indexOf(flag);
  return index >= 0 ? argumentsList[index + 1] || "" : "";
}

function within(parent, candidate) {
  const pathFromParent = relative(parent, candidate);
  return pathFromParent === "" || (!pathFromParent.startsWith("..") && !isAbsolute(pathFromParent));
}

function present(value) {
  return typeof value === "string" && Boolean(value.trim());
}

function wordCount(value) {
  return String(value || "").trim().split(/\s+/u).filter(Boolean).length;
}

const planArgument = argumentValue("--plan");
if (!planArgument) {
  console.error("Module evidence repair failed: an external plan path is required.");
  process.exit(1);
}

const planPath = resolve(process.cwd(), planArgument);
const inputPath = argumentValue("--input")
  ? resolve(process.cwd(), argumentValue("--input"))
  : join(privateDirectory, "knowledge.json");
const dryRun = argumentsList.includes("--dry-run");
const consumePlan = argumentsList.includes("--consume");

let repositoryRealPath;
let privateRealPath;
let planRealPath;
let inputRealPath;
let inputStats;
try {
  [repositoryRealPath, privateRealPath, planRealPath, inputRealPath, inputStats] = await Promise.all([
    realpath(repositoryRoot),
    realpath(privateDirectory),
    realpath(planPath),
    realpath(inputPath),
    lstat(inputPath),
  ]);
} catch {
  console.error("Module evidence repair failed: the plan or private target could not be resolved.");
  process.exit(1);
}

if (
  within(repositoryRealPath, planRealPath)
  || !within(privateRealPath, inputRealPath)
  || inputStats.isSymbolicLink()
) {
  console.error("Module evidence repair failed: the plan must stay outside the repository and the target must stay private.");
  process.exit(1);
}

let source;
let plan;
try {
  [source, plan] = await Promise.all([
    readFile(inputPath, "utf8").then(JSON.parse),
    readFile(planPath, "utf8").then(JSON.parse),
  ]);
} catch {
  console.error("Module evidence repair failed: source or plan could not be parsed.");
  process.exit(1);
}

const allowedPlanFields = new Set(["domainId", "moduleIndex", "evidenceOutcome", "modulePatch"]);
const plannedEvidenceOutcome = plan?.evidenceOutcome ?? plan?.modulePatch?.evidenceOutcome;
if (
  !plan
  || typeof plan !== "object"
  || Array.isArray(plan)
  || Object.keys(plan).some((key) => !allowedPlanFields.has(key))
  || !present(plan.domainId)
  || !Number.isInteger(plan.moduleIndex)
  || plan.moduleIndex < 1
  || (plan.modulePatch !== undefined && (
    !plan.modulePatch
    || typeof plan.modulePatch !== "object"
    || Array.isArray(plan.modulePatch)
    || Object.keys(plan.modulePatch).length !== 1
    || !Object.hasOwn(plan.modulePatch, "evidenceOutcome")
  ))
  || !present(plannedEvidenceOutcome)
  || wordCount(plannedEvidenceOutcome) < 28
  || wordCount(plannedEvidenceOutcome) > 120
  || /\[\[|\]\]/u.test(plannedEvidenceOutcome)
) {
  console.error("Module evidence repair failed: plan shape is outside the replacement contract.");
  process.exit(1);
}

const domain = Array.isArray(source?.domains)
  ? source.domains.find((entry) => entry?.id === plan.domainId)
  : null;
const module = domain?.modules?.[plan.moduleIndex - 1];
if (!domain || !module) {
  console.error("Module evidence repair failed: the selected public position is unavailable.");
  process.exit(1);
}

module.evidenceOutcome = plannedEvidenceOutcome.trim();

const serialized = `${JSON.stringify(source, null, 2)}\n`;
const temporaryPath = `${inputPath}.module-evidence-repair-${process.pid}.tmp`;
const timestamp = new Date().toISOString().replace(/[:.]/gu, "-");
const backupPath = join(
  privateDirectory,
  `knowledge.pre-${plan.domainId}-m${plan.moduleIndex}-evidence-${timestamp}.json`,
);

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
        ? `Module evidence repair failed: the candidate did not pass the private schema gate (${safeSchemaCategory}).`
        : "Module evidence repair failed: the candidate did not pass the private schema gate.",
    );
    process.exit(1);
  }
  if (dryRun) {
    await unlink(temporaryPath);
  } else {
    await copyFile(inputPath, backupPath, constants.COPYFILE_EXCL);
    await rename(temporaryPath, inputPath);
  }
} catch {
  await unlink(temporaryPath).catch(() => {});
  console.error("Module evidence repair failed: private source was not replaced; the recovery copy was retained if created.");
  process.exit(1);
}

if (!dryRun && consumePlan) {
  await unlink(planPath).catch(() => {
    console.error("Module evidence repair applied, but the external plan could not be consumed.");
  });
}

console.log(
  `${dryRun ? "Validated" : "Applied"} module evidence repair for ${plan.domainId} at module ${plan.moduleIndex}; evidence words ${wordCount(plannedEvidenceOutcome)}.`,
);
if (!dryRun) console.log(`Private recovery copy created: ${basename(backupPath)}.`);
