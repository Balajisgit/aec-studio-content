// checks/validate.js — the content repository's automatic check: every JSON file parses, settings.json has the right shape,
// and nothing sits outside the agreed layout. Run on every pull request; run by hand with: node checks/validate.js
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { settingProblem } from "./settings.mjs";
import { KINDS as PROPOSAL_KINDS, recordProblems } from "../.github/scripts/proposals.mjs";

const root = join(fileURLToPath(import.meta.url), "..", ".."), problems = [];
const TOP = new Set(["pipelines", "agents", "skills", "checks", "solvers", "panels", "library", "canvases", "memory", "lessons", "requests", "docs", "scripts", "proposals", "settings.json", "README.md", "package.json", ".github", ".gitkeep"]);
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
// a segment (R64) says the length of line it fits. Its role is its kind: what it behaves as (R113: there are no meanings).
// (The full check, 2D symbol and 3D primitive agreeing at every parameter case, runs in the app: Library page, checkObject.)
// What an Object may say it does (R113: the app's kernel knows these behaviours and names no kind).
const BEHAVIOURS = ["band", "holds-openings", "opening", "way-through", "stops-bands", "cuts-floor-above"], WORD = /^[a-z][a-z0-9-]*$/;
const objDir = join(root, "library", "objects");
try { for (const c of readdirSync(objDir)) { if (c === ".gitkeep") continue; const cd = join(objDir, c);
  if (!statSync(cd).isDirectory()) { problems.push(`library/objects/${c}: Objects live in a folder per contract`); continue; }
  for (const v of readdirSync(cd)) { const rel = `library/objects/${c}/${v}`;
    // R73: an Object version's detail beside it (records of its detailed files, for renders only)
    if (/^\d+\.\d+\.\d+\.detail\.json$/.test(v)) { let dd = null; try { dd = JSON.parse(readFileSync(join(cd, v), "utf8")); } catch { continue; }
      if (!existsSync(join(cd, v.replace(".detail.json", ".json")))) problems.push(`${rel}: a detail sits beside its Object version, and ${v.replace(".detail.json", ".json")} is not there`);
      if (!dd || !Array.isArray(dd.files) || !dd.files.length || dd.files.some((f) => !f || !f.name || !/^[a-f0-9]{64}$/.test(String(f.sha256 || "")) || !["assets", "pc"].includes(f.kept))) problems.push(`${rel}: detail.files lists each detailed file with its name, sha256 and where it is kept (assets or pc)`);
      continue; }
    if (v === "catalogue.json") continue; // its catalogue card (R114), checked below
    if (!/^\d+\.\d+\.\d+\.json$/.test(v)) { problems.push(`${rel}: name each version like 1.0.0.json`); continue; }
    let o; try { o = JSON.parse(readFileSync(join(cd, v), "utf8")); } catch { continue; } // reported above
    if (o.id !== `${c}@${v.slice(0, -5)}`) problems.push(`${rel}: id must be ${c}@${v.slice(0, -5)}`);
    if (o.contract !== c) problems.push(`${rel}: contract must be ${c}`);
    if (!o.name) problems.push(`${rel}: name is missing`);
    if (!WORD.test(String(o.kind || ""))) problems.push(`${rel}: kind is its word, lower case with hyphens (wall, sliding-door, sofa)`);
    if (o.role !== undefined || o.meaning !== undefined) problems.push(`${rel}: role and meaning are gone (R113): it says its kind and what it does (behaves)`);
    if (!Array.isArray(o.behaves) || o.behaves.some((b) => !BEHAVIOURS.includes(b))) problems.push(`${rel}: behaves lists what it does, from ${BEHAVIOURS.join(", ")} ([] for none)`);
    else { const on = o.on || "node", has = (b) => o.behaves.includes(b);
      if ((has("band") || has("holds-openings") || has("opening")) && on !== "segment") problems.push(`${rel}: band, holds-openings and opening are for an Object on a line (on: segment)`);
      if ((has("stops-bands") || has("cuts-floor-above")) && on !== "node") problems.push(`${rel}: stops-bands and cuts-floor-above are for an Object at a point`);
      if (has("way-through") && !has("opening")) problems.push(`${rel}: way-through is for an opening`); }
    for (const k of ["symbol2d", "primitive3d"]) if (!Array.isArray(o[k]) || !o[k].length) problems.push(`${rel}: ${k} is missing`);
    if (o.params && typeof o.params !== "object") problems.push(`${rel}: params must be an object of defaults`);
    // R64: an Object on a segment (a wall, a door) says the stretch of line it fits; on a face: it goes on a ring of lines (a slab, a floor)
    if (o.on != null && !["node", "segment", "face"].includes(o.on)) problems.push(`${rel}: on must be node, segment or face`);
    if (o.on === "segment") { const l = o.length || {};
      if (!(Number.isInteger(l.min) && Number.isInteger(l.max) && Number.isInteger(l.default) && 0 < l.min && l.min <= l.default && l.default <= l.max)) problems.push(`${rel}: an Object on a segment needs length {default, min, max} in whole mm`); }
  } } } catch (e) { if (e.code !== "ENOENT") problems.push(`library/objects: ${e.message}`); }
// library/templates/<id>/<version>.json (R68; in the Library since R114): house defaults; every Object they name is in the Library, every preset says its kind.
try { const td = join(root, "library", "templates");
  for (const id of readdirSync(td)) { const dir = join(td, id);
    if (id === "proposals") { // records the app commits (R77); the template-proposals Action turns each into a pull request
      for (const n of readdirSync(dir)) { if (n === ".gitkeep") continue; const rel = `library/templates/proposals/${n}`, m = /^(?:([a-z][a-z0-9-]*)@(\d+\.\d+\.\d+)|default-([a-z][a-z0-9-]*))\.json$/.exec(n);
        if (!m) { problems.push(`${rel}: name it <id>@<version>.json or default-<id>.json`); continue; } let r; try { r = JSON.parse(readFileSync(join(dir, n), "utf8")); } catch (e) { problems.push(`${rel}: ${e.message}`); continue; }
        if (m[1] && (!r.template || r.template.id !== `${m[1]}@${m[2]}`)) problems.push(`${rel}: template.id must be ${m[1]}@${m[2]}`);
        if (m[3] && r.default !== m[3]) problems.push(`${rel}: default must be ${m[3]}`); }
      continue; }
    if (id === "default.json") { try { const d = JSON.parse(readFileSync(dir, "utf8")); if (!existsSync(join(td, String(d.template)))) problems.push(`library/templates/default.json: there is no template ${d.template}`); } catch (e) { problems.push(`library/templates/default.json: ${e.message}`); } continue; }
    if (id === "checks.json") { try { const c = JSON.parse(readFileSync(dir, "utf8")); for (const [k, r] of (Array.isArray(c.checks) ? c.checks : []).entries()) if (!r || !r.id || (!r.off && (!["room", "pair", "thing", "blocking", "ratio"].includes(r.of) || typeof r.when !== "string" || typeof r.say !== "string"))) problems.push(`library/templates/checks.json: checks[${k}] needs id, of, when and say (R142)`);
        if (!Array.isArray(c.checks)) problems.push("library/templates/checks.json: checks is a list"); } catch (e) { problems.push(`library/templates/checks.json: ${e.message}`); } continue; } // the checks every project has (R142)
    if (!statSync(dir).isDirectory()) { problems.push(`library/templates/${id}: a template lives in a folder per id`); continue; }
    for (const v of readdirSync(dir)) { const rel = `library/templates/${id}/${v}`; let t; try { t = JSON.parse(readFileSync(join(dir, v), "utf8")); } catch (e) { problems.push(`${rel}: ${e.message}`); continue; }
      if (t.id !== `${id}@${v.slice(0, -5)}`) problems.push(`${rel}: id must be ${id}@${v.slice(0, -5)}`);
      const refs = [...(t.presets || []), ...((t.rules && t.rules.faces) || [])].map((p) => p.objectRef).concat(Object.values(t.openings || {})).filter(Boolean);
      for (const r of refs) { const [c, ver] = String(r).split("@"); if (!existsSync(join(root, "library", "objects", c, `${ver}.json`))) problems.push(`${rel}: there is no Library Object ${r}`); }
      for (const p of [...(t.presets || []), ...((t.rules && t.rules.faces) || [])]) if (!WORD.test(String(p.kind || p.role || ""))) problems.push(`${rel}: a preset says its kind (its Object's word)`);
      // R129: what the typology is measured on: {id, name, of (a formula), unit?, digits?, better?}
      if (t.measures != null) { if (!Array.isArray(t.measures)) problems.push(`${rel}: measures is a list`); else { const seen = new Set();
        for (const [k, m] of t.measures.entries()) { const at = `${rel}: measures[${k}]`;
          if (!m || !/^[a-z][a-z0-9-]*$/.test(String(m.id || ""))) { problems.push(`${at}: id is lower case with hyphens`); continue; } if (seen.has(m.id)) problems.push(`${at}: ${m.id} twice`); seen.add(m.id);
          if (!String(m.name || "").trim()) problems.push(`${at} (${m.id}): it needs a name`);
          if (!String(m.of || "").trim() || !/^[A-Za-z0-9_+\-*\/%().?:<>=!&| ]+$/.test(String(m.of))) problems.push(`${at} (${m.id}): of is a formula of the numbers Projects works out (net, built, seat, people, count_<use>…)`);
          if (m.better != null && !["higher", "lower"].includes(m.better)) problems.push(`${at} (${m.id}): better is higher or lower`);
          if (m.digits != null && !(Number.isInteger(m.digits) && m.digits >= 0 && m.digits <= 3)) problems.push(`${at} (${m.id}): digits is 0 to 3`); } } }
      // a typology's spaces (R100): the uses a room may have, each with an id and a name, its sizes numbers; apart names uses there are
      if (t.spaces != null) { const U = Array.isArray(t.spaces.uses) ? t.spaces.uses : null, seen = new Set(); if (!U || !U.length) problems.push(`${rel}: spaces.uses lists at least one use`);
        for (const u of U || []) { if (!u || !/^[a-z][a-z0-9-]*$/.test(String(u.id || ""))) problems.push(`${rel}: a use's id is lower case, with hyphens (${u && u.id})`); else if (seen.has(u.id)) problems.push(`${rel}: use ${u.id} twice`); else seen.add(u.id);
          if (!u || typeof u.name !== "string" || !u.name.trim()) problems.push(`${rel}: use ${u && u.id} has no name`);
          if (u && u.minArea != null && !(typeof u.minArea === "number" && u.minArea > 0)) problems.push(`${rel}: use ${u.id}: minArea is m², above 0`);
          if (u && u.minSide != null && !(Number.isInteger(u.minSide) && u.minSide > 0)) problems.push(`${rel}: use ${u.id}: minSide is whole mm, above 0`);
          if (u && u.open != null && !["semi", "open"].includes(u.open)) problems.push(`${rel}: use ${u.id}: open is semi or open`);
          if (u && (u.unitArea != null || u.units != null) && typeof u.unit !== "string") problems.push(`${rel}: use ${u.id}: say what it holds (unit) with unitArea or units`); }
        // what rooms hold (R105): the ratios name units some use holds
        { const have = new Set((U || []).map((u) => u && u.unit).filter(Boolean)); for (const q of t.spaces.ratios || []) for (const k of [q.of, q.per]) if (!have.has(k)) problems.push(`${rel}: spaces.ratios: no use holds ${k}`);
          if (t.spaces.headUnit != null && !have.has(t.spaces.headUnit)) problems.push(`${rel}: spaces.headUnit: no use holds ${t.spaces.headUnit}`); }
        for (const p of t.spaces.apart || []) if (!Array.isArray(p) || p.length !== 2 || p.some((x) => !seen.has(x))) problems.push(`${rel}: spaces.apart names two of its uses (${JSON.stringify(p)})`); }
      const ids = new Set((t.presets || []).map((p) => p.id)); const L = t.rules && t.rules.lines; if (L) for (const k of ["outer", "inner"]) if (!ids.has(L[k])) problems.push(`${rel}: rules.lines.${k} must name a preset`); } }
} catch (e) { if (e.code !== "ENOENT") problems.push(`library/templates: ${e.message}`); }
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
// R114: the Library as a catalogue. library/objects/<contract>/catalogue.json is an entry's card (how people find it; not
// versioned: an Object never changes, how it is found may): line, uses (template uses), typology, ifc, keywords.
// library/tree.json is the browse tree: categories by what a thing is for, each listing its products (a contract, or
// {name, line?, choices: [contracts]} shown as one product with choices); unlisted keeps entries out (the generic ones).
// Every entry named is in the Library, and in one place only. The app reads the same rules (managers/library/catalogue.js).
const CARD = ["catalogue", "line", "uses", "typology", "ifc", "keywords"], TYPOLOGIES = ["villa", "workplace"];
const contracts = (() => { try { return readdirSync(objDir).filter((c) => c !== ".gitkeep" && statSync(join(objDir, c)).isDirectory()); } catch { return []; } })();
// R114 step 3: library/layouts/<contract>/<version>.json, several Objects arranged together (Objects only, each at a point):
// {id, name, contract, about?, items: [{object: id@version, at: {x, y}, rotation?, z?, params?}]}; every Object it names is
// in the Library at that version, and stands at a point (not on a line, not an opening). Its card beside it, like an Object's.
const layDir = join(root, "library", "layouts"), layouts = (() => { try { return readdirSync(layDir).filter((c) => statSync(join(layDir, c)).isDirectory()); } catch { return []; } })();
for (const c of layouts) { if (!/^layout\.[a-z0-9-]+$/.test(c)) problems.push(`library/layouts/${c}: a Layout's contract is layout.<name>`);
  for (const v of readdirSync(join(layDir, c))) { const rel = `library/layouts/${c}/${v}`; if (v === "catalogue.json") continue;
    if (!/^\d+\.\d+\.\d+\.json$/.test(v)) { problems.push(`${rel}: name each version like 1.0.0.json`); continue; }
    let L; try { L = JSON.parse(readFileSync(join(layDir, c, v), "utf8")); } catch (e) { problems.push(`${rel}: not valid JSON (${e.message})`); continue; }
    if (L.id !== `${c}@${v.slice(0, -5)}`) problems.push(`${rel}: id must be ${c}@${v.slice(0, -5)}`); if (L.contract !== c) problems.push(`${rel}: contract must be ${c}`);
    if (!String(L.name || "").trim()) problems.push(`${rel}: name is missing`);
    if (!Array.isArray(L.items) || !L.items.length) { problems.push(`${rel}: items lists the Objects it places`); continue; }
    L.items.forEach((it, k) => { const [oc, ov] = String((it && it.object) || "").split("@"), f = join(objDir, oc || "_", `${ov}.json`);
      if (!oc || !ov || !existsSync(f)) { problems.push(`${rel}: item ${k + 1}: there is no Library Object ${it && it.object}`); return; }
      if (!it.at || !Number.isInteger(it.at.x) || !Number.isInteger(it.at.y)) problems.push(`${rel}: item ${k + 1}: at is {x, y} in whole mm`);
      try { const o = JSON.parse(readFileSync(f, "utf8")); if ((o.on || "node") !== "node" || (o.behaves || []).includes("opening")) problems.push(`${rel}: item ${k + 1}: ${o.name} does not stand at a point; a Layout is Objects at points only`); } catch {} }); } }
const cardOf = (c) => (c.startsWith("layout.") ? `library/layouts/${c}/catalogue.json` : `library/objects/${c}/catalogue.json`);
const useIds = new Set(); try { for (const t of readdirSync(join(root, "library", "templates"))) { const td = join(root, "library", "templates", t); if (!statSync(td).isDirectory() || t === "proposals") continue;
  for (const v of readdirSync(td)) { try { for (const u of (JSON.parse(readFileSync(join(td, v), "utf8")).spaces || {}).uses || []) useIds.add(u.id); } catch {} } } } catch {}
for (const c of [...contracts, ...layouts]) { const rel = cardOf(c); if (!existsSync(join(root, rel))) continue;
  let d; try { d = JSON.parse(readFileSync(join(root, rel), "utf8")); } catch (e) { problems.push(`${rel}: not valid JSON (${e.message})`); continue; }
  if (!d || typeof d !== "object" || Array.isArray(d)) { problems.push(`${rel}: a card is a JSON object`); continue; }
  if (d.catalogue !== 1) problems.push(`${rel}: catalogue must be 1`);
  if (typeof d.line !== "string" || !d.line.trim() || d.line.length > 80) problems.push(`${rel}: line is one line under the name, up to 80 characters`);
  if (d.uses !== undefined && (!Array.isArray(d.uses) || d.uses.some((u) => !WORD.test(String(u))))) problems.push(`${rel}: uses lists template uses by id (living, bedroom, meeting-small)`);
  else for (const u of d.uses || []) if (useIds.size && !useIds.has(u)) problems.push(`${rel}: no template has the use ${u}`);
  if (d.typology !== undefined && (!Array.isArray(d.typology) || d.typology.some((t) => !TYPOLOGIES.includes(t)))) problems.push(`${rel}: typology lists ${TYPOLOGIES.join(" or ")}`);
  if (d.ifc !== undefined && !/^Ifc[A-Z][A-Za-z]+$/.test(String(d.ifc))) problems.push(`${rel}: ifc is an IFC class, like IfcFurniture or IfcDoor`);
  if (d.keywords !== undefined && (!Array.isArray(d.keywords) || d.keywords.some((k) => typeof k !== "string" || !k.trim()))) problems.push(`${rel}: keywords lists words people search with`);
  for (const k of Object.keys(d)) if (!CARD.includes(k)) problems.push(`${rel}: ${k} is not something a card says`); }
if (existsSync(join(root, "library", "tree.json"))) { let t = null; try { t = JSON.parse(readFileSync(join(root, "library", "tree.json"), "utf8")); } catch (e) { problems.push(`library/tree.json: not valid JSON (${e.message})`); }
  if (t) { const seen = new Map(), ids = new Set(), P = (m) => problems.push(`library/tree.json: ${m}`);
    const named = (c, where) => { if (!contracts.includes(c) && !layouts.includes(c)) P(`${where}: there is no Library entry ${c}`); if (seen.has(c)) P(`${c} is in ${seen.get(c)} and ${where}: an entry has one place`); else seen.set(c, where); };
    if (t.catalogue !== 1 || !Array.isArray(t.categories)) P("the tree is {catalogue: 1, categories: [...], unlisted?: [...]}");
    for (const cat of t.categories || []) { if (!cat || !WORD.test(String(cat.id || ""))) { P("each category has an id, lower case with hyphens"); continue; }
      if (cat.id === "more") P("more is kept for what the tree does not place"); if (ids.has(cat.id)) P(`category ${cat.id} is there twice`); ids.add(cat.id);
      if (!String(cat.name || "").trim()) P(`category ${cat.id} has no name`);
      for (const x of Array.isArray(cat.products) ? cat.products : (P(`category ${cat.id} lists its products`), [])) {
        if (typeof x === "string") { named(x, cat.id); continue; }
        if (!x || !String(x.name || "").trim() || !Array.isArray(x.choices) || x.choices.length < 2) { P(`${cat.id}: a product with choices is {name, line?, choices: [two or more contracts]}`); continue; }
        for (const c of x.choices) named(String(c), `${cat.id} (${x.name})`); } }
    for (const c of Array.isArray(t.unlisted) ? t.unlisted : []) named(String(c), "unlisted");
    for (const k of Object.keys(t)) if (!["catalogue", "about", "categories", "unlisted"].includes(k)) P(`${k} is not something the tree says`); } } // an entry the tree does not place shows under More: a new Object proposed from a project needs no change here
const propDir = join(root, "library", "proposals");
try { for (const n of readdirSync(propDir)) { if (n === ".gitkeep") continue; const rel = `library/proposals/${n}`, m = /^([a-z]+(?:\.[a-z0-9-]+)+)@(\d+\.\d+\.\d+)\.json$/.exec(n);
  if (!m) { problems.push(`${rel}: name a proposal <contract>@<version>.json, e.g. fixture.wc@1.0.0.json`); continue; }
  let r; try { r = JSON.parse(readFileSync(join(propDir, n), "utf8")); } catch { continue; } // reported above
  if (r && r.detailOnly) continue; // an Object's detail only (R73): the Action checks it
  if (r && r.layout) { if (r.layout.id !== `${m[1]}@${m[2]}`) problems.push(`${rel}: layout.id must be ${m[1]}@${m[2]}`); if (!m[1].startsWith("layout.")) problems.push(`${rel}: a Layout's Library name starts with layout.`); continue; } // R114 step 3
  const o = r && r.object; if (!o) { problems.push(`${rel}: no object`); continue; }
  if (o.id !== `${m[1]}@${m[2]}`) problems.push(`${rel}: object.id must be ${m[1]}@${m[2]}`);
  if (o.contract !== m[1]) problems.push(`${rel}: object.contract must be ${m[1]}`);
  if (m[1].startsWith("project.")) problems.push(`${rel}: a Library name can't start with project.`);
  if (!WORD.test(String(o.kind || o.role || ""))) problems.push(`${rel}: object.kind is its word (wall, sofa)`);
  if (o.behaves !== undefined && (!Array.isArray(o.behaves) || o.behaves.some((b) => !BEHAVIOURS.includes(b)))) problems.push(`${rel}: object.behaves lists what it does, from ${BEHAVIOURS.join(", ")}`);
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
  // R116 step 3: an agent's know-how is a skill (skill: a name in skills/), or its own instructions
  if (a.skill !== undefined) { if (!(typeof a.skill === "string" && existsSync(join(root, "skills", a.skill, "SKILL.md")))) problems.push(`agents/${n}: skill ${a.skill} is not in skills/`); if (a.instructions !== undefined) problems.push(`agents/${n}: an agent has a skill or instructions, not both`); }
  else if (!Array.isArray(a.instructions) || !a.instructions.length) problems.push(`agents/${n}: instructions (or a skill) are missing`); } catch { /* reported above */ } }
const FORMS = ["pick-needs", "keep-objects", "send-proposal", "propose-objects", "pick-candidate", "keep-files", "review-images", "keep-detail", "confirm"], SCOPES = ["project", "library", "studio"];
try { for (const p of readdirSync(join(root, "pipelines"))) { const pd = join(root, "pipelines", p); if (!statSync(pd).isDirectory()) continue;
  for (const v of readdirSync(pd)) { const rel = `pipelines/${p}/${v}`;
    if (v === "catalogue.json") continue; // its catalogue card (R114), checked below
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
        else if (s.by !== undefined) { // R115: a step Innowa works in the chat with the stage's own tools; instructions say how
          if (s.by !== "innowa") problems.push(`${rel}: stage ${s.id}: by is "innowa" or left out`);
          if (s.agent !== undefined || s.session !== undefined) problems.push(`${rel}: stage ${s.id}: a step by Innowa has no agent and is not a session`);
          if (s.instructions !== undefined && !(Array.isArray(s.instructions) && s.instructions.every((x) => typeof x === "string" && x.trim()))) problems.push(`${rel}: stage ${s.id}: instructions is a list of sentences`); }
        else if (!agents.has(s.agent)) problems.push(`${rel}: stage ${s.id} names agent ${s.agent}, which is not in agents/`);
        else if (s.session !== true) problems.push(`${rel}: stage ${s.id}: an agent no longer works a stage on its own (R116): make it a step by Innowa (by: innowa, with the agent's skill) or a session on a PC (session: true)`);
        // R82: a session stage (session: true) is a full Claude session on the owner's PC; its skills are skills/<name>/SKILL.md
        if (s.session !== undefined && s.session !== true) problems.push(`${rel}: stage ${s.id}: session is true or left out`);
        if (s.skills !== undefined) { if (!s.session && s.by !== "innowa") problems.push(`${rel}: stage ${s.id}: skills are for a step by Innowa or a session stage (session: true)`); // R116 step 3
          if (!Array.isArray(s.skills)) problems.push(`${rel}: stage ${s.id}: skills is a list of skill names`); else for (const k of s.skills) if (!existsSync(join(root, "skills", String(k), "SKILL.md"))) problems.push(`${rel}: stage ${s.id} names skill ${k}, which is not in skills/`); }
        if (!Array.isArray(s.checks) || !s.checks.length) problems.push(`${rel}: stage ${s.id} has no checks`); for (const c of s.checks || []) if (!checks.has(c)) problems.push(`${rel}: stage ${s.id} names check ${c}, which is not in checks/definitions/`); }
      else if (s.kind === "decision") { if (s.places !== undefined && !(s.places === "draft" && s.form === "confirm")) problems.push(`${rel}: decision ${s.id}: places is "draft", on a confirm decision`);
        if (!FORMS.includes(s.form)) problems.push(`${rel}: decision ${s.id} must use a form the app knows: ${FORMS.join(", ")}`); if (!s.question) problems.push(`${rel}: decision ${s.id} has no question`); }
      else problems.push(`${rel}: step ${s.id} must be a stage or a decision`); }
  } } } catch (e) { if (e.code !== "ENOENT") problems.push(`pipelines: ${e.message}`); }
// lessons/<agent id>.md and lessons/all.md: Markdown, one lesson per line (agents that name the lessons source are given them).
for (const n of (() => { try { return readdirSync(join(root, "lessons")); } catch { return []; } })()) if (n !== ".gitkeep" && n !== "README.md" && !(/^[a-z][a-z0-9-]*\.md$/.test(n) && (n === "all.md" || agents.has(n.slice(0, -3)) || existsSync(join(root, "pipelines", n.slice(0, -3)))))) problems.push(`lessons/${n}: lessons are lessons/all.md, lessons/<agent id>.md for an agent in agents/, or lessons/<playbook>.md for a pipeline in pipelines/ (R115)`);
// materials (R92): how a finish is shown in 3D. library/materials/<id>.json, its id a part's slot (wood, metal, glass) or a
// kind (wall, slab, door): {id, name, color: #rrggbb, roughness?, metalness?, opacity? (each 0 to 1), about?}.
for (const n of (() => { try { return readdirSync(join(root, "library", "materials")); } catch { return []; } })()) {
  const rel = `library/materials/${n}`; if (n === ".gitkeep") continue;
  if (!/^[a-z][a-z0-9-]*\.json$/.test(n)) { problems.push(`${rel}: a material is library/materials/<id>.json`); continue; }
  let r = null; try { r = JSON.parse(readFileSync(join(root, rel), "utf8")); } catch { problems.push(`${rel}: not valid JSON`); continue; }
  if (!r || typeof r !== "object" || Array.isArray(r)) { problems.push(`${rel}: a material is a JSON object`); continue; }
  if (r.id !== n.replace(/\.json$/, "")) problems.push(`${rel}: id must be ${n.replace(/\.json$/, "")}`);
  if (!String(r.name || "").trim()) problems.push(`${rel}: name is required`);
  if (!/^#[0-9a-fA-F]{6}$/.test(String(r.color || ""))) problems.push(`${rel}: color must be a hex colour, #rrggbb`);
  for (const k of ["roughness", "metalness", "opacity"]) if (r[k] != null && !(typeof r[k] === "number" && r[k] >= 0 && r[k] <= 1)) problems.push(`${rel}: ${k} must be a number from 0 to 1`);
  if (r.opacity === 0) problems.push(`${rel}: opacity 0 would hide the part`);
  for (const k of Object.keys(r)) if (!["id", "name", "color", "roughness", "metalness", "opacity", "about"].includes(k)) problems.push(`${rel}: ${k} is not something a material says`); }
// solvers/<id>/<version>.js with its manifest <version>.json (R62 step 3): code that defines solve(input, geo); the manifest says what it reads
for (const id of (() => { try { return readdirSync(join(root, "solvers")); } catch { return []; } })()) { if (id === ".gitkeep") continue;
  if (!/^[a-z0-9-]+$/.test(id)) { problems.push(`solvers/${id}: a solver's folder is its id, lower case with hyphens`); continue; }
  for (const f of readdirSync(join(root, "solvers", id))) { const rel = `solvers/${id}/${f}`, m = /^(\d+\.\d+\.\d+)\.(js|json)$/.exec(f);
    if (!m) { problems.push(`${rel}: a solver is <version>.js with its manifest <version>.json`); continue; }
    const other = join(root, "solvers", id, `${m[1]}.${m[2] === "js" ? "json" : "js"}`); if (!existsSync(other)) problems.push(`${rel}: its ${m[2] === "js" ? "manifest .json" : "code .js"} is missing`);
    if (m[2] === "json") { let j = null; try { j = JSON.parse(readFileSync(join(root, rel), "utf8")); } catch { problems.push(`${rel}: not valid JSON`); continue; }
      if (j.id !== id) problems.push(`${rel}: id must be ${id}`); if (!String(j.name || "").trim() || !String(j.about || "").trim()) problems.push(`${rel}: name and about are required`);
      // R116 step 4b: a script says what it gives, where it runs, what it reads and when to use it
      if (j.gives !== undefined && !["candidates", "report", "files"].includes(j.gives)) problems.push(`${rel}: gives is candidates, report or files`);
      if (j.scopes !== undefined && !(Array.isArray(j.scopes) && j.scopes.length && j.scopes.every((x) => ["project", "library", "studio"].includes(x)))) problems.push(`${rel}: scopes lists project, library or studio`);
      if ((j.gives || "candidates") === "candidates" && j.scopes !== undefined && j.scopes.join() !== "project") problems.push(`${rel}: a script that gives candidates works in a project`);
      if (j.reads !== undefined && !(Array.isArray(j.reads) && j.reads.every((x) => ["project", "library", "library-checks", "given"].includes(x)))) problems.push(`${rel}: reads lists project, library, library-checks or given`);
      if (j.useWhen !== undefined && !String(j.useWhen).trim()) problems.push(`${rel}: useWhen, when given, says when to use it`);
      if (j.roles !== undefined && !(Array.isArray(j.roles) && j.roles.every((r) => /^[a-z][a-z0-9-]*$/.test(r)))) problems.push(`${rel}: roles lists role ids`); // a solver for a model before 4.2
      if (j.uses !== undefined && !(Array.isArray(j.uses) && j.uses.every((r) => /^[a-z][a-z0-9-]*$/.test(r)))) problems.push(`${rel}: uses lists the space uses and Placement kinds it reads`); }
    else if (!/function solve\s*\(/.test(readFileSync(join(root, rel), "utf8"))) problems.push(`${rel}: it must define function solve(input, geo)`); } }
for (const p of problems) console.log("FAIL", p);
// skills/<name>/SKILL.md (R82): front matter with name (matching the folder) and about; the text a session stage is given
for (const n of (() => { try { return readdirSync(join(root, "skills")); } catch { return []; } })()) { if (n === ".gitkeep" || n === "README.md") continue;
  const f = join(root, "skills", n, "SKILL.md"); if (!/^[a-z][a-z0-9-]*$/.test(n)) { problems.push(`skills/${n}: a skill's folder name is lower case, like blender-detail`); continue; }
  if (!existsSync(f)) { problems.push(`skills/${n}: SKILL.md is missing`); continue; }
  const t = readFileSync(f, "utf8"), fm = /^---\n([\s\S]*?)\n---\n/.exec(t);
  if (!fm || !new RegExp(`^name: ${n}$`, "m").test(fm[1]) || !/^about: \S/m.test(fm[1])) problems.push(`skills/${n}/SKILL.md: front matter needs name: ${n} and about: …`); }
// proposals/<kind>/<name>@<version>.json (R116 step 4): records the app commits (a playbook, a script, a skill); the proposals
// Action turns each into a pull request that adds its files and removes the record
for (const kind of (() => { try { return readdirSync(join(root, "proposals")); } catch { return []; } })()) { if (kind === ".gitkeep" || kind === "README.md") continue;
  if (!PROPOSAL_KINDS[kind]) { problems.push(`proposals/${kind}: the kinds are ${Object.keys(PROPOSAL_KINDS).join(", ")}`); continue; }
  for (const n of readdirSync(join(root, "proposals", kind))) { if (n === ".gitkeep") continue; let rec = null; try { rec = JSON.parse(readFileSync(join(root, "proposals", kind, n), "utf8")); } catch { continue; } problems.push(...recordProblems(kind, n, rec)); } }
console.log(`content: ${problems.length} problem${problems.length === 1 ? "" : "s"}`); process.exit(problems.length ? 1 : 0);
