---
name: blender-detail
about: Build an Object's detailed model in Blender on the owner's PC, to the BuilderPluss instancing standard, and hand back the .blend, .usdc, .glb, a preview and the audit.
---

# Blender detail (a session stage on the owner's PC)

You are in your own working folder on the owner's PC with a shell. You build ONE Object's detailed model, for renders only (it is never placed in the model), from the run's Object, the brief and its photos.

## 1. Find Blender (once)

- Windows: try `blender` on the PATH, then the newest `C:\Program Files\Blender Foundation\Blender */blender.exe`. Check it with `"<blender>" --version`.
- No Blender found: change nothing, write `out/session-log.md` saying so, and answer in one sentence that Blender is not installed on this PC.
- Always run it headless: `"<blender>" --background --factory-startup --python build.py -- <args>`. Never open the Blender window, never install add-ons.

## 2. Read before you model

- The Object (run_state / library_get): its contract, parameters (sizes in mm) and limits. Its parameters win on size.
- The brief's photos and pages (files_read / files_glob, or the brief files you can read): proportions, joints, thicknesses, finishes, colours. Where the photo and the brief differ, the brief wins; say the difference in the log.
- The owner's comments if the run was sent back: change only what they ask.

## 3. The standard (non-negotiable)

- Metres, Z up, real-world scale. Origin where the Object mounts (a ceiling raft: its top centre; furniture: floor centre).
- One MASTER mesh per unique part (`<COMPONENT>_MASTER`, mesh `ME_<COMPONENT>`); every repeat is a linked duplicate sharing that mesh (`<COMPONENT>_INSTANCE_01`, `_02` ...). Never copy mesh data for repeats; no Geometry Nodes instances; no negative scale (rotate instead).
- Place instances by object transforms only; never apply rotation or scale on instances. Apply scale on masters.
- Materials named `MAT_<OBJECT>_<Material>` (Wood, Metal, Fabric, Glass ...), Principled BSDF, one per physical material.
- Hierarchy: a collection `<OBJECT>` with `<OBJECT>_STRUCTURE`, `_HARDWARE`, `_INSTANCES` (as fits) and a root empty `<OBJECT>_ROOT`. Never join the whole Object into one mesh.
- Built as made: bevels on visible edges (2-3 mm), real thicknesses, gaps and fixings; clean normals; no floating or intersecting parts; UVs on every mesh (box projection, grain along the part's length).
- Write the build as ONE script, `build.py`, that starts from an empty file (`bpy.ops.wm.read_factory_settings(use_empty=True)`), so a re-run builds the same thing. Never call `bpy.ops.ed.undo`.

## 4. Instancing module

Use `instance_master` for masters, instances and the audit. If `D:\BuilderPluss\scripts\instance_master.py` exists, add that folder to `sys.path`; otherwise write the module below to `instance_master.py` in your folder and use that.

```python
import sys, importlib
sys.path.append(r"D:\BuilderPluss\scripts"); sys.path.append(".")
import instance_master as im; importlib.reload(im); im.register()
leg = im.make_master(obj, "CHAIR_LEG")                      # names it CHAIR_LEG_MASTER, mesh ME_CHAIR_LEG
im.instance(leg, location=(0.4, 0.4, 0), rotation=(0, 0, 90))  # a linked duplicate, CHAIR_LEG_INSTANCE_01
rep = im.full_audit(fix=False, deep=True); print(im.format_report(rep))
```

Repeated parts in a loop (baffles, slats, bolts): build one master, then `im.instance(...)` for each position. Bake rotation into transforms, not mesh data.

## 5. Hand back (everything in out/)

| File | What |
|---|---|
| `out/<object>.blend` | the built file (it stays on this PC; the run records where) |
| `out/<object>.usdc` | `bpy.ops.wm.usd_export(filepath=..., selected_objects_only=False, export_materials=True)` |
| `out/<object>.glb` | `bpy.ops.export_scene.gltf(filepath=..., export_format='GLB')` |
| `out/<object>_preview.png` | Cycles, 1100 x 750, 40 samples with denoising, a neutral floor, three area lights, a camera at about 35 mm framing the whole Object from three-quarters above; view transform Khronos PBR Neutral or AgX |
| `out/<object>_audit.txt` | the INSTANCE AUDIT report from `im.format_report(im.full_audit(fix=False, deep=True))` |
| `out/session-log.md` | the Blender found, what you built (parts, sizes, counts), the audit's result, what the photos left unclear, and how long it took |

`<object>` is the Object's contract with dots as underscores (`project_raft`). Render the preview from the saved .blend in a second Blender call, so a crash in rendering never loses the build.

## 6. Check before you answer

- The audit says PASS for every master, and no generic names (`Cube`, `Cylinder.001`) are left.
- Open the preview with Read and look at it beside the photos: proportions, count of repeated parts, finish. Fix and rebuild if it is wrong (at most twice).
- Then answer in two sentences: what you built (parts, instance counts), the audit, and anything left unclear.

## The instancing module (write this to instance_master.py only if the PC has none)

```python
"""
instance_master.py - BuilderPluss Blender instancing standard (rebuilt from the documented API).
One MASTER mesh per unique component; repeats are Alt+D linked duplicates sharing the master's mesh.

API: register, make_master, instance, find_master, find_equivalent, find_or_create,
     validate, full_audit
"""
import bpy, bmesh, hashlib, math
from mathutils import Euler, Vector

TAG = "bp_master"          # custom prop on master objects: component name
ITAG = "bp_instance_of"    # custom prop on instances

def register():
    """Nothing persistent to register; kept for API compatibility."""
    return True

# ---------------------------------------------------------------- helpers
def _geo_hash(me, digits=5):
    """Geometry signature independent of object transform/name."""
    h = hashlib.sha1()
    h.update(str((len(me.vertices), len(me.edges), len(me.polygons))).encode())
    for v in me.vertices:
        h.update(("%.*f,%.*f,%.*f;" % (digits, v.co.x, digits, v.co.y, digits, v.co.z)).encode())
    for p in me.polygons:
        h.update((",".join(map(str, p.vertices)) + "|").encode())
    return h.hexdigest()

def _mat_sig(me):
    return tuple(m.name if m else "" for m in me.materials)

def _uv_sig(me):
    if not me.uv_layers: return ""
    uv = me.uv_layers.active.data
    h = hashlib.sha1()
    for d in uv[: min(len(uv), 2000)]:
        h.update(("%.4f,%.4f;" % (d.uv.x, d.uv.y)).encode())
    return h.hexdigest()

def _scene_of(obj):
    for sc in bpy.data.scenes:
        if obj.name in sc.objects: return sc
    return None

# ---------------------------------------------------------------- masters
def make_master(obj, component):
    """Name obj <COMPONENT>_MASTER and its mesh ME_<COMPONENT>; tag it."""
    component = component.upper()
    obj.name = f"{component}_MASTER"
    if obj.type == 'MESH':
        obj.data.name = f"ME_{component}"
    obj[TAG] = component
    return obj

def find_master(component):
    component = component.upper()
    for o in bpy.data.objects:
        if o.get(TAG) == component:
            return o
    return None

def find_equivalent(mesh):
    """Return a tagged master whose geometry (and materials/UVs) equal this mesh."""
    sig = (_geo_hash(mesh), _mat_sig(mesh), _uv_sig(mesh))
    for o in bpy.data.objects:
        if o.get(TAG) and o.type == 'MESH' and o.data is not mesh:
            if (_geo_hash(o.data), _mat_sig(o.data), _uv_sig(o.data)) == sig:
                return o
    return None

def find_or_create(component, build_fn):
    """THINK -> CHECK -> reuse an existing master or create one with build_fn() -> obj."""
    m = find_master(component)
    if m: return m, False
    obj = build_fn()
    eq = find_equivalent(obj.data) if obj.type == 'MESH' else None
    if eq:
        bpy.data.objects.remove(obj, do_unlink=True)
        return eq, False
    return make_master(obj, component), True

# ---------------------------------------------------------------- instancing
def _next_index(component):
    pre = f"{component}_INSTANCE_"
    idx = [int(o.name[len(pre):len(pre)+3]) for o in bpy.data.objects
           if o.name.startswith(pre) and o.name[len(pre):len(pre)+3].isdigit()]
    return (max(idx) + 1) if idx else 1

def instance(master, location=(0, 0, 0), rotation=(0, 0, 0), scale=(1, 1, 1), parent=None, suffix=None):
    """Alt+D: bpy.ops.object.duplicate_move_linked on the master, in the master's scene.
    World-space placement; rotation in degrees. Returns the new linked instance."""
    sc = _scene_of(master)
    assert sc is not None, "master is not in any scene"
    vl = sc.view_layers[0]
    win = bpy.context.window
    if win is not None and win.scene != sc:
        raise RuntimeError("Safety rule 2: the window must display the master's scene")
    for o in vl.objects: o.select_set(False)
    master.hide_set(False); master.select_set(True); vl.objects.active = master
    with bpy.context.temp_override(scene=sc, view_layer=vl, active_object=master,
                                   selected_objects=[master], selected_editable_objects=[master]):
        bpy.ops.object.duplicate_move_linked(OBJECT_OT_duplicate={"linked": True},
                                             TRANSFORM_OT_translate={"value": (0, 0, 0)})
    new = vl.objects.active
    assert new is not master and new.data is master.data, "Alt+D failed to produce a linked duplicate"
    comp = master.get(TAG, master.name.replace("_MASTER", ""))
    new.name = f"{comp}_INSTANCE_{suffix}" if suffix else f"{comp}_INSTANCE_{_next_index(comp):02d}"
    if TAG in new: del new[TAG]
    new[ITAG] = comp
    if parent is not None:
        new.parent = parent
        new.matrix_parent_inverse = parent.matrix_world.inverted()
    new.location = location
    new.rotation_euler = Euler([math.radians(a) for a in rotation])
    new.scale = scale
    new.select_set(False)
    return new

# ---------------------------------------------------------------- validation
def validate(master, offset=0.123):
    """Move every vert of the master mesh, confirm all users see it, restore exact coords."""
    me = master.data
    users = [o for o in bpy.data.objects if o.data is me]
    orig = [v.co.copy() for v in me.vertices]
    for v in me.vertices: v.co.z += offset
    ok = all(abs(o.data.vertices[0].co.z - (orig[0].z + offset)) < 1e-5 for o in users)
    for v, c in zip(me.vertices, orig): v.co = c
    me.update()
    restored = all((v.co - c).length == 0 for v, c in zip(me.vertices, orig))
    return {"master": master.name, "users": len(users), "linked_update": ok, "restored": restored}

# ---------------------------------------------------------------- audit
def full_audit(fix=False, rename=False, deep=True):
    """Geometry-based audit. Groups mesh objects by geometry; reports masters/instances,
    true duplicates (same geometry, separate data), kept-unique (same geometry, different mats/UVs),
    negative scale and generic names. fix=True links true duplicates to the master's mesh."""
    groups = {}
    for o in bpy.data.objects:
        if o.type != 'MESH': continue
        groups.setdefault(_geo_hash(o.data), []).append(o)
    report = {"components": [], "kept_unique": [], "warnings": [], "fixed": []}
    generic = ("Cube", "Cylinder", "Plane", "Sphere", "Circle", "Torus", "Cone", "Mesh")
    for o in bpy.data.objects:
        if o.name.split(".")[0] in generic: report["warnings"].append(f"generic name: {o.name}")
        if any(s < 0 for s in o.scale): report["warnings"].append(f"negative scale: {o.name}")
    for gh, objs in groups.items():
        meshes = {}
        for o in objs: meshes.setdefault(o.data.name, []).append(o)
        master = next((o for o in objs if o.get(TAG)), None)
        if len(meshes) > 1:
            by_sig = {}
            for o in objs: by_sig.setdefault((_mat_sig(o.data), _uv_sig(o.data)), []).append(o)
            if len(by_sig) > 1:
                report["kept_unique"].append([o.name for o in objs])
            if fix:
                tgt = master or objs[0]
                for o in objs:
                    if o.data is not tgt.data and (_mat_sig(o.data), _uv_sig(o.data)) == (_mat_sig(tgt.data), _uv_sig(tgt.data)):
                        o.data = tgt.data; report["fixed"].append(o.name)
        if master:
            users = [o for o in objs if o.data is master.data]
            entry = {"component": master[TAG], "master": master.name, "instances": len(users) - 1,
                     "shared": all(o.data is master.data for o in users)}
            if deep: entry["validate"] = validate(master)
            entry["status"] = "PASS" if entry["shared"] and (not deep or (entry["validate"]["linked_update"] and entry["validate"]["restored"])) else "FAIL"
            report["components"].append(entry)
    return report

def format_report(rep):
    out = ["INSTANCE AUDIT", ""]
    for i, c in enumerate(sorted(rep["components"], key=lambda c: c["component"]), 1):
        out += [f"[{i:02d}]", f"Component: {c['component'].replace('_', ' ').title()}",
                f"Master: {c['master']}", f"Instances: {c['instances']}",
                "Method: Alt + D", f"Shared Mesh Data: {'YES' if c['shared'] else 'NO'}",
                f"Status: {c['status']}", ""]
    if rep["kept_unique"]:
        out.append("KEPT UNIQUE (same geometry, different materials/UVs):")
        for g in rep["kept_unique"]: out.append("  - " + ", ".join(g))
    out.append("WARNINGS: " + ("none" if not rep["warnings"] else "; ".join(rep["warnings"])))
    return "\n".join(out)
```
