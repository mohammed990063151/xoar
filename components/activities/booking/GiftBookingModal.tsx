"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { bookingLabels } from "@/lib/booking-labels";
import type { Locale } from "@/lib/i18n";

export type GiftRecipientDetails = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

interface GiftBookingModalProps {
  readonly open: boolean;
  readonly locale: Locale;
  readonly activityTitle: string;
  readonly initial?: GiftRecipientDetails | null;
  readonly onClose: () => void;
  readonly onSave: (details: GiftRecipientDetails) => void;
}

const emptyDetails = (): GiftRecipientDetails => ({
  name: "",
  phone: "",
  email: "",
  message: "",
});

export function GiftBookingModal({
  open,
  locale,
  activityTitle,
  initial,
  onClose,
  onSave,
}: GiftBookingModalProps): React.ReactElement {
  const labels = bookingLabels(locale);
  const ar = locale === "ar";
  const [form, setForm] = useState<GiftRecipientDetails>(initial ?? emptyDetails());
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(initial ?? emptyDetails());
      setError("");
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  function saveGift(): void {
    if (!form.name.trim()) {
      setError(ar ? "اسم المهدى إليه مطلوب" : "Recipient name is required");
      return;
    }
    if (!form.phone.trim()) {
      setError(ar ? "جوال المهدى إليه مطلوب" : "Recipient phone is required");
      return;
    }
    onSave({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    });
    onClose();
  }

  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gift-modal-title"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="w-full max-w-md overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-white/10 bg-violet-600/10 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-violet-300">
                    🎁 {labels.giftBooking}
                  </p>
                  <h2 id="gift-modal-title" className="mt-1 text-lg font-bold text-white">
                    {labels.giftModalTitle}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">{activityTitle}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-white/10 px-2.5 py-1 text-slate-400 hover:text-white"
                  aria-label={labels.giftCancel}
                >
                  ✕
                </button>
              </div>
            </div>

            <div
              className="space-y-4 p-5"
              role="group"
              aria-labelledby="gift-modal-title"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                  e.preventDefault();
                  saveGift();
                }
              }}
            >
              <p className="text-xs text-slate-500">{labels.giftModalHint}</p>

              {error ? (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {error}
                </p>
              ) : null}

              <label className="block text-sm text-slate-300">
                {labels.giftRecipientName} *
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-violet-400/50"
                  autoFocus
                />
              </label>

              <label className="block text-sm text-slate-300">
                {labels.giftRecipientPhone} *
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-violet-400/50"
                />
              </label>

              <label className="block text-sm text-slate-300">
                {labels.giftRecipientEmail}
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-violet-400/50"
                />
              </label>

              <label className="block text-sm text-slate-300">
                {labels.giftMessage}
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder={ar ? "مثال: عيد ميلاد سعيد!" : "e.g. Happy birthday!"}
                  className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-violet-400/50"
                />
              </label>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-white/15 py-3 text-sm font-medium text-slate-300 hover:bg-white/5"
                >
                  {labels.giftCancel}
                </button>
                <button
                  type="button"
                  onClick={saveGift}
                  className="flex-1 rounded-xl bg-gradient-to-l from-violet-600 to-fuchsia-600 py-3 text-sm font-bold text-white"
                >
                  {labels.giftSave}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
