# AEC Studio 6 — content

Everything AEC Studio shares that is not code: pipelines, agents, skills, checks, panels, solvers; the Library (Object entries and materials); canvas setups; settings; session memory, briefings, decisions and lessons.

- The app is in [Balajisgit/aec-studio](https://github.com/Balajisgit/aec-studio). Both PCs pull this repository; project work stays on each PC.
- **Definitions** (pipelines, agents, checks, Library Objects, canvas setups) change by pull request; automatic checks run; only the owner merges.
- **Records** (session memory, decisions, lessons) are committed directly by the app.
- Heavy Object assets (meshes, images) are not stored here: an entry refers to them by content fingerprint (sha256); the files live on the PC, later in R2.

See `docs/architecture.md` in the app repository for the whole design.
