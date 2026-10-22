"use client";

import { useEffect, useState } from "react";
import {
    FiX,
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiZap,
    FiArrowRight,
} from "react-icons/fi";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({
    isOpen,
    onClose,
}: LoginModalProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Connect your login API here.
        console.log({ email, password });
    };

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-modal-title"
                className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
                {/* Top Accent */}
                <div className="h-1.5 bg-[#0c831f]" />

                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close login modal"
                    className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                >
                    <FiX size={22} />
                </button>

                <div className="px-6 py-8 sm:px-9 sm:py-10">
                    {/* Logo */}
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0c831f] text-white shadow-lg shadow-green-900/15">
                        <FiZap size={30} fill="currentColor" />
                    </div>

                    <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#0c831f]">
                        Welcome to QuickKart
                    </p>

                    <h2
                        id="login-modal-title"
                        className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl"
                    >
                        Welcome back!
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-gray-500">
                        Login to your account and get your everyday essentials
                        delivered quickly.
                    </p>

                    {/* Login Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="mt-8 space-y-5"
                    >
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="login-email"
                                className="mb-2 block text-sm font-bold text-gray-800"
                            >
                                Email address
                            </label>

                            <div className="flex h-13 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-[#0c831f] focus-within:bg-white focus-within:ring-4 focus-within:ring-green-50">
                                <FiMail
                                    size={19}
                                    className="shrink-0 text-gray-400"
                                />

                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    autoFocus
                                    required
                                    className="h-full w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <label
                                    htmlFor="login-password"
                                    className="text-sm font-bold text-gray-800"
                                >
                                    Password
                                </label>

                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        window.location.href =
                                            "/auth/forgot-password";
                                    }}
                                    className="text-xs font-bold text-[#0c831f] transition hover:text-green-800"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <div className="flex h-13 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 transition focus-within:border-[#0c831f] focus-within:bg-white focus-within:ring-4 focus-within:ring-green-50">
                                <FiLock
                                    size={19}
                                    className="shrink-0 text-gray-400"
                                />

                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                    className="h-full w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((previous) => !previous)
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    className="shrink-0 text-gray-400 transition hover:text-[#0c831f]"
                                >
                                    {showPassword ? (
                                        <FiEyeOff size={19} />
                                    ) : (
                                        <FiEye size={19} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#0c831f] px-5 text-sm font-extrabold text-white shadow-lg shadow-green-900/10 transition hover:bg-green-800 active:scale-[0.99]"
                        >
                            Login to your account

                            <FiArrowRight
                                size={18}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-7 border-t border-gray-100 pt-5">
                        <p className="text-center text-xs leading-5 text-gray-500">
                            Shop smarter. Live better.
                            <span className="mx-1.5 text-gray-300">•</span>
                            <span className="font-bold text-[#0c831f]">
                                QuickKart
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
