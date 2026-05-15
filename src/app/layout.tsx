import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Sidebar from "@/components/layout/Sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bluebird B-APO",
  description: "AI-Driven Product Orchestrator — Internal Tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Sidebar />
        <main className="ml-[220px] min-h-screen p-8">{children}</main>
      </body>
    </html>
  );
}
