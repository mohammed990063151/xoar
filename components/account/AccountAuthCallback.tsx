"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { customerService } from "@/services/customerService";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";

interface AccountAuthCallbackProps {
  readonly locale: Locale;
  readonly code?: string;
  readonly error?: string;
  readonly returnTo?: string;
}

function safeReturnPath(value?: string): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  return value;
}

export function AccountAuthCallback({
  locale,
  code,
  error,
  returnTo,
}: AccountAuthCallbackProps): React.ReactElement {
  const ar = locale === "ar";
  const [message, setMessage] = useState(
    error || (ar ? "جاري إكمال تسجيل الدخول..." : "Completing sign-in..."),
  );
  const [failed, setFailed] = useState(Boolean(error));

  useEffect(() => {
    if (error || !code) {
      setFailed(true);
      setMessage(
        error ||
          (ar
            ? "تعذّر إكمال تسجيل الدخول الاجتماعي."
            : "Social sign-in could not be completed."),
      );
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        await customerService.exchangeSocialCode(code, locale);
        if (cancelled) return;
        const next = safeReturnPath(returnTo) ?? localizedPath(locale, "/account");
        window.location.assign(next);
      } catch (err) {
        if (cancelled) return;
        setFailed(true);
        setMessage(
          err instanceof Error
            ? err.message
            : ar
              ? "تعذّر إكمال تسجيل الدخول الاجتماعي."
              : "Social sign-in failed.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ar, code, error, locale, returnTo]);

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-black/40 px-6 py-10 text-center">
      <p className={`text-sm ${failed ? "text-red-200" : "text-slate-300"}`}>{message}</p>
      {failed ? (
        <Link
          href={localizedPath(locale, "/account/login")}
          className="mt-5 inline-block text-sm font-semibold text-cyan-300"
        >
          {ar ? "العودة لتسجيل الدخول" : "Back to sign in"}
        </Link>
      ) : null}
    </div>
  );
}
