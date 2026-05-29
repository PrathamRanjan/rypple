import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Rypple | Prompt better. Waste less.",
  description:
    "Free Chrome extension that cuts AI energy use by up to 64% — verified across 48,575 model runs on ChatGPT, Claude, and Gemini.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/rypple-logo.png",
  },
  openGraph: {
    title: "Rypple — Prompt better. Waste less.",
    description: "Free Chrome extension that cuts AI energy use by up to 64%. Verified across 48,575 model runs.",
    siteName: "Rypple",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Rypple" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rypple — Prompt better. Waste less.",
    description: "Free Chrome extension that cuts AI energy use by up to 64%. Verified across 48,575 model runs.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased dark ${GeistSans.variable}`}>
      <body className={`flex min-h-full flex-col ${GeistSans.className}`}>
        <TooltipProvider delay={160}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
