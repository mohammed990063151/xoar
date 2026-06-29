"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useUnoptimizedImage } from "@/lib/image-url";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import type { BlogPageContent, BlogPostItem, BlogSectionKey } from "@/lib/site-page";
import { SocialFeedCarousel } from "@/components/blog/SocialFeedCarousel";
import {
  pageBottom,
  pageEyebrow,
  pageHeroInner,
  pageHeroSection,
  pageIntro,
  pageTitle,
  sectionHeading,
  siteContainer,
} from "@/lib/layout";

interface BlogPageViewProps {
  readonly locale: Locale;
  readonly content: BlogPageContent;
}

const sectionAnchors: Record<BlogSectionKey, string> = {
  news: "blog-news",
  articles: "blog-articles",
};

function postsForSection(posts: readonly BlogPostItem[], section: BlogSectionKey): BlogPostItem[] {
  return posts.filter((post) => post.section === section);
}

function BlogPostCard({
  post,
  index,
  readMore,
  locale,
}: {
  readonly post: BlogPostItem;
  readonly index: number;
  readonly readMore: string;
  readonly locale: Locale;
}): React.ReactElement {
  const reduceMotion = useReducedMotion();
  const href = localizedPath(locale, `/blog/${post.slug}`);

  return (
    <motion.article
      className="gradient-border h-full overflow-hidden"
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={href} className="inner group flex h-full flex-col overflow-hidden p-0 transition hover:bg-white/[0.02]">
        {post.image ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
            <Image
              src={post.image}
              alt=""
              fill
              unoptimized={useUnoptimizedImage(post.image)}
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width:768px) 100vw, 50vw"
            />
            <span className="absolute start-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/50 text-xs font-bold text-white backdrop-blur-sm">
              {index + 1}
            </span>
          </div>
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-slate-900/80">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs font-bold text-white">
              {index + 1}
            </span>
          </div>
        )}

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          {post.publishedAt ? (
            <p className="text-xs font-medium text-violet-300/90">{post.publishedAt}</p>
          ) : null}
          <h3 className="mt-2 text-lg font-bold leading-snug text-white transition group-hover:text-violet-100 sm:text-xl">
            {post.title}
          </h3>
          {post.excerpt ? (
            <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-400">{post.excerpt}</p>
          ) : null}
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-300 transition group-hover:gap-2">
            {readMore}
            <span className="rtl:rotate-180" aria-hidden>
              →
            </span>
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

function BlogSectionBlock({
  sectionKey,
  copy,
  posts,
  noPosts,
  readMore,
  locale,
}: {
  readonly sectionKey: BlogSectionKey;
  readonly copy: { title: string; subtitle: string };
  readonly posts: readonly BlogPostItem[];
  readonly noPosts: string;
  readonly readMore: string;
  readonly locale: Locale;
}): React.ReactElement {
  return (
    <section id={sectionAnchors[sectionKey]} className="scroll-mt-28">
      <div className="mb-8 sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400/90">
          {sectionKey === "news" ? (locale === "ar" ? "القسم الأول" : "Section 1") : locale === "ar" ? "القسم الثاني" : "Section 2"}
        </p>
        <h2 className={`mt-2 ${sectionHeading}`}>{copy.title}</h2>
        {copy.subtitle ? (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-400">{copy.subtitle}</p>
        ) : null}
      </div>

      {posts.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-8 text-center text-slate-500">
          {noPosts}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {posts.map((post, index) => (
            <BlogPostCard
              key={post.slug}
              post={post}
              index={index}
              readMore={readMore}
              locale={locale}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function BlogPageView({ locale, content }: BlogPageViewProps): React.ReactElement {
  const newsPosts = postsForSection(content.posts, "news");
  const articlePosts = postsForSection(content.posts, "articles");

  const jumpLinks: { key: BlogSectionKey; label: string; count: number }[] = [
    { key: "news", label: content.sections.news.title, count: newsPosts.length },
    { key: "articles", label: content.sections.articles.title, count: articlePosts.length },
  ];

  return (
    <div className={pageBottom}>
      <section className={pageHeroSection}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(168,85,247,0.14),transparent)]"
          aria-hidden
        />
        <div className={pageHeroInner}>
          <div className="mx-auto max-w-3xl text-center">
            <p className={pageEyebrow}>{content.eyebrow}</p>
            <h1 className={pageTitle}>{content.title}</h1>
            <p className={pageIntro}>{content.intro}</p>
          </div>

          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2 sm:gap-3">
            {jumpLinks.map(({ key, label, count }) => (
              <a
                key={key}
                href={`#${sectionAnchors[key]}`}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-100 transition hover:border-violet-400/40 hover:bg-violet-500/15",
                )}
              >
                <span>{label}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] tabular-nums text-violet-200/90">
                  {count}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className={`${siteContainer} space-y-16 py-12 sm:space-y-20 sm:py-16 lg:py-20`}>
        <BlogSectionBlock
          sectionKey="news"
          copy={content.sections.news}
          posts={newsPosts}
          noPosts={content.noPosts}
          readMore={content.readMore}
          locale={locale}
        />
        <BlogSectionBlock
          sectionKey="articles"
          copy={content.sections.articles}
          posts={articlePosts}
          noPosts={content.noPosts}
          readMore={content.readMore}
          locale={locale}
        />
      </div>

      <SocialFeedCarousel locale={locale} copy={content.socialFeed} posts={content.socialPosts} />
    </div>
  );
}
