"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    FiArrowRight,
    FiSearch,
    FiShoppingBag,
} from "react-icons/fi";
import { API } from "../../../axios/axios.js"
import { useParams } from "next/navigation.js";

interface Subategory {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: {
        url: string;
        public_url?: string;
    };
    category: string;
}

function SubategoriesPage() {
    const { slug } = useParams()
    const [subcategories, setSubcategories] = useState<Subategory[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            const res = await API.get(`/admin/subcategories?category=${slug}`)
            setSubcategories(res.data.subcategories)
        }
        catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
            } else {
                console.log("An unknown error occurred");
            }
        }
        finally {
            setLoading(false)
        }

    }

    useEffect(() => {
        fetchCategories()
    }, [])

    return (
        <main className="min-h-screen bg-[#f8faf8]">

            {/* Categories Grid */}
            <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                <div className="mb-7 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[2px] text-[#0c831f]">
                            Find your favourites
                        </p>

                        <h2 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                            All Subcategories
                        </h2>
                    </div>

                    {!loading && (
                        <span className="shrink-0 rounded-full bg-green-50 px-3 py-2 text-xs font-bold text-[#0c831f]">
                            {subcategories.length} Subcategories
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
                            >
                                <div className="aspect-16/10 animate-pulse bg-gray-100" />
                                <div className="space-y-3 p-5">
                                    <div className="h-5 w-2/3 animate-pulse rounded bg-gray-100" />
                                    <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                                    <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : subcategories.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                        {subcategories.map((subcategory) => {
                            return (
                                <Link
                                    key={subcategory._id}
                                    href={`/categories/${slug}/${subcategory.slug}`}
                                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-green-100 hover:shadow-xl hover:shadow-green-950/5"
                                >
                                    {/* Category Image */}
                                    <div className="relative aspect-16/10 overflow-hidden bg-green-50">
                                        {subcategory?.image?.url ? (
                                            <Image
                                                src={subcategory.image.url}
                                                alt={subcategory.name}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                className="object-contain transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <FiShoppingBag
                                                    size={44}
                                                    className="text-[#0c831f]/40"
                                                />
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-70" />

                                        <span className="absolute bottom-3 left-3 rounded-lg border border-white/30 bg-white/90 px-3 py-1.5 text-xs font-bold text-[#0c831f] backdrop-blur-sm">
                                            Explore Category
                                        </span>
                                    </div>

                                    {/* Category Details */}
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="text-lg font-extrabold text-gray-900 transition-colors group-hover:text-[#0c831f]">
                                                {subcategory.name}
                                            </h3>

                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-[#0c831f] transition-all duration-300 group-hover:bg-[#0c831f] group-hover:text-white">
                                                <FiArrowRight
                                                    size={18}
                                                    className="transition-transform group-hover:translate-x-0.5"
                                                />
                                            </span>
                                        </div>

                                        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
                                            {subcategory.description ||
                                                `Explore our collection of ${subcategory.name.toLowerCase()} and find your everyday favourites.`}
                                        </p>

                                        <div className="mt-5 border-t border-gray-100 pt-4">
                                            <span className="text-sm font-bold text-[#0c831f]">
                                                Browse products
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-16 text-center">
                        <FiSearch
                            size={36}
                            className="mx-auto text-gray-300"
                        />

                        <h3 className="mt-4 text-lg font-bold text-gray-900">
                            No Subcategories found
                        </h3>
                    </div>
                )}
            </section>
        </main>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div>Loading product...</div>}>
            <SubategoriesPage />
        </Suspense>
    );
}