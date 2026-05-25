/** Display phone in international format (LTR-safe). */
export function formatPhoneDisplay(raw?: string | null): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return "";

  let normalized = digits;
  if (normalized.startsWith("966")) {
    normalized = normalized.slice(3);
  }
  if (normalized.startsWith("0")) {
    normalized = normalized.slice(1);
  }

  if (normalized.length >= 9) {
    const local = normalized.slice(0, 9);
    return `+966 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
  }

  return raw?.trim() ?? "";
}

export function phoneTelHref(raw?: string | null): string {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return "";
  const withCountry = digits.startsWith("966") ? digits : `966${digits.replace(/^0/, "")}`;
  return `tel:+${withCountry}`;
}
