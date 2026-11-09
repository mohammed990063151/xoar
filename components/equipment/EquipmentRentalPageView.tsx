"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import { submitInquiry } from "@/services/inquiryService";
import { useFormProfileAutofill } from "@/hooks/useFormProfileAutofill";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { pageBottom, pageTitle, siteContainer } from "@/lib/layout";

interface EquipmentRentalPageViewProps {
  readonly locale: Locale;
  readonly copy: Dictionary["pages"]["equipment"];
}

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)]";

export function EquipmentRentalPageView({
  locale,
  copy,
}: EquipmentRentalPageViewProps): React.ReactElement {
  const ar = locale === "ar";
  const [requestTitle, setRequestTitle] = useState("");
  const [equipmentNeeded, setEquipmentNeeded] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
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

    const message = [
      ar ? "[طلب تأجير معدات]" : "[Equipment rental request]",
      `${ar ? "العنوان" : "Title"}: ${requestTitle}`,
      `${ar ? "المعدات" : "Equipment"}: ${equipmentNeeded}`,
      preferredDate ? `${ar ? "التاريخ" : "Date"}: ${preferredDate}` : null,
      location.trim() ? `${ar ? "الموقع" : "Location"}: ${location.trim()}` : null,
      notes.trim() ? `${ar ? "ملاحظات" : "Notes"}: ${notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await submitInquiry({
        type: "service",
        source: "equipment-rental",
        locale,
        name,
        email,
        phone: phone || undefined,
        event_type: "other",
        title: requestTitle,
        description: equipmentNeeded,
        preferred_date: preferredDate || undefined,
        location: location || undefined,
        customer_message: notes || undefined,
        message,
      });
      setSent(true);
      setRequestTitle("");
      setEquipmentNeeded("");
      setPreferredDate("");
      setLocation("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : ar ? "تعذّر إرسال الطلب" : "Could not submit request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={pageBottom}>
      <div className={siteContainer}>
        <SlideInEdge from={ar ? "end" : "start"} className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400/90">
            {copy.eyebrow}
          </p>
          <h1 className={`mt-3 ${pageTitle}`}>{copy.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-400">{copy.intro}</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {copy.highlights.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-4 text-sm leading-relaxed text-slate-200"
              >
                {item}
              </li>
            ))}
          </ul>
        </SlideInEdge>

        <SlideInEdge from="bottom" delay={0.08} className="mx-auto mt-10 max-w-3xl">
          <h2 className="mb-4 text-lg font-semibold text-white">{copy.formTitle}</h2>
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
                  <label htmlFor="equipment-title" className="text-sm font-medium text-slate-200">
                    {copy.requestTitle}
                  </label>
                  <input
                    id="equipment-title"
                    type="text"
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    className={fieldClass}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="equipment-needed" className="text-sm font-medium text-slate-200">
                    {copy.equipmentNeeded}
                  </label>
                  <textarea
                    id="equipment-needed"
                    rows={3}
                    value={equipmentNeeded}
                    onChange={(e) => setEquipmentNeeded(e.target.value)}
                    className={fieldClass}
                    placeholder={copy.equipmentNeededPlaceholder}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="equipment-date" className="text-sm font-medium text-slate-200">
                    {copy.preferredDate}
                  </label>
                  <input
                    id="equipment-date"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="equipment-location" className="text-sm font-medium text-slate-200">
                    {copy.location}
                  </label>
                  <input
                    id="equipment-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="equipment-notes" className="text-sm font-medium text-slate-200">
                    {copy.notes}
                  </label>
                  <textarea
                    id="equipment-notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="equipment-name" className="text-sm font-medium text-slate-200">
                    {copy.name}
                  </label>
                  <input
                    id="equipment-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={fieldClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="equipment-email" className="text-sm font-medium text-slate-200">
                    {copy.email}
                  </label>
                  <input
                    id="equipment-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={fieldClass}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="equipment-phone" className="text-sm font-medium text-slate-200">
                    {copy.phone}
                  </label>
                  <input
                    id="equipment-phone"
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
