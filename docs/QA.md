# Verification record · 2026-11-14

## Deterministic engine and campaign

`npm test`: 40 passing tests in three files. Coverage includes blocked/valid moves, 100-step integer coordinates, free versus alert rotations, seed reproducibility, invalid-target resource conservation, physical/elemental damage, spell effects, stun cooldown, burn lifetime, bounded haste, status expiry, pursuit collision, ranged cover, focus drain, inventory and potion rules, defeat/victory, purchases/discounts, one-rune quest rewards, puzzle resets, bridge/shortcut unlocking, content placement, save roundtrip and malformed-save rejection.

Both full route tests use the normal difficulty, only earned loot, ordinary healing and actual turn intents. They never alter HP, grant gear or bypass doors:

| Route | Player actions costing turns | Enemy cycles | Defeats | Secrets | Level | Ending |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| All secrets, rune found before Antarion | 266 | 265 | 21 | 3/3 | 4 | Victory |
| Mandatory route, no rune or secret reward | 218 | 217 | 20 | 0/3 | 4 | Victory |

The all-secrets route was also replayed as 328 real commands through the browser action controller. It reached victory with no browser errors and matched the engine's turns, cycles, kills, seed, secrets, flags, inventory, equipment, HP, focus and purchase state. No campaign state was replaced in that replay. The extra action is the intentionally free level transition.

## Browser regressions

`npm run test:browser`: 6 / 6 pass in a complete isolated run (1.9 minutes). Playwright covers the two-click title/intro flow; idle time; keyboard movement; menu turn safety; manual save/refresh/load; rapid input and wall blocking; three spells and healing; merchant purchases and discount; Antarion's early-rune hand-in; secret/puzzle UI; victory/new-game confirmation; defeat/checkpoint retry; mute/quality settings; corrupt-save recovery; touch movement; 44px primary touch targets; mobile overflow and portrait rotation message.

Screenshots were inspected at 1366×768, 844×390, 640×360 and 390×844. Original in-game portrait, readable library/NPC appearance, single ending and responsive controls were inspected. A concurrent screenshot capture caused one 30-second test timeout during the final pass; the complete isolated run then passed all six tests without changing or weakening any assertions.

## Production

Strict TypeScript and Vite production build pass. Publisher manifest validation passes for the exact repository slug `runes-and-ruines`. `public/cover.webp` is 960×600 and copied into the build. No private source photograph or historical screenshots appear in runtime assets.

A static copy served at `/runes-and-ruines/` loaded and accepted movement with zero failed requests, zero console errors and no external runtime requests. Production `__QA__` mutation hooks are absent; read-only state inspection remains available.

The organization's shared workflow successfully tested, built, smoke-tested, published and verified the first playable commit. Final release workflow and live verification are recorded in docs/STATE.md.

## Human verification still open

The intended 30–60 minute first-play pacing, subjective balance, sound comfort and frame rate on physical Android/iOS hardware need independent human playtesting. Browser device emulation and a headless software renderer verify behavior/layout, not real mobile GPU performance. No user playtest is claimed.
