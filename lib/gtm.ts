declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() ?? "";

/** Push a custom event to GTM dataLayer (client only). */
export function gtmPush(...args: Record<string, unknown>[]): void {
  if (typeof window === "undefined" || !GTM_ID) return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(...args);
}
