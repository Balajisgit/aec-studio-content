# Briefing

_Generated from memory/core.md and memory/sessions/; do not edit by hand. Next session: 38._

## What this is

BuilderPluss Studio (formerly AEC Studio 6), owned by Balaji (BuilderPluss): a local-first app for agentic AEC design, rebuilt from first principles in November 2026 as eight managers around one design kernel. It will be hosted later; nothing in it assumes one PC. Its chat assistant is **Innowa**, built on Claude (owner, 7 Nov 2026); pipeline agents keep their own names. Balaji is the only approver; associates (Bikal) may propose on the content repository.

- **App (code):** private GitHub repository `Balajisgit/aec-studio`, branch main. Started on the PC with `Start-Builderpluss.bat` (D:\aec-studio; the old `Start-Studio.bat` still works). The repositories keep the name aec-studio, at http://127.0.0.1:3000.
- **Content (everything shared that is not code):** private repository `Balajisgit/aec-studio-content`, cloned next to the app (D:\aec-studio-content). Pipelines, agents, skills, checks, panels, solvers; the Library; canvas setups; settings; memory (this briefing, sessions, decisions, lessons).
- **PC:** the database (projects, runs, model logs, chats) and folders (project files, backups, Object assets by fingerprint; R2 later). Project work moves between PCs only by export and import.
- **Architecture:** the owner's doc *AEC Studio 6 — Architecture* (2 Nov 2026); the short version is `docs/architecture.md` in the app repository.
- **The old app** (AEC Agent Studio 2, `Balajisgit/aec-agent-studio`, D:\aec-agent-studio-5.1) is to be archived now that phase 5 is built (the owner's call). Its pipelines, agents, checks and rules are not carried over.

## Managers and build phases

Studio (phase 1: versions, updates, settings, Claude runtime) · Memory & Discussion (phase 2: the chat, sessions, briefing, decisions) · Projects and Canvas (phase 3) · Library (phase 4) · Pipelines (phase 5, new ones with the rules) · Files and Storage (phase 6, ready for hosting). All six phases are built (2 Nov 2026).

- **Online preview:** artifact "BuilderPluss Studio" (claude.ai/artifact/TeL8fLtYta3eXyqe1jVMt6), built from both repositories with the app's tools/online/build.mjs and republished on request; projects there are a sandbox in the browser, and chat, runs, files and storage need the PC.
- **Pull requests always target main** (no stacked PRs).

## Words

Library (the shared collection) · Object (one Library entry: parameters, a 2D symbol, a 3D primitive, materials; versioned, never changed in place) · Placement (an Object used in a project) · Need (what a brief calls for, before matching) · Stage, Decision, Output (pipelines) · Project Object (an Object kept in one project, id project.<name>@1.0.0, not yet in the Library). The word "type" is not used.

## The kernel (mesh-light)

The model stores intent, never triangles: nodes, segments (walls and others), openings on a segment at a station in mm, spaces as cycles of segments, Placements at a level, a segment or a node, analytical primitives, rare escapes. Integer mm, snap 5 mm, nothing stores a coordinate it can derive, provenance on every element, GlobalIds as uuid5 in IFC's form. Invariants I1–I11 run after every operation; a step that adds a failure is refused. Exchange format `model.json`, schema 2.0 (`kernel/model.schema.json`). JavaScript kernel; a Python helper comes later for IFC export.

## How changes happen

- **Code and definitions:** a pull request opened from a chat (Innowa in the app, or Claude on claude.ai) (or by an associate on content); automatic checks run on GitHub; only the owner merges. The app holds no GitHub token.
- **Records** (sessions, decisions, lessons, layout patterns, replayed-brief results): committed straight to the content repository, by the app with the PC's Git sign-in, or by a chat outside the app.
- **Proposals and settings requests:** the app commits a record (`library/proposals/`, `requests/settings/`) with the PC's Git sign-in; a content Action turns each into a pull request; only the owner merges, and a closed one removes its record. Project Objects reach the Library this way (Library page, "From your projects"); shared settings change this way (Studio page).
- **Project work:** logged, invertible operations on the PC; the owner decides only at declared decisions.
- The app follows GitHub main for both repositories by itself (database backup first; a server change waits for a restart; pause and roll back on the Studio page).

## How a session should work

- Shared memory is for shared work only (the app, pipelines, the Library, rules, settings, lessons for every project). Project work goes in the project's notes on the PC (project_note), never in a session; a chat that only works on projects records no session (owner, 3 Nov 2026).
- Every wrap-up is a new session (owner, 2 Nov 2026: "always record as new session"). Never update an earlier session. In the app, Innowa keeps the open session's record with `memory_record` as the chat goes; "wrap up" records it with `wrapUp: true`, which closes it. Anything after a wrap-up in the same chat is the next session number and covers only what came after.
- **Requests** (owner, 3 Nov 2026): anything to change in the shared work that is not done now is a request, `requests/R<4 digits>.md` in the content repository, noted with **+ Request** on any page, by Innowa in a chat (`request_add`), or from a project note's open item ("Make it a request"; the note then points to it, "→ R14"). Only the owner notes them for now. The open ones are the briefing's **Open now**; nothing is carried forward by hand. "Work on requests": Claude reads them all, groups the related ones, proposes a plan; each group is one pull request; a request is marked done when its pull request is merged (the app sees the merge). Declined only by the owner, with the reason kept.
- A session's **Open** lists only the requests it noted or closed ("R14 noted: …", "R9 done").
- A chat outside the app (claude.ai) writes a new record at each wrap-up, at the next free number: `memory/sessions/<number, 4 digits>.md` in the format the app writes (front matter: number, date, title, source; then the headline, Done, Decisions, Open), appends its decisions to `memory/decisions.md`, regenerates `memory/briefing.md` with `node <app>/tools/requests.mjs briefing <content>` (the app's format.js, with the requests), and commits to the content repository's main. It notes and changes requests with the same tool (`add`, `update`, `settle`), which commits and pushes each change. No wrap-up JSON, no pasting.
- Limits: title 200 characters, headline 400, at most 12 items of 300 characters in Done, Decisions and Open. Decisions quote the owner's words.
- Explain in plain language; the owner often reads on a phone. Never approve, merge or release: those are the owner's actions. Use the Studio connector (R81) in chats, as the person signed in; never approve, merge or release through it (owner, 12 Nov 2026).

## Open now

_The open requests (requests/ in the content repository)._

**The app**
- R6 · Canvas13: online preview and its gaps
- R21 · PC helper: desktop apps (Blender and others) for a server-hosted Studio
- R22 · Studio for clients: accounts, each on their own Claude key
- R46 · Python helper on the server for IFC export
- R56 · RBAC from first principles: platform roles, organizations, workspaces, project roles, FDEs, agents
- R57 · Export schedules (e.g. opening schedule) as PDF · from project test1
- R66 · Levels in model 4.0: heights from levels, walls through floors, columns in walls, stair and void holes in slabs (in aec-studio#83)
- R67 · Move the 2.x/3.0 kernel into kernel/legacy/ (kept only to open, replay and convert older projects) (in aec-studio#84)
- R68 · Easy drawing 1/5: draw-as presets and house defaults (as templates in content) (in aec-studio#85)
- R69 · Easy drawing 2/5: typed lengths, live dimensions, edit a dimension (in aec-studio#86)
- R70 · Easy drawing 3/5: the Room tool, with clear (inside) sizes (in aec-studio#87)
- R71 · Easy drawing 4/5: box select, set on all, Match (in aec-studio#88)
- R72 · Easy drawing 5/5: offset, copy, mirror, move and rotate a selection (in aec-studio#89)
- R77 · Save as firm template, and making new templates (in aec-studio#90)
- R80 · Blender jobs anywhere: on the owner's PC (Helper), in a Claude chat (through the Studio connector), or on the Studio's server when no PC is connected
- R81 · The Studio connector: a public MCP server with sign-in as the person, added in Claude as a custom connector
- R86 · Innowa reads from the PC's named folders through the Helper: list a folder, bring a file into the chat (in aec-studio#97)
- R88 · Innowa conducts: a job with a plan and limits, the pipelines as tasks that keep results by themselves, Innowa woken when they end, one review at the end (in aec-studio#98)

**A pipeline**
- R4 · Try Brief to Library on a real deck (planned)
- R76 · Hybrid render: a quick Blender render and product mask, then Krea enhance as a firm script with the firm's own Krea key
- R85 · Innowa chains the pipelines from one ask: deck to scene and renders (in aec-studio#97)

**The Library**
- R1 · Propose test1's WC and basin to the Library when wanted · from project test1

**A setting**
- R8 · Optional: COPY_DIR=D:\aec in .env for the folder copy

**Something broken**
- R87 · Read a run's files on a PC's Helper with Claude Code's own Read (PDF pages), only in the run's own folder (in aec-studio#97)

**Other**
- R5 · Archive the old app (AEC Agent Studio 2)
- R9 · Fix or confirm the example model's P1 parameters; clean up the old app's runs/ helper files

## Recent sessions

### Session 37 · 2026-11-14 · Runs that belong nowhere merged; Claude sessions on the owner's PC; Make a scene, Render views, chains and Innowa conducting a job, tried on staging with Collab 01
R79 was merged. Then a full Claude Code session on the owner's PC became a stage kind (R82), and on it Make a scene, Render views, chains and Innowa conducting a job were built (R83-R88). The Collab 01 deck ran through the chain and then as a conducted job on staging. All of it waits in PRs #97, #98 and content #46, #47.

Done:
- R79 merged (#95, #96, content #45): placing outputs anywhere, inputs from runs, projects and the Library, no scopes, model changes on the run's draft copy.
- R82 session stage: Claude Code with a shell on the owner's own PC (helper-tools.json sessions); files in out/ come back, the .blend stays on the PC. Detail an Object 1.3.0 runs as one; the armchair trial passed (6 min).
- R83 Make a scene (scene_get from the model, or an assumed layout from the slides) and R84 Render views 1.3.0 as a session (quick render plus mask, named after its slide).
- R85 chains: a run carries then; each missing / each undetailed fan out and the next step waits for them; a chat follows the whole chain.
- R86 Innowa reads the PC's named folders (pc_folders, pc_file_get); R87 a run on a Helper reads PDFs with Claude Code's own Read in its own folder.
- R88 Innowa conducts: a job per ask with plan and limits, tasks that keep their own results, waking when they are through, one review; job card with Stop.
- Helper 2g: several sessions at once (sessions.parallel), files back in parts, PDFs in Innowa's chat; Slides from a deck (split-deck), review pairs by file name.
- Fixed on the way: keeping a Library Object's detail, staging stuck by a Start-*.bat change, a fresh download pairing with its own Studio, honest last lines of detail runs.
- Security: no run is ever given a broad Read rule; reads stay in the working folders, and runs with no shell also block reads outside them (server and PC).
- Collab 01 ran as a chain, then as a conducted job ($6.74, 1.6 h at the screenshot); six Details started outside the job waited for the owner: fixed so runs started during a job are its tasks, and the chat panel folds the card and runs.
- Requests R82-R88 noted; all on staging (app 693f792), PRs #97, #98, content #46, #47.

Decided:
- Owner: session stage "ok we ll do this only in deatil an object workflow and lets chk how it does".
- Owner: when there is no layout, "Go as per ur suggestion": an assumed layout from the slides, named and reported as assumed; Keep asks everywhere, with previews as pictures.
- Owner: "Innowa conducts", with "OK with at most $20 of Claude use and 4 hours, then it stops to ask" and "post the plan and start straight away".

### Session 36 · 2026-11-12 · Files, image review and Object detail merged; Read a brief replaces Brief to Library; runs that belong nowhere, Blender anywhere and the Studio connector planned
R78, R75 and R73 were built, tried on staging and merged with content #44. The detailed version is now a third form beside an Object, for renders only. Each pipeline does one job. Next: runs that belong nowhere with placing (R79), Blender jobs anywhere (R80) and the Studio connector (R81).

Done:
- R78 merged (#91): files a pipeline makes reach a project's files on approval, a folder per pipeline, versioned names, where each came from; heavy files kept on the PC by Helper folder and path, with Check.
- R75 merged (#92): the image review, each result beside its reference and its before image; keep, or send back with a comment pinned on one image.
- R73 merged (#93), reworked: the detailed version sits beside an Object version (a project's record, or library/objects/<contract>/<version>.detail.json by proposal), never in the model; files stay on this PC.
- Ways into Detail: "make its detailed version next" at Keep, Library "no detail yet" with Detail it, Render views' detail-check listing Objects without detail.
- Content #44 merged: Read a brief (replaces Brief to Library, removed), Make an Object 1.5.0, Detail an Object 1.1.0, Render views 1.1.0; detail sidecars in the proposals action and validate.js; checks files-made and detail-checked.
- Staging updated twice with this work beside R66-R72 and R77; 252 tests pass there.
- Requests settled: R60 and R63 done; R58, R59, R61 declined as empty test entries; R74 declined, replaced by R80.
- R79, R80 and R81 noted.

Decided:
- Owner: "brief to library can be removed"; option 2: Read a brief keeps reading and matching, with Make buttons.
- Owner: "detailed object is another form of a library item - 2d, 3d, detailed 3d"; "detailed variant is only meant for taking renders and not to be placed in the model"; Library detail files "store in the local as of now".
- Owner: "all pipeline should run anywhere - no scope setting"; output "placed anywhere - in a model, in project folder, or in runs folder"; placing is the owner's act ("yes"); index, not copy.
- Owner: Blender "in claude" when the PC is not connected; the Studio connector "yes"; server Blender only for approved scripts ("yes").
- Owner: "ok merge #91 → #92 → #93, then content #44"; the rule on BuilderPluss MCP tools changed to allow the Studio connector ("ok").

### Session 35 · 2026-11-12 · Model 4.0 objects, levels and legacy (R64-R67), easy floor-plan drawing (R68-R72), firm templates (R77), and staging fixes
R63, R64 and R65 merged and live; R66 step 1 merged and live. R66 steps 2-4, R67, R68-R72 and R77 are built, each in its own pull request (#81-#90, content #41-#43), and all on staging for the owner to review together. Staging could not record requests: fixed in #94.

Done:
- Merged R63 (primers and meanings) and R64 (Objects on lines, corners, faces with two functions, points); R65 (Put in: doors, windows, gates into walls) merged and live.
- R66 levels: step 1 heights merged and live; steps 2-4 in #81-#83 (walls through floors, columns in walls, stair and void holes in slabs) with content #41 (Void).
- #82 also fixes the production Stair Object (an Object's own rise now wins over the level's). R67: the 2.x/3.0 kernel moved to kernel/legacy/ (#84).
- R68 house defaults from content templates (#85, content #42): draw-as presets, outer/inner walls and Room + Slab kept live, a few per-project overrides, hand edits held.
- R69 typed lengths and angles, 15° snap, Alt to wall faces, lengths on the plan (#86). R70 Room tool with clear or centre-line sizes, snapping to nearby walls (#87).
- R71 box and Shift-click select, set on all, delete all, Match (#88). R72 move, copy, turn, mirror, offset, extend and Trim tool, each one undoable step (#89).
- R77 Save as firm template and a Templates section on the Library page, as proposals the owner merges (#90, content #43 with a new Action). R73-R76 were taken by other requests.
- Fixed R68 on hosted sites: the template requests were missing from the access list; a new test checks every page request is listed.
- Fixed staging refusing to record requests and sessions: CONTENT_BRANCH from .env now reaches the recorders (#94), with a test.
- Discussed the floor-plan workflow with the new tools and grouped the open requests.

Decided:
- Owner on house defaults: "firm default plus a choice per project", "live", "allow a small set of per-project overrides"; on hand edits, hold the whole element: "yes as per ur suggestion".
- Owner: "Complete R66 , R67, then R68 to R72. Put it in stage first. I ll review together".
- Owner on Save as firm template and new templates: "As u suggest" (proposals he merges; projects stay on their version until switched; anyone in a firm suggests, its owner or an admin approves).

### Session 34 · 2026-11-12 · Where the visualization pipelines fit in Studio, and files a pipeline makes reach the project on approval (R78)
The five pipelines were read against the three visualization phases: Brief to Library covers reading the deck, Fit to plot is the pattern for reading CAD, and Render views and Detail an Object are new. Files a pipeline makes reach the project only on approval, in a folder per pipeline (R78); R73, R75 and R78 are grouped and planned.

Done:
- Existing pipelines checked: Brief to Library (read, match, make, keep, propose) fits phase 1 except detailed meshes; Fit to plot's read-the-plot is the pattern for reading CAD; nothing covers rendering.
- Proposed three new pipelines, none changed: Detail an Object (Blender detail on the Helper, image review), Read the CAD (lines, faces, Placements), Render views (quick render, Krea, image review).
- Checked what a project run keeps: kept Objects are pinned into the model (pin_object), Fit to plot draws a face; a Helper script's files stay in the run's folder, never the project's Files.
- R78 noted: files a pipeline makes go to the project's Files on approval, a folder per pipeline, versioned names, each file's run, stage, PC and date; heavy files may stay on the PC by the Helper's named folder and path.
- R73, R75 and R78 grouped as one piece of work and marked planned; build order R78, R75, R73, then R74 and R76.

Decided:
- Owner on files a pipeline makes: kept "on approval"; "Folder per pipeline".
- Owner: "Also heavy files can have a option to stored locally with its file path stored in the db as usual. For eg files of proposed detail an object pipeline."
- Owner on grouping R73, R75 and R78 as one piece of work: "Ok".
- Owner: "Build all in the order" (R78, R75, R73, then the pipeline drafts).

### Session 33 · 2026-11-12 · A visualization pipeline from a design deck: three phases documented as Studio pipelines, four requests noted (R73-R76)
The Collab 01 work (deck to 3D assets in Blender, an assumed layout, a 24 s quick render enhanced by Krea) was written up as a playbook of three Studio pipelines, Deck to 3D assets, Assemble layout and Hybrid render, each closed by an owner review. Studio fits as the orchestrator; four gaps were noted as requests.

Done:
- Playbook doc "BuilderPluss Visualization Pipeline" (claude.ai/artifact/LjMr6xYTAyWC1djhxBZDky): each step as a Stage or Decision with tools, command, outputs, checks and real logs; tabs for code and the run log; scripts zip with sha256 fingerprints.
- Clean re-runs from an empty folder: 24 assets and the layout rebuild in 30-46 s, 70/70 instancing audits PASS; they found two fixes (a textures folder never created, a layout floor zone never saved).
- Hybrid render tested: Blender quick preset 960x600, 8 samples, denoised, 24 s on 2 CPU cores with a product mask in 1 s; Krea Enhance to 2400x1500 95 credits, Magnific Precise 176, Ideogram masked edit 163.
- Fit with Studio checked against the content repository: stages, decisions with send-back, checks and the Helper (app_tool, script_run) map directly; Brief to Library covers reading the deck (R4's real-deck test).
- R73 noted: Objects that carry a detailed mesh (.blend/.usdc/.glb by fingerprint).
- R74 noted: Python and Blender scripts on the Helper.
- R75 noted: an image review decision (reference, before, after).
- R76 noted: Hybrid render stage with the firm's own Krea key.

Decided:
- Owner: "Divid this ork in three phases. 1. Generate 3d assets same to same with same level of depth and detail 2. Assemble to match same layout 3. Render the scene from the same/desired angles."
- Owner on rendering: "Planning to take normal and quick render in blender and enhance it thru ai image gen tools" and "I want something done in 30 secs from blender."
- Owner: "I am gonna use this doc for building it as a pipeline in my builderpluss studio artifact"; "Exclude 3js part. Also include ur step by step logs, scripts etc inside each process."
- Owner on writing the doc in Studio's terms and noting the four gaps as requests: "Ok".

## Earlier sessions

- **32** · 2026-11-11 · The model becomes primers and meanings: R62's three layers shipped, then R63 (model 4.0) built and on staging — R62 shipped and runs on production: geometry, roles and Objects, with solvers in content and a Run tab on the canvas. R63 then made the kernel draw only nodes, segments and faces with their meanings. That is four stacked PRs plus content #35, all on staging and waiting for the owner's merge. Faces now form by themselves.
- **31** · 2026-11-10 · The Helper runs PC apps and firm scripts, a Docs tab, staging live, and Fit to plot (R60) — Firms' apps and scripts run on their own Helper (R21 step 2c); the Studio gained a Docs tab with guides for the platform and for firms, plus requests and offers to BuilderPluss; staging went live; Fit to plot fits the largest rectangle at any angle inside a plot's setbacks and draws it as the ground floor's outer walls, now deployed with the fixes from its first live run.
- **30** · 2026-11-09 · Hosted at studio.builderpluss.com, the Helper, organizations and roles, knowledge layers, staging and security — BuilderPluss Studio runs on the Hostinger server at studio.builderpluss.com; PCs connect out through the Helper with their own Claude; firms, workspaces, roles, guests, FDEs and platform roles are built from first principles, each firm with its own knowledge layer and Claude usage; a staging site and two-factor sign-in complete it (R20, R21 step 2a, R22, R56).
- **29** · 2026-11-08 · One kernel for 2D and 3D, BuilderPluss Studio and Innowa, the kernel split, agents that learn — The kernel became one schema for plan and 3D and then a design kernel with its own geometry engine; the app is BuilderPluss Studio with Innowa as its assistant; the canvas got a floating tool bar; and agents now learn from corrections, start from patterns and are measured by replayed briefs.
- **28** · 2026-11-06 · Runs anywhere, requests, context assembly, chat and plan polish, real curves, a Claude-like layout — Pipelines run in a project, the Library or the studio; requests are noted from any page and worked through; agents and the chat get assembled context; the chat takes files and drives runs; plans are drafted with real curves; the canvas is home, and app updates restart the server by themselves.
- **27** · 2026-11-03 · Library proposals: Project Objects reach the Library with one tap; the review setting and its button — Project Objects now reach the Library without a chat: the app suggests them, one tap sends a pull request, and projects switch to the Library version after the merge. The quick review setting is shown and changed from the Studio page by pull request.
- **26** · 2026-11-03 · Project discussions stay with the project: project notes; online preview kept current — Shared memory now holds only shared work: project chats keep a note with the project on the PC (app PR #12, merged), and the online preview was rebuilt twice from the latest main.
- **25** · 2026-11-02 · New project test1, a 1 BHK plan, furniture and kitchen/bathroom fittings — Created test1, drew an 8 m × 7 m 1 BHK, furnished it from the Library, then made 5 kitchen and bathroom fittings as Project Objects and placed them.
- **24** · 2026-11-02 · Phases 4, 5 and 6 built: Library, Pipelines, Files and Storage; online preview — All six phases are now on main: the Library with checked Objects, pipelines that run stages with checks and owner decisions (Brief to Library, Make an Object), Files and Storage; and an online preview artifact built from both repositories.
- **23** · 2026-11-02 · Canvas host slot: built-in canvas and Canvas13 as hosts (PR #6) — The Canvas page now has a host slot: the built-in canvas is its first host and Canvas13 its second, chosen with a picker; app PR #6 is open with its checks green, waiting for the owner.
- **22** · 2026-11-02 · Phase 3 built: Projects and the built-in canvas; every wrap-up a new session — Every wrap-up now records a new session (app, core, load skill); phase 3 is built: Projects (PR #4, merged) and the built-in plan and 3D canvas (PR #5, merged).
- **21** · 2026-11-02 · First project: a room on the ground floor — Created the first project in AEC Studio 6 and drew a 4 m × 3 m room on the ground floor, its space made from the walls.
- **20** · 2026-11-02 · First chat in AEC Studio 6: phase 2 confirmed live, wrap-up only — The first chat inside the new app found phase 2 (memory) merged and running on both repositories, and was wrapped up without other work.
- **19** · 2026-11-02 · AEC Studio 6: rebuilt from first principles; phase 1 merged, phase 2 (memory) in review — After stage 1 of the old app (automatic checks, follow main) the owner chose a rebuild: AEC Studio 6, eight managers around a mesh-light kernel, two repositories; phase 1 is merged and phase 2, sessions that record themselves, is in review.
- **18** · 2026-10-31 · Parity passed, delete library types, Types → Library, handover publishes outputs (B), library manager 0.3.0 live (C) — The parity test passed on the owner's data, the owner can now delete library types and the Types window is called Library, handovers publish outputs that orchestration routes (Request B), and library manager 0.3.0 was generated, released, fixed and synced into the Studio (Request C).
- **17** · 2026-10-31 · Sync library-manager 0.3.0 — Synced library-manager 0.3.0 to the Studio: panels/preview-additions@0.1.0 and pipelines/library-manager@0.3.0 created.
- **16** · 2026-10-31 · Fix REQ-038 version labels — Fixed version labels: library-manager 0.3.0, library agent 1.4.0. Sync blocked: preview-additions@0.1.0 panel and critics preview-only, housekeeping-reported missing from Studio.
- **15** · 2026-10-31 · Filing requests A, B, C — Fixed: REQ-006/007/008 restored to their original released state; new requests filed as REQ-036/037/038.
- **14** · 2026-10-31 · Discussion: topic to be set by owner — An empty discussion window; no work was recorded.
- **13** · 2026-10-30 · Library items get a 2D symbol and a 3D primitive; library manager, handover and orchestration redesigned — Every library type can now carry a parametric 2D symbol beside its 3D primitive, with a check that they agree, editing in the Types window and a one-click upgrade for existing types (merged at f14ea98 and 04d351c); the library manager, handovers and orchestration were redesigned as Requests B and C.
- **12** · 2026-10-30 · Canvas13 in the Studio; Layers and Levels; chat fixes — Bikal's Canvas13 renderers now run as a route 1 canvas in the Studio with Layers and Levels menus, and the chat no longer treats general questions or deleted projects as project work; all merged to main at f90fd61.
- **11** · 2026-10-30 · Chat, projects, freestyle and canvas slot rework — The Studio got a real chat, multi-pipeline and untitled projects, freestyle model editing with Claude credit, the built-in canvas on route 1 with a canvas slot, and a claude.ai-style Explorer; all merged to main at 5943c1f with parity 11/11.
- **10** · 2026-10-29 · Discuss mode in the app chat; Option 1 fix; corrected core — Added a Discuss mode to the app chat for brainstorming apart from jobs, fixed the Option 1 confusion, and rewrote the core briefing for the GitHub, local and Studio 2 setup.
- **9** · 2026-10-28 · Two PCs and associates: setup guide and Git workflow — Wrote a step-by-step guide for installing AEC Agent Studio 2 on a second PC and for associates sending changes through GitHub pull requests.
- **8** · 2026-10-28 · The app moves to GitHub; local install; Studio 2 on claude.ai — Moved the app to a GitHub repo with a local primary install and Studio 2 on claude.ai; froze the old artifact; split studio.js into 21 scripts with parity unchanged.
- **7** · 2026-10-26 · REQ-011 to REQ-022: families, handovers, the orchestrator chat — Session 7 released REQ-011 to REQ-022: Blender families, handover pipelines, Run here, quick start, canvas viewers, and the orchestrator chat that drives whole jobs, reads PDFs on the page and starts Claude sessions for Blender steps. REQ-031 (v66) folded the registry steward into the one Studio chat and moved Registry mode into the Studio frame. REQ-032 (v67): Generate as a Claude session, decisi
- **6** · 2026-10-23 · The Pipeline Registry merged into AEC Agent Studio — Session 6 merged the Pipeline Registry into AEC Agent Studio: one artifact, one database (registry in reg_ collections), the Registry as an in-place mode of the Studio page; the old Registry is a read-only archive.
- **5** · 2026-10-22 · Pipelines move into Claude sessions; shared engine; Python meshes — Session 5 trimmed the briefing, ran BED_01, wrote REQ-003, and moved pipelines into Claude sessions: a shared engine file for Studio and runner, Python meta/mesh for shapes, bakes, checks and stills, and a Studio that shows session-baked meshes (phases 1-4).
- **4** · 2026-10-20 · REQ-002; the registry becomes the truth for the Studio — Session 4 built REQ-002, made the registry the truth for the Studio with a stored sync runner, moved build-room and furnish-room into the registry, cleared old projects and code from the Studio, and reworked image upload into multi-image plan-or-reference questions in the Brief.
- **3** · 2026-10-19 · Library placing in 3D, explorer, pipeline panels, type editor — Session 3 added Library placing in 3D, a Finder-style explorer, pipeline UI as panels, a regrouped Studio, and a parametric type editor so new objects can be modelled before object-from-image is brought into the Studio.
- **2** · 2026-10-19 · Data model, library, folders; AEC Agent Studio on a graph model — Decided data model, library, folders and app; built AEC Agent Studio on a graph model with Plan, Graph and 3D views, local D:\aec sync, and one Library tool for placing everything.
- **1** · 2026-10-18 · Agentic AEC from first principles; the Pipeline Registry app — Worked out agentic AEC from first principles, seeded the registry from Build-from-Deck, and built the Pipeline Registry app with in-app Claude, a Build stage, next-step cards, a Discuss tab and session memory.
