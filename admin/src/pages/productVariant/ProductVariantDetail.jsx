import { Link, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiPackage,
    FiTag,
    FiCalendar,
    FiClock,
    FiImage,
    FiFileText,
    FiLayers,
    FiBox,
    FiHash,
    FiActivity,
    FiDollarSign,
    FiPercent,
    FiShoppingBag,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import { API } from "../../api/axios";
import DataLoader from "../../components/DataLoader";

const ProductVariantDetail = () => {
    const { id } = useParams();

    const [variant, setVariant] = useState({});
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        const fetchProductVariant = async () => {
            try {
                const res = await API.get(`/admin/product/variant/${id}`);
                setVariant(res.data.variant);
            } catch (error) {
                console.log(error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchProductVariant();
    }, [id]);

    if (dataLoading) {
        return <DataLoader />;
    }

    const getName = (value) => {
        if (!value) return "-";

        if (typeof value === "object") {
            return value.name || value.title || "-";
        }

        return String(value);
    };

    const getImageUrl = (image) => {
        if (!image) return "";

        if (typeof image === "string") {
            return image;
        }

        return image.url || image.secure_url || "";
    };

    const images = Array.isArray(variant.images)
        ? variant.images
        : variant.images
            ? [variant.images]
            : [];

    const activeImages = images.filter((image) => getImageUrl(image));

    const active =
        variant.status === undefined
            ? true
            : variant.status === true ||
            variant.status === "active";

    const mrp = Number(variant.mrp) || 0;
    const sellingPrice = Number(variant.sellingPrice) || 0;

    const discount =
        variant.discountPercentage !== undefined &&
            variant.discountPercentage !== null
            ? Number(variant.discountPercentage)
            : mrp > 0
                ? Math.round(((mrp - sellingPrice) / mrp) * 100)
                : 0;

    const formatPrice = (price) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(Number(price) || 0);

    const formatDimensions = (dimensions) => {
        if (!dimensions) return "-";

        if (typeof dimensions === "string") {
            try {
                dimensions = JSON.parse(dimensions);
            } catch {
                return dimensions;
            }
        }

        if (typeof dimensions === "object") {
            return Object.entries(dimensions)
                .map(([key, value]) => `${key}: ${value}`)
                .join(" × ");
        }

        return String(dimensions);
    };

    const DetailCard = ({ icon: Icon, label, value, className = "" }) => (
        <div className={`rounded-xl border border-gray-100 bg-gray-50 p-4 ${className}`}>
            <div className="mb-2 flex items-center gap-2 text-gray-500">
                <Icon />
                <span className="text-sm">{label}</span>
            </div>

            <p className="wrap-break-words font-semibold text-gray-800">
                {value === undefined || value === null || value === ""
                    ? "-"
                    : value}
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                        <Link
                            to="/admin/product-variants"
                            className="transition hover:text-[#003963]"
                        >
                            Product Variants
                        </Link>

                        <span>/</span>

                        <span className="text-gray-700">
                            View Variant
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                        Product Variant Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View complete information about this product variant.
                    </p>
                </div>

                <Link
                    to="/admin/product-variants"
                    className="flex items-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                    <FiArrowLeft />
                    Back
                </Link>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Variant Profile */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                        {/* Main Image */}
                        <div className="mb-5 flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-slate-50">
                            {activeImages.length > 0 ? (
                                <img
                                    src={getImageUrl(activeImages[0])}
                                    alt={variant.name || "Product Variant"}
                                    className="h-full w-full object-contain p-3"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[#003963] text-white">
                                    <FiPackage size={52} />
                                </div>
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-gray-800">
                            {variant.name || "Unnamed Variant"}
                        </h2>

                        <p className="mt-2 break-all text-sm font-medium text-[#003963]">
                            SKU: {variant.sku || "-"}
                        </p>

                        <p className="mt-1 break-all text-sm text-gray-500">
                            Barcode: {variant.barcode || "-"}
                        </p>

                        {/* Status */}
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            <span
                                className={`rounded-full px-4 py-1.5 text-xs font-semibold ${active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {active ? "Active" : "Inactive"}
                            </span>

                            {discount > 0 && (
                                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold text-amber-700">
                                    <FiPercent size={12} />
                                    {discount}% OFF
                                </span>
                            )}
                        </div>

                        {/* Price */}
                        <div className="mt-6 w-full rounded-xl border border-blue-100 bg-blue-50 p-4">
                            <p className="text-sm text-gray-500">
                                Selling Price
                            </p>

                            <p className="mt-1 text-2xl font-bold text-[#003963]">
                                {formatPrice(variant.sellingPrice)}
                            </p>

                            {mrp > sellingPrice && (
                                <p className="mt-1 text-sm text-gray-500">
                                    MRP{" "}
                                    <span className="line-through">
                                        {formatPrice(mrp)}
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="my-6 border-t border-gray-100" />

                    <div className="space-y-4">
                        {/* Parent Product */}
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiShoppingBag className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Parent Product
                                </p>

                                <p className="wrap-break-words font-medium text-gray-800">
                                    {getName(variant.product)}
                                </p>
                            </div>
                        </div>

                        {/* Unit */}
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiBox className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Unit
                                </p>

                                <p className="font-medium text-gray-800">
                                    {variant.unitValue ?? "-"}{" "}
                                    {variant.unit || ""}
                                </p>
                            </div>
                        </div>

                        {/* Created */}
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiCalendar className="text-[#003963]" />
                            </div>

                            <div>
                                <p className="text-xs text-gray-500">
                                    Created
                                </p>

                                <p className="font-medium text-gray-800">
                                    {variant.createdAt
                                        ? new Date(
                                            variant.createdAt
                                        ).toLocaleDateString()
                                        : "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Variant Information */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-800">
                            Variant Information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Pricing, identification and physical specifications.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <DetailCard
                            icon={FiPackage}
                            label="Variant Name"
                            value={variant.name}
                        />

                        <DetailCard
                            icon={FiHash}
                            label="SKU"
                            value={variant.sku}
                        />

                        <DetailCard
                            icon={FiHash}
                            label="Barcode"
                            value={variant.barcode}
                        />

                        <DetailCard
                            icon={FiShoppingBag}
                            label="Parent Product"
                            value={getName(variant.product)}
                        />

                        <DetailCard
                            icon={FiDollarSign}
                            label="MRP"
                            value={formatPrice(variant.mrp)}
                        />

                        <DetailCard
                            icon={FiDollarSign}
                            label="Selling Price"
                            value={formatPrice(variant.sellingPrice)}
                        />

                        <DetailCard
                            icon={FiPercent}
                            label="Discount Percentage"
                            value={`${discount}%`}
                        />

                        <DetailCard
                            icon={FiBox}
                            label="Unit Value"
                            value={variant.unitValue}
                        />

                        <DetailCard
                            icon={FiLayers}
                            label="Unit"
                            value={variant.unit}
                        />

                        <DetailCard
                            icon={FiPackage}
                            label="Weight"
                            value={
                                variant.weight !== undefined &&
                                    variant.weight !== null &&
                                    variant.weight !== ""
                                    ? variant.weight
                                    : "-"
                            }
                        />

                        <DetailCard
                            icon={FiBox}
                            label="Dimensions"
                            value={formatDimensions(variant.dimensions)}
                        />

                        <DetailCard
                            icon={FiActivity}
                            label="Status"
                            value={
                                <span
                                    className={
                                        active
                                            ? "text-green-700"
                                            : "text-red-700"
                                    }
                                >
                                    {active ? "Active" : "Inactive"}
                                </span>
                            }
                        />

                        <DetailCard
                            icon={FiCalendar}
                            label="Created At"
                            value={
                                variant.createdAt
                                    ? new Date(
                                        variant.createdAt
                                    ).toLocaleString()
                                    : "-"
                            }
                        />

                        <DetailCard
                            icon={FiClock}
                            label="Last Updated"
                            value={
                                variant.updatedAt
                                    ? new Date(
                                        variant.updatedAt
                                    ).toLocaleString()
                                    : "-"
                            }
                        />

                        {/* Variant ID */}
                        <DetailCard
                            icon={FiHash}
                            label="Variant ID"
                            value={variant._id}
                            className="md:col-span-2"
                        />
                    </div>

                    {/* Description / Dimensions Information */}
                    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-gray-500">
                            <FiFileText />
                            <span className="text-sm">
                                Variant Summary
                            </span>
                        </div>

                        <p className="text-sm leading-6 text-gray-700">
                            {variant.name
                                ? `${variant.name} — ${variant.unitValue ?? ""} ${variant.unit || ""
                                } variant of ${getName(variant.product)}.`
                                : "No variant information available."}
                        </p>
                    </div>

                    {/* Variant Images */}
                    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-4 flex items-center gap-2 text-gray-500">
                            <FiImage />

                            <span className="text-sm">
                                Variant Images ({activeImages.length})
                            </span>
                        </div>

                        {activeImages.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                {activeImages.map((image, index) => (
                                    <div
                                        key={
                                            (typeof image === "object"
                                                ? image.public_id
                                                : "") ||
                                            getImageUrl(image) ||
                                            index
                                        }
                                        className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                                    >
                                        <div className="flex h-36 items-center justify-center bg-white p-2">
                                            <img
                                                src={getImageUrl(image)}
                                                alt={`${variant.name ||
                                                    "Variant"
                                                    } ${index + 1}`}
                                                className="h-full w-full object-contain"
                                            />
                                        </div>

                                        <div className="border-t border-gray-100 p-3">
                                            <p className="text-xs font-medium text-gray-700">
                                                Image {index + 1}
                                            </p>

                                            <p className="mt-1 break-all text-xs text-gray-500">
                                                {typeof image === "object"
                                                    ? image.public_id ||
                                                    "Public ID unavailable"
                                                    : "Cloudinary ID unavailable"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-8 text-gray-400">
                                <FiImage size={28} />

                                <p className="mt-2 text-sm">
                                    No variant images available.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <h2 className="mb-5 text-lg font-bold text-gray-800">
                            Variant Timeline
                        </h2>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">
                                <div className="rounded-lg bg-green-50 p-3">
                                    <FiCalendar className="text-green-600" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500">
                                        Variant Created
                                    </p>

                                    <p className="wrap-break-words font-medium text-gray-800">
                                        {variant.createdAt
                                            ? new Date(
                                                variant.createdAt
                                            ).toLocaleString()
                                            : "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">
                                <div className="rounded-lg bg-blue-50 p-3">
                                    <FiClock className="text-[#003963]" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500">
                                        Last Updated
                                    </p>

                                    <p className="wrap-break-words font-medium text-gray-800">
                                        {variant.updatedAt
                                            ? new Date(
                                                variant.updatedAt
                                            ).toLocaleString()
                                            : "-"}
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

export default ProductVariantDetail;