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

function blockStrings(block) {
  if (block?.type === "paragraph") return [block.text];
  if (block?.type === "list") return Array.isArray(block.items) ? block.items : [];
  if (block?.type === "callout") return [block.label, block.text];
  if (block?.type === "table") {
    return [
      ...(Array.isArray(block.headers) ? block.headers : []),
      ...(Array.isArray(block.rows) ? block.rows.flat() : []),
    ];
  }
  if (block?.type === "flow") {
    return Array.isArray(block.steps)
      ? block.steps.flatMap((step) => [step?.label, step?.title, step?.detail])
      : [];
  }
  return [];
}

function wordCount(value) {
  return String(value || "")
    .replace(/\[\[[a-z0-9-]+\]\]/giu, "")
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .length;
}

const planArgument = argumentValue("--plan");
if (!planArgument) {
  console.error("Detail repair failed: an external plan path is required.");
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
  console.error("Detail repair failed: the plan or private target could not be resolved.");
  process.exit(1);
}

if (
  within(repositoryRealPath, planRealPath)
  || !within(privateRealPath, inputRealPath)
  || inputStats.isSymbolicLink()
) {
  console.error("Detail repair failed: the plan must stay outside the repository and the target must stay private.");
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
  console.error("Detail repair failed: source or plan could not be parsed.");
  process.exit(1);
}

const allowedPlanFields = new Set([
  "domainId",
  "moduleIndex",
  "lessonIndex",
  "sectionId",
  "blocks",
  "reviewedAt",
  "repairLayer",
]);
const allowedBlockTypes = new Set(["paragraph", "list", "callout", "table", "flow"]);
const serializedBlocks = JSON.stringify(plan?.blocks || []);
const repairLayer = plan?.repairLayer || "detail";
const isCoreRepair = repairLayer === "core";
if (
  !plan
  || typeof plan !== "object"
  || Array.isArray(plan)
  || Object.keys(plan).some((key) => !allowedPlanFields.has(key))
  || !present(plan.domainId)
  || !Number.isInteger(plan.moduleIndex)
  || plan.moduleIndex < 1
  || !Number.isInteger(plan.lessonIndex)
  || plan.lessonIndex < 1
  || !present(plan.sectionId)
  || !Array.isArray(plan.blocks)
  || plan.blocks.length < 1
  || plan.blocks.length > (isCoreRepair ? 1 : 3)
  || !new Set(["core", "detail"]).has(repairLayer)
  || plan.blocks.some((block) => (
    !block
    || typeof block !== "object"
    || Array.isArray(block)
    || block.learningLayer !== repairLayer
    || !allowedBlockTypes.has(block.type)
    || (isCoreRepair && block.type !== "paragraph")
    || (!isCoreRepair && block.type === "callout" && block.tone === "caution")
  ))
  || /\[\[|\]\]/u.test(serializedBlocks)
  || (plan.reviewedAt !== undefined && !/^\d{4}-\d{2}-\d{2}$/u.test(plan.reviewedAt))
) {
  console.error("Detail repair failed: plan shape is outside the append-only contract.");
  process.exit(1);
}

const addedWords = plan.blocks
  .flatMap(blockStrings)
  .reduce((total, value) => total + wordCount(value), 0);
const minimumAddedWords = isCoreRepair ? 3 : 40;
const maximumAddedWords = isCoreRepair ? 100 : 300;
if (addedWords < minimumAddedWords || addedWords > maximumAddedWords) {
  console.error(
    `Detail repair failed: the append-only ${repairLayer} word band is ${minimumAddedWords} to ${maximumAddedWords} words.`,
  );
  process.exit(1);
}

const domain = Array.isArray(source?.domains)
  ? source.domains.find((entry) => entry?.id === plan.domainId)
  : null;
const module = domain?.modules?.[plan.moduleIndex - 1];
const lesson = module?.lessons?.[plan.lessonIndex - 1];
const section = lesson?.sections?.find((entry) => entry?.id === plan.sectionId);
if (!domain || !module || !lesson || !section || !Array.isArray(section.blocks)) {
  console.error("Detail repair failed: the selected public position is unavailable.");
  process.exit(1);
}

section.blocks.push(...structuredClone(plan.blocks));
if (plan.reviewedAt) lesson.lastReviewed = plan.reviewedAt;

const serialized = `${JSON.stringify(source, null, 2)}\n`;
const temporaryPath = `${inputPath}.detail-repair-${process.pid}.tmp`;
const timestamp = new Date().toISOString().replace(/[:.]/gu, "-");
const backupPath = join(
  privateDirectory,
  `knowledge.pre-${plan.domainId}-m${plan.moduleIndex}l${plan.lessonIndex}-detail-${timestamp}.json`,
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
        ? `Detail repair failed: the candidate did not pass the private schema gate (${safeSchemaCategory}).`
        : "Detail repair failed: the candidate did not pass the private schema gate.",
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
  console.error("Detail repair failed: private source was not replaced; the recovery copy was retained if created.");
  process.exit(1);
}

if (!dryRun && consumePlan) {
  await unlink(planPath).catch(() => {
    console.error("Detail repair applied, but the external plan could not be consumed.");
  });
}

console.log(
  `${dryRun ? "Validated" : "Applied"} detail repair for ${plan.domainId} at module ${plan.moduleIndex}, lesson ${plan.lessonIndex}; added words ${addedWords}.`,
);
if (!dryRun) console.log(`Private recovery copy created: ${basename(backupPath)}.`);
