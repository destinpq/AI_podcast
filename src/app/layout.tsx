import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MuiProvider from "./components/MuiProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Podcast Platform",
  description: "Create and manage your podcast content with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <MuiProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </MuiProvider>
        <Script src="/closePopup.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
