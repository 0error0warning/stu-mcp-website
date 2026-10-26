/**
 * Public, same-origin activity endpoint. Reads only the public repository API;
 * it never reads environment credentials, private repository data, or accounts.
 * Mount handleActivityRequest on a Node HTTP server when deploying this site.
 */
import { readFile } from 'node:fs/promises';
import { ACTIVITY_REPOSITORY, utcDay, validateActivity } from '../src/activity-data.js';

const DAY = 86_400_000;
const LIVE_TTL = 10 * 60_000;
const RETRY_TTL = 60_000;
const API = `https://api.github.com/repos/${ACTIVITY_REPOSITORY}`;
const SNAPSHOT = new URL('../public/data/activity.json', import.meta.url);
const requestHeaders = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'stu-mcp-website-activity',
};
let cached;
let expiresAt = 0;
let pending;

export async function fetchPublicActivity({ now = new Date(), fetchImpl = fetch } = {}) {
  const end = utcDay(now);
  const endTime = Date.parse(`${end}T00:00:00Z`);
  const start = utcDay(endTime - 89 * DAY);
  const read = async url => {
    const response = await fetchImpl(url, { headers: requestHeaders, signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`Public activity request failed: ${response.status}`);
    return { data: await response.json(), link: response.headers.get('link') };
  };
  const { data: repo } = await read(API);
  if (repo.full_name !== ACTIVITY_REPOSITORY || !Number.isInteger(repo.id) || !repo.default_branch || repo.private !== false) {
    throw new Error('Invalid public repository metadata');
  }
  const branch = repo.default_branch;
  const { data: reference } = await read(`${API}/git/ref/heads/${branch.split('/').map(encodeURIComponent).join('/')}`);
  const branchSha = reference.object?.sha;
  if (!/^[a-f0-9]{40}$/.test(branchSha ?? '')) throw new Error('Invalid public branch reference');
  const firstPage = new URL(`${API}/commits`);
  firstPage.search = new URLSearchParams({
    sha: branchSha,
    since: new Date(Date.parse(`${start}T00:00:00Z`) - 1000).toISOString(),
    until: now.toISOString(),
    per_page: '100',
  }).toString();
  const commits = new Map();
  let page = firstPage.href;
  let pagesRead = 0;
  while (page) {
    if (pagesRead >= 20) throw new Error('Refusing incomplete activity history');
    const { data, link } = await read(page);
    if (!Array.isArray(data)) throw new Error('Invalid public commit list');
    for (const entry of data) {
      const committedAt = entry.commit?.committer?.date;
      if (!/^[a-f0-9]{40}$/.test(entry.sha ?? '') || !Number.isFinite(Date.parse(committedAt))) {
        throw new Error('Invalid public commit');
      }
      const date = utcDay(committedAt);
      if (date >= start && date <= end) commits.set(entry.sha, date);
    }
    pagesRead += 1;
    const next = link?.match(/<([^>]+)>;\s*rel="next"/)?.[1];
    if (next) {
      const nextUrl = new URL(next);
      if (nextUrl.origin !== 'https://api.github.com'
          || ![`/repos/${ACTIVITY_REPOSITORY}/commits`, `/repositories/${repo.id}/commits`].includes(nextUrl.pathname)) {
        throw new Error('Invalid public pagination link');
      }
      // The first request pins the branch; pagination must keep the same SHA.
      if (nextUrl.searchParams.get('sha') !== branchSha) throw new Error('Pagination changed activity revision');
      page = nextUrl.href;
    } else page = null;
  }
  const counts = new Map();
  for (const date of commits.values()) counts.set(date, (counts.get(date) ?? 0) + 1);
  const startTime = Date.parse(`${start}T00:00:00Z`);
  const days = Array.from({ length: 90 }, (_, index) => {
    const date = utcDay(startTime + index * DAY);
    return { date, count: counts.get(date) ?? 0 };
  });
  return validateActivity({
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    repository: ACTIVITY_REPOSITORY,
    repositoryUrl: `https://github.com/${ACTIVITY_REPOSITORY}`,
    branch,
    branchSha,
    dateRange: { start, end, days: 90, timezone: 'UTC' },
    dateBasis: 'commit.committer.date',
    totalCommits: commits.size,
    activeDays: counts.size,
    days,
    source: {
      provider: 'GitHub REST API',
      url: firstPage.href,
      documentationUrl: 'https://docs.github.com/en/rest/commits/commits#list-commits',
      pagesRead,
    },
    delivery: 'live',
  });
}

async function getActivity() {
  if (cached && Date.now() < expiresAt) return cached;
  if (pending) return pending;
  pending = (async () => {
    try {
      cached = await fetchPublicActivity();
      expiresAt = Date.now() + LIVE_TTL;
    } catch {
      // Preserve known data and its actual dates, never manufacture zero days.
      if (!cached) cached = { ...validateActivity(JSON.parse(await readFile(SNAPSHOT, 'utf8'))), delivery: 'snapshot' };
      expiresAt = Date.now() + RETRY_TTL;
    }
    return cached;
  })();
  try { return await pending; } finally { pending = null; }
}

export async function handleActivityRequest(request, response, next = () => {}) {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
  if (!/^\/api\/activity\/?$/.test(pathname)) { next(); return; }
  if (!['GET', 'HEAD'].includes(request.method ?? 'GET')) {
    response.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8', Allow: 'GET, HEAD' });
    response.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  try {
    const data = await getActivity();
    if (response.destroyed) return;
    response.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : JSON.stringify(data));
  } catch {
    if (response.destroyed) return;
    response.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ error: 'Activity unavailable' }));
  }
}

export function activityApi() {
  return {
    name: 'public-repository-activity',
    configureServer(server) { server.middlewares.use(handleActivityRequest); },
    configurePreviewServer(server) { server.middlewares.use(handleActivityRequest); },
  };
}
