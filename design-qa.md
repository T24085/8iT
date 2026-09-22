# Design QA — Player Profile Modal

- Source visual truth: the player-profile Browser Comment screenshots from 2026-09-22 (conversation-local; no filesystem path), 1274 × 905 px, reporting a 1115 × 792 CSS viewport.
- Implementation screenshot: live in-app Browser capture of `http://localhost:4174/#team`, 1115 × 792 CSS px, browser-managed device scale.
- Responsive evidence: live in-app Browser capture at 390 × 844 CSS px.
- State: PandaMonium player-profile modal open with the configured Twitch stream loaded.

## Full-view comparison evidence

The source showed a tall `cover` background that cropped and offset the supplied portrait, obscured it with oversized initials, ended with an outbound watch button, and contained the player wordmark inside a padded logo slot. The revised modal displays the native 1254 × 1254 portrait as a centered, uncropped image, embeds the configured Twitch or YouTube player, and carries the wordmark across the full width of the content column.

## Focused region comparison evidence

- Desktop: the portrait renders at 380 × 380 px from the native 1254 × 1254 image, with the crown, character, and player wordmark visible. The stream iframe renders at 544 × 306 px in a 16:9 frame.
- Desktop banner: the 621 × 165 px banner is flush with the content column's top, left, and right edges.
- Mobile: the modal has no horizontal overflow; the 353 × 135 px banner is also flush on all three edges.

## Findings

- No actionable P0, P1, or P2 differences remain for the requested modal changes.
- Fonts and typography: the existing condensed display hierarchy and utility labels remain unchanged and readable.
- Spacing and layout rhythm: the wordmark banner is full bleed within its column, the modal uses the available desktop height, keeps the close control visible, and becomes a single scrollable column on mobile.
- Colors and visual tokens: existing black, white, green, and signal-red treatments are preserved.
- Image quality and asset fidelity: the supplied square portrait is used directly with `object-fit: contain`; initials and cover cropping were removed.
- Copy and content: player bio, stats, role, signal, mode, and stream identity remain intact. The external CTA was replaced by the embedded player as requested.

## Interaction and runtime checks

- Opened the PandaMonium profile from the roster.
- Confirmed the Twitch embed loads and presents the channel's current offline state inside the modal.
- Confirmed the modal remains scrollable and free of horizontal overflow at 390 × 844.
- Production build passed with `npm run build`.
- Console review found only the existing duplicate-key warning in Swiss bracket placeholder matches; it is unrelated to the profile modal.

## Comparison history

- Initial P2: portrait used a tall cover crop, was visually offset, and was blocked by large initials.
- Initial P2: stream access required leaving the profile through an outbound CTA.
- Initial P2: player wordmark was contained inside a padded logo slot instead of filling the content-column banner area.
- Fixes: replaced the background/initial treatment with the native portrait image using contained centering; replaced the CTA with a configured Twitch/YouTube iframe; removed the banner inset and changed the wordmark treatment to a full-bleed cover band.
- Post-fix evidence: desktop and mobile captures show the complete portrait, embedded stream, and edge-to-edge banner without horizontal overflow.

## Follow-up polish

- The unrelated Swiss bracket duplicate-key warning can be cleaned up separately.

final result: passed
