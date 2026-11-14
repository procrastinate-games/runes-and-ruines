# Games to Procrastinate To

<!-- platform:bootstrap:start — preserve this loader; common policy is remote, not copied here. -->
## Load current platform rules at session start

1. Resolve `procrastinate-games/game-template` branch `main` to a commit SHA using GitHub tools/API or `gh api repos/procrastinate-games/game-template/commits/main --jq .sha`.
2. Fetch and read `PLATFORM.md` at that exact SHA before planning or editing. Source: `https://github.com/procrastinate-games/game-template/blob/main/PLATFORM.md` (raw/API access is fine). Read the central `VERSIONING.md` for game releases, `GAME-CREATOR.md` for game workflow, and `LOCALIZATION.md` for new games or localization/text work, all at the same SHA.
3. Reuse those fetched documents for this session; do not repeatedly fetch them or copy their full text into this repo. Record the policy SHA in the session handoff when one is written. Refresh at the start of the next session.
4. Central documents define shared platform policy; local sections and `docs/platform-project-notes.md` define this game's architecture and explicit owner-approved exceptions. Keep existing saves, origins, stack and exceptions. Local copies of old platform guides are historical references, not the current common policy. Explicit user instructions take precedence.
5. If remote access fails, say so and use a previously verified cached revision if available, identifying its SHA. Without a verified copy, continue independent inspection but do not guess new platform requirements or claim current-policy compliance; resolve access before policy-dependent publishing.

Keep this loader and the project-specific sections when regenerating agent instructions. `CLAUDE.md` and `GEMINI.md` should point here. A Markdown loader instructs compliant agents; GitHub does not automatically sync template descendants or enforce that every tool fetches policy.
<!-- platform:bootstrap:end -->

## Runes & Ruins
Read docs/STATE.md, docs/gameplan.md, docs/tech.md, docs/story.md and ADR-0001. The supplied agent pack defines scope. Keep pure rules in src/game, authored data in src/content, Three.js view in src/render, UI/audio/save separate. New localStorage keys use pg:runes-and-ruines:. No private source photo or historical screenshots may be published. Use make-game for iteration, preserving the central-policy loader above.

## Release versioning

For the next player-facing update, follow the current central `VERSIONING.md`: inspect existing version/release history, update the semantic version and a 1–3 bullet CHANGELOG entry, and tie the successful release to its deployed commit. This Markdown-only adoption does not change or claim a new game version.
