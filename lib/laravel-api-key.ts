/** Header Laravel expects from trusted frontends (Next.js proxy / SSR). */
export const LARAVEL_API_KEY_HEADER = "X-Xoar-Api-Key";

/** Server-only — never use NEXT_PUBLIC_ for this value. */
export function getLaravelApiKey(): string | undefined {
  const key = process.env.FRONTEND_API_KEY?.trim();
  return key && key.length > 0 ? key : undefined;
}

export function withLaravelApiKeyHeaders(
  headers?: HeadersInit,
): Record<string, string> {
  const merged = new Headers(headers);
  if (!merged.has("Accept")) {
    merged.set("Accept", "application/json");
  }

  if (typeof window === "undefined") {
    const key = getLaravelApiKey();
    if (key) {
      merged.set(LARAVEL_API_KEY_HEADER, key);
    }
  }

  const out: Record<string, string> = {};
  merged.forEach((value, name) => {
    out[name] = value;
  });
  return out;
}
