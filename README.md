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
library/objects/<contract>/<version>.json   Library Objects: their kind (a word), what they do (behaves: band, holds-openings, opening, way-through, stops-bands, cuts-floor-above; R113), parameters and limits, 2D symbol, 3D primitive (formulas of the parameters); <kind>.generic is the one a Placement gets until it is swapped
library/objects/<contract>/catalogue.json   an entry's catalogue card (R114): line, uses (template use ids), typology (villa, workplace), ifc, keywords; how people find it, not versioned
library/tree.json                 the Library's browse tree (R114): categories by what a thing is for, each listing its products (a contract, or {name, line?, choices: [contracts]}); unlisted keeps the generic ones out; anything else unplaced shows under More
library/origins/<contract>/<version>.json   where each Object came from (a project, a pipeline run, the starters); written by the Action with the Object
library/materials/<id>.json       how a finish is shown in 3D (R92): its id a part's slot (wood, metal, glass) or a kind (wall, slab); {id, name, color, roughness?, metalness?, opacity?, about?}; a firm adds its own in its layer
requests/R<4 digits>.md   the owner's requests for the shared work (the app, a pipeline, the Library, a setting), noted from any page; files added to one in requests/files/R<n>/
library/proposals/<contract>@<version>.json   Project Objects the owner proposed (records from the app); an Action opens a pull request for each
canvases/<id>.json                canvas setups
memory/sessions/<number>.md       one file per session, written by the app (phase 2)
memory/briefing.md                generated from the sessions
lessons/<id>.json
requests/settings/<path>.json      a settings change the owner asked for in the app (a record); an Action opens a pull request for it
docs/<id>.md                      guides shown on the app's Docs page; each says its audience (platform: BuilderPluss's own; firms: everyone)
scripts/<name>/<version>.js       platform scripts (with a manifest .json) that run on PCs' Helpers; a firm's own live in its layer
solvers/<id>/<version>.js          a solver (R62): solve(input, geo) gives candidates from a model's spaces and Placements (as geometry); with its manifest <version>.json; runs on the server, locked down
                                   (its manifest's reads, R109: "project" also gives it the project's typology, planning module and programme; "library" the Library's Objects by name)
templates/<id>/<version>.json      model defaults (R68), one per typology (R100: villa; R103: workplace-tech, -corporate, -coworking, -contact-centre, -studio): its spaces (the uses a room may have, each with the
                                  firm's smallest area and side, whether it needs a window, is wet, is open; uses kept apart), draw-as presets,
                                  rules (outer and inner walls, every room a floor finish, every floor plate a slab), the usual openings and floor height;
                                  templates/default.json names the one new projects follow
templates/proposals/               new templates, new versions and a new default proposed from the app (R77): the template-proposals
                                  Action turns each record into a pull request the owner merges
settings.json                     shared settings: models per tier; library.review (quick review of Library proposals: off, unsure, always)
checks/validate.js                this repository's automatic check
```
