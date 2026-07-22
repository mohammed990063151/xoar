"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CustomerSpace } from "@/components/account/CustomerSpace";
import { customerService } from "@/services/customerService";
import type { CustomerReferral } from "@/types/customer";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { useParams } from "next/navigation";

export default function AccountReferralsPage(): React.ReactElement {
  const params = useParams();
  const locale = (params?.locale === "en" ? "en" : "ar") as Locale;
  const ar = locale === "ar";
  const [data, setData] = useState<CustomerReferral | null>(null);

  useEffect(() => {
    void customerService.referral().then(setData);
  }, []);

  return (
    <CustomerSpace
      locale={locale}
      compact
      title={ar ? "الإحالات" : "Referrals"}
      subtitle={
        ar
          ? "ادعُ أصدقاءك واحصل على مكافأة عند أول حجز"
          : "Invite friends and earn when they book"
      }
    >
      {!data ? (
        <p className="text-slate-500">{ar ? "جاري التحميل..." : "Loading..."}</p>
      ) : (
        <div className="mx-auto max-w-lg space-y-5">
          <div className="rounded-[1.5rem] border border-cyan-400/25 bg-cyan-500/10 p-6">
            <p className="text-xs uppercase tracking-wider text-cyan-200/80">
              {ar ? "كود الدعوة" : "Invite code"}
            </p>
            <p className="mt-2 font-mono text-3xl font-bold text-white">{data.code}</p>
            <p className="mt-3 text-sm text-slate-400">
              {ar ? "المكافأة" : "Reward"}: {data.rewardSar ?? 25} {ar ? "ر.س" : "SAR"} ·{" "}
              {data.invitedCount ?? 0} {ar ? "مدعو" : "invited"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {data.whatsappUrl ? (
              <a
                href={data.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                {ar ? "مشاركة واتساب" : "Share on WhatsApp"}
              </a>
            ) : null}
            <Link
              href={localizedPath(locale, "/activities")}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-slate-300"
            >
              {ar ? "استكشف الأنشطة" : "Browse activities"}
            </Link>
          </div>

          <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold text-white">
              {ar ? "كيف تعمل الإحالات؟" : "How referrals work"}
            </h2>
            <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-slate-300">
              <li>
                <span className="font-semibold text-cyan-200/90">1. </span>
                {ar
                  ? "شارك كود الدعوة أو اضغط «مشاركة واتساب» مع أصدقائك."
                  : "Share your invite code or tap WhatsApp share with friends."}
              </li>
              <li>
                <span className="font-semibold text-cyan-200/90">2. </span>
                {ar
                  ? "صديقك يسجّل حساباً جديداً عبر رابطك أو يضع كودك عند التسجيل."
                  : "Your friend creates a new account via your link or enters your code at signup."}
              </li>
              <li>
                <span className="font-semibold text-cyan-200/90">3. </span>
                {ar
                  ? `بعد أول حجز مدفوع لصديقك، تحصل على ${data.rewardSar ?? 25} ر.س في محفظتك.`
                  : `After their first paid booking, you earn ${data.rewardSar ?? 25} SAR in your wallet.`}
              </li>
            </ol>
            <p className="mt-4 border-t border-white/10 pt-3 text-xs text-slate-500">
              {ar
                ? "ملاحظة: التسجيل وحده لا يكفي — المكافأة تُضاف بعد إتمام الدفع للحجز الأول فقط."
                : "Note: Signup alone isn’t enough — the reward is added after their first paid booking only."}
            </p>
          </section>
        </div>
      )}
    </CustomerSpace>
  );
}
