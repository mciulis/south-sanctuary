import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "South Sanctuary — 230 S Canby, Portland",
  description:
    "A peaceful home tucked into the trees at the end of a quiet street. Three bedrooms, 2.5 baths, 850sqft deck, and a curated estate sale.",
  openGraph: {
    title: "South Sanctuary — 230 S Canby, Portland",
    description: "A peaceful home tucked into the trees.",
    siteName: "South Sanctuary",
  },
  formatDetection: {
    address: false,
    telephone: false,
    email: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
