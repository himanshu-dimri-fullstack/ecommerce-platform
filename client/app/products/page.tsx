"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { API } from "../../axios/axios.js"
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

interface Product {
    slug: string;
    name: string;
    unitValue: string
    unit: string;
    sellingPrice: number;
    mrp: number;
    images: [{
        url: string;
        public_url: string;
    }]
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

export default function ProductsPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [products, setProducts] = useState<Product[]>([])


    const fetchCategories = async () => {
        const res = await API.get("/admin/categories")

        setCategories(res.data.categories)
    }
    const fetchProducts = async () => {
        const res = await API.get("/admin/product/variant")
        console.log(res)
        setProducts(res.data.variants)
    }
    useEffect(() => {
        fetchCategories()
        fetchProducts()
    }, [])

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
                        <button
                            onClick={() => setSelectedCategory("all")}
                            className={`group rounded-xl border px-5 py-3.5 text-sm font-bold transition-all duration-200 sm:px-6 sm:py-4 sm:text-base ${selectedCategory === "all"
                                    ? "border-[#0c831f] bg-[#0c831f] text-white shadow-md shadow-green-900/15"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-[#0c831f]/40 hover:bg-green-50/70 hover:text-[#0c831f]"
                                }`}
                        >
                            All
                            <span
                                className={`ml-2 inline-block h-1.5 w-1.5 rounded-full ${selectedCategory === "all"
                                        ? "bg-white"
                                        : "bg-gray-300 group-hover:bg-[#0c831f]"
                                    }`}
                            />
                        </button>

                        {/* API Categories */}
                        {categories.map((category) => {
                            const isActive = selectedCategory === category.slug;

                            return (
                                <button
                                    key={category.slug}
                                    onClick={() => setSelectedCategory(category.slug)}
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
                                10 products available
                            </p>
                        </div>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                            {products.map((product) => {
                                const discount = Math.round(
                                    ((product.mrp - product.sellingPrice) / product.mrp) * 100
                                );
                                return (
                                    <article
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

                                            {/* <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold text-gray-600 shadow-sm">
                                                <FiClock className="text-[#0c831f]" />
                                                {product.deliveryTime}
                                            </span> */}
                                        </div>

                                        <div className="p-3 pt-1 sm:p-4 sm:pt-2">
                                            <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-gray-900 sm:text-base">
                                                {product.name}
                                            </h3>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {`${product.unitValue}` + " " + `${product.unit}`}
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


                                                <button

                                                    className="flex items-center gap-1 rounded-lg border border-[#0c831f] bg-green-50 px-3 py-2 text-sm font-extrabold text-[#0c831f] transition hover:bg-[#0c831f] hover:text-white"
                                                >
                                                    ADD <FiPlus />
                                                </button>

                                            </div>
                                        </div>
                                    </article>
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
                            description: "Carefully selected everyday essentials",
                        },
                        {
                            title: "Quick delivery",
                            description: "Get your groceries without the wait",
                        },
                        {
                            title: "Great prices",
                            description: "Everyday savings on daily essentials",
                        },
                    ].map((item) => (
                        <div key={item.title} className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#0c831f]">
                                <FiArrowRight size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-extrabold">{item.title}</h3>
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