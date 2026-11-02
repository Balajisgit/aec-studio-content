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
