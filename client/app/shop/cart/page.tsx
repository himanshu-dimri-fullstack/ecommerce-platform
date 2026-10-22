
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
    FiArrowLeft,
    FiArrowRight,
    FiCheckCircle,
    FiMinus,
    FiPlus,
    FiShoppingBag,
    FiShield,
    FiTag,
    FiTrash2,
    FiTruck,
    FiX,
} from "react-icons/fi";

type CartItem = {
    id: number;
    name: string;
    brand: string;
    unit: string;
    price: number;
    mrp: number;
    quantity: number;
    image: string;
};

const initialItems: CartItem[] = [

];

const formatPrice = (price: number) =>
    `₹${price.toLocaleString("en-IN")}`;

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>(initialItems);
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState("");
    const [couponError, setCouponError] = useState("");

    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [items]
    );

    const mrpTotal = useMemo(
        () => items.reduce((sum, item) => sum + item.mrp * item.quantity, 0),
        [items]
    );

    const discount = mrpTotal - subtotal;
    const couponDiscount =
        appliedCoupon === "SAVE10" ? Math.round(subtotal * 0.1) : 0;

    const deliveryFee = subtotal === 0 || subtotal >= 499 ? 0 : 40;
    const total = subtotal - couponDiscount + deliveryFee;
    const remaining = Math.max(0, 499 - subtotal);
    const totalQuantity = items.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const updateQuantity = (id: number, change: number) => {
        setItems((current) =>
            current
                .map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            quantity: item.quantity + change,
                        }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const removeItem = (id: number) => {
        setItems((current) => current.filter((item) => item.id !== id));
    };

    const applyCoupon = () => {
        const code = couponInput.trim().toUpperCase();

        if (code === "SAVE10") {
            setAppliedCoupon(code);
            setCouponInput(code);
            setCouponError("");
        } else {
            setCouponError("Invalid coupon. Try SAVE10.");
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon("");
        setCouponInput("");
        setCouponError("");
    };

    return (
        <main className="min-h-screen bg-[#f7f8fa] text-slate-900">

            <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10 lg:px-8">


                {/* Page heading */}
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                            My Cart
                            <span className="ml-3 align-middle text-lg font-semibold text-slate-400">
                                ({totalQuantity} items)
                            </span>
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 sm:text-base">
                            Fresh picks, just a few steps away from your door.
                        </p>
                    </div>

                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold transition hover:border-[#138a45] hover:text-[#138a45]"
                    >
                        <FiArrowLeft size={17} />
                        Continue shopping
                    </Link>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
                        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-[#138a45]">
                            <FiShoppingBag size={34} />
                        </span>
                        <h2 className="mt-6 text-2xl font-black">
                            Your cart is feeling lonely
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                            Looks like you haven&apos;t added anything yet.
                            Explore our fresh collection and find your favourites.
                        </p>
                        <Link
                            href="/products"
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#138a45] px-6 py-3.5 font-bold text-white transition hover:bg-[#0e7138]"
                        >
                            Explore products
                            <FiArrowRight size={18} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-9">
                        {/* Cart items */}
                        <section className="min-w-0 space-y-5">

                            {/* Product list */}
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
                                    <h2 className="text-lg font-extrabold">
                                        Cart Items
                                    </h2>
                                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                                        {items.length} products
                                    </span>
                                </div>

                                <div className="divide-y divide-slate-100 px-4 sm:px-7">
                                    {items.map((item) => (
                                        <article
                                            key={item.id}
                                            className="flex gap-3 py-6 sm:gap-5"
                                        >
                                            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 sm:h-32 sm:w-32">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:gap-4">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                                        {item.brand}
                                                    </p>
                                                    <h3 className="mt-1.5 text-sm font-extrabold leading-5 text-slate-800 sm:text-base">
                                                        {item.name}
                                                    </h3>
                                                    <p className="mt-1 text-xs font-medium text-slate-500">
                                                        Pack size: {item.unit}
                                                    </p>

                                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                                        <span className="text-base font-black">
                                                            {formatPrice(item.price)}
                                                        </span>
                                                        <span className="text-xs text-slate-400 line-through">
                                                            {formatPrice(item.mrp)}
                                                        </span>
                                                        <span className="rounded-md bg-green-50 px-1.5 py-1 text-[10px] font-extrabold text-[#138a45]">
                                                            {Math.round(
                                                                ((item.mrp - item.price) /
                                                                    item.mrp) *
                                                                100
                                                            )}% OFF
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-between">
                                                    <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(item.id, -1)
                                                            }
                                                            aria-label={`Decrease ${item.name} quantity`}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100"
                                                        >
                                                            <FiMinus size={14} />
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-extrabold">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQuantity(item.id, 1)
                                                            }
                                                            aria-label={`Increase ${item.name} quantity`}
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-green-50 hover:text-[#138a45]"
                                                        >
                                                            <FiPlus size={14} />
                                                        </button>
                                                    </div>

                                                    <p className="hidden text-sm font-extrabold sm:block">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </p>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.id)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <FiTrash2 size={14} />
                                                        <span className="hidden sm:inline">
                                                            Remove
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="font-medium text-slate-500">
                                            Total product savings
                                        </span>
                                        <span className="font-extrabold text-[#138a45]">
                                            -{formatPrice(discount)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Coupon */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="flex items-start gap-3">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                        <FiTag size={21} />
                                    </span>
                                    <div>
                                        <h3 className="font-extrabold">
                                            Have a promo code?
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Apply your coupon to unlock extra savings.
                                        </p>
                                    </div>
                                </div>

                                {appliedCoupon ? (
                                    <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-3.5">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <FiCheckCircle
                                                className="shrink-0 text-[#138a45]"
                                                size={20}
                                            />
                                            <div className="min-w-0">
                                                <p className="text-sm font-extrabold text-[#138a45]">
                                                    {appliedCoupon} applied
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    You saved {formatPrice(couponDiscount)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeCoupon}
                                            aria-label="Remove coupon"
                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-red-500"
                                        >
                                            <FiX size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-5">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponInput}
                                                onChange={(e) => {
                                                    setCouponInput(e.target.value);
                                                    setCouponError("");
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") applyCoupon();
                                                }}
                                                placeholder="Enter coupon code"
                                                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold uppercase outline-none transition placeholder:font-normal placeholder:normal-case focus:border-[#138a45] focus:bg-white focus:ring-4 focus:ring-green-50"
                                            />
                                            <button
                                                type="button"
                                                onClick={applyCoupon}
                                                disabled={!couponInput.trim()}
                                                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-[#138a45] disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        {couponError && (
                                            <p className="mt-2 text-xs font-semibold text-red-500">
                                                {couponError}
                                            </p>
                                        )}
                                        <p className="mt-3 text-xs text-slate-400">
                                            Demo coupon:{" "}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCouponInput("SAVE10");
                                                    setCouponError("");
                                                }}
                                                className="font-extrabold text-[#138a45] underline underline-offset-2"
                                            >
                                                SAVE10
                                            </button>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Order summary */}
                        <aside className="lg:sticky lg:top-6">
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-6 py-5">
                                    <h2 className="text-xl font-black">
                                        Order Summary
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Review your order details
                                    </p>
                                </div>

                                <div className="space-y-4 px-6 py-6">
                                    <div className="flex justify-between gap-3 text-sm">
                                        <span className="text-slate-500">
                                            Subtotal ({totalQuantity} items)
                                        </span>
                                        <span className="font-bold">
                                            {formatPrice(subtotal)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-3 text-sm">
                                        <span className="text-slate-500">
                                            Product discount
                                        </span>
                                        <span className="font-bold text-[#138a45]">
                                            -{formatPrice(discount)}
                                        </span>
                                    </div>

                                    {appliedCoupon && (
                                        <div className="flex justify-between gap-3 text-sm">
                                            <span className="text-slate-500">
                                                Coupon ({appliedCoupon})
                                            </span>
                                            <span className="font-bold text-[#138a45]">
                                                -{formatPrice(couponDiscount)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between gap-3 text-sm">
                                        <span className="text-slate-500">
                                            Delivery fee
                                        </span>
                                        <span
                                            className={
                                                deliveryFee === 0
                                                    ? "font-bold text-[#138a45]"
                                                    : "font-bold"
                                            }
                                        >
                                            {deliveryFee === 0
                                                ? "FREE"
                                                : formatPrice(deliveryFee)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-3 text-sm">
                                        <span className="text-slate-500">
                                            Taxes
                                        </span>
                                        <span className="font-bold text-slate-500">
                                            Included in prices
                                        </span>
                                    </div>

                                    <div className="border-t border-dashed border-slate-200 pt-5">
                                        <div className="flex items-end justify-between gap-3">
                                            <div>
                                                <p className="font-extrabold">
                                                    Total Amount
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    Inclusive of applicable taxes
                                                </p>
                                            </div>
                                            <p className="text-2xl font-black tracking-tight">
                                                {formatPrice(total)}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            alert("Connect your checkout route here.")
                                        }
                                        className="group flex w-full items-center justify-center gap-3 rounded-xl bg-[#138a45] px-5 py-4 font-extrabold text-white shadow-lg shadow-green-900/10 transition hover:bg-[#0e7138] active:scale-[0.99]"
                                    >
                                        Proceed to Checkout
                                        <FiArrowRight
                                            size={19}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
                                    </button>

                                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
                                        <FiShield size={15} className="text-[#138a45]" />
                                        Safe & secure checkout
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
                                    <div className="flex items-start gap-3">
                                        <FiTruck
                                            size={21}
                                            className="mt-0.5 shrink-0 text-[#138a45]"
                                        />
                                        <div>
                                            <p className="text-sm font-bold">
                                                Fast, fresh delivery
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                Your everyday essentials delivered right to your doorstep.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-xs font-medium text-slate-500">
                                <FiShield size={16} className="text-[#138a45]" />
                                Your information is safe with us.
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}
