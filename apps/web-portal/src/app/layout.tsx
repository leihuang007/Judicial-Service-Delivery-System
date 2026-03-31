import type { Metadata } from "next";
import { Manrope, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const notoSansSC = Noto_Sans_SC({ subsets: ["latin"], variable: "--font-noto-sc" });

export const metadata: Metadata = {
  title: "Judicial Service Delivery",
  description: "Cloud-neutral judicial service delivery scaffold"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${notoSansSC.variable}`}>{children}</body>
    </html>
  );
}
