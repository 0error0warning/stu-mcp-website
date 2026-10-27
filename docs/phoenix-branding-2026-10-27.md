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

## Production result

- Static source commit: `c379f97`; activated release:
  `/opt/stu-mcp-site/releases/c379f97`.
- Uploaded archive SHA-256:
  `7be6f56677e0ab53824274c0dca43ec7f83d81fc11ca8dc2c9e26c26c89553bf`;
  verified on the server before extraction.
- Existing API runtime source/imports were copied unchanged from `62e8a81`;
  this release changes only the built static frontend. Old hashed assets were
  retained for existing browser sessions. No service restart was necessary.
- Caddy configuration hash unchanged; Caddy, activity and cost-guard services active.
- External Chrome navigation to `https://stu-mcp.com/`: HTTP 200, navbar and
  both hero images fully loaded, light/dark screenshots saved as `live-*.png`.
- `/api/activity`: HTTP 200, repository `0error0warning/stu-mcp`, delivery `live`.
- `https://www.stu-mcp.com/`: HTTP 301 to `https://STU-MCP.com/`.
- External Chrome check: no console errors or page errors.
- Served navbar SHA-256 matches local:
  `eb94a2530e992e6c8997e646cbed6f0f71c84af044b26ea1a8fbf7e7ac941a61`.
- Rollback, if requested: atomically replace `/opt/stu-mcp-site/current` with a
  symlink to `releases/62e8a81`. The prior release remains intact.
