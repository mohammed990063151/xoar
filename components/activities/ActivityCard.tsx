"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BookButton } from "@/components/ui/BookButton";
import { cn } from "@/lib/cn";

export interface ActivityCardData {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly image: string;
  readonly organizer: string;
  readonly location: string;
  readonly date: string;
  readonly price: string;
}

interface ActivityCardProps {
  readonly activity: ActivityCardData;
  readonly organizerLabel: string;
  readonly bookCta: string;
  readonly formTitle: string;
  readonly className?: string;
}

function IconPin({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function IconCalendar({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 9h16M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconTicket({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 9a2 2 0 012-2h1v8H6a2 2 0 01-2-2V9Zm14 0V7a2 2 0 00-2-2h-1v12h1a2 2 0 002-2V9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 7v10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  );
}

export function ActivityCard({
  activity,
  organizerLabel,
  bookCta,
  formTitle,
  className,
}: ActivityCardProps): React.ReactElement {
  return (
    <motion.article
      className={cn(
        "overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-950/80 shadow-[0_8px_40px_rgba(0,0,0,0.35)]",
        className,
      )}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative aspect-[5/4] w-full overflow-hidden sm:aspect-[6/5] sm:min-h-[17rem]">
        <Image
          src={activity.image}
          alt={activity.title}
          fill
          className="object-cover"
          sizes="(max-width:640px) 100vw, 32rem"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <p className="text-xs text-slate-500">
          {organizerLabel}{" "}
          <span className="text-slate-400">{activity.organizer}</span>
        </p>

        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl">{activity.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-[0.95rem]">
            {activity.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-white/8 bg-slate-900/90 px-4 py-3 text-xs text-slate-300 sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <IconPin className="shrink-0 text-purple-400" />
            {activity.location}
          </span>
          <span className="text-slate-600" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconCalendar className="shrink-0 text-purple-400" />
            {activity.date}
          </span>
          <span className="text-slate-600" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-200">
            <IconTicket className="shrink-0 text-purple-400" />
            {activity.price}
          </span>
        </div>

        <BookButton
          type="contact"
          source={`activity:${activity.id}`}
          title={`${formTitle} — ${activity.title}`}
          activityId={activity.id}
          className="flex w-full items-center justify-center rounded-full bg-gradient-to-l from-violet-600 via-purple-600 to-cyan-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 sm:py-4 sm:text-base"
        >
          {bookCta}
        </BookButton>
      </div>
    </motion.article>
  );
}
