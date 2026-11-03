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
// memory/sessions/<4 digits>.md: front matter with number (matching the file name), date and title; a headline; Done, Decisions, Open
const sessDir = join(root, "memory", "sessions");
try { for (const n of readdirSync(sessDir)) { if (n === ".gitkeep") continue; const rel = `memory/sessions/${n}`;
  if (!/^\d{4}\.md$/.test(n)) { problems.push(`${rel}: session files are named with 4 digits, e.g. 0019.md`); continue; }
  const t = readFileSync(join(sessDir, n), "utf8").replace(/\r\n/g, "\n"), fm = /^---\n([\s\S]*?)\n---\n/.exec(t);
  if (!fm) { problems.push(`${rel}: no front matter`); continue; }
  const meta = Object.fromEntries(fm[1].split("\n").map((l) => /^([a-z]+):\s*(.*)$/.exec(l)).filter(Boolean).map((m) => [m[1], m[2]]));
  if (Number(meta.number) !== Number(n.slice(0, 4))) problems.push(`${rel}: number ${meta.number} does not match the file name`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date || "")) problems.push(`${rel}: date must be YYYY-MM-DD`);
  if (!meta.title || meta.title.length > 200) problems.push(`${rel}: title is missing or longer than 200 characters`);
  for (const sec of ["Done", "Decisions", "Open"]) if (!new RegExp(`^## ${sec}$`, "m").test(t)) problems.push(`${rel}: no "## ${sec}" section`);
} } catch (e) { if (e.code !== "ENOENT") problems.push(`memory/sessions: ${e.message}`); }
// library/objects/<contract>/<version>.json: the id matches the path, and the parts every Object needs are there.
// (The full check, 2D symbol and 3D primitive agreeing at every parameter case, runs in the app: Library page, checkObject.)
const ROLES = ["furniture", "fixture", "column", "beam", "footing", "stair", "railing", "panel", "fin", "louvre", "frame", "profile", "entourage", "vegetation", "vehicle", "site", "equipment", "generic"];
const objDir = join(root, "library", "objects");
try { for (const c of readdirSync(objDir)) { if (c === ".gitkeep") continue; const cd = join(objDir, c);
  if (!statSync(cd).isDirectory()) { problems.push(`library/objects/${c}: Objects live in a folder per contract`); continue; }
  for (const v of readdirSync(cd)) { const rel = `library/objects/${c}/${v}`;
    if (!/^\d+\.\d+\.\d+\.json$/.test(v)) { problems.push(`${rel}: name each version like 1.0.0.json`); continue; }
    let o; try { o = JSON.parse(readFileSync(join(cd, v), "utf8")); } catch { continue; } // reported above
    if (o.id !== `${c}@${v.slice(0, -5)}`) problems.push(`${rel}: id must be ${c}@${v.slice(0, -5)}`);
    if (o.contract !== c) problems.push(`${rel}: contract must be ${c}`);
    if (!o.name) problems.push(`${rel}: name is missing`);
    if (!ROLES.includes(o.role)) problems.push(`${rel}: role must be one of ${ROLES.join(", ")}`);
    for (const k of ["symbol2d", "primitive3d"]) if (!Array.isArray(o[k]) || !o[k].length) problems.push(`${rel}: ${k} is missing`);
    if (o.params && typeof o.params !== "object") problems.push(`${rel}: params must be an object of defaults`);
  } } } catch (e) { if (e.code !== "ENOENT") problems.push(`library/objects: ${e.message}`); }
// library/proposals/<contract>@<version>.json: records the app commits when the owner proposes a Project Object; the
// library-proposals Action turns each into a pull request that adds it to library/objects/ and removes the record.
const propDir = join(root, "library", "proposals");
try { for (const n of readdirSync(propDir)) { if (n === ".gitkeep") continue; const rel = `library/proposals/${n}`, m = /^([a-z]+(?:\.[a-z0-9-]+)+)@(\d+\.\d+\.\d+)\.json$/.exec(n);
  if (!m) { problems.push(`${rel}: name a proposal <contract>@<version>.json, e.g. fixture.wc@1.0.0.json`); continue; }
  let r; try { r = JSON.parse(readFileSync(join(propDir, n), "utf8")); } catch { continue; } // reported above
  const o = r && r.object; if (!o) { problems.push(`${rel}: no object`); continue; }
  if (o.id !== `${m[1]}@${m[2]}`) problems.push(`${rel}: object.id must be ${m[1]}@${m[2]}`);
  if (o.contract !== m[1]) problems.push(`${rel}: object.contract must be ${m[1]}`);
  if (m[1].startsWith("project.")) problems.push(`${rel}: a Library name can't start with project.`);
  if (!ROLES.includes(o.role)) problems.push(`${rel}: object.role must be one of ${ROLES.join(", ")}`);
} } catch (e) { if (e.code !== "ENOENT") problems.push(`library/proposals: ${e.message}`); }
// pipelines/<id>/<version>.json: the id matches the path; stages name an agent in agents/ and checks in checks/definitions/;
// decisions use a form the app knows. (What each check does is code in the app: managers/pipelines/checks.js.)
const readDir = (rel) => { try { return readdirSync(join(root, rel)).filter((n) => n.endsWith(".json")); } catch { return []; } };
const agents = new Set(readDir("agents").map((n) => n.slice(0, -5))), checks = new Set(readDir("checks/definitions").map((n) => n.slice(0, -5)));
for (const n of readDir("agents")) { try { const a = JSON.parse(readFileSync(join(root, "agents", n), "utf8"));
  if (a.id !== n.slice(0, -5)) problems.push(`agents/${n}: id must be ${n.slice(0, -5)}`);
  if (!Array.isArray(a.instructions) || !a.instructions.length) problems.push(`agents/${n}: instructions are missing`); } catch { /* reported above */ } }
const FORMS = ["pick-needs", "keep-objects"];
try { for (const p of readdirSync(join(root, "pipelines"))) { const pd = join(root, "pipelines", p); if (!statSync(pd).isDirectory()) continue;
  for (const v of readdirSync(pd)) { const rel = `pipelines/${p}/${v}`;
    if (!/^\d+\.\d+\.\d+\.json$/.test(v)) { problems.push(`${rel}: name each version like 1.0.0.json`); continue; }
    let d; try { d = JSON.parse(readFileSync(join(pd, v), "utf8")); } catch { continue; }
    if (d.id !== `${p}@${v.slice(0, -5)}`) problems.push(`${rel}: id must be ${p}@${v.slice(0, -5)}`);
    if (!d.name) problems.push(`${rel}: name is missing`);
    const steps = Array.isArray(d.steps) ? d.steps : []; if (!steps.some((s) => s.kind === "stage")) problems.push(`${rel}: needs at least one stage`);
    const ids = new Set(); for (const s of steps) { if (ids.has(s.id)) problems.push(`${rel}: step id ${s.id} is used twice`); ids.add(s.id);
      if (s.kind === "stage") { if (!s.outcome) problems.push(`${rel}: stage ${s.id} has no outcome`); if (!agents.has(s.agent)) problems.push(`${rel}: stage ${s.id} names agent ${s.agent}, which is not in agents/`);
        if (!Array.isArray(s.checks) || !s.checks.length) problems.push(`${rel}: stage ${s.id} has no checks`); for (const c of s.checks || []) if (!checks.has(c)) problems.push(`${rel}: stage ${s.id} names check ${c}, which is not in checks/definitions/`); }
      else if (s.kind === "decision") { if (!FORMS.includes(s.form)) problems.push(`${rel}: decision ${s.id} must use a form the app knows: ${FORMS.join(", ")}`); if (!s.question) problems.push(`${rel}: decision ${s.id} has no question`); }
      else problems.push(`${rel}: step ${s.id} must be a stage or a decision`); }
  } } } catch (e) { if (e.code !== "ENOENT") problems.push(`pipelines: ${e.message}`); }
for (const p of problems) console.log("FAIL", p);
console.log(`content: ${problems.length} problem${problems.length === 1 ? "" : "s"}`); process.exit(problems.length ? 1 : 0);
