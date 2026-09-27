# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Durable visual direction

- Keep the public site full bleed and edge to edge.
- Keep the hero copy container transparent so the background artwork remains visible; use a light image veil and localized text shadow for legibility.
- Use the supplied official 8iT logo asset for visible brand marks; do not recreate the logo with styled text.
- Keep the hype-reel clips as equal square tiles in a gapless, edge-to-edge grid.
- Use Battlefy's completed 2026 LANFest stages for the official brackets: CS2 and Battlefield 4 each have six teams, three BO1 rounds, and nine matches; Overwatch 2 has eight teams, three BO3 rounds, and twelve matches. Keep CS2 team names and match results editable in the same-browser admin control room; migrate old 16-team demo saves to the official defaults.
- Label bracket scores as match-series/map wins, not CS2 in-game rounds or Battlefield 4 tickets. Do not invent map names or underlying round/ticket scores. Keep the later friendly CS2 rematch outside all official brackets.
- Use `public/assets/matches-swiss-background.png` as the full-bleed background for the Event Rhythm schedule section, with a dark readability veil over the image.
- Use `public/assets/about-team-background.png` as the full-bleed background for the Play Hard. Do Good. section, preserving readable copy and venue information over the team image.
- Keep the Play Hard. Do Good. image visibly bright through the overlay; use localized contrast instead of a heavy section-wide blackout.
- Keep lineup copy direct and descriptive; avoid overwrought combat metaphors such as "the room is the weapon."
- Keep roster portraits in equal 1:1 square tiles so the supplied square artwork remains fully visible at every breakpoint.
- In player-profile modals, show the supplied portrait centered and uncropped, and embed the player's configured Twitch or YouTube stream directly instead of using an outbound watch button.
- Treat each player wordmark as a full-bleed banner across the profile-content column, flush to the top and side edges rather than contained inside a padded logo slot.
- Use the Community section as a curated event and tournament image gallery with category filters and an accessible lightbox; do not restore the public submission form unless explicitly requested.
- Hype-reel videos should autoplay muted and loop continuously inside their square tiles.
- Use the real FragWatch Intel LANFest stream recordings in the hype-reel grid, not unrelated YouTube highlight placeholders.
- Show CS2, Battlefield 4, and Overwatch 2 as three separate team-reported second-place LANFest podium finishes, each linked to its matching FragWatch replay. Keep their game brackets and match records distinct; do not invent in-game scores.
- In the CS2 recap, distinguish the verified 2–1 Swiss match record and #2-of-six Battlefy standings rank from the second-place podium finish reported directly by the team.
- Use the supplied wide 8iT Counter-Strike banners as cinematic chapter breaks and hero media.
- Preserve the black, off-white, and signal-red competitive identity, condensed display type, and existing data-rich sections.
- Keep verified LANFest results and the later iBuyPowerBottoms friendly rematch visually and semantically separate. The team-reported rematch win does not change the official 2–1 record; the friendly maps are Train and Ancient, with screenshot-reported final scores of 13–11 and 13–9. Victory screens use lobby team labels; do not treat them as new opponent identities.
- Show friendly-rematch player stats on the four matching roster cards and in a dedicated all-five-player stats section. The Train/Ancient score, K/D/A, and HS% lines come from a screenshot of a prior post-map-card transcription and have not been independently video-verified; do not blend them into official standings or invent opponent stats. The fifth player, Zixxy, appears in the stats section but is not part of the current seven-player portrait roster.
