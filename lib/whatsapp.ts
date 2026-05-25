const DEFAULT_WHATSAPP = "966563672097";

/** Build a wa.me link from a phone number or stored URL. */
export function whatsappHref(raw?: string | null): string {
  const value = raw?.trim() || DEFAULT_WHATSAPP;
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  const digits = value.replace(/\D/g, "");
  return `https://wa.me/${digits || DEFAULT_WHATSAPP}`;
}
