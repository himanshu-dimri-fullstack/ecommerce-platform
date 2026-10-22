"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    FiZap,
    FiMapPin,
    FiSearch,
    FiUser,
    FiShoppingCart,
    FiMenu,
    FiX,
    FiChevronDown,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import LoginModal from "@/components/auth/LoginModal";

// Navbar Skeleton
function NavbarSkeleton() {
    return (
        <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
                <div className="hidden h-11 w-96 animate-pulse rounded-xl bg-gray-100 md:block" />
                <div className="flex items-center gap-4">
                    <div className="h-10 w-20 animate-pulse rounded-lg bg-gray-100" />
                    <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
                </div>
            </div>
        </header>
    );
}

function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    const user = useSelector((store: RootState) => store.auth.user);
    const cartItems = useSelector((store: RootState) => store.cart.items);

    // Unique cart items count
    const cartCount = cartItems?.length ?? 0;

    const [loginOpen, setLoginOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [location, setLocation] = useState("Select Location");
    const [locationOpen, setLocationOpen] = useState(false);

    const searchRef = useRef<HTMLInputElement>(null);
    const locationRef = useRef<HTMLDivElement>(null);

    const navLinks = [
        { label: "Home", href: "/" },
        { label: "All Products", href: "/products" },
    ];

    const accountLinks = [
        { label: "Login", href: "#login", icon: FiUser },
        { label: "My Cart", href: "/cart", icon: FiShoppingCart },
    ];

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const query = search.trim();

        if (query) {
            router.push(`/?search=${encodeURIComponent(query)}`);
        }
    };

    const handleSearchBar = () => {
        if (pathname !== "/search") {
            router.push("/search");
        }
    };

    const handleAccountClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        label: string
    ) => {
        if (label === "Login") {
            e.preventDefault();
            setLoginOpen(true);
            setMobileMenuOpen(false);
        }
    };

    useEffect(() => {
        if (pathname === "/search") {
            searchRef.current?.focus();
        }
    }, [pathname]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                locationRef.current &&
                !locationRef.current.contains(event.target as Node)
            ) {
                setLocationOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 items-center justify-between gap-5">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="flex shrink-0 items-center gap-2"
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0c831f] text-white">
                                <FiZap size={23} />
                            </span>

                            <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                                QUICK <span className="text-[#0c831f]">KART</span>
                            </span>
                        </Link>

                        {/* Location */}
                        <div
                            ref={locationRef}
                            className="relative hidden shrink-0 lg:block"
                        >
                            <button
                                type="button"
                                onClick={() => setLocationOpen(!locationOpen)}
                                className="flex items-center gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-gray-50"
                            >
                                <FiMapPin
                                    size={21}
                                    className="text-[#0c831f]"
                                />

                                <div>
                                    <p className="text-xs font-medium text-gray-500">
                                        Deliver to
                                    </p>
                                    <p className="flex items-center gap-1 text-sm font-bold text-gray-800">
                                        {location}
                                        <FiChevronDown size={14} />
                                    </p>
                                </div>
                            </button>

                            {locationOpen && (
                                <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
                                    <p className="mb-3 text-sm font-bold text-gray-800">
                                        Choose your location
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLocation("Jaipur");
                                            setLocationOpen(false);
                                        }}
                                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-green-50 hover:text-[#0c831f]"
                                    >
                                        Jaipur
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setLocation("Delhi");
                                            setLocationOpen(false);
                                        }}
                                        className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-green-50 hover:text-[#0c831f]"
                                    >
                                        Delhi
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Search */}
                        <form
                            onSubmit={handleSearch}
                            className="hidden min-w-0 flex-1 md:block"
                        >
                            <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-[#0c831f] focus-within:bg-white focus-within:ring-4 focus-within:ring-green-50">
                                <FiSearch
                                    size={21}
                                    className="shrink-0 text-gray-500"
                                />

                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onFocus={handleSearchBar}
                                    placeholder="Search for products, brands and more..."
                                    className="h-full w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        className="shrink-0 text-gray-400 transition hover:text-gray-700"
                                        aria-label="Clear search"
                                    >
                                        <FiX size={18} />
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Desktop Navigation */}
                        <nav className="hidden items-center gap-5 xl:flex">
                            {navLinks.map((item) => {
                                const active =
                                    pathname === item.href ||
                                    (item.href !== "/" &&
                                        pathname.startsWith(item.href));

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`whitespace-nowrap text-sm font-bold transition ${active
                                            ? "text-[#0c831f]"
                                            : "text-gray-700 hover:text-[#0c831f]"
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Desktop Account Actions */}
                        <div className="hidden shrink-0 items-center gap-3 md:flex">
                            {accountLinks.map(({ label, href, icon: Icon }) => (
                                <Link
                                    key={label}
                                    href={href}
                                    onClick={(e) =>
                                        handleAccountClick(e, label)
                                    }
                                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${label === "My Cart"
                                        ? "bg-green-50 text-[#0c831f] hover:bg-green-100"
                                        : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    <span className="relative inline-flex">
                                        <Icon size={20} />

                                        {label === "My Cart" &&
                                            cartCount > 0 && (
                                                <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">
                                                    {cartCount > 99
                                                        ? "99+"
                                                        : cartCount}
                                                </span>
                                            )}
                                    </span>

                                    <span>{label}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Mobile Actions */}
                        <div className="flex shrink-0 items-center gap-2 md:hidden">
                            <Link
                                href="/cart"
                                aria-label="My Cart"
                                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#0c831f]"
                            >
                                <FiShoppingCart size={21} />

                                {cartCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">
                                        {cartCount > 99 ? "99+" : cartCount}
                                    </span>
                                )}
                            </Link>

                            <button
                                type="button"
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                                className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-800 transition hover:bg-gray-100"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <FiX size={24} />
                                ) : (
                                    <FiMenu size={24} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Search */}
                    <form
                        onSubmit={handleSearch}
                        className="pb-3 md:hidden"
                    >
                        <div className="flex h-11 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 focus-within:border-[#0c831f]">
                            <FiSearch
                                size={19}
                                className="shrink-0 text-gray-500"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products and brands..."
                                className="h-full w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                    className="text-gray-400 hover:text-gray-700"
                                >
                                    <FiX size={17} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="border-t border-gray-100 bg-white px-4 py-4 shadow-lg md:hidden">
                        <nav className="flex flex-col gap-1">
                            {navLinks.map((item) => {
                                const active =
                                    pathname === item.href ||
                                    (item.href !== "/" &&
                                        pathname.startsWith(item.href));

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() =>
                                            setMobileMenuOpen(false)
                                        }
                                        className={`rounded-xl px-4 py-3 text-sm font-bold transition ${active
                                            ? "bg-green-50 text-[#0c831f]"
                                            : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}

                            <div className="my-2 border-t border-gray-100" />

                            {accountLinks.map(
                                ({ label, href, icon: Icon }) => (
                                    <Link
                                        key={label}
                                        href={href}
                                        onClick={(e) =>
                                            handleAccountClick(e, label)
                                        }
                                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                                    >
                                        <span className="relative inline-flex">
                                            <Icon size={19} />

                                            {label === "My Cart" &&
                                                cartCount > 0 && (
                                                    <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white">
                                                        {cartCount > 99
                                                            ? "99+"
                                                            : cartCount}
                                                    </span>
                                                )}
                                        </span>

                                        <span>{label}</span>
                                    </Link>
                                )
                            )}
                        </nav>
                    </div>
                )}
            </header>

            {/* Login Modal */}
            <LoginModal
                isOpen={loginOpen}
                onClose={() => setLoginOpen(false)}
            />
        </>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<NavbarSkeleton />}>
            <Navbar />
        </Suspense>
    );
}