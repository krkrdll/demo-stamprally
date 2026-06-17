import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { getSiteSettings, getThemeVars } from "@/lib/settings";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  preload: true,
});

export const metadata: Metadata = {
  title: "スタンプラリー",
  description: "GPS・カメラでスタンプを集めよう",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = await getSiteSettings();
  const themeVars = getThemeVars(theme);

  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} h-full antialiased`}
      style={themeVars as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
