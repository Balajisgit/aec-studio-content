// checks/validate.js — the content repository's automatic check: every JSON file parses, settings.json has the right shape,
// and nothing sits outside the agreed layout. Run on every pull request; run by hand with: node checks/validate.js
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", ".."), problems = [];
const TOP = new Set(["pipelines", "agents", "skills", "checks", "solvers", "panels", "library", "canvases", "memory", "lessons", "settings.json", "README.md", "package.json", ".github", ".gitkeep"]);
for (const n of readdirSync(root)) if (!n.startsWith(".git") && !TOP.has(n)) problems.push(`${n}: not part of the content layout (see README.md)`);
const walk = (d) => { for (const n of readdirSync(d)) { if (n === ".git" || n === "node_modules") continue; const f = join(d, n); if (statSync(f).isDirectory()) walk(f); else if (n.endsWith(".json")) {
  try { JSON.parse(readFileSync(f, "utf8")); } catch (e) { problems.push(`${relative(root, f).split(sep).join("/")}: not valid JSON (${e.message})`); } } } };
walk(root);
try { const s = JSON.parse(readFileSync(join(root, "settings.json"), "utf8")); const m = s.models || {};
  for (const k of ["quick", "default", "complex"]) if (typeof m[k] !== "string" || !m[k]) problems.push(`settings.json: models.${k} must be a model name`);
} catch (e) { problems.push(`settings.json: ${e.message}`); }
for (const p of problems) console.log("FAIL", p);
console.log(`content: ${problems.length} problem${problems.length === 1 ? "" : "s"}`); process.exit(problems.length ? 1 : 0);
