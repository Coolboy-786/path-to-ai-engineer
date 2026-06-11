import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import ChatBot from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "Path to AI Engineer",
  description: "16-week self-paced curriculum tracker: Data Analyst → Data Scientist → GenAI → AI Engineer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#020817] text-slate-200 bg-grid">
        {/* Ambient gradient orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="orb orb-blue w-[600px] h-[600px] -top-32 -left-32 opacity-60" />
          <div className="orb orb-violet w-[500px] h-[500px] top-1/3 right-0 opacity-50" />
          <div className="orb orb-emerald w-[400px] h-[400px] bottom-0 left-1/3 opacity-40" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Nav />
          <main className="flex-1">{children}</main>
        </div>

        <ChatBot />
      </body>
    </html>
  );
}
