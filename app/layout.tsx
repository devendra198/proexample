import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pro-Example | Developer Portfolio & Projects",
  description:
    "Explore real-world projects across web design, web development, mobile app development, and modern cloud technologies.",
  keywords: [
    "developer portfolio",
    "web development",
    "react",
    "nextjs",
    "wordpress",
    "shopify",
    "react native",
    "expo",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-white text-slate-900 antialiased selection:bg-blue-600 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
