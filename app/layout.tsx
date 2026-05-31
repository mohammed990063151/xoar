import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "xora — Events & Conferences",
    template: "%s | xora",
  },
  description:
    "Design and delivery of conferences, exhibitions, celebrations, and recreation in Saudi Arabia.",
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
      <body className="min-h-screen min-w-0 overflow-x-clip antialiased">{children}</body>
    </html>
  );
}
