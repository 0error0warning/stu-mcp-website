# Repository activity data

Run `node scripts/update-activity.mjs` from the project checkout to refresh
`public/data/activity.json`. The browser reads this static snapshot and never
calls an authenticated API. The refresh script reads no tokens or credentials.

The snapshot counts **unique commits reachable from `0error0warning/stu-mcp`'s
default branch**, pinned to the recorded branch SHA while pagination runs. It is
not the developer's GitHub contribution calendar and does not include commits
that exist only on other branches.

Dates use GitHub's `commit.committer.date`, converted to UTC. The range contains
365 UTC calendar days ending on the refresh date; the final day is partial up to
`generatedAt`. Every day is present in `days`, including verified zero counts.
`totalCommits` equals the sum of daily counts. GitHub's author dates and local
timezone dates may differ from this calendar.

The script uses GitHub's public REST API with 100 commits per page. All pages
must succeed before the existing snapshot is replaced. A rate limit, failed
request, malformed response, or pagination limit produces a nonzero exit and
preserves the previous snapshot. A valid empty history produces all zero counts;
the UI should label that state as no commits in this range. A missing snapshot
should show that data is unavailable, never fabricated activity.

The JSON records the refresh timestamp, default branch SHA, queried URL, page
count, date range, and date basis for inspection. See the official
[GitHub List commits endpoint](https://docs.github.com/en/rest/commits/commits#list-commits).
