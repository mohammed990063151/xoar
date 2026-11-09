"use client";

import { useState } from "react";
import { submitInquiry } from "@/services/inquiryService";
import { useFormProfileAutofill } from "@/hooks/useFormProfileAutofill";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";

interface EquipmentCustomRequestFormProps {
  readonly locale: Locale;
  readonly copy: Dictionary["pages"]["equipment"];
}

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]";

export function EquipmentCustomRequestForm({
  locale,
  copy,
}: EquipmentCustomRequestFormProps): React.ReactElement {
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
      ar ? "[طلب تأجير معدات مخصص]" : "[Custom equipment rental request]",
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
        source: "equipment-rental-custom",
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

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-5 py-6 text-center">
        <p className="text-lg font-semibold text-emerald-100">{copy.successTitle}</p>
        <p className="mt-2 text-sm text-emerald-50/80">{copy.success}</p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 text-sm font-medium text-cyan-200 underline-offset-2 hover:underline"
        >
          {copy.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <p className="text-sm font-semibold text-white">{copy.formTitle}</p>
      <label className="block text-sm text-slate-300">
        {copy.requestTitle}
        <input
          required
          value={requestTitle}
          onChange={(e) => setRequestTitle(e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block text-sm text-slate-300">
        {copy.equipmentNeeded}
        <textarea
          required
          rows={3}
          value={equipmentNeeded}
          onChange={(e) => setEquipmentNeeded(e.target.value)}
          placeholder={copy.equipmentNeededPlaceholder}
          className={fieldClass}
        />
      </label>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className="block text-sm text-slate-300">
          {copy.preferredDate}
          <input
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm text-slate-300">
          {copy.location}
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={fieldClass}
          />
        </label>
      </div>
      <label className="block text-sm text-slate-300">
        {copy.notes}
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={fieldClass} />
      </label>
      <div className="grid gap-3.5 sm:grid-cols-3">
        <label className="block text-sm text-slate-300 sm:col-span-1">
          {copy.name}
          <input required value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
        </label>
        <label className="block text-sm text-slate-300 sm:col-span-1">
          {copy.email}
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block text-sm text-slate-300 sm:col-span-1">
          {copy.phone}
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} />
        </label>
      </div>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full rounded-xl bg-gradient-to-l from-cyan-600 via-sky-500 to-emerald-400 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(6,182,212,0.28)] transition hover:brightness-110 disabled:opacity-60",
        )}
      >
        {loading ? copy.sending : copy.submit}
      </button>
    </form>
  );
}
