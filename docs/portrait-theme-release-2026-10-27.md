# Portrait navigation / persistent phoenix release — 2026-10-27

The owner requested saving the future character-system proposal without implementing dragging, walking or turning, making small portrait/theme fixes, and updating the existing formal website. This explicitly authorizes this deployment; repository remains private.

## Changes

Portrait orientation hides Dock at all widths, removes its row and reduces phone header to 62px; landscape retains it. Matching hero offset and scroll padding remove the vacant space. Existing planned architecture stays documentation-only.

Production c379f97 used separate day/night SVG images, switched with display:none. Latest frontend uses one pre-rendered inline phoenix with theme variables. Its independent View Transition group keeps the current character visible instead of displaying the previous root snapshot's frozen pose. Theme changes do not recreate the character or restart its animation objects.

This release includes the previously local independent-joint phoenix work and coordinated cheek reaction, documented separately in phoenix-motion-2026-10-27.md. It does not implement the future Rive/dragging/locomotion design.

## Local verification

Chrome through Playwright CLI, 390×844 portrait and 844×390 landscape: Dock none/block respectively; no horizontal overflow. Portrait header 62px. Four actual toggle-button clicks alternate dark/light: the same SVG node, the same breathing Animation object, monotonically increasing animation time, zero removed phoenix nodes. Snapshot during dark-to-light reveal visually inspected. Desktop 1440×1000 retained navigation. Screenshots preserved under docs/qa/portrait-theme.

Build passed; all 11 tests passed. Previous pass also exercised pointer targeting, keyboard, touch emulation and reduced motion. Physical Android Chrome from the user's screenshot is not available; verification uses desktop Chrome and mobile emulation.

## Deployment safeguards

Read-only preflight: existing current release c379f97; caddy, stu-site-activity and stu-site-guard active. Private GitHub repository verified. Deploy static dist into a new release, retain unchanged API runtime and old hashed assets, verify archive SHA-256, switch current symlink atomically. No Caddy/systemd/Tailscale/cost-guard changes.

## Production result

- Static source/release: `198d729`, current `/opt/stu-mcp-site/releases/198d729`.
- Archive SHA-256 `bd64ccf8bd3c94b0eee99f9c2f4277ae5c0459407133135da1184fc74a24b628`, verified remotely before extraction.
- Previous release `c379f97` retained; API server/source identical, Caddy configuration hash unchanged, three existing services active. No restart required.
- External Chrome `https://stu-mcp.com/`: HTTP 200. Portrait 390×844: Dock hidden, header 62px, exactly one phoenix SVG, no horizontal overflow. Desktop Dock visible.
- Actual online toggle dark then light: same SVG node and same breathing animation instance, time increased from ~1542ms to ~2200ms. No console/page errors during online checks.
- `/api/activity`: HTTP 200, repository `0error0warning/stu-mcp`, delivery `live`.
- Live screenshots saved in `docs/qa/portrait-theme/` and portrait capture visually inspected.
- Production preview additionally checked keyboard/reduced-motion theme toggle, touch-emulated toggle and static no-JS phoenix first paint. This is not physical-device coverage.
- Future character architecture is saved only; no dragging, locomotion, full turning or Rive runtime shipped.
