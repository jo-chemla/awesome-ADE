export interface LiveStats {
  stars: number
  pushedAt: string
  c20: number
  c100: number
}

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
const CACHE_PREFIX = "ade-table:gh:"

function readCache(repoPath: string): LiveStats | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + repoPath)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw) as { ts: number; data: LiveStats }
    if (Date.now() - ts > CACHE_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

function writeCache(repoPath: string, data: LiveStats) {
  try {
    localStorage.setItem(CACHE_PREFIX + repoPath, JSON.stringify({ ts: Date.now(), data }))
  } catch {
    // Storage full or blocked (private browsing) — just skip caching, the
    // next fetch will simply hit the network again.
  }
}

// GitHub's unauthenticated REST API caps out at 60 requests/hour per client
// IP. Two calls per repo (repo info + first page of contributors) is fine
// for a table this size, and the localStorage cache keeps a returning
// visitor within the hour from spending the quota again. Contributors past
// the first 100 (the API's per_page max) aren't counted here — none of the
// repos in this table are anywhere near that as of writing; a repo that
// grows past it needs a follow-up (paginate, or switch to the GraphQL API).
export async function fetchLiveStats(github: string | null): Promise<LiveStats | null> {
  if (!github) return null
  const match = github.match(/github\.com\/([^/]+)\/([^/]+)\/?$/)
  if (!match) return null
  const repoPath = `${match[1]}/${match[2]}`

  const cached = readCache(repoPath)
  if (cached) return cached

  try {
    const [repoRes, contribRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${repoPath}`),
      fetch(`https://api.github.com/repos/${repoPath}/contributors?per_page=100&anon=true`),
    ])
    if (!repoRes.ok) return null
    const repo = await repoRes.json()
    const contributors = contribRes.ok ? await contribRes.json() : []
    const contributions: number[] = Array.isArray(contributors)
      ? contributors.map((c: { contributions?: number }) => c.contributions ?? 0)
      : []

    const data: LiveStats = {
      stars: repo.stargazers_count ?? 0,
      pushedAt: repo.pushed_at ?? "",
      c20: contributions.filter((n) => n >= 20).length,
      c100: contributions.filter((n) => n >= 100).length,
    }
    writeCache(repoPath, data)
    return data
  } catch {
    // Offline, CORS-blocked, or rate-limited — the row just falls back to
    // "—" rather than breaking the page.
    return null
  }
}

export function formatUpdatedLabel(pushedAt: string): string {
  if (!pushedAt) return "—"
  const days = Math.floor((Date.now() - new Date(pushedAt).getTime()) / 86_400_000)
  if (days <= 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 30) return `${days}d ago`
  return new Date(pushedAt).toISOString().slice(0, 10)
}
