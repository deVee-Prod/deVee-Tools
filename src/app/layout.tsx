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
    icon: "/api/favicon",
    apple: "/api/favicon",
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
        <link rel="icon" type="image/png" href="/api/favicon" />
        <link rel="apple-touch-icon" href="/api/favicon" />
        <script src="/coi-serviceworker.js" async></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}