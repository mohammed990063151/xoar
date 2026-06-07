"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountShell } from "@/components/account/AccountShell";
import { customerService, getCustomerToken } from "@/services/customerService";
import type { Customer } from "@/types/customer";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { useParams } from "next/navigation";

const TIER_LABELS: Record<string, { ar: string; en: string }> = {
  silver: { ar: "فضي", en: "Silver" },
  gold: { ar: "ذهبي", en: "Gold" },
  platinum: { ar: "بلاتيني", en: "Platinum" },
};

export default function AccountProfilePage(): React.ReactElement {
  const params = useParams();
  const locale = (params?.locale === "en" ? "en" : "ar") as Locale;
  const router = useRouter();
  const ar = locale === "ar";
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (!getCustomerToken()) {
      router.replace(localizedPath(locale, "/account/login"));
      return;
    }
    customerService.me().then(setCustomer);
  }, [locale, router]);

  const tier = customer?.membershipTier ?? "silver";
  const tierLabel = TIER_LABELS[tier]?.[locale] ?? tier;

  return (
    <AccountShell locale={locale} title={ar ? "إعدادات الملف الشخصي" : "Profile settings"}>
      {!customer ? (
        <p className="text-slate-500">{ar ? "جاري التحميل..." : "Loading..."}</p>
      ) : (
        <div className="max-w-lg space-y-6">
          <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/50 to-slate-950 p-6">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              {ar ? "عضوية Xoar" : "Xoar membership"}
            </p>
            <p className="mt-2 text-2xl font-bold text-violet-200">{tierLabel}</p>
            <p className="mt-1 text-sm text-slate-400">
              {ar
                ? `${customer.bookingsCount} نشاط محجوز`
                : `${customer.bookingsCount} activities booked`}
            </p>
          </div>

          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">{ar ? "الاسم" : "Name"}</dt>
              <dd className="text-white">{customer.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{ar ? "البريد" : "Email"}</dt>
              <dd className="text-white">{customer.email}</dd>
            </div>
            {customer.phone ? (
              <div>
                <dt className="text-slate-500">{ar ? "الجوال" : "Phone"}</dt>
                <dd className="text-white">{customer.phone}</dd>
              </div>
            ) : null}
          </dl>

          <button
            type="button"
            onClick={() => {
              customerService.logout();
              router.push(localizedPath(locale, "/account/login"));
            }}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            {ar ? "تسجيل الخروج" : "Sign out"}
          </button>
        </div>
      )}
    </AccountShell>
  );
}
