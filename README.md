# BuilderPluss Studio — content

Everything BuilderPluss Studio shares that is not code: pipelines, agents, skills, checks, panels, solvers; the Library (Object entries and materials); canvas setups; settings; session memory, briefings, decisions and lessons.

- The app is in [Balajisgit/aec-studio](https://github.com/Balajisgit/aec-studio). Both PCs pull this repository; project work stays on each PC.
- **Definitions** (pipelines, agents, checks, Library Objects, canvas setups) change by pull request; automatic checks run; only the owner merges.
- **Records** (session memory, decisions, lessons, Library proposals, settings requests) are committed directly by the app. A Library proposal or a settings request becomes a pull request by itself (`.github/workflows/library-proposals.yml`, `settings-requests.yml`); only the owner merges.
- Heavy Object assets (meshes, images) are not stored here: an entry refers to them by content fingerprint (sha256); the files live on the PC, later in R2.

See `docs/architecture.md` in the app repository for the whole design.

## Layout

```
pipelines/<id>/<version>.json     pipelines: the scopes they run in, stages (an agent or code), outcomes, checks and decisions
agents/  skills/  solvers/  panels/
checks/definitions/               check definitions with their pass and fail cases
library/objects/<contract>/<version>.json   Library Objects: parameters and limits, 2D symbol, 3D primitive (formulas of the parameters)
library/origins/<contract>/<version>.json   where each Object came from (a project, a pipeline run, the starters); written by the Action with the Object
library/materials/<id>.json
requests/R<4 digits>.md   the owner's requests for the shared work (the app, a pipeline, the Library, a setting), noted from any page; files added to one in requests/files/R<n>/
library/proposals/<contract>@<version>.json   Project Objects the owner proposed (records from the app); an Action opens a pull request for each
canvases/<id>.json                canvas setups
memory/sessions/<number>.md       one file per session, written by the app (phase 2)
memory/briefing.md                generated from the sessions
lessons/<id>.json
requests/settings/<path>.json      a settings change the owner asked for in the app (a record); an Action opens a pull request for it
docs/<id>.md                      guides shown on the app's Docs page; each says its audience (platform: BuilderPluss's own; firms: everyone)
scripts/<name>/<version>.js       platform scripts (with a manifest .json) that run on PCs' Helpers; a firm's own live in its layer
solvers/<id>/<version>.js          a solver (R62): solve(input, geo) gives candidates from a model's roles; with its manifest <version>.json; runs on the server, locked down
semantics/<id>.json               positions: where a line or point is in a face (front, rear, side, own-setback), what it goes on, its values (R63)
templates/<id>/<version>.json      house defaults (R68): draw-as presets, house rules (outer and inner walls, every room a Room + Slab),
                                  the usual openings and floor height; templates/default.json names the one new projects follow
templates/proposals/               new templates, new versions and a new default proposed from the app (R77): the template-proposals
                                  Action turns each record into a pull request the owner merges
library/meanings/<id>.json        functions: what a node, line or face is (wall, door, gate, room, plot…), one per primer, picked from the Library (R63); a firm adds its own in its layer
settings.json                     shared settings: models per tier; library.review (quick review of Library proposals: off, unsure, always)
checks/validate.js                this repository's automatic check
```
