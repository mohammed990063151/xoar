/** GCC dial codes used for lead / landing phone validation. */
export const GCC_DIAL_CODES = [
  { iso: "SA", dial: "966", flag: "🇸🇦", labelAr: "السعودية", labelEn: "Saudi Arabia" },
  { iso: "AE", dial: "971", flag: "🇦🇪", labelAr: "الإمارات", labelEn: "United Arab Emirates" },
  { iso: "KW", dial: "965", flag: "🇰🇼", labelAr: "الكويت", labelEn: "Kuwait" },
  { iso: "BH", dial: "973", flag: "🇧🇭", labelAr: "البحرين", labelEn: "Bahrain" },
  { iso: "OM", dial: "968", flag: "🇴🇲", labelAr: "عُمان", labelEn: "Oman" },
  { iso: "QA", dial: "974", flag: "🇶🇦", labelAr: "قطر", labelEn: "Qatar" },
] as const;

export type GccDialCode = (typeof GCC_DIAL_CODES)[number]["dial"];

const ARABIC_DIGIT_MAP: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
};

/** Convert Arabic/Persian digits and strip non-digits. */
export function toAsciiDigits(value: string): string {
  return value
    .split("")
    .map((ch) => ARABIC_DIGIT_MAP[ch] ?? ch)
    .join("")
    .replace(/\D/g, "");
}

function nationalLength(dial: string): number {
  // SA / AE mobiles: 9 national digits; other GCC: 8.
  return dial === "966" || dial === "971" ? 9 : 8;
}

function isPlausibleNational(dial: string, national: string): boolean {
  if (national.length !== nationalLength(dial)) return false;
  if (!/^\d+$/.test(national)) return false;

  switch (dial) {
    case "966":
      // KSA mobile: 5XXXXXXXX
      return /^5\d{8}$/.test(national);
    case "971":
      // UAE mobile: 5XXXXXXXX (50/52/54/55/56/58…)
      return /^5\d{8}$/.test(national);
    case "965":
      return /^[569]\d{7}$/.test(national);
    case "973":
      return /^[36]\d{7}$/.test(national);
    case "968":
      return /^[79]\d{7}$/.test(national);
    case "974":
      return /^[3567]\d{7}$/.test(national);
    default:
      return false;
  }
}

/** Reject obvious fake / random patterns (all same digit, 500000000, 0123…, 9876…). */
export function isFakePhoneNational(national: string): boolean {
  if (national.length < 7) return true;
  if (/^(\d)\1+$/.test(national)) return true;
  // e.g. 500000000 / 511111111 — first digit then the rest identical
  if (/^\d(\d)\1+$/.test(national)) return true;

  let ascending = true;
  let descending = true;
  for (let i = 1; i < national.length; i += 1) {
    const prev = Number(national[i - 1]);
    const curr = Number(national[i]);
    if ((prev + 1) % 10 !== curr) ascending = false;
    if ((prev + 9) % 10 !== curr) descending = false;
  }
  return ascending || descending;
}

export function detectGccDial(digits: string): GccDialCode | null {
  const sorted = [...GCC_DIAL_CODES].sort((a, b) => b.dial.length - a.dial.length);
  for (const entry of sorted) {
    if (digits.startsWith(entry.dial)) return entry.dial;
  }
  return null;
}

/**
 * Split a stored/typed phone into GCC dial + national mobile digits.
 * Defaults to Saudi (+966) when the number looks like a local 05… / 5… mobile.
 */
export function splitGccPhone(raw: string): { dial: GccDialCode; national: string } {
  let digits = toAsciiDigits(raw);
  if (digits.startsWith("00")) digits = digits.slice(2);

  const known = detectGccDial(digits);
  if (known) {
    return { dial: known, national: digits.slice(known.length) };
  }

  if (digits.startsWith("0") && digits.length >= 9) {
    return { dial: "966", national: digits.slice(1) };
  }

  if (/^5\d{8}$/.test(digits)) {
    return { dial: "966", national: digits };
  }

  return { dial: "966", national: digits };
}

export function formatGccE164(dial: string, national: string): string {
  const n = toAsciiDigits(national).replace(/^0+/, "");
  return `+${dial}${n}`;
}

/** True when the value is a real GCC mobile (with or without country code). */
export function isValidGccMobile(value: string, preferredDial?: string): boolean {
  const { dial, national } = preferredDial
    ? { dial: preferredDial as GccDialCode, national: toAsciiDigits(value).replace(/^0+/, "") }
    : splitGccPhone(value);

  const nationalClean = national.replace(/^0+/, "");
  if (!isPlausibleNational(dial, nationalClean)) return false;
  if (isFakePhoneNational(nationalClean)) return false;
  return true;
}

/** Display phone in international format (LTR-safe). */
export function formatPhoneDisplay(raw?: string | null): string {
  const digits = toAsciiDigits(raw ?? "");
  if (!digits) return "";

  const { dial, national } = splitGccPhone(digits);
  const local = national.replace(/^0+/, "");
  if (isPlausibleNational(dial, local)) {
    if (local.length === 9) {
      return `+${dial} ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
    }
    if (local.length === 8) {
      return `+${dial} ${local.slice(0, 4)} ${local.slice(4)}`;
    }
  }

  // Legacy KSA-oriented fallback
  let normalized = digits;
  if (normalized.startsWith("966")) normalized = normalized.slice(3);
  if (normalized.startsWith("0")) normalized = normalized.slice(1);
  if (normalized.length >= 9) {
    const localSa = normalized.slice(0, 9);
    return `+966 ${localSa.slice(0, 2)} ${localSa.slice(2, 5)} ${localSa.slice(5)}`;
  }

  return raw?.trim() ?? "";
}

export function phoneTelHref(raw?: string | null): string {
  const digits = toAsciiDigits(raw ?? "");
  if (!digits) return "";
  if (detectGccDial(digits)) return `tel:+${digits}`;
  const withCountry = digits.startsWith("966")
    ? digits
    : `966${digits.replace(/^0/, "")}`;
  return `tel:+${withCountry}`;
}
