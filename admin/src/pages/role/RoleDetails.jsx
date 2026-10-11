import { Link, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiShield,
    FiTag,
    FiFileText,
    FiCheckCircle,
    FiXCircle,
    FiCalendar,
    FiClock,
    FiKey,
    FiLock,
} from "react-icons/fi";
import { API } from "../../api/axios";
import { useState, useEffect } from "react";
import DataLoader from "../../components/DataLoader";

const RoleDetail = () => {
    const { id } = useParams();

    const [role, setRole] = useState({});
    const [dataLoading, setDataLoading] = useState(true)

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const res = await API.get(`/admin/role/${id}`);
                setRole(res.data.role);
            } catch (error) {
                console.error("Error fetching role:", error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchRole();
    }, [id]);

    const status = role?.status || "inactive";

    const permissions = Array.isArray(role?.permissions)
        ? role.permissions
        : [];

    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (dataLoading) {
        return <DataLoader />
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                        <Link
                            to="/admin/roles"
                            className="transition hover:text-[#003963]"
                        >
                            Roles
                        </Link>

                        <span>/</span>

                        <span className="text-gray-700">
                            View Role
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                        Role Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View role information and assigned permissions.
                    </p>
                </div>

                <Link
                    to="/admin/roles"
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                    <FiArrowLeft />
                    Back
                </Link>
            </div>

            {/* Role Not Found */}
            {!role?._id ? (
                <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <FiShield className="text-3xl text-gray-400" />
                    </div>

                    <h2 className="text-xl font-bold text-gray-800">
                        Role Not Found
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        The requested role could not be found.
                    </p>

                    <Link
                        to="/admin/roles"
                        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#003963] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#002b4a]"
                    >
                        <FiArrowLeft />
                        Back to Roles
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Role Profile Card */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col items-center text-center">

                            {/* Role Icon */}
                            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-[#003963] text-white shadow-lg shadow-blue-900/10">
                                <FiShield className="text-5xl" />
                            </div>

                            <h2 className="wrap-break-words text-xl font-bold text-gray-800">
                                {role?.name || "N/A"}
                            </h2>

                            <p className="mt-1 break-all text-sm text-gray-500">
                                {role?.slug || "N/A"}
                            </p>

                            {/* Status */}
                            <span
                                className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold ${status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                            >
                                <span
                                    className={`h-2 w-2 rounded-full ${status === "active"
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                        }`}
                                />
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                        </div>

                        <div className="my-6 border-t border-gray-100" />

                        <div className="space-y-5">

                            {/* Role Name */}
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-blue-50 p-2.5">
                                    <FiShield className="text-[#003963]" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500">
                                        Role Name
                                    </p>

                                    <p className="wrap-break-words font-semibold text-gray-800">
                                        {role?.name || "N/A"}
                                    </p>
                                </div>
                            </div>

                            {/* Slug */}
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-purple-50 p-2.5">
                                    <FiTag className="text-purple-600" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500">
                                        Role Slug
                                    </p>

                                    <p className="break-all font-semibold text-gray-800">
                                        {role?.slug || "N/A"}
                                    </p>
                                </div>
                            </div>

                            {/* Permission Count */}
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-green-50 p-2.5">
                                    <FiKey className="text-green-600" />
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Total Permissions
                                    </p>

                                    <p className="font-semibold text-gray-800">
                                        {permissions.length}
                                    </p>
                                </div>
                            </div>

                            {/* Created Date */}
                            <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-blue-50 p-2.5">
                                    <FiCalendar className="text-[#003963]" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500">
                                        Created On
                                    </p>

                                    <p className="font-medium text-gray-800">
                                        {role?.createdAt
                                            ? new Date(role.createdAt).toLocaleDateString("en-IN")
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role Information */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* Basic Information */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="mb-6">
                                <h2 className="text-lg font-bold text-gray-800">
                                    Basic Information
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    General information associated with this role.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                {/* Name */}
                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                    <div className="mb-2 flex items-center gap-2 text-gray-500">
                                        <FiShield />
                                        <span className="text-sm">Role Name</span>
                                    </div>

                                    <p className="wrap-break-words font-semibold text-gray-800">
                                        {role?.name || "N/A"}
                                    </p>
                                </div>

                                {/* Slug */}
                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                    <div className="mb-2 flex items-center gap-2 text-gray-500">
                                        <FiTag />
                                        <span className="text-sm">Role Slug</span>
                                    </div>

                                    <p className="break-all font-semibold text-gray-800">
                                        {role?.slug || "N/A"}
                                    </p>
                                </div>

                                {/* Status */}
                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                    <div className="mb-2 flex items-center gap-2 text-gray-500">
                                        {status === "active"
                                            ? <FiCheckCircle className="text-green-600" />
                                            : <FiXCircle className="text-red-600" />
                                        }

                                        <span className="text-sm">Role Status</span>
                                    </div>

                                    <p className={`font-semibold ${status === "active"
                                        ? "text-green-700"
                                        : "text-red-600"
                                        }`}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </p>
                                </div>

                                {/* Permissions Count */}
                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                                    <div className="mb-2 flex items-center gap-2 text-gray-500">
                                        <FiKey />
                                        <span className="text-sm">Permissions Assigned</span>
                                    </div>

                                    <p className="font-semibold text-gray-800">
                                        {permissions.length} Permissions
                                    </p>
                                </div>

                                {/* Description */}
                                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 md:col-span-2">
                                    <div className="mb-2 flex items-center gap-2 text-gray-500">
                                        <FiFileText />
                                        <span className="text-sm">Description</span>
                                    </div>

                                    <p className="whitespace-pre-wrap wrap-break-words text-sm leading-6 text-gray-700">
                                        {role?.description || "No description available for this role."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Permissions Section */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">
                                        Role Permissions
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Permissions assigned to this role.
                                    </p>
                                </div>

                                <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#003963]">
                                    {permissions.length} Total
                                </span>
                            </div>

                            {permissions.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {permissions.map((permission, index) => {
                                        const permissionName =
                                            typeof permission === "string"
                                                ? permission
                                                : permission?.name ||
                                                permission?.label ||
                                                permission?.slug ||
                                                permission?.key ||
                                                permission?._id ||
                                                "Unnamed Permission";

                                        return (
                                            <div
                                                key={
                                                    typeof permission === "object"
                                                        ? permission?._id || index
                                                        : permission
                                                }
                                                className="flex min-w-0 items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                                            >
                                                <div className="rounded-lg bg-white p-2 shadow-sm">
                                                    <FiLock className="text-[#003963]" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="wrap-break-words font-semibold text-gray-800">
                                                        {permissionName}
                                                    </p>

                                                    {typeof permission === "object" &&
                                                        permission?.description && (
                                                            <p className="mt-1 text-xs leading-5 text-gray-500">
                                                                {permission.description}
                                                            </p>
                                                        )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center">
                                    <FiKey className="mx-auto mb-3 text-3xl text-gray-400" />

                                    <p className="font-semibold text-gray-700">
                                        No Permissions Assigned
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        This role currently has no permissions.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Account Information */}
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-5 text-lg font-bold text-gray-800">
                                Record Information
                            </h2>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                {/* Created */}
                                <div className="flex items-start gap-4 rounded-xl border border-gray-100 p-4">
                                    <div className="rounded-lg bg-green-50 p-3">
                                        <FiCalendar className="text-green-600" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500">
                                            Created At
                                        </p>

                                        <p className="mt-1 wrap-break-words text-sm font-medium text-gray-800">
                                            {formatDate(role?.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Updated */}
                                <div className="flex items-start gap-4 rounded-xl border border-gray-100 p-4">
                                    <div className="rounded-lg bg-blue-50 p-3">
                                        <FiClock className="text-[#003963]" />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500">
                                            Last Updated
                                        </p>

                                        <p className="mt-1 wrap-break-words text-sm font-medium text-gray-800">
                                            {formatDate(role?.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );

};

export default RoleDetail;
