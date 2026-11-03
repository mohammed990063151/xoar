"use client";

import { useState } from "react";
import Link from "next/link";
import { customerService } from "@/services/customerService";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";

interface AccountResetPasswordFormProps {
  readonly locale: Locale;
  readonly token: string;
  readonly email: string;
}

export function AccountResetPasswordForm({
  locale,
  token,
  email,
}: AccountResetPasswordFormProps): React.ReactElement {
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
      const message = await customerService.resetPassword({
        token,
        email: String(fd.get("email") || email),
        password: String(fd.get("password")),
        password_confirmation: String(fd.get("password_confirmation")),
        locale,
      });
      setSuccess(message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : ar
            ? "تعذّر تحديث كلمة المرور"
            : "Could not reset password",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-6 text-center text-sm text-red-200">
        {ar ? "رابط إعادة التعيين غير صالح." : "Invalid reset link."}
        <div className="mt-4">
          <Link href={localizedPath(locale, "/account/forgot-password")} className="text-cyan-300">
            {ar ? "طلب رابط جديد" : "Request a new link"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="gradient-border">
        <form className="inner space-y-4 p-6 sm:p-8" onSubmit={(e) => void handleSubmit(e)}>
          <p className="text-center text-sm text-slate-400">
            {ar
              ? "اختر كلمة مرور جديدة (8 أحرف على الأقل مع حرف ورقم)."
              : "Choose a new password (at least 8 characters with a letter and a number)."}
          </p>

          <input
            name="email"
            type="email"
            required
            defaultValue={email}
            autoComplete="email"
            placeholder={ar ? "البريد الإلكتروني" : "Email"}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
          />
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder={ar ? "كلمة المرور الجديدة" : "New password"}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
          />
          <input
            name="password_confirmation"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder={ar ? "تأكيد كلمة المرور" : "Confirm password"}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
          />

          {error ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          {success ? (
            <div
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100"
              role="status"
            >
              <p>{success}</p>
              <Link
                href={localizedPath(locale, "/account/login")}
                className="mt-2 inline-block font-semibold text-cyan-300"
              >
                {ar ? "تسجيل الدخول" : "Sign in"}
              </Link>
            </div>
          ) : null}

          {!success ? (
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-l from-violet-600 to-cyan-500 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading
                ? ar
                  ? "جاري الحفظ..."
                  : "Saving..."
                : ar
                  ? "حفظ كلمة المرور"
                  : "Save password"}
            </button>
          ) : null}
        </form>
      </div>
    </div>
  );
}
