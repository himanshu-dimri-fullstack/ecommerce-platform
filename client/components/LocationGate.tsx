"use client";

import { useEffect, useState } from "react";
import { FiMapPin, FiLoader } from "react-icons/fi";

interface LocationGateProps {
    children: React.ReactNode;
}

export default function LocationGate({ children }: LocationGateProps) {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const checkLocation = () => {
            const savedLocation = sessionStorage.getItem("quickkart_location");

            if (savedLocation) {
                try {
                    const parsed = JSON.parse(savedLocation);

                    if (
                        parsed?.label &&
                        typeof parsed.latitude === "number" &&
                        typeof parsed.longitude === "number"
                    ) {
                        setReady(true);
                        return;
                    }
                } catch {
                    sessionStorage.removeItem("quickkart_location");
                }
            }

            setReady(false);
        };

        checkLocation();

        window.addEventListener("location-updated", checkLocation);

        return () => {
            window.removeEventListener("location-updated", checkLocation);
        };
    }, []);

    if (!ready) {
        return (
            <div className="fixed inset-0 z-9999 flex min-h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
                        <FiMapPin className="text-[#0c831f]" size={32} />
                    </div>

                    <h2 className="text-xl font-extrabold text-gray-900">
                        Setting up your location
                    </h2>

                    <p className="max-w-xs text-sm text-gray-500">
                        Please allow location access or enter your address
                        to explore QUICK KART.
                    </p>

                    <FiLoader
                        size={22}
                        className="animate-spin text-[#0c831f]"
                    />
                </div>
            </div>
        );
    }

    return <>{children}</>;
}