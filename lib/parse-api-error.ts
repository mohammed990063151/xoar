/**
 * استخراج أول رسالة خطأ آمنة من استجابة Laravel (422 / 401 / 500).
 * لا تعرض stack traces أو مسارات ملفات السيرفر للمستخدم.
 */
export function parseApiError(
  body: unknown,
  fallbackAr: string,
  fallbackEn: string,
  locale: "ar" | "en" = "ar",
): string {
  const fallback = locale === "ar" ? fallbackAr : fallbackEn;

  if (!body || typeof body !== "object") {
    return fallback;
  }

  const record = body as {
    errors?: Record<string, string[]>;
    message?: string;
  };

  if (record.errors) {
    const first = Object.values(record.errors).flat().find(Boolean);
    if (typeof first === "string") {
      return sanitizePublicError(first.replace(/^\.\s*/, "").trim(), fallback);
    }
  }

  const genericInvalid = "The given data was invalid.";
  if (
    record.message &&
    record.message !== genericInvalid &&
    !record.message.startsWith(genericInvalid)
  ) {
    return sanitizePublicError(record.message.replace(/^\.\s*/, "").trim(), fallback);
  }

  return fallback;
}

/** Hide PHP/Laravel internals from UI (especially if APP_DEBUG leaks). */
export function sanitizePublicError(message: string, fallback: string): string {
  const raw = message.trim();
  if (!raw) return fallback;

  const looksInternal =
    /TypeError|Argument #\d|must be of type|called in \/|\\App\\|\\Illuminate\\|vendor\/|Stack trace|PHP (Fatal|Warning|Notice)|on line \d+/i.test(
      raw,
    ) ||
    raw.length > 220 ||
    raw.includes(".php:");

  return looksInternal ? fallback : raw;
}
