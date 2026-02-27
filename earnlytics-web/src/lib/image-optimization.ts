const OPTIMIZED_REMOTE_HOSTS = new Set(["logo.clearbit.com"]);

export function shouldBypassNextImageOptimization(url: string): boolean {
  try {
    const parsed = new URL(url);
    return !OPTIMIZED_REMOTE_HOSTS.has(parsed.hostname);
  } catch {
    return true;
  }
}
