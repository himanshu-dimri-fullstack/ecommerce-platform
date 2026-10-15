"use client"
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
        { label: "Categories", href: "/categories" },
        { label: "Today's Offers", href: "/offers" },
        { label: "Shopping Cart", href: "/cart" },
    ];

    const companyLinks = [
        { label: "About Us", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms & Conditions", href: "/terms" },
    ];

    return (
        <footer className="mt-10 border-t border-gray-200 bg-white">
            {/* NEWSLETTER */}
            <div className="border-b border-gray-100 bg-[#f4faef]">
                <div className="mx-auto flex max-w-360 flex-col justify-between gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center lg:px-8">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 sm:text-2xl">
                            Fresh deals, straight to your inbox.
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Get updates on offers, new arrivals and everyday savings.
                        </p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                        }}
                        className="flex w-full max-w-md gap-2"
                    >
                        <label htmlFor="newsletter-email" className="sr-only">
                            Email address
                        </label>

                        <input
                            id="newsletter-email"
                            type="email"
                            required
                            placeholder="Enter your email address"
                            className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0c831f]"
                        />

                        <button
                            type="submit"
                            aria-label="Subscribe to newsletter"
                            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0c831f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#096b19]"
                        >
                            Subscribe
                            <FiArrowRight size={16} />
                        </button>
                    </form>
                </div>
            </div>

            {/* FOOTER CONTENT */}
            <div className="mx-auto grid max-w-360 grid-cols-2 gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8 lg:py-14">
                {/* BRAND */}
                <div className="col-span-2 md:col-span-1">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0c831f] text-white">
                            <FiZap size={25} fill="currentColor" />
                        </div>

                        <span className="text-2xl font-black tracking-tight text-[#0c831f]">
                            QuickKart
                        </span>
                    </Link>

                    <p className="mt-4 max-w-xs text-sm leading-7 text-gray-500">
                        Your neighbourhood shopping companion for groceries, fresh
                        produce and all the little things you need every day.
                    </p>

                    {/* SOCIAL LINKS */}
                    <div className="mt-5 flex items-center gap-3">
                        {socialLinks.map(({ label, icon: Icon, href }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:border-green-200 hover:bg-green-50 hover:text-[#0c831f]"
                            >
                                <Icon size={19} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* SHOP */}
                <div>
                    <h3 className="text-sm font-extrabold text-gray-900">
                        Shop with us
                    </h3>

                    <ul className="mt-5 space-y-3 text-sm text-gray-500">
                        {shopLinks.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className="transition hover:text-[#0c831f]"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* COMPANY */}
                <div>
                    <h3 className="text-sm font-extrabold text-gray-900">
                        QuickKart
                    </h3>

                    <ul className="mt-5 space-y-3 text-sm text-gray-500">
                        {companyLinks.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className="transition hover:text-[#0c831f]"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* CONTACT */}
                <div className="col-span-2 md:col-span-1">
                    <h3 className="text-sm font-extrabold text-gray-900">
                        Need a hand?
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                        Have a question about your order? We'd love to help.
                    </p>

                    <div className="mt-5 space-y-4">
                        <a
                            href="mailto:support@quickkart.example"
                            className="flex items-center gap-3 text-sm text-gray-600 transition hover:text-[#0c831f]"
                        >
                            <FiMail size={18} className="shrink-0 text-[#0c831f]" />
                            <span className="break-all">
                                support@quickkart.example
                            </span>
                        </a>

                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <FiPhone size={18} className="shrink-0 text-[#0c831f]" />
                            Customer support
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <FiMapPin size={18} className="shrink-0 text-[#0c831f]" />
                            Delivering to selected locations
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM BAR */}
            <div className="border-t border-gray-100">
                <div className="mx-auto flex max-w-360 flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
                    <p className="text-xs text-gray-500 sm:text-sm">
                        © 2026 QuickKart. All rights reserved.
                    </p>

                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        <span>Made with</span>
                        <span className="text-red-500">♥</span>
                        <span>for everyday shopping</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;