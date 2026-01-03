import type { Metadata } from "next";
import { Lexend_Deca } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const Lexend = Lexend_Deca({
  weight: "300",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kraked - Study Together, Stay Focused",
  description:
    "Join thousands of students tracking their progress, competing in study rooms, and mastering their time with Kraked.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://kraked.vercel.app"
  ),
  openGraph: {
    title: "Kraked - Study Together, Stay Focused",
    description:
      "Join thousands of students tracking their progress, competing in study rooms, and mastering their time with Kraked.",
    url: "/",
    siteName: "Kraked",
    images: [
      {
        url: "/og-image.png", // Your OG image path
        width: 1200,
        height: 630,
        alt: "Kraked - Study Together Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kraked - Study Together, Stay Focused",
    description:
      "Join thousands of students tracking their progress, competing in study rooms, and mastering their time with Kraked.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/krakedlogo.png",
    shortcut: "/krakedlogo.png",
    apple: "/krakedlogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${Lexend.className} antialiased bg-black text-white`}>
        <Providers>
          {children}
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
