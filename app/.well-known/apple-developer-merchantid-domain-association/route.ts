import { readFile } from "node:fs/promises";
import path from "path";

export const dynamic = "force-static";

/**
 * Serves Geidea's Apple Pay domain association for the customer site.
 * Prefer the file under public/.well-known/; optional absolute override via env.
 */
export async function GET(): Promise<Response> {
  const candidates = [
    process.env.APPLE_PAY_DOMAIN_ASSOCIATION_PATH?.trim(),
    path.join(
      process.cwd(),
      "public",
      ".well-known",
      "apple-developer-merchantid-domain-association",
    ),
  ].filter((value): value is string => typeof value === "string" && value !== "");

  for (const filePath of candidates) {
    try {
      const body = await readFile(filePath);
      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "public, max-age=300",
        },
      });
    } catch {
      // try next candidate
    }
  }

  return new Response("Apple Pay domain association file is not installed.", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
