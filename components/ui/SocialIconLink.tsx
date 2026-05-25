import type { SiteSettings } from "@/services/contentService";

type SocialKey = "instagram" | "x" | "linkedin" | "facebook" | "youtube" | "tiktok" | "snapchat";

const SOCIAL_ORDER: readonly SocialKey[] = [
  "instagram",
  "x",
  "linkedin",
  "facebook",
  "youtube",
  "tiktok",
  "snapchat",
];

const labels: Record<SocialKey, string> = {
  instagram: "Instagram",
  x: "X",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  snapchat: "Snapchat",
};

function IconInstagram(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.43.403a4.92 4.92 0 0 1 1.77 1.153 4.92 4.92 0 0 1 1.153 1.77c.163.46.349 1.26.403 2.43.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.43a4.92 4.92 0 0 1-1.153 1.77 4.92 4.92 0 0 1-1.77 1.153c-.46.163-1.26.349-2.43.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.43-.403a4.92 4.92 0 0 1-1.77-1.153 4.92 4.92 0 0 1-1.153-1.77c-.163-.46-.349-1.26-.403-2.43C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.43a4.92 4.92 0 0 1 1.153-1.77 4.92 4.92 0 0 1 1.77-1.153c.46-.163 1.26-.349 2.43-.403C8.416 2.175 8.796 2.163 12 2.163zm0 1.622c-3.16 0-3.527.012-4.769.068-1.028.047-1.585.218-1.955.363-.492.192-.843.42-1.212.79-.37.368-.598.72-.79 1.212-.145.37-.316.927-.363 1.955-.056 1.242-.068 1.609-.068 4.769s.012 3.527.068 4.769c.047 1.028.218 1.585.363 1.955.192.492.42.843.79 1.212.368.37.72.598 1.212.79.37.145.927.316 1.955.363 1.242.056 1.609.068 4.769.068s3.527-.012 4.769-.068c1.028-.047 1.585-.218 1.955-.363.492-.192.843-.42 1.212-.79.37-.368.598-.72.79-1.212.145-.37.316-.927.363-1.955.056-1.242.068-1.609.068-4.769s-.012-3.527-.068-4.769c-.047-1.028-.218-1.585-.363-1.955-.192-.492-.42-.843-.79-1.212-.368-.37-.72-.598-1.212-.79-.37-.145-.927-.316-1.955-.363-1.242-.056-1.609-.068-4.769-.068zm0 3.351a5.864 5.864 0 1 1 0 11.728 5.864 5.864 0 0 1 0-11.728zm0 1.622a4.242 4.242 0 1 0 0 8.484 4.242 4.242 0 0 0 0-8.484zm6.406-4.845a1.44 1.44 0 1 1-2.881 0 1.44 1.44 0 0 1 2.881 0z" />
    </svg>
  );
}

function IconX(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconLinkedIn(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 4.126 0 2.062 2.062 0 0 1-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconFacebook(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function IconYouTube(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function IconTikTok(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v7.15c0 3.67-2.8 7.41-7.07 7.41-3.29 0-6.04-2.69-6.04-6.22 0-3.39 2.76-6.15 6.15-6.15 1.04 0 2 .27 2.85.75v4.34c-.31-.1-.64-.16-.98-.16-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5c1.97 0 3.57-1.6 3.57-3.57V.02h3.91z" />
    </svg>
  );
}

function IconSnapchat(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.336-.186.536-.186.16 0 .315.06.435.18.293.293.627.91.919 1.527.209.42.395.84.519 1.168.09.24.135.435.12.555-.03.24-.24.405-.6.465-.24.045-.54.06-.87.045-.36-.015-.78-.075-1.23-.18-.24-.06-.48-.135-.72-.21l-.15-.045c-.06 1.44-.54 2.76-1.35 3.78-.96 1.2-2.25 1.875-3.75 1.875-.24 0-.48-.015-.72-.045-1.5 0-2.79-.675-3.75-1.875-.81-1.02-1.29-2.34-1.35-3.78l-.15.045c-.24.075-.48.15-.72.21-.45.105-.87.165-1.23.18-.33.015-.63 0-.87-.045-.36-.06-.57-.225-.6-.465-.015-.12.03-.315.12-.555.124-.328.31-.748.519-1.168.292-.617.626-1.234.919-1.527.12-.12.275-.18.435-.18.2 0 .371.098.536.186.374.181.733.285 1.033.301.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.853 1.069 11.216.793 12.206.793z" />
    </svg>
  );
}

const icons: Record<SocialKey, () => React.ReactElement> = {
  instagram: IconInstagram,
  x: IconX,
  linkedin: IconLinkedIn,
  facebook: IconFacebook,
  youtube: IconYouTube,
  tiktok: IconTikTok,
  snapchat: IconSnapchat,
};

function normalizeSocialRecord(social?: SiteSettings["social"]): Record<string, string> {
  if (!social || typeof social !== "object") return {};

  const out: Record<string, string> = {};
  for (const [rawKey, rawValue] of Object.entries(social)) {
    if (typeof rawValue !== "string") continue;
    const href = rawValue.trim();
    if (!href) continue;
    const key = rawKey.replace(/^social\./, "").toLowerCase();
    if (key === "twitter") {
      out.x = href;
      continue;
    }
    out[key] = href;
  }
  return out;
}

export const FOOTER_SOCIAL_PLATFORMS: readonly SocialKey[] = [
  "instagram",
  "x",
  "facebook",
  "snapchat",
];

const platformStyles: Partial<Record<SocialKey, string>> = {
  instagram:
    "border-pink-500/30 bg-gradient-to-br from-purple-600/25 via-pink-500/20 to-orange-400/20 text-pink-200 hover:border-pink-400/60 hover:text-white",
  x: "border-slate-400/30 bg-slate-800/60 text-slate-100 hover:border-white/40 hover:bg-slate-700/80",
  facebook: "border-blue-500/35 bg-blue-600/15 text-blue-200 hover:border-blue-400/60 hover:bg-blue-600/30 hover:text-white",
  snapchat:
    "border-yellow-400/35 bg-yellow-500/10 text-yellow-200 hover:border-yellow-300/60 hover:bg-yellow-500/20 hover:text-yellow-50",
};

export function getSocialLinks(social?: SiteSettings["social"]): { key: SocialKey; href: string; label: string }[] {
  const normalized = normalizeSocialRecord(social);

  return SOCIAL_ORDER.filter((key) => Boolean(normalized[key])).map((key) => ({
    key,
    href: normalized[key]!,
    label: labels[key],
  }));
}

export function getFooterSocialLinks(
  cmsSocial?: SiteSettings["social"],
  fallbacks?: Partial<Record<SocialKey, string>>,
): { key: SocialKey; href: string; label: string; active: boolean }[] {
  const normalized = normalizeSocialRecord(cmsSocial);

  return FOOTER_SOCIAL_PLATFORMS.map((key) => {
    const href = (normalized[key] || fallbacks?.[key]?.trim() || "").trim();
    return {
      key,
      href,
      label: labels[key],
      active: href.length > 0 && href !== "#",
    };
  });
}

interface SocialIconLinkProps {
  readonly href?: string;
  readonly label: string;
  readonly icon: SocialKey;
  readonly className?: string;
  readonly inactive?: boolean;
}

export function SocialIconLink({
  href,
  label,
  icon,
  className,
  inactive = false,
}: SocialIconLinkProps): React.ReactElement {
  const Icon = icons[icon];
  const baseClass =
    "flex h-11 w-11 items-center justify-center rounded-xl border transition duration-200";
  const platformClass = platformStyles[icon] ?? "border-white/15 bg-white/5 text-slate-300 hover:border-violet-400/50 hover:bg-violet-500/15 hover:text-white";
  const mergedClass = className ?? `${baseClass} ${platformClass}`;

  if (inactive || !href) {
    return (
      <span
        className={`${mergedClass} cursor-default opacity-40`}
        aria-label={label}
        title={label}
      >
        <Icon />
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={mergedClass}
    >
      <Icon />
    </a>
  );
}
