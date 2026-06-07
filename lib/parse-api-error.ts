/**
 * استخراج أول رسالة خطأ من استجابة Laravel (422 / 401).
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
      return first.replace(/^\.\s*/, "").trim();
    }
  }

  const genericInvalid = "The given data was invalid.";
  if (
    record.message &&
    record.message !== genericInvalid &&
    !record.message.startsWith(genericInvalid)
  ) {
    return record.message.replace(/^\.\s*/, "").trim();
  }

  return fallback;
}
