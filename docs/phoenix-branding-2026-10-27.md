# Phoenix branding verification — 2026-10-27

## Scope and source

Owner requested the supplied `stu-mcp-phoenix-mascot-navbar-icon-artifact.svg`
for the navigation (not `-two`), and the supplied phoenix hero illustration.
All four originals and provenance are preserved in `reference/phoenix/`.
The paths are retained; the hero is grouped into the existing wide composition.
Only ring/platform colors, arrangement and restrained floating motion change.
The selected navbar icon also supplies the favicon. Wordmark and copy remain.
Mobile labels move above the artwork to avoid the calendar.
No new runtime dependency or JavaScript animation loop is added.

## Actual checks

- `node scripts/build-phoenix-art.mjs`, `npm run build`: passed.
- Existing `node --test tests/*.test.mjs`: 9/9 passed.
- Installed Chrome via Playwright CLI, development and production preview.
- Production viewport widths 1440, 607 and 390, light and dark: no horizontal
  overflow; navbar and both hero SVG assets loaded; hero physics stays off.
- Screenshots: `docs/qa/phoenix/final-{light,dark}-{1440,607,390}.png`.
- Keyboard Enter on navbar home and “试着接入”: correct hash destinations.
- 390px emulated touch: home and install actions passed.
- Reduced-motion emulation: actual SVG `.document` computed animation is `none`.
- No page errors or console errors during these checks.
- Initial all-image scan included three unrequested lazy gallery images; after
  scrolling the gallery into view, all three loaded successfully.
- Scope is Chrome and emulated touch/reduced motion, not physical-device or
  Safari/Firefox verification. Existing unrelated sections were not redesigned.

## Existing production site

The owner supplied `https://stu-mcp.com/` and authorized updating the already
configured site through `ssh gcp-stu-mcp`. This supersedes the initial local-only
brief for this update, not repository privacy. GitHub visibility verified PRIVATE.
Caddy serves `/opt/stu-mcp-site/current/dist`; its bare-IP 404 is intentional.
The prior release is `62e8a81`. Preserve its runtime/API and all Caddy, systemd,
Tailscale and cost-guard configuration. Stage a new static release and switch
`current` atomically after verification; retain the prior release for rollback.
