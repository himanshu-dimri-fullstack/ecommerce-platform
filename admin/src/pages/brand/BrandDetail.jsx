import { Link, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiTag,
    FiLink,
    FiCalendar,
    FiClock,
    FiImage,
    FiFileText,
    FiAward,
    FiHash,
} from "react-icons/fi";
import { API } from "../../api/axios";
import { useState, useEffect } from "react";
import DataLoader from "../../components/DataLoader";

const BrandDetail = () => {
    const { id } = useParams();

    const [brand, setBrand] = useState({});
    const [dataLoading, setDataLoading] = useState(true)

    useEffect(() => {
        const fetchBrand = async () => {
            try {
                const res = await API.get(`/admin/brands/${id}`);
                setBrand(res.data.brand || {});
            } catch (error) {
                console.error(
                    "Error fetching brand:",
                    error.response?.data || error.message
                );
            } finally {
                setDataLoading(false);
            }
        };

        fetchBrand();
    }, [id]);

    const isActive = brand.status?.toLowerCase() === "active";

    const formatDate = (date, includeTime = false) => {
        if (!date) return "-";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) return "-";

        return includeTime
            ? parsedDate.toLocaleString()
            : parsedDate.toLocaleDateString();
    };

    if (dataLoading) {
        return <DataLoader />
    }

    if (!brand._id) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
                <div className="mb-4 rounded-2xl bg-blue-50 p-5 text-[#003963]">
                    <FiAward size={36} />
                </div>

                <h2 className="text-xl font-bold text-gray-800">
                    Brand Not Found
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    The requested brand could not be found.
                </p>

                <Link
                    to="/admin/brands"
                    className="mt-6 flex items-center gap-2 rounded-lg bg-[#003963] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#002b4a]"
                >
                    <FiArrowLeft />
                    Back to Brands
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <Link
                            to="/admin/brands"
                            className="transition hover:text-[#003963]"
                        >
                            Brands
                        </Link>

                        <span>/</span>

                        <span className="text-gray-700">
                            View Brand
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                        Brand Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View complete information about this brand.
                    </p>
                </div>

                <Link
                    to="/admin/brands"
                    className="flex items-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                    <FiArrowLeft />
                    Back
                </Link>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* Brand Profile */}
                <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col items-center text-center">

                        {/* Brand Logo */}
                        <div className="mb-5 flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-slate-50 shadow-sm">
                            {brand.image?.url ? (
                                <img
                                    src={brand.image.url}
                                    alt={brand.name || "Brand"}
                                    className="h-full w-full object-contain p-2"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[#003963] text-white">
                                    <FiAward size={42} />
                                </div>
                            )}
                        </div>

                        <h2 className="wrap-break-words text-xl font-bold text-gray-800">
                            {brand.name || "Unnamed Brand"}
                        </h2>

                        <p className="mt-1 break-all text-sm text-gray-500">
                            {brand.slug || "-"}
                        </p>

                        <span
                            className={`mt-4 rounded-full px-4 py-1.5 text-xs font-semibold ${isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                        >
                            {brand.status || "Unknown"}
                        </span>
                    </div>

                    <div className="my-6 border-t border-gray-100" />

                    <div className="space-y-4">

                        {/* Brand Name */}
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiAward className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Brand Name
                                </p>

                                <p className="wrap-break-words font-medium text-gray-800">
                                    {brand.name || "-"}
                                </p>
                            </div>
                        </div>

                        {/* Brand Slug */}
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiLink className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Brand Slug
                                </p>

                                <p className="break-all font-medium text-gray-800">
                                    {brand.slug || "-"}
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
                                    Created On
                                </p>

                                <p className="font-medium text-gray-800">
                                    {formatDate(brand.createdAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brand Information */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">

                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-800">
                            Brand Information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Basic information associated with this brand.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {/* Brand Name */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiAward />
                                <span className="text-sm">Brand Name</span>
                            </div>

                            <p className="wrap-break-words font-semibold text-gray-800">
                                {brand.name || "-"}
                            </p>
                        </div>

                        {/* Slug */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiLink />
                                <span className="text-sm">Brand Slug</span>
                            </div>

                            <p className="break-all font-semibold text-gray-800">
                                {brand.slug || "-"}
                            </p>
                        </div>

                        {/* Status */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiTag />
                                <span className="text-sm">Status</span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {brand.status || "-"}
                            </p>
                        </div>

                        {/* Brand ID */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiHash />
                                <span className="text-sm">Brand ID</span>
                            </div>

                            <p className="break-all font-semibold text-gray-800">
                                {brand._id || "-"}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-gray-500">
                            <FiFileText />
                            <span className="text-sm">Description</span>
                        </div>

                        <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                            {brand.description || "No description available."}
                        </p>
                    </div>

                    {/* Brand Image */}
                    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center gap-2 text-gray-500">
                            <FiImage />
                            <span className="text-sm">Brand Logo</span>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-2">
                                {brand.image?.url ? (
                                    <img
                                        src={brand.image.url}
                                        alt={brand.name || "Brand logo"}
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <FiImage size={28} className="text-gray-400" />
                                )}
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Cloudinary Public ID
                                </p>

                                <p className="mt-1 break-all text-sm font-medium text-gray-700">
                                    {brand.image?.public_id || "-"}
                                </p>

                                {brand.image?.url && (
                                    <a
                                        href={brand.image.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 inline-block text-sm font-semibold text-[#003963] hover:underline"
                                    >
                                        View Original Image
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <h2 className="mb-5 text-lg font-bold text-gray-800">
                            Brand Timeline
                        </h2>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* Created */}
                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">
                                <div className="rounded-lg bg-green-50 p-3">
                                    <FiCalendar className="text-green-600" size={20} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500">
                                        Brand Created
                                    </p>

                                    <p className="mt-1 wrap-break-words font-medium text-gray-800">
                                        {formatDate(brand.createdAt, true)}
                                    </p>
                                </div>
                            </div>

                            {/* Updated */}
                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">
                                <div className="rounded-lg bg-blue-50 p-3">
                                    <FiClock className="text-[#003963]" size={20} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500">
                                        Last Updated
                                    </p>

                                    <p className="mt-1 wrap-break-words font-medium text-gray-800">
                                        {formatDate(brand.updatedAt, true)}
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

export default BrandDetail;