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
  title: "Nova Eats — Save big on every delivery",
  description:
    "Get up to 50% off food delivery. Same restaurants, better prices. Share your cart, we place the order, and you get live tracking.",
  icons: {
    icon: "/nova-logo.png",
    apple: "/nova-logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-ink">
        <div className="page-glow" aria-hidden />
        <div className="grain" aria-hidden />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
