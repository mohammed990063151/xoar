import { AccountForgotPasswordForm } from "@/components/account/AccountForgotPasswordForm";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function AccountForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;

  return (
    <section className="py-12">
      <h1 className="mb-8 text-center text-2xl font-bold text-white">
        {locale === "ar" ? "استعادة كلمة المرور" : "Reset your password"}
      </h1>
      <AccountForgotPasswordForm locale={locale} />
    </section>
  );
}
