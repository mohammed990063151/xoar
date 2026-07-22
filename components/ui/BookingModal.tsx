"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  submitInquiry,
  type InquiryType,
} from "@/services/inquiryService";
import type { BookingModalOptions } from "@/components/providers/BookingModalProvider";
import type { Locale } from "@/lib/i18n";

interface BookingModalProps {
  readonly open: boolean;
  readonly locale: Locale;
  readonly labels: {
    readonly name: string;
    readonly email: string;
    readonly phone: string;
    readonly message: string;
    readonly preferredDate?: string;
    readonly location?: string;
    readonly send: string;
    readonly success: string;
    readonly error: string;
    readonly defaultTitle: string;
    readonly close: string;
  };
  readonly options: BookingModalOptions;
  readonly onClose: () => void;
}

function buildEventMessage(parts: {
  ar: boolean;
  title?: string;
  preferredDate: string;
  location: string;
  message: string;
}): string {
  const lines: string[] = [
    parts.ar ? "[طلب فعالية]" : "[Event inquiry]",
  ];
  if (parts.title?.trim()) {
    lines.push(
      `${parts.ar ? "الفعالية" : "Event"}: ${parts.title.trim()}`,
    );
  }
  if (parts.preferredDate) {
    lines.push(
      `${parts.ar ? "التاريخ المفضل" : "Preferred date"}: ${parts.preferredDate}`,
    );
  }
  if (parts.location.trim()) {
    lines.push(
      `${parts.ar ? "الموقع" : "Location"}: ${parts.location.trim()}`,
    );
  }
  if (parts.message.trim()) {
    lines.push(
      `${parts.ar ? "التفاصيل" : "Details"}: ${parts.message.trim()}`,
    );
  }
  return lines.join("\n");
}

export function BookingModal({
  open,
  locale,
  labels,
  options,
  onClose,
}: BookingModalProps): React.ReactElement {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEvent = options.variant === "event";
  const type: InquiryType = options.type ?? (isEvent ? "service" : "contact");
  const title = options.title ?? labels.defaultTitle;
  const ar = locale === "ar";
  const dateLabel = labels.preferredDate ?? (ar ? "التاريخ المفضل" : "Preferred date");
  const locationLabel = labels.location ?? (ar ? "الموقع" : "Location");
  const minDate = new Date().toISOString().slice(0, 10);

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
    if (!open) {
      setSent(false);
      setError(null);
      setLoading(false);
      setPreferredDate("");
      setLocation("");
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const composedMessage = isEvent
        ? buildEventMessage({
            ar,
            title: options.title,
            preferredDate,
            location,
            message,
          })
        : message || undefined;

      await submitInquiry({
        type,
        source: options.source,
        locale,
        name,
        email,
        phone: phone || undefined,
        message: composedMessage,
        activity_id: options.activityId,
        ...(isEvent
          ? {
              event_type: "other",
              title: options.title || undefined,
              preferred_date: preferredDate || undefined,
              location: location || undefined,
              customer_message: message || undefined,
              event_slug: options.source?.startsWith("event-detail:")
                ? options.source.replace("event-detail:", "")
                : undefined,
            }
          : {}),
      });
      setSent(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setPreferredDate("");
      setLocation("");
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label={labels.close}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-lg"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            <div className="gradient-border">
              <div className="inner p-6 sm:p-8">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <h2
                    id="booking-modal-title"
                    className="text-xl font-bold text-white sm:text-2xl"
                  >
                    {title}
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-white/15 px-2 py-1 text-sm text-slate-300 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {sent ? (
                  <p className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-cyan-100">
                    {labels.success}
                  </p>
                ) : (
                  <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <label className="text-sm text-slate-300">
                      {labels.name}
                      <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-cyan-400/50"
                      />
                    </label>
                    <label className="text-sm text-slate-300">
                      {labels.email}
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-cyan-400/50"
                      />
                    </label>
                    <label className="text-sm text-slate-300">
                      {labels.phone}
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-cyan-400/50"
                      />
                    </label>
                    {isEvent ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm text-slate-300">
                          {dateLabel}
                          <input
                            type="date"
                            dir="ltr"
                            min={minDate}
                            value={preferredDate}
                            onChange={(e) => setPreferredDate(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-cyan-400/50 [color-scheme:dark]"
                          />
                        </label>
                        <label className="text-sm text-slate-300 sm:col-span-1">
                          {locationLabel}
                          <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder={ar ? "مدينة أو موقع…" : "City or venue…"}
                            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-cyan-400/50"
                          />
                        </label>
                      </div>
                    ) : null}
                    <label className="text-sm text-slate-300">
                      {labels.message}
                      <textarea
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-cyan-400/50"
                      />
                    </label>
                    {error ? (
                      <p className="text-sm text-red-300">{error}</p>
                    ) : null}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="rounded-full bg-gradient-to-l from-violet-600 to-cyan-500 py-3 font-semibold text-white disabled:opacity-60"
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? "…" : labels.send}
                    </motion.button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
