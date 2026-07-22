"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { customerService, getCustomerToken } from "@/services/customerService";
import type { Customer } from "@/types/customer";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { getApiBaseUrl } from "@/lib/api-base";
import { parseApiError } from "@/lib/parse-api-error";
import { formProfileDefaults, saveFormProfile } from "@/lib/form-profile-cookie";

interface PartnerApplyModalProps {
  readonly open: boolean;
  readonly locale: Locale;
  readonly onClose: () => void;
}

const ACTIVITY_TYPES = [
  { value: "entertainment", ar: "ترفيه وأنشطة", en: "Entertainment & activities" },
  { value: "events", ar: "فعاليات ومؤتمرات", en: "Events & conferences" },
  { value: "both", ar: "كلاهما", en: "Both" },
] as const;

const CITIES = ["الرياض", "جدة", "الدمام", "الخبر", "مكة", "المدينة", "أخرى"] as const;

export function PartnerApplyModal({
  open,
  locale,
  onClose,
}: PartnerApplyModalProps): React.ReactElement {
  const ar = locale === "ar";
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loadingPrefill, setLoadingPrefill] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setError("");
    setDone(false);

    if (!getCustomerToken()) {
      setCustomer(null);
      return;
    }

    setLoadingPrefill(true);
    void customerService.me().then((profile) => {
      if (!active) return;
      setCustomer(profile);
      setLoadingPrefill(false);
    });

    return () => {
      active = false;
    };
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/partner/apply`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partner_business_name: String(fd.get("partner_business_name")),
          partner_activity_type: String(fd.get("partner_activity_type")),
          email: String(fd.get("email")),
          phone: String(fd.get("phone")),
          city: String(fd.get("city")),
          partner_request_message: String(fd.get("partner_request_message")),
          locale,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          parseApiError(
            err,
            "تعذّر إرسال طلب الشراكة",
            "Could not submit partner application",
            locale,
          ),
        );
      }
      setDone(true);
      saveFormProfile({
        email: String(fd.get("email")),
        phone: String(fd.get("phone")),
        city: String(fd.get("city")),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : ar
            ? "تعذّر إرسال الطلب"
            : "Could not submit",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const savedDefaults = formProfileDefaults({
    email: customer?.email,
    phone: customer?.phone ?? undefined,
    city: customer?.city ?? undefined,
    name: customer?.name,
  });
  const defaultCity =
    customer?.city ||
    (CITIES.includes(savedDefaults.city as (typeof CITIES)[number])
      ? savedDefaults.city
      : "الرياض");

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-[#06101f]/80 backdrop-blur-md"
            aria-label={ar ? "إغلاق" : "Close"}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-cyan-400/20 bg-[#071525] shadow-[0_-20px_80px_rgba(0,0,0,0.55)] sm:rounded-3xl"
            initial={reduceMotion ? false : { y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { y: 32, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.18),transparent_70%)]"
              aria-hidden
            />

            <header className="relative flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
                  Xoar Partners
                </p>
                <h2 id={titleId} className="mt-1 text-xl font-bold text-white sm:text-2xl">
                  {ar ? "انضم لشبكة شركاء إكزورا" : "Join the Xoar partner network"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {ar
                    ? "طلب شراكة مستقل — لا يتطلب تسجيل دخول العميل."
                    : "Partner request only — no customer login required."}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/5"
              >
                {ar ? "إغلاق" : "Close"}
              </button>
            </header>

            <div className="relative overflow-y-auto px-5 py-5 sm:px-6">
              {done ? (
                <div className="space-y-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-5 text-center">
                  <p className="text-base font-semibold text-emerald-100">
                    {ar ? "تم إرسال طلب الشراكة" : "Partner request sent"}
                  </p>
                  <p className="text-sm text-emerald-100/80">
                    {ar
                      ? "سيراجع فريق إكزورا طلبك ويتواصل معك عبر البريد أو الجوال."
                      : "The Xoar team will review and contact you. This does not sign you in as a customer."}
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-slate-200"
                  >
                    {ar ? "حسناً" : "Done"}
                  </button>
                </div>
              ) : (
                <form
                  key={customer?.id ?? "guest"}
                  className="space-y-4"
                  onSubmit={(e) => void handleSubmit(e)}
                >
                  <Field label={ar ? "اسم النشاط / العلامة التجارية" : "Business / brand name"}>
                    <input
                      name="partner_business_name"
                      required
                      defaultValue={customer?.partnerBusinessName || customer?.name || savedDefaults.name || ""}
                      disabled={loadingPrefill}
                      className={inputClass}
                    />
                  </Field>

                  <Field label={ar ? "البريد الإلكتروني للتواصل" : "Contact email"}>
                    <input
                      name="email"
                      type="email"
                      required
                      defaultValue={customer?.email || savedDefaults.email || ""}
                      disabled={loadingPrefill}
                      className={inputClass}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={ar ? "نوع الخدمة" : "Service type"}>
                      <select name="partner_activity_type" defaultValue="both" className={inputClass}>
                        {ACTIVITY_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {ar ? t.ar : t.en}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label={ar ? "المدينة" : "City"}>
                      <select
                        name="city"
                        required
                        defaultValue={defaultCity}
                        className={inputClass}
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label={ar ? "رقم الجوال للتواصل" : "Contact phone"}>
                    <input
                      name="phone"
                      type="tel"
                      required
                      defaultValue={customer?.phone || savedDefaults.phone || ""}
                      className={inputClass}
                    />
                  </Field>

                  <Field label={ar ? "صف نشاطك وخبرتك" : "Describe your activity"}>
                    <textarea
                      name="partner_request_message"
                      required
                      rows={4}
                      placeholder={
                        ar
                          ? "نقدم تجارب ترفيهية عائلية في الرياض…"
                          : "We provide family entertainment experiences in Riyadh…"
                      }
                      className={cn(inputClass, "resize-y")}
                    />
                  </Field>

                  {error ? (
                    <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
                      {error}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-full bg-gradient-to-l from-cyan-500 via-teal-400 to-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-60"
                    >
                      {submitting
                        ? ar
                          ? "جاري الإرسال…"
                          : "Sending…"
                        : ar
                          ? "إرسال طلب الانضمام"
                          : "Submit application"}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full border border-white/15 px-5 py-3 text-sm text-slate-300 hover:bg-white/5"
                    >
                      {ar ? "إلغاء" : "Cancel"}
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {ar ? "مزايا الشريك المعتمد" : "Partner benefits"}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-slate-400">
                  <li>{ar ? "إضافة أنشطتك وعرضها للزوار" : "Add and showcase your activities"}</li>
                  <li>{ar ? "طلب فعاليات خاصة عبر المنصة" : "Request special events on the platform"}</li>
                  <li>{ar ? "إشعارات فورية عند الحجوزات" : "Instant booking notifications"}</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#0a1a2e] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50 disabled:opacity-60";
