"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [search, setSearch] = useState("");
    const pathname = usePathname();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (search.trim()) {
            window.location.href = `/?search=${encodeURIComponent(search.trim())}`;
        }
    };

    const navLinks = [
        { label: "Home", href: "/" },
        { label: "Categories", href: "/categories" },
        { label: "All Products", href: "/products" },
        { label: "Offers", href: "/offers" },
    ];

    const accountLinks = [
        { label: "Login", href: "/login", icon: FiUser },
        { label: "My Cart", href: "/cart", icon: FiShoppingCart },
    ];

    const closeMenu = () => setMenuOpen(false);

    // Active link check — nested routes bhi support karta hai
    const isActive = (href: string) => {
        if (href === "/") {
            return pathname === "/";
        }

        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-360 items-center gap-4 px-4 py-3 sm:gap-5 sm:px-6 lg:px-8">
                {/* LOGO */}
                <Link href="/" className="shrink-0" onClick={closeMenu}>
                    <div className="flex items-center gap-2">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0c831f] text-white">
                            <FiZap size={25} fill="currentColor" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-[#0c831f]">
                                QuickKart
                            </h1>
                            <p className="text-[10px] font-bold tracking-[0.15em] text-gray-500">
                                QUICK COMMERCE
                            </p>
                        </div>
                    </div>
                </Link>

                {/* DESKTOP LOCATION */}
                <button
                    type="button"
                    className="hidden min-w-43.75 items-center gap-2 text-left md:flex"
                >
                    <FiMapPin size={23} className="shrink-0 text-[#0c831f]" />

                    <div className="min-w-0">
                        <p className="text-sm font-extrabold text-gray-900">
                            Delivering to
                        </p>
                        <p className="flex items-center gap-1 text-xs text-gray-500">
                            Select your location
                            <FiChevronDown size={13} />
                        </p>
                    </div>
                </button>

                {/* SEARCH */}
                <form
                    onSubmit={handleSearch}
                    className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 transition focus-within:border-[#0c831f] focus-within:bg-white sm:px-4"
                >
                    <FiSearch size={21} className="shrink-0 text-gray-500" />

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for atta, milk, fruits..."
                        aria-label="Search products"
                        className="w-full min-w-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500"
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            aria-label="Clear search"
                            className="shrink-0"
                        >
                            <FiX size={17} className="text-gray-500" />
                        </button>
                    )}
                </form>

                {/* DESKTOP ACTIONS */}
                <div className="hidden shrink-0 items-center gap-5 sm:flex">
                    {accountLinks.map(({ label, href, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={
                                href === "/cart"
                                    ? `flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${isActive(href)
                                        ? "bg-[#096b19] text-white"
                                        : "bg-[#0c831f] text-white hover:bg-[#096b19]"
                                    }`
                                    : `flex items-center gap-2 text-sm font-semibold transition ${isActive(href)
                                        ? "text-[#0c831f]"
                                        : "text-gray-700 hover:text-[#0c831f]"
                                    }`
                            }
                        >
                            <Icon size={20} />
                            {label}
                        </Link>
                    ))}
                </div>

                {/* MOBILE MENU BUTTON */}
                <button
                    type="button"
                    onClick={() => setMenuOpen((prev) => !prev)}
                    aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                    aria-expanded={menuOpen}
                    className="shrink-0 rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 sm:hidden"
                >
                    {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden border-t border-gray-100 md:block">
                <div className="mx-auto flex max-w-360 items-center gap-8 px-8 py-3 text-sm font-semibold">
                    {navLinks.map((item) => {
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                className={`relative py-1 transition ${active
                                    ? "font-bold text-[#0c831f] after:absolute after:-bottom-3 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#0c831f]"
                                    : "text-gray-600 hover:text-[#0c831f]"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* MOBILE NAVIGATION */}
            {menuOpen && (
                <nav className="border-t border-gray-100 bg-white p-4 sm:hidden">
                    {/* LOCATION */}
                    <button
                        type="button"
                        className="mb-4 flex w-full items-center gap-3 rounded-xl bg-gray-50 p-3 text-left transition hover:bg-green-50"
                    >
                        <FiMapPin size={20} className="shrink-0 text-[#0c831f]" />

                        <div>
                            <p className="text-sm font-bold text-gray-900">
                                Delivering to
                            </p>
                            <p className="text-xs text-gray-500">
                                Select your location
                            </p>
                        </div>

                        <FiChevronDown size={16} className="ml-auto text-gray-500" />
                    </button>

                    {/* NAV LINKS */}
                    <div className="flex flex-col gap-1">
                        {navLinks.map((item) => {
                            const active = isActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={closeMenu}
                                    aria-current={active ? "page" : undefined}
                                    className={`rounded-lg px-3 py-3 text-sm font-semibold transition ${active
                                        ? "bg-green-50 font-bold text-[#0c831f]"
                                        : "text-gray-700 hover:bg-green-50 hover:text-[#0c831f]"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}

                        <div className="my-2 border-t border-gray-100" />

                        {accountLinks.map(({ label, href, icon: Icon }) => {
                            const active = isActive(href);

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={closeMenu}
                                    aria-current={active ? "page" : undefined}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${active
                                        ? "bg-green-50 text-[#0c831f]"
                                        : "text-gray-700 hover:bg-green-50 hover:text-[#0c831f]"
                                        }`}
                                >
                                    <Icon size={19} />
                                    {label}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            )}
        </header>
    );
};

export default function Page() {
    return (
        <Suspense fallback={<div>Loading product...</div>}>
            <Navbar />
        </Suspense>
    );
}