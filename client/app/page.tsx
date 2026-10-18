"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiArrowRight,
  FiClock,
  FiPlus,
  FiMinus,
  FiStar,
  FiShield,
  FiTruck,
  FiHeadphones,
  FiShoppingBag,
  FiZap,
} from "react-icons/fi";
import { API } from "../axios/axios.js"

interface Category {
  name: string;
  image: {
    url: string;
    public_id: string;
  };
  slug: string;
}

interface Product {
  slug: string;
  name: string;
  unit: string;
  sellingPrice: number;
  mrp: number;
  images: [{
    url: string;
    public_url: string;
  }]
  bglinear: string;
  time: string;
  rating: number;
  badge: string;
}

interface Offer {
  title: string;
  description: string;
  discount: string;
  emoji: string;
  linear: string;
  badgeBg: string;
  href: string;
}

const offers: Offer[] = [
  {
    title: "Freshness First",
    description: "Farm-fresh fruits & organic veggies",
    discount: "UP TO 30% OFF",
    emoji: "🥦",
    linear: "from-emerald-500/10 via-green-100 to-emerald-50 border-emerald-200/60",
    badgeBg: "bg-emerald-600 text-white",
    href: "/categories/fruits-vegetables",
  },
  {
    title: "Snack Attack!",
    description: "Munchies, chips & cold beverages",
    discount: "STARTING ₹20",
    emoji: "🍿",
    linear: "from-amber-500/10 via-orange-100 to-amber-50 border-amber-200/60",
    badgeBg: "bg-amber-600 text-white",
    href: "/categories/snacks-munchies",
  },
  {
    title: "Daily Staples",
    description: "Atta, rice, dal & cooking oils",
    discount: "BIG SAVINGS",
    emoji: "🛒",
    linear: "from-blue-500/10 via-sky-100 to-blue-50 border-blue-200/60",
    badgeBg: "bg-blue-600 text-white",
    href: "/products",
  },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const fetchCategories = async () => {
    const res = await API.get("/admin/categories")

    setCategories(res.data.categories)
  }
  const fetchProducts = async () => {
    const res = await API.get("/admin/product/variant")
    console.log(res)
    setProducts(res.data.variants)
  }
  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])
  return (
    <main className="min-h-screen bg-[#F8FAF9] text-gray-900 pb-20">
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-linear-to-r from-emerald-800 via-[#0c831f] to-emerald-700 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8 text-xs font-semibold tracking-wide">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
            <FiZap className="text-lime-300" size={15} />
            <span>Superfast 10-Minute Delivery to your doorstep</span>
          </div>
          <span className="hidden sm:inline-block text-emerald-100 font-normal">
            ⚡ Free delivery on orders above ₹199
          </span>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0c831f] via-emerald-800 to-green-950 p-6 sm:p-10 lg:p-12 shadow-2xl shadow-green-900/20">
          <div className="absolute -right-12 -top-12 h-80 w-80 rounded-full bg-lime-400/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-emerald-400/10 blur-2xl" />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-extrabold text-lime-300 backdrop-blur-md">
                <FiClock className="animate-spin" size={14} />
                <span>LIGHTNING FAST GROCERY DELIVERY</span>
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
                Groceries delivered <br className="hidden sm:block" />
                <span className="bg-linear-to-r from-lime-300 via-emerald-200 to-white bg-clip-text text-transparent">
                  in just 10 minutes.
                </span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-emerald-100/90 sm:text-base">
                Get fresh vegetables, daily dairy essentials, snacks, and home needs delivered fresh to your door right when you need them.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-6 py-3.5 text-sm font-extrabold text-green-950 shadow-lg shadow-lime-400/30 transition-all duration-200 hover:bg-lime-300 hover:scale-[1.02] active:scale-95"
                >
                  Order Now <FiArrowRight size={18} />
                </Link>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-wider">Superfast</p>
                    <p className="text-[11px] text-emerald-200">Live order tracking</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Grid Card Showcase */}
            <div className="relative hidden lg:col-span-5 lg:flex items-center justify-center">
              <div className="grid grid-cols-2 gap-3.5 p-2">
                {[
                  { emoji: "🥑", title: "Fresh Produce", sub: "Daily harvested", bg: "bg-white/90" },
                  { emoji: "🥛", title: "Dairy & Eggs", sub: "100% Pure", bg: "bg-amber-50/90" },
                  { emoji: "🍓", title: "Farm Berries", sub: "Sweet & Fresh", bg: "bg-rose-50/90" },
                  { emoji: "🥐", title: "Fresh Bakery", sub: "Baked Today", bg: "bg-orange-50/90" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`${item.bg} backdrop-blur-md p-4 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center border border-white/40 transition duration-300 hover:-translate-y-1`}
                  >
                    <span className="text-4xl sm:text-5xl drop-shadow-md">{item.emoji}</span>
                    <span className="mt-2 text-xs font-black text-gray-800">{item.title}</span>
                    <span className="text-[10px] font-medium text-gray-500">{item.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION STRIP */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: FiTruck, title: "10-Min Express Delivery", text: "Guaranteed fast doorstep delivery" },
            { icon: FiShield, title: "Best Quality Assured", text: "Directly sourced from trusted farms" },
            { icon: FiHeadphones, title: "Instant Support", text: "24/7 dedicated customer care" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#0c831f]">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wide">{item.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
              Shop by Category
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Explore our wide range of essentials</p>
          </div>
          <Link
            href="/categories"
            className="group flex items-center gap-1 text-xs font-bold text-[#0c831f] hover:text-emerald-700"
          >
            See All <FiArrowRight className="transition duration-200 group-hover:translate-x-1" size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className={`group flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-3 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md`}
            >
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition duration-300 group-hover:scale-110`}>
                {
                  category.image?.url ?
                    <img src={category.image?.url} className="h-full w-full object-cover" />
                    :
                    <span
                      className="h-full w-full flex items-center justify-center text-4xl">
                      🛍️
                    </span>
                }
              </div>

              <h3 className="mt-2.5 text-xs font-bold text-gray-800 line-clamp-2 leading-tight">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* OFFERS & BANNERS */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {offers.map((offer) => (
            <Link
              href={offer.href}
              key={offer.title}
              className={`group relative flex items-center justify-between overflow-hidden rounded-3xl border bg-linear-to-br p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md ${offer.linear}`}
            >
              <div className="relative z-10 max-w-[65%]">
                <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${offer.badgeBg}`}>
                  {offer.discount}
                </span>
                <h3 className="mt-2 text-lg font-black text-gray-900 leading-snug">{offer.title}</h3>
                <p className="mt-1 text-xs text-gray-600 line-clamp-2">{offer.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#0c831f] group-hover:underline">
                  Shop Now <FiArrowRight size={14} />
                </span>
              </div>
              <span className="absolute -bottom-2 -right-2 text-7xl transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                {offer.emoji}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* POPULAR PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-gray-900 sm:text-2xl">
              Featured Products
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Most ordered item in your area</p>
          </div>
          <Link
            href="/products"
            className="group flex items-center gap-1 text-xs font-bold text-[#0c831f] hover:text-emerald-700"
          >
            See All <FiArrowRight className="transition duration-200 group-hover:translate-x-1" size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => {
            const discount =
              product.mrp > product.sellingPrice
                ? Math.round((1 - product.sellingPrice / product.mrp) * 100)
                : 0;
            return (
              <article
                key={product.slug}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/80 bg-white transition duration-200 hover:border-emerald-200 hover:shadow-lg"
              >
                <div className="">
                  {/* Image Holder */}
                  <Link
                    href={`/products/${product.slug}`}
                    className={`relative flex  h-50 w-full aspect-square items-center justify-center bg-linear-to-b ${product.bglinear} p-4`}
                  >

                    {discount > 0 && (
                      <span className="absolute right-2.5 top-2.5 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow-sm">
                        {discount}% OFF
                      </span>
                    )}

                    {
                      product.images[0]?.url ?
                        <img src={product.images[0].url} className="h-full w-full object-contain" />
                        :
                        <span
                          className="h-full w-full flex items-center justify-center text-4xl">
                          🛍️
                        </span>
                    }

                  </Link>

                  {/* Details */}
                  <div className="p-3.5">
                    <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 w-max px-2 py-0.5 rounded-full">
                      <FiClock size={11} />
                      <span>{product.time}</span>
                    </div>

                    <Link href={`/products/${product.slug}`}>
                      <h3 className="mt-2 text-xs font-bold text-gray-800 line-clamp-1 hover:text-[#0c831f] sm:text-sm">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">{product.unit}</p>

                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-500">
                      <FiStar size={12} fill="currentColor" />
                      <span className="font-bold text-gray-700">{product.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between gap-2 p-3.5 pt-0">
                  <div>
                    <span className="text-sm font-black text-gray-900 sm:text-base">₹{product.sellingPrice}</span>
                    {discount > 0 && (
                      <span className="ml-1 text-xs text-gray-400 line-through">₹{product.mrp}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-xl border-2 border-[#0c831f] bg-emerald-50 px-3 py-1.5 text-xs font-black text-[#0c831f] transition-all duration-150 hover:bg-[#0c831f] hover:text-white active:scale-95"
                  >
                    ADD <FiPlus size={14} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  );
}