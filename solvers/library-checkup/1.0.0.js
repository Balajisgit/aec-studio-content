// solvers/library-checkup 1.0.0 (R116 step 4b): the Library check-up as a script in the content, in place of the app's own
// code stage. In: every Library Object with the findings of the Library check and the checks for sense (read
// library-checks: the app runs those checks; this script decides what to report). Out: a report, a row per Object (the
// ones to look at first) and a finding for each Object with something to look at. It changes nothing.

function solve(input) {
  const all = Array.isArray(input.library) ? input.library : [];
  const rows = all.map((o) => ({ object: o.name || o.id, id: o.id, kind: o.kind || "", sound: o.findings.length ? "no" : "yes", "to look at": o.findings.join(" ") }))
    .sort((a, b) => (a.sound === b.sound ? String(a.object).localeCompare(String(b.object)) : a.sound === "no" ? -1 : 1));
  const bad = all.filter((o) => o.findings.length);
  const findings = bad.map((o) => ({ message: `${o.name || o.id}: ${o.findings.slice(0, 3).join(" ")}${o.findings.length > 3 ? ` (and ${o.findings.length - 3} more)` : ""}`, severity: o.readable === false ? "error" : "warning" }));
  const note = !all.length ? "The Library is empty." : bad.length ? `${all.length} Objects looked over: ${bad.length} to look at (${bad.slice(0, 6).map((o) => o.name || o.id).join(", ")}${bad.length > 6 ? "…" : ""}).` : `${all.length} Objects looked over: all sound.`;
  return { note, rows, findings };
}
