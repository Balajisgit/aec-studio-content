// solvers/room-areas 1.0.0: Room areas. Proposed from BuilderPluss Studio ("A").
function solve(input, geo) {
  // Polygon area, positive when the points run counter-clockwise.
  const signed = (p) => {
    let t = 0;
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      t += a.x * b.y - b.x * a.y;
    }
    return t / 2;
  };
  const inPoly = (pt, p) => {
    let c = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      const a = p[i], b = p[j];
      if ((a.y > pt.y) !== (b.y > pt.y) && pt.x < ((b.x - a.x) * (pt.y - a.y)) / (b.y - a.y) + a.x) c = !c;
    }
    return c;
  };
  // Move each side by half its wall's thickness (sign 1: inwards, -1: outwards); a square step where walls in line differ.
  const offset = (edges, sign) => {
    const ls = edges.map((e) => {
      const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, l = Math.hypot(dx, dy) || 1;
      const nx = (-dy / l) * e.half * sign, ny = (dx / l) * e.half * sign;
      return { ux: dx / l, uy: dy / l, a: { x: e.a.x + nx, y: e.a.y + ny }, b: { x: e.b.x + nx, y: e.b.y + ny } };
    });
    const out = [];
    for (let i = 0; i < ls.length; i++) {
      const p = ls[i], q = ls[(i + 1) % ls.length];
      const cross = p.ux * q.uy - p.uy * q.ux;
      if (Math.abs(cross) < 0.01) out.push(p.b, q.a);
      else {
        const t = ((q.a.x - p.a.x) * q.uy - (q.a.y - p.a.y) * q.ux) / cross;
        out.push({ x: p.a.x + p.ux * t, y: p.a.y + p.uy * t });
      }
    }
    return out;
  };
  const m2 = (mm2) => Math.round(Math.round(mm2) / 1e4) / 100;
  const r2 = (v) => Math.round(v * 100) / 100;

  // Each wall's half thickness, by the line it is on: set on the wall, else its Object's.
  const byId = {}, byContract = {};
  for (const o of input.library || []) { byId[o.id] = o; byContract[o.contract] = o; }
  const half = {}, unknown = {};
  for (const p of input.placements || []) {
    if (p.kind !== 'wall' || !p.where || !p.where.segment) continue;
    const o = byId[p.objectRef] || byContract[String(p.objectRef).split('@')[0]];
    const t = p.params && typeof p.params.thickness === 'number' ? p.params.thickness : o && o.size ? o.size.d : null;
    if (typeof t === 'number') half[p.where.segment] = Math.max(half[p.where.segment] || 0, t / 2);
    else unknown[p.where.segment] = p.objectRef;
  }

  const sp = (input.spaces || []).filter((s) => s.outline && s.outline.length > 2).map((s) => {
    const pts = s.outline;
    let es = pts.map((a, i) => {
      const e = s.edges.find((x) => x.k === i) || s.edges.filter((x) => x.k <= i).pop();
      const seg = e ? e.segment : null;
      return { a, b: pts[(i + 1) % pts.length], seg, half: half[seg] || 0 };
    });
    if (signed(pts) < 0) es = es.map((e) => ({ ...e, a: e.b, b: e.a })).reverse();
    const e = es[0], l = Math.hypot(e.b.x - e.a.x, e.b.y - e.a.y) || 1;
    // A point 1 mm inside the first side: where this space is.
    const probe = { x: (e.a.x + e.b.x) / 2 - (e.b.y - e.a.y) / l, y: (e.a.y + e.b.y) / 2 + (e.b.x - e.a.x) / l };
    return { s, pts, es, probe, full: Math.abs(signed(pts)) };
  });
  const within = (b, a) => a !== b && a.s.level === b.s.level && b.full < a.full && inPoly(b.probe, a.pts);

  const uses = (input.project && input.project.spaces && input.project.spaces.uses) || [];
  const useOf = {};
  for (const u of uses) useOf[u.id] = u;
  const rows = [], findings = [];
  let allNet = 0, allGross = 0, count = 0;
  const row = (level, room, use, net, gross) => rows.push({ Level: level, Room: room, Use: use, 'Net m²': r2(net), 'Gross m²': r2(gross) });
  for (const lv of input.levels || []) {
    let ln = 0, lg = 0, n = 0;
    for (const a of sp.filter((x) => x.s.level === lv.id)) {
      const u = useOf[a.s.use];
      if (u && u.room === false) continue;
      let gross = a.full, net = Math.abs(signed(offset(a.es, 1)));
      // Rooms standing inside this one (a core in the open floor) are taken out, with their outer walls.
      let inner = sp.filter((b) => within(b, a));
      inner = inner.filter((b) => !inner.some((c) => within(b, c)));
      const seen = {};
      for (const b of inner) for (const e of b.es) seen[e.seg] = (seen[e.seg] || 0) + 1;
      const left = inner.flatMap((b) => b.es.filter((e) => seen[e.seg] === 1));
      while (left.length) {
        const loop = [left.shift()];
        for (;;) {
          const end = loop[loop.length - 1].b;
          const i = left.findIndex((e) => e.a.x === end.x && e.a.y === end.y);
          if (i < 0) break;
          loop.push(left.splice(i, 1)[0]);
        }
        gross -= Math.abs(signed(loop.map((e) => e.a)));
        net -= Math.abs(signed(offset(loop, -1)));
      }
      const name = a.s.name || '';
      const label = name || a.s.id;
      if (!name) findings.push({ message: 'Room ' + a.s.id + ' on ' + lv.name + ' has no name.', severity: 'note' });
      if (uses.length && !a.s.use) findings.push({ message: 'Room ' + label + ' on ' + lv.name + ' has no use.', severity: 'note' });
      const bad = a.es.find((e) => unknown[e.seg]);
      if (bad) findings.push({ message: 'Room ' + label + ': the thickness of wall ' + unknown[bad.seg] + ' is not known, so it is counted as 0 in the net area.', severity: 'note' });
      if (a.pts.length !== a.s.edges.length) findings.push({ message: 'Room ' + label + ' has a curved side: its net area is approximate.', severity: 'note' });
      const rn = m2(net), rg = m2(gross);
      row(lv.name, name || '(no name: ' + a.s.id + ')', u ? u.name : a.s.use || '', rn, rg);
      ln += rn; lg += rg; n++;
    }
    if (n && input.levels.length > 1) row(lv.name, 'Level total (' + n + ' rooms)', '', ln, lg);
    allNet += ln; allGross += lg; count += n;
  }
  if (count) row('All', 'Project total (' + count + ' rooms)', '', allNet, allGross);
  return {
    note: count ? count + ' rooms: net ' + r2(allNet).toFixed(2) + ' m², gross ' + r2(allGross).toFixed(2) + ' m². Net is inside the walls, gross to the wall centre lines.' : 'No rooms are drawn yet.',
    rows,
    findings,
  };
}
