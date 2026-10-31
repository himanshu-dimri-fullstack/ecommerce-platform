"use client";

import { useCallback, useEffect, useState } from "react";
import { FiMapPin, FiNavigation, FiRefreshCw } from "react-icons/fi";

interface UserLocation {
    latitude: number;
    longitude: number;
}

interface LocationGateProps {
    children: React.ReactNode;
}

export default function LocationGate({
    children,
}: LocationGateProps) {
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Your browser does not support location access.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };

                localStorage.setItem(
                    "quickkart_location",
                    JSON.stringify(userLocation)
                );

                setLocation(userLocation);
                setLoading(false);
            },
            (err) => {
                setLoading(false);

                if (err.code === 1) {
                    setError(
                        "Location permission is required to use QUICK KART. Please allow location access in your browser settings."
                    );
                } else if (err.code === 2) {
                    setError(
                        "Your location could not be detected. Please enable your device location and try again."
                    );
                } else {
                    setError(
                        "Location request timed out. Please try again."
                    );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    }, []);

    useEffect(() => {
        const savedLocation = localStorage.getItem("quickkart_location");

        if (savedLocation) {
            try {
                const parsed: UserLocation = JSON.parse(savedLocation);

                if (
                    Number.isFinite(parsed.latitude) &&
                    Number.isFinite(parsed.longitude)
                ) {
                    setLocation(parsed);
                    setLoading(false);
                    return;
                }
            } catch {
                localStorage.removeItem("quickkart_location");
            }
        }

        requestLocation();
    }, [requestLocation]);

    if (location) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-9999 flex min-h-screen items-center justify-center bg-white px-5">
            <div className="w-full max-w-md text-center">

                <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-green-50">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <FiMapPin className="h-8 w-8 text-[#0c831f]" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    Where should we deliver?
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500 sm:text-base">
                    Allow location access so we can find nearby stores
                    and show products available in your area.
                </p>

                {error && (
                    <div
                        role="alert"
                        className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
                    >
                        {error}
                    </div>
                )}

                <button
                    type="button"
                    onClick={requestLocation}
                    disabled={loading}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0c831f] px-5 py-4 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {loading ? (
                        <>
                            <FiRefreshCw className="h-5 w-5 animate-spin" />
                            Detecting your location...
                        </>
                    ) : (
                        <>
                            <FiNavigation className="h-5 w-5" />
                            Allow location access
                        </>
                    )}
                </button>

                <p className="mt-4 text-xs leading-5 text-gray-400">
                    Your location helps us identify stores serving your area.
                </p>
            </div>
        </div>
    );
}