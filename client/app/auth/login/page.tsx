"use client";

import { useState } from "react";
import Link from "next/link";
import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiArrowRight,
    FiShoppingBag,
    FiShield,
} from "react-icons/fi";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Login API yahan integrate karenge.
        console.log({ email, password, rememberMe });
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-4 py-10 sm:px-6">
            <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-2">
                {/* Left section */}
                <section className="relative hidden flex-col justify-between overflow-hidden bg-[#123c2b] p-10 text-white lg:flex xl:p-14">
                    <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl" />

                    <Link href="/" className="relative flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#123c2b]">
                            <FiShoppingBag size={25} />
                        </span>
                        <span className="text-2xl font-extrabold tracking-tight">
                            QUICK KART
                        </span>
                    </Link>

                    <div className="relative my-14">
                        <span className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-emerald-100">
                            Your everyday shopping partner
                        </span>

                        <h1 className="max-w-md text-4xl font-extrabold leading-tight xl:text-5xl">
                            Everything you need,{" "}
                            <span className="text-lime-300">just a click away.</span>
                        </h1>

                        <p className="mt-6 max-w-md text-base leading-7 text-emerald-50/75">
                            Sign in to discover great products, manage your cart,
                            and enjoy a seamless shopping experience.
                        </p>

                        <div className="mt-10 flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {["A", "R", "S", "M"].map((letter, index) => (
                                    <div
                                        key={letter}
                                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#123c2b] bg-white font-bold text-[#123c2b]"
                                        style={{
                                            backgroundColor: [
                                                "#d1fae5",
                                                "#fef3c7",
                                                "#dbeafe",
                                                "#fce7f3",
                                            ][index],
                                        }}
                                    >
                                        {letter}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="text-sm font-bold">Shopping made simple</p>
                                <p className="mt-1 text-xs text-emerald-100/70">
                                    Your favourites, all in one place
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex items-center gap-2 text-sm text-emerald-100/70">
                        <FiShield size={16} />
                        Secure sign-in for your account
                    </div>
                </section>

                {/* Right section */}
                <section className="flex items-center justify-center px-6 py-10 sm:px-12 sm:py-14 lg:px-12 xl:px-16">
                    <div className="w-full max-w-md">
                        <Link
                            href="/"
                            className="mb-10 inline-flex items-center gap-2 text-xl font-extrabold tracking-tight text-[#123c2b] lg:hidden"
                        >
                            <FiShoppingBag size={24} />
                            QUICK KART
                        </Link>

                        <div className="mb-8">
                            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
                                Welcome back
                            </p>

                            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                Sign in to your account
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                Enter your details below to continue shopping.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Email address
                                </label>

                                <div className="relative">
                                    <FiMail
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        size={19}
                                    />
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-semibold text-slate-700"
                                    >
                                        Password
                                    </label>

                                    <Link
                                        href="/forgot-password"
                                        className="text-xs font-bold text-emerald-700 transition hover:text-emerald-900 sm:text-sm"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <div className="relative">
                                    <FiLock
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        size={19}
                                    />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={
                                            showPassword ? "Hide password" : "Show password"
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                    >
                                        {showPassword ? (
                                            <FiEyeOff size={19} />
                                        ) : (
                                            <FiEye size={19} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <label className="flex cursor-pointer items-center gap-3 py-1">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 accent-emerald-700"
                                />
                                <span className="text-sm text-slate-600">
                                    Remember me
                                </span>
                            </label>

                            <button
                                type="submit"
                                className="flex h-13 w-full items-center justify-center gap-3 rounded-xl bg-[#176b45] px-5 font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#125738] active:scale-[0.99]"
                            >
                                Sign in
                                <FiArrowRight size={19} />
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-slate-500">
                            Don't have an account?{" "}
                            <Link
                                href="/register"
                                className="font-bold text-emerald-700 transition hover:text-emerald-900"
                            >
                                Create account
                            </Link>
                        </p>

                        <div className="mt-10 border-t border-slate-100 pt-5 text-center text-xs leading-5 text-slate-400">
                            By signing in, you agree to our{" "}
                            <Link href="/terms" className="font-medium text-slate-600 hover:underline">
                                Terms
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="font-medium text-slate-600 hover:underline">
                                Privacy Policy
                            </Link>.
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}