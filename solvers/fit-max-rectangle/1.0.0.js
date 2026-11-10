// solvers/fit-max-rectangle 1.0.0 — the largest rectangle that fits a plot inside its setbacks, at any angle (R60, R62).
// In: the face with the Plot role (outline, edges in order with the roles on them: Front, Own setback) and settings. Out:
// candidates, each with the ground floor's outer walls (their outer face on the rectangle), a preview and its numbers.
// Method: turn the plot through every edge's direction and 0–87° in 3° steps; in each frame mark the buildable points on a
// grid (inside the plot and at least each edge's setback from it), take the largest rectangle of buildable cells, grow each
// side to 1 mm against the exact setbacks, and refine the best angles to a quarter degree. A 2 mm margin keeps rounded
// corners clear. Runs in a locked-down process with only `geo` (the app's geometry helpers).

function solve(input, geo) {
  const S = input.settings || {}, plot = (input.roles || []).find((r) => r.role === "plot" && r.where && r.where.edges);
  if (!plot) return { candidates: [], note: "There is no plot: draw it with sketch lines, make it a face (F) and give the face the Plot role." };
  const g = plot.where, p = plot.props || {}, level = (input.levels || []).find((l) => l.id === g.level) || {};
  // the edges in the order they go round (each starts where the one before ends), with their setbacks
  const left = g.edges.filter((e) => e.a && e.b), ord = [left[0]];
  while (ord.length < left.length) { const last = ord[ord.length - 1], nx = left.find((e) => !ord.includes(e) && geo.dist(e.a, last.b) < 1); if (!nx) break; ord.push(nx); }
  if (ord.length < 3) return { candidates: [], note: "The plot's outline does not close." };
  const P = ord.map((e) => e.a), N = geo.outwardNormals(P), has = (e, role) => (e.roles || []).find((r) => r.role === role);
  let f = ord.findIndex((e) => has(e, "front")), note = "";
  if (f < 0) { f = 0; note = "No edge is marked Front: the first edge is taken as the front. "; }
  let rear = -1, best = Infinity; for (let k = 0; k < ord.length; k++) if (k !== f) { const dot = N[k].x * N[f].x + N[k].y * N[f].y; if (dot < best) { best = dot; rear = k; } }
  if (best > -0.5) rear = -1;
  const sb = { front: p.setbackFront || 0, rear: p.setbackRear || 0, side: p.setbackSide || 0 };
  const E = ord.map((e, k) => { const own = has(e, "own-setback"), kind = k === f ? "front" : k === rear ? "rear" : "side";
    return { a: e.a, b: e.b, kind, setback: own && own.props && own.props.setback != null ? own.props.setback : sb[kind] }; });

  const t0 = Number(S.wallThickness) || 230, top = Math.max(1, Math.min(6, Number(S.top) || 3)), plotArea = geo.area(P);
  const MARGIN = 2, rotP = (q, deg) => geo.rotate(q, deg);
  const segRect = (a, b, R) => { const inR = (q) => q.x >= R.x0 && q.x <= R.x1 && q.y >= R.y0 && q.y <= R.y1; if (inR(a) || inR(b)) return 0;
    const C = [{ x: R.x0, y: R.y0 }, { x: R.x1, y: R.y0 }, { x: R.x1, y: R.y1 }, { x: R.x0, y: R.y1 }];
    for (let i = 0; i < 4; i++) if (geo.segsCross(a, b, C[i], C[(i + 1) % 4])) return 0;
    const toR = (q) => Math.hypot(Math.max(R.x0 - q.x, 0, q.x - R.x1), Math.max(R.y0 - q.y, 0, q.y - R.y1));
    return Math.min(toR(a), toR(b), ...C.map((c) => geo.segDist(c, a, b))); };
  const okRect = (R, Q, F, m) => { if (!(R.x1 > R.x0 && R.y1 > R.y0)) return false;
    for (const c of [{ x: R.x0, y: R.y0 }, { x: R.x1, y: R.y0 }, { x: R.x1, y: R.y1 }, { x: R.x0, y: R.y1 }]) if (!geo.inside(c, Q)) return false;
    return F.every((e) => segRect(e.a, e.b, R) >= e.setback + m); };
  function bestAt(deg, n = 56) {
    const Q = P.map((q) => rotP(q, -deg)), F = E.map((e) => ({ ...e, a: rotP(e.a, -deg), b: rotP(e.b, -deg) })), bb = geo.bbox(Q);
    const step = Math.max(bb.x1 - bb.x0, bb.y1 - bb.y0) / n, nx = Math.max(2, Math.ceil((bb.x1 - bb.x0) / step)), ny = Math.max(2, Math.ceil((bb.y1 - bb.y0) / step));
    const ok = []; for (let j = 0; j < ny; j++) { const row = []; for (let i = 0; i < nx; i++) { const q = { x: bb.x0 + (i + 0.5) * step, y: bb.y0 + (j + 0.5) * step };
      row.push(geo.inside(q, Q) && F.every((e) => geo.segDist(q, e.a, e.b) >= e.setback - 0.5)); } ok.push(row); }
    const h = new Array(nx).fill(0), cands = [];
    for (let j = 0; j < ny; j++) { for (let i = 0; i < nx; i++) h[i] = ok[j][i] ? h[i] + 1 : 0;
      const st = []; for (let i = 0; i <= nx; i++) { const hi = i < nx ? h[i] : 0; let start = i;
        while (st.length && st[st.length - 1][1] >= hi) { const [si, sh] = st.pop(); if (sh && i - si) cands.push({ a: sh * (i - si), i0: si, i1: i - 1, j0: j - sh + 1, j1: j }); start = si; }
        st.push([start, hi]); } }
    if (!cands.length) return [];
    cands.sort((x, y) => y.a - x.a);
    const ov = (x, y) => Math.max(0, Math.min(x.i1, y.i1) - Math.max(x.i0, y.i0) + 1) * Math.max(0, Math.min(x.j1, y.j1) - Math.max(x.j0, y.j0) + 1);
    const picks = [cands[0]], other = cands.find((c) => ov(c, cands[0]) < 0.5 * c.a && c.a > 0.3 * cands[0].a); if (other) picks.push(other);
    const fine = (R) => okRect(R, Q, F, MARGIN);
    return picks.map((c) => { let R = { x0: bb.x0 + (c.i0 + 0.5) * step, x1: bb.x0 + (c.i1 + 0.5) * step, y0: bb.y0 + (c.j0 + 0.5) * step, y1: bb.y0 + (c.j1 + 0.5) * step };
      for (let k = 0; k < 20 && !fine(R); k++) { const dx = (R.x1 - R.x0) * 0.02, dy = (R.y1 - R.y0) * 0.02; R = { x0: R.x0 + dx, x1: R.x1 - dx, y0: R.y0 + dy, y1: R.y1 - dy }; }
      if (!fine(R)) return null;
      for (let round = 0; round < 4; round++) for (const side of ["x0", "x1", "y0", "y1"]) { const dir = side.endsWith("0") ? -1 : 1; let lo = 0, hi = step * 4;
        while (fine({ ...R, [side]: R[side] + dir * hi }) && hi < 1e7) { lo = hi; hi *= 2; }
        while (hi - lo > 1) { const mid = (lo + hi) / 2; if (fine({ ...R, [side]: R[side] + dir * mid })) lo = mid; else hi = mid; }
        R = { ...R, [side]: R[side] + dir * Math.floor(lo) }; }
      const w = Math.floor(R.x1 - R.x0), d = Math.floor(R.y1 - R.y0), cen = rotP({ x: R.x0 + w / 2, y: R.y0 + d / 2 }, deg);
      return { angle: Math.round((((deg % 180) + 180) % 180) * 100) / 100, cx: Math.round(cen.x), cy: Math.round(cen.y), width: w, depth: d, area: (w * d) / 1e6 }; }).filter(Boolean);
  }
  const along = P.map((a, k) => { const b = P[(k + 1) % P.length]; return ((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + 180) % 90; });
  let found = [...new Set([...along.map((x) => Math.round(x * 100) / 100), ...Array.from({ length: 30 }, (_, k) => k * 3)])].flatMap((a) => bestAt(a));
  for (const span of [2, 0.25]) { const seeds = [...found].sort((x, y) => y.area - x.area).slice(0, 4); for (const s of seeds) for (const dd of [-span, -span / 2, span / 2, span]) found.push(...bestAt(s.angle + dd)); }
  const min = Number(S.minSide) || 0; found = found.filter((x) => Math.min(x.width, x.depth) >= min);
  if (S.maxCoverage > 0) { const cap = plotArea * Number(S.maxCoverage);
    found = found.map((x) => { if (x.area <= cap) return x; const k = Math.sqrt(cap / x.area), w = Math.floor(x.width * k), d = Math.floor(x.depth * k); return { ...x, width: w, depth: d, area: (w * d) / 1e6, capped: true }; }); }
  found.sort((x, y) => y.area - x.area);
  const near = (a, b) => Math.min(Math.abs(a.angle - b.angle) % 90, 90 - (Math.abs(a.angle - b.angle) % 90)) < 5 && Math.hypot(a.cx - b.cx, a.cy - b.cy) < Math.min(a.width, a.depth, b.width, b.depth) / 2;
  const out = []; for (const x of found) { if (out.some((y) => near(y, x))) continue; out.push(x); if (out.length >= top) break; }
  if (!out.length) return { candidates: [], note: `${note}Nothing fits inside the setbacks${min ? ` with sides of at least ${min} mm` : ""}: check the plot and its setbacks.` };

  const setback = geo.offsetInward(P, E.map((e) => e.setback)), m = (x) => (x / 1000).toFixed(2);
  return {
    note: `${note}Plot ${plotArea.toFixed(1)} m²; front ${sb.front}, rear ${rear >= 0 ? sb.rear : "none"}, sides ${sb.side} mm.`,
    context: { polygons: [P], lines: [[...setback, setback[0]]] },
    candidates: out.map((x) => { const corners = geo.rectCorners(x.cx, x.cy, x.width, x.depth, x.angle), line = geo.rectCorners(x.cx, x.cy, x.width - t0, x.depth - t0, x.angle);
      return { label: `${m(x.width)} × ${m(x.depth)} m at ${x.angle.toFixed(1)}°${x.capped ? " (held to the coverage limit)" : ""}`,
        numbers: { "area m²": Math.round(x.area * 10) / 10, "of the plot %": Math.round((x.area / plotArea) * 100), "width m": x.width / 1000, "depth m": x.depth / 1000, "angle °": x.angle },
        preview: { polygons: [corners] },
        ops: [{ op: "draw_walls", input: { level: g.level, points: line, closed: true, thickness: t0, ...(S.wallHeight || level.height ? { height: Number(S.wallHeight) || level.height } : {}) } }] }; }),
  };
}
