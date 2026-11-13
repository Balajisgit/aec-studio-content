---
name: blender-render
about: Render a scene's cameras in Blender on the owner's PC, fast (the quick render), each with a product mask, named to pair with its reference slide, and hand them back.
---

# Blender render (a session stage on the owner's PC)

You are in your own working folder on the owner's PC with a shell. You render the cameras of ONE scene .blend, quickly, as the base images the owner reviews (and, later, Krea enhances). You never change the scene file itself.

## 1. Find Blender and the scene

- Blender: as in the skill blender-scene (`blender` on the PATH, else the newest `C:\Program Files\Blender Foundation\Blender */blender.exe`); always `--background --factory-startup`. None: change nothing, write `out/session-log.md`, and say so in one sentence.
- The scene: `scene_files` lists the scene .blend files with their PC, named folder and path; take the newest unless the notes name one. Its file is at that named folder's path + `path` (the named folders are listed in your instructions). Copy it into your working folder first (`scene.blend`) and render the copy; never save over the original.
- None listed: change nothing and say that Make a scene has to run first.

## 2. Which cameras, and their names

- The cameras are the objects whose name starts with `CAM_`. Render the ones the notes name, else all of them.
- Each render is named after the reference it matches, so the review can set them side by side: for a reference file `slide51.png` (in the brief's files) and its camera `CAM_SLIDE51`, write `slide51_cycles.png` and `slide51_mask.png`. Match a camera to a reference by name, ignoring case and the `CAM_` prefix. A camera with no reference keeps its own name (`CAM_02_cycles.png`).

## 3. The quick render (about 30 s a view on a GPU)

Write `render.py` and run it once per camera: `"<blender>" -b scene.blend --factory-startup -P render.py -- <CAMERA> <OUT NAME>`.

- GPU first: in `bpy.context.preferences.addons["cycles"].preferences`, try OPTIX, CUDA, HIP, METAL, ONEAPI in turn (`compute_device_type`, `get_devices()`, switch on the devices of that kind), set `scene.cycles.device = "GPU"`; none: CPU.
- Cycles, GPU: 1600 x 1000, 24 samples; CPU: 960 x 600, 8 samples. Adaptive sampling (threshold 0.1), denoising on (OptiX denoiser on OptiX, else OpenImageDenoise), bounces 4 (diffuse 2, glossy 2, transmission 4, transparent 4), caustics off, light tree on, texture limit 1024, persistent data on.
- View transform as the scene has it (AgX or Filmic); save PNG to `out/<OUT NAME>_cycles.png`.
- The mask, at the same size: Workbench, flat shading, object colour: black for the products (each Object brought from its detail and the furniture, fixtures, feature walls, pendants and plants), white for the rest (walls, floor, ceiling, sky); no shadows, no outlines, white background. Save `out/<OUT NAME>_mask.png`. White is what an AI may change; black is protected.
- Time each render and write it down.

## 4. Hand back (everything in out/)

| File | What |
|---|---|
| `out/<name>_cycles.png` | each camera's quick render |
| `out/<name>_mask.png` | its product mask |
| `out/render_report.md` | the scene file rendered, each camera with its reference, the device (GPU kind or CPU), the size, samples and seconds per view |
| `out/session-log.md` | the Blender found and the commands you ran |

## 5. Check before you answer

- Every camera asked for has a `_cycles.png` and a `_mask.png` of the same size.
- Open each render with Read and look at it beside its reference: is it the same view? A black or blown-out image, or a camera inside a wall, is fixed by fixing the copy's camera or lights (never the original scene) and rendering again, at most twice; say what you changed.
- Then answer in two sentences: the views rendered (and their references), the device and the time per view, and anything that looked wrong.
