# Briefing

_Generated from memory/core.md and memory/sessions/; do not edit by hand. Next session: 20._

## What this is

AEC Studio 6, owned by Balaji (BuilderPluss): a local-first app for agentic AEC design, rebuilt from first principles in November 2026 as eight managers around one design kernel. It will be hosted later; nothing in it assumes one PC. Balaji is the only approver; associates (Bikal) may propose on the content repository.

- **App (code):** private GitHub repository `Balajisgit/aec-studio`, branch main. Started on the PC with `Start-Studio.bat` (D:\aec-studio), at http://127.0.0.1:3000.
- **Content (everything shared that is not code):** private repository `Balajisgit/aec-studio-content`, cloned next to the app (D:\aec-studio-content). Pipelines, agents, skills, checks, panels, solvers; the Library; canvas setups; settings; memory (this briefing, sessions, decisions, lessons).
- **PC:** the database (projects, runs, model logs, chats) and folders (project files, backups, Object assets by fingerprint; R2 later). Project work moves between PCs only by export and import.
- **Architecture:** the owner's doc *AEC Studio 6 — Architecture* (2 Nov 2026); the short version is `docs/architecture.md` in the app repository.
- **The old app** (AEC Agent Studio 2, `Balajisgit/aec-agent-studio`, D:\aec-agent-studio-5.1) keeps running until phase 5, then is archived. Its pipelines, agents, checks and rules are not carried over.

## Managers and build phases

Studio (phase 1: versions, updates, settings, Claude runtime) · Memory & Discussion (phase 2: the chat, sessions, briefing, decisions) · Projects and Canvas (phase 3) · Library (phase 4) · Pipelines (phase 5, new ones with the rules) · Files and Storage (phase 6, ready for hosting).

## Words

Library (the shared collection) · Object (one Library entry: parameters, a 2D symbol, a 3D primitive, materials; versioned, never changed in place) · Placement (an Object used in a project) · Need (what a brief calls for, before matching) · Stage, Decision, Output (pipelines). The word "type" is not used.

## The kernel (mesh-light)

The model stores intent, never triangles: nodes, segments (walls and others), openings on a segment at a station in mm, spaces as cycles of segments, Placements at a level, a segment or a node, analytical primitives, rare escapes. Integer mm, snap 5 mm, nothing stores a coordinate it can derive, provenance on every element, GlobalIds as uuid5 in IFC's form. Invariants I1–I11 run after every operation; a step that adds a failure is refused. Exchange format `model.json`, schema 2.0 (`kernel/model.schema.json`). JavaScript kernel; a Python helper comes later for IFC export.

## How changes happen

- **Code and definitions:** a pull request opened by Claude from a chat (or by an associate on content); automatic checks run on GitHub; only the owner merges. The app holds no GitHub token.
- **Records** (sessions, decisions, lessons): committed straight to the content repository, by the app with the PC's Git sign-in, or by a chat outside the app.
- **Project work:** logged, invertible operations on the PC; the owner decides only at declared decisions.
- The app follows GitHub main for both repositories by itself (database backup first; a server change waits for a restart; pause and roll back on the Studio page).

## How a session should work

- Each chat is a session. In the app, Claude keeps the record with `memory_record` as the chat goes and when the owner says "wrap up".
- A chat outside the app (claude.ai) writes its record itself: `memory/sessions/<number, 4 digits>.md` in the format the app writes (front matter: number, date, title, source; then the headline, Done, Decisions, Open), appends its decisions to `memory/decisions.md`, regenerates `memory/briefing.md` with the app's `managers/memory/format.js`, and commits to the content repository's main. No wrap-up JSON, no pasting.
- Limits: title 200 characters, headline 400, at most 12 items of 300 characters in Done, Decisions and Open. Decisions quote the owner's words.
- Explain in plain language; the owner often reads on a phone. Never approve, merge or release: those are the owner's actions. Don't use the BuilderPluss MCP tools.

## Open now

- Owner: review and merge phase 2 (app PR #2, content PR #2); then the app updates itself, or Update now on the Studio page.
- Owner: run Start-Studio.bat from D:\aec-studio and try the chat; sign in to GitHub on the PC (GitHub Desktop) so records can be pushed.
- Phase 3: Projects and Canvas managers (projects, model log, freestyle editing with Claude; built-in plan and 3D, Canvas13); kernel adds rooms from walls, wall outlines, areas.
- Then phase 4 Library, phase 5 Pipelines (new ones with the rules; archive the old app), phase 6 Files and Storage (ready for hosting).
- Studio 2 publish task: no longer needed (local only); delete it, and the old task trig_01Tq7yFcL7sCDtakyirzMmaq, when convenient.
- Fix or confirm the example model's P1 parameters (w, h vs t, joint).
- Old app clean-up on the PC: runs/ helper files (filing.md, fix-requests, fix-c, parity-bundle.tgz, context-export.json, wrapup-session.json).
- Carried: tell Bikal about Canvas13 gaps (catalogue objects not clickable in plan; API key not checked on read/edit).

## Recent sessions

### Session 19 · 2026-11-02 · AEC Studio 6: rebuilt from first principles; phase 1 merged, phase 2 (memory) in review
After stage 1 of the old app (automatic checks, follow main) the owner chose a rebuild: AEC Studio 6, eight managers around a mesh-light kernel, two repositories; phase 1 is merged and phase 2, sessions that record themselves, is in review.

Done:
- Old app, stage 1 merged (08adca4): automatic checks on every pull request (syntax, platform rule, strict parity on a test bundle); the local app follows GitHub main with backup, pause, roll back.
- Architecture doc 'AEC Studio 6 — Architecture' written and settled with the owner: managers, words, pipelines as stages, change flow, where things live, build order, the design kernel.
- Kernel defined from the owner's mesh-light note and Building IR schema; schema 2.0 in our words (library, placements, objectRef, contract, location).
- Repositories Balajisgit/aec-studio and aec-studio-content created by the owner and opened to the Claude GitHub App.
- Phase 1 merged: kernel (operations, invariants I1-I11, log, GlobalIds), server, shell, Studio Manager, Start-Studio.bat, automatic checks on both repositories.
- Phase 2 built: the chat beside every page; memory_record commits sessions, decisions and the briefing to content; two-PC numbering and waiting records handled; Memory & Discussion page. App PR #2, content PR #2.
- Sessions 1-18 moved from the old app into content memory, with a core rewritten for AEC Studio 6; this session recorded directly by the chat.
- Owner's example model passes every invariant except I11 on P1 (params w, h not declared by its Library Object).

Decided:
- Owner: "can we recreate the app entirely as new one from the scratch first principle" with managers Studio, Pipeline, Library, Canvas, Storage, Files, Memory & Discussion.
- Owner: "Local only as a new repo and app"; then "though it is local only app, it ll be hosted soon".
- Owner: words "Object / Placement / Need"; pipelines option "B" (stages, outcomes, declared decisions); "two repositories (app + content)"; "plain modules with checked annotations"; "same bat file implementation".
- Owner: "apart from project data - every thing shared is in git"; Library entries in Git, Object assets local, R2 later; memory and briefings in Git.
- Owner: "dont use the word type"; "dont inherit older pipelines. lets create new once this is built"; "lets create rules later".
- Owner: "pull requests stay something Claude opens from a chat"; associates (Bikal) get the content repository; detailed 3D after the pipelines phase.
- Owner: JavaScript kernel ("Recommended"), Python helper later for IFC; the IR is not shared with another project.
- Owner: memory brought forward to phase 2; "go" on each chat being a session and a running decisions list.

### Session 18 · 2026-10-31 · Parity passed, delete library types, Types → Library, handover publishes outputs (B), library manager 0.3.0 live (C)
The parity test passed on the owner's data, the owner can now delete library types and the Types window is called Library, handovers publish outputs that orchestration routes (Request B), and library manager 0.3.0 was generated, released, fixed and synced into the Studio (Request C).

Done:
- Parity test at 04d351c on the owner's data bundle (run in the cloud: the PC workspace has no internet): 10/11 same, the 11th only the known 'General' chat header. Rerun on Request B: same.
- Checked the 13 new 2D/3D preview versions: 4 passed; 9 failed (tracer skips tube and profile parts, Blender-only params count as unused, 5 primitives larger than their envelope). Owner chose to delete all types instead.
- Merged 3ce3078 (req/delete-types): Library window deletes one version, all versions of a type, or the whole library; a version placed in a project is kept; deleted docs copied to library_deleted. Types window renamed Library.
- Merged 2962991 (Request B, req/handover-output): the handover gate publishes the report as an output (inventory-report or stock-report), never a project; one matching pipeline starts in the same project and the owner is told, several ask, none waits.
- Request B also: Outputs panel in every project (pick up own or another project's output; freestyle takes items in, several outputs, each once); chat tools list_outputs and pick_up_output; engine record_handover {output,type}, receive_handover {output}.
- Filing went wrong: a session filed A, B, C over released REQ-006/007/008. Restored from backup before-filing-A-B-C; A, B, C re-filed as REQ-036 (built), REQ-037 (built), REQ-038.
- REQ-038 (library manager 0.3.0) driven and released by the owner. Generate labelled the pipeline and the library agent 0.1.0; relabelled 0.3.0 and 1.4.0 with changelog notes; input renamed inventory-report so outputs route to it.
- Merged 45146d1 (req/registry-draft-version): a draft of an existing component gets a higher version (plan's for pipelines, else next minor); release blocked otherwise. JS ports of the critics preview-only and housekeeping-reported.
- Synced into the Studio: panels/preview-additions@0.1.0 and pipelines/library-manager@0.3.0 (intake, classify, report, approve-add, add, housekeeping, handover). Owner: 'it is live'. Helper sessions 15-17 recorded those steps.
- Studio 2 updated by the owner to 3ce3078 (this chat was not allowed to start the publish task).

Decided:
- Owner: 'delete all the types and lets create new on the fly while doing projects. also give option to delete the types'.
- Owner: 'change the Types name to Library - everywhere it needs to'. The canvas Library tool (O) keeps its name.
- Owner: 'make A as built. continue b and c'; then 'merge' (delete-types), 'merge b', 'ok' (fix C's versions, input name and sync), 'merge' (registry-draft-version).
- A placed library type can't be deleted (R10); deleted library docs are copied to library_deleted first (R12).
- A pipeline takes an output when one of its inputs has the output's type as id and a handover format; routing reads declared inputs, not a fixed next pipeline.
- Library types have no stable-approval button; they become stable only through a pipeline release gate.
- Requests filed from a session get explicit, checked-free REQ ids. Fix files for local sessions do not call memory_start.

### Session 17 · 2026-10-31 · Sync library-manager 0.3.0
Synced library-manager 0.3.0 to the Studio: panels/preview-additions@0.1.0 and pipelines/library-manager@0.3.0 created.

Done:
- Backed up database (before-sync-lm-030).
- Verified engine.js has critics preview-only and housekeeping-reported.
- Created panels/preview-additions@0.1.0 from reg_panels/preview-additions.
- Created pipelines/library-manager@0.3.0 with inputs inventory-report (handover format), 7 steps: intake, classify, report, approve-add, add, housekeeping, handover.

### Session 16 · 2026-10-31 · Fix REQ-038 version labels
Fixed version labels: library-manager 0.3.0, library agent 1.4.0. Sync blocked: preview-additions@0.1.0 panel and critics preview-only, housekeeping-reported missing from Studio.

Done:
- Backed up the database (before-fix-c).
- Verified reg_pipelines/library-manager was version 0.1.0 with steps: intake, classify, report, approve-add, add, housekeeping, handover.
- Updated reg_pipelines/library-manager: version 0.3.0, path pipelines/library/library-manager/0.3.0/pipeline.json, inputs named for routing (inventory-report, project-types, library-catalog, mode), changelog note added.
- Updated reg_agents/library: version 1.4.0, changelog note added.

### Session 15 · 2026-10-31 · Filing requests A, B, C
Fixed: REQ-006/007/008 restored to their original released state; new requests filed as REQ-036/037/038.

Done:
- Backed up the database (before-filing-A-B-C).
- Filed REQ-036 (A): Library items carry a 2D symbol and a 3D primitive, with a check that they agree. Stage: built.
- Filed REQ-037 (B): A handover publishes its report as an output; orchestration routes it; only the owner creates projects. Stage: built.
- Filed REQ-038 (C): Library manager 0.3.0: independent, any input, match or add as preview, housekeeping mode. Stage: queued.
- Fix: backed up again (before-fix-requests), restored REQ-006/007/008 from their .original.json files, renumbered the new requests to REQ-036/037/038.

## Earlier sessions

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
