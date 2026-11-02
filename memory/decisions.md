# Decisions

Every decision, newest last, with the session it was made in.

- **2026-10-28 · Session 9** — Owner works on two PCs (office and home) with one Claude subscription; code shared via GitHub.
- **2026-10-28 · Session 9** — Until data sync exists, one PC is the home for Studio work; data moves only by copying data\ and files\ with both apps closed, never via a cloud-synced studio.db.
- **2026-10-28 · Session 9** — Associates change code only via branch and pull request; the owner merges; associates don't use the local Release button.
- **2026-10-29 · Session 10** — Owner: "yes" to a Discuss mode in the app chat, then "merge it".
- **2026-10-29 · Session 10** — Owner: "merge" for removing the Option 1 copy button.
- **2026-10-29 · Session 10** — Discussions are not session memory: keep outcomes by filing a request or by starting from the Option 2 briefing and wrapping up.
- **2026-10-30 · Session 11** — The engine holds the design intent (graph, parameters, validation, light geometry, log); hosts realise it. The Studio is only the interface and passes on what pipelines instruct.
- **2026-10-30 · Session 11** — Element types: node, segment (wall and opening are segment types), space, object, level.
- **2026-10-30 · Session 11** — Outside canvases connect by route 1 (in the page, no AI tokens) or route 2 (API or MCP bridge). One way first; the host gets copies of results, not operations.
- **2026-10-30 · Session 11** — Every canvas, the built-in one included, takes route 1, so any canvas can be the default.
- **2026-10-30 · Session 11** — Claude gets credit for pipeline and freestyle work; the owner only for manual edits.
- **2026-10-30 · Session 11** — A project can use several pipelines, or none; chats are listed in the project's History with tags.
- **2026-10-30 · Session 12** — Owner: "A - bikal is my associate and team member": Canvas13 joins in-page (route 1), reusing Bikal's renderer code.
- **2026-10-30 · Session 12** — Only Canvas13's renderers and catalogue are used; the Studio engine stays the truth and Canvas13 edits become Studio operations. The Studio Inspector serves Canvas13; Canvas13's own panel is not brought in.
- **2026-10-30 · Session 12** — Layers are a per-browser display choice in the Canvas13 host, never in the model; levels belong to the Studio model and Canvas13 only chooses how to show them.
- **2026-10-30 · Session 12** — Owner: "Ok" to adding BIM data to the Studio model; scope "BIM properties, Property schedules, Automatic marks", values at "Instance and type". Engine changes go through a Registry request.
- **2026-10-30 · Session 12** — Owner merges: "Merge" (req/canvas13), "Ok merge" (Layers), "Merge and update studio artifact after" (Levels), "merge" (req/chat-general), "merge" (req/chat-deleted).
- **2026-10-30 · Session 12** — Owner: "Update the Studio 2 from the github": Studio 2 updates from chat through the existing publish task, never by hand.
- **2026-10-30 · Session 12** — A chat works on a project only when the project is in its list (created, started, read, handed over, or picked with +); a project open on screen doesn't make a chat about it.
- **2026-10-30 · Session 13** — Owner: library manager 'should be independent'; handover is a default option every pipeline has; 'Orchestration decides'.
- **2026-10-30 · Session 13** — Owner: library manager 'takes any kind of input. Even a 3d model generated thru freestyle'; it matches, and adds as new when nothing matches. Housekeeping mode with no project: 'Yes'.
- **2026-10-30 · Session 13** — Owner: every library item has 'a svg for 2d display, a 3d primitive and detailed 3d one which is optional'; then 'Detailed 3d is not required now. Only 2d and primitive 3d is enough'.
- **2026-10-30 · Session 13** — Owner: at a handover with one matching pipeline, 'Go ahead when there's only one, and tell you'; several matches: ask the owner.
- **2026-10-30 · Session 13** — Owner: 'Handover should not create a project. A project created only by the user at start manual or thru chat'; a handover gives its output as input to another pipeline, 'even a freestyle can pickup'.
- **2026-10-30 · Session 13** — Owner: 'Ya as of now' read as: a pipeline may pick up an output from another project too, for now.
- **2026-10-30 · Session 13** — Owner: in freestyle, the chat agent first asks the library manager for a report; Claude makes what is missing and places it; orchestration sends new items to the library manager, which adds them as preview. Promotion stays the owner's (R5).
- **2026-10-30 · Session 13** — Owner: 'Can we do here' and 'Ok': Request A built in this chat on branches; 'Merge' twice (req/library-three-reps, req/type-check-newest); 'Ok update studio 2' and 'Update studio 2'.
- **2026-10-30 · Session 13** — The type-representations check reads 'every parameter changes all three' as: a parameter that changes the footprint must change the 2D symbol, and every parameter must change something (a height can't change a plan).
- **2026-10-31 · Session 18** — Owner: 'delete all the types and lets create new on the fly while doing projects. also give option to delete the types'.
- **2026-10-31 · Session 18** — Owner: 'change the Types name to Library - everywhere it needs to'. The canvas Library tool (O) keeps its name.
- **2026-10-31 · Session 18** — Owner: 'make A as built. continue b and c'; then 'merge' (delete-types), 'merge b', 'ok' (fix C's versions, input name and sync), 'merge' (registry-draft-version).
- **2026-10-31 · Session 18** — A placed library type can't be deleted (R10); deleted library docs are copied to library_deleted first (R12).
- **2026-10-31 · Session 18** — A pipeline takes an output when one of its inputs has the output's type as id and a handover format; routing reads declared inputs, not a fixed next pipeline.
- **2026-10-31 · Session 18** — Library types have no stable-approval button; they become stable only through a pipeline release gate.
- **2026-10-31 · Session 18** — Requests filed from a session get explicit, checked-free REQ ids. Fix files for local sessions do not call memory_start.
