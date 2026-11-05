// checks/validate.js — the content repository's automatic check: every JSON file parses, settings.json has the right shape,
// and nothing sits outside the agreed layout. Run on every pull request; run by hand with: node checks/validate.js
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { settingProblem } from "./settings.mjs";

const root = join(fileURLToPath(import.meta.url), "..", ".."), problems = [];
const TOP = new Set(["pipelines", "agents", "skills", "checks", "solvers", "panels", "library", "canvases", "memory", "lessons", "requests", "settings.json", "README.md", "package.json", ".github", ".gitkeep"]);
for (const n of readdirSync(root)) if (!n.startsWith(".git") && !TOP.has(n)) problems.push(`${n}: not part of the content layout (see README.md)`);
const walk = (d) => { for (const n of readdirSync(d)) { if (n === ".git" || n === "node_modules") continue; const f = join(d, n); if (statSync(f).isDirectory()) walk(f); else if (n.endsWith(".json")) {
  try { JSON.parse(readFileSync(f, "utf8")); } catch (e) { problems.push(`${relative(root, f).split(sep).join("/")}: not valid JSON (${e.message})`); } } } };
walk(root);
try { const s = JSON.parse(readFileSync(join(root, "settings.json"), "utf8")); const m = s.models || {};
  for (const k of ["quick", "default", "complex"]) if (typeof m[k] !== "string" || !m[k]) problems.push(`settings.json: models.${k} must be a model name`);
  const lr = (s.library || {}).review; if (lr !== undefined && settingProblem("library.review", lr)) problems.push(`settings.json: ${settingProblem("library.review", lr)}`);
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
// library/origins/<contract>/<version>.json: where an Object came from; its id matches the path and the Object is there.
const VIA = ["project", "pipeline", "starter"], MADE = ["chat", "pipeline", "owner"];
try { for (const c of readdirSync(join(root, "library", "origins"))) { const cd = join(root, "library", "origins", c);
  if (!statSync(cd).isDirectory()) { problems.push(`library/origins/${c}: origins live in a folder per contract`); continue; }
  for (const v of readdirSync(cd)) { const rel = `library/origins/${c}/${v}`, ver = v.replace(/\.json$/, "");
    let o; try { o = JSON.parse(readFileSync(join(cd, v), "utf8")); } catch { continue; }
    if (o.id !== `${c}@${ver}`) problems.push(`${rel}: id must be ${c}@${ver}`);
    if (!existsSync(join(root, "library", "objects", c, v))) problems.push(`${rel}: there is no Object library/objects/${c}/${v}`);
    if (!VIA.includes(o.via)) problems.push(`${rel}: via must be ${VIA.join(", ")}`);
    if (o.made !== undefined && !MADE.includes(o.made)) problems.push(`${rel}: made must be ${MADE.join(", ")}`);
    if (o.via === "pipeline" && !o.pipeline) problems.push(`${rel}: a pipeline origin names the pipeline`);
  } } } catch (e) { if (e.code !== "ENOENT") problems.push(`library/origins: ${e.message}`); }
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
// requests/settings/<path>.json: requests the app commits when the owner asks for a setting to change; the settings-requests
// Action turns each into a pull request that changes settings.json and removes the record.
try { for (const n of readdirSync(join(root, "requests", "settings"))) { if (n === ".gitkeep") continue; const rel = `requests/settings/${n}`;
  if (!n.endsWith(".json")) { problems.push(`${rel}: requests are JSON files named after the setting, e.g. library.review.json`); continue; }
  let r; try { r = JSON.parse(readFileSync(join(root, "requests", "settings", n), "utf8")); } catch { continue; } // reported above
  const path = n.slice(0, -5); if (r.path !== path) problems.push(`${rel}: path must be ${path}`); else { const bad = settingProblem(path, r.to); if (bad) problems.push(`${rel}: ${bad}`); }
} } catch (e) { if (e.code !== "ENOENT") problems.push(`requests/settings: ${e.message}`); }
// requests/R<4 digits>.md: the owner's requests (the app's managers/memory/requests.js writes them): front matter with number
// (matching the name), title, kind, state and created; a request in a pull request names it. Files added to one: requests/files/R<n>/.
const KINDS = ["app", "pipeline", "library", "setting", "bug", "other"], STATES = ["open", "planned", "in-pr", "done", "declined"];
for (const n of (() => { try { return readdirSync(join(root, "requests")); } catch { return []; } })()) { if (!/^R\d{4}\.md$/.test(n)) continue; const rel = `requests/${n}`;
  const t = readFileSync(join(root, "requests", n), "utf8").replace(/\r\n/g, "\n"), fm = /^---\n([\s\S]*?)\n---\n/.exec(t); if (!fm) { problems.push(`${rel}: no front matter`); continue; }
  const m = Object.fromEntries(fm[1].split("\n").map((l) => /^([a-z]+):\s*(.*)$/.exec(l)).filter(Boolean).map((x) => [x[1], x[2].trim()]));
  if (Number(m.number) !== Number(n.slice(1, 5))) problems.push(`${rel}: number ${m.number} does not match the file name`);
  if (!m.title || m.title.length > 200) problems.push(`${rel}: title is missing or longer than 200 characters`);
  if (!KINDS.includes(m.kind)) problems.push(`${rel}: kind must be ${KINDS.join(", ")}`);
  if (!STATES.includes(m.state)) problems.push(`${rel}: state must be ${STATES.join(", ")}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(m.created || "")) problems.push(`${rel}: created must be a date, YYYY-MM-DD`);
  if (m.state === "in-pr" && !/^(aec-studio|aec-studio-content)#\d+$/.test(m.pr || "")) problems.push(`${rel}: a request in a pull request names it, like aec-studio#21`);
  for (const f of (m.files || "").split(",").map((x) => x.trim()).filter(Boolean)) if (!existsSync(join(root, "requests", "files", n.slice(0, 5), f))) problems.push(`${rel}: its file ${f} is not in requests/files/${n.slice(0, 5)}/`);
}
for (const n of (() => { try { return readdirSync(join(root, "requests")); } catch { return []; } })()) if (n !== "settings" && n !== "files" && n !== ".gitkeep" && !/^R\d{4}\.md$/.test(n)) problems.push(`requests/${n}: only settings requests (requests/settings/), the owner's requests (requests/R<4 digits>.md) and their files (requests/files/) live here`);
// pipelines/<id>/<version>.json (what each stage's agent sees is its "context": source names the app knows): the id matches the path; scopes (where it runs) are project, library or studio, and a step
// may run in only some of them; stages name
// an agent in agents/ or a code stage, and checks in checks/definitions/; decisions use a form the app knows; "when" names a
// condition. (What checks, code stages and conditions do is code in the app: managers/pipelines/checks.js and steps.js.)
const readDir = (rel) => { try { return readdirSync(join(root, rel)).filter((n) => n.endsWith(".json")); } catch { return []; } };
const agents = new Set(readDir("agents").map((n) => n.slice(0, -5))), checks = new Set(readDir("checks/definitions").map((n) => n.slice(0, -5)));
for (const n of readDir("agents")) { try { const a = JSON.parse(readFileSync(join(root, "agents", n), "utf8"));
  if (a.id !== n.slice(0, -5)) problems.push(`agents/${n}: id must be ${n.slice(0, -5)}`);
  if (!Array.isArray(a.instructions) || !a.instructions.length) problems.push(`agents/${n}: instructions are missing`); } catch { /* reported above */ } }
const FORMS = ["pick-needs", "keep-objects", "send-proposal", "propose-objects"], SCOPES = ["project", "library", "studio"];
try { for (const p of readdirSync(join(root, "pipelines"))) { const pd = join(root, "pipelines", p); if (!statSync(pd).isDirectory()) continue;
  for (const v of readdirSync(pd)) { const rel = `pipelines/${p}/${v}`;
    if (!/^\d+\.\d+\.\d+\.json$/.test(v)) { problems.push(`${rel}: name each version like 1.0.0.json`); continue; }
    let d; try { d = JSON.parse(readFileSync(join(pd, v), "utf8")); } catch { continue; }
    if (d.id !== `${p}@${v.slice(0, -5)}`) problems.push(`${rel}: id must be ${p}@${v.slice(0, -5)}`);
    if (!d.name) problems.push(`${rel}: name is missing`);
    if (d.useWhen !== undefined && (typeof d.useWhen !== "string" || d.useWhen.length > 400)) problems.push(`${rel}: useWhen is one sentence (at most 400 characters): when the chat should offer this pipeline`);
    if (d.scopes !== undefined && (!Array.isArray(d.scopes) || !d.scopes.length || d.scopes.some((x) => !SCOPES.includes(x)))) problems.push(`${rel}: scopes must be a list of ${SCOPES.join(", ")}`);
    const steps = Array.isArray(d.steps) ? d.steps : []; if (!steps.some((s) => s.kind === "stage")) problems.push(`${rel}: needs at least one stage`);
    const ids = new Set(); for (const s of steps) { if (ids.has(s.id)) problems.push(`${rel}: step id ${s.id} is used twice`); ids.add(s.id);
      if (s.when !== undefined && !/^[a-z][a-z0-9-]*$/.test(String(s.when))) problems.push(`${rel}: step ${s.id}: when names a condition, like review-wanted`);
      if (s.context !== undefined && (!Array.isArray(s.context) || !s.context.length || s.context.some((c) => !/^[a-z][a-z0-9-]*$/.test(String(c))))) problems.push(`${rel}: step ${s.id}: context is a list of source names, like ["brief", "run-so-far"]`);
      if (s.contextLimit !== undefined && !(Number.isInteger(s.contextLimit) && s.contextLimit >= 1000 && s.contextLimit <= 150000)) problems.push(`${rel}: step ${s.id}: contextLimit is tokens, 1000 to 150000`);
      const scopes = Array.isArray(d.scopes) && d.scopes.length ? d.scopes : ["project"];
      if (s.scopes !== undefined && (!Array.isArray(s.scopes) || !s.scopes.length || s.scopes.some((x) => !scopes.includes(x)))) problems.push(`${rel}: step ${s.id}: its scopes must be some of the pipeline's (${scopes.join(", ")})`);
      if (s.kind === "stage") { if (!s.outcome) problems.push(`${rel}: stage ${s.id} has no outcome`);
        if (s.code !== undefined) { if (!/^[a-z][a-z0-9-]*$/.test(String(s.code))) problems.push(`${rel}: stage ${s.id}: code names a code stage, like prepare-proposal`); if (s.agent !== undefined) problems.push(`${rel}: stage ${s.id}: a code stage has no agent`); }
        else if (!agents.has(s.agent)) problems.push(`${rel}: stage ${s.id} names agent ${s.agent}, which is not in agents/`);
        if (!Array.isArray(s.checks) || !s.checks.length) problems.push(`${rel}: stage ${s.id} has no checks`); for (const c of s.checks || []) if (!checks.has(c)) problems.push(`${rel}: stage ${s.id} names check ${c}, which is not in checks/definitions/`); }
      else if (s.kind === "decision") { if (!FORMS.includes(s.form)) problems.push(`${rel}: decision ${s.id} must use a form the app knows: ${FORMS.join(", ")}`); if (!s.question) problems.push(`${rel}: decision ${s.id} has no question`); }
      else problems.push(`${rel}: step ${s.id} must be a stage or a decision`); }
  } } } catch (e) { if (e.code !== "ENOENT") problems.push(`pipelines: ${e.message}`); }
// lessons/<agent id>.md and lessons/all.md: Markdown, one lesson per line (agents that name the lessons source are given them).
for (const n of (() => { try { return readdirSync(join(root, "lessons")); } catch { return []; } })()) if (n !== ".gitkeep" && n !== "README.md" && !(/^[a-z][a-z0-9-]*\.md$/.test(n) && (n === "all.md" || agents.has(n.slice(0, -3))))) problems.push(`lessons/${n}: lessons are lessons/all.md or lessons/<agent id>.md for an agent in agents/`);
for (const p of problems) console.log("FAIL", p);
console.log(`content: ${problems.length} problem${problems.length === 1 ? "" : "s"}`); process.exit(problems.length ? 1 : 0);
