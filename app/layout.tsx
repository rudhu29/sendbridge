import "./globals.css";
import React from "react";
import { ToastContainer } from "@/components/ui/toast";

export const metadata = {
  title: "Stellar Journey - White Belt DApp",
  description: "Autonomous Stellar keypair generator, balance fetcher, and Testnet transaction broadcaster.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen relative">
        <div className="glow-backdrop" />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
