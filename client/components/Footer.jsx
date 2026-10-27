"use client";

import Link from "next/link";
import {
    FiZap,
    FiInstagram,
    FiFacebook,
    FiTwitter,
    FiMail,
    FiMapPin,
    FiPhone,
    FiArrowRight,
    FiShoppingBag,
    FiHeart,
    FiArrowUpRight,
} from "react-icons/fi";

const Footer = () => {
    const socialLinks = [
        {
            label: "Instagram",
            icon: FiInstagram,
            href: "https://www.instagram.com/",
        },
        {
            label: "Facebook",
            icon: FiFacebook,
            href: "https://www.facebook.com/",
        },
        {
            label: "Twitter",
            icon: FiTwitter,
            href: "https://x.com/",
        },
    ];

    const shopLinks = [
        { label: "All Products", href: "/products" },
        { label: "Explore Categories", href: "/categories" },
        { label: "Shopping Cart", href: "/cart" },
    ];

    return (
        <footer className="relative mt-16 overflow-hidden border-t border-gray-100 bg-white">

            {/* MAIN FOOTER */}
            <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14 lg:py-16">
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-12 lg:gap-10">
                    {/* BRAND */}
                    <div className="sm:col-span-2 lg:col-span-5">
                        <Link
                            href="/"
                            className="group inline-flex items-center gap-3"
                        >
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0c831f] text-white shadow-lg shadow-green-900/15 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-xl">
                                <FiZap
                                    size={26}
                                    fill="currentColor"
                                />
                            </span>

                            <span className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
                                QUICK
                                <span className="text-[#0c831f]">
                                    KART
                                </span>
                                <span className="ml-1 text-[#0c831f]">
                                    .
                                </span>
                            </span>
                        </Link>

                        <p className="mt-5 max-w-sm text-sm leading-7 text-gray-500 sm:text-base">
                            Your neighbourhood shopping companion.
                            From everyday groceries to daily essentials,
                            get more of what you need, delivered with ease.
                        </p>

                        {/* BRAND HIGHLIGHT */}
                        <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50/70 px-4 py-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0c831f] shadow-sm">
                                <FiShoppingBag size={20} />
                            </div>

                            <div>
                                <p className="text-sm font-extrabold text-gray-900">
                                    Your daily essentials
                                </p>
                                <p className="mt-0.5 text-xs text-gray-500">
                                    All in one convenient place
                                </p>
                            </div>
                        </div>

                        {/* SOCIAL LINKS */}
                        <div className="mt-7">
                            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.15em] text-gray-400">
                                Follow our journey
                            </p>

                            <div className="flex items-center gap-3">
                                {socialLinks.map(
                                    ({ label, icon: Icon, href }) => (
                                        <a
                                            key={label}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={label}
                                            className="group flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition duration-200 hover:-translate-y-1 hover:border-green-200 hover:bg-[#0c831f] hover:text-white hover:shadow-lg hover:shadow-green-900/15"
                                        >
                                            <Icon size={19} />
                                        </a>
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SHOP LINKS */}
                    <div className="lg:col-span-3">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900">
                            Explore Quick Kart
                        </h3>

                        <div className="mt-5 h-1 w-10 rounded-full bg-[#0c831f]" />

                        <ul className="mt-6 space-y-4">
                            {shopLinks.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#0c831f]"
                                    >
                                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                                            {item.label}
                                        </span>

                                        <FiArrowUpRight
                                            size={14}
                                            className="opacity-0 transition group-hover:opacity-100"
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                            <p className="text-sm font-bold text-gray-800">
                                Shopping made simple.
                            </p>
                            <p className="mt-1 text-xs leading-5 text-gray-500">
                                Browse your favourites and find your
                                everyday essentials.
                            </p>
                        </div>
                    </div>

                    {/* CONTACT */}
                    <div className="lg:col-span-4">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900">
                            We're here to help
                        </h3>

                        <div className="mt-5 h-1 w-10 rounded-full bg-[#0c831f]" />

                        <p className="mt-6 max-w-sm text-sm leading-7 text-gray-500">
                            Need help with an order or have a question?
                            Reach out to us and we'll be happy to help.
                        </p>

                        <div className="mt-6 space-y-3">
                            <a
                                href="mailto:support@quickkart.example"
                                className="group flex items-center gap-4 rounded-2xl border border-gray-100 p-4 transition duration-200 hover:border-green-200 hover:bg-green-50/50"
                            >
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#0c831f] transition group-hover:bg-[#0c831f] group-hover:text-white">
                                    <FiMail size={19} />
                                </span>

                                <span className="min-w-0">
                                    <span className="block text-xs font-semibold text-gray-400">
                                        Email support
                                    </span>
                                    <span className="mt-1 block break-all text-sm font-bold text-gray-800 transition group-hover:text-[#0c831f]">
                                        support@quickkart.example
                                    </span>
                                </span>
                            </a>

                            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#0c831f]">
                                    <FiPhone size={19} />
                                </span>

                                <span>
                                    <span className="block text-xs font-semibold text-gray-400">
                                        Customer care
                                    </span>
                                    <span className="mt-1 block text-sm font-bold text-gray-800">
                                        We're here to help
                                    </span>
                                </span>
                            </div>

                            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-[#0c831f]">
                                    <FiMapPin size={19} />
                                </span>

                                <span>
                                    <span className="block text-xs font-semibold text-gray-400">
                                        Delivery coverage
                                    </span>
                                    <span className="mt-1 block text-sm font-bold text-gray-800">
                                        Selected locations
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM BAR */}
            <div className="border-t border-gray-100 bg-gray-50/80">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:px-8 md:flex-row md:items-center md:justify-between">
                    <p className="text-center text-xs leading-6 text-gray-500 sm:text-sm md:text-left">
                        © {new Date().getFullYear()}{" "}
                        <span className="font-extrabold text-gray-800">
                            QuickKart
                        </span>
                        . All rights reserved.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-gray-500 sm:text-sm">
                        <span>Made with</span>

                        <FiHeart
                            size={15}
                            className="fill-red-500 text-red-500"
                        />

                        <span>for everyday shopping</span>
                    </div>

                    <Link
                        href="/"
                        className="hidden items-center gap-2 text-xs font-bold text-gray-500 transition hover:text-[#0c831f] lg:inline-flex"
                    >
                        Back to home
                        <FiArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;