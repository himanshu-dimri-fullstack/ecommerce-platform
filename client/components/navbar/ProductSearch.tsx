
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
    FiSearch,
    FiFolder,
    FiShoppingBag
} from "react-icons/fi";
import type { RootState } from "@/redux/store";
import { API } from "@/axios/axios";

interface CategorySuggestion {
    _id: string;
    name: string;
    slug: string;
    image?: {
        url: string;
        public_id?: string;
    };
}

interface ProductSuggestion {
    _id: string;
    name: string;
    slug: string;
    images?: {
        url: string;
        public_id?: string;
    }[];
    category: {
        _id: string;
        name: string;
        slug: string;
    };
}

interface ProductSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const ProductSearch = ({
    value,
    onChange,
    placeholder = "Search categories and products..."
}: ProductSearchProps) => {
    const router = useRouter();

    const { store: nearestStore, loading: storeLoading } = useSelector(
        (state: RootState) => state.store
    );

    const [categories, setCategories] = useState<CategorySuggestion[]>([]);
    const [products, setProducts] = useState<ProductSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const wrapperRef = useRef<HTMLDivElement>(null);

    // FETCH CATEGORY AND PRODUCT SUGGESTIONS
    useEffect(() => {
        const query = value.trim();

        if (
            query.length < 2 ||
            !nearestStore?._id ||
            storeLoading
        ) {
            setCategories([]);
            setProducts([]);
            setLoading(false);
            return;
        }

        let isCancelled = false;

        const timer = setTimeout(async () => {
            try {
                setLoading(true);

                const res = await API.get(
                    "/product/search-suggestions",
                    {
                        params: {
                            storeId: nearestStore._id,
                            q: query
                        }
                    }
                );

                if (!isCancelled) {
                    setCategories(res.data.categories || []);
                    setProducts(res.data.products || []);
                    setIsOpen(true);
                }

            } catch (error) {
                if (!isCancelled) {
                    console.error("Search suggestions error:", error);
                    setCategories([]);
                    setProducts([]);
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        }, 300);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };

    }, [value, nearestStore?._id, storeLoading]);

    // CLOSE DROPDOWN ON OUTSIDE CLICK
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    // CATEGORY CLICK
    const handleCategoryClick = (category: CategorySuggestion) => {
        setIsOpen(false);
        onChange("");

        router.push(`/categories/${category.slug}`);
    };

    // PRODUCT CLICK
    const handleProductClick = (product: ProductSuggestion) => {
        setIsOpen(false);
        onChange("");

        router.push(
            `/products?category=${encodeURIComponent(product.category.slug)}&product=${encodeURIComponent(product.slug)}`
        );
    };

    // GENERAL SEARCH SUBMIT
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const query = value.trim();

        if (!query) return;

        setIsOpen(false);

        router.push(`/?search=${encodeURIComponent(query)}`);
    };

    const hasResults = categories.length > 0 || products.length > 0;

    return (
        <div ref={wrapperRef} className="relative w-full">

            {/* SEARCH INPUT */}
            <form
                onSubmit={handleSubmit}
                className="relative flex w-full items-center"
            >
                <FiSearch className="pointer-events-none absolute left-4 text-lg text-gray-400" />

                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (value.trim().length >= 2) {
                            setIsOpen(true);
                        }
                    }}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="h-12 w-full rounded-xl border border-transparent bg-gray-100 pl-11 pr-12 text-sm text-gray-800 transition-all placeholder:text-gray-400 focus:border-[#0c831f] focus:bg-white focus:outline-none"
                />

                <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-3 text-[#0c831f] transition-colors hover:text-[#096b19]"
                >
                    <FiSearch size={20} />
                </button>
            </form>

            {/* SUGGESTIONS DROPDOWN */}
            {isOpen && value.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-full z-100 mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">

                    {/* LOADING */}
                    {loading && (
                        <div className="space-y-3 p-4">
                            {[1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="flex animate-pulse items-center gap-3"
                                >
                                    <div className="h-12 w-12 rounded-lg bg-gray-100" />

                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-3/4 rounded bg-gray-100" />
                                        <div className="h-3 w-1/2 rounded bg-gray-100" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* EMPTY RESULTS */}
                    {!loading && !hasResults && (
                        <div className="px-4 py-8 text-center">
                            <FiSearch className="mx-auto mb-2 text-3xl text-gray-300" />

                            <p className="text-sm font-semibold text-gray-700">
                                No results found
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                                Try another category or product name.
                            </p>
                        </div>
                    )}

                    {!loading && hasResults && (
                        <div className="max-h-105 overflow-y-auto">

                            {/* CATEGORY RESULTS */}
                            {categories.length > 0 && (
                                <div>
                                    <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                            Categories
                                        </p>
                                    </div>

                                    {categories.map((category) => (
                                        <button
                                            key={category._id}
                                            type="button"
                                            onClick={() =>
                                                handleCategoryClick(category)
                                            }
                                            className="flex w-full items-center gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors hover:bg-green-50"
                                        >
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-green-50">
                                                {category.image?.url ? (
                                                    <img
                                                        src={category.image.url}
                                                        alt={category.name}
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <FiFolder className="text-xl text-[#0c831f]" />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-gray-800">
                                                    {category.name}
                                                </p>

                                                <p className="mt-0.5 text-xs text-gray-400">
                                                    Category
                                                </p>
                                            </div>

                                            <FiSearch className="shrink-0 text-gray-300" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* PRODUCT RESULTS */}
                            {products.length > 0 && (
                                <div>
                                    <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                            Products
                                        </p>
                                    </div>

                                    {products.map((product) => (
                                        <button
                                            key={product._id}
                                            type="button"
                                            onClick={() =>
                                                handleProductClick(product)
                                            }
                                            className="flex w-full items-center gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors hover:bg-green-50"
                                        >
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-50">
                                                {product.images?.[0]?.url ? (
                                                    <img
                                                        src={product.images[0].url}
                                                        alt={product.name}
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <FiShoppingBag className="text-xl text-gray-300" />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-gray-800">
                                                    {product.name}
                                                </p>

                                                <p className="mt-0.5 truncate text-xs text-gray-400">
                                                    {product.category?.name || "Product"}
                                                </p>
                                            </div>

                                            <FiSearch className="shrink-0 text-gray-300" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductSearch;
