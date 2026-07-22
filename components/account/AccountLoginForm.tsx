"use client";

import { useEffect, useState } from "react";
import { customerService } from "@/services/customerService";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";

interface AccountLoginFormProps {
  readonly locale: Locale;
  readonly returnTo?: string;
  readonly initialMode?: "login" | "register";
}

function safeReturnPath(value?: string): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  return value;
}

export function AccountLoginForm({
  locale,
  returnTo,
  initialMode = "login",
}: AccountLoginFormProps): React.ReactElement {
  const ar = locale === "ar";
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      if (mode === "login") {
        await customerService.login(
          String(fd.get("email")),
          String(fd.get("password")),
          locale,
        );
      } else {
        await customerService.register({
          name: String(fd.get("name")),
          email: String(fd.get("email")),
          phone: String(fd.get("phone") || ""),
          password: String(fd.get("password")),
          password_confirmation: String(fd.get("password_confirmation")),
          locale,
        });
      }
      const next = safeReturnPath(returnTo) ?? localizedPath(locale, "/account");
      window.location.assign(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : ar ? "تعذّر تسجيل الدخول" : "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="gradient-border">
        <form className="inner space-y-4 p-6 sm:p-8" onSubmit={(e) => void handleSubmit(e)}>
          <p className="text-center text-sm text-slate-400">
            {returnTo
              ? ar
                ? "سجّل دخولك أو أنشئ حساباً للعودة وإكمال الحجز"
                : "Sign in or register to return and complete your booking"
              : ar
                ? "سجّل دخولك لمتابعة حجوزاتك وتذاكرك الرقمية"
                : "Sign in to manage bookings and digital passes"}
          </p>

          {mode === "register" ? (
            <input
              name="name"
              required
              placeholder={ar ? "الاسم" : "Name"}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
            />
          ) : null}

          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={ar ? "البريد الإلكتروني" : "Email"}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
          />

          {mode === "register" ? (
            <input
              name="phone"
              type="tel"
              placeholder={ar ? "رقم الجوال" : "Phone"}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
            />
          ) : null}

          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={ar ? "كلمة المرور" : "Password"}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
          />

          {mode === "register" ? (
            <>
              <p className="text-[11px] leading-relaxed text-slate-500">
                {ar
                  ? "كلمة المرور: 8 أحرف على الأقل، حرف واحد ورقم واحد على الأقل."
                  : "Password: at least 8 characters, including one letter and one number."}
              </p>
              <input
                name="password_confirmation"
                type="password"
                required
                minLength={8}
                placeholder={ar ? "تأكيد كلمة المرور" : "Confirm password"}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
              />
            </>
          ) : null}

          {error ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-l from-violet-600 to-cyan-500 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading
              ? ar
                ? "جاري المعالجة..."
                : "Processing..."
              : mode === "login"
                ? ar
                  ? "تسجيل الدخول"
                  : "Sign in"
                : ar
                  ? "إنشاء حساب"
                  : "Create account"}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="w-full text-center text-xs text-slate-500 hover:text-slate-300"
          >
            {mode === "login"
              ? ar
                ? "ليس لديك حساب؟ سجّل الآن"
                : "No account? Register"
              : ar
                ? "لديك حساب؟ سجّل الدخول"
                : "Have an account? Sign in"}
          </button>

          <p className="text-center text-[10px] text-slate-600">
            {ar
              ? "تسجيل Google ووسائل التواصل — قريباً"
              : "Google & social login — coming soon"}
          </p>
        </form>
      </div>
    </div>
  );
}
