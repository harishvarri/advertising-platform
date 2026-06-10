import type { Metadata } from "next";
import Script from "next/script";

import { Poppins, Sora } from "next/font/google";
import { NcplIdentify } from "@/components/ncpl-identify";
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
      <body>{children}
          <Script
          src="https://analytics-tool-web.vercel.app/ncpl.js"
          data-project="advertising"
          data-key="ncpl_pk_q6OCW0BDVA6v8kQkdAAa7Nb1RuK3GR4b"
          strategy="afterInteractive"
        /></body>
    </html>
  );
}


