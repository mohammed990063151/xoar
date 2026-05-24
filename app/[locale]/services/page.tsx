<<<<<<< HEAD
import { ServicesPageView } from "@/components/services/ServicesPageView";
import { getDictionary } from "@/lib/dictionary";
=======
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { getSiteContent } from "@/services/contentService";
import { siteContainer } from "@/lib/layout";
>>>>>>> 1adedd39babb7eb012618a5692b6bca1a59642a3
import { isLocale } from "@/lib/i18n";
import { getServicesPageContent } from "@/lib/site-page";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();

  const [content, dict] = await Promise.all([
    getServicesPageContent(loc),
    Promise.resolve(getDictionary(loc)),
  ]);

  return (
    <ServicesPageView locale={loc} content={content} contactCta={dict.nav.cta} />
  const dict = await getSiteContent(loc);
  const p = dict.pages.services;

  return (
    <div className={`${siteContainer} py-16`}>
      <ScrollReveal>
        <h1 className="text-4xl font-bold">{p.title}</h1>
        <p className="mt-4 max-w-2xl text-slate-300">{p.intro}</p>
      </ScrollReveal>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {p.items.map((item) => (
          <ScrollReveal key={item.title}>
            <article className="gradient-border h-full">
              <div className="inner h-full p-6">
                <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                <p className="mt-3 text-slate-400">{item.body}</p>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
