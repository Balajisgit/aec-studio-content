// checks/validate.js — the content repository's automatic check: every JSON file parses, settings.json has the right shape,
// and nothing sits outside the agreed layout. Run on every pull request; run by hand with: node checks/validate.js
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { settingProblem } from "./settings.mjs";

const root = join(fileURLToPath(import.meta.url), "..", ".."), problems = [];
const TOP = new Set(["pipelines", "agents", "skills", "checks", "solvers", "panels", "library", "canvases", "memory", "lessons", "requests", "docs", "scripts", "semantics", "templates", "settings.json", "README.md", "package.json", ".github", ".gitkeep"]);
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
// library/objects/<contract>/<version>.json: the id matches the path, and the parts every Object needs are there; an Object on
// a segment (R64) names a meaning that exists and the length of line it fits.
// (The full check, 2D symbol and 3D primitive agreeing at every parameter case, runs in the app: Library page, checkObject.)
const ROLES = ["wall", "door", "window", "fence", "gate", "slab", "room", "furniture", "fixture", "column", "beam", "footing", "stair", "railing", "panel", "fin", "louvre", "frame", "profile", "entourage", "vegetation", "vehicle", "site", "equipment", "generic"];
const objDir = join(root, "library", "objects");
try { for (const c of readdirSync(objDir)) { if (c === ".gitkeep") continue; const cd = join(objDir, c);
  if (!statSync(cd).isDirectory()) { problems.push(`library/objects/${c}: Objects live in a folder per contract`); continue; }
  for (const v of readdirSync(cd)) { const rel = `library/objects/${c}/${v}`;
    // R73: an Object version's detail beside it (records of its detailed files, for renders only)
    if (/^\d+\.\d+\.\d+\.detail\.json$/.test(v)) { let dd = null; try { dd = JSON.parse(readFileSync(join(cd, v), "utf8")); } catch { continue; }
      if (!existsSync(join(cd, v.replace(".detail.json", ".json")))) problems.push(`${rel}: a detail sits beside its Object version, and ${v.replace(".detail.json", ".json")} is not there`);
      if (!dd || !Array.isArray(dd.files) || !dd.files.length || dd.files.some((f) => !f || !f.name || !/^[a-f0-9]{64}$/.test(String(f.sha256 || "")) || !["assets", "pc"].includes(f.kept))) problems.push(`${rel}: detail.files lists each detailed file with its name, sha256 and where it is kept (assets or pc)`);
      continue; }
    if (!/^\d+\.\d+\.\d+\.json$/.test(v)) { problems.push(`${rel}: name each version like 1.0.0.json`); continue; }
    let o; try { o = JSON.parse(readFileSync(join(cd, v), "utf8")); } catch { continue; } // reported above
    if (o.id !== `${c}@${v.slice(0, -5)}`) problems.push(`${rel}: id must be ${c}@${v.slice(0, -5)}`);
    if (o.contract !== c) problems.push(`${rel}: contract must be ${c}`);
    if (!o.name) problems.push(`${rel}: name is missing`);
    if (!ROLES.includes(o.role)) problems.push(`${rel}: role must be one of ${ROLES.join(", ")}`);
    for (const k of ["symbol2d", "primitive3d"]) if (!Array.isArray(o[k]) || !o[k].length) problems.push(`${rel}: ${k} is missing`);
    if (o.params && typeof o.params !== "object") problems.push(`${rel}: params must be an object of defaults`);
    // R64: an Object on a segment (a wall, a door) says the meaning it is for (one in library/meanings/) and the stretch of line it fits
    if (o.on != null && !["node", "segment", "face"].includes(o.on)) problems.push(`${rel}: on must be node, segment or face`);
    if (o.on === "face" && o.meaning == null) problems.push(`${rel}: an Object on a face says which meaning it is for (meaning)`);
    if (o.meaning != null && !existsSync(join(root, "library", "meanings", `${o.meaning}.json`))) problems.push(`${rel}: meaning ${o.meaning} is not in library/meanings/`);
    if (o.on === "segment") { const l = o.length || {};
      if (o.meaning == null) problems.push(`${rel}: an Object on a segment says which meaning it is for (meaning)`);
      if (!(Number.isInteger(l.min) && Number.isInteger(l.max) && Number.isInteger(l.default) && 0 < l.min && l.min <= l.default && l.default <= l.max)) problems.push(`${rel}: an Object on a segment needs length {default, min, max} in whole mm`); }
  } } } catch (e) { if (e.code !== "ENOENT") problems.push(`library/objects: ${e.message}`); }
// templates/<id>/<version>.json (R68): house defaults; every Object they name is in the Library, every meaning exists.
try { const td = join(root, "templates");
  for (const id of readdirSync(td)) { const dir = join(td, id); if (id === "default.json") { try { const d = JSON.parse(readFileSync(dir, "utf8")); if (!existsSync(join(td, String(d.template)))) problems.push(`templates/default.json: there is no template ${d.template}`); } catch (e) { problems.push(`templates/default.json: ${e.message}`); } continue; }
    if (!statSync(dir).isDirectory()) { problems.push(`templates/${id}: a template lives in a folder per id`); continue; }
    for (const v of readdirSync(dir)) { const rel = `templates/${id}/${v}`; let t; try { t = JSON.parse(readFileSync(join(dir, v), "utf8")); } catch (e) { problems.push(`${rel}: ${e.message}`); continue; }
      if (t.id !== `${id}@${v.slice(0, -5)}`) problems.push(`${rel}: id must be ${id}@${v.slice(0, -5)}`);
      const refs = [...(t.presets || []), ...((t.rules && t.rules.faces) || [])].map((p) => p.objectRef).concat(Object.values(t.openings || {})).filter(Boolean);
      for (const r of refs) { const [c, ver] = String(r).split("@"); if (!existsSync(join(root, "library", "objects", c, `${ver}.json`))) problems.push(`${rel}: there is no Library Object ${r}`); }
      for (const p of [...(t.presets || []), ...((t.rules && t.rules.faces) || [])]) if (p.role && !existsSync(join(root, "library", "meanings", `${p.role}.json`))) problems.push(`${rel}: there is no meaning ${p.role}`);
      const ids = new Set((t.presets || []).map((p) => p.id)); const L = t.rules && t.rules.lines; if (L) for (const k of ["outer", "inner"]) if (!ids.has(L[k])) problems.push(`${rel}: rules.lines.${k} must name a preset`); } }
} catch (e) { if (e.code !== "ENOENT") problems.push(`templates: ${e.message}`); }
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
const FORMS = ["pick-needs", "keep-objects", "send-proposal", "propose-objects", "pick-candidate", "keep-files", "review-images", "keep-detail"], SCOPES = ["project", "library", "studio"];
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
      if (s.kind === "decision" && s.sendBack !== undefined && !(typeof s.sendBack === "string" && steps.findIndex((x) => x.id === s.sendBack) >= 0 && steps.findIndex((x) => x.id === s.sendBack) < steps.indexOf(s))) problems.push(`${rel}: decision ${s.id}: sendBack names a stage before it, like make`);
      if (s.context !== undefined && (!Array.isArray(s.context) || !s.context.length || s.context.some((c) => !/^[a-z][a-z0-9-]*$/.test(String(c))))) problems.push(`${rel}: step ${s.id}: context is a list of source names, like ["brief", "run-so-far"]`);
      if (s.contextLimit !== undefined && !(Number.isInteger(s.contextLimit) && s.contextLimit >= 1000 && s.contextLimit <= 150000)) problems.push(`${rel}: step ${s.id}: contextLimit is tokens, 1000 to 150000`);
      const scopes = Array.isArray(d.scopes) && d.scopes.length ? d.scopes : ["project"];
      if (s.scopes !== undefined && (!Array.isArray(s.scopes) || !s.scopes.length || s.scopes.some((x) => !scopes.includes(x)))) problems.push(`${rel}: step ${s.id}: its scopes must be some of the pipeline's (${scopes.join(", ")})`);
      if (s.kind === "stage") { if (!s.outcome) problems.push(`${rel}: stage ${s.id} has no outcome`);
        if (s.solver !== undefined) { const sid = String(s.solver).split("@")[0]; if (!existsSync(join(root, "solvers", sid))) problems.push(`${rel}: stage ${s.id} names solver ${s.solver}, which is not in solvers/`);
          if (s.agent !== undefined || s.code !== undefined) problems.push(`${rel}: stage ${s.id}: a solver stage has no agent or code`); }
        else if (s.code !== undefined) { if (!/^[a-z][a-z0-9-]*$/.test(String(s.code))) problems.push(`${rel}: stage ${s.id}: code names a code stage, like prepare-proposal`); if (s.agent !== undefined) problems.push(`${rel}: stage ${s.id}: a code stage has no agent`); }
        else if (!agents.has(s.agent)) problems.push(`${rel}: stage ${s.id} names agent ${s.agent}, which is not in agents/`);
        // R82: a session stage (session: true) is a full Claude session on the owner's PC; its skills are skills/<name>/SKILL.md
        if (s.session !== undefined && s.session !== true) problems.push(`${rel}: stage ${s.id}: session is true or left out`);
        if (s.skills !== undefined) { if (!s.session) problems.push(`${rel}: stage ${s.id}: skills are for a session stage (session: true)`);
          if (!Array.isArray(s.skills)) problems.push(`${rel}: stage ${s.id}: skills is a list of skill names`); else for (const k of s.skills) if (!existsSync(join(root, "skills", String(k), "SKILL.md"))) problems.push(`${rel}: stage ${s.id} names skill ${k}, which is not in skills/`); }
        if (!Array.isArray(s.checks) || !s.checks.length) problems.push(`${rel}: stage ${s.id} has no checks`); for (const c of s.checks || []) if (!checks.has(c)) problems.push(`${rel}: stage ${s.id} names check ${c}, which is not in checks/definitions/`); }
      else if (s.kind === "decision") { if (!FORMS.includes(s.form)) problems.push(`${rel}: decision ${s.id} must use a form the app knows: ${FORMS.join(", ")}`); if (!s.question) problems.push(`${rel}: decision ${s.id} has no question`); }
      else problems.push(`${rel}: step ${s.id} must be a stage or a decision`); }
  } } } catch (e) { if (e.code !== "ENOENT") problems.push(`pipelines: ${e.message}`); }
// lessons/<agent id>.md and lessons/all.md: Markdown, one lesson per line (agents that name the lessons source are given them).
for (const n of (() => { try { return readdirSync(join(root, "lessons")); } catch { return []; } })()) if (n !== ".gitkeep" && n !== "README.md" && !(/^[a-z][a-z0-9-]*\.md$/.test(n) && (n === "all.md" || agents.has(n.slice(0, -3))))) problems.push(`lessons/${n}: lessons are lessons/all.md or lessons/<agent id>.md for an agent in agents/`);
// meanings (R63): what a node, a segment or a face can mean. library/meanings/<id>.json holds functions (what it is: a
// wall, a door, a plot), semantics/<id>.json positions (where it is in a face: front, own-setback). Each names its category,
// what it goes on (node, segment, face: a position not a face) and its values.
const PRIMERS = ["node", "segment", "face"], VK = ["mm", "number", "text", "choice", "yes-no"];
for (const [dir, cat] of [["semantics", "position"], ["library/meanings", "function"]]) for (const n of (() => { try { return readdirSync(join(root, dir)); } catch { return []; } })()) {
  const rel = `${dir}/${n}`; if (n === ".gitkeep") continue;
  if (!/^[a-z][a-z0-9-]*\.json$/.test(n)) { problems.push(`${rel}: a meaning is ${dir}/<id>.json`); continue; }
  let r = null; try { r = JSON.parse(readFileSync(join(root, rel), "utf8")); } catch { problems.push(`${rel}: not valid JSON`); continue; }
  if (r.id !== n.replace(/\.json$/, "")) problems.push(`${rel}: id must be ${n.replace(/\.json$/, "")}`);
  if (!String(r.name || "").trim()) problems.push(`${rel}: name is required`);
  if (r.category !== cat) problems.push(`${rel}: ${dir} holds ${cat}s: category must be ${cat}`);
  if (!Array.isArray(r.on) || !r.on.length || r.on.some((x) => !PRIMERS.includes(x))) problems.push(`${rel}: on must list some of ${PRIMERS.join(", ")}`);
  else if (cat === "position" && r.on.includes("face")) problems.push(`${rel}: a position goes on a member of a face (node or segment), not a face`);
  if (r.contract != null && !/^[a-z]+(\.[a-z0-9-]+)+$/.test(String(r.contract))) problems.push(`${rel}: contract must be a Library contract (furniture.chair)`);
  for (const [k, v] of Object.entries(r.values || {})) { if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(k)) problems.push(`${rel}: value ${k}: letters and digits only`);
    if (!v || !VK.includes(v.kind)) problems.push(`${rel}: value ${k}: kind must be ${VK.join(", ")}`); else if (v.kind === "choice" && !(Array.isArray(v.options) && v.options.length)) problems.push(`${rel}: value ${k}: a choice needs options`); } }
// solvers/<id>/<version>.js with its manifest <version>.json (R62 step 3): code that defines solve(input, geo); the manifest says what it reads
for (const id of (() => { try { return readdirSync(join(root, "solvers")); } catch { return []; } })()) { if (id === ".gitkeep") continue;
  if (!/^[a-z0-9-]+$/.test(id)) { problems.push(`solvers/${id}: a solver's folder is its id, lower case with hyphens`); continue; }
  for (const f of readdirSync(join(root, "solvers", id))) { const rel = `solvers/${id}/${f}`, m = /^(\d+\.\d+\.\d+)\.(js|json)$/.exec(f);
    if (!m) { problems.push(`${rel}: a solver is <version>.js with its manifest <version>.json`); continue; }
    const other = join(root, "solvers", id, `${m[1]}.${m[2] === "js" ? "json" : "js"}`); if (!existsSync(other)) problems.push(`${rel}: its ${m[2] === "js" ? "manifest .json" : "code .js"} is missing`);
    if (m[2] === "json") { let j = null; try { j = JSON.parse(readFileSync(join(root, rel), "utf8")); } catch { problems.push(`${rel}: not valid JSON`); continue; }
      if (j.id !== id) problems.push(`${rel}: id must be ${id}`); if (!String(j.name || "").trim() || !String(j.about || "").trim()) problems.push(`${rel}: name and about are required`);
      if (j.roles !== undefined && !(Array.isArray(j.roles) && j.roles.every((r) => /^[a-z][a-z0-9-]*$/.test(r)))) problems.push(`${rel}: roles lists role ids`); }
    else if (!/function solve\s*\(/.test(readFileSync(join(root, rel), "utf8"))) problems.push(`${rel}: it must define function solve(input, geo)`); } }
for (const p of problems) console.log("FAIL", p);
// skills/<name>/SKILL.md (R82): front matter with name (matching the folder) and about; the text a session stage is given
for (const n of (() => { try { return readdirSync(join(root, "skills")); } catch { return []; } })()) { if (n === ".gitkeep" || n === "README.md") continue;
  const f = join(root, "skills", n, "SKILL.md"); if (!/^[a-z][a-z0-9-]*$/.test(n)) { problems.push(`skills/${n}: a skill's folder name is lower case, like blender-detail`); continue; }
  if (!existsSync(f)) { problems.push(`skills/${n}: SKILL.md is missing`); continue; }
  const t = readFileSync(f, "utf8"), fm = /^---\n([\s\S]*?)\n---\n/.exec(t);
  if (!fm || !new RegExp(`^name: ${n}$`, "m").test(fm[1]) || !/^about: \S/m.test(fm[1])) problems.push(`skills/${n}/SKILL.md: front matter needs name: ${n} and about: …`); }
console.log(`content: ${problems.length} problem${problems.length === 1 ? "" : "s"}`); process.exit(problems.length ? 1 : 0);
