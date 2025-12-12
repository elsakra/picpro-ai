import type { Metadata } from "next";
import { Sora, Fira_Code } from "next/font/google";
import { AnalyticsProvider } from "@/components/analytics-provider";
import "./globals.css";

const sora = Sora({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const firaCode = Fira_Code({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PicPro AI - Professional Headshots in Minutes",
  description: "Transform your selfies into stunning professional headshots with AI. No photographer needed. Get 100+ headshots for just $29.",
  keywords: ["AI headshots", "professional photos", "LinkedIn photos", "headshot generator", "AI portrait"],
  openGraph: {
    title: "PicPro AI - Professional Headshots in Minutes",
    description: "Transform your selfies into stunning professional headshots with AI. No photographer needed.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${sora.variable} ${firaCode.variable} antialiased`}
      >
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
