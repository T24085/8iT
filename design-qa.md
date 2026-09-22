# Design QA — Event & Tournament Gallery

- Source visual truth: Browser Comment 1 from 2026-09-22 (conversation-local; no filesystem path), showing the previous Community submission wall at a reported 1115 × 792 CSS viewport.
- Implementation: live in-app Browser review of `http://localhost:4174/#community` at 1115 × 792 and 390 × 844 CSS px.
- State: `ALL` filter active with the lightbox closed; filter and lightbox states were also tested separately.

## Full-view comparison evidence

The former Community section used three promotional tiles and a nonfunctional submission form. The revised section is a curated event archive: eight image-led entries, clear Event/Tournament/Team filters, varied editorial tile proportions on desktop, and a single-column mobile presentation.

## Focused region comparison evidence

- Desktop: the image grid uses three edge-to-edge columns, with hero and tall spans creating a dense editorial rhythm without gutters inside each card.
- Mobile: all eight cards become equal-width, single-column tiles with no horizontal overflow.
- Card metadata remains legible over photography through bottom gradients and high-contrast labels.
- The lightbox preserves the selected image's aspect ratio and provides previous, next, close, and keyboard controls.

## Findings

- No actionable P0, P1, or P2 differences remain for the requested gallery conversion.
- Typography and color retain the existing condensed display system, signal red, black surfaces, and white utility labels.
- Existing project imagery is reused at native quality; cards use deliberate focal positioning and the lightbox uses contained images.
- The public submission form was removed, keeping the section focused on a curated event and tournament archive.

## Interaction and runtime checks

- `TEAM` filter returns two visible entries; returning to `ALL` restores all eight.
- Opened a gallery item, advanced to `THE CALLER`, and closed the lightbox with Escape.
- Arrow-key navigation and accessible button labels are wired for the lightbox.
- Mobile review at 390 × 844 showed one column and no horizontal overflow.
- Production build passed with `npm run build`.
- Console review found only the pre-existing duplicate-key warning for Swiss bracket placeholders; it is unrelated to the gallery.

## Comparison history

- Initial P2: the submission wall and form did not support the requested event-gallery use case.
- During QA P2: filtered cards reinserted with the site's one-time reveal attribute remained transparent.
- Fixes: replaced the wall with a filterable archive and accessible lightbox, then removed the one-time reveal dependency from dynamic gallery cards.
- Post-fix evidence: all filter states remain visible, the lightbox navigation works, and desktop/mobile layouts are overflow-free.

final result: passed
