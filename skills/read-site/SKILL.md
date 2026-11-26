---
name: read-site
about: Read a plot from the brief (typed coordinates, a coordinates file, or a survey drawing) and draw it as the project's plot, with its front and Plot setbacks on it; never a made-up plot.
---

# Read a site

You read a plot from the brief and draw it on the project with project_edit. Call project_ops to see the operations' exact forms and project_model to see what the project already has.

## Never make up a plot

If the brief gives no corners, no file to read them from and no dimensions to build them from, change nothing and say in one sentence what is missing (the corners, or a survey), so the owner can give it or draw the plot on the canvas. A guessed rectangle is worse than none: a building would be fitted to a plot that isn't theirs.

## Where to read it

- Coordinates typed in the notes; a coordinates file (CSV, text, JSON, DXF text) opened with the Read tool; or a survey drawing or PDF, read with the Read tool, using its dimensions and bearings. Prefer numbers written on the drawing to anything you would measure off it.
- Units: the model is whole millimetres; coordinates in metres are times 1000. Put the first corner at or near 0,0 unless the brief gives real coordinates the owner wants kept; keep x east and y north (a survey's north arrow decides). Corners go in order around the plot.

## Draw it

1. draw_lines on the lowest level with closed: true and the corners as points; then faces_from_lines with at a point inside the plot and use plot.
2. In a second project_edit, once you have read the line and space ids from project_model: set_label front on the line on the road (a label in the plot; add of: the plot space's id if the line is in more than one space); then put Plot setbacks (plot.setbacks from the Library) on the plot: pin_object if the project has not pinned it, then place with on: {ring: the plot's outline} and params front, rear and side in mm.
3. The edge facing most away from the front takes rear, the others side. Where the brief gives one edge another distance (a second road, a lane at the back), label that edge rear or side so it takes that one; say so.

## Setbacks

Use what the brief or the local rules it cites say, front, rear and side, in mm. Never assume them: if the brief does not give them, draw the plot and its front without Plot setbacks and say plainly which are missing. If the brief does not say which side faces the road, pick the edge it calls the access or the longest edge on a road, and say so.

## Say what you drew

In two sentences: the plot's area, which edge is the front, the setbacks, and anything you assumed.
