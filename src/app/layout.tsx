import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DriftingGridBackground } from './components/DriftingGridBackground';
import { ToolHeader } from './components/ToolHeader';


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
    icon: '/icon.png',    // עודכן מ-favicon ל-icon לפי מה שמופיע בתיקיית public שלך
    shortcut: '/icon.png',
    apple: '/icon.png',
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
        <script src="/coi-serviceworker.js" defer></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-full flex flex-col`}>
        <DriftingGridBackground />
        <div className="relative z-10 flex flex-col min-h-full">
          <ToolHeader />
          {children}
        </div>
      </body>
    </html>
  );
}