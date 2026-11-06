"use client";

import Link from "next/link";
import {
    FiZap,
    FiLinkedin,
    FiGithub,
    FiMail,
    FiArrowUpRight,
    FiMapPin,
    FiShoppingBag,
    FiClock,
} from "react-icons/fi";

const Footer = () => {
    const quickLinks = [
        { label: "Home", href: "/" },
        { label: "All Products", href: "/products" },
        { label: "Categories", href: "/categories" },
        { label: "Shopping Cart", href: "/cart" },
    ];

    const developerLinks = [
        {
            label: "LinkedIn",
            href: "https://www.linkedin.com/in/himanshu-dimri-932999270/",
            icon: FiLinkedin,
        },
        {
            label: "GitHub",
            href: "https://github.com/himanshu-dimri-fullstack",
            icon: FiGithub,
        },
        {
            label: "Email",
            href: "mailto:himanshudimrifullstack@gmail.com",
            icon: FiMail,
        },
    ];

    return (
        <footer className="mt-16 border-t border-gray-100 bg-white">

            <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">

                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">

                    {/* BRAND */}
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3"
                        >
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0c831f] text-white">
                                <FiZap size={24} fill="currentColor" />
                            </span>

                            <span className="text-2xl font-black tracking-tight text-gray-900">
                                QUICK
                                <span className="text-[#0c831f]">
                                    KART.
                                </span>
                            </span>
                        </Link>

                        <p className="mt-5 max-w-sm text-sm leading-7 text-gray-500">
                            Your neighbourhood shopping companion.
                            Discover everyday essentials and shop
                            conveniently from nearby stores.
                        </p>
                    </div>

                    {/* QUICK LINKS */}
                    <div>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900">
                            Quick Links
                        </h3>

                        <div className="mt-4 h-1 w-10 rounded-full bg-[#0c831f]" />

                        <ul className="mt-6 space-y-4">
                            {quickLinks.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="group inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#0c831f]"
                                    >
                                        {item.label}

                                        <FiArrowUpRight
                                            size={14}
                                            className="opacity-0 transition group-hover:opacity-100"
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ABOUT QUICK KART */}
                    <div>
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-900">
                            About QuickKart
                        </h3>

                        <div className="mt-4 h-1 w-10 rounded-full bg-[#0c831f]" />

                        <p className="mt-6 text-sm leading-7 text-gray-500">
                            QuickKart makes everyday shopping simple
                            by connecting customers with nearby stores
                            and their available products.
                        </p>

                        <div className="mt-5 space-y-4">

                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-[#0c831f]">
                                    <FiMapPin size={18} />
                                </span>

                                <span className="text-sm text-gray-600">
                                    Shop from nearby stores
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-[#0c831f]">
                                    <FiShoppingBag size={18} />
                                </span>

                                <span className="text-sm text-gray-600">
                                    Everyday shopping made easy
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-[#0c831f]">
                                    <FiClock size={18} />
                                </span>

                                <span className="text-sm text-gray-600">
                                    Convenient online ordering
                                </span>
                            </div>

                        </div>
                    </div>

                </div>

                {/* DEVELOPER */}
                <div className="mt-12 border-t border-gray-100 pt-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex flex-wrap items-center gap-3">

                            <p className="text-sm font-bold text-gray-800">
                                Developed by Himanshu Dimri
                            </p>

                            <div className="flex items-center gap-2">
                                {developerLinks.map(
                                    ({ label, href, icon: Icon }) => (
                                        <a
                                            key={label}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={label}
                                            title={label}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-green-200 hover:bg-green-50 hover:text-[#0c831f]"
                                        >
                                            <Icon size={17} />
                                        </a>
                                    )
                                )}
                            </div>

                        </div>

                        <p className="text-xs text-gray-400">
                            Designed & Developed with care.
                        </p>

                    </div>
                </div>

            </div>

            {/* COPYRIGHT */}
            <div className="border-t border-gray-100 bg-gray-50/70">
                <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
                    <p className="text-center text-xs text-gray-500 sm:text-sm">
                        © {new Date().getFullYear()}{" "}
                        <span className="font-bold text-gray-800">
                            QuickKart
                        </span>
                        . All rights reserved.
                    </p>
                </div>
            </div>

        </footer>
    );
};

export default Footer;