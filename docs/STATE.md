# Runes & Ruins · delivery state

2026-11-14. Complete playable three-depth campaign implemented from the supplied Russian design/story/technical/art documents. Repository: https://github.com/procrastinate-games/runes-and-ruines . Live entry: https://pg-runes-and-ruines.register-c02.workers.dev/ . The organization-created repository is spelled `ruines`; save keys/catalog follow that exact slug.

All features are present: deterministic first-person grid exploration, five enemy types and two-phase boss, equipment/three spells/consumables/statuses/levels, two puzzle forms, keys/chests/secrets/fog map, Bessa shop/negotiation, friendly Antarion's one-rune optional quest, original Georges portrait and independently invented NPC art, short Russian dialogue and ending, desktop/touch controls, save/checkpoint retry, settings and synthesized audio.

Verification and limitations: see QA.md. Engine and full route tests pass; full browser-controller route reached victory with all three secrets and the optional quest. Production build and manifest validate; nested static deployment has no external runtime dependencies or mutation hooks. Desktop, mobile landscape and portrait rotation message were visually inspected. No user playtest or physical mobile GPU/pacing verification is claimed.

The first playable commit 0797de3 was pushed as soon as available. Its shared publish workflow succeeded (run 43551209691), including live verification and portal refresh. Subsequent main pushes use the same unchanged workflow; current release outcome is visible at https://github.com/procrastinate-games/runes-and-ruines/actions . No token or private reference image is in the repository.

Next step for independent player review: play the published normal campaign and assess pacing/difficulty on physical desktop/mobile hardware. Do not reopen scaffolding or reset shipped save keys. No implementation feature is deferred.


## Russian editorial update

The user requested a full Russian copy pass while keeping the opening dialogue exact. Player-facing item/spell names, descriptions, objectives, notes, dialogues, HUD/help, quest stages and runtime feedback were edited; see russian-editorial.md for the display glossary and scope. The turn engine, maps, content IDs, balance and save schema are preserved. English localization is not part of this existing-game editorial request. All 40 engine/campaign tests and six browser regressions pass; desktop/mobile copy screens were inspected with no horizontal overflow. Updates publish through the existing shared workflow.
