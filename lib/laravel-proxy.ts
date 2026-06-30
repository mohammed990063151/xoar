import { API_PROXY_TARGET } from "@/lib/api-base";
import { LARAVEL_API_KEY_HEADER, getLaravelApiKey } from "@/lib/laravel-api-key";

const PASSTHROUGH_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "authorization",
  "content-type",
  "cookie",
] as const;

const PASSTHROUGH_RESPONSE_HEADERS = [
  "content-type",
  "content-disposition",
  "cache-control",
  "etag",
  "last-modified",
] as const;

export async function proxyToLaravel(
  request: Request,
  pathSegments: string[],
): Promise<Response> {
  const upstreamUrl = new URL(
    `${API_PROXY_TARGET}/api/${pathSegments.map((segment) => encodeURIComponent(segment)).join("/")}`,
  );

  const incoming = new URL(request.url);
  incoming.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.append(key, value);
  });

  const headers = new Headers();
  for (const name of PASSTHROUGH_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  const apiKey = getLaravelApiKey();
  if (apiKey) {
    headers.set(LARAVEL_API_KEY_HEADER, apiKey);
  }

  const clientIp =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip");
  if (clientIp) {
    headers.set("X-Forwarded-For", clientIp);
    headers.set("X-Real-IP", clientIp);
  }

  const method = request.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD" || method === "OPTIONS"
      ? undefined
      : await request.arrayBuffer();

  const upstreamResponse = await fetch(upstreamUrl.toString(), {
    method,
    headers,
    body,
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  for (const name of PASSTHROUGH_RESPONSE_HEADERS) {
    const value = upstreamResponse.headers.get(name);
    if (value) {
      responseHeaders.set(name, value);
    }
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}
