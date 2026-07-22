"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CustomerSpace } from "@/components/account/CustomerSpace";
import { customerService } from "@/services/customerService";
import type { CustomerInquiry } from "@/types/customer";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { useParams } from "next/navigation";

export default function AccountInquiriesPage(): React.ReactElement {
  const params = useParams();
  const locale = (params?.locale === "en" ? "en" : "ar") as Locale;
  const ar = locale === "ar";
  const [items, setItems] = useState<CustomerInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void customerService.inquiries().then((list) => {
      setItems(list);
      setLoading(false);
    });
  }, []);

  return (
    <CustomerSpace
      locale={locale}
      compact
      title={ar ? "الاستفسارات" : "Inquiries"}
      subtitle={ar ? "رسائل التواصل وطلبات الخدمات" : "Contact and service requests"}
    >
      {loading ? (
        <p className="text-slate-500">{ar ? "جاري التحميل..." : "Loading..."}</p>
      ) : items.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/15 px-6 py-14 text-center">
          <p className="text-slate-400">
            {ar ? "لا توجد استفسارات بعد." : "No inquiries yet."}
          </p>
          <Link
            href={localizedPath(locale, "/contact")}
            className="mt-4 inline-flex text-sm text-cyan-300 hover:underline"
          >
            {ar ? "تواصل معنا" : "Contact us"}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-2xl border border-white/10 bg-[#081526]/80 px-5 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>{item.type}</span>
                <span>{item.status}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
                {item.message || "—"}
              </p>
              {item.createdAt ? (
                <p className="mt-2 text-[11px] text-slate-600">
                  {new Date(item.createdAt).toLocaleString(ar ? "ar-SA" : "en-US")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </CustomerSpace>
  );
}
