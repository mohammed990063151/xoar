"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CustomerSpace } from "@/components/account/CustomerSpace";
import { customerService } from "@/services/customerService";
import type { CustomerNotification } from "@/types/customer";
import type { Locale } from "@/lib/i18n";
import { useParams } from "next/navigation";

export default function AccountNotificationsPage(): React.ReactElement {
  const params = useParams();
  const locale = (params?.locale === "en" ? "en" : "ar") as Locale;
  const ar = locale === "ar";
  const reduceMotion = useReducedMotion();
  const [items, setItems] = useState<CustomerNotification[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh(): Promise<void> {
    const data = await customerService.notifications();
    setItems(data.items);
  }

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
  }, []);

  async function markRead(id: number): Promise<void> {
    await customerService.markNotificationRead(id);
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
  }

  async function markAll(): Promise<void> {
    await customerService.markAllNotificationsRead();
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? now })));
  }

  return (
    <CustomerSpace locale={locale}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {ar ? "نبضات خفيفة من تجاربّك وحجوزاتك." : "Soft pulses from your experiences and bookings."}
        </p>
        {items.some((n) => !n.readAt) ? (
          <button
            type="button"
            onClick={() => void markAll()}
            className="text-xs font-medium text-cyan-300 hover:text-cyan-100"
          >
            {ar ? "تعليم الكل كمقروء" : "Mark all read"}
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="text-slate-500">{ar ? "جاري التحميل..." : "Loading..."}</p>
      ) : items.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-white/15 px-6 py-16 text-center text-slate-400">
          {ar ? "لا إشعارات بعد." : "No notifications yet."}
        </div>
      ) : (
        <ol className="relative space-y-0 border-s border-white/10 ms-3 sm:ms-4">
          {items.map((n, i) => (
            <motion.li
              key={n.id}
              className="relative ms-6 pb-8 last:pb-0"
              initial={reduceMotion ? false : { opacity: 0, x: ar ? 16 : -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <span
                className={`absolute -start-[1.9rem] top-1.5 h-3 w-3 rounded-full ring-4 ring-[#06101f] ${
                  n.readAt ? "bg-slate-600" : "bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
                }`}
              />
              <button
                type="button"
                onClick={() => void markRead(n.id)}
                className="w-full rounded-2xl border border-white/10 bg-[#081526]/90 p-4 text-start transition hover:border-cyan-400/25"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {n.typeLabel}
                  </span>
                  {!n.readAt ? (
                    <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-200">
                      {ar ? "جديد" : "New"}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 font-semibold text-white">{n.title}</p>
                {n.body ? <p className="mt-1 text-sm text-slate-400">{n.body}</p> : null}
                {n.createdAt ? (
                  <p className="mt-2 text-[11px] text-slate-600">
                    {new Date(n.createdAt).toLocaleString(ar ? "ar-SA" : "en-GB")}
                  </p>
                ) : null}
              </button>
            </motion.li>
          ))}
        </ol>
      )}
    </CustomerSpace>
  );
}
