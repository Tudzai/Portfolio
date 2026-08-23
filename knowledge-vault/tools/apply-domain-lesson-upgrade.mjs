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

const planArgument = argumentValue("--plan");
if (!planArgument) {
  console.error("Lesson upgrade failed: an external plan path is required.");
  process.exit(1);
}

const planPath = resolve(process.cwd(), planArgument);
const inputPath = argumentValue("--input")
  ? resolve(process.cwd(), argumentValue("--input"))
  : join(privateDirectory, "knowledge.json");
const dryRun = argumentsList.includes("--dry-run");
const previewCount = argumentsList.includes("--preview-count");
const consumePlan = argumentsList.includes("--consume");

if (previewCount && (dryRun || consumePlan)) {
  console.error("Lesson upgrade failed: preview-count cannot be combined with dry-run or consume.");
  process.exit(1);
}

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
  console.error("Lesson upgrade failed: the plan or private target could not be resolved.");
  process.exit(1);
}

if (
  within(repositoryRealPath, planRealPath)
  || !within(privateRealPath, inputRealPath)
  || inputStats.isSymbolicLink()
) {
  console.error("Lesson upgrade failed: the plan must stay outside the repository and the target must stay private.");
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
  console.error("Lesson upgrade failed: source or plan could not be parsed.");
  process.exit(1);
}

if (
  !present(plan?.domainId)
  || !Number.isInteger(plan?.moduleIndex)
  || plan.moduleIndex < 1
  || !Number.isInteger(plan?.lessonIndex)
  || plan.lessonIndex < 1
  || !plan.lesson
  || typeof plan.lesson !== "object"
  || Array.isArray(plan.lesson)
  || !Array.isArray(plan.sources)
) {
  console.error("Lesson upgrade failed: plan shape is invalid.");
  process.exit(1);
}

const allowedModulePatchFields = new Set(["title", "level", "description", "evidenceOutcome"]);
const allowedDomainPatchFields = new Set(["updatedAt", "reviewedAt"]);
if (
  (plan.modulePatch && (
    typeof plan.modulePatch !== "object"
    || Array.isArray(plan.modulePatch)
    || Object.keys(plan.modulePatch).some((key) => !allowedModulePatchFields.has(key))
  ))
  || (plan.domainPatch && (
    typeof plan.domainPatch !== "object"
    || Array.isArray(plan.domainPatch)
    || Object.keys(plan.domainPatch).some((key) => !allowedDomainPatchFields.has(key))
  ))
) {
  console.error("Lesson upgrade failed: patch fields are outside the lesson-upgrade contract.");
  process.exit(1);
}

const domain = Array.isArray(source?.domains)
  ? source.domains.find((entry) => entry?.id === plan.domainId)
  : null;
const module = domain?.modules?.[plan.moduleIndex - 1];
const existingLesson = module?.lessons?.[plan.lessonIndex - 1];

if (!domain || !module || !existingLesson || !Array.isArray(domain.primarySources)) {
  console.error("Lesson upgrade failed: the selected public position is unavailable.");
  process.exit(1);
}

const allIds = new Set();
function collectIds(value) {
  if (Array.isArray(value)) {
    value.forEach(collectIds);
    return;
  }
  if (!value || typeof value !== "object") return;
  if (present(value.id)) allIds.add(value.id);
  Object.values(value).forEach(collectIds);
}
collectIds(source);

const sourceAliases = new Map();
for (const plannedSource of plan.sources) {
  if (
    !present(plannedSource?.alias)
    || !present(plannedSource?.id)
    || !present(plannedSource?.title)
    || !present(plannedSource?.organization)
    || !present(plannedSource?.url)
    || !present(plannedSource?.scope)
    || !present(plannedSource?.sourceType)
  ) {
    console.error("Lesson upgrade failed: source plan is incomplete.");
    process.exit(1);
  }
  let existingSource = domain.primarySources.find((entry) => entry?.url === plannedSource.url);
  if (!existingSource) {
    if (allIds.has(plannedSource.id)) {
      console.error("Lesson upgrade failed: a planned source ID is unavailable.");
      process.exit(1);
    }
    const { alias, ...sourceEntry } = plannedSource;
    existingSource = sourceEntry;
    domain.primarySources.push(existingSource);
    allIds.add(existingSource.id);
  } else {
    const { alias, id, ...refreshedMetadata } = plannedSource;
    Object.assign(existingSource, refreshedMetadata);
  }
  if (sourceAliases.has(plannedSource.alias)) {
    console.error("Lesson upgrade failed: source aliases must be unique.");
    process.exit(1);
  }
  sourceAliases.set(plannedSource.alias, existingSource.id);
}

function replaceSourcePlaceholders(value) {
  if (Array.isArray(value)) return value.map(replaceSourcePlaceholders);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, replaceSourcePlaceholders(entry)]));
  }
  if (typeof value !== "string") return value;
  return value.replace(/\[\[SOURCE:([a-z0-9-]+)\]\]/giu, (match, alias) => {
    const resolvedId = sourceAliases.get(alias);
    if (!resolvedId) throw new Error("unresolved-source-placeholder");
    return `[[${resolvedId}]]`;
  });
}

let upgradedLesson;
try {
  upgradedLesson = replaceSourcePlaceholders(plan.lesson);
} catch {
  console.error("Lesson upgrade failed: a source placeholder could not be resolved.");
  process.exit(1);
}

const referenceAliases = Array.isArray(plan.lesson.references) ? plan.lesson.references : [];
const resolvedReferences = referenceAliases.map((alias) => sourceAliases.get(alias)).filter(Boolean);
if (resolvedReferences.length !== referenceAliases.length || new Set(resolvedReferences).size < 4) {
  console.error("Lesson upgrade failed: at least four unique planned sources are required.");
  process.exit(1);
}

upgradedLesson.id = existingLesson.id;
upgradedLesson.references = resolvedReferences;
if (plan.modulePatch) Object.assign(module, plan.modulePatch);
if (plan.domainPatch) Object.assign(domain, plan.domainPatch);
module.lessons[plan.lessonIndex - 1] = upgradedLesson;

const retainedSourceIds = new Set(
  domain.modules
    .flatMap((domainModule) => Array.isArray(domainModule?.lessons) ? domainModule.lessons : [])
    .flatMap((domainLesson) => Array.isArray(domainLesson?.references) ? domainLesson.references : []),
);
domain.primarySources = domain.primarySources.filter((sourceEntry) => retainedSourceIds.has(sourceEntry?.id));

const serialized = `${JSON.stringify(source, null, 2)}\n`;
const temporaryPath = `${inputPath}.lesson-upgrade-${process.pid}.tmp`;
const timestamp = new Date().toISOString().replace(/[:.]/gu, "-");
const backupPath = join(
  privateDirectory,
  `knowledge.pre-${plan.domainId}-m${plan.moduleIndex}l${plan.lessonIndex}-${timestamp}.json`,
);

if (previewCount) {
  console.log(
    `Prospective lesson upgrade for ${plan.domainId} at module ${plan.moduleIndex}, lesson ${plan.lessonIndex}; domain source count ${domain.primarySources.length}.`,
  );
  process.exit(0);
}

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
        ? `Lesson upgrade failed: the candidate did not pass the private schema gate (${safeSchemaCategory}).`
        : "Lesson upgrade failed: the candidate did not pass the private schema gate.",
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
  console.error("Lesson upgrade failed: private source was not replaced; the recovery copy was retained if created.");
  process.exit(1);
}

if (!dryRun) {
  if (consumePlan) {
    await unlink(planPath).catch(() => {
      console.error("Lesson upgrade applied, but the external plan could not be consumed.");
    });
  }
}

console.log(
  `${dryRun ? "Validated" : "Applied"} lesson upgrade for ${plan.domainId} at module ${plan.moduleIndex}, lesson ${plan.lessonIndex}; domain source count ${domain.primarySources.length}.`,
);
if (!dryRun) console.log(`Private recovery copy created: ${basename(backupPath)}.`);
