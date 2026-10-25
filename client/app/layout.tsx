
import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReduxProvider from "@/redux/provider";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/AuthProvider";

const urbanist = Urbanist({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
    // display: "swap",
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
            <body className="flex min-h-full flex-col antialiased">
                <Suspense fallback={<div />}>
                    <ReduxProvider>
                        <AuthProvider>
                            <Navbar />
                            {children}
                            <Footer />
                        </AuthProvider>
                    </ReduxProvider>

                    <Toaster
                        position="top-center"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: "#ffffff",
                                color: "#1f2937",
                                border: "1px solid #e5e7eb",
                                borderRadius: "12px",
                                fontSize: "14px",
                            },
                            error: {
                                iconTheme: {
                                    primary: "#dc2626",
                                    secondary: "#ffffff",
                                },
                            },
                        }}
                    />
                </Suspense>
            </body>
        </html>
    );
}
