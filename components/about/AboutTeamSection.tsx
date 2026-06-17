"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useUnoptimizedImage } from "@/lib/image-url";
import { cn } from "@/lib/cn";
import { pageEyebrow, sectionHeading, siteContainer } from "@/lib/layout";
import type { AboutTeamSection as AboutTeamSectionData } from "@/lib/site-page";
import type { Locale } from "@/lib/i18n";
import Image from "next/image";

interface AboutTeamSectionProps {
  readonly locale: Locale;
  readonly team: AboutTeamSectionData;
}

const ACCENT_LINES = [
  "from-cyan-400 to-blue-500",
  "from-violet-400 to-purple-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
];

function teamGridClass(count: number): string {
  if (count === 1) return "grid-cols-1 max-w-md mx-auto";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto";
  if (count <= 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
}

function TeamMemberCard({
  member,
  index,
  reduceMotion,
  accentIndex,
}: {
  readonly member: AboutTeamSectionData["members"][number];
  readonly index: number;
  readonly reduceMotion: boolean | null;
  readonly accentIndex: number;
}): React.ReactElement {
  const accentLine = ACCENT_LINES[accentIndex % ACCENT_LINES.length];
  const hasDescription = member.description.trim().length > 0;

  return (
    <motion.article
      className="group relative"
      initial={reduceMotion ? false : { opacity: 0, y: 32 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        delay: index * 0.07,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div
        className="gradient-border overflow-hidden transition duration-500 group-hover:shadow-[0_24px_60px_rgba(59,130,246,0.14)]"
      >
        <div className="inner p-0">
          <div className="relative aspect-[4/5] overflow-hidden bg-slate-900 sm:aspect-[3/4]">
            <motion.div
              className="absolute inset-0"
              whileHover={reduceMotion ? undefined : { scale: 1.04 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover object-[center_15%]"
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 280px"
                unoptimized={useUnoptimizedImage(member.image)}
              />
            </motion.div>

            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent"
              aria-hidden
            />

            <div
              className={cn(
                "absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-90",
                accentLine,
              )}
              aria-hidden
            />

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300/90">
                {member.role}
              </p>
              <h3 className="mt-1.5 text-xl font-bold leading-tight text-white sm:text-[1.35rem]">
                {member.name}
              </h3>
            </div>
          </div>

          {hasDescription ? (
            <div className="border-t border-white/5 px-4 py-4 sm:px-5 sm:py-5">
              <p className="text-sm leading-relaxed text-slate-400 line-clamp-3">
                {member.description}
              </p>
            </div>
          ) : null}
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
    <section className="relative overflow-hidden border-y border-white/5 bg-white/[0.02] py-12 sm:py-16 lg:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_0%,rgba(59,130,246,0.1),transparent),radial-gradient(ellipse_60%_45%_at_90%_80%,rgba(168,85,247,0.08),transparent)]"
        aria-hidden
      />

      <div className={cn(siteContainer, "relative")}>
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={pageEyebrow}>{sectionEyebrow}</p>
          <h2 className={`mt-3 ${sectionHeading}`}>{sectionTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:mt-4 sm:text-base">
            {sectionSubtitle}
          </p>
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
              reduceMotion={reduceMotion}
              accentIndex={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
