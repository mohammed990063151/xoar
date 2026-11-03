import { AccountResetPasswordForm } from "@/components/account/AccountResetPasswordForm";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function AccountResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string; email?: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  const { token, email } = await searchParams;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;

  return (
    <section className="py-12">
      <h1 className="mb-8 text-center text-2xl font-bold text-white">
        {locale === "ar" ? "تعيين كلمة مرور جديدة" : "Set a new password"}
      </h1>
      <AccountResetPasswordForm
        locale={locale}
        token={token ?? ""}
        email={email ?? ""}
      />
    </section>
  );
}
