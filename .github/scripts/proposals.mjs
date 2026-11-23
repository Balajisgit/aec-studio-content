// .github/scripts/proposals.mjs — run by .github/workflows/proposals.yml (R116 step 4). BuilderPluss Studio commits a record
// proposals/<kind>/<name>@<version>.json to main when the owner saves a plan as a playbook, or Innowa drafts a script or a
// skill with him: {kind, name, version, title, about, useWhen?, files: {path: text}, from}. This turns each into a pull
// request that adds its files and removes the record. Only the owner merges; a pull request closed without merging removes
// its record, so it can be proposed again.
//   open            every record on main without a branch yet: a branch propose/<kind>-<name>-<version>, a pull request.
//   closed <branch> its pull request was closed without merging: remove its record from main and delete the branch.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";

const run = (cmd, ...a) => execFileSync(cmd, a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const git = (...a) => run("git", ...a), tryGit = (...a) => { try { return git(...a); } catch { return null; } };
const gh = (...a) => run(process.env.GH_BIN || "gh", ...a);
const NAME = /^([a-z][a-z0-9-]*)@(\d+\.\d+\.\d+)\.json$/;
/** What each kind may add: the paths its files may have. */
export const KINDS = {
  playbooks: { one: "playbook", paths: (n, v) => [`pipelines/${n}/${v}.json`] },
  scripts: { one: "script", paths: (n, v) => [`solvers/${n}/${v}.json`, `solvers/${n}/${v}.js`] },
  skills: { one: "skill", paths: (n) => [`skills/${n}/SKILL.md`] },
};
/** What is wrong with a record. @param {string} kind @param {string} file @param {any} rec */
export function recordProblems(kind, file, rec) {
  const k = KINDS[kind], m = NAME.exec(file), out = []; if (!k) return [`proposals/${kind}: the kinds are ${Object.keys(KINDS).join(", ")}`];
  if (!m) return [`proposals/${kind}/${file}: name it <name>@<version>.json`];
  if (!rec || rec.name !== m[1] || rec.version !== m[2]) out.push(`proposals/${kind}/${file}: name and version must be ${m[1]} and ${m[2]}`);
  const allowed = k.paths(m[1], m[2]), files = rec && rec.files && typeof rec.files === "object" ? Object.keys(rec.files) : [];
  if (!files.length) out.push(`proposals/${kind}/${file}: files is missing`);
  for (const f of files) { if (!allowed.includes(f)) out.push(`proposals/${kind}/${file}: a ${k.one} adds only ${allowed.join(" and ")}, not ${f}`); else if (typeof rec.files[f] !== "string") out.push(`proposals/${kind}/${file}: ${f} must be text`); }
  if (kind === "scripts" && files.length !== 2) out.push(`proposals/${kind}/${file}: a script is its code and its manifest`);
  return out;
}

/** What the owner reads (often on a phone). */
function body(kind, rec) {
  const k = KINDS[kind], f = rec.from || {}, lines = [`Proposed from BuilderPluss Studio: the ${k.one} **${rec.title || rec.name}** (\`${rec.name}@${rec.version}\`).`, ""];
  if (rec.about) lines.push(rec.about, ""); if (rec.useWhen) lines.push(`**Use when:** ${rec.useWhen}`, "");
  const src = [f.plan ? `from the plan "${f.plan}"` : null, f.run ? `run ${f.run}` : null, f.by ? `by ${f.by}` : null].filter(Boolean); if (src.length) lines.push(`Made ${src.join(", ")}.`);
  if (f.said) lines.push(`In the owner's words: "${f.said}"`); lines.push("", `Adds: ${Object.keys(rec.files).map((x) => `\`${x}\``).join(", ")}.`, "",
    kind === "scripts" ? "A script runs locked down (no files, network or processes); what it gives goes onto a run's draft or into its record, never straight into a project. Merge to add it; close to turn it down (the proposal is then removed)."
      : `Once merged, Innowa can pick it. Merge to add it; close to turn it down (the proposal is then removed).`);
  return lines.join("\n");
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === "open") {
  git("config", "user.name", "github-actions[bot]"); git("config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com");
  let opened = 0, failed = 0, seen = 0;
  for (const kind of Object.keys(KINDS)) { const dir = join("proposals", kind); if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) { seen++;
      let rec; try { rec = JSON.parse(readFileSync(join(dir, file), "utf8")); } catch (e) { console.log(`::error file=${dir}/${file}::not valid JSON (${e.message})`); failed++; continue; }
      const bad = recordProblems(kind, file, rec); if (bad.length) { for (const b of bad) console.log(`::error file=${dir}/${file}::${b}`); failed++; continue; }
      const branch = `propose/${KINDS[kind].one}-${rec.name}-${rec.version}`;
      if (tryGit("ls-remote", "--exit-code", "--heads", "origin", branch) !== null) { console.log(`${file}: its pull request is already open (branch ${branch}).`); continue; }
      // a skill may be a better version of one already there; anything else is added only once
      const there = Object.keys(rec.files).filter((f) => existsSync(f)), changes = kind === "skills" && there.length > 0; if (there.length && !changes) { console.log(`::warning file=${dir}/${file}::${there.join(", ")} is already there; this record can be removed.`); continue; }
      git("checkout", "-q", "-B", branch, "origin/main");
      for (const [f, text] of Object.entries(rec.files)) { mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, text.endsWith("\n") ? text : text + "\n"); }
      git("rm", "-q", join(dir, file)); git("add", ...Object.keys(rec.files));
      const title = `${KINDS[kind].one[0].toUpperCase()}${KINDS[kind].one.slice(1)}: ${changes ? "change" : "add"} ${rec.title || rec.name}${kind === "skills" ? "" : ` (${rec.name}@${rec.version})`}`;
      git("commit", "-q", "-m", title); git("push", "-q", "origin", `HEAD:refs/heads/${branch}`);
      const url = gh("pr", "create", "--base", "main", "--head", branch, "--title", title, "--body", body(kind, rec));
      try { gh("workflow", "run", "checks.yml", "--ref", branch); } catch (e) { console.log(`::warning::Could not start the checks on ${branch}: ${e.message}`); }
      console.log(`${file}: ${url}`); opened++;
      git("checkout", "-q", "main"); git("reset", "-q", "--hard", "origin/main");
    } }
  console.log(`proposals: ${opened} opened, ${failed} with problems, ${seen} on main`); process.exit(failed ? 1 : 0);
} else if (cmd === "closed") {
  const m = /^propose\/(playbook|script|skill)-(.+)-(\d+\.\d+\.\d+)$/.exec(arg || ""); if (!m) { console.log(`${arg}: not a proposal branch`); process.exit(0); }
  git("config", "user.name", "github-actions[bot]"); git("config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com");
  const file = join("proposals", `${m[1]}s`, `${m[2]}@${m[3]}.json`);
  if (existsSync(file)) { rmSync(file); git("add", "-A", "proposals"); git("commit", "-q", "-m", `Proposal ${m[2]}@${m[3]} was not merged; its record is removed`); git("push", "-q", "origin", "HEAD:main"); console.log(`${file}: removed from main.`); }
  else console.log(`${file}: no record on main.`);
  tryGit("push", "-q", "origin", "--delete", arg);
} else if (cmd) { console.log("usage: proposals.mjs open | closed <branch>"); process.exit(2); }
