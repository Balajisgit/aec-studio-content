---
name: make-object
about: Make a Library-style Object for a Need: parameters with limits, a 2D symbol and a 3D primitive that agree at every setting, passing the Library check.
---

# Make an Object

You make Library-style Objects: JSON with id, name, contract, kind, behaves, about, params (defaults), limits (min, max, step for numbers; options for text), symbol2d and primitive3d.

## Before you make it

- Find the Library Objects closest to what you are making (library_list, then library_get for two or three of them) and follow their form exactly. An agent stage may be given them in full already.
- Open the page or photo the Need's evidence cites with the Read tool, and read what the reader saw and why the matcher found nothing that fits. Make what the brief shows, not a generic version: its parts, how it opens, its materials (pick each part's slot to match the real material).
- Follow the owner's comments if there are any. Where what to make is unclear and it matters (no size for something sized to a room, two ways it could open), and you are working with the owner in a chat, ask him one short question first.

## The form

- The local frame: millimetres, origin at the centre of the footprint on the floor, x to the right, y to the Object's front, z up.
- Every number may be a formula of the parameters ("width - 2 * leg"), read by a small parser: + - * / % ( ) comparisons, && || ! ?:, and min max abs round floor ceil sqrt clamp. A shape or part may repeat with count (i = 0..n-1, n) or be conditional with when.
- symbol2d shapes: rect {at:[x,y], size:[w,d]}, line {from, to}, circle {at, r}, arc {at, r, start, end}, polyline {points, closed}; style fill (the outline), outline, hidden (dashed) or thin.
- primitive3d parts: box {at:[x,y,z], size:[w,d,h]} and cylinder {at:[x,y,z], size:[diameter, h]}, z the bottom of the part; give each part a slot (frame, seat, fabric, wood, metal, mattress, concrete, glass).
- The 2D symbol must cover the same footprint as the 3D primitive at every parameter setting, every number parameter needs limits, and every parameter must change something. Parameter names are lower case with underscores and must not be i, n, true, false or a function name (for example not round).
- The id is project.<short-name>@1.0.0 and the contract project.<short-name>, both lower case with hyphens (for example project.window-seat). Its kind is its word, usually furniture.
- behaves says what it does, from band, holds-openings, opening, way-through, stops-bands and cuts-floor-above: [] for anything that only stands where it is put (furniture, a fixture); a door is ["opening", "way-through"], a window ["opening"], a wall ["band", "holds-openings"].

## Check and save

- Use library_check on your draft and fix every finding before you save it with object_put {need, object}. object_put runs the same check and refuses a failing Object.
- Save one Object per Need you were asked to make; then say what you made, its parameters and their limits, and anything you assumed (a size the brief did not give).
- If the run was sent back, the owner's comments say what to change: change exactly that, keep the rest, and save again.
