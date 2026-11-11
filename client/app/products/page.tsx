"use client";

import {
    useState,
    useEffect,
    Suspense,
    useRef,
    useCallback,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { API } from "@/axios/axios.js";
import {
    FiSearch,
    FiPlus,
    FiArrowRight,
    FiLoader,
} from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import { addToCart, fetchCart, setCart } from "@/redux/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";

interface Category {
    _id: string;
    name: string;
    image?: {
        url: string;
        public_id: string;
    };
    slug: string;
}

interface ProductDetails {
    _id: string;
    name: string;
    slug: string;
    category: string | {
        _id: string;
        name?: string;
        slug?: string;
    };
}

interface Variant {
    _id: string;
    product: ProductDetails;
    name: string;
    slug: string;
    unitValue: string;
    unit: string;
    sellingPrice: number;
    mrp: number;
    images: {
        url: string;
        public_url?: string;
    }[];
    rating: number;
    availableQuantity: number;
    inventoryId: string;
}

interface Pagination {
    currentPage: number;
    limit: number;
    totalVariants: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

const PAGE_LIMIT = 20;

function ProductsPage() {
    const user = useSelector((state: RootState) => state.auth.user);

    const {
        store: nearestStore,
        loading: storeLoading,
    } = useSelector((state: RootState) => state.store);

    const dispatch = useDispatch<AppDispatch>();

    const storeId = nearestStore?._id;

    // Prevent Redux store state from changing the HTML during hydration.
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [addingItems, setAddingItems] = useState<string[]>([]);
    const addingItemsRef = useRef(new Set<string>());

    const searchParams = useSearchParams();
    const router = useRouter();

    const productSlug = searchParams.get("product");
    const categorySlug = searchParams.get("category");

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Only ProductVariants are stored and rendered here.
    const [products, setProducts] = useState<Variant[]>([]);

    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [totalVariants, setTotalVariants] = useState(0);

    // Pagination and request handling refs
    const pageRef = useRef(1);
    const hasMoreRef = useRef(false);
    const loadingMoreRef = useRef(false);
    const requestVersionRef = useRef(0);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    // --------------------------------------------------
    // FETCH CATEGORIES
    // --------------------------------------------------

    useEffect(() => {
        if (storeLoading) {
            setCategoriesLoading(true);
            return;
        }

        if (!storeId) {
            setCategories([]);
            setCategoriesLoading(false);
            return;
        }

        let isActive = true;

        const fetchCategories = async () => {
            setCategoriesLoading(true);

            try {
                const response = await API.get(
                    `/category/store/${storeId}/available`
                );

                if (!isActive) return;

                setCategories(response.data.categories || []);
            } catch (error) {
                console.error("Categories fetch error:", error);

                if (isActive) {
                    setCategories([]);
                }
            } finally {
                if (isActive) {
                    setCategoriesLoading(false);
                }
            }
        };

        fetchCategories();

        return () => {
            isActive = false;
        };
    }, [storeId, storeLoading]);

    // --------------------------------------------------
    // FETCH FIRST PAGE
    // --------------------------------------------------

    useEffect(() => {
        // A new request version invalidates previous pagination requests.
        const requestVersion = ++requestVersionRef.current;

        let isActive = true;

        pageRef.current = 1;
        hasMoreRef.current = false;
        loadingMoreRef.current = false;

        setProducts([]);
        setHasMore(false);
        setLoadingMore(false);
        setTotalVariants(0);

        if (storeLoading) {
            setLoading(true);

            return () => {
                isActive = false;
            };
        }

        if (!storeId) {
            setProducts([]);
            setLoading(false);

            return () => {
                isActive = false;
            };
        }

        const fetchFirstPage = async () => {
            setLoading(true);

            try {
                const params = new URLSearchParams();

                params.set("page", "1");
                params.set("limit", String(PAGE_LIMIT));

                if (categorySlug) {
                    params.set("category", categorySlug);
                }

                if (productSlug) {
                    params.set("product", productSlug);
                }

                const response = await API.get(
                    `/inventory/store/${storeId}/available?${params.toString()}`
                );

                if (
                    !isActive ||
                    requestVersion !== requestVersionRef.current
                ) {
                    return;
                }

                const variants: Variant[] =
                    response.data.variants || [];

                const pagination: Pagination =
                    response.data.pagination;

                setProducts(variants);

                pageRef.current = 1;

                const nextPageAvailable = Boolean(
                    pagination?.hasNextPage
                );

                hasMoreRef.current = nextPageAvailable;
                setHasMore(nextPageAvailable);

                setTotalVariants(
                    pagination?.totalVariants ?? variants.length
                );
            } catch (error) {
                console.error("Store variants fetch error:", error);

                if (
                    isActive &&
                    requestVersion === requestVersionRef.current
                ) {
                    setProducts([]);
                    setHasMore(false);
                    hasMoreRef.current = false;
                    setTotalVariants(0);
                }
            } finally {
                if (
                    isActive &&
                    requestVersion === requestVersionRef.current
                ) {
                    setLoading(false);
                }
            }
        };

        fetchFirstPage();

        return () => {
            isActive = false;
        };
    }, [
        storeId,
        storeLoading,
        categorySlug,
        productSlug,
    ]);

    // --------------------------------------------------
    // FETCH NEXT PAGE
    // --------------------------------------------------

    const fetchNextPage = useCallback(async () => {
        if (
            !storeId ||
            storeLoading ||
            loading ||
            loadingMoreRef.current ||
            !hasMoreRef.current
        ) {
            return;
        }

        const requestVersion = requestVersionRef.current;
        const nextPage = pageRef.current + 1;

        loadingMoreRef.current = true;
        setLoadingMore(true);

        try {
            const params = new URLSearchParams();

            params.set("page", String(nextPage));
            params.set("limit", String(PAGE_LIMIT));

            if (categorySlug) {
                params.set("category", categorySlug);
            }

            if (productSlug) {
                params.set("product", productSlug);
            }

            const response = await API.get(
                `/inventory/store/${storeId}/available?${params.toString()}`
            );

            // Ignore stale responses after store/filter changes.
            if (requestVersion !== requestVersionRef.current) {
                return;
            }

            const variants: Variant[] =
                response.data.variants || [];

            const pagination: Pagination =
                response.data.pagination;

            // Append only the next page's variants.
            setProducts((prev) => [
                ...prev,
                ...variants,
            ]);

            pageRef.current = nextPage;

            const nextPageAvailable = Boolean(
                pagination?.hasNextPage
            );

            hasMoreRef.current = nextPageAvailable;
            setHasMore(nextPageAvailable);

            if (pagination?.totalVariants !== undefined) {
                setTotalVariants(pagination.totalVariants);
            }
        } catch (error) {
            console.error("Next variants page fetch error:", error);
        } finally {
            if (requestVersion === requestVersionRef.current) {
                loadingMoreRef.current = false;
                setLoadingMore(false);
            }
        }
    }, [
        storeId,
        storeLoading,
        loading,
        categorySlug,
        productSlug,
    ]);

    // --------------------------------------------------
    // INFINITE SCROLL OBSERVER
    // --------------------------------------------------

    useEffect(() => {
        const target = loadMoreRef.current;

        if (!target || loading || !hasMore) {
            observerRef.current?.disconnect();
            return;
        }

        observerRef.current?.disconnect();

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                if (entry?.isIntersecting) {
                    fetchNextPage();
                }
            },
            {
                root: null,
                rootMargin: "300px",
                threshold: 0,
            }
        );

        observer.observe(target);
        observerRef.current = observer;

        return () => {
            observer.disconnect();
        };
    }, [
        loading,
        loadingMore,
        hasMore,
        fetchNextPage,
        products.length,
    ]);

    // --------------------------------------------------
    // FETCH CART FOR SELECTED STORE
    // --------------------------------------------------

    useEffect(() => {
        if (storeLoading) return;

        // Guest cart Redux mein hi rahega.
        if (!user) return;

        // Previous store cart clear karo.
        dispatch(setCart([]));

        if (storeId) {
            dispatch(fetchCart(storeId));
        }
    }, [
        user,
        storeId,
        storeLoading,
        dispatch,
    ]);

    // --------------------------------------------------
    // KEEP SELECTED CATEGORY IN SYNC WITH URL
    // --------------------------------------------------

    useEffect(() => {
        setSelectedCategory(categorySlug || "All");
    }, [categorySlug]);

    // --------------------------------------------------
    // CATEGORY CLICK
    // --------------------------------------------------

    const handleCategoryClick = (slug: string) => {
        if (slug === "All") {
            router.push("/products");
        } else {
            router.push(`/products?category=${slug}`);
        }
    };

    // --------------------------------------------------
    // ADD TO CART
    // --------------------------------------------------

    const handleAddToCart = async (product: Variant) => {
        // Store select hona zaroori hai.
        if (!storeId || storeLoading) {
            return;
        }

        const variantId = product._id;

        // Guest user
        if (!user) {
            dispatch(addToCart({
                productId: product.product._id,
                productName: product.product.name,
                _id: product._id,
                name: product.name,
                unitValue: product.unitValue,
                unit: product.unit,
                image: product.images?.[0]?.url || "",
                sellingPrice: product.sellingPrice,
                mrp: product.mrp,
                quantity: 1,
            }));

            return;
        }

        // Prevent duplicate requests.
        if (addingItemsRef.current.has(variantId)) return;

        addingItemsRef.current.add(variantId);

        setAddingItems((prev) => [
            ...prev,
            variantId,
        ]);

        try {
            await API.post("/cart/add", {
                product: product.product._id,
                variant: product._id,
                quantity: 1,
                storeId,
            });

            // Fetch cart of the same store.
            await dispatch(fetchCart(storeId));
        } catch (error) {
            console.error("Failed to add product to cart:", error);
        } finally {
            addingItemsRef.current.delete(variantId);

            setAddingItems((prev) =>
                prev.filter((id) => id !== variantId)
            );
        }
    };

    const selectedCategoryName =
        categories.find(
            (category) => category.slug === selectedCategory
        )?.name || selectedCategory;

    const noStoreAvailable = isMounted && !storeLoading && !storeId;

    return (
        <main className="min-h-screen bg-[#f7f8f7] text-gray-900">
            {!isMounted || storeLoading ? (
                <div className="flex min-h-[70vh] items-center justify-center px-4">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#0c831f]" />
                        <p className="mt-4 text-sm font-medium text-gray-500">
                            Loading...
                        </p>
                    </div>
                </div>
            ) : noStoreAvailable ? (
                <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
                    <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 text-4xl">
                            📍
                        </div>

                        <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
                            No Store Available
                        </h2>

                        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
                            Sorry! We currently don't have a store serving your selected location.
                            Please try another delivery location.
                        </p>

                        <p className="mt-5 text-sm font-semibold text-[#0c831f]">
                            Change your delivery location to continue shopping.
                        </p>
                    </div>
                </div>
            ) : (
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

                    {/* Products / Variants */}
                    <section id="products" className="scroll-mt-40">
                        <div className="mb-5 flex items-end justify-between gap-3">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-[#0c831f]">
                                    Handpicked for you
                                </p>

                                <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                                    {selectedCategory === "All"
                                        ? "Popular products"
                                        : selectedCategoryName}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {loading
                                        ? "Loading variants..."
                                        : `${totalVariants} variants available`}
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
                        ) : products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                                    {products.map((product) => {
                                        const isAdding = addingItems.includes(
                                            product._id
                                        );

                                        const discount = product.mrp > 0
                                            ? Math.round(
                                                ((product.mrp - product.sellingPrice) /
                                                    product.mrp) * 100
                                            )
                                            : 0;

                                        return (
                                            <Link
                                                href={`/products/${product.slug}`}
                                                key={product._id}
                                                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition duration-200 hover:-translate-y-1 hover:border-green-100 hover:shadow-lg"
                                            >
                                                <div className="relative m-2 overflow-hidden rounded-xl bg-gray-50">
                                                    <div className="relative aspect-square">
                                                        {product.images?.[0]?.url ? (
                                                            <Image
                                                                src={product.images[0].url}
                                                                alt={product.name}
                                                                fill
                                                                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
                                                                className="object-cover transition duration-300 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full items-center justify-center">
                                                                <span className="text-3xl">
                                                                    🛍️
                                                                </span>
                                                            </div>
                                                        )}
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

                                                        <button
                                                            type="button"
                                                            disabled={isAdding}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleAddToCart(product);
                                                            }}
                                                            className="flex items-center gap-1 rounded-lg border border-[#0c831f] bg-green-50 px-3 py-2 text-sm font-extrabold text-[#0c831f] transition hover:bg-[#0c831f] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                                                        >
                                                            {isAdding ? (
                                                                <>
                                                                    <FiLoader
                                                                        className="animate-spin"
                                                                        size={15}
                                                                    />
                                                                    <span>Adding...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    ADD <FiPlus />
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Infinite Scroll Trigger */}
                                <div
                                    ref={loadMoreRef}
                                    className="flex min-h-16 items-center justify-center py-6"
                                >
                                    {loadingMore && (
                                        <div className="flex items-center gap-2 text-sm font-medium text-[#0c831f]">
                                            <FiLoader
                                                className="animate-spin"
                                                size={20}
                                            />
                                            Loading more variants...
                                        </div>
                                    )}

                                    {!hasMore && products.length > 0 && (
                                        <p className="text-sm text-gray-400">
                                            You have viewed all available variants.
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-16 text-center">
                                <FiSearch className="mx-auto h-10 w-10 text-gray-300" />

                                <h3 className="mt-4 text-lg font-bold">
                                    No variants found
                                </h3>

                                <p className="mt-2 text-sm text-gray-500">
                                    No variants are currently available at your selected store.
                                </p>
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
            )}
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