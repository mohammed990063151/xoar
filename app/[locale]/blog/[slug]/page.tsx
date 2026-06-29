import { BlogPostView } from "@/components/blog/BlogPostView";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getBlogPageContent, getBlogPostBySlug } from "@/lib/site-page";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc, slug } = await params;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;

  const [post, page] = await Promise.all([
    getBlogPostBySlug(locale, slug),
    getBlogPageContent(locale),
  ]);

  if (!post) notFound();

  return (
    <BlogPostView
      locale={locale}
      post={post}
      backLabel={page.backToBlog}
      blogTitle={page.title}
    />
  );
}
