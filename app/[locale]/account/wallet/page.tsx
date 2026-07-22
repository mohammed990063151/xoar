"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CustomerSpace } from "@/components/account/CustomerSpace";
import { customerService } from "@/services/customerService";
import type { CustomerWallet } from "@/types/customer";
import type { Locale } from "@/lib/i18n";
import { useParams } from "next/navigation";

export default function AccountWalletPage(): React.ReactElement {
  const params = useParams();
  const locale = (params?.locale === "en" ? "en" : "ar") as Locale;
  const ar = locale === "ar";
  const reduceMotion = useReducedMotion();
  const [wallet, setWallet] = useState<CustomerWallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void customerService
      .wallet()
      .then(setWallet)
      .finally(() => setLoading(false));
  }, []);

  return (
    <CustomerSpace locale={locale}>
      <motion.div
        className="relative overflow-hidden rounded-[2rem] border border-emerald-400/25 bg-gradient-to-br from-emerald-950/50 via-[#081526] to-[#071220] p-6 sm:p-8"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
          {ar ? "الرصيد" : "Balance"}
        </p>
        <p className="mt-3 text-4xl font-extrabold text-white sm:text-5xl">
          {loading ? "…" : `${wallet?.balanceSar ?? 0}`}
          <span className="ms-2 text-lg font-medium text-emerald-200/80">
            {ar ? "ر.س" : "SAR"}
          </span>
        </p>
      </motion.div>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-bold text-white">
          {ar ? "الحركات الأخيرة" : "Recent activity"}
        </h2>
        {!wallet?.transactions?.length ? (
          <p className="text-sm text-slate-500">{ar ? "لا حركات بعد." : "No transactions yet."}</p>
        ) : (
          <ul className="space-y-2">
            {wallet.transactions.map((tx, i) => (
              <li
                key={`${tx.created_at}-${i}`}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#081526]/80 px-4 py-3 text-sm"
              >
                <span className="text-slate-300">{tx.description || tx.type}</span>
                <span
                  className={
                    Number(tx.amount_sar) >= 0 ? "font-semibold text-emerald-300" : "text-rose-300"
                  }
                >
                  {Number(tx.amount_sar) > 0 ? "+" : ""}
                  {tx.amount_sar}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </CustomerSpace>
  );
}
