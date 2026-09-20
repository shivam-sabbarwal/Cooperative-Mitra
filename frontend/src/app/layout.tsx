import type { Metadata, Viewport } from "next";
import "./globals.css";

import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "Cooperative Mitra — सहकारी मित्र",
  description:
    "Cooperative governance, government schemes, legal information and grievance support for cooperative members.",
  keywords: [
    "cooperative",
    "PACS",
    "cooperative societies",
    "government schemes",
    "legal information",
    "grievance support",
    "India",
  ],
  authors: [{ name: "Cooperative Mitra Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#20553b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta
          name="mobile-web-app-capable"
          content="yes"
        />

        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />

        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
      </head>

      <body className="min-h-screen bg-slate-50">
        <LanguageProvider>
          <AuthProvider>
            <a className="skip-link" href="#main-content">
              Skip to main content
            </a>
            <Navbar />

            <main id="main-content" className="mobile-nav-safe-bottom min-h-screen md:pb-0">
              {children}
            </main>

            <Footer />

            <MobileNav />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
