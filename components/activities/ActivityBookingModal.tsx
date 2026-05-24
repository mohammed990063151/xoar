"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { siteApi, ApiError } from "@/services/api";
import type { Activity } from "@/types/api";
import type { Locale } from "@/lib/i18n";

interface ActivityBookingModalProps {
  readonly activity: Activity;
  readonly locale: Locale;
  readonly onClose: () => void;
}

export function ActivityBookingModal({
  activity,
  locale,
  onClose,
}: ActivityBookingModalProps): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await siteApi.submitInquiry({
        type: "booking",
        activity_id: activity.id,
        locale,
        source: "activities",
        name: String(fd.get("name")),
        email: String(fd.get("email")),
        phone: String(fd.get("phone") || ""),
        message: String(fd.get("message") || ""),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : locale === "ar" ? "حدث خطأ" : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const labels =
    locale === "ar"
      ? {
          title: "حجز النشاط",
          subtitle: activity.title,
          name: "الاسم",
          email: "البريد الإلكتروني",
          phone: "الهاتف",
          message: "تفاصيل إضافية (عدد الأشخاص، التاريخ المفضل...)",
          submit: "إرسال طلب الحجز",
          success: "تم إرسال طلب الحجز. سنتواصل معك قريباً لإتمام العملية.",
          close: "إغلاق",
        }
      : {
          title: "Book activity",
          subtitle: activity.title,
          name: "Name",
          email: "Email",
          phone: "Phone",
          message: "Additional details (group size, preferred date...)",
          submit: "Send booking request",
          success: "Your booking request was sent. We will contact you soon.",
          close: "Close",
        };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="gradient-border w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="inner p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 id="booking-modal-title" className="text-xl font-bold text-white">
                {labels.title}
              </h2>
              <p className="mt-1 text-sm text-slate-400">{labels.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-2 py-1 text-slate-400 hover:text-white"
              aria-label={labels.close}
            >
              ✕
            </button>
          </div>

          {sent ? (
            <p className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
              {labels.success}
            </p>
          ) : (
            <form className="flex flex-col gap-3" onSubmit={(e) => void handleSubmit(e)}>
              {error ? (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  {error}
                </p>
              ) : null}
              <label className="text-sm text-slate-300">
                {labels.name}
                <input name="name" required className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-cyan-400/50" />
              </label>
              <label className="text-sm text-slate-300">
                {labels.email}
                <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-cyan-400/50" />
              </label>
              <label className="text-sm text-slate-300">
                {labels.phone}
                <input name="phone" type="tel" required className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-cyan-400/50" />
              </label>
              <label className="text-sm text-slate-300">
                {labels.message}
                <textarea name="message" rows={3} className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-cyan-400/50" />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="mt-1 rounded-full bg-gradient-to-l from-violet-600 to-cyan-500 py-3 font-semibold text-white disabled:opacity-50"
              >
                {loading ? "..." : labels.submit}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
