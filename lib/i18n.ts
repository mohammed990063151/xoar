export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export function isLocale(s: string): s is Locale {
  return locales.includes(s as Locale);
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function localizedPath(locale: Locale, path: string): string {
  if (isExternalHref(path)) {
    return path;
  }
  const p = path.startsWith("/") ? path : `/${path}`;
  if (p === "/") return `/${locale}`;
  return `/${locale}${p}`;
}

/** Internal app paths get a locale prefix; absolute URLs are unchanged. */
export function resolveHref(locale: Locale, href: string): string {
  return localizedPath(locale, href);
}
