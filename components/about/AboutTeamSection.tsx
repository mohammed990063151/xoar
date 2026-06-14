"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useUnoptimizedImage } from "@/lib/image-url";
import { cn } from "@/lib/cn";
import { sectionHeading, siteContainer } from "@/lib/layout";
import type { AboutTeamSection as AboutTeamSectionData } from "@/lib/site-page";
import type { Locale } from "@/lib/i18n";

interface AboutTeamSectionProps {
  readonly locale: Locale;
  readonly team: AboutTeamSectionData;
  readonly variant?: "default" | "featured";
}

const VALUE_ACCENTS = [
  "from-cyan-500/30 via-blue-600/10 to-transparent",
  "from-violet-500/30 via-purple-600/10 to-transparent",
  "from-emerald-500/25 via-teal-600/10 to-transparent",
  "from-amber-500/25 via-orange-600/10 to-transparent",
];

function teamGridClass(count: number, featured: boolean): string {
  if (featured && count === 1) {
    return "grid-cols-1 max-w-5xl mx-auto";
  }
  if (count === 1) {
    return "grid-cols-1 max-w-sm mx-auto";
  }
  if (count === 2) {
    return "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto";
  }
  if (count === 3) {
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  }

  return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
}

function SpotlightMemberCard({
  member,
  locale,
  reduceMotion,
}: {
  readonly member: AboutTeamSectionData["members"][number];
  readonly locale: Locale;
  readonly reduceMotion: boolean | null;
}): React.ReactElement {
  const ar = locale === "ar";

  return (
    <motion.article
      className="relative"
      initial={reduceMotion ? false : { opacity: 0, y: 48 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12 xl:gap-16">
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          {!reduceMotion ? (
            <motion.div
              className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-cyan-500/30 via-violet-600/25 to-blue-600/20 blur-2xl"
              animate={{ opacity: [0.5, 0.85, 0.55], scale: [0.98, 1.03, 0.99] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            />
          ) : null}

          <div className="gradient-border relative shadow-[0_32px_80px_rgba(59,130,246,0.25)]">
            <div className="inner overflow-hidden p-1.5 sm:p-2">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-slate-900 sm:rounded-[1.5rem]">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover object-[center_12%]"
                  sizes="(max-width: 1024px) 100vw, 480px"
                  priority
                  unoptimized={useUnoptimizedImage(member.image)}
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-[#020617]/20"
                  aria-hidden
                />
                <div className="absolute start-4 top-4 z-10">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-xs font-semibold text-cyan-100 backdrop-blur-md">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                    {ar ? "فريق زورا" : "Xora team"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 text-center lg:text-start">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300">
            {member.role}
          </p>
          <h3 className="text-[clamp(1.75rem,5vw,2.75rem)] font-bold leading-tight text-white">
            {member.name}
          </h3>
          <p className="text-base leading-relaxed text-slate-400 sm:text-lg">
            {member.description.trim() ||
              (ar
                ? "عضو في فريق زورا المتخصص في تصميم وتنفيذ الفعاليات."
                : "A member of the Xora team specialized in designing and executing events.")}
          </p>

          <div className="flex flex-wrap justify-center gap-2 pt-2 lg:justify-start">
            {(ar
              ? ["تخطيط", "تشغيل", "إبداع", "جودة"]
              : ["Planning", "Operations", "Creativity", "Quality"]
            ).map((tag, i) => (
              <span
                key={tag}
                className={cn(
                  "rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300",
                  i === 0 && "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
                  i === 1 && "border-violet-400/30 bg-violet-500/10 text-violet-200",
                  i === 2 && "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
                  i === 3 && "border-amber-400/30 bg-amber-500/10 text-amber-200",
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function TeamMemberCard({
  member,
  index,
  locale,
  reduceMotion,
  featured,
  accentIndex,
}: {
  readonly member: AboutTeamSectionData["members"][number];
  readonly index: number;
  readonly locale: Locale;
  readonly reduceMotion: boolean | null;
  readonly featured: boolean;
  readonly accentIndex: number;
}): React.ReactElement {
  const ar = locale === "ar";
  const accent = VALUE_ACCENTS[accentIndex % VALUE_ACCENTS.length];

  return (
    <motion.article
      className="group relative"
      initial={reduceMotion ? false : { opacity: 0, y: 40 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        delay: index * 0.08,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br opacity-0 blur-xl transition duration-500 group-hover:opacity-100",
          accent,
        )}
        aria-hidden
      />
      <div className="gradient-border relative h-full transition duration-500 group-hover:shadow-[0_24px_60px_rgba(59,130,246,0.22)]">
        <div className="inner overflow-hidden p-0">
          <div
            className={cn(
              "relative w-full overflow-hidden bg-slate-900",
              featured ? "aspect-[4/5] sm:aspect-[3/4]" : "aspect-[3/4]",
            )}
          >
            <motion.div
              className="absolute inset-0"
              whileHover={reduceMotion ? undefined : { scale: 1.06 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover object-[center_12%]"
                sizes={
                  featured
                    ? "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 400px"
                    : "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 280px"
                }
                quality={75}
                priority={index < 2}
                unoptimized={useUnoptimizedImage(member.image)}
              />
            </motion.div>

            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/25 to-transparent"
              aria-hidden
            />
            <div
              className={cn(
                "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60",
                accent,
              )}
              aria-hidden
            />

            <div className="absolute start-3 top-3 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-cyan-100 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                {ar ? "فريق زورا" : "Xora team"}
              </span>
            </div>
          </div>

          <div className="space-y-1 p-4 sm:p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-violet-300/90">
              {member.role}
            </p>
            <h3
              className={cn(
                "font-bold leading-snug text-white",
                featured ? "text-xl sm:text-2xl" : "text-lg",
              )}
            >
              {member.name}
            </h3>
            {member.description.trim() ? (
              <p className="mt-2 text-sm leading-relaxed text-slate-400 line-clamp-3">
                {member.description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function AboutTeamSection({
  locale,
  team,
  variant = "default",
}: AboutTeamSectionProps): React.ReactElement | null {
  const reduceMotion = useReducedMotion();
  const featured = variant === "featured";
  const members = team.members.filter((m) => m.name.trim() && m.image.trim());
  const ar = locale === "ar";

  if (members.length === 0) return null;

  const sectionTitle =
    team.title.trim() ||
    (ar ? "فريقنا" : "Our team");
  const sectionSubtitle =
    team.subtitle.trim() ||
    (ar
      ? "فريق متخصص يحوّل كل فكرة إلى تجربة حية لا تُنسى."
      : "A dedicated team turning every idea into an unforgettable live experience.");
  const sectionEyebrow =
    team.eyebrow.trim() ||
    (ar ? "الوجوه خلف زورا" : "The people behind Xora");

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        featured
          ? "py-14 sm:py-16 lg:py-20"
          : "border-y border-white/5 bg-white/[0.02] py-12 sm:py-16 lg:py-20",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          featured
            ? "bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(124,58,237,0.22),transparent),radial-gradient(ellipse_60%_50%_at_0%_100%,rgba(6,182,212,0.15),transparent),radial-gradient(ellipse_50%_40%_at_100%_50%,rgba(59,130,246,0.12),transparent)]"
            : "bg-[radial-gradient(ellipse_70%_50%_at_20%_0%,rgba(59,130,246,0.12),transparent),radial-gradient(ellipse_60%_45%_at_90%_80%,rgba(168,85,247,0.1),transparent)]",
        )}
        aria-hidden
      />

      <div className={cn(siteContainer, "relative")}>
        <motion.div
          className={cn(
            "mx-auto max-w-2xl text-center",
            featured && members.length === 1 && "mb-10 sm:mb-12",
          )}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400/90">
            {sectionEyebrow}
          </p>
          <h2 className={`mt-3 ${sectionHeading}`}>{sectionTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:mt-4 sm:text-base">
            {sectionSubtitle}
          </p>
        </motion.div>

        {featured && members.length === 1 ? (
          <SpotlightMemberCard
            member={members[0]}
            locale={locale}
            reduceMotion={reduceMotion}
          />
        ) : (
          <div
            className={cn(
              "mt-8 grid gap-4 sm:mt-12 sm:gap-5 lg:gap-6",
              teamGridClass(members.length, featured),
            )}
          >
            {members.map((member, index) => (
              <TeamMemberCard
                key={`${member.image}-${member.name}-${index}`}
                member={member}
                index={index}
                locale={locale}
                reduceMotion={reduceMotion}
                featured={featured || members.length <= 2 || index === 0}
                accentIndex={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
