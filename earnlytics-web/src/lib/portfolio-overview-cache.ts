const OVERVIEW_CACHE_TTL_MS = 20 * 1000;
const OVERVIEW_CACHE_MAX_ENTRIES = 500;

interface PortfolioOverviewCacheEntry {
  payload: unknown;
  expiresAt: number;
}

const overviewCache = new Map<string, PortfolioOverviewCacheEntry>();

function buildKey(userId: number, historyDays: number) {
  return `${userId}:${historyDays}`;
}

function cleanupExpired(now: number) {
  for (const [key, entry] of overviewCache.entries()) {
    if (entry.expiresAt <= now) {
      overviewCache.delete(key);
    }
  }
}

function enforceLimit(now: number) {
  if (overviewCache.size <= OVERVIEW_CACHE_MAX_ENTRIES) return;
  cleanupExpired(now);
  if (overviewCache.size <= OVERVIEW_CACHE_MAX_ENTRIES) return;

  const entries = Array.from(overviewCache.entries()).sort((a, b) => a[1].expiresAt - b[1].expiresAt);
  const overflow = overviewCache.size - OVERVIEW_CACHE_MAX_ENTRIES;
  for (let i = 0; i < overflow; i += 1) {
    const row = entries[i];
    if (!row) break;
    overviewCache.delete(row[0]);
  }
}

export function getPortfolioOverviewCache(userId: number, historyDays: number): unknown | null {
  const now = Date.now();
  const key = buildKey(userId, historyDays);
  const cached = overviewCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt <= now) {
    overviewCache.delete(key);
    return null;
  }
  return cached.payload;
}

export function setPortfolioOverviewCache(userId: number, historyDays: number, payload: unknown) {
  const now = Date.now();
  const key = buildKey(userId, historyDays);
  overviewCache.set(key, {
    payload,
    expiresAt: now + OVERVIEW_CACHE_TTL_MS,
  });
  enforceLimit(now);
}

export function invalidatePortfolioOverviewCache(userId: number) {
  const prefix = `${userId}:`;
  for (const key of overviewCache.keys()) {
    if (key.startsWith(prefix)) {
      overviewCache.delete(key);
    }
  }
}

