
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FiZap,
    FiUser,
    FiShoppingCart,
    FiMenu,
    FiX,
    FiChevronDown,
    FiLogOut,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "./auth/SignupModal";
import DeliveryLocation from "@/components/navbar/DeliveryLocation";
import ProductSearch from "@/components/navbar/ProductSearch";
import { API } from "@/axios/axios";
import { setUser } from "@/redux/authSlice";
import { fetchCart, setCart } from "@/redux/cartSlice";
import toast from "react-hot-toast";

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
    const dispatch = useDispatch<AppDispatch>();

    const user = useSelector((state: RootState) => state.auth.user);
    const loading = useSelector((state: RootState) => state.auth.loading);

    const cartItems = useSelector((state: RootState) => state.cart.items);

    const {
        store: nearestStore,
        loading: storeLoading
    } = useSelector((state: RootState) => state.store);

    const storeId = nearestStore?._id;

    // Total quantity in cart
    const cartCount = cartItems?.reduce(
        (total, item) => total + item.quantity,
        0
    ) ?? 0;

    const [loginOpen, setLoginOpen] = useState(false);
    const [isSignupOpen, setIsSignupOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [search, setSearch] = useState("");

    const [accountOpen, setAccountOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const accountRef = useRef<HTMLDivElement>(null);

    const navLinks = [
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
    ];

    const userName = user?.firstName || "My Account";
    const profileImage = user?.profileImage?.url || "";
    const avatarLetter = userName.trim().charAt(0).toUpperCase() || "U";

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

    // Logout
    const handleLogout = async () => {
        if (loggingOut) return;

        setLoggingOut(true);

        try {
            const res = await API.post("/user/logout");

            dispatch(setUser(null));
            dispatch(setCart([]));

            setAccountOpen(false);
            setMobileMenuOpen(false);

            toast.success(res.data.message);

        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                "Unable to logout. Please try again."
            );
        } finally {
            setLoggingOut(false);
        }
    };

    // Close Account Dropdown On Outside Click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                accountRef.current &&
                !accountRef.current.contains(event.target as Node)
            ) {
                setAccountOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Fetch store-specific cart
    useEffect(() => {
        // Wait until store selection is resolved
        if (storeLoading) return;

        // Guest cart Redux mein hi rahega
        if (!user) return;

        // Clear previous store cart
        dispatch(setCart([]));

        // Fetch cart only when store is selected
        if (storeId) {
            dispatch(fetchCart(storeId));
        }

    }, [user, storeId, storeLoading, dispatch]);

    // Reusable Profile Avatar
    const ProfileAvatar = ({ size = "h-9 w-9" }: { size?: string }) => (
        <>
            {profileImage ? (
                <img
                    src={profileImage}
                    alt={userName}
                    className={`${size} shrink-0 rounded-full border border-gray-200 object-cover`}
                />
            ) : (
                <span
                    className={`${size} flex shrink-0 items-center justify-center rounded-full bg-[#0c831f] text-sm font-extrabold text-white`}
                >
                    {avatarLetter}
                </span>
            )}
        </>
    );

    return (
        <>
            <header className="sticky top-0 z-100 border-b border-gray-100 bg-white shadow-sm">
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

                        {/* Delivery Location */}
                        <DeliveryLocation />

                        {/* Desktop Search */}
                        <div className="hidden min-w-0 flex-1 md:block">
                            <ProductSearch
                                value={search}
                                onChange={setSearch}
                                placeholder="Search for products, brands and more..."
                            />
                        </div>

                        {/* Desktop Account Actions */}
                        <div className="hidden shrink-0 items-center gap-3 md:flex">
                            {loading ? (
                                <div className="flex items-center gap-2 rounded-xl px-3 py-2.5">
                                    <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200" />
                                    <div className="h-4 w-12 animate-pulse rounded-md bg-gray-200" />
                                </div>
                            ) : user ? (
                                <div ref={accountRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setAccountOpen(!accountOpen)}
                                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-100"
                                    >
                                        <ProfileAvatar />

                                        <span className="max-w-36 truncate">
                                            {userName}
                                        </span>

                                        <FiChevronDown size={16} />
                                    </button>

                                    {accountOpen && (
                                        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-xl">
                                            <Link
                                                href="/profile"
                                                onClick={() => setAccountOpen(false)}
                                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-green-50 hover:text-[#0c831f]"
                                            >
                                                <FiUser size={18} />
                                                Profile
                                            </Link>

                                            <button
                                                type="button"
                                                disabled={loggingOut}
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                            >
                                                <FiLogOut size={18} />
                                                {loggingOut ? "Logging out..." : "Logout"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    href="#login"
                                    onClick={(e) => handleAccountClick(e, "Login")}
                                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-100"
                                >
                                    <FiUser size={20} />
                                    <span>Login</span>
                                </Link>
                            )}

                            <Link
                                href="/cart"
                                className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2.5 text-sm font-bold text-[#0c831f] transition hover:bg-green-100"
                            >
                                <span className="relative inline-flex">
                                    <FiShoppingCart size={20} />

                                    {cartCount > 0 && (
                                        <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white">
                                            {cartCount > 99 ? "99+" : cartCount}
                                        </span>
                                    )}
                                </span>

                                <span>My Cart</span>
                            </Link>
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
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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

                    {/* Desktop Navigation */}
                    <div className="hidden border-t border-gray-100 py-3 xl:block">
                        <nav className="flex items-center gap-6">
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
                    </div>

                    {/* Mobile Search */}
                    <div className="pb-3 md:hidden">
                        <ProductSearch
                            value={search}
                            onChange={setSearch}
                            placeholder="Search products and brands..."
                        />
                    </div>
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
                                        onClick={() => setMobileMenuOpen(false)}
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

                            {user ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setAccountOpen(!accountOpen)}
                                        className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                                    >
                                        <span className="flex min-w-0 items-center gap-3">
                                            <ProfileAvatar />

                                            <span className="truncate">
                                                {userName}
                                            </span>
                                        </span>

                                        <FiChevronDown
                                            size={16}
                                            className={`shrink-0 transition-transform ${accountOpen ? "rotate-180" : ""
                                                }`}
                                        />
                                    </button>

                                    {accountOpen && (
                                        <div className="ml-4 flex flex-col gap-1">
                                            <Link
                                                href="/profile"
                                                onClick={() => {
                                                    setAccountOpen(false);
                                                    setMobileMenuOpen(false);
                                                }}
                                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-green-50 hover:text-[#0c831f]"
                                            >
                                                <FiUser size={18} />
                                                Profile
                                            </Link>

                                            <button
                                                type="button"
                                                disabled={loggingOut}
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                            >
                                                <FiLogOut size={18} />
                                                {loggingOut ? "Logging out..." : "Logout"}
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    href="#login"
                                    onClick={(e) => handleAccountClick(e, "Login")}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                                >
                                    <FiUser size={19} />
                                    Login
                                </Link>
                            )}

                            <Link
                                href="/cart"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                            >
                                <span className="relative inline-flex">
                                    <FiShoppingCart size={19} />

                                    {cartCount > 0 && (
                                        <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white">
                                            {cartCount > 99 ? "99+" : cartCount}
                                        </span>
                                    )}
                                </span>

                                My Cart
                            </Link>
                        </nav>
                    </div>
                )}
            </header>

            {/* Login Modal */}
            {loginOpen && (
                <LoginModal
                    setLoginOpen={setLoginOpen}
                    setIsSignupOpen={setIsSignupOpen}
                />
            )}

            {/* Signup Modal */}
            {isSignupOpen && (
                <SignupModal
                    setIsSignupOpen={setIsSignupOpen}
                />
            )}
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
