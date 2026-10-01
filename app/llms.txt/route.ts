import { laravelFetch } from "@/lib/laravel-fetch";

export const revalidate = 300;

export async function GET(): Promise<Response> {
  const response = await laravelFetch("/api/assistant/catalog?locale=ar");
  const text = response.ok
    ? await response.text()
    : "# Xora\n\nhttps://xoraevents.com/ar\n";

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
