"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useUnoptimizedImage } from "@/lib/image-url";
import { cn } from "@/lib/cn";
import { siteContainer } from "@/lib/layout";
import { useDocumentTheme } from "@/hooks/useDocumentTheme";
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

/** Soft outer glow + bright edge ring per card (visible on light backgrounds). */
const CARD_EDGE_GLOW = [
  {
    outer: "bg-cyan-400",
    ring: "from-cyan-300 via-sky-400 to-blue-500",
    shadow: "0 6px 22px rgba(6,182,212,0.2)",
    hoverShadow: "0 12px 36px rgba(6,182,212,0.38), 0 0 0 1px rgba(34,211,238,0.3)",
  },
  {
    outer: "bg-violet-500",
    ring: "from-violet-300 via-fuchsia-400 to-purple-500",
    shadow: "0 6px 22px rgba(139,92,246,0.2)",
    hoverShadow: "0 12px 36px rgba(139,92,246,0.4), 0 0 0 1px rgba(167,139,250,0.3)",
  },
  {
    outer: "bg-emerald-400",
    ring: "from-emerald-300 via-teal-400 to-cyan-500",
    shadow: "0 6px 22px rgba(16,185,129,0.2)",
    hoverShadow: "0 12px 36px rgba(16,185,129,0.38), 0 0 0 1px rgba(52,211,153,0.3)",
  },
  {
    outer: "bg-amber-400",
    ring: "from-amber-300 via-orange-400 to-rose-400",
    shadow: "0 6px 22px rgba(245,158,11,0.2)",
    hoverShadow: "0 12px 36px rgba(245,158,11,0.4), 0 0 0 1px rgba(251,191,36,0.3)",
  },
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
  light,
}: {
  readonly member: AboutTeamSectionData["members"][number];
  readonly index: number;
  readonly reduceMotion: boolean | null;
  readonly accentIndex: number;
  readonly light: boolean;
}): React.ReactElement {
  const accentLine = ACCENT_LINES[accentIndex % ACCENT_LINES.length];
  const edgeGlow = CARD_EDGE_GLOW[accentIndex % CARD_EDGE_GLOW.length];
  const hasDescription = member.description.trim().length > 0;

  return (
    <motion.article
      className="about-team-card group relative"
      initial={reduceMotion ? false : { opacity: 0, y: 32 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.25 } }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        delay: index * 0.07,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Soft ambient glow — mild by default, a bit stronger on hover */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-1.5 rounded-[1.6rem] blur-lg transition-all duration-300 ease-out",
          edgeGlow.outer,
          light
            ? "opacity-25 scale-100 group-hover:opacity-55 group-hover:scale-105 group-hover:-inset-2.5 group-hover:blur-xl"
            : "opacity-15 group-hover:opacity-35",
        )}
        aria-hidden
      />
      {/* Extra bloom only on hover (kept subtle) */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-3 rounded-[1.85rem] blur-2xl transition-opacity duration-300 ease-out",
          edgeGlow.outer,
          light
            ? "opacity-0 group-hover:opacity-40"
            : "opacity-0 group-hover:opacity-25",
        )}
        aria-hidden
      />
      {/* Colored rim — slightly brighter on hover */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-[1.3rem] bg-gradient-to-br transition-all duration-300",
          edgeGlow.ring,
          light
            ? "opacity-55 group-hover:opacity-85 group-hover:-inset-[2px]"
            : "opacity-40 group-hover:opacity-70",
        )}
        aria-hidden
      />

      <div
        className="about-team-card-surface gradient-border relative overflow-hidden transition-[box-shadow] duration-300"
        style={
          {
            ["--team-card-shadow" as string]: edgeGlow.shadow,
            ["--team-card-shadow-hover" as string]: edgeGlow.hoverShadow,
            boxShadow: light ? edgeGlow.shadow : undefined,
          } as React.CSSProperties
        }
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
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"
              aria-hidden
            />
            {light ? (
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_20%,rgba(255,255,255,0.22),transparent_65%)]"
                aria-hidden
              />
            ) : null}

            <div
              className={cn(
                "absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-90",
                accentLine,
              )}
              aria-hidden
            />

            {/* Keep light text on photo — avoid text-white (flipped in light theme). */}
            <div className="about-team-overlay absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: "#67e8f9" }}
              >
                {member.role}
              </p>
              <h3
                className="mt-1.5 text-xl font-bold leading-tight sm:text-[1.35rem]"
                style={{ color: "#ffffff" }}
              >
                {member.name}
              </h3>
            </div>
          </div>

          {hasDescription ? (
            <div
              className="border-t px-4 py-4 sm:px-5 sm:py-5"
              style={{
                borderColor: light ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.05)",
                backgroundColor: light ? "#ffffff" : "transparent",
              }}
            >
              <p
                className="line-clamp-3 text-sm leading-relaxed"
                style={{ color: light ? "#334155" : "#94a3b8" }}
              >
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
  const light = useDocumentTheme() === "light";
  const members = team.members.filter((m) => m.name.trim() && m.image.trim());
  const ar = locale === "ar";

  if (members.length === 0) return null;

  const sectionTitle = team.title.trim() || (ar ? "فريقنا" : "Our team");
  const sectionSubtitle =
    team.subtitle.trim() ||
    (ar
      ? "فريق متخصص يحوّل كل فكرة إلى تجربة حية لا تُنسى."
      : "A dedicated team turning every idea into an unforgettable live experience.");
  const sectionEyebrow =
    team.eyebrow.trim() || (ar ? "الوجوه خلف زورا" : "The people behind Xora");

  return (
    <section
      className="about-team-section relative overflow-hidden border-y py-12 sm:py-16 lg:py-20"
      style={{
        borderColor: light ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.05)",
        backgroundColor: light ? "#f8fafc" : "rgba(255,255,255,0.02)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: light
            ? "radial-gradient(ellipse 70% 50% at 20% 0%, rgba(59,130,246,0.08), transparent), radial-gradient(ellipse 60% 45% at 90% 80%, rgba(168,85,247,0.07), transparent)"
            : "radial-gradient(ellipse 70% 50% at 20% 0%, rgba(59,130,246,0.1), transparent), radial-gradient(ellipse 60% 45% at 90% 80%, rgba(168,85,247,0.08), transparent)",
        }}
        aria-hidden
      />

      <div className={cn(siteContainer, "relative z-[1]")}>
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-xs sm:tracking-[0.24em]"
            style={{ color: light ? "#0891b2" : "rgba(34,211,238,0.9)" }}
          >
            {sectionEyebrow}
          </p>
          <h2
            className="mt-3 text-[clamp(1.25rem,4vw,1.875rem)] font-bold tracking-tight sm:text-3xl"
            style={{ color: light ? "#0f172a" : "#ffffff" }}
          >
            {sectionTitle}
          </h2>
          <p
            className="mt-3 text-sm leading-relaxed sm:mt-4 sm:text-base"
            style={{ color: light ? "#475569" : "#94a3b8" }}
          >
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
              light={light}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
