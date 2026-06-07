"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { getApiBaseUrl } from "@/lib/api-base";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n";
import Link from "next/link";
import { pageBottom, pageHeroSection, siteContainer } from "@/lib/layout";

const DESIGNS = [
  { id: "birthday", ar: "عيد ميلاد", en: "Birthday" },
  { id: "graduation", ar: "تخرج", en: "Graduation" },
  { id: "wedding", ar: "زواج", en: "Wedding" },
] as const;

const AMOUNTS = [100, 200, 500];

export default function GiftCardsPage(): React.ReactElement {
  const params = useParams();
  const locale = (params.locale as string) ?? "ar";
  const loc: Locale = isLocale(locale) ? locale : "ar";
  const ar = loc === "ar";

  const [amount, setAmount] = useState(200);
  const [design, setDesign] = useState<string>("birthday");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{ code?: string; whatsappUrl?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function purchase(): Promise<void> {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/gift-cards`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          design,
          recipient_name: recipientName || undefined,
          recipient_phone: recipientPhone || undefined,
          message: message || undefined,
          locale: loc,
        }),
      });
      const json = await res.json();
      if (res.ok) setResult(json.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={pageBottom}>
      <section className={pageHeroSection}>
        <div className={siteContainer}>
          <h1 className="text-3xl font-bold text-white">
            {ar ? "بطاقات هدايا Xora" : "Xora gift cards"}
          </h1>
          <p className="mt-2 max-w-xl text-slate-400">
            {ar
              ? "اشترِ بطاقة هدية وأرسلها عبر واتساب — مثالية للأعياد والمناسبات."
              : "Buy a digital gift card and share via WhatsApp."}
          </p>
        </div>
      </section>

      <div className={`${siteContainer} mx-auto max-w-lg space-y-6 pb-20`}>
        <div className="flex flex-wrap gap-2">
          {AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmount(a)}
              className={
                amount === a
                  ? "rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300"
              }
            >
              {a} {ar ? "ر.س" : "SAR"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {DESIGNS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDesign(d.id)}
              className={
                design === d.id
                  ? "rounded-xl border border-violet-400/50 bg-violet-500/15 py-3 text-sm font-medium text-white"
                  : "rounded-xl border border-white/10 py-3 text-sm text-slate-400"
              }
            >
              {ar ? d.ar : d.en}
            </button>
          ))}
        </div>

        {!result ? (
          <div className="space-y-3 rounded-2xl border border-white/10 p-5">
            <input
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
              placeholder={ar ? "اسم المهدى إليه" : "Recipient name"}
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
            <input
              type="tel"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
              placeholder={ar ? "جوال المهدى إليه" : "Recipient phone"}
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
            />
            <textarea
              rows={2}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white"
              placeholder={ar ? "رسالة شخصية" : "Personal message"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => void purchase()}
              className="w-full rounded-2xl bg-gradient-to-l from-violet-600 to-cyan-500 py-3.5 font-bold text-white disabled:opacity-50"
            >
              {loading ? "…" : ar ? "شراء وإرسال" : "Purchase & share"}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-100">
            <p className="font-semibold">{ar ? "تم إنشاء البطاقة" : "Gift card created"}</p>
            <p className="mt-2 font-mono text-lg">{result.code}</p>
            {result.whatsappUrl ? (
              <a
                href={result.whatsappUrl}
                target="_blank"
                rel="noopener"
                className="mt-4 inline-block rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white"
              >
                {ar ? "إرسال عبر واتساب" : "Send via WhatsApp"}
              </a>
            ) : null}
          </div>
        )}

        <p className="text-center text-sm text-slate-500">
          <Link href={localizedPath(loc, "/activities")} className="text-cyan-400 hover:underline">
            {ar ? "استكشف الأنشطة" : "Explore activities"}
          </Link>
        </p>
      </div>
    </div>
  );
}
