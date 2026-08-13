import type { Metadata } from "next";
import { Outfit, Tajawal } from "next/font/google";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { DeferredClientWidgets } from "@/components/layout/DeferredClientWidgets";
import { LocaleAttributes } from "@/components/providers/LocaleAttributes";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { ScrollToTopOnNavigate } from "@/components/providers/ScrollToTopOnNavigate";
import { BookingModalProvider } from "@/components/providers/BookingModalProvider";
import { getSiteContent } from "@/services/contentService";
import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";
import { siteIconMetadata } from "@/lib/site-icons";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  variable: "--font-tajawal",
  weight: ["400", "500", "700"],
  preload: false,
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
  preload: false,
  display: "swap",
});

// CMS pages — ISR via layout revalidate; API responses cached per request + 60s data cache.
export const revalidate = 60;
export const dynamicParams = true;

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
    icons: siteIconMetadata(dict.settings?.favicon, dict.settings?.logo),
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
        <ScrollToTopOnNavigate />
        <BookingModalProvider locale={locale} labels={dict.inquiryForm}>
          <div
            className={`${locale === "ar" ? tajawal.variable : outfit.variable} ${fontClass} flex min-h-screen min-w-0 flex-col overflow-x-clip`}
          >
            <Header locale={locale} nav={dict.nav} settings={dict.settings} />
            <main className="flex-1 min-w-0 overflow-x-clip pb-[5.5rem] sm:pb-[4.5rem]">{children}</main>
            <Footer
              locale={locale}
              footer={dict.footer}
              nav={dict.nav}
              settings={dict.settings}
            />
            <DeferredClientWidgets
              locale={locale}
              inquiryFab={dict.inquiryFab}
              whatsapp={dict.settings?.whatsapp}
            />
          </div>
        </BookingModalProvider>
      </SmoothScrollProvider>
    </LocaleAttributes>
  );
}
