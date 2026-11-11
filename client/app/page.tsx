

"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {

    FiArrowRight,

    FiClock,

    FiStar,

    FiShield,

    FiTruck,

    FiHeadphones,

} from "react-icons/fi";

import { API } from "@/axios/axios.js";

import Image from "next/image";

import { useSelector } from "react-redux";

import type { RootState } from "@/redux/store";

interface Category {

    name: string;

    image: {

        url: string;

        public_id: string;

    };

    slug: string;

}

interface Product {

    _id: string;

    slug: string;

    name: string;

    category: {

        slug: string;

        name?: string;

    };

    images: {

        url: string;

        public_url?: string;

    }[];

    startingPrice: number;

}

interface Offer {

    title: string;

    description: string;

    discount: string;

    emoji: string;

    linear: string;

    badgeBg: string;

    href: string;

}

const offers: Offer[] = [

    {

        title: "Freshness First",

        description: "Farm-fresh fruits & organic veggies",

        discount: "UP TO 30% OFF",

        emoji: "🥦",

        linear:

            "from-emerald-500/10 via-green-100 to-emerald-50 border-emerald-200/60",

        badgeBg: "bg-emerald-600 text-white",

        href: "/categories/fruits-vegetables",

    },

    {

        title: "Snack Attack!",

        description: "Munchies, chips & cold beverages",

        discount: "STARTING ₹20",

        emoji: "🍿",

        linear:

            "from-amber-500/10 via-orange-100 to-amber-50 border-amber-200/60",

        badgeBg: "bg-amber-600 text-white",

        href: "/categories/snacks-munchies",

    },

    {

        title: "Daily Staples",

        description: "Atta, rice, dal & cooking oils",

        discount: "BIG SAVINGS",

        emoji: "🛒",

        linear:

            "from-blue-500/10 via-sky-100 to-blue-50 border-blue-200/60",

        badgeBg: "bg-blue-600 text-white",

        href: "/products",

    },

];

function Skeleton({

    className = "",

}: {

    className?: string;

}) {

    return (

        <div

            className={`animate-pulse rounded-lg bg-gray-200 ${className}`}

        />

    );

}

function CategorySkeleton() {

    return (

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">

            {Array.from({ length: 8 }).map((_, index) => (

                <div

                    key={index}

                    className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"

                >

                    <Skeleton className="h-16 w-16 rounded-2xl" />

                    <Skeleton className="mt-3 h-3 w-20 max-w-full" />

                    <Skeleton className="mt-1 h-3 w-14 max-w-full" />

                </div>

            ))}

        </div>

    );

}

function ProductSkeleton() {

    return (

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">

            {Array.from({ length: 10 }).map((_, index) => (

                <article

                    key={index}

                    className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white"

                >

                    <div className="relative aspect-square w-full p-4">

                        <Skeleton className="h-full w-full rounded-xl" />

                    </div>

                    <div className="space-y-2 p-3.5">

                        <Skeleton className="h-4 w-4/5" />

                        <Skeleton className="h-3 w-1/3" />

                        <Skeleton className="h-3 w-1/4" />

                    </div>

                </article>

            ))}

        </div>

    );

}

export default function ShopPage() {

    const {
        store: nearestStore,
        loading: storeLoading,
    } = useSelector((state: RootState) => state.store);

    // Prevent hydration mismatch: render the same loading UI on the server
    // and during the browser's first render.
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const storeId = nearestStore?._id;

    const [categories, setCategories] = useState<Category[]>([]);

    const [products, setProducts] = useState<Product[]>([]);

    // Skeleton loading states

    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const [productsLoading, setProductsLoading] = useState(true);

    const [banners, setBanners] = useState([]);

    // Fetch categories according to current store

    const fetchCategories = async (currentStoreId: string) => {

        try {

            setCategoriesLoading(true);

            const res = await API.get(

                `/category/store/${currentStoreId}/available`

            );

            setCategories(res.data.categories || []);

        } catch (error) {

            console.error("Categories fetch error:", error);

            setCategories([]);

        } finally {

            setCategoriesLoading(false);

        }

    };

    // Fetch featured products according to current store

    const fetchProducts = async (currentStoreId: string) => {

        try {

            setProductsLoading(true);

            const res = await API.get(

                `/inventory/store/${currentStoreId}/featured`

            );

            setProducts(

                (res.data.products || []).slice(0, 10)

            );

        } catch (error) {

            console.error("Failed to fetch featured products:", error);

            setProducts([]);

        } finally {

            setProductsLoading(false);

        }

    };

    // Fetch banners

    const getBanners = async () => {

        try {

            const res = await API.get("/banner/get");

            if (res.data.success) {

                setBanners(res.data.banners || []);

            }

        } catch (error) {

            console.error("Get banners error:", error);

        }

    };

    // Existing banner HTML formatter

    const formatBannerHtml = (html = "") => {

        const cleanedHtml = html.replace(/<\/?p>/g, "");

        const textarea = document.createElement("textarea");

        textarea.innerHTML = cleanedHtml;

        return textarea.value;

    };

    // Get banners once

    useEffect(() => {

        getBanners();

    }, []);

    // Fetch categories and featured products whenever store changes

    useEffect(() => {

        if (!isMounted || storeLoading) {

            setCategoriesLoading(true);

            setProductsLoading(true);

            return;

        }

        if (storeId) {

            fetchCategories(storeId);

            fetchProducts(storeId);

        } else {

            setCategories([]);

            setProducts([]);

            setCategoriesLoading(false);

            setProductsLoading(false);

        }

    }, [storeId, storeLoading]);

    // Store is still loading

    if (!isMounted || storeLoading) {

        return (

            <main className="flex min-h-screen items-center justify-center bg-[#F8FAF9] px-4">

                <div className="text-center">

                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#0c831f]" />

                    <h2 className="mt-4 text-lg font-bold text-gray-800">

                        Finding your store...

                    </h2>

                    <p className="mt-1 text-sm text-gray-500">

                        Please wait while we check availability in your area.

                    </p>

                </div>

            </main>

        );

    }

    // No store available

    if (!storeId) {

        return (

            <main className="flex min-h-screen items-center justify-center bg-[#F8FAF9] px-4">

                <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm">

                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-4xl">

                        📍

                    </div>

                    <h2 className="mt-5 text-xl font-black text-gray-900">

                        No Store Available

                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-500">

                        Sorry, QUICK KART is currently not available in your area.

                        We are working hard to expand our delivery locations.

                    </p>

                    <p className="mt-4 text-xs font-semibold text-[#0c831f]">

                        Please try another delivery location.

                    </p>

                </div>

            </main>

        );

    }

    return (

        <main className="min-h-screen bg-[#F8FAF9] pb-20 text-gray-900">

            {/* HERO SECTION */}

            <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">

                <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0c831f] via-emerald-800 to-green-950 p-6 shadow-2xl shadow-green-900/20 sm:p-10 lg:p-12">

                    <div className="absolute -right-12 -top-12 h-80 w-80 rounded-full bg-lime-400/20 blur-3xl" />

                    <div className="absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-emerald-400/10 blur-2xl" />

                    <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12">

                        <div className="lg:col-span-7">

                            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-extrabold text-lime-300 backdrop-blur-md">

                                <FiClock className="animate-spin" size={14} />

                                <span>LIGHTNING FAST GROCERY DELIVERY</span>

                            </div>

                            <h1 className="mt-4 text-3xl font-black leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">

                                Groceries delivered <br className="hidden sm:block" />

                                <span className="bg-linear-to-r from-lime-300 via-emerald-200 to-white bg-clip-text text-transparent">

                                    in just 10 minutes.

                                </span>

                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-relaxed text-emerald-100/90 sm:text-base">

                                Get fresh vegetables, daily dairy essentials, snacks, and home

                                needs delivered fresh to your door right when you need them.

                            </p>

                            <div className="mt-6 flex flex-wrap items-center gap-3">

                                <Link

                                    href="/products"

                                    className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-6 py-3.5 text-sm font-extrabold text-green-950 shadow-lg shadow-lime-400/30 transition-all duration-200 hover:scale-[1.02] hover:bg-lime-300 active:scale-95"

                                >

                                    Order Now <FiArrowRight size={18} />

                                </Link>

                                <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">

                                    <span className="text-2xl">⚡</span>

                                    <div>

                                        <p className="text-xs font-black uppercase tracking-wider text-white">

                                            Superfast

                                        </p>

                                        <p className="text-[11px] text-emerald-200">

                                            Live order tracking

                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                        <div className="relative hidden items-center justify-center lg:col-span-5 lg:flex">

                            <div className="grid grid-cols-2 gap-3.5 p-2">

                                {[

                                    {

                                        emoji: "🥑",

                                        title: "Fresh Produce",

                                        sub: "Daily harvested",

                                        bg: "bg-white/90",

                                    },

                                    {

                                        emoji: "🥛",

                                        title: "Dairy & Eggs",

                                        sub: "100% Pure",

                                        bg: "bg-amber-50/90",

                                    },

                                    {

                                        emoji: "🍓",

                                        title: "Farm Berries",

                                        sub: "Sweet & Fresh",

                                        bg: "bg-rose-50/90",

                                    },

                                    {

                                        emoji: "🥐",

                                        title: "Fresh Bakery",

                                        sub: "Baked Today",

                                        bg: "bg-orange-50/90",

                                    },

                                ].map((item, idx) => (

                                    <div

                                        key={idx}

                                        className={`${item.bg} flex flex-col items-center justify-center rounded-2xl border border-white/40 p-4 text-center shadow-xl backdrop-blur-md transition duration-300 hover:-translate-y-1`}

                                    >

                                        <span className="text-4xl drop-shadow-md sm:text-5xl">

                                            {item.emoji}

                                        </span>

                                        <span className="mt-2 text-xs font-black text-gray-800">

                                            {item.title}

                                        </span>

                                        <span className="text-[10px] font-medium text-gray-500">

                                            {item.sub}

                                        </span>

                                    </div>

                                ))}

                            </div>

                        </div>

                    </div>

                </div>

            </section>

            {/* VALUE PROPOSITION STRIP */}

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                    {[

                        {

                            icon: FiTruck,

                            title: "10-Min Express Delivery",

                            text: "Your daily essentials, delivered fast.",

                            tag: "QUICK DELIVERY",

                        },

                        {

                            icon: FiShield,

                            title: "Quality You Can Trust",

                            text: "Carefully selected products, every time.",

                            tag: "QUALITY ASSURED",

                        },

                        {

                            icon: FiHeadphones,

                            title: "We're Here to Help",

                            text: "We're just a message away whenever you need us.",

                            tag: "CUSTOMER SUPPORT",

                        },

                    ].map((item, i) => {

                        const Icon = item.icon;

                        return (

                            <div

                                key={i}

                                className="group relative overflow-hidden rounded-2xl border border-green-100/80 bg-linear-to-br from-[#f0fdf4] via-white to-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-[0_12px_35px_rgba(12,131,31,0.09)] sm:p-6"

                            >

                                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-green-100/40 blur-2xl transition-all duration-500 group-hover:scale-150" />

                                <div className="relative flex items-center gap-4">

                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0c831f] text-white shadow-lg shadow-green-900/15 transition-all duration-300 group-hover:rotate-3 group-hover:scale-105">

                                        <Icon size={25} strokeWidth={1.8} />

                                    </div>

                                    <div className="min-w-0">

                                        <span className="inline-flex rounded-md bg-green-100 px-2 py-1 text-[9px] font-extrabold tracking-[0.12em] text-[#0c831f]">

                                            {item.tag}

                                        </span>

                                        <h3 className="mt-2 text-sm font-extrabold tracking-tight text-gray-900 sm:text-base">

                                            {item.title}

                                        </h3>

                                        <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">

                                            {item.text}

                                        </p>

                                    </div>

                                </div>

                            </div>

                        );

                    })}

                </div>

            </section>

            {/* CATEGORIES GRID */}

            <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">

                <div className="mb-5 flex items-center justify-between">

                    <div>

                        <h2 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">

                            Shop by Category

                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500">

                            Explore our wide range of essentials

                        </p>

                    </div>

                    <Link

                        href="/categories"

                        className="group flex items-center gap-1 text-xs font-bold text-[#0c831f] hover:text-emerald-700"

                    >

                        See All{" "}

                        <FiArrowRight

                            className="transition duration-200 group-hover:translate-x-1"

                            size={14}

                        />

                    </Link>

                </div>

                {categoriesLoading ? (

                    <CategorySkeleton />

                ) : (

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">

                        {categories.map((category) => (

                            <Link

                                key={category.slug}

                                href={`/categories/${category.slug}`}

                                className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-3 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"

                            >

                                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl transition duration-300 group-hover:scale-110">

                                    {category.image?.url ? (

                                        <Image

                                            loading="eager"

                                            alt={category.name}

                                            src={category.image.url}

                                            fill

                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"

                                            className="h-full w-full object-cover"

                                        />

                                    ) : (

                                        <span className="flex h-full w-full items-center justify-center text-4xl">

                                            🛍️

                                        </span>

                                    )}

                                </div>

                                <h3 className="mt-2.5 line-clamp-2 text-xs font-bold leading-tight text-gray-800">

                                    {category.name}

                                </h3>

                            </Link>

                        ))}

                    </div>

                )}

            </section>

            {/* OFFERS & BANNERS */}

            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                <div className="grid gap-4 md:grid-cols-3">

                    {offers.map((offer) => (

                        <Link

                            href={offer.href}

                            key={offer.title}

                            className={`group relative flex items-center justify-between overflow-hidden rounded-3xl border bg-linear-to-br p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md ${offer.linear}`}

                        >

                            <div className="relative z-10 max-w-[65%]">

                                <span

                                    className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${offer.badgeBg}`}

                                >

                                    {offer.discount}

                                </span>

                                <h3 className="mt-2 text-lg font-black leading-snug text-gray-900">

                                    {offer.title}

                                </h3>

                                <p className="mt-1 line-clamp-2 text-xs text-gray-600">

                                    {offer.description}

                                </p>

                                <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#0c831f] group-hover:underline">

                                    Shop Now <FiArrowRight size={14} />

                                </span>

                            </div>

                            <span className="absolute -bottom-2 -right-2 text-7xl transition duration-300 group-hover:rotate-6 group-hover:scale-110">

                                {offer.emoji}

                            </span>

                        </Link>

                    ))}

                </div>

            </section>

            {/* FEATURED PRODUCTS */}

            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                <div className="mb-5 flex items-center justify-between">

                    <div>

                        <h2 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">

                            Featured Products

                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500">

                            Most ordered item in your area

                        </p>

                    </div>

                    <Link

                        href="/products"

                        className="group flex items-center gap-1 text-xs font-bold text-[#0c831f] hover:text-emerald-700"

                    >

                        See All{" "}

                        <FiArrowRight

                            className="transition duration-200 group-hover:translate-x-1"

                            size={14}

                        />

                    </Link>

                </div>

                {productsLoading ? (

                    <ProductSkeleton />

                ) : products.length === 0 ? (

                    <div className="rounded-2xl border border-gray-100 bg-white px-5 py-12 text-center">

                        <span className="text-4xl">🛍️</span>

                        <h3 className="mt-3 text-base font-bold text-gray-800">

                            No featured products available

                        </h3>

                        <p className="mt-1 text-sm text-gray-500">

                            Featured products will appear here when available in your store.

                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">

                        {products.slice(0, 10).map((product) => (

                            <Link

                                key={product._id}

                                href={`/products?category=${encodeURIComponent(

                                    product.category.slug

                                )}&product=${encodeURIComponent(

                                    product.slug

                                )}`}

                                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white transition duration-200 hover:border-emerald-200 hover:shadow-lg"

                            >

                                <div className="relative flex aspect-square w-full items-center justify-center bg-linear-to-b p-4">

                                    {product.images?.[0]?.url ? (

                                        <Image

                                            loading="eager"

                                            alt={product.name}

                                            src={product.images[0].url}

                                            fill

                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"

                                            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"

                                        />

                                    ) : (

                                        <span className="flex h-full w-full items-center justify-center text-4xl">

                                            🛍️

                                        </span>

                                    )}

                                </div>

                                <div className="flex flex-1 flex-col p-3.5">

                                    <h3 className="line-clamp-2 text-xs font-bold text-gray-800 transition-colors group-hover:text-[#0c831f] sm:text-sm">

                                        {product.name}

                                    </h3>

                                    <div className="mt-auto pt-3">

                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">

                                            Starts from

                                        </p>

                                        <span className="text-base font-black text-gray-900 sm:text-lg">

                                            ₹{product.startingPrice}

                                        </span>

                                    </div>

                                </div>

                            </Link>

                        ))}

                    </div>

                )}

            </section>

        </main>

    );

}
