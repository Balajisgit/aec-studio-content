// solvers/doors-and-windows 1.0.0 — Doors and windows (R150): a first set for a plan whose rooms are drawn and named, as
// layouts to pick from. In: each floor's spaces (outline, edges with the kinds on each line), the doors and windows already
// there, and the typology's uses (which want a window, which are wet, which are open, which are kept apart). Out: two
// candidates of put_in operations (kind door or window: the project's own Objects, as its template says). Nothing changes
// until the owner picks one. Doors: from the entrance (the living room's longest outside wall, or the wall between the living
// room and a sit-out) on the ground floor, and from the stair on the floors above, a way into every room, reached through the
// circulation first (passage, stair, living, dining, lounge), never straight between uses kept apart; layout A opens a
// bathroom off a bedroom next to it, layout B off the circulation; a utility opens off the kitchen where it can. Rooms with no wall between them (an open side) are one.
// Windows: on the longest outside wall of every room that wants daylight, glass about a share of its floor area (1.2 m high),
// two in a room over 20 m² with two outside walls; a 600 × 600 high window in a wet room with an outside wall.

function solve(input, geo) {
  const S = input.settings || {}, glass = Math.min(0.3, Math.max(0.05, Number(S.glass) || 0.1));
  const P = (input.project || {}).spaces || {}, uses = new Map((P.uses || []).map((u) => [u.id, u])), apart = (P.apart || []).map((p) => p.join("|"));
  const kept = (a, b) => apart.includes(`${a}|${b}`) || apart.includes(`${b}|${a}`);
  const HUB = new Set(["passage", "stair", "living", "dining", "family-lounge", "foyer", "lobby"]), BED = new Set(["bedroom", "master-bedroom"]), BATH = new Set(["bathroom", "powder-room"]);
  const useOf = (f) => (f.use && uses.get(f.use)) || {}, wet = (f) => !!useOf(f).wet, open = (f) => !!useOf(f).open;
  const isSpace = (f) => f.use && !["plot", "footprint", "void"].includes(f.use) && useOf(f).room !== false;
  const levels = [...(input.levels || [])].sort((a, b) => (a.elevation || 0) - (b.elevation || 0));
  const area = (pts) => { let t = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; t += a.x * b.y - b.x * a.y; } return Math.abs(t / 2) / 1e6; };
  const len = (e) => Math.hypot(e.b.x - e.a.x, e.b.y - e.a.y), mid = (e) => ({ x: Math.round((e.a.x + e.b.x) / 2), y: Math.round((e.a.y + e.b.y) / 2) });
  const along = (e, d) => { const L = len(e) || 1; return { x: Math.round(e.a.x + ((e.b.x - e.a.x) * d) / L), y: Math.round(e.a.y + ((e.b.y - e.a.y) * d) / L) }; };
  const r300 = (x) => Math.round(x / 300) * 300;
  const openings = (input.placements || []).filter((p) => ["door", "window", "gate"].includes(p.kind) && p.where && p.where.segment);
  const doorOn = new Set(openings.filter((p) => p.kind !== "window").map((p) => p.where.segment)), anyOn = new Set(openings.map((p) => p.where.segment));
  const unnamed = (input.spaces || []).filter((f) => !f.use && (f.edges || []).some((e) => (e.kinds || []).includes("wall"))).length;

  function plan(attached) {
    const ops = [], used = new Set(), lost = [], marks = []; let doors = 0, windows = 0;
    const door = (lv, e, w, why) => { const L = len(e), at = L >= w + 700 ? along(e, 350 + w / 2) : mid(e); ops.push({ op: "put_in", input: { level: lv, at, width: w, kind: "door" } }); used.add(e.segment); doors++; marks.push(at); void why; };
    for (const [k, lv] of levels.entries()) {
      const sp = (input.spaces || []).filter((f) => f.level === lv.id && isSpace(f)); if (!sp.length) continue;
      const owners = new Map(); for (const f of sp) for (const e of f.edges || []) { if (!owners.has(e.segment)) owners.set(e.segment, []); owners.get(e.segment).push(f); }
      const walled = (e) => (e.kinds || []).includes("wall"), outside = (f) => (f.edges || []).filter((e) => (owners.get(e.segment) || []).length === 1 && walled(e));
      // who reaches whom without a door: no wall between them, or a door there already
      const reached = new Set(), spread = (f) => { const todo = [f]; while (todo.length) { const x = todo.pop(); if (reached.has(x.id)) continue; reached.add(x.id);
        for (const e of x.edges || []) for (const y of owners.get(e.segment) || []) if (y !== x && !reached.has(y.id) && (!walled(e) || doorOn.has(e.segment) || used.has(e.segment))) todo.push(y); } };
      // the way in: on the ground floor the entrance, above it the stair
      let start = null;
      if (k === 0) { const sit = sp.find((f) => f.use === "sit-out"), living = sp.find((f) => f.use === "living") || sp.find((f) => f.use === "passage") || sp.find((f) => !open(f)) || sp[0];
        const between = sit && living && (sit.edges || []).find((e) => (owners.get(e.segment) || []).includes(living) && walled(e));
        if (between) { start = sit; if (!doorOn.has(between.segment)) door(lv.id, between, 1000, "entrance"); }
        else { start = living; const out = outside(living).filter((e) => !anyOn.has(e.segment) && len(e) >= 1700).sort((a, b) => len(b) - len(a))[0];
          if (out && !sp.some((f) => outside(f).some((e) => doorOn.has(e.segment)))) door(lv.id, out, 1000, "entrance"); } }
      else start = sp.find((f) => f.use === "stair") || sp.find((f) => f.use === "passage") || null;
      if (!start) { lost.push(...sp.filter((f) => !open(f)).map((f) => `${f.name || f.id} (${lv.name || lv.id}: no stair to come up by)`)); continue; }
      spread(start);
      const tier = (f) => (HUB.has(f.use) ? 0 : wet(f) ? 2 : 1);
      for (let guard = 0; guard < 200; guard++) {
        let best = null;
        for (const u of sp) { if (reached.has(u.id)) continue;
          for (const e of u.edges || []) { if (!walled(e) || used.has(e.segment)) continue; const wdt = wet(u) ? 750 : 900; if (len(e) < wdt + 300) continue;
            for (const r of owners.get(e.segment) || []) { if (r === u || !reached.has(r.id) || kept(u.use, r.use)) continue;
              const pref = BATH.has(u.use) ? (attached ? (BED.has(r.use) ? 0 : HUB.has(r.use) ? 1 : 3) : (HUB.has(r.use) ? 0 : BED.has(r.use) ? 2 : 3)) : u.use === "utility" ? (r.use === "kitchen" ? 0 : HUB.has(r.use) ? 1 : 3) : HUB.has(r.use) ? 0 : 1; // a bathroom off a bedroom (A) or the circulation (B); a utility off the kitchen
              const score = tier(u) * 10 + pref; if (!best || score < best.score) best = { score, u, e, w: wdt }; } } }
        if (!best) break; door(lv.id, best.e, best.w); spread(best.u);
      }
      for (const f of sp) if (!reached.has(f.id) && !open(f)) lost.push(f.name || f.id);
      // windows
      for (const f of sp) { const u = useOf(f); if (open(f) || !(u.window || u.wet)) continue;
        const outs = outside(f).filter((e) => !used.has(e.segment)).sort((a, b) => len(b) - len(a));
        if (outs.some((e) => openings.some((o) => o.kind === "window" && o.where.segment === e.segment)) || !outs.length) continue;
        if (!u.window && u.wet) { const e = outs[0]; if (len(e) < 1200) continue; ops.push({ op: "put_in", input: { level: lv.id, at: mid(e), width: 600, kind: "window", params: { sill: 1500, height: 600 } } }); used.add(e.segment); windows++; marks.push(mid(e)); continue; }
        const A = area(f.outline || []), two = A > 20 && outs.length > 1 && len(outs[1]) >= 1500, need = (A * glass * 1000) / 1.2;
        for (const e of outs.slice(0, two ? 2 : 1)) { const room = len(e) - 600; if (room < 600) continue;
          const w = Math.min(2400, room, Math.max(900, r300(two ? need / 2 : need))); ops.push({ op: "put_in", input: { level: lv.id, at: mid(e), width: w, kind: "window" } }); used.add(e.segment); windows++; marks.push(mid(e)); } }
    }
    return { ops, doors, windows, lost, marks };
  }
  const A = plan(true), B = plan(false), sq = (p) => [{ x: p.x - 250, y: p.y - 250 }, { x: p.x + 250, y: p.y - 250 }, { x: p.x + 250, y: p.y + 250 }, { x: p.x - 250, y: p.y + 250 }];
  const cand = (name, x) => ({ label: `${name}: ${x.doors} doors, ${x.windows} windows`, numbers: { doors: x.doors, windows: x.windows, "rooms with no way in": x.lost.length }, preview: { polygons: x.marks.map(sq) }, ops: x.ops });
  const out = []; if (A.ops.length) out.push(cand("Bathrooms off the bedrooms", A));
  if (B.ops.length && JSON.stringify(B.ops) !== JSON.stringify(A.ops)) out.push(cand("Bathrooms off the passages and common rooms", B));
  const lost = [...new Set([...A.lost, ...B.lost])];
  return { note: `${out.length ? "Doors and windows are the template's own; move or resize any once placed." : "Every room has its way in and its windows already."}${lost.length ? ` No way in found for: ${lost.join(", ")} (a wall too short for a door, or only next to a room it is kept apart from).` : ""}${unnamed ? ` ${unnamed} space(s) have no use yet: name them so they get their doors and windows.` : ""}`, candidates: out };
}
