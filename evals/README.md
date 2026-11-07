# Replayed briefs (R52)

A fixed set of small briefs, replayed through Innowa after a change to the app, the agents' instructions or their lessons, to
see whether the agents get better. Start one from the Studio page (**Replay now**; it needs Claude Code on the PC).

- `briefs/<id>.json`: `{id, name, ask, expect}`. `ask` is the owner's message; each brief runs in its own scratch project
  (a Ground floor, nothing else) and chat, removed afterwards. `expect` lists the checks plain code runs on the result:
  `spaces` (min, max), `space` (name, min/max net m²), `openings` (kind, min, max), `levels`, `placements` (contract),
  `no-errors` (no rule errors), `rooms-claimed` (every room the walls close has its space).
- `results/<time>.json`: what each replay scored (committed by the app): per brief, the checks passed and what was seen,
  the steps the app refused, rule errors left, cost.

Keep briefs few and stable: a change to a brief makes its scores incomparable with earlier ones. Add one by pull request.
