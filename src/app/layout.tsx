import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "sin471's portfolio",
  description: "A portfolio website about sin471.",
  applicationName: "sin471's Portfolio",
  authors: [{ name: 'sin471' }],
  generator: 'Next.js',
  keywords: ['sin471', 'portfolio'],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    title: "sin471's portfolio",
    description: "A portfolio website about sin471.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
