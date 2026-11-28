// solvers/workplace-test-fit 4.0.0 — a first test fit of a workplace floor (R109; model 4.2 in R113): the rooms of the programme set along the
// sides of an empty floor, the rest left as the open office and filled with desks, every room furnished and given a door.
// In: the level's spaces as geometry (the largest is the floor to fit out; the others are its core, left alone), its doors
// (Placements in its walls; one in the outer wall is the entrance), the furniture standing on it, the project's typology (what each use asks, the ratios, what furniture provides),
// its planning module and its programme (people, and the rooms asked for), and the Library's Objects by name.
// Out: up to six candidates, ranked by how well each meets the programme. Each one's operations draw its rooms, put in its
// doors, name the open office and stand its furniture; nothing is changed until the owner picks one.
// Method (first principles, no search library): everything sits on the planning module. A candidate is a pattern: which
// sides carry a strip of rooms, and how deep the strip is (3 or 4 modules). The reception goes over the entrance. The other
// rooms are put in an order that keeps apart what the typology says must be apart, each as wide as its area and narrowest
// side ask in whole modules, and packed along the strip between the core's rooms. Desks then fill the open floor in rows of
// benches, a module clear of every wall and room, nearest the windows first, until everyone has a seat; booths for calls
// take the deepest places left. A floor square to the axes, one level.
// 3.0.0 (R123): the floor need not be a rectangle: what of its bounding box is not floor (outside, a void, a notch) is found
// cell by cell and kept clear like a core; the columns standing on it are read, and no desk, table or booth stands on one.
// 4.0.0 (R131): a deep floor. Rooms are also set round the core (a strip on each face of a block of core rooms, out into
// the floor: the rooms that ask for no window go there, services first), along three or all four sides when two cannot hold
// them, and the rooms already on the floor count towards the typology's ratios and the seats (no second cafeteria).

function solve(input, geo) {
  const S = input.settings || {}, PJ = input.project || {}, SP = PJ.spaces || {}, PG = PJ.programme || null, LIB = input.library || [];
  const M = Math.round(Number(PJ.module) || Number(S.module) || 1500), none = (note) => ({ candidates: [], note });
  const U = new Map((SP.uses || []).map((u) => [u.id, u])), head = SP.headUnit || "seat", m1 = (v) => Math.round(v / 100) / 10;
  // ---- the floor: the largest room of the level; the other rooms inside its outline are the core
  // a space comes as {id, level, name, use, outline}; here as {id, where: {level, outline}, props: {name, use}} to read alike
  const OUT = ["plot", "footprint", "void"], PL = input.placements || [];
  const all = (input.spaces || []).filter((f) => !OUT.includes(f.use) && f.outline && f.outline.length >= 4).map((f) => ({ id: f.id, where: { level: f.level, outline: f.outline }, props: { name: f.name || "", use: f.use || null } }));
  if (!all.length) return none("There is no floor to fit out: draw the floor's outer walls first (the Room tool, R), with the core's rooms and the entrance door.");
  const big = (rs) => rs.reduce((a, b) => (geo.area(b.where.outline) > geo.area(a.where.outline) ? b : a));
  const lv = S.level && all.some((r) => r.where.level === S.level) ? S.level : big(all).where.level, onLv = all.filter((r) => r.where.level === lv), plate = big(onLv), O = plate.where.outline;
  if (O.some((p, k) => { const q = O[(k + 1) % O.length]; return Math.abs(p.x - q.x) > 2 && Math.abs(p.y - q.y) > 2; })) return none("This first version fits a floor whose walls are square to the axes: this floor has a wall at an angle.");
  const standing = PL.filter((r) => r.kind === "furniture" && r.where && r.where.level === lv && r.where.x != null && geo.inside({ x: r.where.x, y: r.where.y }, O)).length;
  if (standing) return none(`This floor is furnished already (${standing} pieces stand on it): a test fit starts from an empty floor. Undo the earlier layout first, or clear the floor.`);
  const B = geo.bbox(O), W = B.x1 - B.x0, H = B.y1 - B.y0, clip = (R) => ({ x0: Math.max(R.x0, B.x0), y0: Math.max(R.y0, B.y0), x1: Math.min(R.x1, B.x1), y1: Math.min(R.y1, B.y1) }), areaR = (R) => Math.max(0, R.x1 - R.x0) * Math.max(0, R.y1 - R.y0) / 1e6;
  const cores = onLv.filter((r) => r !== plate).map((r) => ({ ...clip(geo.bbox(r.where.outline)), use: (r.props || {}).use || null, name: (r.props || {}).name || "" })).filter((R) => areaR(R) > 0.01);
  // R123: what of the bounding box is not this floor nor a core room (outside the building, a void, a notch): cells between the outline's own lines, kept clear like a core
  const xs = [...new Set(O.map((p) => p.x))].sort((a, b) => a - b), ys = [...new Set(O.map((p) => p.y))].sort((a, b) => a - b), coreOut = onLv.filter((r) => r !== plate).map((r) => r.where.outline), outside = [];
  for (let i = 0; i + 1 < xs.length; i++) for (let j = 0; j + 1 < ys.length; j++) { const c = { x: (xs[i] + xs[i + 1]) / 2, y: (ys[j] + ys[j + 1]) / 2 };
    if (!geo.inside(c, O) && !coreOut.some((o) => geo.inside(c, o))) { const last = outside[outside.length - 1]; if (last && last.x0 === xs[i] && last.x1 === xs[i + 1] && last.y1 === ys[j]) last.y1 = ys[j + 1]; else outside.push({ x0: xs[i], x1: xs[i + 1], y0: ys[j], y1: ys[j + 1], use: null, name: "not floor" }); } }
  const offArea = outside.reduce((t, R) => t + areaR(R), 0); if (offArea > W * H / 1e6 * 0.45) return none(`Most of this floor's bounding box is not floor (${Math.round(offArea)} of ${Math.round(W * H / 1e6)} m²): fit its parts as floors of their own.`);
  cores.push(...outside);
  // R123: the columns on the floor, kept clear of desks, tables and booths (a chair's width round them)
  const posts = PL.filter((r) => r.kind === "column" && r.where && r.where.level === lv && r.where.x != null).map((r) => { const p = r.params || {}, w = Number(p.width) || 300, d = Number(p.depth) || (p.circular ? w : 300) || w; return { x0: r.where.x - w / 2, x1: r.where.x + w / 2, y0: r.where.y - d / 2, y1: r.where.y + d / 2 }; }).filter((R) => R.x1 > B.x0 && R.x0 < B.x1 && R.y1 > B.y0 && R.y0 < B.y1);
  if (W < 6 * M || H < 6 * M) return none(`The floor is ${m1(W)} m by ${m1(H)} m: too small to set out on a ${m1(M)} m module.`);
  // ---- the four sides: a station along each (mm from its start) and a depth in from it
  // an edge: ax the axis it runs along, o where it starts on that axis, base where it lies across, dir which way its depth goes (+1 up the other axis)
  const SIDES = { S: { name: "south", len: W, ax: "x", o: B.x0, base: B.y0, dir: 1 }, N: { name: "north", len: W, ax: "x", o: B.x0, base: B.y1, dir: -1 }, W: { name: "west", len: H, ax: "y", o: B.y0, base: B.x0, dir: 1 }, E: { name: "east", len: H, ax: "y", o: B.y0, base: B.x1, dir: -1 } };
  // R131: the blocks of core rooms (those within a module of one another are one block) and the faces of each that look on to the floor: a strip of rooms can stand on a face, out into the floor
  const blocks = []; for (const c of cores) { if (c.name === "not floor") continue; const near = blocks.filter((b) => c.x0 < b.x1 + M && c.x1 > b.x0 - M && c.y0 < b.y1 + M && c.y1 > b.y0 - M), nb = { x0: c.x0, y0: c.y0, x1: c.x1, y1: c.y1 };
    for (const b of near) { nb.x0 = Math.min(nb.x0, b.x0); nb.y0 = Math.min(nb.y0, b.y0); nb.x1 = Math.max(nb.x1, b.x1); nb.y1 = Math.max(nb.y1, b.y1); blocks.splice(blocks.indexOf(b), 1); } blocks.push(nb); }
  const CORE = []; blocks.forEach((b, i) => { const add = (k, e) => { if (e.len >= 2 * M) { SIDES[`C${i}${k}`] = { ...e, name: "core", core: true }; CORE.push(`C${i}${k}`); } };
    if (b.y0 - B.y0 >= 5 * M) add("S", { len: b.x1 - b.x0, ax: "x", o: b.x0, base: b.y0, dir: -1 }); if (B.y1 - b.y1 >= 5 * M) add("N", { len: b.x1 - b.x0, ax: "x", o: b.x0, base: b.y1, dir: 1 });
    if (b.x0 - B.x0 >= 5 * M) add("W", { len: b.y1 - b.y0, ax: "y", o: b.y0, base: b.x0, dir: -1 }); if (B.x1 - b.x1 >= 5 * M) add("E", { len: b.y1 - b.y0, ax: "y", o: b.y0, base: b.x1, dir: 1 }); });
  const rect = (k, s0, s1, d0, d1) => { const e = SIDES[k], a0 = e.o + s0, a1 = e.o + s1, c0 = e.dir > 0 ? e.base + d0 : e.base - d1, c1 = e.dir > 0 ? e.base + d1 : e.base - d0; return e.ax === "x" ? { x0: a0, x1: a1, y0: c0, y1: c1 } : { x0: c0, x1: c1, y0: a0, y1: a1 }; };
  const span = (k, R) => { const e = SIDES[k], a0 = e.ax === "x" ? R.x0 : R.y0, a1 = e.ax === "x" ? R.x1 : R.y1, c0 = e.ax === "x" ? R.y0 : R.x0, c1 = e.ax === "x" ? R.y1 : R.x1; return { s0: a0 - e.o, s1: a1 - e.o, d0: e.dir > 0 ? c0 - e.base : e.base - c1, d1: e.dir > 0 ? c1 - e.base : e.base - c0 }; };
  const hits = (A, C, gap = 0) => A.x0 < C.x1 + gap - 1 && A.x1 > C.x0 - gap + 1 && A.y0 < C.y1 + gap - 1 && A.y1 > C.y0 - gap + 1, mid = (R) => ({ x: Math.round((R.x0 + R.x1) / 2), y: Math.round((R.y0 + R.y1) / 2) });
  // ---- the entrance: a door in the outer wall that is not a core room's own
  const sideOf = (a, b) => Math.abs(a.y - B.y0) < 6 && Math.abs(b.y - B.y0) < 6 ? "S" : Math.abs(a.y - B.y1) < 6 && Math.abs(b.y - B.y1) < 6 ? "N" : Math.abs(a.x - B.x0) < 6 && Math.abs(b.x - B.x0) < 6 ? "W" : Math.abs(a.x - B.x1) < 6 && Math.abs(b.x - B.x1) < 6 ? "E" : null;
  const doors = PL.filter((r) => r.kind === "door" && r.where && r.where.a && r.where.b && r.where.level === lv).map((r) => { const k = sideOf(r.where.a, r.where.b); if (!k) return null;
    const p = { x: (r.where.a.x + r.where.b.x) / 2, y: (r.where.a.y + r.where.b.y) / 2 }, sp = span(k, { x0: Math.min(r.where.a.x, r.where.b.x), x1: Math.max(r.where.a.x, r.where.b.x), y0: Math.min(r.where.a.y, r.where.b.y), y1: Math.max(r.where.a.y, r.where.b.y) });
    return cores.some((R) => p.x >= R.x0 - 6 && p.x <= R.x1 + 6 && p.y >= R.y0 - 6 && p.y <= R.y1 + 6) ? null : { side: k, s0: sp.s0, s1: sp.s1, at: p }; }).filter(Boolean);
  const entrance = doors.sort((a, b) => (b.s1 - b.s0) - (a.s1 - a.s0))[0] || null;
  // ---- the brief: people, and the rooms asked for; then what the typology's ratios add
  const lines = (PG && Array.isArray(PG.spaces) ? PG.spaces : []).filter((l) => l && l.use), openUse = (SP.uses || []).find((u) => u.unit === head && u.unitArea && !u.open) || { id: "open-office", name: "Open office", unitArea: 6 };
  const people = Math.round(Number(PG && PG.people) || lines.filter((l) => l.use === openUse.id).reduce((t, l) => t + (Number(l.units) || 0), 0) || Number(S.people) || 0);
  if (!people && !lines.length) return none("There is no programme to fit: write it first (how many people, and the rooms asked for), or run Programme from a brief.");
  const LEAVE = new Set(["passage", "stair", "lift-lobby", openUse.id]), there = new Map(); for (const c of cores) if (c.use) there.set(c.use, (there.get(c.use) || 0) + 1);
  const want = [], skipped = [];
  for (const l of lines) { const u = U.get(l.use); if (LEAVE.has(l.use) || (u && u.open)) continue; let n = Math.max(1, Math.round(Number(l.count) || 1));
    const have = Math.min(n, there.get(l.use) || 0); if (have) { there.set(l.use, there.get(l.use) - have); n -= have; skipped.push(`${have} ${(u && u.name) || l.use} in the core`); }
    for (let k = 0; k < n; k++) want.push({ use: l.use, u: u || { id: l.use, name: l.name || l.use, minArea: 9, minSide: 2700 }, label: l.name || null, area: Number(l.area) || 0, units: l.units ? Math.ceil(Number(l.units) / Math.max(1, Number(l.count) || 1)) : 0, optional: !!l.optional }); }
  const holds = (r) => r.u.unit ? (r.units || r.u.units || (r.u.unitArea && r.area ? Math.floor(r.area / r.u.unitArea) : 0)) : 0, provides = SP.provides || {}, added = [];
  // R131: what the rooms already on the floor hold, by unit (a cafeteria drawn first is the cafeteria: the ratios ask for no second one)
  const here = (unit) => cores.reduce((t, c) => { const u = c.use && U.get(c.use); return t + (u && u.unit === unit && !u.open ? (u.units || (u.unitArea ? Math.floor(areaR(c) / u.unitArea) : 0)) : 0); }, 0);
  let pods = 0; const podUnit = Object.keys(provides).map((c) => ({ c, v: provides[c] })).filter((x) => /booth|pod/.test(x.c))[0] || null;
  // the heads the ratios count: the people of the brief, or more when its lines ask for more seats than that
  const heads = Math.max(people, lines.filter((l) => l.use === openUse.id).reduce((t, l) => t + (Number(l.units) || 0), 0) + want.filter((r) => r.u.unit === head && r.u.units).reduce((t, r) => t + r.u.units, 0));
  for (const q of people ? SP.ratios || [] : []) { if (q.per !== head || !(q.min > 0)) continue; const need = Math.ceil(q.min * heads - 1e-9); let short = need - want.filter((r) => r.u.unit === q.of).reduce((t, r) => t + holds(r), 0) - here(q.of); if (short <= 0) continue;
    const fixed = (SP.uses || []).filter((u) => u.unit === q.of && u.units >= 4 && !u.open).sort((a, b) => a.units - b.units), byArea = (SP.uses || []).find((u) => u.unit === q.of && u.unitArea && !u.open && u.id !== openUse.id && u.window);
    if (fixed.length) { let n = 0; while (short > 0 && n < 12) { const u = (short >= 10 && fixed[1]) || fixed[0]; want.push({ use: u.id, u, label: null, area: 0, units: 0, optional: false }); short -= u.units; n++; added.push(u.name); } }
    else if (byArea) { const had = want.find((r) => r.use === byArea.id); if (had) had.units = Math.max(holds(had), 0) + short; else { want.push({ use: byArea.id, u: byArea, label: null, area: 0, units: short, optional: false }); added.push(byArea.name); } }
    else if (podUnit && podUnit.v[q.of]) pods += Math.ceil(short / podUnit.v[q.of]); }
  // ---- the Library's Objects, by contract
  const lib = (c) => LIB.find((o) => o.contract === c) || null, SIZE = { "furniture.bench-6": [4200, 2520], "furniture.bench-4": [2800, 2520], "furniture.meeting-table-4": [1600, 2020], "furniture.meeting-table-8": [3520, 2320], "furniture.meeting-table-12": [4920, 2420], "furniture.cafe-table-4": [1860, 1860], "furniture.phone-booth-pod": [1000, 1000], "furniture.reception-desk": [2400, 1920], "furniture.training-desk-2": [1400, 1720], "furniture.workstation": [1400, 1820] };
  const sz = (c) => { const o = lib(c); return o && o.size && o.size.w && o.size.d ? [o.size.w, o.size.d] : SIZE[c] || [1000, 1000]; }, seatsOf = (c) => (provides[c] || {})[head] || 0;
  const SOLID = new Set(["server-room", "hub-room", "ups-room", "store", "wellness-room", "locker-area"]), solid = (u) => SOLID.has(u.id) || (u.wet && !u.window && u.id !== "pantry"), dry = lib("wall.drywall-100"), glassDoor = lib("door.glass-single"), leafDoor = lib("door.single-leaf");
  // ---- the order along a strip: front of house first, then food, quiet rooms, services; what must be apart is kept apart
  const rank = (r) => /visitor|meeting|scrum|training|town-hall|board|collab/.test(r.use) ? 1 : /cafeteria|pantry|breakout|recreation/.test(r.use) ? 2 : /cabin|focus|phone|war|lab|wellness/.test(r.use) ? 3 : /server|hub|ups|store|print|locker/.test(r.use) ? 4 : r.u.wet ? 5 : 3;
  const apart = new Set((SP.apart || []).flatMap(([a, b]) => [`${a}|${b}`, `${b}|${a}`])), clash = (a, b) => !!a && !!b && apart.has(`${a.use}|${b.use}`);
  // a room's size on the module: as deep as the strip, or a step or two deeper when its narrowest side asks; as wide as its area and narrowest side ask (both clear of the walls, so 150 mm more)
  const deep = (r, D) => Math.min(D + 2 * M, Math.max(D, Math.ceil(((r.u.minSide || 0) + 150) / M - 1e-6) * M));
  const width = (r, D, d = deep(r, D)) => { const A = Math.max(r.area || 0, r.units && r.u.unitArea ? r.units * r.u.unitArea : 0, r.u.minArea || 6) * 1.06; return Math.max((r.u.minSide || 0) + 150 <= M && A <= 5 ? 1 : 2, Math.ceil(Math.max(A * 1e6 / d, (r.u.minSide || 0) + 150) / M - 1e-6)) * M; }; // R131: a booth, a store or a print corner may be one module wide

  function make(sides, D) {
    const far = 1e7, taken = [...cores.map((c) => ({ ...c, core: true })), { x0: B.x0 - far, x1: B.x0, y0: B.y0 - far, y1: B.y1 + far }, { x0: B.x1, x1: B.x1 + far, y0: B.y0 - far, y1: B.y1 + far }, { x0: B.x0 - far, x1: B.x1 + far, y0: B.y0 - far, y1: B.y0 }, { x0: B.x0 - far, x1: B.x1 + far, y0: B.y1, y1: B.y1 + far }], keep = [], rooms = [], left = [], notes = []; let made = null, clashes = 0; // (and all that is beyond the floor's box: a strip on a core's face stops at it)
    const isCore = (k) => !!SIDES[k].core, inner = (r) => !r.u.window && r.use !== "reception"; // what may stand round the core: a room that asks for no window
    // R131: what belongs round the core before anywhere else: services and the small rooms people are in for a short while (a booth, a focus room, print, stores); and a strip there is two modules deep, a deeper room reaching further where the floor is clear
    const short = (r) => inner(r) && (rank(r) >= 4 || /focus|phone|print|store|locker|hub|server|ups|wellness|janitor/.test(r.use)), Dk = (k) => (isCore(k) ? Math.min(D, 2 * M) : D);
    const sorted = want.filter((r) => r.use !== "reception").map((r, k) => ({ ...r, k })).sort((a, b) => (a.optional - b.optional) || (rank(a) - rank(b)) || (a.k - b.k)), rec = want.find((r) => r.use === "reception") || null;
    // rooms that must be apart from one another go in with the others between them: the rest first, then one of them, one or more of the rest, the next
    const hard = sorted.filter((r) => sorted.some((x) => x !== r && clash(r, x))), soft = sorted.filter((r) => !hard.includes(r)), list = [];
    if (hard.length > 1) { const each = Math.max(1, Math.floor(soft.length / hard.length)), lead = Math.max(0, soft.length - each * (hard.length - 1)); list.push(...soft.splice(0, lead)); hard.forEach((h, k) => { list.push(h); if (k < hard.length - 1) list.push(...soft.splice(0, each)); }); list.push(...soft); } else list.push(...sorted);
    const free = (k) => { const L = SIDES[k].len, bl = [...taken, ...keep].map((R) => span(k, R)).filter((s) => s.d0 < Dk(k) + (isCore(k) ? M : 0) - 1 && s.d1 > 1 && s.s1 > 1 && s.s0 < L - 1).map((s) => [Math.max(0, s.s0), Math.min(L, s.s1)]).sort((a, b) => a[0] - b[0]);
      const out = []; let at = 0; for (const [a, b] of bl) { if (a - at >= 2 * M) out.push([at, a]); at = Math.max(at, b); } if (L - at >= 2 * M) out.push([at, L]); return out; };
    // a room's width and depth at a place: its own depth when the floor beyond the strip is clear there, else the strip's
    // R131: and a room needs the floor clear in front of it, a module deep, for its door (a room round a core may stand close by)
    const plan = (r, k, at, fromEnd) => { const D0 = Dk(k), d = deep(r, D0), w = width(r, D0, d), open = (w1, d1) => { const s0 = fromEnd ? at - w1 : at; return s0 >= 0 && s0 + w1 <= SIDES[k].len && !taken.some((T) => hits(rect(k, s0, s0 + w1, Math.min(D0, d1), d1 + M), T)); };
      if (d !== D0 && open(w, d)) return { w, d }; const w0 = d === D0 ? w : width(r, D0, D0); return open(w0, D0) ? { w: w0, d: D0 } : { w: Infinity, d: D0 }; };
    const put = (r, k, s0, s1, d) => { const R = rect(k, s0, s1, 0, d), o = { ...r, ...R, side: k, s0, s1, d }; rooms.push(o); taken.push(R); return o; };
    // the reception over the entrance; with no entrance drawn, at the start of the first strip, where a door is then made
    let ek = entrance ? entrance.side : sides[0];
    if (rec) { const dR = deep(rec, D), w = width(rec, D, dR), L = SIDES[ek].len; let done = false;
      if (entrance) { const c = (entrance.s0 + entrance.s1) / 2, base = Math.max(0, Math.min(L - w, Math.round((c - w / 2) / M) * M));
        for (const d of [0, M, -M, 2 * M, -2 * M, 3 * M, -3 * M]) { const s0 = base + d, s1 = s0 + w; if (s0 < 0 || s1 > L || entrance.s0 < s0 + 250 || entrance.s1 > s1 - 250) continue; if (taken.some((R) => hits(rect(ek, s0, s1, 0, dR), R))) continue; put(rec, ek, s0, s1, dR); done = true; break; }
        if (!done) notes.push("no place for the reception at the entrance"); }
      else { const f = free(ek)[0]; if (f && f[1] - f[0] >= w) { const o = put(rec, ek, f[0], f[0] + w, D); made = { side: ek, at: mid(rect(ek, o.s0, o.s1, 0, 0)) }; done = true; } }
      if (!done) left.push(rec); }
    if (entrance && !rooms.length) keep.push(rect(entrance.side, Math.max(0, entrance.s0 - M), Math.min(SIDES[entrance.side].len, entrance.s1 + M), 0, 2 * M));
    // the sides of the floor first (what asks for a window goes there), then round the core, then the sides not asked for
    const anchor = rooms[0] ? mid(rooms[0]) : entrance ? entrance.at : null, order = [...sides.filter(isCore).map((k) => [k, true]), ...sides.filter((k) => !isCore(k)).map((k) => [k, false]), ...sides.filter(isCore).map((k) => [k, false]), ...["N", "E", "S", "W"].filter((k) => !sides.includes(k)).map((k) => [k, false])]; let spill = 0; // round the core first, only what belongs there; then the sides; then round the core again, whatever asks for no window
    for (const [k, only] of order) { if (!list.length) break; if (!sides.includes(k)) { if (list.every((r) => r.optional)) break; spill++; }
      const a = anchor ? span(k, { x0: anchor.x, x1: anchor.x, y0: anchor.y, y1: anchor.y }).s0 : 0, iv = free(k).sort((p, q) => Math.min(Math.abs(p[0] - a), Math.abs(p[1] - a)) - Math.min(Math.abs(q[0] - a), Math.abs(q[1] - a)));
      for (const [f0, f1] of iv) { const fromEnd = Math.abs(f1 - a) < Math.abs(f0 - a); let L = f1 - f0, at = fromEnd ? f1 : f0, prev = null, last = null;
        while (list.length) { const fit0 = list.filter((r) => plan(r, k, at, fromEnd).w <= L + 1 && (sides.includes(k) || !r.optional) && (!isCore(k) || (only ? short(r) : inner(r)))), fits = isCore(k) ? [...fit0].reverse() : fit0; if (!fits.length) break; const r = fits.find((x) => !clash(prev, x)) || fits[0]; if (clash(prev, r)) clashes++; // round the core: services first
          const { w, d } = plan(r, k, at, fromEnd), s0 = fromEnd ? at - w : at; last = put(r, k, s0, s0 + w, d); at = fromEnd ? s0 : s0 + w; L -= w; prev = r; list.splice(list.indexOf(r), 1); }
        if (last && L > 1 && L < 2 * M + 1) { const R = rect(k, fromEnd ? at - L : last.s0, fromEnd ? last.s1 : at + L, 0, Dk(k)); const R2 = { ...R, ...rect(k, fromEnd ? at - L : last.s0, fromEnd ? last.s1 : at + L, 0, last.d) }; Object.assign(last, R2, fromEnd ? { s0: at - L } : { s1: at + L }); Object.assign(taken[taken.length - 1], R2); } } }
    left.push(...list.filter((r) => !r.optional));
    // ---- desks: rows of benches a module clear of everything, both ways tried, the one seating more kept
    const b6 = sz("furniture.bench-6"), b4 = sz("furniture.bench-4"), per6 = seatsOf("furniture.bench-6") || 6, per4 = seatsOf("furniture.bench-4") || 4, R0 = { x0: B.x0 + M, y0: B.y0 + M, x1: B.x1 - M, y1: B.y1 - M };
    const blocked = (R) => R.x0 < R0.x0 - 1 || R.y0 < R0.y0 - 1 || R.x1 > R0.x1 + 1 || R.y1 > R0.y1 + 1 || [...taken, ...keep].some((T) => hits(R, T, M)) || posts.some((T) => hits(R, T, 300));
    const glass = ["S", "N", "W", "E"].filter((k) => !rooms.some((r) => r.side === k)), light = (R) => { const c = mid(R); return Math.min(...(glass.length ? glass : ["S", "N", "W", "E"]).map((k) => span(k, { x0: c.x, x1: c.x, y0: c.y, y1: c.y }).d0)); };
    const rows = (alongX) => { const pitch = Math.ceil((b6[1] + 1200) / (M / 2)) * (M / 2), across = alongX ? R0.y1 - R0.y0 : R0.x1 - R0.x0, along = alongX ? R0.x1 - R0.x0 : R0.y1 - R0.y0, n = Math.floor((across + pitch - b6[1]) / pitch), out = []; if (n < 1) return out;
      const off = Math.floor((across - ((n - 1) * pitch + b6[1])) / 2 / 50) * 50, box = (s, len, j) => { const d0 = off + j * pitch; return alongX ? { x0: R0.x0 + s, x1: R0.x0 + s + len, y0: R0.y0 + d0, y1: R0.y0 + d0 + b6[1] } : { x0: R0.x0 + d0, x1: R0.x0 + d0 + b6[1], y0: R0.y0 + s, y1: R0.y0 + s + len }; };
      for (let j = 0; j < n; j++) { let s = 0, run = 0; while (s + b4[0] <= along + 1) { const big6 = s + b6[0] <= along + 1 && !blocked(box(s, b6[0], j)), ok = big6 || !blocked(box(s, b4[0], j));
          if (!ok) { s += M / 2; run = 0; continue; } const len = big6 ? b6[0] : b4[0]; out.push({ ...box(s, len, j), c: big6 ? "furniture.bench-6" : "furniture.bench-4", seats: big6 ? per6 : per4, rot: alongX ? 0 : 90 }); s += len; if (++run === 2) { s += M; run = 0; } } }
      return out; };
    const cap = (sl) => sl.reduce((t, x) => t + x.seats, 0), rx = rows(true), ry = rows(false), slots = (cap(ry) > cap(rx) || (cap(ry) === cap(rx) && H > W) ? ry : rx).map((x) => ({ ...x, light: light(x) })).sort((a, b) => a.light - b.light || a.y0 - b.y0 || a.x0 - b.x0);
    const inRooms = rooms.filter((r) => r.u.unit === head && r.u.units).reduce((t, r) => t + r.u.units, 0) + cores.reduce((t, c) => { const u = c.use && U.get(c.use); return t + (u && u.unit === head && u.units && u.id !== openUse.id ? u.units : 0); }, 0), openAsked = lines.filter((l) => l.use === openUse.id).reduce((t, l) => t + (Number(l.units) || 0), 0), need = Math.max(0, people - inRooms, openAsked), things = []; let seats = 0, used = 0;
    for (const x of slots) { if (seats >= need) break; used++; const rest = need - seats, small = x.c === "furniture.bench-6" && rest <= per4, c = small ? "furniture.bench-4" : x.c, len = small ? b4[0] : (x.rot ? x.y1 - x.y0 : x.x1 - x.x0);
      const R = x.rot ? { x0: x.x0, x1: x.x1, y0: x.y0, y1: x.y0 + len } : { x0: x.x0, x1: x.x0 + len, y0: x.y0, y1: x.y1 }; things.push({ c, at: mid(R), rot: x.rot, box: R }); seats += small ? per4 : x.seats; }
    // booths for calls in the deepest places left, three a row and back to back
    let booths = 0; const pod = sz("furniture.phone-booth-pod");
    for (const x of slots.slice(used).reverse()) { if (booths >= pods) break; const len = x.rot ? x.y1 - x.y0 : x.x1 - x.x0, n = Math.floor((len + 300) / (pod[0] + 300));
      for (let j = 0; j < 2 && booths < pods; j++) for (let i = 0; i < n && booths < pods; i++) { const s = i * (pod[0] + 300) + pod[0] / 2, d = j ? b6[1] - pod[1] / 2 : pod[1] / 2, at = x.rot ? { x: Math.round(x.x0 + d), y: Math.round(x.y0 + s) } : { x: Math.round(x.x0 + s), y: Math.round(x.y0 + d) };
        if (posts.some((T) => hits({ x0: at.x - pod[0] / 2, x1: at.x + pod[0] / 2, y0: at.y - pod[1] / 2, y1: at.y + pod[1] / 2 }, T, 150))) continue; things.push({ c: "furniture.phone-booth-pod", at, rot: (x.rot ? (j ? 270 : 90) : (j ? 0 : 180)), box: { x0: at.x - pod[0] / 2, x1: at.x + pod[0] / 2, y0: at.y - pod[1] / 2, y1: at.y + pod[1] / 2 } }); booths++; } }
    // ---- each room: its door to the open floor, and what stands in it
    const count = {}; for (const r of rooms) count[r.use] = (count[r.use] || 0) + 1; const nth = {}, got = {};
    for (const r of rooms) { nth[r.use] = (nth[r.use] || 0) + 1; r.name = r.label || (count[r.use] > 1 ? `${r.u.name} ${nth[r.use]}` : r.u.name);
      const front = rect(r.side, r.s0, r.s1, r.d, r.d), fm = mid(front), inner = { x0: r.x0 + 150, y0: r.y0 + 150, x1: r.x1 - 150, y1: r.y1 - 150 }, w = inner.x1 - inner.x0, h = inner.y1 - inner.y0, c = mid(r), wide = w >= h;
      r.door = fm; const landing = rect(r.side, (r.s0 + r.s1) / 2 - 700, (r.s0 + r.s1) / 2 + 700, r.d - 1350, r.d), stand = (cn, at0, rot) => { const [a, b] = sz(cn), t = rot % 180 ? [b, a] : [a, b], boxAt = (p) => ({ x0: p.x - t[0] / 2, x1: p.x + t[0] / 2, y0: p.y - t[1] / 2, y1: p.y + t[1] / 2 }), along = w >= h ? { x: 1, y: 0 } : { x: 0, y: 1 };
        const at = [0, M / 2, -M / 2, M, -M].map((k) => ({ x: at0.x + along.x * k, y: at0.y + along.y * k })).find((p) => { const X = boxAt(p); return !posts.some((T) => hits(X, T, 150)) && X.x0 >= r.x0 + 100 && X.x1 <= r.x1 - 100 && X.y0 >= r.y0 + 100 && X.y1 <= r.y1 - 100; }) || (posts.some((T) => hits(boxAt(at0), T, 150)) ? null : at0); if (!at) return; things.push({ c: cn, at: { x: Math.round(at.x), y: Math.round(at.y) }, rot, box: { x0: at.x - t[0] / 2, x1: at.x + t[0] / 2, y0: at.y - t[1] / 2, y1: at.y + t[1] / 2 } }); for (const [un, v] of Object.entries(provides[cn] || {})) got[un] = (got[un] || 0) + v; };
      const grid = (cn, most, gap) => { const [a0, b0] = sz(cn), cells0 = (a, b) => Math.max(0, Math.floor((w + gap) / (a + gap))) * Math.max(0, Math.floor((h + gap) / (b + gap))), turn = cells0(b0, a0) > cells0(a0, b0), a = turn ? b0 : a0, b = turn ? a0 : b0, nx = Math.floor((w + gap) / (a + gap)), ny = Math.floor((h + gap) / (b + gap)); let n = 0; if (nx < 1 || ny < 1) return 0;
        const ox = inner.x0 + (w - (nx * (a + gap) - gap)) / 2, oy = inner.y0 + (h - (ny * (b + gap) - gap)) / 2, cells = []; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) cells.push({ x: ox + i * (a + gap) + a / 2, y: oy + j * (b + gap) + b / 2 });
        for (const p of cells.filter((p) => !hits({ x0: p.x - a / 2, x1: p.x + a / 2, y0: p.y - b / 2, y1: p.y + b / 2 }, landing) && !posts.some((T) => hits({ x0: p.x - a / 2, x1: p.x + a / 2, y0: p.y - b / 2, y1: p.y + b / 2 }, T, 150))).sort((p, q) => geo.dist(q, fm) - geo.dist(p, fm))) { if (n >= most) break; stand(cn, p, turn ? 90 : 0); n++; } return n; };
      const n = holds(r);
      if (r.use === "reception") { const k = r.side, back = rect(k, (r.s0 + r.s1) / 2, (r.s0 + r.s1) / 2, r.d * 0.62, r.d * 0.62); stand("furniture.reception-desk", mid(back), k === "S" ? 180 : k === "N" ? 0 : k === "W" ? 90 : 270); }
      else if (r.u.unit === "meeting seat" && r.u.units) { const t = ["furniture.meeting-table-12", "furniture.meeting-table-8", "furniture.meeting-table-4"].filter((cn) => (provides[cn] || {})["meeting seat"] <= Math.max(4, n + 2)).find((cn) => { const [a, b] = sz(cn); return a <= Math.max(w, h) - 300 && b <= Math.min(w, h) - 300; }); if (t) stand(t, c, wide ? 0 : 90); }
      else if (r.u.unit === "dining seat") grid("furniture.cafe-table-4", Math.ceil((n || 8) / 4), 50);
      else if (r.u.unit === "training seat") grid("furniture.training-desk-2", Math.ceil((n || 12) / 2), 100);
      else if (r.use === "cabin") stand("furniture.workstation", c, 0); }
    // ---- how well it meets the programme
    const asked = want.filter((r) => !r.optional).length, placed = rooms.filter((r) => !r.optional).length, openArea = Math.round((W * H / 1e6 - taken.filter((R) => R.x1 - R.x0 < far && R.y1 - R.y0 < far).reduce((t, R) => t + areaR(R), 0)) * 10) / 10, seated = seats + inRooms;
    const meet = rooms.filter((r) => r.u.unit === "meeting seat").reduce((t, r) => t + (r.u.units || 0), 0) + here("meeting seat"), dine = (got["dining seat"] || 0) + here("dining seat"), ratioOk = (SP.ratios || []).filter((q) => q.per === head && people).map((q) => { const have = q.of === "meeting seat" ? meet : q.of === "dining seat" ? dine : q.of === "focus seat" ? booths + here(q.of) + rooms.filter((r) => r.u.unit === q.of).reduce((t, r) => t + (r.u.units || 0), 0) : here(q.of) + rooms.filter((r) => r.u.unit === q.of).reduce((t, r) => t + holds(r), 0); return have >= Math.ceil(q.min * heads - 1e-9); });
    const score = (people ? Math.min(1, seated / people) * 50 : 50) + (asked ? placed / asked * 30 : 30) + (ratioOk.length ? ratioOk.filter(Boolean).length / ratioOk.length * 10 : 10) - spill * 4 - clashes * 3 - notes.length * 5 + Math.min(5, (cap(slots) - seats) / Math.max(1, people) * 10) + (D === 3 * M ? 1 : 0);
    return { sides, D, rooms, left, things, seats: seated, booths, meet, dine, openArea, score, spill, clashes, notes, made, slots };
  }

  // ---- the patterns tried, the best kept
  const pats = [["N"], ["S"], ["W"], ["E"], ["N", "S"], ["W", "E"], ["N", "W"], ["N", "E"], ["S", "W"], ["S", "E"], ["N", "W", "E"], ["S", "W", "E"], ["N", "S", "W"], ["N", "S", "E"], ["N", "S", "W", "E"]], tried = [];
  for (const D of [3 * M, 4 * M]) for (const s of pats) { if (s.some((k) => (k === "N" || k === "S" ? H : W) < D * (s.includes(k === "N" ? "S" : k === "S" ? "N" : k === "W" ? "E" : "W") ? 2 : 1) + 4 * M)) continue;
    tried.push(make(s, D)); if (CORE.length) tried.push(make([...s, ...CORE], D)); } // R131: with the rooms that ask for no window round the core, too
  const sig = (c) => c.rooms.map((r) => `${r.use}:${r.x0},${r.y0},${r.x1},${r.y1}`).sort().join("|"), seen = new Set(), best = tried.sort((a, b) => b.score - a.score).filter((c) => { const k = sig(c); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, Math.max(1, Math.min(6, Number(S.top) || 4)));
  if (!best.length) return none("The floor is too small for a strip of rooms and desks beside it.");
  // ids for the points furniture stands on: a run number no earlier fit of this floor has used
  const runNo = 1 + Math.max(0, ...PL.map((r) => { const x = /^TF(\d+)_/.exec((r.where && r.where.node) || ""); return x ? Number(x[1]) : 0; }));
  const ring = (R) => [{ x: R.x0, y: R.y0 }, { x: R.x1, y: R.y0 }, { x: R.x1, y: R.y1 }, { x: R.x0, y: R.y1 }], rr = (R) => ({ x0: Math.round(R.x0), y0: Math.round(R.y0), x1: Math.round(R.x1), y1: Math.round(R.y1) });
  const candidates = best.map((c) => { const ops = [], fs = c.sides.filter((k) => !SIDES[k].core).map((k) => SIDES[k].name), round = c.rooms.filter((r) => SIDES[r.side].core).length, sidesTxt = `${fs.length > 2 ? `${fs.slice(0, -1).join(", ")} and ${fs[fs.length - 1]}` : fs.join(" and ")}${round ? ` and round the core (${round})` : ""}`;
    for (const r of [...c.rooms].sort((a, b) => solid(b.u) - solid(a.u))) { const R = rr(r), hard = solid(r.u) && dry;
      ops.push({ op: "add_room", input: { level: lv, a: { x: R.x0, y: R.y0 }, b: { x: R.x1, y: R.y1 }, sizes: "centre", as: hard ? { objectRef: dry.id, auto: { by: "preset", preset: "drywall" } } : { kind: "wall", auto: { by: "lines" } }, room: { name: r.name, use: r.use } } }); }
    const door = (at, o) => ops.push({ op: "put_in", input: { level: lv, at: { x: Math.round(at.x), y: Math.round(at.y) }, ...(o ? { objectRef: o.id } : { kind: "door", width: 900 }) } });
    if (c.made) door(c.made.at, glassDoor); for (const r of c.rooms) door(r.door, solid(r.u) ? leafDoor || glassDoor : glassDoor);
    const free = c.things.find((t) => /bench/.test(t.c)), at = free ? free.at : (() => { for (let y = B.y0 + M; y < B.y1; y += M / 2) for (let x = B.x0 + M; x < B.x1; x += M / 2) if (![...cores, ...c.rooms].some((R) => hits({ x0: x - 1, x1: x + 1, y0: y - 1, y1: y + 1 }, R, 100))) return { x, y }; return mid(B); })();
    const open = { name: openUse.name || "Open office", use: openUse.id };
    ops.push(c.rooms.length ? { op: "faces_from_lines", input: { level: lv, at, ...open } } : { op: "edit_space", input: { id: plate.id, ...open } });
    c.things.forEach((t, k) => { const o = lib(t.c); if (!o) return; const id = `TF${runNo}_${k + 1}`; ops.push({ op: "add_node", input: { id, level: lv, x: t.at.x, y: t.at.y } }, { op: "place", input: { objectRef: o.id, on: { node: id }, ...(t.rot ? { rotation: t.rot } : {}) } }); });
    const numbers = { seats: c.seats, ...(people ? { "people in the brief": people } : {}), rooms: c.rooms.length, ...(c.left.length ? { "rooms left out": c.left.length } : {}), ...(c.meet ? { "meeting seats": c.meet } : {}), ...(c.dine ? { "dining seats": c.dine } : {}), ...(c.booths ? { booths: c.booths } : {}), "open office m²": c.openArea, ...(c.seats ? { "m² a seat": Math.round(W * H / 1e4 / c.seats) / 100 } : {}) };
    const why = [c.left.length ? `left out: ${c.left.map((r) => r.u.name).join(", ")}` : "", c.spill ? "rooms ran on to another side" : "", c.clashes ? `${c.clashes} rooms beside one they should be apart from` : "", ...c.notes, people && c.seats < people ? `${people - c.seats} seats short` : ""].filter(Boolean);
    return { label: `Rooms along the ${sidesTxt}, ${m1(c.D)} m deep: ${c.seats} seats${people ? ` for ${people}` : ""}, ${c.rooms.length} rooms${why.length ? ` (${why.join("; ")})` : ""}`.slice(0, 200), numbers,
      preview: { polygons: [...c.rooms.map((r) => ring(rr(r))), ...c.things.filter((t) => /bench/.test(t.c)).map((t) => ring(rr(t.box)))] }, ops }; }); // (the rooms and the desks: what tells one layout from another)
  return { note: `Floor ${m1(W)} m by ${m1(H)} m on a ${m1(M)} m module${cores.length ? `, ${cores.length} core room${cores.length > 1 ? "s" : ""} left as drawn` : ""}; ${entrance ? `entrance on the ${SIDES[entrance.side].name} side` : want.some((r) => r.use === "reception") ? "no entrance door drawn: one is made at the reception" : "no entrance door is drawn"}. ${people ? `For ${people} people` : "No headcount in the programme"}; ${want.length} rooms to place${added.length ? ` (${added.length} added for the typology's ratios: ${[...new Set(added)].join(", ")})` : ""}${pods ? `, ${pods} booths` : ""}${skipped.length ? `; ${skipped.join(", ")}` : ""}.${outside.length ? ` The floor is not a rectangle: ${Math.round(offArea)} m² of its bounding box kept clear.` : ""}${posts.length ? ` ${posts.length} column${posts.length > 1 ? "s" : ""} kept clear of desks and tables.` : ""}`.slice(0, 600),
    context: { polygons: [O, ...cores.map((R) => ring(R)), ...posts.map((R) => ring(R))] }, candidates };
}
