// .github/scripts/library-proposals.mjs — run by .github/workflows/library-proposals.yml.
//   open            for every record in library/proposals/ on main without a branch yet: a branch library/<contract>-<version>
//                   that adds library/objects/<contract>/<version>.json and removes the record, a pull request for the owner,
//                   and the content checks run on it (pull requests opened by an Action don't start other workflows).
//   closed <branch> a proposal's pull request was closed without merging: remove its record from main and delete the branch.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const run = (cmd, ...a) => execFileSync(cmd, a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const git = (...a) => run("git", ...a), tryGit = (...a) => { try { return git(...a); } catch { return null; } };
const gh = (...a) => run(process.env.GH_BIN || "gh", ...a);
const DIR = "library/proposals", NAME = /^([a-z]+(?:\.[a-z0-9-]+)+)@(\d+\.\d+\.\d+)\.json$/;
const ROLES = ["furniture", "fixture", "column", "beam", "footing", "stair", "railing", "panel", "fin", "louvre", "frame", "profile", "entourage", "vegetation", "vehicle", "site", "equipment", "generic"];
git("config", "user.name", "github-actions[bot]"); git("config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com");

/** What is wrong with a record, if anything. */
function problems(file, rec) {
  const m = NAME.exec(file), o = rec && rec.object, out = [];
  if (!m) return [`${file}: name it <contract>@<version>.json`];
  if (!o || typeof o !== "object") return [`${file}: no object`];
  if (o.id !== `${m[1]}@${m[2]}`) out.push(`${file}: object.id must be ${m[1]}@${m[2]}`);
  if (o.contract !== m[1]) out.push(`${file}: object.contract must be ${m[1]}`);
  if (m[1].startsWith("project.")) out.push(`${file}: a Library name can't start with project.`);
  if (!o.name) out.push(`${file}: object.name is missing`);
  if (!ROLES.includes(o.role)) out.push(`${file}: object.role is not a known role`);
  for (const k of ["symbol2d", "primitive3d"]) if (!Array.isArray(o[k]) || !o[k].length) out.push(`${file}: object.${k} is missing`);
  return out;
}

/** The pull request's description, for the owner (often read on a phone). */
function body(rec) {
  const o = rec.object, p = o.params || {}, lines = [];
  lines.push(`Proposed from AEC Studio: **${o.name}** as \`${o.id}\` (${o.role}).`, "");
  if (o.about) lines.push(o.about, "");
  const dims = ["width", "depth", "height"].filter((k) => typeof p[k] === "number").map((k) => `${k} ${p[k]}`); if (dims.length) lines.push(`Defaults: ${dims.join(", ")} mm.`, "");
  const from = (rec.from && rec.from.projects) || []; if (from.length) lines.push(`Used in: ${from.map((x) => `${x.name} (${x.uses} use${x.uses === 1 ? "" : "s"})`).join(", ")}.`, "");
  if ((rec.notes || []).length) lines.push("**What the app noticed**", ...rec.notes.map((n) => `- ${n}`), "");
  const r = rec.review;
  if (r && r.verdict) lines.push(`**Quick review:** ${r.verdict === "looks-good" ? "looks good" : "look closer"}`, ...(r.concerns || []).map((c) => `- ${c}`), "");
  else if (r && r.skipped) lines.push(`_${r.skipped}_`, "");
  lines.push("It passed the Library check in the app (2D symbol and 3D primitive agree at every parameter setting). Merge to add it to the Library; close to turn it down (the proposal is then removed, and it can be proposed again).");
  return lines.join("\n");
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === "open") {
  const files = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith(".json")).sort() : []; let opened = 0, failed = 0;
  for (const file of files) {
    let rec = null; try { rec = JSON.parse(readFileSync(join(DIR, file), "utf8")); } catch (e) { console.log(`::error file=${DIR}/${file}::not valid JSON (${e.message})`); failed++; continue; }
    const bad = problems(file, rec); if (bad.length) { for (const b of bad) console.log(`::error file=${DIR}/${file}::${b}`); failed++; continue; }
    const [, contract, version] = NAME.exec(file), id = `${contract}@${version}`, branch = `library/${contract}-${version}`, target = `library/objects/${contract}/${version}.json`;
    if (tryGit("ls-remote", "--exit-code", "--heads", "origin", branch) !== null) { console.log(`${id}: its pull request is already open (branch ${branch}).`); continue; }
    if (existsSync(target)) { console.log(`::warning file=${DIR}/${file}::${target} is already in the Library; this record can be removed.`); continue; }
    git("checkout", "-q", "-B", branch, "origin/main");
    mkdirSync(join("library/objects", contract), { recursive: true }); writeFileSync(target, JSON.stringify(rec.object, null, 2) + "\n");
    git("rm", "-q", join(DIR, file)); git("add", target);
    git("commit", "-q", "-m", `Library: add ${rec.object.name} (${id})`);
    git("push", "-q", "origin", `HEAD:refs/heads/${branch}`);
    const url = gh("pr", "create", "--base", "main", "--head", branch, "--title", `Library: add ${rec.object.name} (${id})`, "--body", body(rec));
    try { gh("workflow", "run", "checks.yml", "--ref", branch); } catch (e) { console.log(`::warning::Could not start the checks on ${branch}: ${e.message}`); }
    console.log(`${id}: ${url}`); opened++;
    git("checkout", "-q", "main"); git("reset", "-q", "--hard", "origin/main");
  }
  console.log(`proposals: ${opened} opened, ${failed} with problems, ${files.length} on main`); process.exit(failed ? 1 : 0);
} else if (cmd === "closed") {
  const m = /^library\/(.+)-(\d+\.\d+\.\d+)$/.exec(arg || ""); if (!m) { console.log(`${arg}: not a proposal branch`); process.exit(0); }
  const id = `${m[1]}@${m[2]}`, file = join(DIR, `${id}.json`);
  if (existsSync(file)) { rmSync(file); git("add", "-A", DIR); git("commit", "-q", "-m", `Library: ${id} was not merged; its proposal is removed`); git("push", "-q", "origin", "HEAD:main"); console.log(`${id}: proposal removed from main.`); }
  else console.log(`${id}: no record on main.`);
  tryGit("push", "-q", "origin", "--delete", arg); // so it can be proposed again
} else { console.log("usage: library-proposals.mjs open | closed <branch>"); process.exit(2); }
