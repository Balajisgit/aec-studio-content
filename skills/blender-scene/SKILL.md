---
name: blender-scene
about: Build one Blender scene from a project's model on the owner's PC (shell, placed Objects from their detail, lights, cameras matched to the reference slides) and hand back the .blend, a preview and a report.
---

# Blender scene (a session stage on the owner's PC)

You are in your own working folder on the owner's PC with a shell. You build ONE scene .blend of the project: the shell from its model, every placed Object (its detailed .blend where it has one, else its plain shape), lights, and cameras matched to the reference slides. It is for renders; nothing you do changes the project's model.

## 1. Find Blender (once)

- Windows: `blender` on the PATH, else the newest `C:\Program Files\Blender Foundation\Blender */blender.exe`; check it with `"<blender>" --version`.
- None: change nothing, write `out/session-log.md` saying so, and answer in one sentence that Blender is not installed on this PC.
- Always headless: `"<blender>" --background --factory-startup --python build_scene.py -- <args>`. Never open the window, never install add-ons.

## 2. Read before you build

- `scene_get`: the levels and every item (an attached Object): `object`, `meaning` (wall, door, window, slab, room, furniture, fixture ...), `on` (node, segment, face), where it stands, `params`, `parts` (plan outlines in mm with `z0`/`z1` in mm above datum, `holes` where a part has openings) and, per Object in `objects`, its `detail` files or none. Save its answer to `scene.json` in your folder and build from that file.
- The brief's files (files_read / files_glob, or the brief files you can read): the reference slides or photos. Look at each one: the view, the mood, the light, the finishes.
- The notes and the owner's comments (if the run was sent back, change only what they ask).

## 3. Units and placing

- The model is integer mm, x east, y north, z up. Blender is metres: divide by 1000.
- A **node** item stands at `at` (x, y, z) turned `rotation` degrees anticlockwise about z.
- A **segment** item runs from `line.a` to `line.b`: its origin at the middle of the line, its x along the line, turned `atan2(b.y - a.y, b.x - a.x)`; z is the level's floor.
- A **face** item's parts are already in place.

## 4. The shell and plain shapes

- For each item whose Object has no `detail` (walls, slabs, floors, ceilings, and Objects not yet detailed): make each part a mesh by extruding its outline (and its holes) from `z0` to `z1`, with bmesh (`bmesh.ops.triangle_fill` or `contextual_create` for the cap, then extrude). Recalculate normals; bevel visible edges 2 mm on furniture, none on walls.
- Name them `<MEANING>_<ROLE>` (`WALL_r12`, `SLAB_r3`). Materials `MAT_SCENE_<Meaning>`, one per meaning (Paint for walls, Concrete for slabs, Oak for floors unless the slides say otherwise; match the slides' colours).
- Repeats of the same plain shape (same Object and same params) follow the instancing standard: one master mesh and linked duplicates (see the skill blender-detail and `instance_master`).
- Put the plain-shape Objects that should have a detail in a collection `SCENE_PLAIN` so the owner can see what is still plain.

## 5. Detailed Objects

- An Object whose `detail` has a `.blend` kept on this PC (`kept: "pc"`, `folder`, `path`): its file is at that named folder's path + `path` (the named folders are listed in your instructions). Open nothing there for writing.
- Append (never link) its top collection once: `with bpy.data.libraries.load(path, link=False) as (src, dst): dst.collections = [c for c in src.collections if c == top]`, where `top` is the collection holding `<OBJECT>_ROOT` (the empty with no parent). Then link it under `SCENE_OBJECTS`.
- Place it by its root empty: location and z rotation as in section 3. For the second and later items of the same Object, copy the root's hierarchy as linked duplicates (`obj.copy()` sharing `obj.data`), never `Shift + D` with new mesh data.
- Its `params` may differ from the detail's (a longer sofa): if the size differs by more than 5%, scale the root to fit and say so in the report; never edit the detail's meshes.
- A detail file that is missing on this PC: use the plain shape, and list it in the report.

## 6. Lights and cameras

- World: a soft grey-blue sky, strength 0.3 to 0.6. Interiors: area lights under each ceiling (one per 15 to 20 m² of room, 3500 to 4000 K), plus the lights the slides show (pendants, coves). Exteriors or big glazing: a sun matching the slides' shadows.
- One camera per reference slide or photo, `CAM_<SLIDE_FILE_NAME>` (upper case, no extension): eye height 1.5 to 1.7 m unless the slide is from above, 24 to 35 mm, framed to match the slide (what is in view, where the horizon sits). With no slides: `CAM_01` to `CAM_03`, three-quarter views of the main rooms and one overview.
- View transform AgX (or Filmic in older Blender), exposure about 0.

## 7. Hand back (everything in out/)

| File | What |
|---|---|
| `out/<project>_scene.blend` | the scene, with images packed (`bpy.ops.file.pack_all()`); it stays on this PC |
| `out/<project>_scene_preview.png` | the first camera, Cycles, 1280 x 800, 16 to 24 samples with denoising (GPU if there is one: OptiX, CUDA, HIP, else CPU at 960 x 600, 8 samples) |
| `out/scene_report.md` | levels; items placed by meaning; which Objects came from their detail and which are plain (and why); the cameras and the slide each matches; anything scaled or missing; how long the build and the preview took |
| `out/session-log.md` | the Blender found and the commands you ran |

`<project>` is the project's name in lower case with spaces as underscores. Render the preview from the saved .blend in a second Blender call, so a crash in rendering never loses the scene.

## 8. Check before you answer

- Every item in `scene.json` is in the scene (count them by meaning) and sits on its level's floor.
- `instance_master.full_audit(fix=False, deep=True)` passes for the plain-shape masters; no generic names (`Cube`, `Plane.001`) are left.
- Open the preview with Read and look at it beside its slide: the view, the furniture in it, the light. Fix and rebuild if it is clearly wrong (at most twice).
- Then answer in two sentences: what is in the scene (items, how many from their detail, how many plain), the cameras, and anything missing or unclear.
