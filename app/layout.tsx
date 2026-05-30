import type { Metadata } from "next";
import { Poppins, Sora } from "next/font/google";

import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "BharatAd Pulse | Nearby Indian Ads, Jobs, and Offers",
  description:
    "Discover and publish nearby advertisements across India for jobs, discounts, food, shopping, jewellery, and local business offers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${sora.variable}`}>
      <body>{children}</body>
    </html>
  );
}

