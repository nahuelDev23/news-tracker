import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Notipip — Noticias de Ecuador",
    template: "%s | Notipip",
  },
  description:
    "Agregador de noticias de Ecuador con estilo grid. Política, tecnología, policía, deportes y más desde Google News.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-EC"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col bg-slate-950 text-slate-100"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
