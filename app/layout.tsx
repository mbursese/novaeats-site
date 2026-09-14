import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nova Eats — Save 50%+ on delivery",
  description:
    "Save 30–60% on food delivery by sharing your cart link to get discounted orders with live tracking and Discord support.",
  icons: {
    icon: "/nova-logo.png",
    apple: "/nova-logo.png",
  },
  openGraph: {
    title: "Nova Eats — Save 50%+ on delivery",
    description:
      "Save 30–60% on food delivery by sharing your cart link to get discounted orders with live tracking and Discord support.",
    images: ["/nova-logo.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
