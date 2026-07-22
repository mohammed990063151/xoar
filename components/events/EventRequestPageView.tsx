"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import { submitInquiry } from "@/services/inquiryService";
import { useFormProfileAutofill } from "@/hooks/useFormProfileAutofill";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { pageBottom, pageTitle, siteContainer } from "@/lib/layout";

interface EventRequestPageViewProps {
  readonly locale: Locale;
  readonly copy: Dictionary["pages"]["requestEvent"];
}

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)]";

const EVENT_TYPES = [
  { value: "private", ar: "حفلة خاصة", en: "Private party" },
  { value: "birthday", ar: "عيد ميلاد", en: "Birthday" },
  { value: "corporate", ar: "فعالية شركات", en: "Corporate event" },
  { value: "wedding", ar: "مناسبة عائلية", en: "Family celebration" },
  { value: "other", ar: "أخرى", en: "Other" },
] as const;

function buildMessage(payload: {
  eventTypeLabel: string;
  requestTitle: string;
  description: string;
  preferredDate: string;
  guestsCount: string;
  location: string;
  customerMessage: string;
  ar: boolean;
}): string {
  const lines = [
    payload.ar ? "[طلب فعالية]" : "[Event request]",
    `${payload.ar ? "نوع المناسبة" : "Event type"}: ${payload.eventTypeLabel}`,
    `${payload.ar ? "العنوان" : "Title"}: ${payload.requestTitle}`,
  ];

  if (payload.description.trim()) {
    lines.push(`${payload.ar ? "التفاصيل" : "Details"}: ${payload.description.trim()}`);
  }
  if (payload.preferredDate) {
    lines.push(`${payload.ar ? "التاريخ المفضل" : "Preferred date"}: ${payload.preferredDate}`);
  }
  if (payload.guestsCount) {
    lines.push(`${payload.ar ? "عدد الضيوف" : "Guests"}: ${payload.guestsCount}`);
  }
  if (payload.location.trim()) {
    lines.push(`${payload.ar ? "الموقع" : "Location"}: ${payload.location.trim()}`);
  }
  if (payload.customerMessage.trim()) {
    lines.push(`${payload.ar ? "رسالة إضافية" : "Additional message"}: ${payload.customerMessage.trim()}`);
  }

  return lines.join("\n");
}

export function EventRequestPageView({
  locale,
  copy,
}: EventRequestPageViewProps): React.ReactElement {
  const ar = locale === "ar";
  const [eventType, setEventType] = useState<string>("private");
  const [requestTitle, setRequestTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [guestsCount, setGuestsCount] = useState("");
  const [location, setLocation] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useFormProfileAutofill({ setName, setEmail, setPhone });

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    setLoading(true);

    const eventTypeLabel =
      EVENT_TYPES.find((item) => item.value === eventType)?.[ar ? "ar" : "en"] ?? eventType;

    try {
      await submitInquiry({
        type: "service",
        source: "event-request",
        locale,
        name,
        email,
        phone: phone || undefined,
        event_type: eventType,
        title: requestTitle,
        description: description || undefined,
        preferred_date: preferredDate || undefined,
        location: location || undefined,
        guests_count: guestsCount ? Number(guestsCount) : undefined,
        customer_message: customerMessage || undefined,
        message: buildMessage({
          eventTypeLabel,
          requestTitle,
          description,
          preferredDate,
          guestsCount,
          location,
          customerMessage,
          ar,
        }),
      });
      setSent(true);
      setRequestTitle("");
      setDescription("");
      setPreferredDate("");
      setGuestsCount("");
      setLocation("");
      setCustomerMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : ar ? "تعذّر إرسال الطلب" : "Could not submit request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={pageBottom}>
      <div className={siteContainer}>
        <SlideInEdge from={locale === "ar" ? "end" : "start"} className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400/90">
            {copy.eyebrow}
          </p>
          <h1 className={`mt-3 ${pageTitle}`}>{copy.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-400">{copy.intro}</p>
        </SlideInEdge>

        <SlideInEdge from="bottom" delay={0.08} className="mx-auto mt-10 max-w-3xl">
          {sent ? (
            <motion.div
              className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-6 py-8 text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-lg font-semibold text-emerald-100">{copy.successTitle}</p>
              <p className="mt-2 text-sm leading-relaxed text-emerald-100/85">{copy.success}</p>
              <button
                type="button"
                className="mt-6 rounded-full border border-emerald-400/35 px-5 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/15"
                onClick={() => setSent(false)}
              >
                {copy.sendAnother}
              </button>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="event-type" className="text-sm font-medium text-slate-200">
                    {copy.eventType}
                  </label>
                  <select
                    id="event-type"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className={fieldClass}
                    required
                  >
                    {EVENT_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {ar ? item.ar : item.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="request-title" className="text-sm font-medium text-slate-200">
                    {copy.requestTitle}
                  </label>
                  <input
                    id="request-title"
                    type="text"
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    className={fieldClass}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="request-description" className="text-sm font-medium text-slate-200">
                    {copy.description}
                  </label>
                  <textarea
                    id="request-description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="preferred-date" className="text-sm font-medium text-slate-200">
                    {copy.preferredDate}
                  </label>
                  <input
                    id="preferred-date"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="guests-count" className="text-sm font-medium text-slate-200">
                    {copy.guestsCount}
                  </label>
                  <input
                    id="guests-count"
                    type="number"
                    min={1}
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(e.target.value)}
                    className={fieldClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="event-location" className="text-sm font-medium text-slate-200">
                    {copy.location}
                  </label>
                  <input
                    id="event-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={fieldClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="customer-message" className="text-sm font-medium text-slate-200">
                    {copy.customerMessage}
                  </label>
                  <textarea
                    id="customer-message"
                    rows={2}
                    value={customerMessage}
                    onChange={(e) => setCustomerMessage(e.target.value)}
                    className={fieldClass}
                    placeholder={copy.customerMessagePlaceholder}
                  />
                </div>
              </div>

              <div className="my-8 h-px bg-white/10" aria-hidden />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="text-sm font-medium text-slate-200">
                    {copy.name}
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={fieldClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="text-sm font-medium text-slate-200">
                    {copy.email}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={fieldClass}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="contact-phone" className="text-sm font-medium text-slate-200">
                    {copy.phone}
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              {error ? (
                <p className="mt-4 text-sm text-red-300" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-emerald-600 via-teal-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(16,185,129,0.28)] transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
              >
                {loading ? copy.sending : copy.submit}
              </button>
            </form>
          )}
        </SlideInEdge>
      </div>
    </div>
  );
}
