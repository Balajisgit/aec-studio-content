# Lessons

What agents should keep in mind, learned from the owner's corrections. A stage that names the `lessons` context source is given:

- `lessons/all.md`: lessons for every agent;
- `lessons/<agent id>.md`: lessons for one agent (for example `lessons/maker.md`, `lessons/chat.md`).

One lesson per line, starting with `- `, in plain words, newest last, with where it came from (a run, a chat, the owner).

They come from the owner's corrections, and the app commits them straight to main (like requests), because the owner decided them:

- at a decision in a run, tick **Keep my comment as a lesson**: the comment goes to the agent of the stage before the decision (or the stage it sends back to);
- in a chat, ask Claude to remember something for an agent (the `lesson_keep` tool);
- on the Pipelines page, under Lessons: add one, or remove one.

Edits by hand go by pull request like any definition.
