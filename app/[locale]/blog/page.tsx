import { BlogPageView } from "@/components/blog/BlogPageView";
import { isLocale } from "@/lib/i18n";
import { getBlogPageContent } from "@/lib/site-page";
import { notFound } from "next/navigation";

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
