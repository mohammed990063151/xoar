import type { Metadata } from "next";
import { Outfit, Tajawal } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LocaleAttributes } from "@/components/providers/LocaleAttributes";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { BookingModalProvider } from "@/components/providers/BookingModalProvider";
import { InquiryFab } from "@/components/ui/InquiryFab";
import { getSiteContent } from "@/services/contentService";
import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  variable: "--font-tajawal",
  weight: ["400", "500", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
});

export async function generateStaticParams(): Promise<{ locale: Locale }[]> {
  return [{ locale: "ar" }, { locale: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  const locale = isLocale(loc) ? loc : "ar";
  const dict = await getSiteContent(locale);
  return {
    title: dict.brand.name,
    description: dict.hero.subtitle,
    alternates: {
      languages: {
        ar: "/ar",
        en: "/en",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const locale = loc;
  const dict = await getSiteContent(locale);

  const fontClass =
    locale === "ar"
      ? "font-[family-name:var(--font-tajawal)]"
      : "font-[family-name:var(--font-outfit)]";

  return (
    <LocaleAttributes locale={locale}>
      <SmoothScrollProvider>
        <BookingModalProvider locale={locale} labels={dict.inquiryForm}>
          <div
            className={`${tajawal.variable} ${outfit.variable} ${fontClass} flex min-h-screen min-w-0 flex-col overflow-x-clip`}
          >
            <Header locale={locale} nav={dict.nav} />
            <main className="flex-1 min-w-0 overflow-x-clip pb-[5.5rem] sm:pb-[4.5rem]">{children}</main>
            <Footer
              locale={locale}
              footer={dict.footer}
              nav={dict.nav}
              settings={dict.settings}
            />
            <InquiryFab
              locale={locale}
              label={dict.inquiryFab.label}
              aria={dict.inquiryFab.aria}
              whatsappAria={dict.inquiryFab.whatsappAria}
              whatsapp={dict.settings?.whatsapp}
            />
          </div>
        </BookingModalProvider>
      </SmoothScrollProvider>
    </LocaleAttributes>
  );
}
