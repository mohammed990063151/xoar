"use client";

import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { useUnoptimizedImage } from "@/lib/image-url";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import type { BlogPostItem } from "@/lib/site-page";
import { pageBottom, pageTitle, siteContainerNarrow } from "@/lib/layout";

interface BlogPostViewProps {
  readonly locale: Locale;
  readonly post: BlogPostItem;
  readonly backLabel: string;
  readonly blogTitle: string;
}

export function BlogPostView({
  locale,
  post,
  backLabel,
  blogTitle,
}: BlogPostViewProps): React.ReactElement {
  const paragraphs = post.body.split(/\n+/).filter(Boolean);

  return (
    <article className={`${siteContainerNarrow} ${pageBottom} py-10 sm:py-14 lg:py-16`}>
      <ScrollReveal>
        <Link
          href={localizedPath(locale, "/blog")}
          className="text-sm text-violet-300 transition hover:text-violet-200 hover:underline"
        >
          ← {backLabel}
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-violet-400/90">
          {post.sectionLabel}
        </p>
        <h1 className={`mt-3 ${pageTitle}`}>{post.title}</h1>
        {post.publishedAt ? (
          <p className="mt-3 text-sm text-slate-400">{post.publishedAt}</p>
        ) : null}
      </ScrollReveal>

      {post.image ? (
        <ScrollReveal>
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
            <Image
              src={post.image}
              alt=""
              fill
              unoptimized={useUnoptimizedImage(post.image)}
              className="object-cover"
              sizes="(max-width:768px) 100vw, 48rem"
              priority
            />
          </div>
        </ScrollReveal>
      ) : null}

      <ScrollReveal>
        <div className="prose prose-invert mt-8 max-w-none space-y-4 text-base leading-relaxed text-slate-300 sm:mt-10">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph) => <p key={paragraph.slice(0, 40)}>{paragraph}</p>)
          ) : post.excerpt ? (
            <p>{post.excerpt}</p>
          ) : null}
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="mt-10 border-t border-white/10 pt-8">
          <Link
            href={localizedPath(locale, `/blog#${post.section === "articles" ? "blog-articles" : "blog-news"}`)}
            className="text-sm text-violet-300 hover:underline"
          >
            ← {blogTitle}
          </Link>
        </div>
      </ScrollReveal>
    </article>
  );
}
