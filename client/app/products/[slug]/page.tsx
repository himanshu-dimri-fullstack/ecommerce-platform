
"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    FiArrowLeft,
    FiShoppingCart,
    FiPlus,
    FiMinus,
    FiStar,
    FiTruck,
    FiShield,
    FiRefreshCw,
    FiCheckCircle,
} from "react-icons/fi";
import { useParams } from "next/navigation";
import { API } from "@/axios/axios";

export interface Image {
    url: string;
    public_id: string;
    public_url?: string;
}

export interface Dimensions {
    length: number | null;
    width: number | null;
    height: number | null;
}

export interface Brand {
    _id: string;
    name: string;
    slug: string;
}

export interface Category {
    _id: string;
    name: string;
    slug: string;
}

export interface Product {
    _id: string;
    name: string;
    slug: string;
    description: string;
    brand: Brand;
    category: Category;
    subcategory: Category;
    images: Image[];
    isActive: boolean;
    isFeatured: boolean;
    rating: number;
    tags: string[];
    totalReviews: number;
    unit: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface ProductVariant {
    _id: string;
    barcode: string | null;
    createdAt: string;
    updatedAt: string;
    dimensions: Dimensions;
    discountPercentage?: number;
    images: [{
        url: string;
        public_url: string;
    }]
    mrp: number;
    name: string;
    product: Product;
    sellingPrice: number;
    sku: string;
    slug: string;
    status: "active" | "inactive";
    unit: string;
    unitValue: number;
    weight: number;
    __v: number;
}

export interface ProductVariantResponse {
    message: string;
    success: boolean;
    variant: ProductVariant;
}

function ProductDetail() {
    const { slug } = useParams()

    const [category, setCategory] = useState<Category | null>(null);
    const [brand, setBrand] = useState<Brand | null>(null);
    const [product, setProduct] = useState<ProductVariant | null>(null);

    const fetchProduct = async () => {
        const res = await API.get(`/admin/product/variant/slug/${slug}`)
        console.log(res)
        setCategory(res.data.variant.product.category)
        setProduct(res.data.variant)
    }

    useEffect(() => {
        fetchProduct()
    }, [])

    return (
        <main className="min-h-screen bg-[#f8faf8] pb-12">
            {/* Breadcrumb */}
            <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-[#0c831f]"
                >
                    <FiArrowLeft size={17} />
                    Back to products
                </Link>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="hover:text-[#0c831f]">
                        Home
                    </Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-[#0c831f]">
                        Products
                    </Link>
                    {category && (
                        <>
                            <span>/</span>
                            <span>{category.name}</span>
                        </>
                    )}
                    <span>/</span>
                    <span className="font-semibold text-gray-900">
                        {product?.name}
                    </span>
                </div>
            </div>

            {/* Product Details */}
            <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Product Image */}
                    <section className="relative">
                        <div className="relative flex min-h-80 items-center justify-center overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 sm:min-h-120 sm:p-12">
                            {(product?.discountPercentage ?? 0) && (
                                <span className="absolute left-5 top-5 z-10 rounded-lg bg-[#0c831f] px-3 py-2 text-sm font-extrabold text-white">
                                    {product?.discountPercentage}% OFF
                                </span>
                            )}

                            {product?.images ? (
                                <div className="relative h-72 w-full sm:h-100">
                                    <Image
                                        src={product.images[0].url}
                                        alt={product.name}
                                        fill
                                        priority
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-72 items-center justify-center text-gray-300 sm:h-100">
                                    <FiShoppingCart size={80} />
                                </div>
                            )}
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-3">
                            <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-3">
                                <FiTruck className="shrink-0 text-[#0c831f]" size={20} />
                                <span className="text-xs font-semibold text-gray-700">
                                    Fast delivery
                                </span>
                            </div>

                            <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-3">
                                <FiShield className="shrink-0 text-[#0c831f]" size={20} />
                                <span className="text-xs font-semibold text-gray-700">
                                    Quality assured
                                </span>
                            </div>

                            <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white p-3">
                                <FiRefreshCw className="shrink-0 text-[#0c831f]" size={20} />
                                <span className="text-xs font-semibold text-gray-700">
                                    Easy support
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Product Information */}
                    <section className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-8">


                        {brand && (
                            <p className="mt-3 text-sm font-bold uppercase tracking-wider text-[#0c831f]">
                                {brand?.name}
                            </p>
                        )}

                        <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-gray-900 sm:text-4xl">
                            {product?.name}
                        </h1>

                        <p className="mt-3 text-sm font-medium text-gray-500">
                            {`${product?.unitValue}` + " " + `${product?.unit}`}
                        </p>

                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <p className="text-sm font-semibold text-gray-500">
                                Price
                            </p>

                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <span className="text-3xl font-black text-gray-900">
                                    ₹{product?.sellingPrice}
                                </span>

                                {(product?.discountPercentage ?? 0) && (
                                    <>
                                        <span className="text-lg text-gray-400 line-through">
                                            ₹{product?.mrp}
                                        </span>
                                        <span className="rounded-md bg-green-50 px-2 py-1 text-sm font-bold text-[#0c831f]">
                                            Save {product?.discountPercentage}%
                                        </span>
                                    </>
                                )}
                            </div>

                            <p className="mt-2 text-xs text-gray-500">
                                Inclusive of all applicable taxes
                            </p>
                        </div>

                        {/* Delivery */}
                        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[#f2faf3] p-4">
                            <FiTruck
                                size={22}
                                className="mt-0.5 shrink-0 text-[#0c831f]"
                            />
                            <div>
                                <p className="text-sm font-bold text-gray-900">
                                    Delivery to your doorstep
                                </p>
                                <p className="mt-1 text-sm text-gray-600">
                                    "Fast delivery available"
                                </p>
                            </div>
                        </div>

                        {/* Quantity and Cart */}
                        <div className="mt-7">
                            <p className="mb-3 text-sm font-bold text-gray-800">
                                Select quantity
                            </p>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex h-12 items-center rounded-xl border border-gray-200">
                                    <button
                                        type="button"
                                        aria-label="Decrease quantity"
                                        className="flex h-full w-11 items-center justify-center text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <FiMinus size={17} />
                                    </button>

                                    <span className="w-10 text-center font-bold text-gray-900">
                                        1
                                    </span>

                                    <button
                                        type="button"
                                        aria-label="Increase quantity"
                                        className="flex h-full w-11 items-center justify-center text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <FiPlus size={17} />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#0c831f] px-5 text-sm font-bold text-white transition hover:bg-[#096b19] disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    Add to Cart
                                </button>
                            </div>

                            <p className="mt-3 text-sm font-semibold text-gray-700">
                                Subtotal: ₹
                                {product?.sellingPrice ?? 0}
                            </p>
                        </div>

                        {/* Product Metadata */}
                        {(category?.name) && (
                            <div className="mt-7 border-t border-gray-100 pt-5">
                                <h2 className="text-sm font-bold text-gray-900">
                                    Product information
                                </h2>

                                <div className="mt-3 space-y-3 text-sm">
                                    {category?.name && (
                                        <div className="flex justify-between gap-4">
                                            <span className="text-gray-500">
                                                Category
                                            </span>
                                            <span className="text-right font-semibold text-gray-800">
                                                {category?.name}
                                            </span>
                                        </div>
                                    )}


                                    {brand && (
                                        <div className="flex justify-between gap-4">
                                            <span className="text-gray-500">
                                                Brand
                                            </span>
                                            <span className="font-semibold text-gray-800">
                                                {brand?.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading product...</div>}>
            <ProductDetail />
        </Suspense>
    );
}
