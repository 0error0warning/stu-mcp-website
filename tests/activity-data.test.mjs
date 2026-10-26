import assert from 'node:assert/strict';
import { test } from 'node:test';
import { activityRange, groupActivityWeeks, validateActivity } from '../src/activity-data.js';
import { fetchPublicActivity } from '../server/activity.mjs';

// Fixed public-style fixture, so refreshing the real repository snapshot does
// not change the meaning of these calendar and arithmetic regressions.
const counts = { '2026-10-05': 14, '2026-10-06': 3, '2026-10-08': 2, '2026-10-12': 1, '2026-10-17': 8, '2026-10-18': 1, '2026-10-21': 41, '2026-10-22': 9, '2026-10-23': 29, '2026-10-24': 8 };
const snapshot = {
  schemaVersion: 1, repository: '0error0warning/stu-mcp', branch: 'main', generatedAt: '2026-10-26T12:00:00Z',
  dateRange: { start: '2025-10-27', end: '2026-10-26', days: 365 }, totalCommits: 116,
  days: Array.from({ length: 365 }, (_, i) => {
    const date = new Date(Date.parse('2025-10-27T00:00:00Z') + i * 86_400_000).toISOString().slice(0, 10);
    return { date, count: counts[date] ?? 0 };
  }),
};

test('a 30-day view keeps actual zero days and sums only that calendar window', () => {
  const data = validateActivity(snapshot);
  const range = activityRange(data, 30);
  assert.equal(range.days.length, 30);
  assert.equal(range.start, '2026-09-27');
  assert.equal(range.end, '2026-10-26');
  assert.equal(range.total, 116);
  assert.equal(range.days.filter(day => day.count > 0).length, 10);
  assert.equal(range.days.filter(day => day.count === 0).length, 20);
});

test('weekly aggregation preserves totals and partial calendar weeks', () => {
  const range = activityRange(snapshot, 90);
  const weeks = groupActivityWeeks(range.days);
  assert.equal(weeks.reduce((sum, week) => sum + week.count, 0), range.total);
  assert.equal(weeks.reduce((sum, week) => sum + week.days, 0), 90);
  assert.equal(weeks.at(-1).start, '2026-10-26');
  assert.equal(weeks.at(-1).days, 1);
  assert.ok(weeks.slice(1, -1).every(week => week.days === 7));
});

test('invalid or incomplete data is rejected instead of being treated as zero activity', () => {
  const missingDay = structuredClone(snapshot); missingDay.days.splice(40, 1);
  assert.throws(() => validateActivity(missingDay));
  const negative = structuredClone(snapshot); negative.days[0].count = -1;
  assert.throws(() => validateActivity(negative));
  const fakeTotal = structuredClone(snapshot); fakeTotal.totalCommits += 1;
  assert.throws(() => validateActivity(fakeTotal));
  const impossibleDate = structuredClone(snapshot); impossibleDate.days[0].date = '2026-02-30';
  assert.throws(() => validateActivity(impossibleDate));
});

test('online activity pins pagination, deduplicates commits, and uses committer dates', async () => {
  const branchSha = 'a'.repeat(40);
  const commit = (sha, date) => ({ sha, commit: { committer: { date }, author: { date: '2000-01-01T00:00:00Z' } } });
  const first = commit('b'.repeat(40), '2026-10-25T23:45:00Z');
  const second = commit('c'.repeat(40), '2026-10-26T00:20:00Z');
  const urls = [];
  const data = await fetchPublicActivity({ now: new Date('2026-10-26T12:00:00Z'), fetchImpl: async input => {
    const url = new URL(input); urls.push(url);
    if (url.pathname.endsWith('/stu-mcp')) return Response.json({ full_name: '0error0warning/stu-mcp', id: 123, private: false, default_branch: 'main' });
    if (url.pathname.includes('/git/ref/')) return Response.json({ object: { sha: branchSha } });
    if (url.searchParams.get('page') === '2') return Response.json([first, second]);
    const next = new URL(url); next.searchParams.set('page', '2');
    return Response.json([first], { headers: { Link: `<${next}>; rel="next"` } });
  } });
  assert.equal(data.totalCommits, 2);
  assert.equal(data.days.at(-1).count, 1);
  assert.equal(data.days.at(-2).count, 1);
  assert.equal(data.days.length, 90);
  assert.equal(data.delivery, 'live');
  assert.ok(urls.filter(url => url.pathname.endsWith('/commits')).every(url => url.searchParams.get('sha') === branchSha));
});

test('an unexpected pagination host is rejected without following it', async () => {
  const calls = [];
  await assert.rejects(fetchPublicActivity({ now: new Date('2026-10-26T12:00:00Z'), fetchImpl: async input => {
    const url = new URL(input); calls.push(url);
    if (url.pathname.endsWith('/stu-mcp')) return Response.json({ full_name: '0error0warning/stu-mcp', id: 123, private: false, default_branch: 'main' });
    if (url.pathname.includes('/git/ref/')) return Response.json({ object: { sha: 'a'.repeat(40) } });
    return Response.json([], { headers: { Link: '<https://example.com/private>; rel="next"' } });
  } }), /Invalid public pagination link/);
  assert.ok(calls.every(url => url.origin === 'https://api.github.com'));
});
