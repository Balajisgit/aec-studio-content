// .github/scripts/template-proposals.mjs — run by .github/workflows/template-proposals.yml (R73).
//   open            for every record in templates/proposals/ on main without a branch yet: a branch template/<id>-<version>
//                   that adds templates/<id>/<version>.json (and, when asked, makes it the default in templates/default.json),
//                   or template/default-<id> that only changes the default; the record removed; a pull request for the owner;
//                   the content checks run on it.
//   closed <branch> its pull request was closed without merging: remove its record from main and delete the branch.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const run = (cmd, ...a) => execFileSync(cmd, a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const git = (...a) => run("git", ...a), tryGit = (...a) => { try { return git(...a); } catch { return null; } };
const gh = (...a) => run(process.env.GH_BIN || "gh", ...a);
const DIR = "templates/proposals", NEW = /^([a-z][a-z0-9-]*)@(\d+\.\d+\.\d+)\.json$/, DEF = /^default-([a-z][a-z0-9-]*)\.json$/;
git("config", "user.name", "github-actions[bot]"); git("config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com");

/** What the owner reads (often on a phone): what it is, what each line is built as, and where it came from. */
function body(rec, name) {
  const t = rec.template, lines = [];
  if (t) {
    lines.push(`Proposed from AEC Studio: the template **${t.name}** as \`${t.id}\`${rec.makeDefault ? ", and the default for new projects" : ""}.`, "");
    if (t.about) lines.push(t.about, "");
    for (const p of t.presets || []) lines.push(`- ${p.name}: ${p.objectRef || "a meaning only"}${p.params && p.params.thickness ? `, ${p.params.thickness} mm` : ""}`);
    for (const f of (t.rules && t.rules.faces) || []) lines.push(`- Every area: ${f.role}${f.objectRef ? `, ${f.objectRef}` : ""}`);
    const o = Object.entries(t.openings || {}); if (o.length) lines.push(`- Put in offers first: ${o.map(([k, v]) => `${k} ${v}`).join(", ")}`);
    if (t.levels && t.levels.height) lines.push(`- Floor to floor: ${t.levels.height} mm`);
    lines.push("");
  } else lines.push(`Proposed from AEC Studio: make **${name}** the template new projects start with.`, "");
  const f = rec.from || {}; const src = [f.project ? `the project ${f.project.name}` : null, f.template ? `from ${f.template}` : null, f.by ? `by ${f.by}` : null].filter(Boolean);
  if (src.length) lines.push(`Made ${src.join(", ")}.`, "");
  lines.push("Projects on other templates or versions stay as they are; a project switches when someone chooses it. Merge to add it; close to turn it down (the proposal is then removed).");
  return lines.join("\n");
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === "open") {
  const files = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith(".json")).sort() : []; let opened = 0, failed = 0;
  for (const file of files) {
    let rec; try { rec = JSON.parse(readFileSync(join(DIR, file), "utf8")); } catch (e) { console.log(`::error file=${DIR}/${file}::not valid JSON (${e.message})`); failed++; continue; }
    const n = NEW.exec(file), d = DEF.exec(file); if (!n && !d) { console.log(`::error file=${DIR}/${file}::name it <id>@<version>.json or default-<id>.json`); failed++; continue; }
    const id = n ? n[1] : d[1], branch = n ? `template/${id}-${n[2]}` : `template/default-${id}`, target = n ? `templates/${id}/${n[2]}.json` : null;
    if (n && (!rec.template || rec.template.id !== `${id}@${n[2]}`)) { console.log(`::error file=${DIR}/${file}::template.id must be ${id}@${n[2]}`); failed++; continue; }
    if (tryGit("ls-remote", "--exit-code", "--heads", "origin", branch) !== null) { console.log(`${file}: its pull request is already open (branch ${branch}).`); continue; }
    if (target && existsSync(target)) { console.log(`::warning file=${DIR}/${file}::${target} is already there; this record can be removed.`); continue; }
    if (!n && !existsSync(join("templates", id))) { console.log(`::error file=${DIR}/${file}::there is no template ${id}`); failed++; continue; }
    git("checkout", "-q", "-B", branch, "origin/main");
    const add = [];
    if (target) { mkdirSync(join("templates", id), { recursive: true }); writeFileSync(target, JSON.stringify(rec.template, null, 2) + "\n"); add.push(target); }
    if (rec.makeDefault || !n) { const df = "templates/default.json"; let cur = {}; try { cur = JSON.parse(readFileSync(df, "utf8")); } catch {}
      writeFileSync(df, JSON.stringify({ ...cur, template: id }, null, 2) + "\n"); add.push(df); }
    git("rm", "-q", join(DIR, file)); git("add", ...add);
    const name = rec.template ? rec.template.name : id, title = n ? `Template: add ${name} (${id}@${n[2]})${rec.makeDefault ? " as the default" : ""}` : `Template: make ${id} the default`;
    git("commit", "-q", "-m", title); git("push", "-q", "origin", `HEAD:refs/heads/${branch}`);
    const url = gh("pr", "create", "--base", "main", "--head", branch, "--title", title, "--body", body(rec, id));
    try { gh("workflow", "run", "checks.yml", "--ref", branch); } catch (e) { console.log(`::warning::Could not start the checks on ${branch}: ${e.message}`); }
    console.log(`${file}: ${url}`); opened++;
    git("checkout", "-q", "main"); git("reset", "-q", "--hard", "origin/main");
  }
  console.log(`template proposals: ${opened} opened, ${failed} with problems, ${files.length} on main`); process.exit(failed ? 1 : 0);
} else if (cmd === "closed") {
  const m = /^template\/(?:default-([a-z][a-z0-9-]*)|(.+)-(\d+\.\d+\.\d+))$/.exec(arg || ""); if (!m) { console.log(`${arg}: not a template proposal branch`); process.exit(0); }
  const file = join(DIR, m[1] ? `default-${m[1]}.json` : `${m[2]}@${m[3]}.json`);
  if (existsSync(file)) { rmSync(file); git("add", "-A", DIR); git("commit", "-q", "-m", `Template: ${file} was not merged; its proposal is removed`); git("push", "-q", "origin", "HEAD:main"); console.log(`${file}: removed from main.`); }
  else console.log(`${file}: no record on main.`);
  tryGit("push", "-q", "origin", "--delete", arg);
} else { console.log("usage: template-proposals.mjs open | closed <branch>"); process.exit(2); }
