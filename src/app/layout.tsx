import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Sidebar from "@/components/layout/Sidebar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bluebird B-APO",
  description: "AI-Driven Product Orchestrator — Internal Tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={inter.variable}>
      <body className="font-[var(--font-inter)]">
        <Sidebar />
        <main className="ml-[240px] min-h-screen p-8 max-w-[1400px]">{children}</main>
      </body>
    </html>
  );
}
