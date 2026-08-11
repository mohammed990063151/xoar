import type { Metadata, Viewport } from "next";
import {
  GoogleTagManager,
  GoogleTagManagerNoscript,
} from "@/components/analytics/GoogleTagManager";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "xora — Events & Conferences",
    template: "%s | xora",
  },
  description:
    "Design and delivery of conferences, exhibitions, celebrations, and recreation in Saudi Arabia.",
  icons: {
    icon: [
      { url: "/favicon.png?v=20260811", type: "image/png", sizes: "32x32" },
      { url: "/icon.png?v=20260811", type: "image/png", sizes: "32x32" },
    ],
    shortcut: [{ url: "/favicon.png?v=20260811", type: "image/png" }],
    apple: [{ url: "/apple-icon.png?v=20260811", type: "image/png", sizes: "180x180" }],
  },
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
    <html lang="ar" suppressHydrationWarning>
      <body className="min-h-screen min-w-0 overflow-x-clip antialiased">
        <GoogleTagManager />
        <GoogleTagManagerNoscript />
        {children}
      </body>
    </html>
  );
}
