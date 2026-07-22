export type FormProfile = {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
};

const COOKIE_NAME = "xora_form_profile";
const MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

function canUseCookies(): boolean {
  return typeof document !== "undefined";
}

function sanitize(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed !== "" ? trimmed : undefined;
}

/** Read saved contact details from cookie (name, email, phone, city). */
export function readFormProfile(): FormProfile {
  if (!canUseCookies()) {
    return {};
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
  );

  if (!match?.[1]) {
    return {};
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(match[1])) as FormProfile;

    return {
      name: sanitize(parsed.name),
      email: sanitize(parsed.email),
      phone: sanitize(parsed.phone),
      city: sanitize(parsed.city),
    };
  } catch {
    return {};
  }
}

/** Merge and persist contact details in a cookie for faster form fill next visit. */
export function saveFormProfile(partial: FormProfile): FormProfile {
  if (!canUseCookies()) {
    return partial;
  }

  const current = readFormProfile();
  const next: FormProfile = {
    name: sanitize(partial.name) ?? current.name,
    email: sanitize(partial.email) ?? current.email,
    phone: sanitize(partial.phone) ?? current.phone,
    city: sanitize(partial.city) ?? current.city,
  };

  const cleaned = Object.fromEntries(
    Object.entries(next).filter(([, value]) => value !== undefined && value !== ""),
  ) as FormProfile;

  const encoded = encodeURIComponent(JSON.stringify(cleaned));
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";

  document.cookie = `${COOKIE_NAME}=${encoded}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;

  return cleaned;
}

export function clearFormProfile(): void {
  if (!canUseCookies()) {
    return;
  }

  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

/** Pick saved profile values for form defaultValue props. */
export function formProfileDefaults(
  overrides?: Partial<FormProfile>,
): Required<Pick<FormProfile, "name" | "email" | "phone" | "city">> {
  const saved = readFormProfile();

  return {
    name: overrides?.name ?? saved.name ?? "",
    email: overrides?.email ?? saved.email ?? "",
    phone: overrides?.phone ?? saved.phone ?? "",
    city: overrides?.city ?? saved.city ?? "",
  };
}
