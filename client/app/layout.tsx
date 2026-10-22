import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";

// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
import ReduxProvider from "@/redux/provider";

import { Suspense } from "react";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "QUICK KART",
  description: "Quick Kart online shopping store",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" className={urbanist.className}>
      <body className="min-h-full flex flex-col antialiased">
        <Suspense fallback={<div />}>
          <ReduxProvider>
            {/* <Navbar /> */}
            {children}
            {/* <Footer /> */}
          </ReduxProvider>
        </Suspense>
      </body>
    </html>
  );
}