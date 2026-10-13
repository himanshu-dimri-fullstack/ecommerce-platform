import { Link, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiPackage,
    FiTag,
    FiLink,
    FiCalendar,
    FiClock,
    FiImage,
    FiFileText,
    FiGrid,
    FiStar,
    FiLayers,
    FiAward,
    FiBox,
    FiHash,
    FiActivity,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import { API } from "../../api/axios";
import DataLoader from "../../components/DataLoader";

const ProductDetail = () => {
    const { id } = useParams();

    const [product, setProduct] = useState({});
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await API.get(`/admin/products/${id}`);
                setProduct(res.data.product);
            } catch (error) {
                console.log(error);
            } finally {
                setDataLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (dataLoading) {
        return <DataLoader />;
    }

    // Supports both populated objects and unpopulated IDs.
    const getName = (value) => {
        if (!value) return "-";

        if (typeof value === "object") {
            return value.name || value.title || "-";
        }

        return String(value);
    };

    // Supports image objects and Cloudinary URL strings.
    const getImageUrl = (image) => {
        if (!image) return "";

        if (typeof image === "string") {
            return image;
        }

        return image.url || image.secure_url || "";
    };

    const images = Array.isArray(product.images)
        ? product.images
        : product.images
            ? [product.images]
            : [];

    const activeImages = images.filter((image) => getImageUrl(image));
    const featured = Boolean(product.isFeatured);
    const active = product.isActive !== false;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                        <Link
                            to="/admin/products"
                            className="transition hover:text-[#003963]"
                        >
                            Products
                        </Link>

                        <span>/</span>

                        <span className="text-gray-700">
                            View Product
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                        Product Details
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        View complete information about this product.
                    </p>
                </div>

                <Link
                    to="/admin/products"
                    className="flex items-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                    <FiArrowLeft />
                    Back
                </Link>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* Product Profile */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col items-center text-center">

                        {/* Main Product Image */}
                        <div className="mb-5 flex h-48 w-full items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-slate-50">
                            {activeImages.length > 0 ? (
                                <img
                                    src={getImageUrl(activeImages[0])}
                                    alt={product.name || "Product"}
                                    className="h-full w-full object-contain p-3"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[#003963] text-white">
                                    <FiPackage size={52} />
                                </div>
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-gray-800">
                            {product.name || "Unnamed Product"}
                        </h2>

                        <p className="mt-1 break-all text-sm text-gray-500">
                            {product.slug || "-"}
                        </p>

                        {/* Status Badges */}
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                            <span
                                className={`rounded-full px-4 py-1.5 text-xs font-semibold ${active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {active ? "Active" : "Inactive"}
                            </span>

                            {featured && (
                                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-semibold text-amber-700">
                                    <FiStar size={12} />
                                    Featured
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="my-6 border-t border-gray-100" />

                    <div className="space-y-4">

                        {/* Category */}
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiGrid className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Category
                                </p>
                                <p className="wrap-break-words font-medium text-gray-800">
                                    {getName(product.category)}
                                </p>
                            </div>
                        </div>

                        {/* Subcategory */}
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiLayers className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Subcategory
                                </p>
                                <p className="wrap-break-words font-medium text-gray-800">
                                    {getName(product.subcategory)}
                                </p>
                            </div>
                        </div>

                        {/* Brand */}
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-50 p-2.5">
                                <FiAward className="text-[#003963]" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs text-gray-500">
                                    Brand
                                </p>
                                <p className="wrap-break-words font-medium text-gray-800">
                                    {getName(product.brand)}
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
                                    {product.createdAt
                                        ? new Date(product.createdAt).toLocaleDateString()
                                        : "-"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Information */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">

                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-800">
                            Product Information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Basic information associated with this product.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {/* Product Name */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiPackage />
                                <span className="text-sm">Product Name</span>
                            </div>

                            <p className="wrap-break-words font-semibold text-gray-800">
                                {product.name || "-"}
                            </p>
                        </div>

                        {/* Slug */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiLink />
                                <span className="text-sm">Product Slug</span>
                            </div>

                            <p className="break-all font-semibold text-gray-800">
                                {product.slug || "-"}
                            </p>
                        </div>

                        {/* Category */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiGrid />
                                <span className="text-sm">Category</span>
                            </div>

                            <p className="wrap-break-words font-semibold text-gray-800">
                                {getName(product.category)}
                            </p>
                        </div>

                        {/* Subcategory */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiLayers />
                                <span className="text-sm">Subcategory</span>
                            </div>

                            <p className="wrap-break-words font-semibold text-gray-800">
                                {getName(product.subcategory)}
                            </p>
                        </div>

                        {/* Brand */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiAward />
                                <span className="text-sm">Brand</span>
                            </div>

                            <p className="wrap-break-words font-semibold text-gray-800">
                                {getName(product.brand)}
                            </p>
                        </div>

                        {/* Unit */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiBox />
                                <span className="text-sm">Unit</span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {product.unit || "-"}
                            </p>
                        </div>

                        {/* Status */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiActivity />
                                <span className="text-sm">Status</span>
                            </div>

                            <p className={`font-semibold ${active ? "text-green-700" : "text-red-700"}`}>
                                {active ? "Active" : "Inactive"}
                            </p>
                        </div>

                        {/* Featured */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiStar />
                                <span className="text-sm">Featured Product</span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {featured ? "Yes" : "No"}
                            </p>
                        </div>

                        {/* Rating */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiStar />
                                <span className="text-sm">Rating</span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {product.rating ?? 0} / 5
                            </p>
                        </div>

                        {/* Total Reviews */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiActivity />
                                <span className="text-sm">Total Reviews</span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {product.totalReviews ?? 0}
                            </p>
                        </div>

                        {/* Product ID */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 md:col-span-2">
                            <div className="mb-2 flex items-center gap-2 text-gray-500">
                                <FiHash />
                                <span className="text-sm">Product ID</span>
                            </div>

                            <p className="break-all font-semibold text-gray-800">
                                {product._id || "-"}
                            </p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-gray-500">
                            <FiFileText />
                            <span className="text-sm">Description</span>
                        </div>

                        <p className="whitespace-pre-wrap wrap-break-words text-sm leading-6 text-gray-700">
                            {product.description || "No description available."}
                        </p>
                    </div>

                    {/* Tags */}
                    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center gap-2 text-gray-500">
                            <FiTag />
                            <span className="text-sm">Product Tags</span>
                        </div>

                        {Array.isArray(product.tags) && product.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map((tag, index) => (
                                    <span
                                        key={`${tag}-${index}`}
                                        className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-medium text-[#003963]"
                                    >
                                        {typeof tag === "object"
                                            ? tag.name || tag.label || "-"
                                            : tag}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">
                                No tags available.
                            </p>
                        )}
                    </div>

                    {/* Product Images */}
                    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-4 flex items-center gap-2 text-gray-500">
                            <FiImage />
                            <span className="text-sm">
                                Product Images ({activeImages.length})
                            </span>
                        </div>

                        {activeImages.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                {activeImages.map((image, index) => (
                                    <div
                                        key={image.public_id || getImageUrl(image) || index}
                                        className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                                    >
                                        <div className="flex h-36 items-center justify-center bg-white p-2">
                                            <img
                                                src={getImageUrl(image)}
                                                alt={`${product.name || "Product"} ${index + 1}`}
                                                className="h-full w-full object-contain"
                                            />
                                        </div>

                                        <div className="border-t border-gray-100 p-3">
                                            <p className="text-xs font-medium text-gray-700">
                                                Image {index + 1}
                                            </p>

                                            <p className="mt-1 break-all text-xs text-gray-500">
                                                {typeof image === "object"
                                                    ? image.public_id || "Public ID unavailable"
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
                                    No product images available.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Product Timeline */}
                    <div className="mt-8 border-t border-gray-100 pt-6">
                        <h2 className="mb-5 text-lg font-bold text-gray-800">
                            Product Timeline
                        </h2>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* Created */}
                            <div className="flex items-center gap-4 rounded-xl border border-gray-100 p-4">
                                <div className="rounded-lg bg-green-50 p-3">
                                    <FiCalendar className="text-green-600" />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-gray-500">
                                        Product Created
                                    </p>

                                    <p className="wrap-break-words font-medium text-gray-800">
                                        {product.createdAt
                                            ? new Date(product.createdAt).toLocaleString()
                                            : "-"}
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
                                        {product.updatedAt
                                            ? new Date(product.updatedAt).toLocaleString()
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

export default ProductDetail;