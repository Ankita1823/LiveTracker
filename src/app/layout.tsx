import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import QueryProvider from "@/components/providers/QueryProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "DevLog - Developer Learning Journal",
  description: "Track your learning journey and projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900`}>
        <QueryProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
          <GlobalSearch />
          <Toaster position="bottom-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
