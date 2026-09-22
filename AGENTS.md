# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Durable visual direction

- Keep the public site full bleed and edge to edge.
- Use the supplied official 8iT logo asset for visible brand marks; do not recreate the logo with styled text.
- Keep the hype-reel clips as equal square tiles in a gapless, edge-to-edge grid.
- Keep tournament operations based on a 16-team, five-round BO1 Swiss stage: three wins advances, three losses eliminates, with editable team names, match results, and derived standings in the admin control room.
- Use `public/assets/matches-swiss-background.png` as the full-bleed background for the Event Rhythm schedule section, with a dark readability veil over the image.
- Use `public/assets/about-team-background.png` as the full-bleed background for the Play Hard. Do Good. section, preserving readable copy and venue information over the team image.
- Keep the Play Hard. Do Good. image visibly bright through the overlay; use localized contrast instead of a heavy section-wide blackout.
- Keep lineup copy direct and descriptive; avoid overwrought combat metaphors such as "the room is the weapon."
- Keep roster portraits in equal 1:1 square tiles so the supplied square artwork remains fully visible at every breakpoint.
- In player-profile modals, show the supplied portrait centered and uncropped, and embed the player's configured Twitch or YouTube stream directly instead of using an outbound watch button.
- Treat each player wordmark as a full-bleed banner across the profile-content column, flush to the top and side edges rather than contained inside a padded logo slot.
- Hype-reel videos should autoplay muted and loop continuously inside their square tiles.
- Use the supplied wide 8iT Counter-Strike banners as cinematic chapter breaks and hero media.
- Preserve the black, off-white, and signal-red competitive identity, condensed display type, and existing data-rich sections.
