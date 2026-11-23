# Briefing

_Generated from memory/core.md and memory/sessions/; do not edit by hand. Next session: 47._

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

Library (the shared collection) · Object (one Library entry: parameters, a 2D symbol, a 3D primitive, materials; versioned, never changed in place) · Placement (an Object used in a project) · Need (what a brief calls for, before matching) · Stage, Decision, Output (pipelines) · Project Object (an Object kept in one project, id project.<name>@1.0.0, not yet in the Library) · Layout (several Objects arranged together, placed as one kept unit or broken into separate Objects; R114) · Template (a project's starting rules; in the Library since R114) · Shortlist (a project's pinned Objects and Layouts). The Library is a catalogue of Objects, Layouts and Templates. The word "type" is not used.

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
- R80 · Blender jobs anywhere: on the owner's PC (Helper), in a Claude chat (through the Studio connector), or on the Studio's server when no PC is connected
- R81 · The Studio connector: a public MCP server with sign-in as the person, added in Claude as a custom connector
- R102 · Mixed use: several typologies in one project, and a programme in sections

**A pipeline**
- R4 · Try Brief to Library on a real deck (planned)
- R76 · Hybrid render: a quick Blender render and product mask, then Krea enhance as a firm script with the firm's own Krea key
- R116 · Skills, scripts, tools and dynamic playbooks Innowa assembles, instead of pipelines (in aec-studio#132)

**The Library**
- R1 · Propose test1's WC and basin to the Library when wanted · from project test1

**A setting**
- R8 · Optional: COPY_DIR=D:\aec in .env for the folder copy

**Other**
- R5 · Archive the old app (AEC Agent Studio 2)
- R9 · Fix or confirm the example model's P1 parameters; clean up the old app's runs/ helper files

## Recent sessions

### Session 46 · 2026-11-22 · R115 done (Innowa works playbook steps in the chat) and R116 begun: skills, scripts, tools and dynamic playbooks, with the owner's gates fixed in the app
Pipelines felt slow and narrow, so Innowa now works a playbook's steps itself in the chat, with the owner, instead of cold agents per stage. Office floor plan, Programme from a brief, Read a brief and Make an Object run this way. The owner then chose skills, scripts, tools and plans Innowa assembles over fixed pipelines (R116); step 1, the owner's gates in the app, is merged.

Done:
- R115 step 1: a step by: "innowa" waits for Innowa in the run's chat (step_get, step_tool, step_done; checks run at done); a confirm decision (places: "draft"); checks shell-ready and programme-met; the Office floor plan playbook and a sample brief (60-person tech office).
- R115 step 2: lessons per playbook (lessons/<playbook>.md); one ledger (Innowa's chat turns count in the run's cost; a Ledger on the run page); a run started on the run page opens its chat; Programme from a brief 2.0.0 by Innowa.
- Read a brief 2.0.0 and Make an Object 2.0.0 by Innowa; a job's tasks, a chain's runs and an asset list's Make are worked in the chat they came from; Innowa opens a run's brief files from the chat.
- R116 step 1, the owner's gates: Innowa answers a decision for him only in a turn he wrote, quoting him; a job Innowa starts alone waits at every decision; only the owner sends to the Library, raises limits or approves a job.
- R116 step 1: what leaves a run is checked at the gate (Objects again; a plan against the programme, shown on the card); the owner can let a step go on with checks open; every yes is in the ledger.
- Fixed: two R115 lines where a comment swallowed code (a pipeline's "can't run here" check; page_open's access rule). checks/syntax.js now fails on a comment hiding code.
- Trials with the real content: the office floor plan end to end (4 layouts, 128 placements); a lounge brief read, matched and a window seat made in one chat.
- Merged: aec-studio#127, #128, #129, #130; aec-studio-content#63, #64, #65. 375 tests, smoke and canvas checks pass on main.

Decided:
- Owner: "note it straight away as a request and start with. Creating a office floorplan is the first test." (R115), then "Ok build".
- Owner: "Merge" for each of aec-studio#127 to #130 and aec-studio-content#63 to #65; "Start step2"; "Merge and convert Read a brief" and "Make an Object" next."
- Owner: "Instead of pipelines, lets have only skills, scripts, tools and can we have dynamic playbooks that innowa would assemble?" then "Agree as u suggested." (R116).
- R116 approval: Innowa waits for the owner's OK on a plan that changes the project or the Library; a plan that only reads or drafts starts straight away.
- R116 unattended work: only a saved playbook or a plan the owner approved before leaving; no new plans while nobody is watching.

### Session 45 · 2026-11-21 · R110, R111, R112 done: a dragged Object follows the pointer, a new project from the canvas, requests answer at once and can be edited
The three small fixes noted on the PC were built in one pull request and merged at the owner's word. Dragging an Object on the canvas no longer lags, a new project is made from the canvas's project list, and noting a request no longer holds the app while GitHub is reached; requests can now be edited.

Done:
- R110: an Object at a point follows the pointer while dragged and stays where it is dropped while the step is saved (back if refused).
- R111: "+ New project…" in the canvas's project list: a name and a template, made and opened on the canvas.
- R112: requests are committed at once and sent to GitHub in the background, so the Requests tab opens straight away; another PC's same number still moves one on.
- R112: requests can be edited (title, details, kind) on the Requests tab and by Innowa (request_update).
- Merged: aec-studio#126. R110, R111 and R112 marked done.
- 365 tests, the smoke check and the canvas browser check pass on main.

Decided:
- Owner, offered the three fixes first: "Go".
- Owner: "Merge" (aec-studio#126).

### Session 44 · 2026-11-21 · R114 done: the Library as a catalogue, placing and shortlists, Layouts with Keep or Break, templates in the Library
All four steps of R114 were built and merged at the owner's word. The Library opens as a catalogue with pictures made from each entry's 3D shape; a project's shortlist and the canvas's Place tool place from it; Layouts arrive with Keep or Break; templates now live in the Library. The online preview shows it all.

Done:
- Step 1: browse tree and catalogue cards as content data; home, category, search and product pages; pictures from each entry's 3D shape; Technical view one tap away.
- Step 2: a project's shortlist is its pinned Objects; Add to shortlist and Place on canvas; the canvas's Place tool (P), filtered by the selection.
- Step 3: Layouts (kernel units, rule I13, Keep or Break, move, update, Break); five starter Layouts; Make a Layout from the selection; proposed by the same route.
- Step 3: behaviours are now in the Object fingerprint.
- Step 4: templates moved to library/templates (ids unchanged; the old place still read); Start from a template; a page per template with Use for and Start a new project.
- Merged: aec-studio#123, #124, #125; aec-studio-content#61, #62. R114 marked done.
- Online preview republished from main (app 6206499).
- 364 tests, the smoke check and the canvas browser check pass on main.

Decided:
- Owner: "build R114 step 1", then "Merge" (aec-studio#123, aec-studio-content#61).
- Owner: "Go step 2", then "Merge" (aec-studio#124).
- Owner: "Step 3 and 4 go", then "Merge" (aec-studio#125, aec-studio-content#62).
- Owner: "Ok" to republish the online preview and wrap up.

### Session 43 · 2026-11-21 · R113 done: Objects say how they behave (model 4.3) and zones; the online preview republished
The kernel's list of kinds went: every Library Object now says what it does, and every Placement has an Object, a generic one until it is swapped. Zones, the last part of R113, were built: a name and a use on a closed ring of lines, with what each covers worked out. All merged at the owner's word; R113 is done and the online preview shows it.

Done:
- Behaviours: band, holds-openings, opening, way-through, stops-bands, cuts-floor-above; an Object's kind is only a word the kernel never reads.
- Every Placement has an Object: an operation naming only a kind gets the template's Object, else the Library's generic one.
- Model 4.3: old projects' Objects get the behaviours their kind had; Placements with no Object get the generic one.
- Content: every Library Object says kind and behaves (role and meaning gone); eight generic Objects added.
- Zones: add_zone and edit_zone, rule I12, the Zone tool (Z) on the canvas, and project_look saying what each zone covers.
- Merged: aec-studio#121, then aec-studio-content#59; aec-studio#122, then aec-studio-content#60. R113 marked done.
- Online preview republished from main (app 3c830cf): Placements, behaviours and zones.
- 349 tests, the smoke check and the canvas browser check (now using the Zone tool) pass on main.

Decided:
- Owner on Object-less Placements: "Always an Object" (a generic one at first, swapped later).
- Owner on giving the Library's Objects their behaviours: "Edit in place" (same ids; projects' copies get them on upgrade).
- Owner, after the suggestion to leave behaviours out of the Object fingerprint until R114: "Ok what next".
- Owner: "Merge and do as suggested" (#121, #59; then zones and the preview), and "Merge" (#122, #60).

### Session 42 · 2026-11-20 · Objects on hosts merged (R113 step 3); the kernel holds no specifics; Fit to plot says in content what it reads
R113 step 3 was built and merged. Roles and meanings are gone: Library Objects are Placements on a node, a segment, a ring of lines or another Placement, and spaces carry their own name, use, number and values. At the owner's word the kernel was then emptied of specifics: plot, footprint and void are template uses, setbacks are set each time, and Fit to plot says in content what it reads.

Done:
- Placements: a door or window on a wall at a point along it; a floor finish per walled room; one slab per floor plate. Removing a host takes what it holds.
- Spaces have name, use, number and values; labels on lines and points; 4.0 and 4.1 projects move to 4.2 by themselves.
- The kernel names no use, label or value. A template's use says room: false (a plot, a footprint, a void: no floor, no slab, not a room).
- Rear and side are worked out outside the kernel from the use's own inset words (managers/projects/sides.js).
- Setbacks are the plot's values, never assumed: the plot check asks, the solver stops and the Site reader says what is missing.
- The app names no plot: a general space-set check and space-to-read condition; the content says the use, labels and values.
- Content: meanings and semantics removed; fit-to-plot 4.0.0, fit-max-rectangle 3.0.0 and workplace-test-fit 2.0.0; old versions removed.
- Templates' 1.0.0 versions gained plot (with its inset and setback values), footprint and void uses, in place.
- Merged: aec-studio#120, then aec-studio-content#58; 344 tests, smoke and canvas checks pass on main.

Decided:
- Owner on setbacks: "Should not be in kernel. Plots and foot prints are defined manually or in templates. Setbacks are rules set manually or thru pipelines or innowa."
- Owner: "Kernel should not hold any specifics. Even site lines are a segment with boundary wall or fence attached and it's formed space is set to a specific use. Voids are where slab not placed."
- Owner: "So remove those plots, footprint and voids and any other. All these are values set every time." Then "Ok go ahead".
- Owner on moving Fit to plot's pieces out of the app into content: "Yes".
- Owner: "Merge the app first, then content." Both merged in that order.
- Owner: "Wrap up and do The next step": Objects declare how they behave, so the kernel's list of kinds goes.

## Earlier sessions

- **41** · 2026-11-20 · The model from first principles (R113) and the Library as a catalogue (R114); line kinds and spaces as tag points merged — Room and slab were rethought from first principles: only nodes and segments are primers, spaces are worked out round a tag point, and Objects attach to hosts (R113). The Library becomes a catalogue of Objects, Layouts and Templates (R114). R113 steps 1 and 2 were built and merged; step 3, Objects on hosts, is next, in a fresh session.
- **40** · 2026-11-16 · Main, staging and the online preview made the same — The online preview was republished from main, and both staging branches were brought level with main. Staging has no extras of its own left: the records fix and the template-proposals workflow are on main now.
- **39** · 2026-11-16 · The workplace test fit merged; staging and the online preview updated; the older pull requests cleared — The workplace test fit (R109) was merged and staging and the online preview were brought up to main. The four older pull requests were then settled: one merged, two closed as out of date, one rebuilt on main and merged. Neither repository has an open pull request.
- **38** · 2026-11-16 · Kernel and canvas upgrade, layers, typologies (Villa, five workplaces), programme, kernel boundary; a workplace test-fit solver built from first principles — The kernel and canvas were upgraded (R89-R98), then layers, model defaults as typologies, a programme and five workplace templates with office Objects were added and merged (R99-R108). The kernel was held to its boundary: typology, programme and design sense live in Projects. Last, a workplace test-fit solver was built; it waits in app #117 and content #56.
- **37** · 2026-11-14 · Runs that belong nowhere merged; Claude sessions on the owner's PC; Make a scene, Render views, chains and Innowa conducting a job, tried on staging with Collab 01 — R79 was merged. Then a full Claude Code session on the owner's PC became a stage kind (R82), and on it Make a scene, Render views, chains and Innowa conducting a job were built (R83-R88). The Collab 01 deck ran through the chain and then as a conducted job on staging. All of it waits in PRs #97, #98 and content #46, #47.
- **36** · 2026-11-12 · Files, image review and Object detail merged; Read a brief replaces Brief to Library; runs that belong nowhere, Blender anywhere and the Studio connector planned — R78, R75 and R73 were built, tried on staging and merged with content #44. The detailed version is now a third form beside an Object, for renders only. Each pipeline does one job. Next: runs that belong nowhere with placing (R79), Blender jobs anywhere (R80) and the Studio connector (R81).
- **35** · 2026-11-12 · Model 4.0 objects, levels and legacy (R64-R67), easy floor-plan drawing (R68-R72), firm templates (R77), and staging fixes — R63, R64 and R65 merged and live; R66 step 1 merged and live. R66 steps 2-4, R67, R68-R72 and R77 are built, each in its own pull request (#81-#90, content #41-#43), and all on staging for the owner to review together. Staging could not record requests: fixed in #94.
- **34** · 2026-11-12 · Where the visualization pipelines fit in Studio, and files a pipeline makes reach the project on approval (R78) — The five pipelines were read against the three visualization phases: Brief to Library covers reading the deck, Fit to plot is the pattern for reading CAD, and Render views and Detail an Object are new. Files a pipeline makes reach the project only on approval, in a folder per pipeline (R78); R73, R75 and R78 are grouped and planned.
- **33** · 2026-11-12 · A visualization pipeline from a design deck: three phases documented as Studio pipelines, four requests noted (R73-R76) — The Collab 01 work (deck to 3D assets in Blender, an assumed layout, a 24 s quick render enhanced by Krea) was written up as a playbook of three Studio pipelines, Deck to 3D assets, Assemble layout and Hybrid render, each closed by an owner review. Studio fits as the orchestrator; four gaps were noted as requests.
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
