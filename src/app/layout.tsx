import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getStats } from "@/lib/wiki";

export const metadata: Metadata = {
  title: "GitHub Knowledge Wiki",
  description:
    "Wiki pessoal de conhecimento técnico alimentada diretamente por repositórios do GitHub.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const stats = getStats();

  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen flex flex-col bg-[#090d16] text-[#e6edf3] antialiased">
        <Navbar />
        <main className="flex-1 pb-16">{children}</main>
        <Footer lastSync={stats.last_sync} />
      </body>
    </html>
  );
}
