"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookingStepper } from "@/components/activities/booking/BookingStepper";
import {
  calculateBookingTotal,
  formatDisplayDate,
  formatMoney,
  parsePriceAmount,
  toIsoDate,
  upcomingBookableDays,
} from "@/lib/booking";
import { bookingLabels } from "@/lib/booking-labels";
import { activityImageUrl } from "@/lib/activity";
import type { Activity } from "@/types/api";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { siteApi, ApiError } from "@/services/api";

type WizardStep = "date" | "checkout" | "success";

interface ActivityBookingWizardProps {
  readonly activity: Activity;
  readonly locale: Locale;
}

export function ActivityBookingWizard({
  activity,
  locale,
}: ActivityBookingWizardProps): React.ReactElement {
  const labels = bookingLabels(locale);
  const unitPrice = parsePriceAmount(activity.price);
  const bookableDays = useMemo(() => upcomingBookableDays(35), []);

  const [step, setStep] = useState<WizardStep>("date");
  const [selectedDate, setSelectedDate] = useState<Date>(bookableDays[0]);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple" | "google">("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");

  const total = calculateBookingTotal(unitPrice, adults, children);
  const totalLabel = unitPrice > 0 ? formatMoney(total, locale) : activity.price ?? "—";
  const stepIndex = step === "date" ? 2 : step === "checkout" ? 3 : 4;

  async function submitBooking(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await siteApi.submitInquiry({
        type: "booking",
        activity_id: activity.id,
        locale,
        source: "booking-wizard",
        name: String(fd.get("name")),
        email: String(fd.get("email")),
        phone: String(fd.get("phone") || ""),
        booking_date: toIsoDate(selectedDate),
        adults,
        children,
        total_amount: totalLabel,
        payment_method: paymentMethod,
        message: `${labels.adults}: ${adults}, ${labels.children}: ${children}`,
      });
      setConfirmationCode(res.data.confirmationCode ?? `XRA${res.data.id}`);
      setStep("success");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : locale === "ar" ? "حدث خطأ" : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <BookingStepper labels={labels.steps} current={stepIndex} />

      <div className="mt-8 gradient-border">
        <div className="inner overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-white/10 bg-slate-950/50 p-5 sm:flex-row sm:items-center">
            <div
              className="h-20 w-full shrink-0 rounded-xl bg-cover bg-center sm:w-28"
              style={{ backgroundImage: `url(${activityImageUrl(activity)})` }}
            />
            <div>
              <p className="text-xs text-slate-500">{activity.title}</p>
              <p className="text-lg font-bold text-white">{totalLabel}</p>
              <p className="text-sm text-slate-400">
                {formatDisplayDate(selectedDate, locale)} · {adults} {labels.adults}
                {children > 0 ? ` · ${children} ${labels.children}` : ""}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === "date" ? (
              <motion.div
                key="date"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="p-5 sm:p-8"
              >
                <h2 className="text-xl font-bold text-white">{labels.selectDate}</h2>
                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_220px]">
                  <div>
                    <p className="mb-3 text-sm text-slate-400">
                      {locale === "ar" ? "تواريخ متاحة" : "Available dates"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {bookableDays.map((day) => {
                        const iso = toIsoDate(day);
                        const selected = toIsoDate(selectedDate) === iso;
                        return (
                          <button
                            key={iso}
                            type="button"
                            onClick={() => setSelectedDate(day)}
                            className={
                              selected
                                ? "rounded-xl border border-cyan-400/50 bg-cyan-500/20 px-3 py-2 text-sm font-medium text-cyan-100"
                                : "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:border-white/20"
                            }
                          >
                            {day.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                              day: "numeric",
                              month: "short",
                            })}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/80 p-4">
                    <label className="block text-sm text-slate-300">
                      {labels.adults}
                      <select
                        value={adults}
                        onChange={(e) => setAdults(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm text-slate-300">
                      {labels.children}
                      <select
                        value={children}
                        onChange={(e) => setChildren(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white"
                      >
                        {[0, 1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3">
                      <p className="text-xs text-cyan-200/80">{labels.total}</p>
                      <p className="text-2xl font-bold text-white">{totalLabel}</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("checkout")}
                  className="mt-8 w-full rounded-2xl bg-gradient-to-l from-violet-600 via-blue-500 to-cyan-400 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/25"
                >
                  {labels.continuePayment}
                </button>
              </motion.div>
            ) : null}

            {step === "checkout" ? (
              <motion.div
                key="checkout"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="p-5 sm:p-8"
              >
                <h2 className="text-xl font-bold text-white">{labels.checkout}</h2>
                <form className="mt-6 space-y-4" onSubmit={(e) => void submitBooking(e)}>
                  {error ? (
                    <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                      {error}
                    </p>
                  ) : null}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm text-slate-300 sm:col-span-2">
                      {locale === "ar" ? "الاسم" : "Name"}
                      <input
                        name="name"
                        required
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-cyan-400/50"
                      />
                    </label>
                    <label className="text-sm text-slate-300">
                      {locale === "ar" ? "البريد" : "Email"}
                      <input
                        name="email"
                        type="email"
                        required
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-cyan-400/50"
                      />
                    </label>
                    <label className="text-sm text-slate-300">
                      {locale === "ar" ? "الهاتف" : "Phone"}
                      <input
                        name="phone"
                        type="tel"
                        required
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-cyan-400/50"
                      />
                    </label>
                  </div>

                  <div>
                    <p className="mb-2 text-sm text-slate-400">
                      {locale === "ar" ? "طريقة الدفع" : "Payment method"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          ["card", labels.card],
                          ["apple", labels.applePay],
                          ["google", labels.googlePay],
                        ] as const
                      ).map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setPaymentMethod(id)}
                          className={
                            paymentMethod === id
                              ? "rounded-xl border border-cyan-400/50 bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-100"
                              : "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
                          }
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="text-emerald-400">✓</span>
                    {labels.securePayment}
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setStep("date")}
                      className="rounded-2xl border border-white/15 px-6 py-3 text-slate-300"
                    >
                      {locale === "ar" ? "رجوع" : "Back"}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-2xl bg-gradient-to-l from-violet-600 via-blue-500 to-cyan-400 py-3.5 font-semibold text-white disabled:opacity-50"
                    >
                      {loading ? "..." : labels.proceed}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : null}

            {step === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 text-center sm:p-10"
              >
                <p className="text-3xl font-black tracking-tight text-transparent bg-gradient-to-l from-violet-300 via-cyan-300 to-emerald-300 bg-clip-text sm:text-4xl">
                  {labels.successTitle}
                </p>
                <p className="mt-2 text-slate-400">{labels.successSubtitle}</p>

                <div className="mx-auto mt-8 max-w-sm rotate-[-2deg] rounded-2xl border border-dashed border-cyan-400/40 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-xl">
                  <p className="text-xs uppercase tracking-widest text-slate-500">{labels.ticket}</p>
                  <p className="mt-2 font-mono text-2xl font-bold text-cyan-300">{confirmationCode}</p>
                  <span className="mt-3 inline-block rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    {labels.confirmed}
                  </span>
                  <p className="mt-4 text-sm text-white">{activity.title}</p>
                  <p className="text-xs text-slate-500">{formatDisplayDate(selectedDate, locale)}</p>
                  <p className="mt-2 text-lg font-bold text-white">{totalLabel}</p>
                </div>

                <Link
                  href={localizedPath(locale, "/activities")}
                  className="mt-8 inline-flex rounded-2xl border border-white/15 px-6 py-3 text-sm font-medium text-slate-200 hover:bg-white/5"
                >
                  {labels.backActivities}
                </Link>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
