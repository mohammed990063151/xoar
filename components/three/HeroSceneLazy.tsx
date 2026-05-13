"use client";

import dynamic from "next/dynamic";

const HeroScene = dynamic(
  () => import("./HeroScene").then((m) => m.HeroScene),
  { ssr: false, loading: () => null },
);

export function HeroSceneLazy(): React.ReactElement {
  return <HeroScene />;
}
