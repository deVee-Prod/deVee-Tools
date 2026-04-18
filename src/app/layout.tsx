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
  title: "File Converter | deVee Boutique Label",
  description: "Professional media conversion tools by deVee Boutique Label",
  icons: {
    // v=3 גורם לדפדפן לרענן את האייקון מהזיכרון שלו
    icon: [
      { url: "/icon.png?v=3", href: "/icon.png?v=3" },
    ],
    apple: [
      { url: "/icon.png?v=3", href: "/icon.png?v=3" },
    ],
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
        {/* השארתי לך את הסרביס וורקר כדי שההמרה תמשיך לעבוד חלק */}
        <script src="/coi-serviceworker.js" async></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}