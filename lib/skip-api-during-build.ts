/** Skip remote Laravel calls during `next build` in CI (no API reachable / slow). */
export function skipApiDuringBuild(): boolean {
  return process.env.SKIP_API_DURING_BUILD === "1" || process.env.CI === "true";
}
