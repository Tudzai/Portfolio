import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const roots = ["blog", "showcase"];
const rootFiles = ["cv.html", "share.html"];
const routeIntro = /\s*<section class="stage-route-intro" data-stage-route-intro[\s\S]*?<\/section>\s*/g;

async function walk(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(absolute);
  }
  return files;
}

const files = [
  ...rootFiles.map((file) => path.join(repoRoot, file)),
  ...(await Promise.all(roots.map((root) => walk(path.join(repoRoot, root))))).flat(),
];

let changed = 0;
for (const file of files) {
  const html = await fs.readFile(file, "utf8");
  const updated = html.replace(routeIntro, "\n");
  if (updated === html) continue;
  await fs.writeFile(file, updated, "utf8");
  changed += 1;
}

console.log(`Removed route intros from ${changed} HTML files.`);
