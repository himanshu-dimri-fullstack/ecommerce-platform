import React, { useEffect, useState } from "react";
import {
    FiX,
    FiMapPin,
    FiNavigation,
    FiSearch,
    FiMap,
    FiLoader,
    FiCheckCircle,
    FiCrosshair,
} from "react-icons/fi";

import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// DEFAULT MAP CENTER
const DEFAULT_CENTER = [28.6139, 77.2090];

// CUSTOM MARKER ICON
const customIcon = L.divIcon({
    className: "quickkart-map-marker",
    html: `
        <div style="
            width: 24px;
            height: 24px;
            background: #003963;
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
});

// FORMAT PHOTON ADDRESS
const formatPhotonAddress = (properties = {}) => {
    const street = [
        properties.housenumber,
        properties.street,
    ]
        .filter(Boolean)
        .join(" ");

    const parts = [
        properties.name,
        street,
        properties.district,
        properties.city,
        properties.town,
        properties.village,
        properties.state,
        properties.postcode,
        properties.country,
    ];

    return [
        ...new Set(
            parts
                .filter(Boolean)
                .map((item) => item.trim())
        ),
    ].join(", ");
};

// MAP CLICK EVENTS
const MapEvents = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(
                e.latlng.lat,
                e.latlng.lng
            );
        },
    });

    return null;
};

// RECENTER MAP
const MapRecenter = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        map.setView(center, Math.max(map.getZoom(), 15));
    }, [center, map]);

    return null;
};

const FormModal = ({
    isEdit,
    setShowModal,
    resetForm,
    handleEditStore,
    handleAddStore,
    formData,
    handleChange,
    managers,
    inputClass,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    const [searchLoading, setSearchLoading] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    const [showMap, setShowMap] = useState(false);
    const [locationSource, setLocationSource] = useState("");

    const [searchError, setSearchError] = useState("");

    const hasLocation =
        formData.latitude !== "" &&
        formData.longitude !== "";

    const mapCenter = hasLocation
        ? [
            Number(formData.latitude),
            Number(formData.longitude),
        ]
        : DEFAULT_CENTER;

    // SET FORM FIELD
    const setField = (name, value) => {
        handleChange({
            target: {
                name,
                value,
            },
        });
    };

    // CLOSE MODAL
    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    // SET COORDINATES
    const setCoordinates = (
        latitude,
        longitude,
        source
    ) => {
        setField("latitude", String(latitude));
        setField("longitude", String(longitude));
        setLocationSource(source);
    };

    // ADDRESS CHANGE
    const handleAddressChange = (e) => {
        handleChange(e);
    };

    // PHOTON AUTOCOMPLETE
    useEffect(() => {
        const query = searchQuery.trim();

        if (query.length < 3) {
            setSuggestions([]);
            setSearchLoading(false);
            setSearchError("");
            return;
        }

        const controller = new AbortController();

        const timer = setTimeout(async () => {
            try {
                setSearchLoading(true);
                setSearchError("");

                const response = await fetch(
                    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lang=en`,
                    {
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error("Photon search failed");
                }

                const data = await response.json();

                const features = data.features || [];

                setSuggestions(features);

                if (features.length === 0) {
                    setSearchError(
                        "No matching address found. You can enter your address manually."
                    );
                }
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Photon search error:", error);

                    setSuggestions([]);

                    setSearchError(
                        "Address search is temporarily unavailable. You can enter your address manually."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setSearchLoading(false);
                }
            }
        }, 450);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [searchQuery]);

    // SELECT PHOTON RESULT
    const handleSelectSuggestion = (feature) => {
        const coordinates =
            feature.geometry?.coordinates || [];

        const longitude = Number(coordinates[0]);
        const latitude = Number(coordinates[1]);

        if (
            !Number.isFinite(longitude) ||
            !Number.isFinite(latitude)
        ) {
            return;
        }

        const address = formatPhotonAddress(
            feature.properties
        );

        if (address) {
            setField("address", address);
            setSearchQuery(address);
        }

        setCoordinates(
            latitude,
            longitude,
            "Photon Search"
        );

        setSuggestions([]);
        setSearchError("");
        setShowMap(true);
    };

    // CURRENT LOCATION
    const handleCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert(
                "Your browser does not support location services."
            );
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;

                setCoordinates(
                    latitude,
                    longitude,
                    "GPS"
                );

                setShowMap(true);

                try {
                    const response = await fetch(
                        `https://photon.komoot.io/reverse?lat=${latitude}&lon=${longitude}`
                    );

                    if (response.ok) {
                        const data = await response.json();

                        const feature = data.features?.[0];

                        if (feature) {
                            const address = formatPhotonAddress(
                                feature.properties
                            );

                            if (address) {
                                setField("address", address);
                                setSearchQuery(address);
                            }
                        }
                    }
                } catch (error) {
                    console.error(
                        "Reverse geocoding error:",
                        error
                    );
                } finally {
                    setIsLocating(false);
                }
            },

            (error) => {
                console.error("GPS error:", error);

                setIsLocating(false);

                if (error.code === 1) {
                    alert(
                        "Location permission denied. Please allow location access or select the location manually on the map."
                    );
                } else if (error.code === 3) {
                    alert(
                        "Location request timed out. Please try again."
                    );
                } else {
                    alert(
                        "Unable to get your location. Please select it on the map."
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

    // MAP LOCATION SELECT
    const handleMapLocationSelect = (
        latitude,
        longitude
    ) => {
        setCoordinates(
            latitude,
            longitude,
            "Map"
        );
    };

    // FORM SUBMIT
    const handleSubmit = (e) => {
        if (isEdit) {
            handleEditStore(e);
        } else {
            handleAddStore(e);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5">

            <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">

                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {isEdit ? "Update Store" : "Add New Store"}
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Manage store details and exact location.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={closeModal}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-red-500"
                    >
                        <FiX size={21} />
                    </button>

                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="overflow-y-auto"
                >

                    <div className="space-y-6 p-5 sm:p-6">

                        {/* STORE INFORMATION */}
                        <section>

                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
                                Store Information
                            </h3>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                {/* STORE NAME */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Store Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter store name"
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                {/* STORE CODE */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Store Code *
                                    </label>

                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        placeholder="e.g. QK-PV-001"
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                {/* MANAGER */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Store Manager *
                                    </label>

                                    <select
                                        name="manager"
                                        value={formData.manager}
                                        onChange={handleChange}
                                        className={inputClass}
                                        required
                                    >
                                        <option value="">
                                            Select Manager
                                        </option>

                                        {managers.map((manager) => (
                                            <option
                                                key={manager._id}
                                                value={manager._id}
                                            >
                                                {[
                                                    manager.firstName,
                                                    manager.lastName,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ") ||
                                                    manager.email ||
                                                    manager._id}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* PHONE */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Phone Number *
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                        className={inputClass}
                                        required
                                    />
                                </div>

                                {/* SERVICE RADIUS */}
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Service Radius (KM) *
                                    </label>

                                    <input
                                        type="number"
                                        name="serviceRadius"
                                        value={formData.serviceRadius}
                                        onChange={handleChange}
                                        min="0.1"
                                        step="0.1"
                                        placeholder="Enter service radius"
                                        className={inputClass}
                                        required
                                    />

                                    <p className="mt-1 text-xs text-slate-400">
                                        Maximum distance this store can serve.
                                    </p>
                                </div>

                            </div>

                        </section>

                        <div className="border-t border-slate-100" />

                        {/* LOCATION SECTION */}
                        <section>

                            <div className="mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                                    Store Location
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    Search your shop address or enter it manually. Select its exact location using GPS or map.
                                </p>
                            </div>

                            {/* PHOTON SEARCH */}
                            <div className="relative">

                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Search Address (Optional)
                                </label>

                                <div className="relative">

                                    <FiSearch
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        size={18}
                                    />

                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setSuggestions([]);
                                        }}
                                        placeholder="Search shop, market, area or landmark..."
                                        className={`${inputClass} pl-10 pr-10`}
                                    />

                                    {searchLoading && (
                                        <FiLoader
                                            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#003963]"
                                            size={18}
                                        />
                                    )}

                                </div>

                                {/* SUGGESTIONS */}
                                {suggestions.length > 0 && (
                                    <div className="absolute left-0 right-0 z-30 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">

                                        {suggestions.map((feature, index) => {
                                            const address =
                                                formatPhotonAddress(
                                                    feature.properties
                                                );

                                            return (
                                                <button
                                                    type="button"
                                                    key={`${feature.properties?.osm_id || "location"}-${index}`}
                                                    onClick={() =>
                                                        handleSelectSuggestion(feature)
                                                    }
                                                    className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-0 hover:bg-slate-50"
                                                >
                                                    <FiMapPin
                                                        className="mt-0.5 shrink-0 text-[#003963]"
                                                        size={17}
                                                    />

                                                    <span className="text-sm text-slate-700">
                                                        {address || "Unnamed location"}
                                                    </span>
                                                </button>
                                            );
                                        })}

                                    </div>
                                )}

                            </div>

                            {/* SEARCH ERROR */}
                            {searchError && (
                                <p className="mt-2 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                                    {searchError}
                                </p>
                            )}

                            {/* MANUAL ADDRESS */}
                            <div className="mt-4">

                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Complete Shop Address *
                                </label>

                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleAddressChange}
                                    rows={3}
                                    placeholder="Enter complete store address"
                                    className={`${inputClass} resize-none`}
                                    required
                                />

                            </div>

                            {/* LATITUDE AND LONGITUDE */}
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Latitude
                                    </label>

                                    <input
                                        type="text"
                                        value={formData.latitude}
                                        placeholder="Select GPS or map location"
                                        disabled
                                        readOnly
                                        className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Longitude
                                    </label>

                                    <input
                                        type="text"
                                        value={formData.longitude}
                                        placeholder="Select GPS or map location"
                                        disabled
                                        readOnly
                                        className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
                                    />
                                </div>

                            </div>

                            <p className="mt-2 text-xs text-slate-400">
                                <FiCrosshair className="mr-1 inline" />
                                Coordinates are automatically filled using GPS, Photon or Map.
                            </p>

                            {/* LOCATION BUTTONS */}
                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                                <button
                                    type="button"
                                    onClick={handleCurrentLocation}
                                    disabled={isLocating}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-[#003963] bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#002b4b] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isLocating ? (
                                        <FiLoader
                                            className="animate-spin"
                                            size={18}
                                        />
                                    ) : (
                                        <FiNavigation size={18} />
                                    )}

                                    {isLocating
                                        ? "Getting Location..."
                                        : "Use Current Location"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowMap((prev) => !prev)}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#003963] hover:bg-blue-50 hover:text-[#003963]"
                                >
                                    <FiMap size={18} />

                                    {showMap
                                        ? "Hide Map"
                                        : "Select on Map"}
                                </button>

                            </div>

                            {/* MAP */}
                            {showMap && (
                                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">

                                    <div className="bg-slate-50 px-4 py-3">
                                        <p className="text-sm font-semibold text-slate-700">
                                            Select Exact Store Location
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Click on the map to place the marker. Drag the marker to adjust the position.
                                        </p>
                                    </div>

                                    <MapContainer
                                        center={mapCenter}
                                        zoom={hasLocation ? 16 : 12}
                                        scrollWheelZoom
                                        style={{
                                            height: "350px",
                                            width: "100%",
                                        }}
                                    >

                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />

                                        <MapRecenter center={mapCenter} />

                                        <MapEvents
                                            onLocationSelect={
                                                handleMapLocationSelect
                                            }
                                        />

                                        {hasLocation && (
                                            <Marker
                                                position={[
                                                    Number(formData.latitude),
                                                    Number(formData.longitude),
                                                ]}
                                                icon={customIcon}
                                                draggable
                                                eventHandlers={{
                                                    dragend: (e) => {
                                                        const position =
                                                            e.target.getLatLng();

                                                        handleMapLocationSelect(
                                                            position.lat,
                                                            position.lng
                                                        );
                                                    },
                                                }}
                                            />
                                        )}

                                    </MapContainer>

                                    <div className="bg-slate-50 px-4 py-3 text-xs text-slate-500">
                                        <FiMapPin className="mr-1 inline" />
                                        Click or drag the marker to select the exact shop location.
                                    </div>

                                </div>
                            )}

                            {/* LOCATION STATUS */}
                            <div
                                className={`mt-4 rounded-xl border p-4 ${hasLocation
                                    ? "border-green-200 bg-green-50"
                                    : "border-amber-200 bg-amber-50"
                                    }`}
                            >

                                <div className="flex items-start gap-3">

                                    {hasLocation ? (
                                        <FiCheckCircle
                                            className="mt-0.5 shrink-0 text-green-600"
                                            size={20}
                                        />
                                    ) : (
                                        <FiMapPin
                                            className="mt-0.5 shrink-0 text-amber-600"
                                            size={20}
                                        />
                                    )}

                                    <div className="min-w-0 flex-1">

                                        <p
                                            className={`text-sm font-semibold ${hasLocation
                                                ? "text-green-800"
                                                : "text-amber-800"
                                                }`}
                                        >
                                            {hasLocation
                                                ? "Store location selected"
                                                : "Store location not selected"}
                                        </p>

                                        {hasLocation ? (
                                            <div className="mt-2 space-y-1 text-xs text-green-700">
                                                <p>
                                                    Latitude: {formData.latitude}
                                                </p>

                                                <p>
                                                    Longitude: {formData.longitude}
                                                </p>

                                                <p>
                                                    Selected using: {locationSource || "Previously saved location"}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="mt-1 text-xs leading-5 text-amber-700">
                                                Please select the exact store location using GPS or map.
                                            </p>
                                        )}

                                    </div>

                                </div>

                            </div>

                        </section>

                    </div>

                    {/* FOOTER */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-xl bg-linear-to-br from-[#064e3b] via-[#047857] to-[#022c22] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002b4b] active:scale-95"
                        >
                            {isEdit ? "Update Store" : "Create Store"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default FormModal;