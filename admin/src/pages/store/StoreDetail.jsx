import { Link, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiTag,
    FiHash,
    FiUser,
    FiPhone,
    FiMapPin,
    FiMap,
    FiNavigation,
    FiCalendar,
    FiClock,
    FiGrid,
    FiCheckCircle,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import { API } from "../../api/axios";
import DataLoader from "../../components/DataLoader";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const StoreDetail = () => {
    const { id } = useParams();
    const user = useSelector((store) => store.auth.user)

    const [dataLoading, setDataLoading] = useState(true);
    const [store, setStore] = useState({});

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const res = await API.get(`/store/get/${id}`);

                setStore(res.data.store);
            } catch (error) {
                console.error(error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchStore();
    }, [id]);

    if (dataLoading) {
        return <DataLoader />;
    }

    const manager =
        typeof store.manager === "object" && store.manager !== null
            ? store.manager
            : null;

    const location =
        typeof store.location === "object" && store.location !== null
            ? store.location
            : null;

    const isActive = store.status?.toLowerCase() === "active";

    const formatDate = (date, includeTime = false) => {
        if (!date) return "-";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "-";

        return includeTime
            ? parsedDate.toLocaleString()
            : parsedDate.toLocaleDateString();
    };

    const formatLocation = () => {
        if (!location) {
            return typeof store.location === "string"
                ? store.location
                : "-";
        }

        if (location.coordinates) {
            return location.coordinates.join(", ");
        }

        const parts = [
            location.address,
            location.city,
            location.state,
            location.country,
        ].filter(Boolean);

        return parts.length ? parts.join(", ") : "-";
    };

    if (!user?.role.permissions.some((permission) => permission.includes("store"))) {
        return <Navigate to="/admin/dashboard" replace />
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* Header */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                        <Link
                            to="/admin/stores"
                            className="transition hover:text-[#003963]"
                        >
                            Stores
                        </Link>

                        <span>/</span>

                        <span className="text-gray-700">
                            View Store
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                        Store Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View complete information about this store.
                    </p>
                </div>

                <Link
                    to="/admin/stores"
                    className="flex items-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                    <FiArrowLeft />
                    Back
                </Link>

            </div>

            {/* Main Content */}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* Store Profile Card */}

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="flex flex-col items-center text-center">

                        {/* Store Icon */}

                        <div className="mb-5 flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-[#003963] text-white shadow-sm">
                            <FiGrid size={48} />
                        </div>

                        <h2 className="text-xl font-bold text-gray-800">
                            {store.name || "-"}
                        </h2>

                        <p className="mt-1 break-all text-sm text-gray-500">
                            {store.code || "-"}
                        </p>

                        {/* Status */}

                        <span
                            className={`mt-4 rounded-full px-4 py-1.5 text-xs font-semibold ${isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                        >
                            {store.status || "Inactive"}
                        </span>

                    </div>

                    <div className="my-6 border-t border-gray-100" />

                    <div className="space-y-4">

                        {/* Store Name */}

                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiTag className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Store Name
                                </p>

                                <p className="wrap-break-words font-medium text-gray-800">
                                    {store.name || "-"}
                                </p>
                            </div>
                        </div>

                        {/* Store Code */}

                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiHash className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Store Code
                                </p>

                                <p className="break-all font-medium text-gray-800">
                                    {store.code || "-"}
                                </p>
                            </div>
                        </div>

                        {/* Manager */}

                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiUser className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Store Manager
                                </p>

                                <p className="wrap-break-words font-medium text-gray-800">
                                    {manager?.firstName ||
                                        manager?.lastName
                                        ? `${manager.firstName || ""} ${manager.lastName || ""
                                            }`.trim()
                                        : manager?.name ||
                                        (typeof store.manager === "string"
                                            ? store.manager
                                            : "-")}
                                </p>
                            </div>
                        </div>

                        {/* Phone */}

                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiPhone className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Phone Number
                                </p>

                                <p className="break-all font-medium text-gray-800">
                                    {store.phone || "-"}
                                </p>
                            </div>
                        </div>

                        {/* Created Date */}

                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiCalendar className="text-[#003963]" />
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Created
                                </p>

                                <p className="font-medium text-gray-800">
                                    {formatDate(store.createdAt)}
                                </p>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Store Information */}

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">

                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-800">
                            Store Information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Basic information and operational details of this store.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {/* Store Name */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiTag />
                                <span className="text-sm">Store Name</span>
                            </div>

                            <p className="wrap-break-words font-semibold text-gray-800">
                                {store.name || "-"}
                            </p>
                        </div>

                        {/* Store Code */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiHash />
                                <span className="text-sm">Store Code</span>
                            </div>

                            <p className="break-all font-semibold text-gray-800">
                                {store.code || "-"}
                            </p>
                        </div>

                        {/* Manager */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiUser />
                                <span className="text-sm">Store Manager</span>
                            </div>

                            <p className="wrap-break-words font-semibold text-gray-800">
                                {manager?.firstName ||
                                    manager?.lastName
                                    ? `${manager.firstName || ""} ${manager.lastName || ""
                                        }`.trim()
                                    : manager?.name ||
                                    (typeof store.manager === "string"
                                        ? store.manager
                                        : "-")}
                            </p>

                            {manager?.email && (
                                <p className="mt-1 break-all text-sm text-gray-500">
                                    {manager.email}
                                </p>
                            )}
                        </div>

                        {/* Phone */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiPhone />
                                <span className="text-sm">Phone Number</span>
                            </div>

                            <p className="break-all font-semibold text-gray-800">
                                {store.phone || "-"}
                            </p>
                        </div>

                        {/* Service Radius */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiNavigation />
                                <span className="text-sm">Service Radius</span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {store.serviceRadius != null
                                    ? `${store.serviceRadius} km`
                                    : "-"}
                            </p>
                        </div>

                        {/* Status */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiCheckCircle />
                                <span className="text-sm">Status</span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {store.status || "Inactive"}
                            </p>
                        </div>

                        {/* Store ID */}

                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 md:col-span-2">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiHash />
                                <span className="text-sm">Store ID</span>
                            </div>

                            <p className="break-all font-semibold text-gray-800">
                                {store._id || "-"}
                            </p>
                        </div>

                    </div>

                    {/* Address */}

                    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-gray-500">
                            <FiMapPin />
                            <span className="text-sm">Store Address</span>
                        </div>

                        <p className="whitespace-pre-wrap wrap-break-words text-sm leading-6 text-gray-700">
                            {store.address || "-"}
                        </p>
                    </div>

                    {/* Location */}

                    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-gray-500">
                            <FiMap />
                            <span className="text-sm">Store Location</span>
                        </div>

                        <p className="wrap-break-words text-sm leading-6 text-gray-700">
                            {formatLocation()}
                        </p>

                        {location?.coordinates && (
                            <p className="mt-2 text-xs text-gray-500">
                                Coordinates: {location.coordinates.join(", ")}
                            </p>
                        )}
                    </div>

                    {/* Timeline */}

                    <div className="mt-8 border-t border-gray-100 pt-6">

                        <h2 className="mb-5 text-lg font-bold text-gray-800">
                            Store Timeline
                        </h2>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* Created */}

                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">
                                <div className="rounded-lg bg-green-50 p-3">
                                    <FiCalendar className="text-green-600" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500">
                                        Store Created
                                    </p>

                                    <p className="wrap-break-words font-medium text-gray-800">
                                        {formatDate(store.createdAt, true)}
                                    </p>
                                </div>
                            </div>

                            {/* Updated */}

                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">
                                <div className="rounded-lg bg-blue-50 p-3">
                                    <FiClock className="text-[#003963]" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500">
                                        Last Updated
                                    </p>

                                    <p className="wrap-break-words font-medium text-gray-800">
                                        {formatDate(store.updatedAt, true)}
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

export default StoreDetail;