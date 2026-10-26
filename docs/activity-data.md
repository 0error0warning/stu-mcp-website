# Repository activity data

The visible chart defaults to **30 calendar days**, with actual dates and daily
counts. The 90-day option groups those same real days into **calendar weeks**;
the chart says “每周”, and partial first/last weeks retain their actual date
range. Counts and zero days are never fabricated or removed to imply a higher
commit frequency. The large 365-day surface and debug/source footnotes were
removed from the product layout at the owner's request.

## Local and future server endpoint

`server/activity.mjs` exports `activityApi()` for Vite's local dev and preview
servers, and `handleActivityRequest(request, response, next)` for a future Node
HTTP server. The endpoint is `GET /api/activity` (also supports HEAD), returning
schema version 1 JSON. This does not deploy or provision a server. A plain
static-file deployment does **not** automatically supply this endpoint.

The browser requests the same-origin endpoint, validates its response, then
falls back to `/data/activity.json` if unavailable. It does not call GitHub
directly or receive any token. The server reads GitHub's public REST API without
credentials, with a ten-minute cache and in-flight request coalescing. A failed
refresh preserves its last known valid data, or the checked-in snapshot, and
uses a one-minute retry interval. Snapshot fallback keeps the source's actual
date range and generation time; it never invents missing dates as zero activity.

The online endpoint collects 90 UTC calendar days ending today, pinned to the
public repository's default-branch SHA for the full pagination sequence. It
deduplicates SHAs and counts `commit.committer.date`, not author dates. All pages
must validate; an invalid page, changed revision, unexpected pagination host,
private metadata, rate limit, or request failure rejects the refresh. No private
repository, account, school_hub, or messaging data is accessed. No environment
credentials are read. `delivery` is `live` for a successful public fetch and
`snapshot` for the static fallback.

On 2026-10-26, the actual public online fetch returned 90 days
(`2026-07-29`–`2026-10-26`), 116 commits, and two commit-list pages. This validates
the local data source, not a public deployment or a future server's runtime.

## Checked-in fallback

Run `node scripts/update-activity.mjs` to refresh `public/data/activity.json`.
This retained script collects 365 days so the local record can be independently
inspected; the UI uses only its selected 30/90-day window. It reads no token.
Every date, including verified zero counts, is retained. `totalCommits` must
equal the sum of the daily counts. The final date is partial through
`generatedAt`. Fetch failures preserve the existing snapshot.

The count covers unique commits reachable from `0error0warning/stu-mcp`'s
default branch at the recorded SHA. It is not an account-wide contribution
calendar. These implementation details belong here rather than as footnotes
under the product chart.

## Validation

`node --test tests/activity-data.test.mjs` checks the 30-day window and zero-day
preservation, weekly totals/partial weeks, invalid or incomplete responses,
pinned and deduplicated online pagination using committer dates, and rejection
of an unexpected pagination host. The fixture is fixed, so refreshing the real
snapshot cannot invalidate the arithmetic tests.

Local Chromium browser verification after integration covered 1169px, 709px,
and 390px touch simulation. The default view contained all 30 real days,
including 20 zero days, and showed 116 commits for September 27–October 26.
The 90-day view showed 14 explicit calendar weeks, including 11 zero weeks,
without changing the 116-commit total. Keyboard Home/Enter and actual touch
selection returned the corresponding real day/week counts. There was no
horizontal overflow or page exception; old snapshot/calendar footnotes were
absent. Default panel heights were approximately 261 / 249 / 351px, respectively.

The same-origin endpoint returned HTTP 200 with `delivery: live`, 90 days, and
the same generation timestamp across these requests, consistent with the server
cache. A deliberately invalid endpoint response was rejected in the browser,
and the validated static fallback retained all 30 days and 20 zero days. The
dark theme's activity text, empty cells, and high-count cells were also inspected.
This is local Chromium verification, not a public deployment or real phone
hardware measurement. Process scripts and screenshots are in the ignored
`output/playwright/activity-feedback-*` files.

Source: [GitHub List commits endpoint](https://docs.github.com/en/rest/commits/commits#list-commits).
