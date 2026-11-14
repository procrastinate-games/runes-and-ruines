# Complete playable campaign

Scope: all supplied gameplan requirements in one authorized autonomous delivery.

- [x] Deterministic grid turns, combat, items, enemy AI, statuses and persistence verified by engine/rules tests.
- [x] Three traversable authored levels, all three secrets, rune/bridge puzzle forms, merchant, early-rune Antarion hand-in and reachable boss ending verified by normal-difficulty route tests with earned resources.
- [x] Browser boots in two clicks; keyboard/touch, map/inventory/settings/retry verified by browser regressions. Original portrait, sprites, library and responsive layouts visually inspected by the agent.
- [x] npm test, strict production build and publisher validation pass. First playable source pushed to main and shared deployment succeeded; final main pushes use the unchanged shared workflow.

Exit condition: the player starts, explores Asterna, defeats Regent and sees the single ending. Verified by complete browser-controller replay in 266 turns, 21 defeats, 3 secrets and one optional quest, matching pure-engine state.

Human acceptance still open: subjective feel, 30–60 minute first-play pacing, physical mobile performance and sound comfort. This is explicitly not marked as verified by a user. See QA.md and README.md.
