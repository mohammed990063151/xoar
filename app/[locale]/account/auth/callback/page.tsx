import { AccountAuthCallback } from "@/components/account/AccountAuthCallback";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function AccountAuthCallbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string; error?: string; returnTo?: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  const { code, error, returnTo } = await searchParams;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;

  return (
    <section className="py-12">
      <h1 className="mb-8 text-center text-2xl font-bold text-white">
        {locale === "ar" ? "تسجيل الدخول" : "Signing you in"}
      </h1>
      <AccountAuthCallback
        locale={locale}
        code={code}
        error={error}
        returnTo={returnTo}
      />
    </section>
  );
}
