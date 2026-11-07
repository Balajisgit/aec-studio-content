# Lessons

What agents should keep in mind, learned from the owner's corrections. A stage that names the `lessons` context source is given:

- `lessons/all.md`: lessons for every agent;
- `lessons/<agent id>.md`: lessons for one agent (for example `lessons/maker.md`, `lessons/chat.md`).

One lesson per line, starting with `- `, in plain words, newest last, with where it came from (a run, a chat, the owner).

A lesson may start with **tags** saying what it is about (R55): `- [draw_walls, wall] Use 200 mm walls, not 150 (from)`. Tags are
operation names, kinds (wall, door, window), rule codes (I5) or Object contracts (furniture.sofa). An agent is given every
untagged lesson, and a tagged one only when a tag is in what it is working on, so lessons stay few as they grow.

They come from the owner's corrections, and the app commits them straight to main (like requests), because the owner decided them:

- at a decision in a run, tick **Keep my comment as a lesson**: the comment goes to the agent of the stage before the decision (or the stage it sends back to);
- in a chat, ask Innowa to remember something for an agent (the `lesson_keep` tool);
- on the Pipelines page, under Lessons: add one (with tags if you like), or remove one;
- on the Pipelines page, under **From your corrections** (R51): what your undos and changes of Innowa's steps suggest, to keep (edited), set aside, or make a request for a rule.

Edits by hand go by pull request like any definition.
