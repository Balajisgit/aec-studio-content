// .github/scripts/settings-requests.mjs — run by .github/workflows/settings-requests.yml.
//   open            for every record in requests/settings/ on main without a branch yet: a branch settings/<path> that sets
//                   the value in settings.json and removes the record, a pull request for the owner, and the content checks.
//   closed <branch> a request's pull request was closed without merging: remove its record from main and delete the branch.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { SETTINGS, settingProblem } from "../../checks/settings.mjs";

const run = (cmd, ...a) => execFileSync(cmd, a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const git = (...a) => run("git", ...a), tryGit = (...a) => { try { return git(...a); } catch { return null; } };
const gh = (...a) => run(process.env.GH_BIN || "gh", ...a);
const DIR = "requests/settings";
git("config", "user.name", "github-actions[bot]"); git("config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com");

/** settings.json with one value set (two-space JSON). @param {string} path @param {any} value */
function withValue(path, value) {
  const s = JSON.parse(readFileSync("settings.json", "utf8")), keys = path.split("."); let o = s;
  for (const k of keys.slice(0, -1)) o = o[k] = o[k] && typeof o[k] === "object" ? o[k] : {};
  o[keys[keys.length - 1]] = value; return JSON.stringify(s, null, 2) + "\n";
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === "open") {
  const files = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith(".json")).sort() : []; let opened = 0, failed = 0;
  for (const file of files) {
    let rec = null; try { rec = JSON.parse(readFileSync(join(DIR, file), "utf8")); } catch (e) { console.log(`::error file=${DIR}/${file}::not valid JSON (${e.message})`); failed++; continue; }
    const path = file.slice(0, -5), bad = rec.path !== path ? `path must be ${path}` : settingProblem(path, rec.to);
    if (bad) { console.log(`::error file=${DIR}/${file}::${bad}`); failed++; continue; }
    const branch = `settings/${path}`;
    if (tryGit("ls-remote", "--exit-code", "--heads", "origin", branch) !== null) { console.log(`${path}: its pull request is already open (branch ${branch}).`); continue; }
    git("checkout", "-q", "-B", branch, "origin/main");
    const before = JSON.parse(readFileSync("settings.json", "utf8")), from = path.split(".").reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), before);
    writeFileSync("settings.json", withValue(path, rec.to)); git("rm", "-q", join(DIR, file)); git("add", "settings.json");
    git("commit", "-q", "-m", `Settings: ${path} ${from === undefined ? "set to" : `${from} →`} ${rec.to}`);
    git("push", "-q", "origin", `HEAD:refs/heads/${branch}`);
    const s = SETTINGS[path], meaning = s.options ? s.options[rec.to] : "";
    const body = [`Asked from AEC Studio: **${s.about}** (\`${path}\` in settings.json)`, "", `From \`${from === undefined ? "not set" : from}\` to \`${rec.to}\`.${meaning ? ` ${meaning}.` : ""}`, "",
      "Merge to change it on both PCs (the app follows main by itself); close to keep it as it is (the request is then removed)."].join("\n");
    const url = gh("pr", "create", "--base", "main", "--head", branch, "--title", `Settings: ${s.about.toLowerCase()} → ${rec.to}`, "--body", body);
    try { gh("workflow", "run", "checks.yml", "--ref", branch); } catch (e) { console.log(`::warning::Could not start the checks on ${branch}: ${e.message}`); }
    console.log(`${path}: ${url}`); opened++;
    git("checkout", "-q", "main"); git("reset", "-q", "--hard", "origin/main");
  }
  console.log(`settings requests: ${opened} opened, ${failed} with problems, ${files.length} on main`); process.exit(failed ? 1 : 0);
} else if (cmd === "closed") {
  const m = /^settings\/([a-z.]+)$/.exec(arg || ""); if (!m) { console.log(`${arg}: not a settings request branch`); process.exit(0); }
  const file = join(DIR, `${m[1]}.json`);
  if (existsSync(file)) { rmSync(file); git("add", "-A", DIR); git("commit", "-q", "-m", `Settings: the change to ${m[1]} was not merged; its request is removed`); git("push", "-q", "origin", "HEAD:main"); console.log(`${m[1]}: request removed from main.`); }
  else console.log(`${m[1]}: no request on main.`);
  tryGit("push", "-q", "origin", "--delete", arg);
} else { console.log("usage: settings-requests.mjs open | closed <branch>"); process.exit(2); }
