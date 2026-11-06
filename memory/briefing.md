# Briefing

_Generated from memory/core.md and memory/sessions/; do not edit by hand. Next session: 29._

## What this is

AEC Studio 6, owned by Balaji (BuilderPluss): a local-first app for agentic AEC design, rebuilt from first principles in November 2026 as eight managers around one design kernel. It will be hosted later; nothing in it assumes one PC. Balaji is the only approver; associates (Bikal) may propose on the content repository.

- **App (code):** private GitHub repository `Balajisgit/aec-studio`, branch main. Started on the PC with `Start-Studio.bat` (D:\aec-studio), at http://127.0.0.1:3000.
- **Content (everything shared that is not code):** private repository `Balajisgit/aec-studio-content`, cloned next to the app (D:\aec-studio-content). Pipelines, agents, skills, checks, panels, solvers; the Library; canvas setups; settings; memory (this briefing, sessions, decisions, lessons).
- **PC:** the database (projects, runs, model logs, chats) and folders (project files, backups, Object assets by fingerprint; R2 later). Project work moves between PCs only by export and import.
- **Architecture:** the owner's doc *AEC Studio 6 — Architecture* (2 Nov 2026); the short version is `docs/architecture.md` in the app repository.
- **The old app** (AEC Agent Studio 2, `Balajisgit/aec-agent-studio`, D:\aec-agent-studio-5.1) is to be archived now that phase 5 is built (the owner's call). Its pipelines, agents, checks and rules are not carried over.

## Managers and build phases

Studio (phase 1: versions, updates, settings, Claude runtime) · Memory & Discussion (phase 2: the chat, sessions, briefing, decisions) · Projects and Canvas (phase 3) · Library (phase 4) · Pipelines (phase 5, new ones with the rules) · Files and Storage (phase 6, ready for hosting). All six phases are built (2 Nov 2026).

- **Online preview:** artifact "AEC Studio 6" (claude.ai/artifact/TeL8fLtYta3eXyqe1jVMt6), built from both repositories with the app's tools/online/build.mjs and republished on request; projects there are a sandbox in the browser, and chat, runs, files and storage need the PC.
- **Pull requests always target main** (no stacked PRs).

## Words

Library (the shared collection) · Object (one Library entry: parameters, a 2D symbol, a 3D primitive, materials; versioned, never changed in place) · Placement (an Object used in a project) · Need (what a brief calls for, before matching) · Stage, Decision, Output (pipelines) · Project Object (an Object kept in one project, id project.<name>@1.0.0, not yet in the Library). The word "type" is not used.

## The kernel (mesh-light)

The model stores intent, never triangles: nodes, segments (walls and others), openings on a segment at a station in mm, spaces as cycles of segments, Placements at a level, a segment or a node, analytical primitives, rare escapes. Integer mm, snap 5 mm, nothing stores a coordinate it can derive, provenance on every element, GlobalIds as uuid5 in IFC's form. Invariants I1–I11 run after every operation; a step that adds a failure is refused. Exchange format `model.json`, schema 2.0 (`kernel/model.schema.json`). JavaScript kernel; a Python helper comes later for IFC export.

## How changes happen

- **Code and definitions:** a pull request opened by Claude from a chat (or by an associate on content); automatic checks run on GitHub; only the owner merges. The app holds no GitHub token.
- **Records** (sessions, decisions, lessons): committed straight to the content repository, by the app with the PC's Git sign-in, or by a chat outside the app.
- **Proposals and settings requests:** the app commits a record (`library/proposals/`, `requests/settings/`) with the PC's Git sign-in; a content Action turns each into a pull request; only the owner merges, and a closed one removes its record. Project Objects reach the Library this way (Library page, "From your projects"); shared settings change this way (Studio page).
- **Project work:** logged, invertible operations on the PC; the owner decides only at declared decisions.
- The app follows GitHub main for both repositories by itself (database backup first; a server change waits for a restart; pause and roll back on the Studio page).

## How a session should work

- Shared memory is for shared work only (the app, pipelines, the Library, rules, settings, lessons for every project). Project work goes in the project's notes on the PC (project_note), never in a session; a chat that only works on projects records no session (owner, 3 Nov 2026).
- Every wrap-up is a new session (owner, 2 Nov 2026: "always record as new session"). Never update an earlier session. In the app, Claude keeps the open session's record with `memory_record` as the chat goes; "wrap up" records it with `wrapUp: true`, which closes it. Anything after a wrap-up in the same chat is the next session number and covers only what came after.
- **Requests** (owner, 3 Nov 2026): anything to change in the shared work that is not done now is a request, `requests/R<4 digits>.md` in the content repository, noted with **+ Request** on any page, by Claude in a chat (`request_add`), or from a project note's open item ("Make it a request"; the note then points to it, "→ R14"). Only the owner notes them for now. The open ones are the briefing's **Open now**; nothing is carried forward by hand. "Work on requests": Claude reads them all, groups the related ones, proposes a plan; each group is one pull request; a request is marked done when its pull request is merged (the app sees the merge). Declined only by the owner, with the reason kept.
- A session's **Open** lists only the requests it noted or closed ("R14 noted: …", "R9 done").
- A chat outside the app (claude.ai) writes a new record at each wrap-up, at the next free number: `memory/sessions/<number, 4 digits>.md` in the format the app writes (front matter: number, date, title, source; then the headline, Done, Decisions, Open), appends its decisions to `memory/decisions.md`, regenerates `memory/briefing.md` with `node <app>/tools/requests.mjs briefing <content>` (the app's format.js, with the requests), and commits to the content repository's main. It notes and changes requests with the same tool (`add`, `update`, `settle`), which commits and pushes each change. No wrap-up JSON, no pasting.
- Limits: title 200 characters, headline 400, at most 12 items of 300 characters in Done, Decisions and Open. Decisions quote the owner's words.
- Explain in plain language; the owner often reads on a phone. Never approve, merge or release: those are the owner's actions. Don't use the BuilderPluss MCP tools.

## Open now

_The open requests (requests/ in the content repository)._

**The app**
- R3 · Online preview: export download links do nothing
- R6 · Canvas13: online preview and its gaps
- R7 · Kernel later: true arcs, holes inside rooms, 2.5D checks, Python helper for IFC export
- R12 · Remove the old quick review path from the Library's code
- R20 · Move Studio to a private server on the owner's Claude subscription
- R21 · PC helper: desktop apps (Blender and others) for a server-hosted Studio
- R22 · Studio for clients: accounts, each on their own Claude key
- R36 · Doors and windows on curved walls: the kernel refuses them today · from project test3
- R37 · project
- R38 · chat
- R40 · Files
- R41 · Kernel 2D/3D: what R39 left open (in aec-studio#32)
- R44 · kernel

**A pipeline**
- R4 · Try Brief to Library on a real deck
- R10 · Library check-up pipeline
- R16 · Lessons build up: the owner's corrections become lessons agents see
- R18 · Checks for sense, not just form

**The Library**
- R1 · Propose test1's WC and basin to the Library when wanted · from project test1
- R2 · Kitchen counter 1.0.0: hob and sink limits are loose and they can overlap

**A setting**
- R8 · Optional: COPY_DIR=D:\aec in .env for the folder copy

**Something broken**
- R42 · Windows stacked one above the other on a wall through two floors are refused as overlapping (in aec-studio#32) · from project test4
- R43 · An opening (no door) doesn't show as open: probably drawn as a closed door on Canvas13 · from project test4

**Other**
- R5 · Archive the old app (AEC Agent Studio 2)
- R9 · Fix or confirm the example model's P1 parameters; clean up the old app's runs/ helper files
- R11 · Columns should cut walls: needs an app change (pull request from Claude Code). · from project test1

## Recent sessions

### Session 28 · 2026-11-06 · Runs anywhere, requests, context assembly, chat and plan polish, real curves, a Claude-like layout
Pipelines run in a project, the Library or the studio; requests are noted from any page and worked through; agents and the chat get assembled context; the chat takes files and drives runs; plans are drafted with real curves; the canvas is home, and app updates restart the server by themselves.

Done:
- Runs with scopes (project, library, studio); Propose to Library is a pipeline; Brief to Library in the studio with files and origin tags (app #17-#19, content #10, #11, #15).
- Requests: noted with + Request or in the chat, kept in requests/, worked through in groups; tools/requests.mjs; a merge marks them done (app #20, content #16).
- Context assembly: stages declare the context they get; the chat as orchestrator with focus on a run, its decisions posted in the chat (app #21, content #17; R13, R14, R17, R23).
- Chat panel: steps as they happen, files by picker, drag or paste, ALLOWED_FOLDERS, Reply and Add to request; Keep and place with plan previews, 3D of the made Object, Send back with a comment (app #22, #23, content #19).
- R29 polish: chat restyled (icons, plain replies, one composer); plans drafted (poché walls, door swings, glazing, dimensions, scale bar) (app #24).
- R30 page_open: the chat opens a project on the canvas or any page (app #25). R31 real arcs in the kernel and every canvas, draw_circle, curve-aware checks; Canvas13 drafting look from our side (app #26).
- R34, R35: the server works out the files it runs; an update to them restarts it when Claude is idle (Start-Studio.bat loop, exit 75) and pages reload (app #27).
- R33 canvas home, collapsible left panel (Studio, Memory, Storage at the bottom), inspector toggle, chat floats on the canvas; R28 Add to Library in the inspector; R32 no runs yet (app #28).
- Online preview (artifact AEC Studio 6) republished up to version 15 (app 0e0d039).
- Checks every time: syntax, types, tests (87 now), smoke, browser checks at phone width with screenshots.

Decided:
- Owner: "Can we make this as a pipeline" and "why cant we make that general?": runs anywhere, Propose to Library as a pipeline.
- Owner on requests: "1. the content repository ... 3. me as for now": requests kept in the content repository, settled by merge.
- Owner: "Context assembly for the chat agent, the orchestrator" then "build it now".
- Owner: "Upload from the local drive too..", "Allowed folders too. Build two groups", "3d preview of object should be there after make ?".
- Owner: "Chat ui and 2d svg shud look more professional. Add this as request and build" (R29).
- Owner: "also the svg upgrade done only in built in canvas do that in canvas 13 too" with R31.
- Owner: "drop it" for the request files extra (branch request-files left on GitHub; delete by hand).
- Owner merged app #17-#28 ("Merge 18", "Merge it", "merge 25", "ok merge", "merge all in order") and content #10, #11, #15-#17, #19.

### Session 27 · 2026-11-03 · Library proposals: Project Objects reach the Library with one tap; the review setting and its button
Project Objects now reach the Library without a chat: the app suggests them, one tap sends a pull request, and projects switch to the Library version after the merge. The quick review setting is shown and changed from the Studio page by pull request.

Done:
- Proposals (app #13, content #5, merged): suggest, propose with one tap, duplicate check and naming by role, record turned into a pull request by a content Action; swap_object switches a project to the Library version (undoable).
- Quick review by Claude (quick tier) only when the code is unsure; setting library.review (off, unsure, always), written in settings.json (content #7) and shown on the Studio page (app #14).
- Studio page button: Ask to change the review setting; a settings request becomes a pull request (app #16, content #9); chat tool settings_request for the models too.
- First real proposals merged: Kitchen counter (content #6, furniture.kitchen-counter@1.0.0, review flagged loose hob limits) and Fridge (content #8).
- Online preview fixed (app #15: the Library's PC side moved to store.js, guard test against Node imports) and republished at app 4d1ce5b, content ac909ef.
- Fixed a flaky test: importing a project kept its notes' order when two share the same millisecond (in app #14).
- Explained the Library manager, the kernel check (plain code, no tokens) and Object sizes (about 1.5 to 2.8 KB each in Git).
- Checks: 57 tests, smoke, browser checks at phone width; stand-in GitHub runs of both Actions; GitHub checks green on every pull request.

Decided:
- Owner: "ok build this." (proposals: the app suggests, one tap proposes, a record that a GitHub Action turns into a pull request; review only when unsure).
- Owner: "ok how to give", then push access to aec-studio-content granted to this chat.
- Owner: "ok" to writing library.review into settings.json and showing it on the Studio page.
- Owner: "ok" to a button for the setting that sends a pull request (option 1), not a direct change.
- Owner merged app #13 to #16 and content #5 to #9, including the Kitchen counter (#6) as proposed, despite the review's notes.
- Owner: "update the studio 6 artifact too", then "update the artifact".

### Session 26 · 2026-11-03 · Project discussions stay with the project: project notes; online preview kept current
Shared memory now holds only shared work: project chats keep a note with the project on the PC (app PR #12, merged), and the online preview was rebuilt twice from the latest main.

Done:
- Online preview rebuilt from the latest main twice (content 21e827a with session 25; then app fc70f86); same artifact link.
- Project notes (app #12, merged): one note per chat and project (done, the owner's decisions, open), in a Notes card on the project's page, moved with a project's export.
- In-app chat told what goes where: shared memory only for shared work; project work in project_note; a chat that only works on projects records no session; read project_notes before carrying on.
- The app keeps the note itself when a chat reply changed a project and Claude didn't write it (steps added, newest 12); no need to say wrap up for project work.
- Checks: 47 tests, smoke, browser check of the Notes card; GitHub checks green; #12 merged at fc70f86.

Decided:
- Owner: project sessions in shared memory duplicate the project log and chat: "Can we exclude project related discussions or store them separately?"; chose "Project notes" kept with the project on the PC.
- Owner: session 25 "Leave it as history" (past sessions are never changed).
- Owner: "Ok add to 12 and merge the 12" (the app keeps the note when Claude doesn't).

### Session 25 · 2026-11-02 · New project test1, a 1 BHK plan, furniture and kitchen/bathroom fittings
Created test1, drew an 8 m × 7 m 1 BHK, furnished it from the Library, then made 5 kitchen and bathroom fittings as Project Objects and placed them.

Done:
- Created project 'test1' (p10d4d1726c): Ground floor L0, 3000 mm high, snap 5 mm.
- Drew a 1 BHK, 8000 × 7000 mm: outer walls 200, inner 100, 3000 high; spaces Living 18.67, Kitchen 8.12, Bathroom 5.42, Bedroom 13.82, Dress / Store 5.27 m2 net.
- Doors: main 1000, kitchen 900, bathroom 750, bedroom 900, dress 800; windows: living and bedroom 1800, kitchen 1200, bathroom and dress 600 high.
- Furniture from the Library: sofa, armchair, 1200 × 800 table with 4 chairs, 1600 × 2100 bed, 2000 mm 4-door wardrobe.
- Made and kept 5 Project Objects (all pass the Library check): project.kitchen-counter (optional sink and hob, movable along the run), project.fridge, project.wc, project.basin (on a vanity), project.shower (tray, half glass screen).
- Placed them (step 'Fit out kitchen and bathroom'): L-shaped kitchen, 2850 counter with sink under the window, 1500 counter with hob on the east wall, fridge in the corner; bathroom: basin by the door, WC on the back wall, 900 × 900 shower in the far corner. No problems.
- Noticed the owner's own canvas edits: bedroom window WN6 on the west wall and the bed moved; left as they are.

Decided:
- Owner: "create a new project named test1".
- Owner: "load that project and create a one bhk" (layout and sizes chosen by Claude, to confirm).
- Owner: "place furnitures" (choice and positions by Claude, to confirm).
- Owner: "make the kitchen and bathroom fittings" (made in the chat as Project Objects; sizes and positions by Claude, to confirm).

### Session 24 · 2026-11-02 · Phases 4, 5 and 6 built: Library, Pipelines, Files and Storage; online preview
All six phases are now on main: the Library with checked Objects, pipelines that run stages with checks and owner decisions (Brief to Library, Make an Object), Files and Storage; and an online preview artifact built from both repositories.

Done:
- Phase 4 Library (app #7 then #8; content #3): Objects with params and limits, 2D symbol and 3D primitive as safe formulas, checkObject; Library page; place, move, turn on both canvases; 8 starter Objects.
- PR #7 merged into #6's branch (stacked), not main; #8 brought it to main. Stacked PRs are no longer used: every PR targets main.
- Online preview (#9): tools/online builds the app for the browser from both repositories; artifact "AEC Studio 6" claude.ai/artifact/TeL8fLtYta3eXyqe1jVMt6, sandbox projects, Canvas13 left out (bundle too large to read).
- Phase 5 Pipelines (app #10, content #4): Pipelines manager and page; runs in Projects with stages, agents, checks, retries, stop and say why, decisions; event log; Files core.
- Brief to Library (Read, Match, What to make, Make, Keep) and Make an Object (freestyle), agents reader, matcher, maker; rules R1-R6; project_keep_object in the chat.
- Kept Objects are Project Objects (project.<name>@1.0.0) in the model, shown in the canvas chooser under This project.
- Phase 6 Files and Storage (#11): file previews and downloads; backups and restore at next start; export and import a project (log, runs, files); folder copy (COPY_DIR); assets by sha256.
- Runner removes all its temporary files; checks green on main for both repositories (44 tests); online preview republished at app 5f6d15f, content 006262a.

Decided:
- Owner: "all merges done" (#6, #7, content #3); then "Merge 8 and 9 and make the artifact to get live at latest".
- Owner: on Canvas13 in the online preview, "Let's see this later".
- Owner: first pipeline "1st and freestyle" (Brief to Library, plus Make an Object as the freestyle action).
- Owner: made Objects "Stay in the project" (Project Objects) until the owner asks for them to be proposed to the Library.
- Owner: "5 then 6" for the build order; "Merge" (content #4, app #10, #11).

## Earlier sessions

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
