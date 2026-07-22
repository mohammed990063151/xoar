import type { Metadata } from "next";
import { BlogPageView } from "@/components/blog/BlogPageView";
import { isLocale } from "@/lib/i18n";
import { getBlogPageContent } from "@/lib/site-page";
import { pageMetadata } from "@/lib/seo-service";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) return {};
  return pageMetadata("blog", loc, `/${loc}/blog`);
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();

  const content = await getBlogPageContent(loc);

  return <BlogPageView locale={loc} content={content} />;
}
