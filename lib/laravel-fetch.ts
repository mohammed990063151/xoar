import { getApiBaseUrl } from "@/lib/api-base";
import { withLaravelApiKeyHeaders } from "@/lib/laravel-api-key";

/** Fetch Laravel API — adds FRONTEND_API_KEY on the server; browser uses same-origin proxy. */
export async function laravelFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = withLaravelApiKeyHeaders(init?.headers);

  if (init?.body && !(init.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });
}
