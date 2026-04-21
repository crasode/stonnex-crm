import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Stonnex CRM",
  description: "Lead management for Stonnex Roofing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900"><Providers>{children}</Providers></body>
    </html>
  );
}
