"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { API } from "../../axios/axios.js";
import {
    FiSearch,
    FiShoppingCart,
    FiMapPin,
    FiPlus,
    FiMinus,
    FiClock,
    FiArrowRight,
    FiX,
} from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";

interface Product {
    slug: string;
    name: string;
    unitValue: string;
    unit: string;
    sellingPrice: number;
    mrp: number;
    images: [
        {
            url: string;
            public_url: string;
        }
    ];
    rating: number;
}

interface Category {
    name: string;
    image: {
        url: string;
        public_id: string;
    };
    slug: string;
}

const theme = "#0c831f";

function ProductsPage() {
    const searchParams = useSearchParams();
    const productSlug = searchParams.get("product");
    const categorySlug = searchParams.get("category");

    const router = useRouter();

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            const res = await API.get("/admin/categories");
            setCategories(res.data.categories);
        } catch (error) {
            console.error(error);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const fetchProducts = async (slug: string) => {
        setLoading(true);

        try {
            if (productSlug) {
                const res = await API.get(
                    `/admin/product/variant?product=${slug}`
                );
                setProducts(res.data.variants);
                setSelectedCategory(categorySlug ?? "All");
            } else if (categorySlug) {
                const res = await API.get(
                    `/admin/product/variant?category=${slug}`
                );
                setProducts(res.data.variants);
                setSelectedCategory(categorySlug ?? "All");
            } else {
                console.log("my slug", slug);
                const res = await API.get(
                    `/admin/product/variant?category=${slug}`
                );
                setProducts(res.data.variants);
                setSelectedCategory("All");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryClick = (slug: string) => {
        // fetchProducts(slug)
        router.push(`/products?category=${slug}`);
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts((productSlug || categorySlug) ?? "All");
    }, [productSlug, categorySlug]);

    return (
        <main className="min-h-screen bg-[#f7f8f7] text-gray-900">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {/* Categories */}
                <section className="mb-10">
                    <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-[2px] text-[#0c831f]">
                            Shop by category
                        </p>

                        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                            What are you looking for?
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {/* All Categories */}
                        {categoriesLoading ? (
                            Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-12 w-28 animate-pulse rounded-xl bg-gray-200"
                                />
                            ))
                        ) : (
                            <>
                                <button
                                    onClick={() => handleCategoryClick("All")}
                                    className={`group rounded-xl border px-5 py-3.5 text-sm font-bold transition-all duration-200 sm:px-6 sm:py-4 sm:text-base ${selectedCategory === "All"
                                        ? "border-[#0c831f] bg-[#0c831f] text-white shadow-md shadow-green-900/15"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-[#0c831f]/40 hover:bg-green-50/70 hover:text-[#0c831f]"
                                        }`}
                                >
                                    All
                                    <span
                                        className={`ml-2 inline-block h-1.5 w-1.5 rounded-full ${selectedCategory === "All"
                                            ? "bg-white"
                                            : "bg-gray-300 group-hover:bg-[#0c831f]"
                                            }`}
                                    />
                                </button>

                                {/* API Categories */}
                                {categories.map((category) => {
                                    const isActive =
                                        selectedCategory === category.slug;

                                    return (
                                        <button
                                            key={category.slug}
                                            onClick={() =>
                                                handleCategoryClick(category.slug)
                                            }
                                            className={`group rounded-xl border px-5 py-3.5 text-sm font-bold transition-all duration-200 sm:px-6 sm:py-4 sm:text-base ${isActive
                                                ? "border-[#0c831f] bg-[#0c831f] text-white shadow-md shadow-green-900/15"
                                                : "border-gray-200 bg-white text-gray-700 hover:border-[#0c831f]/40 hover:bg-green-50/70 hover:text-[#0c831f]"
                                                }`}
                                        >
                                            {category.name}

                                            <span
                                                className={`ml-2 inline-block h-1.5 w-1.5 rounded-full ${isActive
                                                    ? "bg-white"
                                                    : "bg-gray-300 group-hover:bg-[#0c831f]"
                                                    }`}
                                            />
                                        </button>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </section>

                {/* Products */}
                <section id="products" className="scroll-mt-40">
                    <div className="mb-5 flex items-end justify-between gap-3">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#0c831f]">
                                Handpicked for you
                            </p>

                            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                                {selectedCategory === "All"
                                    ? "Popular products"
                                    : selectedCategory}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {loading
                                    ? "Loading products..."
                                    : `${products?.length} products available`}
                            </p>
                        </div>
                    </div>

                    {/* Product Skeleton */}
                    {loading ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
                                >
                                    <div className="m-2 aspect-square animate-pulse rounded-xl bg-gray-100" />

                                    <div className="space-y-3 p-3 pt-1 sm:p-4 sm:pt-2">
                                        <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
                                        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />

                                        <div className="mt-4 flex items-center justify-between gap-2">
                                            <div className="space-y-2">
                                                <div className="h-5 w-14 animate-pulse rounded bg-gray-200" />
                                                <div className="h-3 w-10 animate-pulse rounded bg-gray-100" />
                                            </div>

                                            <div className="h-9 w-16 animate-pulse rounded-lg bg-green-50" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products?.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                            {products.map((product) => {
                                const discount = Math.round(
                                    ((product.mrp - product.sellingPrice) /
                                        product.mrp) *
                                    100
                                );

                                return (
                                    <Link href={`/products/${product.slug}`}
                                        key={product.slug}
                                        className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition duration-200 hover:-translate-y-1 hover:border-green-100 hover:shadow-lg"
                                    >
                                        <div className="relative m-2 overflow-hidden rounded-xl bg-gray-50">
                                            <div className="relative aspect-square">
                                                <Image
                                                    src={product.images[0].url}
                                                    alt={product.name}
                                                    fill
                                                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                                                    className="object-cover transition duration-300 group-hover:scale-105"
                                                />
                                            </div>

                                            {discount > 0 && (
                                                <span className="absolute left-2 top-2 rounded-md bg-[#0c831f] px-2 py-1 text-[10px] font-extrabold text-white sm:text-xs">
                                                    {discount}% OFF
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-3 pt-1 sm:p-4 sm:pt-2">
                                            <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-gray-900 sm:text-base">
                                                {product.name}
                                            </h3>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {`${product.unitValue} ${product.unit}`}
                                            </p>

                                            <div className="mt-4 flex items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-base font-extrabold sm:text-lg">
                                                        ₹{product.sellingPrice}
                                                    </p>

                                                    <p className="text-xs text-gray-400 line-through">
                                                        ₹{product.mrp}
                                                    </p>
                                                </div>

                                                <button className="flex items-center gap-1 rounded-lg border border-[#0c831f] bg-green-50 px-3 py-2 text-sm font-extrabold text-[#0c831f] transition hover:bg-[#0c831f] hover:text-white">
                                                    ADD <FiPlus />
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-16 text-center">
                            <FiSearch className="mx-auto h-10 w-10 text-gray-300" />

                            <h3 className="mt-4 text-lg font-bold">
                                No products found
                            </h3>
                        </div>
                    )}
                </section>

                {/* Bottom Trust Section */}
                <section className="mt-12 grid grid-cols-1 gap-4 rounded-2xl border border-gray-100 bg-white p-5 sm:grid-cols-3 sm:p-7">
                    {[
                        {
                            title: "Fresh & quality",
                            description:
                                "Carefully selected everyday essentials",
                        },
                        {
                            title: "Quick delivery",
                            description:
                                "Get your groceries without the wait",
                        },
                        {
                            title: "Great prices",
                            description:
                                "Everyday savings on daily essentials",
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="flex items-start gap-3"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#0c831f]">
                                <FiArrowRight size={20} />
                            </div>

                            <div>
                                <h3 className="text-sm font-extrabold">
                                    {item.title}
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </main>
    );
}

export default function Page() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#f8faf8] px-4 py-10">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-8 h-8 w-64 animate-pulse rounded-lg bg-gray-200" />

                        <div className="mb-10 flex flex-wrap gap-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-12 w-28 animate-pulse rounded-xl bg-gray-200"
                                />
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
                                >
                                    <div className="m-2 aspect-square animate-pulse rounded-xl bg-gray-100" />

                                    <div className="space-y-3 p-3 sm:p-4">
                                        <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
                                        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                                        <div className="h-5 w-1/2 animate-pulse rounded bg-gray-200" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            <ProductsPage />
        </Suspense>
    );
}