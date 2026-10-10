import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { LoginModal } from "@/components/auth/LoginModal";
import { ProfileDrawer } from "@/components/auth/ProfileDrawer";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "AgriGPT — National Agricultural Intelligence Platform",
  description:
    "India's 24/7 agricultural intelligence platform for farmers: live AGMARKNET mandi prices, hourly spray weather forecasts, ICAR agronomy best practices, and PMFBY crop insurance.",
  manifest: "/manifest.json",
  keywords: [
    "AgriGPT",
    "Kisan AgriGPT",
    "Mandi prices",
    "AGMARKNET",
    "ICAR package of practices",
    "PMFBY crop insurance",
    "Agromet weather",
    "Tamil agriculture",
    "Hindi agriculture",
    "Telugu agriculture",
    "Kannada agriculture",
    "Malayalam agriculture"
  ],
  authors: [{ name: "AgriGPT Platform Team" }],
  applicationName: "AgriGPT",
  appleWebApp: {
    capable: true,
    title: "AgriGPT",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#15803d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="dns-prefetch" href="https://api.open-meteo.com" />
        <link rel="dns-prefetch" href="https://apisetu.gov.in" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8FAF7] text-slate-800 responsive-safe">
        <LanguageProvider>
          <AuthProvider>
            {children}
            <LoginModal />
            <ProfileDrawer />
            <ServiceWorkerRegister />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
