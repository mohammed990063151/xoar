"use client";

import { useState } from "react";
import Link from "next/link";
import { customerService } from "@/services/customerService";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";

interface AccountForgotPasswordFormProps {
  readonly locale: Locale;
}

export function AccountForgotPasswordForm({
  locale,
}: AccountForgotPasswordFormProps): React.ReactElement {
  const ar = locale === "ar";
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const message = await customerService.forgotPassword(String(fd.get("email")), locale);
      setSuccess(message);
      e.currentTarget.reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : ar
            ? "تعذّر إرسال الرابط"
            : "Could not send reset link",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="gradient-border">
        <form className="inner space-y-4 p-6 sm:p-8" onSubmit={(e) => void handleSubmit(e)}>
          <p className="text-center text-sm text-slate-400">
            {ar
              ? "أدخل بريدك وسنرسل رابط إعادة تعيين كلمة المرور إلى صندوق الوارد."
              : "Enter your email and we will send a password reset link to your inbox."}
          </p>

          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={ar ? "البريد الإلكتروني" : "Email"}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
          />

          {error ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          {success ? (
            <p
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100"
              role="status"
            >
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-l from-violet-600 to-cyan-500 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading
              ? ar
                ? "جاري الإرسال..."
                : "Sending..."
              : ar
                ? "إرسال الرابط إلى البريد"
                : "Send reset link"}
          </button>

          <Link
            href={localizedPath(locale, "/account/login")}
            className="block w-full text-center text-xs text-slate-500 hover:text-slate-300"
          >
            {ar ? "العودة لتسجيل الدخول" : "Back to sign in"}
          </Link>
        </form>
      </div>
    </div>
  );
}
