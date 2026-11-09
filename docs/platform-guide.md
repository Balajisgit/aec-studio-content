---
title: How BuilderPluss Studio improves and evolves (for the platform)
audience: platform
order: 1
about: For BuilderPluss's own people: how every kind of change is asked for, made, checked and released.
---
# How BuilderPluss Studio improves and evolves

For BuilderPluss's own people: the Platform Owner, Ops, Developers, Platform FDEs and Support. It says how the app gets
better, who asks for what, who does what, how a change is checked and how it reaches everyone. Firms have their own,
shorter guide (*How BuilderPluss Studio improves, for firms*); this one includes what they see, so you can help them.

## 1. Three ways the app improves

Every improvement is one of three kinds. Knowing which one a change needs is most of the work.

| Lever | What it changes | Where it lives | Examples |
|---|---|---|---|
| **Code** | What the app **can** do | The app repository (`Balajisgit/aec-studio`) | The kernel and its operations; tools agents use; the logic of checks; code stages; pages; the Helper; security; hosting |
| **Knowledge** | **How** the work is done with what the app can do | The content repository (`Balajisgit/aec-studio-content`) for the platform; each firm's own layer for that firm | Pipelines, agents' instructions, which checks a stage uses, Library Objects, layout patterns, lessons, scripts |
| **Feedback** | Knowledge grows **from use** | Made by the app, confirmed by a person | Corrections become lesson proposals; repeated ones become rule requests; kept patterns; Project Objects suggested for the Library |

**The rule of thumb**

- The app **lacks a capability** (a tool, a check's logic, a kernel operation, a page, a connection to another system): it is **code**.
- The capability is there but the **result is poor or not the firm's way** (steps in a poor order, weak instructions, a standard not followed): it is **knowledge**. No deploy is needed.
- The same correction **keeps coming up**: let **feedback** turn it into a lesson; when it has come up often enough the app suggests a rule, which becomes a check (code) or a pipeline step (knowledge).

**How you know it got better:** replayed briefs (Studio page → *Replayed briefs*): a fixed set of briefs Innowa works one by
one in scratch projects, scored by plain code. Every code or knowledge change should keep that score the same or raise it.
That is the line between *changed* and *improved*.

## 2. Who is who

### The platform

| Role | Today | Asks for | Does |
|---|---|---|---|
| **Platform Owner** | Balaji | Anything | Sets priorities; decides; merges code and platform knowledge; approves support access in an emergency; reviews access every 90 days |
| **Ops** | Balaji | Capacity, cost, incidents | The server, deploys (the GitHub *deploy* action), backups and off-site copies, staging, keys and secrets |
| **Developer** | Bikal | Capabilities the code lacks | Code, by pull request, tried on staging, merged by the Platform Owner |
| **Platform FDE** | Bikal | Gaps seen across firms | The platform's knowledge: pipelines, agents, the Library, patterns, lessons, replayed briefs, platform scripts; and, when a firm invites them, that firm's knowledge as its FDE |
| **Support** | (none yet) | Problems firms report | Reads metadata and error logs; asks a firm for support access when it must look inside |

A platform role **never** opens a firm's projects. That takes being in the firm (invited), being a guest on a project, or
support access (asked with a reason, read only, for some hours; the firm grants it, or the Platform Owner in an emergency,
and the firm is told).

### Firms

| Role | Asks for | Does |
|---|---|---|
| **Owner / Admin** | What the firm needs | Its people, workspaces and limits; its own knowledge (at once); approves its FDE's proposals; offers its knowledge to BuilderPluss |
| **FDE** (often a Platform FDE, invited, with an end date) | On the firm's behalf | Proposes the firm's pipelines, agents, scripts and standards (or changes them directly, if the firm allows) |
| **Member** (architects, designers) | Through Innowa, corrections, *Request to BuilderPluss* | Their corrections feed the firm's lessons |
| **Guest** (consultant, client, contractor) | Through the project's Lead | Edits, reviews or views one project; answers decisions as a Reviewer |

### Innowa and the agents

Innowa and the pipelines' agents always act **as the person** they work for, with that person's rights. They note requests,
propose lessons and Objects, draft pipelines and scripts, but a person confirms every change to shared knowledge.

## 3. The life of a change

```
idea → request (R#) → triage → plan → build → try on staging → check (tests, replayed briefs) → release → watch → learn
```

| Stage | Who | Where | What comes out |
|---|---|---|---|
| **Idea** | Anyone | A chat, a page, a correction, a firm | — |
| **Request** | Whoever had it, or Innowa for them | **+ Request** on any page, `request_add` in a chat, *Request to BuilderPluss* for firms | A request, R1, R2…, in `requests/` with where it came from |
| **Triage** | Platform Owner (with the Platform FDE) | Memory & Discussion → Requests | Each request: which lever, how big, planned or declined (with the reason) |
| **Plan** | Platform Owner with Claude | A chat ("work on requests") | Related requests grouped; a short plan agreed; requests set *planned* |
| **Build** | Developer or Platform FDE (often Claude, by pull request) | A branch, a pull request | Code, or knowledge files, with tests or briefs |
| **Try** | The builder, the Platform Owner | staging.studio.builderpluss.com | "stage #N": the pull request runs on staging, with its own data |
| **Check** | Automatic, then a person | `npm run check`; the content repository's check; replayed briefs | Green checks; a replay score no lower than before |
| **Release** | Platform Owner says "merge" | GitHub main | The server follows main by itself (minutes); requests marked done |
| **Watch** | Ops, Platform Owner | Studio page (versions, errors), usage, replays | Anything worse is rolled back (Studio → *Roll back*) |
| **Learn** | The app, then a person | Corrections, Library suggestions, lessons | Proposals the Platform Owner or a firm keeps |

## 4. Asking for a change (the requester's part)

**Ways in**

- **Any page:** the **+ Request** button (top right): a title, the details, what kind, files (a screenshot). The page and what was open come with it.
- **A chat:** tell Innowa ("note a request: …"). It notes it with your words and where it came up.
- **A correction:** you don't ask at all. Undoing or changing what an agent did is read by the corrections reader (Pipelines page → *From your corrections*): the app proposes the lesson; you keep it with a tick.
- **The Library:** Project Objects used in two or more projects are suggested for the Library.
- **A firm:** its people use *Request to BuilderPluss* (Studio page). It arrives in the same list, marked with the firm and the person. The firm sees only its own requests and where they stand, never this list.
- **A firm's offer:** a firm's owner, admin or FDE offers one of its knowledge files (a pipeline, an Object, a script) with *Offer to BuilderPluss* (Knowledge card). It arrives as a request with the file attached and the firm's consent written in.

**A good request** says what you want in one line, why (what goes wrong, or what it would make possible), an example (a
project, a run, a screenshot), and what *done* looks like. One request is one thing.

**Kinds:** the app, a pipeline, the Library, a setting, something broken, other.

**States:** open → planned → in a pull request → done (marked by itself when the pull request is merged), or declined with
the reason. A firm sees the same states for its own requests.

## 5. Doing the work (the doer's part)

### 5.1 Code (Developer)

1. **Branch** from main; one pull request per request or group of requests.
2. **Keep the design:** the design kernel (`kernel/`) never imports the geometry engines (`geom/`) except through `kernel/engine.js`; managers own their tables; every model change is a logged, undoable step; every page request, notice, file and tool goes through `server/access.js` (who may do what).
3. **Test:** add tests beside the code (`*/test/*.test.js`); `npm run check` runs syntax, types and every test. A pull request goes green or it doesn't go in.
4. **Try on staging:** "stage #N" puts the pull request's branch on staging (staging.studio.builderpluss.com, its own data; records made there never reach GitHub).
5. **Describe it:** what it does, why, what the checks cover, anything left out. The Platform Owner reads it.
6. **Release:** the Platform Owner says "merge". The server follows main by itself; a change to the server's own code restarts it after a backup.
7. **Rollback:** Studio → *Roll back* (the version before the last update; following pauses) or a revert pull request.

**When code is the answer:** a new tool for agents or Innowa; the logic of a new check; a new code stage; a kernel
operation; a page; a connection to an outside system; anything about security, accounts, hosting or the Helper.

### 5.2 Platform knowledge (Platform FDE)

Knowledge files live in the content repository and change by pull request too:

| What | Where | Rules |
|---|---|---|
| Pipelines | `pipelines/<name>/<version>.json` | A new version for a change (1.2.0 → 1.3.0); stages use only the app's tools, code stages, conditions, context sources and checks |
| Agents | `agents/<id>.json` | Instructions in plain sentences; a model tier (quick, default, complex) |
| Checks | `checks/definitions/<id>.json` | Names a check the app implements; its logic is code |
| Library Objects | `library/objects/<contract>/<version>.json` | A published version never changes; a new version for any change; it must pass the Library check |
| Layout patterns | `patterns/<id>.json` | Kept from accepted rooms |
| Lessons | `lessons/<agent>.md` | One per line; tags (`[draw_walls, wall]`) so an agent gets it only when it is relevant |
| Replayed briefs | `evals/briefs/` | The fixed briefs that measure every version |
| Scripts | `scripts/<name>/<version>.js` and `.json` | Run on PCs' Helpers, never on the server |
| Guides | `docs/<id>.md` | This page and the firms' guide; each says its audience |

**The gate:** the content repository's own check (`checks/validate.js`) and the replayed briefs. Replay before and after
(Studio → *Replay now*); the score must not fall.

**From a firm to the platform:** a firm's offer arrives as a request with its file. If it is good for every firm: make it
general (no firm names or private standards), give it a platform name and version, open the content pull request, and tell
the firm (the request's state does that). The firm's own copy stays theirs.

### 5.3 A firm's knowledge (Firm FDE)

When a firm invites you as its FDE (with an end date), Studio → *Knowledge: <firm>* shows its layer: lessons, Library
Objects, patterns, pipelines, agents, checks and scripts, on top of the platform's. Inside the firm's work Innowa uses both.
Your changes are proposals the firm's owner or an admin approves, unless the firm lets its FDE change it directly. Ask
Innowa in the firm's chat to draft a pipeline or a script with the firm's people; it saves it with `knowledge_put` once they
agree, checked first.

Never copy one firm's knowledge to another, or to the platform, except through the firm's own *Offer to BuilderPluss*.

### 5.4 Feedback (everyone, by using the app)

- **Corrections → lessons:** Pipelines page → *From your corrections*: proposals with how often they came up and where. Keep (edit the words and tags first if you like), make it a request for a rule, or set it aside.
- **Lessons → rules:** a proposal that keeps coming up (three times or more) offers *Make it a request*: it becomes a check (code) or a pipeline step (knowledge).
- **Patterns:** a room the owner accepts can be kept as a pattern (canvas); Innowa then starts from it.
- **Library suggestions:** Library → *From your projects*.
- Inside a firm, all of this lands in the **firm's** layer and never reaches the platform except by its offer.

## 6. Quality gates

| Gate | What it catches | Where |
|---|---|---|
| `npm run check` | Syntax, types, every test (165 and growing) | Every app pull request |
| Kernel boundaries | The design kernel and the engines keep to their sides | Part of the tests |
| The content check | Layout, JSON, versions, Objects, pipelines | Every content pull request |
| Replayed briefs | Whether agents got better or worse | Studio page, before and after |
| Staging | What tests can't: the real thing, on the real server | staging.studio.builderpluss.com |
| A firm's knowledge check | Bad JSON, an Object failing the Library check, a pipeline the app can't run, a script that doesn't parse | On save, in the app |
| Access reviews | People holding more than they should | Every 90 days (Organization and Platform cards) |
| Two-factor | A stolen password | Required by the Platform Owner for owners, admins and the platform's people |
| Usage limits | A runaway cost | A firm's monthly limits (warn or stop) |

## 7. Who decides what

A = asks, D = does, ✓ = approves, i = is told.

| Change | Firm member | Firm owner/admin | Firm FDE | Developer | Platform FDE | Platform Owner |
|---|---|---|---|---|---|---|
| A feature or fix in the app | A | A | A | D | i | ✓ (merge) |
| A platform pipeline, agent, check use | A | A | A | — | D | ✓ (merge) |
| A Library Object for everyone | A (suggested) | A (offer) | A | — | D | ✓ (merge) |
| A platform lesson | (correction) | — | — | — | D | ✓ (keep) |
| The firm's own pipeline, agent, script | A | ✓ / D | D (proposal) | — | (as FDE) | — |
| The firm's own lesson, pattern, Object | (correction) | ✓ / D | D (proposal) | — | (as FDE) | — |
| A firm's knowledge becoming the platform's | — | ✓ (offer, consent) | A | — | D | ✓ |
| People and roles in a firm | — | D | — | — | — | (support only) |
| Platform roles, new firms | — | — | — | — | — | D |
| Support access to a firm | — | ✓ | — | — | — | A, or ✓ in an emergency (firm told) |
| Deploys, servers, backups | — | — | — | — | — | D (Ops) |

## 8. Platform and firms: what is shared, what is private

- **Shared by everyone:** the app (code), the platform's knowledge (content repository), the guides.
- **Private to a firm:** its projects, chats, files, runs, usage, and its knowledge layer (its lessons, Objects, patterns, pipelines, agents, checks, scripts).
- **Private to BuilderPluss:** its own working memory (sessions, decisions, requests, lessons list): the platform's people only. Firms see their own requests to BuilderPluss, not the list.
- **What a firm's work teaches** (its corrections, its Objects) stays in the firm. The platform learns from a firm only when the firm offers something, with consent.
- **A guest** sees one project and the platform's knowledge, never the host firm's layer.

## 9. Environments and releases

| Where | What it runs | Data | Who uses it |
|---|---|---|---|
| A PC (127.0.0.1) | main, for one person | Its own | The owner's local work, offline |
| **Staging** (staging.studio.builderpluss.com) | The `staging` branch: main, or a pull request put there | Its own accounts and data; content read only | Developers, FDEs, the Platform Owner, trying changes |
| **Production** (studio.builderpluss.com) | main, followed by itself | The real firms' | Everyone |

- Production gets only what is merged to main. A change to the server's code restarts it after a backup; content changes apply at once.
- Rollback: Studio → *Roll back*, or a revert. Backups: Storage page; off-site copies to Cloudflare R2 when its keys are set.
- PCs' Helpers: a new Helper version is marked *older Helper* on the Helpers card; people download it again.

## 10. Measuring progress

| Measure | Where | Good sign |
|---|---|---|
| Replay score per version | Studio → Replayed briefs | Rising, never falling |
| Corrections per run | Pipelines → From your corrections | Falling for the same kind of work |
| Lessons kept, rules made | Lessons, requests | Repeated corrections become rules |
| Requests: noted, done, waiting | Memory & Discussion → Requests | Few waiting long; firms' requests answered |
| Claude use and cost | Organization and Platform cards | Steady per run; limits rarely hit |
| Firms' knowledge offered and accepted | Requests (offers) | Good firm work reaching every firm |

## 11. Your part, on one page each

**Platform Owner.** Read new requests weekly; triage and plan with Claude ("work on requests"); say "merge" only after green
checks and, for anything that matters, a try on staging; keep replay scores from falling; review access every 90 days; keep
two-factor required; grant support access only with a reason (emergency grants are told to the firm).

**Ops.** Keep the server healthy (Actions → deploy → status, logs); staging up; backups and R2 copies; secrets only in
GitHub Secrets or `secrets.env`, never in a chat; watch disk and CPU.

**Developer.** One request, one branch, one pull request; tests with the code; keep the boundaries and the access rules;
try on staging; write what you did and what you didn't.

**Platform FDE.** Watch corrections and offers across firms; turn repeated needs into platform pipelines, agents, Objects and
lessons; replay before and after every change; as a firm's FDE, work in its layer only and never move its knowledge without
its offer.

**Support.** Answer with metadata and logs first; ask for support access only when you must look inside, with a clear
reason and the fewest hours; end it when done.

## 12. Worked examples

**A new tool (code).** A firm asks for "IFC export" (*Request to BuilderPluss*). Triage: the app can't write IFC: code, or a
script on the Helper. Plan: an IFC exporter as a platform script that runs on PCs (no Python on the server). Build: the
Developer writes it, with a test; the Platform FDE adds a pipeline step that uses it. Try on staging; replay; merge. The
firm sees its request *done*.

**A firm's hotel-room pipeline (firm knowledge).** The firm's FDE asks Innowa, in the firm's chat, to draft "Our hotel
room": read the brief, plan with the firm's standard sizes, check, ask the architect. Innowa drafts the pipeline and its
agent; the app checks them; the firm's owner approves. Only the firm has it. Months later the firm offers it; the Platform
FDE makes a general version for every firm.

**"Walls are always 230 mm" (feedback).** An architect corrects wall thickness three times. *From your corrections*
proposes the lesson "[wall, draw_walls] Walls are 230 mm"; the owner keeps it. Inside a firm it is the firm's lesson. If it
keeps coming up anyway, *Make it a request*: a check that flags walls of another thickness.

**A client's sign-off (roles).** The Lead invites the client as a Reviewer on one project. The pipeline stops at its
decision; the client approves it in the Studio; the log records who approved what, when.
