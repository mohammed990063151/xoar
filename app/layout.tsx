import type { Metadata, Viewport } from "next";
import {
  GoogleTagManager,
  GoogleTagManagerNoscript,
} from "@/components/analytics/GoogleTagManager";
import { ThemeInit } from "@/components/providers/ThemeInit";
import { siteIconMetadata } from "@/lib/site-icons";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "xora — Events & Conferences",
    template: "%s | xora",
  },
  description:
    "Design and delivery of conferences, exhibitions, celebrations, and recreation in Saudi Arabia.",
  icons: siteIconMetadata(),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="ar" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-screen min-w-0 overflow-x-clip antialiased">
        <ThemeInit />
        <GoogleTagManager />
        <GoogleTagManagerNoscript />
        {children}
      </body>
    </html>
  );
}
