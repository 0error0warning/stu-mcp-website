/**
 * Refresh the public repository activity snapshot used by the website.
 * Uses GitHub's unauthenticated REST API. No credentials are read or stored.
 */
import { mkdir, rename, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const repository = '0error0warning/stu-mcp';
const apiBase = `https://api.github.com/repos/${repository}`;
const output = fileURLToPath(new URL('../public/data/activity.json', import.meta.url));
const temporaryOutput = `${output}.tmp`;
const dayMilliseconds = 86_400_000;
const maxPages = 30;
const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'stu-mcp-website-activity',
};

async function readGitHub(url) {
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    const reset = response.headers.get('x-ratelimit-reset');
    const rateLimit = response.status === 429
      || (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0');
    const detail = rateLimit
      ? ` GitHub rate limit reached${reset ? `; resets at ${new Date(Number(reset) * 1000).toISOString()}` : ''}.`
      : '';
    throw new Error(`GitHub request failed (${response.status}).${detail}`);
  }
  return { data: await response.json(), link: response.headers.get('link') };
}

function nextPage(link, repositoryId) {
  if (!link) return null;
  const match = link.match(/<([^>]+)>;\s*rel="next"/);
  if (!match) return null;
  const url = new URL(match[1]);
  const expectedPaths = [`/repos/${repository}/commits`, `/repositories/${repositoryId}/commits`];
  if (url.origin !== 'https://api.github.com' || !expectedPaths.includes(url.pathname)) {
    throw new Error('Unexpected GitHub pagination URL; snapshot was not changed.');
  }
  return url.href;
}

async function updateActivity() {
  const generatedAt = new Date();
  const endDay = new Date(generatedAt);
  endDay.setUTCHours(0, 0, 0, 0);
  const startDay = new Date(endDay.getTime() - 364 * dayMilliseconds);
  const startDate = startDay.toISOString().slice(0, 10);
  const endDate = endDay.toISOString().slice(0, 10);

  const { data: repo } = await readGitHub(apiBase);
  if (repo.full_name !== repository || !repo.default_branch || !Number.isInteger(repo.id)) {
    throw new Error('Repository metadata is incomplete; snapshot was not changed.');
  }
  const branch = repo.default_branch;
  const encodedBranch = branch.split('/').map(encodeURIComponent).join('/');
  const { data: ref } = await readGitHub(`${apiBase}/git/ref/heads/${encodedBranch}`);
  const branchSha = ref.object?.sha;
  if (!/^[a-f0-9]{40}$/.test(branchSha ?? '')) {
    throw new Error('Default branch reference is invalid; snapshot was not changed.');
  }

  const firstPage = new URL(`${apiBase}/commits`);
  firstPage.search = new URLSearchParams({
    sha: branchSha,
    since: new Date(startDay.getTime() - 1000).toISOString(),
    until: generatedAt.toISOString(),
    per_page: '100',
  }).toString();

  const commits = new Map();
  let page = firstPage.href;
  let pagesRead = 0;
  while (page) {
    if (pagesRead >= maxPages) {
      throw new Error(`More than ${maxPages} pages of commits; refusing to save incomplete data.`);
    }
    const { data, link } = await readGitHub(page);
    if (!Array.isArray(data)) throw new Error('GitHub returned an invalid commit list.');
    for (const entry of data) {
      const committedAt = entry.commit?.committer?.date;
      if (!/^[a-f0-9]{40}$/.test(entry.sha ?? '')
          || typeof committedAt !== 'string'
          || !Number.isFinite(Date.parse(committedAt))) {
        throw new Error('GitHub returned an invalid commit; refusing to save incomplete data.');
      }
      const date = new Date(committedAt).toISOString().slice(0, 10);
      if (date >= startDate && date <= endDate) commits.set(entry.sha, date);
    }
    pagesRead += 1;
    page = nextPage(link, repo.id);
  }

  const counts = new Map();
  for (const date of commits.values()) counts.set(date, (counts.get(date) ?? 0) + 1);
  const days = Array.from({ length: 365 }, (_, index) => {
    const date = new Date(startDay.getTime() + index * dayMilliseconds).toISOString().slice(0, 10);
    return { date, count: counts.get(date) ?? 0 };
  });
  const snapshot = {
    schemaVersion: 1,
    generatedAt: generatedAt.toISOString(),
    repository,
    repositoryUrl: `https://github.com/${repository}`,
    branch,
    branchSha,
    dateRange: { start: startDate, end: endDate, days: 365, timezone: 'UTC' },
    dateBasis: 'commit.committer.date',
    totalCommits: commits.size,
    activeDays: counts.size,
    days,
    source: {
      provider: 'GitHub REST API',
      url: firstPage.href,
      documentationUrl: 'https://docs.github.com/en/rest/commits/commits#list-commits',
      pagesRead,
      scope: 'Unique commits reachable from the repository default branch at branchSha; not account-wide GitHub contributions.',
    },
  };

  await mkdir(new URL('../public/data/', import.meta.url), { recursive: true });
  await writeFile(temporaryOutput, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  await rename(temporaryOutput, output);
  console.log(`${repository} (${branch}): ${snapshot.totalCommits} commits on ${snapshot.activeDays} days; ${startDate}–${endDate} UTC; ${pagesRead} API page(s).`);
}

try {
  await updateActivity();
} catch (error) {
  await rm(temporaryOutput, { force: true }).catch(() => {});
  console.error(`Activity refresh failed: ${error.message} Existing snapshot was preserved.`);
  process.exitCode = 1;
}
