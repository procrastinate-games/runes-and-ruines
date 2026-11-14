# Platform implementation notes

- Repository / catalog / deployment slug: runes-and-ruines (user-created repository spelling).
- Static TypeScript + Vite + Three.js WebGL. npm lock committed; base './'; dist is self-contained. Unchanged shared publish workflow.
- Required save prefix pg:runes-and-ruines:, schema v1. Manual and checkpoint slots intentionally separate. No reset/migration of shipped keys without user instruction.
- All gameplay rules are in src/game and do not import rendering/DOM. Content is authored in src/content. Renderer never advances AI or turns. Camera input is locked for its interpolation window, including free turns.
- Boss phase II expands its danger radius to 1, gives two enemy cycles to move out, then has a recovery window. This makes escape possible with one-tile movement. Shock stun has a cooldown to prevent a permanent loop.
- Both sides of the Archive final chamber are sealed; the Mines station has two key-locked entries. Library treasure is accessible only through the optional quest secret. Mine secret never gates the key. Keys persist.
- Low graphics caps DPR at 1. Full graphics caps DPR at 1.7. Instanced main walls/floors/ceilings, shared prop geometry, two nearby torch lights, no dynamic shadows or postprocessing.
- Tests: npm test is Vitest pure-engine acceptance / route testing. npm run test:browser uses Playwright Chromium. These are separate so shared CI can run engine tests with no browser install; the publisher additionally runs its own production smoke test.
- Full campaign browser replay: npm test generates output/campaign-all.json, then run node scripts/campaign-browser.mjs against npm run dev. It replays real action commands without replacing campaign state; final deterministic fields must match pure-engine output. Output files/screenshots are not source assets and are ignored.
- Production QA mutation hooks are eliminated by import.meta.env.DEV. Read-only render_game_to_text remains available for inspection.
- Private reference pack lives outside this repository; do not copy the source JPG or historical screenshot files into git/public/dist.
