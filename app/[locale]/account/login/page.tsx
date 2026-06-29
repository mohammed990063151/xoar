import { AccountLoginForm } from "@/components/account/AccountLoginForm";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function AccountLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ returnTo?: string; mode?: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  const { returnTo, mode } = await searchParams;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;
  const initialMode = mode === "register" ? "register" : "login";

  return (
    <section className="py-12">
      <h1 className="mb-8 text-center text-2xl font-bold text-white">
        {locale === "ar" ? "حسابي في إكزورا" : "My Xoar account"}
      </h1>
      <AccountLoginForm locale={locale} returnTo={returnTo} initialMode={initialMode} />
    </section>
  );
}
