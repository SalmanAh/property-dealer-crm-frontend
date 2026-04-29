import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { NotificationToast } from "@/components/common/NotificationToast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PropCRM - Property Dealer CRM",
  description: "Comprehensive CRM system for property dealers in Pakistan. Manage leads, agents, and analytics efficiently.",
  keywords: "property CRM, real estate CRM, Pakistan property, lead management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            {children}
            <NotificationToast />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
