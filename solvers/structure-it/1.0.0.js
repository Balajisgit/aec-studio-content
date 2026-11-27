// solvers/structure-it 1.0.0 — Structure it (R150): columns for an RCC frame, as layouts to pick from. In: the walls on each
// floor (Placements of kind wall, each on its line), the spaces of each floor (to know an outer wall: it bounds one room, and
// a floor's outline), the points with their ids, and the columns already there. Out: up to three candidates, each placing
// columns (kind column, the project's own Object) at points: an existing point where there is one, else a new point (on a
// wall's line it splits the line there). Nothing is changed until the owner picks one; the columns are then his, set by
// hand. Method, on each floor: a column where walls meet and turn or branch; then along each straight run of wall between two
// columns, more at even steps so no span is longer than the longest asked. The layouts: every wall (A), the outer walls only
// (B), every wall with spans up to half as long again (C, when it differs from A). Columns stack: from the top floor down,
// a floor keeps every column above it that stands within its outline, so each one comes down to the ground.

function solve(input, geo) {
  const S = input.settings || {}, maxSpan = Math.max(2000, Number(S.maxSpan) || 4500), W = Number(S.width) || 300, D = Number(S.depth) || 230;
  const uses = new Map((((input.project || {}).spaces || {}).uses || []).map((u) => [u.id, u]));
  const notRoom = (f) => !f.use || ["plot", "footprint", "void"].includes(f.use) || (uses.get(f.use) && uses.get(f.use).room === false);
  const levels = [...(input.levels || [])].sort((a, b) => (a.elevation || 0) - (b.elevation || 0));
  const key = (p) => `${Math.round(p.x)},${Math.round(p.y)}`, near = (p, q, t = 5) => Math.hypot(p.x - q.x, p.y - q.y) <= t;
  const walls = (input.placements || []).filter((p) => p.kind === "wall" && p.where && p.where.segment && p.where.a && p.where.b && !p.where.arc);
  if (!walls.length) return { candidates: [], note: "There are no walls yet: draw the plan first (walls on every floor), then structure it." };
  const columnsThere = (input.placements || []).filter((p) => p.kind === "column" && p.where && p.where.node);
  const taken = new Set((input.placements || []).filter((p) => p.where && p.where.node).map((p) => p.where.node));

  /** One floor: its walls, which are outer, its outline(s). */
  const floorOf = (lv) => {
    const ws = walls.filter((w) => w.where.level === lv.id), spaces = (input.spaces || []).filter((f) => f.level === lv.id && !notRoom(f));
    const on = new Map(); for (const f of spaces) for (const e of f.edges || []) on.set(e.segment, (on.get(e.segment) || 0) + 1);
    return { lv, spaces, walls: ws.map((w) => ({ id: w.where.segment, a: w.where.a, b: w.where.b, outer: (on.get(w.where.segment) || 0) < 2 })) };
  };
  /** Where columns go on one floor, for one layout. @param {any} F @param {boolean} outerOnly @param {number} span */
  const columnsOn = (F, outerOnly, span) => {
    const ws = F.walls.filter((w) => !outerOnly || w.outer); if (!ws.length) return [];
    const at = new Map(); // a point: the directions of the walls meeting there
    for (const w of ws) for (const [p, q] of [[w.a, w.b], [w.b, w.a]]) { const k = key(p); if (!at.has(k)) at.set(k, { p, dirs: [] }); at.get(k).dirs.push(Math.atan2(q.y - p.y, q.x - p.x)); }
    const turns = (dirs) => dirs.length === 1 || dirs.length >= 3 || Math.abs(Math.sin(dirs[0] - dirs[1])) > 1e-3 || Math.cos(dirs[0] - dirs[1]) > 0;
    const cols = new Map(); for (const [k, v] of at) if (turns(v.dirs)) cols.set(k, { x: Math.round(v.p.x), y: Math.round(v.p.y), dir: v.dirs[0] });
    // straight runs between columns: walk from each column along each wall until the next column
    const byPoint = new Map(); for (const w of ws) for (const p of [w.a, w.b]) { const k = key(p); if (!byPoint.has(k)) byPoint.set(k, []); byPoint.get(k).push(w); }
    const done = new Set();
    for (const [k0, c0] of [...cols]) for (const w0 of byPoint.get(k0) || []) { if (done.has(w0.id)) continue;
      let from = c0, w = w0; const run = [from];
      for (let guard = 0; guard < 1000 && w; guard++) { done.add(w.id); const far = key(w.a) === key(from) ? w.b : w.a; run.push(far); const kf = key(far); if (cols.has(kf)) break;
        from = far; w = (byPoint.get(kf) || []).find((x) => !done.has(x.id)) || null; }
      const end = run[run.length - 1], L = Math.hypot(end.x - run[0].x, end.y - run[0].y); if (!cols.has(key(end)) || L <= span) continue;
      const n = Math.ceil(L / span), dir = Math.atan2(end.y - run[0].y, end.x - run[0].x);
      for (let i = 1; i < n; i++) { const t = i / n, want = { x: run[0].x + (end.x - run[0].x) * t, y: run[0].y + (end.y - run[0].y) * t };
        const snap = run.slice(1, -1).find((p) => near(p, want, 300)) || want; cols.set(key(snap), { x: Math.round(snap.x), y: Math.round(snap.y), dir }); } }
    return [...cols.values()];
  };
  /** A floor's outline holds a point (inside a room, or on its edge). */
  const within = (F, p) => F.spaces.some((f) => geo.inside(p, f.outline) || (f.outline || []).some((a, k, P) => geo.segDist(p, a, P[(k + 1) % P.length]) < 2));
  /** The longest span between two columns along a wall, mm. */
  const longest = (F, cols, outerOnly) => { let worst = 0; for (const w of F.walls.filter((x) => !outerOnly || x.outer)) { const on = cols.filter((c) => geo.segDist(c, w.a, w.b) < 2).map((c) => Math.hypot(c.x - w.a.x, c.y - w.a.y)).sort((a, b) => a - b);
    for (let i = 1; i < on.length; i++) worst = Math.max(worst, on[i] - on[i - 1]); } return Math.round(worst); };

  const floors = levels.map(floorOf).filter((F) => F.walls.length);
  if (!floors.length) return { candidates: [], note: "No floor has walls yet." };
  const layout = (outerOnly, span) => {
    const per = new Map(); let above = [];
    for (const F of [...floors].reverse()) { const own = columnsOn(F, outerOnly, span), here = [...own];
      for (const c of above) if (within(F, c) && !here.some((h) => near(h, c, 150))) here.push(c); // a column above comes down through this floor
      per.set(F.lv.id, here); above = here; }
    return per;
  };
  const opsFor = (per) => { const ops = [], skipped = []; let k = 0;
    for (const F of floors) { const pts = (input.points || []).filter((p) => p.level === F.lv.id);
      for (const c of per.get(F.lv.id) || []) { if (columnsThere.some((x) => x.where.level === F.lv.id && near({ x: x.where.x, y: x.where.y }, c, 150))) continue; // one is there already
        const at = pts.find((p) => near(p, c)); let node = at ? at.id : null;
        if (node && taken.has(node)) { skipped.push(`${F.lv.name || F.lv.id} at ${c.x}, ${c.y}`); continue; }
        if (!node) { node = `SC${k++}_${F.lv.id}`; ops.push({ op: "add_node", input: { id: node, level: F.lv.id, x: c.x, y: c.y } }); }
        ops.push({ op: "place", input: { kind: "column", on: { node }, params: { width: W, depth: D }, rotation: Math.round(((c.dir * 180) / Math.PI) * 10) / 10 } }); } }
    return { ops, skipped }; };
  const square = (c) => { const h = Math.max(W, D) / 2; return [{ x: c.x - h, y: c.y - h }, { x: c.x + h, y: c.y - h }, { x: c.x + h, y: c.y + h }, { x: c.x - h, y: c.y + h }]; };
  const ground = floors[0];
  const options = [["Every wall", false, maxSpan], ["Outer walls only", true, maxSpan], [`Every wall, spans up to ${((maxSpan * 1.5) / 1000).toFixed(1)} m`, false, maxSpan * 1.5]];
  const out = [], seen = new Set(), left = new Set();
  for (const [name, outerOnly, span] of options) { const per = layout(outerOnly, span), sig = floors.map((F) => (per.get(F.lv.id) || []).map(key).sort().join(";")).join("|"); if (seen.has(sig)) continue; seen.add(sig);
    const { ops, skipped } = opsFor(per); if (!ops.length) continue;
    const numbers = { columns: floors.reduce((t, F) => t + (per.get(F.lv.id) || []).length, 0), "longest span m": Math.max(...floors.map((F) => longest(F, per.get(F.lv.id) || [], outerOnly))) / 1000 };
    const loose = floors.reduce((t, F) => t + (per.get(F.lv.id) || []).filter((c) => !F.walls.some((w) => geo.segDist(c, w.a, w.b) < 2)).length, 0); if (loose) numbers["standing in rooms"] = loose; // under a wall above that has none below
    for (const F of floors) numbers[`on ${F.lv.name || F.lv.id}`] = (per.get(F.lv.id) || []).length;
    for (const x of skipped) left.add(x);
    out.push({ label: `${name}: ${numbers.columns} columns`, numbers, preview: { polygons: (per.get(ground.lv.id) || []).map(square) }, ops }); }
  const inner = floors.flatMap((F) => F.spaces.filter((f) => { const xs = f.outline.map((p) => p.x), ys = f.outline.map((p) => p.y); return Math.min(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) > maxSpan; }).map((f) => f.name || f.id));
  const looseNote = out.some((c) => c.numbers["standing in rooms"]) ? " A column standing in a room carries a wall or a column above that has no wall under it: move that wall above, or ask for a beam to carry it instead." : "";
  return {
    note: `Columns ${W} × ${D} mm, spans up to ${(maxSpan / 1000).toFixed(1)} m along the walls.${columnsThere.length ? ` ${columnsThere.length} columns there already are kept.` : ""}${inner.length ? ` Wider than the span both ways, wanting a beam across or a column inside: ${[...new Set(inner)].join(", ")}.` : ""}${left.size ? ` Left out where something stands on the point already: ${[...left].join("; ")}.` : ""}${looseNote}`,
    context: { lines: ground.walls.map((w) => [w.a, w.b]) },
    candidates: out,
  };
}
