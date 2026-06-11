"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { isStorageImage } from "@/lib/image-url";
import { cn } from "@/lib/cn";
import { sectionHeading, siteContainer } from "@/lib/layout";
import type { AboutTeamSection as AboutTeamSectionData } from "@/lib/site-page";
import type { Locale } from "@/lib/i18n";

interface AboutTeamSectionProps {
  readonly locale: Locale;
  readonly team: AboutTeamSectionData;
}

function teamGridClass(count: number): string {
  if (count === 1) {
    return "grid-cols-1 max-w-sm mx-auto";
  }
  if (count === 2) {
    return "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto";
  }
  if (count === 3) {
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  }

  return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
}

function TeamMemberCard({
  member,
  index,
  locale,
  reduceMotion,
  featured,
}: {
  readonly member: AboutTeamSectionData["members"][number];
  readonly index: number;
  readonly locale: Locale;
  readonly reduceMotion: boolean | null;
  readonly featured: boolean;
}): React.ReactElement {
  const ar = locale === "ar";

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
      <div className="gradient-border h-full transition duration-500 group-hover:shadow-[0_24px_60px_rgba(59,130,246,0.18)]">
        <div className="inner overflow-hidden p-0">
          <div
            className={cn(
              "relative w-full overflow-hidden bg-slate-900",
              featured ? "aspect-[4/5] sm:aspect-[3/4]" : "aspect-[3/4]",
            )}
          >
            <motion.div
              className="absolute inset-0"
              whileHover={reduceMotion ? undefined : { scale: 1.05 }}
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
                quality={95}
                priority={index < 2}
                unoptimized={isStorageImage(member.image)}
              />
            </motion.div>

            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.22),transparent_60%)] opacity-0 transition duration-500 group-hover:opacity-100"
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
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function AboutTeamSection({
  locale,
  team,
}: AboutTeamSectionProps): React.ReactElement | null {
  const reduceMotion = useReducedMotion();
  const members = team.members.filter((m) => m.name.trim() && m.image.trim());

  if (members.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-white/[0.02] py-12 sm:py-16 lg:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_0%,rgba(59,130,246,0.12),transparent),radial-gradient(ellipse_60%_45%_at_90%_80%,rgba(168,85,247,0.1),transparent)]"
        aria-hidden
      />

      <div className={cn(siteContainer, "relative")}>
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400/90">
            {team.eyebrow}
          </p>
          <h2 className={`mt-3 ${sectionHeading}`}>{team.title}</h2>
          {team.subtitle ? (
            <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:mt-4 sm:text-base">
              {team.subtitle}
            </p>
          ) : null}
        </motion.div>

        <div
          className={cn(
            "mt-8 grid gap-4 sm:mt-12 sm:gap-5 lg:gap-6",
            teamGridClass(members.length),
          )}
        >
          {members.map((member, index) => (
            <TeamMemberCard
              key={`${member.image}-${member.name}-${index}`}
              member={member}
              index={index}
              locale={locale}
              reduceMotion={reduceMotion}
              featured={members.length <= 2 || index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
