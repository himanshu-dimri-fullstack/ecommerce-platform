
"use client";

import { useEffect, useState } from "react";
import {
    FiMapPin,
    FiChevronDown,
    FiX,
    FiLoader,
} from "react-icons/fi";

import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { fetchNearestStore } from "@/redux/storeSlice";

type LocationSuggestion = {
    id: string;
    label: string;
    detail: string;
    latitude: number;
    longitude: number;
};

type SavedLocation = {
    label: string;
    latitude: number;
    longitude: number;
    source: "gps" | "manual";
};

const formatPhotonSuggestion = (feature: any): LocationSuggestion | null => {
    const properties = feature?.properties || {};
    const coordinates = feature?.geometry?.coordinates;

    if (
        !Array.isArray(coordinates) ||
        coordinates.length < 2 ||
        !Number.isFinite(Number(coordinates[0])) ||
        !Number.isFinite(Number(coordinates[1]))
    ) {
        return null;
    }

    const latitude = Number(coordinates[1]);
    const longitude = Number(coordinates[0]);

    const primary =
        properties.name ||
        properties.street ||
        properties.locality ||
        properties.district ||
        properties.city ||
        properties.county ||
        properties.state;

    if (!primary) return null;

    const details = [
        properties.housenumber && properties.street
            ? `${properties.housenumber} ${properties.street}`
            : properties.street,
        properties.district,
        properties.city,
        properties.state,
        properties.country,
    ].filter(Boolean);

    const uniqueDetails = [...new Set(details)].filter(
        (item) => item !== primary
    );

    const labelParts = [
        primary,
        properties.city,
        properties.state,
    ].filter(Boolean);

    const label = [...new Set(labelParts)].join(", ");

    return {
        id: `${properties.osm_type || "location"}-${properties.osm_id || `${latitude}-${longitude}`}`,
        label,
        detail: uniqueDetails.join(", "),
        latitude,
        longitude,
    };
};

function LocationAddressForm({
    manualAddress,
    setManualAddress,
    suggestions,
    suggestionLoading,
    selectedSuggestion,
    onSelectSuggestion,
    onSubmit,
    locationSubmitting,
    locationError,
    suggestionError,
}: {
    manualAddress: string;
    setManualAddress: (value: string) => void;
    suggestions: LocationSuggestion[];
    suggestionLoading: boolean;
    selectedSuggestion: LocationSuggestion | null;
    onSelectSuggestion: (suggestion: LocationSuggestion) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    locationSubmitting: boolean;
    locationError: string;
    suggestionError: string;
}) {
    const showSuggestions =
        manualAddress.trim().length >= 3 && !selectedSuggestion;

    return (
        <form onSubmit={onSubmit} className="space-y-3">
            <div className="relative">
                <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="Enter area, address or landmark"
                    autoComplete="off"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#0c831f] focus:ring-4 focus:ring-green-50"
                />

                {showSuggestions && (
                    <div className="absolute left-0 right-0 top-full z-10000 mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
                        {suggestionLoading ? (
                            <div className="flex items-center justify-center gap-2 px-4 py-5 text-sm text-gray-500">
                                <FiLoader className="animate-spin text-[#0c831f]" />
                                Searching locations...
                            </div>
                        ) : suggestions.length > 0 ? (
                            <div className="py-1">
                                {suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion.id}
                                        type="button"
                                        onClick={() =>
                                            onSelectSuggestion(suggestion)
                                        }
                                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-green-50"
                                    >
                                        <FiMapPin
                                            size={18}
                                            className="mt-0.5 shrink-0 text-[#0c831f]"
                                        />

                                        <span className="min-w-0">
                                            <span className="block text-sm font-bold text-gray-800">
                                                {suggestion.label}
                                            </span>

                                            {suggestion.detail && (
                                                <span className="mt-0.5 block text-xs leading-5 text-gray-500">
                                                    {suggestion.detail}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : suggestionError ? (
                            <p className="px-4 py-4 text-sm text-red-600">
                                {suggestionError}
                            </p>
                        ) : (
                            <p className="px-4 py-4 text-sm text-gray-500">
                                No locations found. Try another area or landmark.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {selectedSuggestion && (
                <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3">
                    <FiMapPin
                        size={18}
                        className="mt-0.5 shrink-0 text-[#0c831f]"
                    />

                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-green-700">
                            Selected delivery location
                        </p>

                        <p className="mt-1 text-sm font-bold text-gray-800">
                            {selectedSuggestion.label}
                        </p>

                        {selectedSuggestion.detail && (
                            <p className="mt-0.5 text-xs text-gray-500">
                                {selectedSuggestion.detail}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setManualAddress("")}
                        className="rounded-lg p-1 text-gray-500 transition hover:bg-green-100 hover:text-gray-800"
                        aria-label="Change selected location"
                    >
                        <FiX size={17} />
                    </button>
                </div>
            )}

            {locationError && (
                <p className="text-sm font-medium text-red-600">
                    {locationError}
                </p>
            )}

            <button
                type="submit"
                disabled={locationSubmitting || !selectedSuggestion}
                className="w-full rounded-xl bg-[#0c831f] px-4 py-3 font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {locationSubmitting
                    ? "Confirming location..."
                    : "Confirm location"}
            </button>
        </form>
    );
}

export default function DeliveryLocation() {
    const dispatch = useDispatch<AppDispatch>();

    const [location, setLocation] = useState("Select Location");
    const [locationReady, setLocationReady] = useState(false);
    const [locationLoading, setLocationLoading] = useState(true);
    const [locationModalOpen, setLocationModalOpen] = useState(false);

    const [manualAddress, setManualAddress] = useState("");
    const [locationSubmitting, setLocationSubmitting] = useState(false);
    const [locationError, setLocationError] = useState("");

    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const [suggestionError, setSuggestionError] = useState("");
    const [selectedSuggestion, setSelectedSuggestion] =
        useState<LocationSuggestion | null>(null);

    // SAVE LOCATION AND FETCH NEAREST STORE
    const saveLocation = (value: SavedLocation) => {
        sessionStorage.setItem(
            "quickkart_location",
            JSON.stringify(value)
        );

        setLocation(value.label);
        setLocationReady(true);
        setLocationModalOpen(false);
        setLocationError("");
        setLocationLoading(false);
        setManualAddress("");
        setSuggestions([]);
        setSelectedSuggestion(null);
        setSuggestionError("");

        // Fetch nearest store with new coordinates
        dispatch(
            fetchNearestStore({
                latitude: value.latitude,
                longitude: value.longitude,
            })
        );

        // Notify other components about location change
        window.dispatchEvent(new Event("location-updated"));
    };

    const getAreaName = (address: Record<string, string> = {}) =>
        address.neighbourhood ||
        address.suburb ||
        address.residential ||
        address.city_district ||
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        address.state ||
        "Selected Location";

    // GET CURRENT GPS LOCATION
    const requestCurrentLocation = () => {
        setLocationError("");

        if (!navigator.geolocation) {
            setLocationLoading(false);
            setLocationModalOpen(true);

            setLocationError(
                "Your browser does not support location. Please enter your address."
            );

            return;
        }

        setLocationLoading(true);

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const { latitude, longitude } = coords;

                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                    );

                    if (!response.ok) {
                        throw new Error("Unable to find your area.");
                    }

                    const data = await response.json();

                    saveLocation({
                        label: getAreaName(data.address || {}),
                        latitude,
                        longitude,
                        source: "gps",
                    });
                } catch {
                    setLocationLoading(false);
                    setLocationModalOpen(true);

                    setLocationError(
                        "Could not identify your area. Please enter your address manually."
                    );
                }
            },
            (error) => {
                setLocationLoading(false);
                setLocationModalOpen(true);

                if (error.code === 1) {
                    setLocationError(
                        "Location permission was denied. Please enter your address manually."
                    );
                } else if (error.code === 3) {
                    setLocationError(
                        "Location request timed out. Please enter your address manually."
                    );
                } else {
                    setLocationError(
                        "Unable to get your location. Please enter your address manually."
                    );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        );
    };

    // SELECT MANUAL LOCATION
    const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
        setSelectedSuggestion(suggestion);
        setManualAddress(suggestion.label);
        setSuggestions([]);
        setSuggestionError("");
        setLocationError("");
    };

    // CONFIRM MANUAL LOCATION
    const submitManualAddress = (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!selectedSuggestion) {
            setLocationError(
                "Please select a location from the suggestions first."
            );
            return;
        }

        setLocationSubmitting(true);
        setLocationError("");

        try {
            saveLocation({
                label: selectedSuggestion.label,
                latitude: selectedSuggestion.latitude,
                longitude: selectedSuggestion.longitude,
                source: "manual",
            });
        } finally {
            setLocationSubmitting(false);
        }
    };

    // PHOTON LOCATION SEARCH
    useEffect(() => {
        const query = manualAddress.trim();

        if (
            query.length < 3 ||
            (selectedSuggestion && query === selectedSuggestion.label)
        ) {
            setSuggestions([]);
            setSuggestionLoading(false);
            setSuggestionError("");
            return;
        }

        const controller = new AbortController();

        const timer = setTimeout(async () => {
            setSuggestionLoading(true);
            setSuggestionError("");

            try {
                const response = await fetch(
                    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=en`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error("Location search failed.");
                }

                const data = await response.json();

                const results: LocationSuggestion[] = (
                    data.features || []
                )
                    .map(formatPhotonSuggestion)
                    .filter(
                        (item: LocationSuggestion | null): item is LocationSuggestion =>
                            item !== null
                    );

                setSuggestions(results);

                if (results.length === 0) {
                    setSuggestionError(
                        "No locations found. Try another area or landmark."
                    );
                }
            } catch (error: any) {
                if (error?.name !== "AbortError") {
                    setSuggestions([]);
                    setSuggestionError(
                        "Unable to load suggestions. Please try again."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setSuggestionLoading(false);
                }
            }
        }, 400);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [manualAddress, selectedSuggestion]);

    // LOAD SAVED LOCATION ON INITIAL MOUNT
    useEffect(() => {
        const savedLocation = sessionStorage.getItem("quickkart_location");

        if (savedLocation) {
            try {
                const parsed = JSON.parse(savedLocation);

                if (
                    parsed?.label &&
                    typeof parsed.latitude === "number" &&
                    Number.isFinite(parsed.latitude) &&
                    typeof parsed.longitude === "number" &&
                    Number.isFinite(parsed.longitude)
                ) {
                    setLocation(parsed.label);
                    setLocationReady(true);
                    setLocationLoading(false);

                    // Also fetch nearest store on page refresh
                    dispatch(
                        fetchNearestStore({
                            latitude: parsed.latitude,
                            longitude: parsed.longitude,
                        })
                    );

                    return;
                }

                sessionStorage.removeItem("quickkart_location");
            } catch {
                sessionStorage.removeItem("quickkart_location");
            }
        }

        requestCurrentLocation();

        // Run only once when this component mounts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // OPEN LOCATION MODAL
    const openLocationModal = () => {
        setLocationError("");
        setSuggestionError("");
        setManualAddress("");
        setSuggestions([]);
        setSelectedSuggestion(null);
        setLocationModalOpen(true);
    };

    // MANUAL ADDRESS INPUT
    const setAddress = (value: string) => {
        setManualAddress(value);
        setSelectedSuggestion(null);
        setLocationError("");
    };

    return (
        <>
            {/* Navbar Location */}
            <div className="relative hidden w-52 min-w-0 shrink-0 lg:block">
                <button
                    type="button"
                    onClick={openLocationModal}
                    className="flex w-full items-center gap-2 overflow-hidden rounded-xl px-3 py-2 text-left transition hover:bg-gray-50"
                >
                    <FiMapPin
                        size={21}
                        className="shrink-0 text-[#0c831f]"
                    />

                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-500">
                            Deliver to
                        </p>

                        <p
                            title={location}
                            className="flex min-w-0 items-center gap-1 text-sm font-bold text-gray-800"
                        >
                            <span className="min-w-0 flex-1 truncate">
                                {locationLoading
                                    ? "Detecting location..."
                                    : location}
                            </span>

                            <FiChevronDown
                                size={14}
                                className="shrink-0"
                            />
                        </p>
                    </div>
                </button>
            </div>

            {/* Mandatory Location Screen */}
            {!locationReady && (
                <div className="fixed inset-0 z-9999 flex min-h-screen items-center justify-center bg-white px-4 py-6">
                    {locationLoading ? (
                        <div className="flex w-full max-w-sm flex-col items-center text-center">
                            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50">
                                <FiMapPin
                                    size={36}
                                    className="text-[#0c831f]"
                                />
                            </div>

                            <h2 className="text-2xl font-extrabold text-gray-900">
                                Setting up your location
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Please allow location access so we can find
                                nearby stores and show products available
                                in your area.
                            </p>

                            <FiLoader
                                size={25}
                                className="mt-6 animate-spin text-[#0c831f]"
                            />
                        </div>
                    ) : (
                        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
                            <div className="mb-6 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
                                    <FiMapPin
                                        size={30}
                                        className="text-[#0c831f]"
                                    />
                                </div>

                                <h2 className="text-xl font-extrabold text-gray-900">
                                    Choose your location
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Please select your delivery location
                                    to continue shopping on QUICK KART.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={requestCurrentLocation}
                                disabled={locationLoading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#0c831f] px-4 py-3 font-bold text-[#0c831f] transition hover:bg-green-50 disabled:opacity-60"
                            >
                                <FiMapPin size={19} />
                                Use my current location
                            </button>

                            <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                <span className="h-px flex-1 bg-gray-200" />
                                Or enter your address
                                <span className="h-px flex-1 bg-gray-200" />
                            </div>

                            <LocationAddressForm
                                manualAddress={manualAddress}
                                setManualAddress={setAddress}
                                suggestions={suggestions}
                                suggestionLoading={suggestionLoading}
                                selectedSuggestion={selectedSuggestion}
                                onSelectSuggestion={handleSelectSuggestion}
                                onSubmit={submitManualAddress}
                                locationSubmitting={locationSubmitting}
                                locationError={locationError}
                                suggestionError={suggestionError}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Change Location Modal */}
            {locationReady && locationModalOpen && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 px-4 py-6">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900">
                                    Choose your location
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    We’ll use this to show delivery availability near you.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setLocationModalOpen(false)}
                                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                                aria-label="Close location dialog"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={requestCurrentLocation}
                            disabled={locationLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#0c831f] px-4 py-3 font-bold text-[#0c831f] transition hover:bg-green-50 disabled:opacity-60"
                        >
                            <FiMapPin size={19} />
                            {locationLoading
                                ? "Detecting location..."
                                : "Use my current location"}
                        </button>

                        <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            <span className="h-px flex-1 bg-gray-200" />
                            Or enter your address
                            <span className="h-px flex-1 bg-gray-200" />
                        </div>

                        <LocationAddressForm
                            manualAddress={manualAddress}
                            setManualAddress={setAddress}
                            suggestions={suggestions}
                            suggestionLoading={suggestionLoading}
                            selectedSuggestion={selectedSuggestion}
                            onSelectSuggestion={handleSelectSuggestion}
                            onSubmit={submitManualAddress}
                            locationSubmitting={locationSubmitting}
                            locationError={locationError}
                            suggestionError={suggestionError}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
