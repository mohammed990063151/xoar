import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { getDictionary } from "@/lib/dictionary";
import { siteContainer } from "@/lib/layout";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const dict = getDictionary(loc);
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
