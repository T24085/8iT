# 8iT / EverLAN Colorado Visual QA

## Source visual truth

- `C:/Users/chris/Desktop/8iT/ChatGPT Image Sep 3, 2026, 05_59_52 PM.png` — supplied 8iT hero artwork.
- `C:/Users/chris/Desktop/8iT/ChatGPT Image Sep 3, 2026, 06_00_11 PM.png` — supplied 8iT team-page composition reference.
- `C:/Users/chris/.codex/codex-remote-attachments/01a06987-d12b-7042-8769-9a57ba77927e/2B5837A5-E151-46FC-A13B-D4CCB784AC84/` — supplied 8iT player portraits, identity frame, and banner lockups, copied to `public/assets/players/`.
- `https://lanfestcolorado.com/` — verified event context and venue source.
- `https://www.tixr.com/groups/lanfest` — supplied ticket destination.

## Implementation evidence

- Local implementation: `http://localhost:4174/`.
- Broadcast route: `http://localhost:4174/#broadcast`.
- Shop route: `http://localhost:4174/shop.html` and friendly route `http://localhost:4174/shop/`.
- Browser-rendered screenshot: not re-captured in this continuation because the local browser automation surface failed to reconnect; the previous turn did capture the earlier implementation and current source/build evidence is recorded below.
- Source hero dimensions: 2048 x 768 px.
- CSS target viewports: desktop default browser viewport and 390 x 844 mobile breakpoint.

## Current build review

- Composition: expanded from the reference into a full event microsite with a supplied-art hero, event fact strip, roster, match rhythm, hype reel, broadcast players, ticket loadouts, and venue/community close.
- Navigation: fixed overlay header with scroll state, active hover treatment, external ticket CTA, and a tappable mobile drawer.
- Typography: `Barlow Condensed` is used for display type; `Rajdhani` handles labels, body copy, metadata, and calls to action.
- Color system: near-black surfaces, white display type, LANFest red actions/rules, muted steel-gray metadata, and green player indicators.
- Broadcast: four real iframe containers are present — Twitch players for `pandoracast`, `ghettobirdz`, and `titan101`, plus the `@Pandoracasting` YouTube live-channel embed.
- Hype reel: four public YouTube highlights are represented by their actual thumbnails and open in an accessible modal player on click.
- Live layer: event countdown, configurable scoreline preview, rotating kill-feed signal, tournament bracket, and one-vote-per-session player POV poll are present under `#intel`.
- Squad moments: roster cards open player spotlight files with role, signal, mode, and POV links.
- Player art: supplied portraits and wide banner lockups are wired to all seven named roster cards and their spotlight files.
- Community: a red/black photo wall and local clip submission flow are present under `#community`; submitted URLs remain clickable in the demo.
- Sound: muted-by-default low-frequency interaction pulses can be enabled with the header sound control; the Konami sequence unlocks a secret 8iT overlay.
- Shop: separate multi-page `shop.html` entry with editable product data, category filters, limited-stock labels, merch-drop countdown, quick view, size selection, cart drawer, quantity controls, and checkout connection placeholder.
- Ticket conversion: General Admission `$60`, Premium `$140`, Board Games Only `$20`, and Spectator `FREE` route to the supplied Tixr group.
- Venue/event copy: September 24–27, 2026, Castle Rock, Colorado, and Douglas County Fairgrounds & Event Center are surfaced from the current LANFest Colorado listing. The user-provided “EverLAN Colorado” name remains the campaign label.
- Accessibility: semantic sections/headings, labelled navigation/menu, labelled video buttons, iframe titles, keyboard Escape close for the clip modal, and reduced-motion handling are implemented.

## Verification history

1. Earlier browser pass verified the original hero, roster, broadcast layout, all four channel destinations, and mobile crop.
2. Full-site implementation completed with modular data-driven sections, ticket CTAs, actual YouTube clip modal behavior, scroll-state navigation, and mobile menu behavior.
3. `npm run build` passed and emitted `dist/client`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
4. `npm run test:sites` passed all 5 packaging tests, including the friendly shop route and emitted `shop.html`.
5. Local HTTP smoke test returned `200` from `http://localhost:4174/` after the preview server was restarted.
6. Visual re-capture is blocked by the CUA browser surface failing to reconnect after the continuation; no new browser screenshot is claimed as verified.

## Remaining QA gate

- Reconnect the in-app browser and compare the current desktop and mobile renders against the supplied visual references before marking this report passed.

final result: blocked
