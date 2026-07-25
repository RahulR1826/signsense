import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SignSense – Sign Language Video Calls, Reimagined",
  description:
    "The first AI-powered video calling platform with real-time sign language recognition. Break communication barriers with SignSense.",
  keywords: ["sign language", "video call", "AI", "accessibility", "SaaS"],
  openGraph: {
    title: "SignSense – Sign Language Video Calls, Reimagined",
    description: "Real-time AI sign language recognition in your video calls.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const theme = localStorage.getItem('signsense-theme') || 'dark';
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
              document.documentElement.classList.remove('light');
            } else {
              document.documentElement.classList.add('light');
              document.documentElement.classList.remove('dark');
            }
          } catch (e) {}
        ` }} />
      </head>
      <body className="noise">{children}</body>
    </html>
  );
}
