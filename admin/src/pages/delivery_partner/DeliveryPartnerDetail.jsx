import { Link, useParams, Navigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiTruck,
    FiUser,
    FiMail,
    FiPhone,
    FiCalendar,
    FiClock,
    FiShield,
    FiActivity,
    FiDollarSign,
    FiMapPin,
    FiHash,
    FiCreditCard,
    FiWifi,
    FiCheckCircle,
    FiXCircle,
    FiNavigation,
} from "react-icons/fi";
import { API } from "../../api/axios";
import { useState, useEffect } from "react";
import DataLoader from "../../components/DataLoader";
import { useSelector } from "react-redux";

const DeliveryPartnerDetail = () => {
    const user = useSelector((store) => store.auth.user);
    const { id } = useParams();

    const [partner, setPartner] = useState({});
    const [dataLoading, setDataLoading] = useState(true);

    // =========================
    // FETCH DELIVERY PARTNER
    // =========================

    useEffect(() => {
        const fetchPartner = async () => {
            try {
                setDataLoading(true);

                const res = await API.get(
                    `/delivery-partner/get/${id}`
                );

                setPartner(
                    res.data.deliveryPartner ||
                    res.data.partner ||
                    {}
                );
            } catch (error) {
                console.log(error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchPartner();
    }, [id]);

    // =========================
    // PERMISSIONS
    // =========================

    const permissions = user?.role?.permissions || [];

    if (
        !permissions.some((permission) =>
            permission.includes("deliveryPartner")
        )
    ) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (dataLoading) {
        return <DataLoader />;
    }

    // =========================
    // HELPERS
    // =========================

    const partnerUser = partner.user || {};

    const partnerName =
        `${partnerUser.firstName || ""} ${partnerUser.lastName || ""}`.trim() ||
        partnerUser.name ||
        "Unknown Partner";

    const partnerEmail = partnerUser.email || "-";

    const partnerPhone =
        partnerUser.phone ||
        partnerUser.phoneNumber ||
        "-";

    const partnerInitials =
        partnerName === "Unknown Partner"
            ? "DP"
            : partnerName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0].toUpperCase())
                .join("");

    const formatDate = (date) => {
        return date
            ? new Date(date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            })
            : "-";
    };

    const formatDateTime = (date) => {
        return date
            ? new Date(date).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
            : "-";
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const formatVehicleType = (type) => {
        if (!type) return "-";

        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    const coordinates =
        partner.currentLocation?.coordinates || [];

    const longitude = coordinates[0];
    const latitude = coordinates[1];

    const hasLocation =
        coordinates.length === 2 &&
        Number.isFinite(longitude) &&
        Number.isFinite(latitude) &&
        !(longitude === 0 && latitude === 0);

    const statusClass =
        partner.status === "active"
            ? "bg-green-100 text-green-700"
            : partner.status === "blocked"
                ? "bg-red-100 text-red-700"
                : "bg-orange-100 text-orange-700";

    // =========================
    // UI
    // =========================

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* HEADER */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">

                        <Link
                            to="/admin/delivery-partners"
                            className="transition hover:text-[#003963]"
                        >
                            Delivery Partners
                        </Link>

                        <span>/</span>

                        <span className="text-gray-700">
                            View Partner
                        </span>

                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                        Delivery Partner Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View complete information about this delivery partner.
                    </p>

                </div>

                <Link
                    to="/admin/delivery-partners"
                    className="flex items-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                    <FiArrowLeft />
                    Back
                </Link>

            </div>

            {/* MAIN GRID */}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* PARTNER PROFILE CARD */}

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="flex flex-col items-center text-center">

                        {/* PROFILE AVATAR */}

                        <div className="mb-5 flex h-32 w-32 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-4xl font-bold text-emerald-700 shadow-sm">
                            {partnerInitials}
                        </div>

                        <h2 className="text-xl font-bold text-gray-800">
                            {partnerName}
                        </h2>

                        <p className="mt-1 break-all text-sm text-gray-500">
                            {partnerEmail}
                        </p>

                        {/* STATUS */}

                        <span
                            className={`mt-4 rounded-full px-4 py-1.5 text-xs font-semibold ${statusClass}`}
                        >
                            {partner.status || "Inactive"}
                        </span>

                        {/* ONLINE STATUS */}

                        <div className="mt-3 flex flex-wrap justify-center gap-2">

                            <span
                                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${partner.isOnline
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                    }`}
                            >
                                <span
                                    className={`h-1.5 w-1.5 rounded-full ${partner.isOnline
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                        }`}
                                />
                                {partner.isOnline ? "Online" : "Offline"}
                            </span>

                            <span
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${partner.isAvailable
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-orange-100 text-orange-700"
                                    }`}
                            >
                                {partner.isAvailable
                                    ? "Available"
                                    : "Not Available"}
                            </span>

                        </div>

                    </div>

                    <div className="my-6 border-t border-gray-100" />

                    <div className="space-y-4">

                        {/* NAME */}

                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiUser className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Full Name
                                </p>

                                <p className="wrap-break-words font-medium text-gray-800">
                                    {partnerName}
                                </p>
                            </div>

                        </div>

                        {/* EMAIL */}

                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiMail className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Email Address
                                </p>

                                <p className="break-all font-medium text-gray-800">
                                    {partnerEmail}
                                </p>
                            </div>

                        </div>

                        {/* PHONE */}

                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiPhone className="text-[#003963]" />
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Phone Number
                                </p>

                                <p className="font-medium text-gray-800">
                                    {partnerPhone}
                                </p>
                            </div>

                        </div>

                        {/* JOINING DATE */}

                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiCalendar className="text-[#003963]" />
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Joined On
                                </p>

                                <p className="font-medium text-gray-800">
                                    {formatDate(partner.createdAt)}
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

                {/* PARTNER INFORMATION */}

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">

                    <div className="mb-6">

                        <h2 className="text-lg font-bold text-gray-800">
                            Delivery Partner Information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Personal, vehicle and account information associated with this partner.
                        </p>

                    </div>

                    {/* VEHICLE INFORMATION */}

                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-800">
                        <FiTruck className="text-[#003963]" />
                        Vehicle Information
                    </h3>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {/* VEHICLE TYPE */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiTruck />

                                <span className="text-sm">
                                    Vehicle Type
                                </span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {formatVehicleType(partner.vehicleType)}
                            </p>

                        </div>

                        {/* VEHICLE NUMBER */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiHash />

                                <span className="text-sm">
                                    Vehicle Number
                                </span>
                            </div>

                            <p className="font-semibold uppercase text-gray-800">
                                {partner.vehicleNumber || "-"}
                            </p>

                        </div>

                        {/* LICENSE NUMBER */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 md:col-span-2">

                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiCreditCard />

                                <span className="text-sm">
                                    Driving License Number
                                </span>
                            </div>

                            <p className="break-all font-semibold uppercase text-gray-800">
                                {partner.drivingLicenseNumber || "-"}
                            </p>

                        </div>

                    </div>

                    {/* DELIVERY STATISTICS */}

                    <div className="mt-8 border-t border-gray-100 pt-6">

                        <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-800">
                            <FiActivity className="text-[#003963]" />
                            Delivery Performance
                        </h3>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                            {/* TOTAL DELIVERIES */}

                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                                <div className="mb-2 flex items-center gap-2 text-gray-500">
                                    <FiTruck />

                                    <span className="text-sm">
                                        Total Deliveries
                                    </span>
                                </div>

                                <p className="text-2xl font-bold text-gray-800">
                                    {partner.totalDeliveries || 0}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Successfully completed deliveries
                                </p>

                            </div>

                            {/* TOTAL EARNINGS */}

                            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                                <div className="mb-2 flex items-center gap-2 text-gray-500">
                                    <FiDollarSign />

                                    <span className="text-sm">
                                        Total Earnings
                                    </span>
                                </div>

                                <p className="text-2xl font-bold text-green-600">
                                    {formatCurrency(partner.totalEarnings)}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    Total delivery earnings
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* ACCOUNT STATUS */}

                    <div className="mt-8 border-t border-gray-100 pt-6">

                        <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-800">
                            <FiShield className="text-[#003963]" />
                            Account & Availability
                        </h3>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* ACCOUNT STATUS */}

                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">

                                <div className={`rounded-lg p-3 ${partner.status === "active"
                                    ? "bg-green-50"
                                    : partner.status === "blocked"
                                        ? "bg-red-50"
                                        : "bg-orange-50"
                                    }`}>
                                    <FiShield
                                        className={
                                            partner.status === "active"
                                                ? "text-green-600"
                                                : partner.status === "blocked"
                                                    ? "text-red-600"
                                                    : "text-orange-600"
                                        }
                                    />
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Account Status
                                    </p>

                                    <p className="font-semibold capitalize text-gray-800">
                                        {partner.status || "Inactive"}
                                    </p>
                                </div>

                            </div>

                            {/* ONLINE STATUS */}

                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">

                                <div className={`rounded-lg p-3 ${partner.isOnline
                                    ? "bg-green-50"
                                    : "bg-gray-100"
                                    }`}>
                                    <FiWifi
                                        className={
                                            partner.isOnline
                                                ? "text-green-600"
                                                : "text-gray-500"
                                        }
                                    />
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Online Status
                                    </p>

                                    <p className="font-semibold text-gray-800">
                                        {partner.isOnline ? "Online" : "Offline"}
                                    </p>
                                </div>

                            </div>

                            {/* AVAILABILITY */}

                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">

                                <div className={`rounded-lg p-3 ${partner.isAvailable
                                    ? "bg-blue-50"
                                    : "bg-orange-50"
                                    }`}>
                                    {partner.isAvailable ? (
                                        <FiCheckCircle className="text-blue-600" />
                                    ) : (
                                        <FiXCircle className="text-orange-600" />
                                    )}
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Delivery Availability
                                    </p>

                                    <p className="font-semibold text-gray-800">
                                        {partner.isAvailable
                                            ? "Available for Orders"
                                            : "Not Available"}
                                    </p>
                                </div>

                            </div>

                            {/* PARTNER ID */}

                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">

                                <div className="rounded-lg bg-blue-50 p-3">
                                    <FiHash className="text-[#003963]" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500">
                                        Partner ID
                                    </p>

                                    <p className="break-all font-semibold text-gray-800">
                                        {partner._id || "-"}
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* CURRENT LOCATION */}

                    <div className="mt-8 border-t border-gray-100 pt-6">

                        <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-800">
                            <FiMapPin className="text-[#003963]" />
                            Current Location
                        </h3>

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

                            {hasLocation ? (

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                    <div className="flex items-start gap-3">

                                        <div className="rounded-lg bg-blue-50 p-3">
                                            <FiNavigation className="text-[#003963]" />
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500">
                                                GPS Coordinates
                                            </p>

                                            <p className="mt-1 font-semibold text-gray-800">
                                                Latitude: {latitude}
                                            </p>

                                            <p className="mt-1 font-semibold text-gray-800">
                                                Longitude: {longitude}
                                            </p>
                                        </div>

                                    </div>

                                    <a
                                        href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 rounded-lg bg-[#003963] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002b4b]"
                                    >
                                        <FiMapPin />
                                        View on Map
                                    </a>

                                </div>

                            ) : (

                                <div className="flex items-center gap-3">

                                    <div className="rounded-lg bg-orange-50 p-3">
                                        <FiMapPin className="text-orange-500" />
                                    </div>

                                    <div>
                                        <p className="font-medium text-gray-700">
                                            Location not available
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            This partner has not shared a valid GPS location yet.
                                        </p>
                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                    {/* TIMELINE */}

                    <div className="mt-8 border-t border-gray-100 pt-6">

                        <h2 className="mb-5 text-lg font-bold text-gray-800">
                            Partner Timeline
                        </h2>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* CREATED */}

                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">

                                <div className="rounded-lg bg-green-50 p-3">
                                    <FiCalendar className="text-green-600" />
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Partner Registered
                                    </p>

                                    <p className="font-medium text-gray-800">
                                        {formatDateTime(partner.createdAt)}
                                    </p>
                                </div>

                            </div>

                            {/* UPDATED */}

                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">

                                <div className="rounded-lg bg-blue-50 p-3">
                                    <FiClock className="text-[#003963]" />
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Last Updated
                                    </p>

                                    <p className="font-medium text-gray-800">
                                        {formatDateTime(partner.updatedAt)}
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default DeliveryPartnerDetail;