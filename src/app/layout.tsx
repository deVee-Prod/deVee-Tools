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
  title: "File Converter",
  description: "Professional media conversion tools by deVee Boutique Label",
  icons: {
    icon: "/devee-icon-2026.png?v=final",
    apple: "/devee-icon-2026.png?v=final",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        {/* דורסים את הזיכרון של כרום עם קישור ישיר וחזק לפאביקון */}
        <link rel="icon" type="image/png" href="/devee-icon-2026.png?v=final" />
        <link rel="apple-touch-icon" href="/devee-icon-2026.png?v=final" />
        <script src="/coi-serviceworker.js" async></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}