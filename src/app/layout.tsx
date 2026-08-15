import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"], // Max semi-bold (600)
});

export const metadata: Metadata = {
  title: "TEPA Dashboard",
  description: "TelkomAkses Employee Performance Analytics",
};

import { TooltipProvider } from "@/components/ui/tooltip";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
