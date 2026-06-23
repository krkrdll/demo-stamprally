import type { Metadata } from "next";
import {
  Noto_Sans_JP,
  Archivo_Black,
  Barlow_Condensed,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { getSiteSettings, getThemeVars } from "@/lib/settings";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  preload: true,
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
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
      className={`${notoSansJP.variable} ${archivoBlack.variable} ${barlowCondensed.variable} ${jetBrainsMono.variable} h-full antialiased`}
      style={themeVars as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
