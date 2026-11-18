import { laravelFetch } from "@/lib/laravel-fetch";
import { skipApiDuringBuild } from "@/lib/skip-api-during-build";

export const revalidate = 300;

const FALLBACK = "# Xora\n\nhttps://xoraevents.com/ar\n";

export async function GET(): Promise<Response> {
  let text = FALLBACK;

  if (!skipApiDuringBuild()) {
    try {
      const response = await laravelFetch("/api/assistant/catalog?locale=ar", {
        // Avoid hanging the Next build / edge when API is unreachable.
        signal: AbortSignal.timeout(8_000),
      });
      if (response.ok) {
        text = await response.text();
      }
    } catch {
      // Keep fallback catalog text.
    }
  }

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
