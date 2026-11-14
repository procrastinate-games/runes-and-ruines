# Russian editorial pass · 2026-11-14

Scope: player-facing Russian text, reviewed by the agent in context. The user approved clearer, idiomatic wording while retaining dry humor. The four-line opening dialogue is preserved byte for byte. Georges, Antarion, Asterna, the Regent and the story/quest structure are retained. This pass does not change game rules or saved identifiers/formats.

## Display glossary

| Previously displayed | Current display | Meaning |
| --- | --- | --- |
| Фокус | Энергия | Resource used for spells; stored as `focus` as before |
| Рунный фокус | Рунный кристалл | The magical tool, distinct from the resource |
| Жар-печать | Огненная печать | Fire spell; compact belt label «Печать» |
| Отзвук | Ударная волна | Knockback/stun spell; compact belt label «Волна» |
| Цикл | Раунд | Enemy-response cycle; the help screen explains haste's two actions |
| Ослабление | Истощение | The focus-drain / regeneration-blocking debuff |
| Плесневый шорох | Плесневый ползун | Mushroom-like crawling enemy |

Full spell names and costs remain available in accessible button labels and help; compact labels fit the mobile belt. Russian count forms are used for bolts, coins and round durations.

## Reviewed content

- All item, ability, enemy and status labels/descriptions: clear actions, resources, costs, ranges and durations, consistent with the implemented rules.
- Location objectives, clues, notes and interactable labels. The mine bridge clue refers to position II and the side door. Quest text distinguishes finding the rune, returning to Antarion and opening the reward passage. The HUD and journal share the current objective, so completed key/meeting steps no longer remain as the next instruction.
- HUD, map, journal, equipment, shop, help, menus, saves, defeat/retry, ending and portrait-rotation message. Interactions have explicit verbs. Save/retry text names the actual save operation rather than an implied rest/camp mechanic.
- Runtime feedback: unavailable targets/items, locks, puzzles, secret discoveries, resource recovery and boss/trap warnings. Boss phase-II warning reflects its two-round windup.
- Dialogue: the opening stays exact; Bessa and Antarion retain short humorous exchanges. The boss's theatrical speech, rune names «Солнце / Древо / Луна» and the concise ending remain intentionally stylized.

The original supplied design/story documents remain source briefs; the actual release wording lives in `src/content`, `src/ui/hud.ts`, `src/game/engine.ts` and `src/main.ts`. This document records the user-approved editorial terminology so later work does not restore the awkward working names. No native-speaker or independent human review is claimed.
