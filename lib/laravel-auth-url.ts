import { defaultLaravelOrigin } from "@/lib/laravel-origin";
import type { Locale } from "@/lib/i18n";

/** Absolute Laravel origin for browser OAuth redirects (not the Next same-origin proxy). */
export function getLaravelAuthOrigin(): string {
  if (typeof window !== "undefined") {
    const fromEnv =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
      process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, "") ||
      process.env.NEXT_PUBLIC_PORTAL_URL?.replace(/\/$/, "");
    if (fromEnv) return fromEnv;
  }

  return (
    process.env.API_PROXY_TARGET?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    defaultLaravelOrigin()
  );
}

export function customerSocialLoginUrl(
  provider: "google" | "facebook",
  locale: Locale,
  returnTo?: string,
  referral?: string,
): string {
  const origin = getLaravelAuthOrigin();
  const params = new URLSearchParams({ locale });
  if (returnTo) params.set("returnTo", returnTo);
  if (referral) params.set("ref", referral);
  return `${origin}/auth/customer/${provider}?${params.toString()}`;
}
