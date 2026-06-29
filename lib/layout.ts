/** Shared responsive page width — scales on mobile through ultrawide */
export const siteContainer =
  "mx-auto w-full min-w-0 max-w-[min(100%,88rem)] px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:max-w-[min(100%,96rem)]";

export const siteContainerNarrow =
  "mx-auto w-full min-w-0 max-w-[min(100%,48rem)] px-4 sm:px-6 md:px-8";

/** Bottom spacing for inner pages (+ FAB clearance on mobile) */
export const pageBottom = "pb-28 sm:pb-20 lg:pb-24";

export const sectionSpacing = "py-12 sm:py-16 lg:py-20";

export const sectionSpacingTight = "py-10 sm:py-14 lg:py-16";

/** Page hero band (about, services, activities list, …) */
export const pageHeroSection = `relative overflow-hidden border-b border-white/5 ${sectionSpacingTight}`;

export const pageHeroInner = `${siteContainer} relative`;

export const pageHeroCentered = "mx-auto max-w-3xl text-center";

export const pageEyebrow =
  "text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/90 sm:text-xs sm:tracking-[0.24em]";

export const pageTitle =
  "mt-3 text-[clamp(1.5rem,5.5vw,3rem)] font-bold tracking-tight text-white sm:text-4xl lg:text-5xl";

export const pageIntro =
  "mt-4 text-base leading-relaxed text-slate-300 sm:mt-5 sm:text-lg";

/** Standard content section inside a page */
export const sectionBlock = `${siteContainer} ${sectionSpacing}`;

export const sectionBlockTight = `${siteContainer} ${sectionSpacingTight}`;

export const sectionHeading =
  "text-[clamp(1.25rem,4vw,1.875rem)] font-bold tracking-tight text-white sm:text-3xl";

export const homeSectionTitle =
  "text-[clamp(1.35rem,4.5vw,2.25rem)] font-bold tracking-tight text-white sm:text-3xl lg:text-4xl";

/** Responsive grids */
export const gridCards2 = "grid gap-4 sm:gap-5 sm:grid-cols-2";

export const gridCards3 = "grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3";

export const gridCards4 = "grid gap-4 sm:grid-cols-2 lg:grid-cols-4";

/** Home page sections */
export const homeSection = `relative w-full min-w-0 overflow-hidden py-10 sm:py-16 lg:py-20`;

/** Horizontal scroll for tabs / filters on small screens */
export const scrollRow =
  "flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
