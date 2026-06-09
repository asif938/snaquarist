"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, Category } from "@prisma/client";
import { useApp } from "@/context/AppContext";
import { Search, Heart, ShoppingCart, Info, CheckCircle, AlertTriangle } from "lucide-react";

interface HomeContentProps {
  initialProducts: (Product & { category: Category })[];
  categories: Category[];
}

export default function HomeContent({
  initialProducts,
  categories,
}: HomeContentProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filtering products
  const filteredProducts = initialProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.categoryId === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-12">
      {/* Hero Banner Section */}
      <section className="relative rounded-3xl overflow-hidden glassmorphism p-8 md:p-16 border border-white/5 glow-teal/5 flex flex-col md:flex-row items-center gap-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-teal-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-ocean-500/10 blur-[100px] pointer-events-none" />

        <div className="flex-1 space-y-6 z-10">
          <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold uppercase tracking-wider">
            স্বাগতম SN Aquarist-এ
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white">
            আপনার ঘরের কোণে গড়ে তুলুন{" "}
            <span className="text-gradient">রঙিন জলের মায়াবী জগৎ!</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-xl">
            আমরা দিচ্ছি সেরা মানের ও সুস্থ রঙিন অ্যাকোয়ারিয়াম মাছ এবং আনুষঙ্গিক জিনিসপত্র।
            আমাদের বিশেষ সংগ্রহ দেখতে নিচে স্ক্রল করুন।
          </p>

          {/* Search bar inside Hero */}
          <div className="relative max-w-md w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-400 transition-colors" />
            <input
              type="text"
              placeholder="পছন্দের মাছ বা এক্সেসরিজ খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none transition-all duration-300 text-gray-200 shadow-inner group-hover:border-white/20"
            />
          </div>
        </div>

        {/* Hero Illustration Wrapper */}
        {/* <div className="flex-1 flex justify-center items-center z-10">
          <div className="relative w-72 h-72 md:w-96 md:h-96 animate-float flex items-center justify-center bg-gradient-to-tr from-teal-500/20 to-ocean-500/20 rounded-full border border-teal-500/30 overflow-hidden shadow-2xl">
            <span className="text-8xl select-none">🐠</span>
            <div className="absolute inset-0 bg-gradient-to-t from-ocean-900/60 to-transparent pointer-events-none" />
          </div>
        </div> */}

        <div className="flex-1 flex justify-center items-center z-10">
          <div className="relative w-72 h-72 md:w-96 md:h-96 animate-float flex items-center justify-center bg-gradient-to-tr from-teal-500/20 to-ocean-500/20 rounded-full border border-teal-500/30 overflow-hidden shadow-2xl">
            <Image
              src="/hero2.png"
              alt="Colorful Aquarium Fish"
              fill
              className="object-cover object-center scale-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ocean-900/60 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Category Selection Filter */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🔍</span> ক্যাটাগরি অনুযায়ী ফিল্টার করুন
        </h2>
        <div className="flex flex-wrap gap-2.5 pb-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-5 py-2.5 rounded-xl border font-semibold text-sm transition-all duration-300 cursor-pointer whitespace-nowrap ${selectedCategory === "all"
              ? "bg-teal-500 text-ocean-950 border-teal-400 glow-teal"
              : "bg-ocean-950/50 border-white/5 text-gray-300 hover:border-teal-500/30 hover:text-teal-400"
              }`}
          >
            সব পণ্য ({initialProducts.length})
          </button>
          {categories.map((cat) => {
            const count = initialProducts.filter(
              (p) => p.categoryId === cat.id
            ).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl border font-semibold text-sm transition-all duration-300 cursor-pointer whitespace-nowrap ${selectedCategory === cat.id
                  ? "bg-teal-500 text-ocean-950 border-teal-400 glow-teal"
                  : "bg-ocean-950/50 border-white/5 text-gray-300 hover:border-teal-500/30 hover:text-teal-400"
                  }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Products Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <h2 className="text-2xl font-bold text-white">
            আমাদের সংগ্রহ ({filteredProducts.length})
          </h2>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 glassmorphism rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-4">
            <AlertTriangle className="w-12 h-12 text-teal-400" />
            <p className="text-gray-400 text-lg">দুঃখিত, কোনো পণ্য খুঁজে পাওয়া যায়নি!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const inWishlist = isInWishlist(product.id);
              const isStockOut = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  className="glassmorphism glassmorphism-hover rounded-2xl overflow-hidden flex flex-col h-full group"
                >
                  {/* Image banner & Heart button */}
                  <div className="relative aspect-square w-full bg-ocean-950 overflow-hidden flex items-center justify-center">
                    {product.images && product.images[0] ? (
                      <Link href={`/products/${product.id}`}>
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                    ) : (
                      <span className="text-6xl select-none group-hover:scale-110 transition-transform duration-300">🐟</span>
                    )}

                    {/* Stock indicator badge */}
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${isStockOut
                        ? "bg-red-500/90 text-white"
                        : "bg-teal-500/90 text-ocean-950 glow-teal"
                        }`}
                    >
                      {isStockOut ? "স্টক আউট" : "স্টকে আছে"}
                    </span>

                    {/* Wishlist toggle button */}
                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`absolute top-3 right-3 p-2.5 rounded-full border transition-all duration-300 cursor-pointer ${inWishlist
                        ? "bg-rose-500 text-white border-rose-400"
                        : "bg-ocean-950/80 border-white/10 text-gray-300 hover:text-rose-500"
                        }`}
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={inWishlist ? "currentColor" : "none"}
                      />
                    </button>
                  </div>

                  {/* Details block */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-teal-400 uppercase tracking-wide">
                        {product.category.name}
                      </span>

                      <Link href={`/products/${product.id}`}>
                        <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>

                      {/* <p className="text-gray-400 text-sm line-clamp-2">
                        {product.description}
                      </p> */}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-extrabold text-teal-400">
                          ৳ {product.price.toLocaleString("bn-BD")}
                        </span>
                        <span className="text-sm ml-1">{["Plant", "Food"].includes(product.category.name) ? "(পিস)" : "(জোড়া)"}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        অবশিষ্ট: {product.stock.toLocaleString("bn-BD")} {["Plant", "Food"].includes(product.category.name) ? "পিস" : "জোড়া"}
                      </span>
                    </div>



                    {/* Actions block */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Link
                        href={`/products/${product.id}`}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold hover:bg-white/5 transition-colors text-gray-300"
                      >
                        <Info className="w-4 h-4" /> বিস্তারিত
                      </Link>
                      <button
                        onClick={() => addToCart(product, 1)}
                        disabled={isStockOut}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${isStockOut
                          ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
                          : "bg-teal-500 text-ocean-950 hover:bg-teal-400 glow-teal"
                          }`}
                      >
                        <ShoppingCart className="w-4 h-4" /> কার্ট
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}



// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { Product, Category } from "@prisma/client";
// import { useApp } from "@/context/AppContext";
// import {
//   Search,
//   Heart,
//   ShoppingCart,
//   Info,
//   AlertTriangle,
//   Sparkles,
//   Fish,
//   ChevronDown,
// } from "lucide-react";

// interface HomeContentProps {
//   initialProducts: (Product & { category: Category })[];
//   categories: Category[];
// }

// export default function HomeContent({
//   initialProducts,
//   categories,
// }: HomeContentProps) {
//   const { addToCart, toggleWishlist, isInWishlist } = useApp();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   const filteredProducts = initialProducts.filter((product) => {
//     const matchesCategory =
//       selectedCategory === "all" || product.categoryId === selectedCategory;
//     const matchesSearch =
//       product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       product.description.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   return (
//     <div
//       className={`space-y-16 transition-opacity duration-700 ${
//         mounted ? "opacity-100" : "opacity-0"
//       }`}
//     >
//       {/* ─── HERO SECTION ─── */}
//       <section className="relative rounded-3xl overflow-hidden min-h-[600px] md:min-h-[680px] flex items-end">
//         {/* Full-bleed background image */}
//         <Image
//           src="https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=1600&q=80"
//           alt="Colorful aquarium fish"
//           fill
//           priority
//           className="object-cover object-center scale-105 transition-transform duration-[8000ms] hover:scale-100"
//         />

//         {/* Deep gradient overlays for text legibility */}
//         <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-ocean-950/60 to-transparent" />
//         <div className="absolute inset-0 bg-gradient-to-r from-ocean-950/80 via-transparent to-transparent" />

//         {/* Subtle animated bubbles */}
//         <div className="absolute inset-0 overflow-hidden pointer-events-none">
//           {[...Array(8)].map((_, i) => (
//             <div
//               key={i}
//               className="absolute rounded-full border border-teal-400/30 animate-ping"
//               style={{
//                 width: `${12 + i * 8}px`,
//                 height: `${12 + i * 8}px`,
//                 left: `${10 + i * 11}%`,
//                 bottom: `${15 + (i % 3) * 20}%`,
//                 animationDelay: `${i * 0.6}s`,
//                 animationDuration: `${2.5 + i * 0.4}s`,
//                 opacity: 0.25,
//               }}
//             />
//           ))}
//         </div>

//         {/* Teal accent glow */}
//         <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-teal-500/15 blur-[120px] pointer-events-none" />

//         {/* Hero Content */}
//         <div className="relative z-10 w-full p-8 md:p-14 lg:p-20 space-y-8">
//           {/* Badge */}
//           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/15 border border-teal-400/30 backdrop-blur-sm">
//             <Sparkles className="w-3.5 h-3.5 text-teal-300" />
//             <span className="text-teal-300 text-xs font-bold uppercase tracking-widest">
//               স্বাগতম SN Aquarist-এ
//             </span>
//           </div>

//           {/* Headline */}
//           <div className="space-y-3 max-w-2xl">
//             <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] text-white drop-shadow-2xl">
//               আপনার ঘরে গড়ে তুলুন
//             </h1>
//             <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] bg-gradient-to-r from-teal-300 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
//               রঙিন জলের মায়াবী জগত!
//             </h1>
//           </div>

//           <p className="text-gray-300 text-base md:text-lg max-w-xl leading-relaxed">
//             সেরা মানের সুস্থ রঙিন অ্যাকোয়ারিয়াম মাছ ও আনুষঙ্গিক জিনিসপত্রের
//             বিশেষ সংগ্রহ।
//           </p>

//           {/* Search bar */}
//           <div className="relative max-w-lg group">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-400 transition-colors duration-300" />
//             <input
//               type="text"
//               placeholder="পছন্দের মাছ বা এক্সেসরিজ খুঁজুন..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-12 pr-5 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:border-teal-400/60 focus:bg-white/15 outline-none transition-all duration-300 text-white placeholder-gray-400 shadow-xl"
//             />
//           </div>

//           {/* Stats row */}
//           <div className="flex flex-wrap gap-6 pt-2">
//             {[
//               { value: `${initialProducts.length}+`, label: "পণ্য" },
//               { value: `${categories.length}`, label: "ক্যাটাগরি" },
//               { value: "১০০%", label: "সুস্থ মাছ" },
//             ].map((stat) => (
//               <div key={stat.label} className="flex items-baseline gap-2">
//                 <span className="text-2xl font-extrabold text-teal-300">
//                   {stat.value}
//                 </span>
//                 <span className="text-gray-400 text-sm">{stat.label}</span>
//               </div>
//             ))}
//           </div>

//           {/* Scroll hint */}
//           <div className="hidden md:flex items-center gap-2 text-gray-500 text-xs">
//             <ChevronDown className="w-4 h-4 animate-bounce" />
//             <span>স্ক্রল করুন</span>
//           </div>
//         </div>
//       </section>

//       {/* ─── CATEGORY FILTER ─── */}
//       <section className="space-y-5">
//         <div className="flex items-center gap-3">
//           <Fish className="w-5 h-5 text-teal-400" />
//           <h2 className="text-xl font-bold text-white">ক্যাটাগরি বেছে নিন</h2>
//         </div>

//         <div className="flex flex-wrap gap-2.5">
//           <button
//             onClick={() => setSelectedCategory("all")}
//             className={`px-5 py-2.5 rounded-xl border font-semibold text-sm transition-all duration-300 cursor-pointer whitespace-nowrap ${
//               selectedCategory === "all"
//                 ? "bg-teal-500 text-ocean-950 border-teal-400 shadow-[0_0_16px_rgba(20,184,166,0.4)]"
//                 : "bg-white/5 border-white/10 text-gray-300 hover:border-teal-500/40 hover:text-teal-300 hover:bg-white/8"
//             }`}
//           >
//             সব পণ্য
//             <span
//               className={`ml-2 px-2 py-0.5 rounded-md text-xs ${
//                 selectedCategory === "all"
//                   ? "bg-ocean-950/30"
//                   : "bg-white/10"
//               }`}
//             >
//               {initialProducts.length}
//             </span>
//           </button>

//           {categories.map((cat) => {
//             const count = initialProducts.filter(
//               (p) => p.categoryId === cat.id
//             ).length;
//             const isActive = selectedCategory === cat.id;
//             return (
//               <button
//                 key={cat.id}
//                 onClick={() => setSelectedCategory(cat.id)}
//                 className={`px-5 py-2.5 rounded-xl border font-semibold text-sm transition-all duration-300 cursor-pointer whitespace-nowrap ${
//                   isActive
//                     ? "bg-teal-500 text-ocean-950 border-teal-400 shadow-[0_0_16px_rgba(20,184,166,0.4)]"
//                     : "bg-white/5 border-white/10 text-gray-300 hover:border-teal-500/40 hover:text-teal-300 hover:bg-white/8"
//                 }`}
//               >
//                 {cat.name}
//                 <span
//                   className={`ml-2 px-2 py-0.5 rounded-md text-xs ${
//                     isActive ? "bg-ocean-950/30" : "bg-white/10"
//                   }`}
//                 >
//                   {count}
//                 </span>
//               </button>
//             );
//           })}
//         </div>
//       </section>

//       {/* ─── PRODUCTS GRID ─── */}
//       <section className="space-y-6">
//         <div className="flex justify-between items-center">
//           <h2 className="text-2xl font-bold text-white">
//             আমাদের সংগ্রহ
//             <span className="ml-3 text-base font-normal text-gray-500">
//               ({filteredProducts.length} টি পণ্য)
//             </span>
//           </h2>
//         </div>

//         {filteredProducts.length === 0 ? (
//           <div className="text-center py-20 bg-white/3 rounded-3xl border border-white/8 flex flex-col items-center justify-center gap-4">
//             <AlertTriangle className="w-12 h-12 text-amber-400/70" />
//             <p className="text-gray-400 text-lg">
//               দুঃখিত, কোনো পণ্য খুঁজে পাওয়া যায়নি!
//             </p>
//             <button
//               onClick={() => {
//                 setSearchTerm("");
//                 setSelectedCategory("all");
//               }}
//               className="mt-2 px-6 py-2.5 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 text-sm font-semibold hover:bg-teal-500/25 transition-colors"
//             >
//               ফিল্টার রিসেট করুন
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
//             {filteredProducts.map((product, idx) => {
//               const inWishlist = isInWishlist(product.id);
//               const isStockOut = product.stock <= 0;

//               return (
//                 <div
//                   key={product.id}
//                   className="group relative bg-white/4 hover:bg-white/7 border border-white/8 hover:border-teal-500/30 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(20,184,166,0.08)]"
//                   style={{ animationDelay: `${idx * 40}ms` }}
//                 >
//                   {/* Product Image */}
//                   <div className="relative aspect-[4/3] w-full bg-ocean-950/60 overflow-hidden flex items-center justify-center">
//                     {product.images && product.images[0] ? (
//                       <Image
//                         src={product.images[0]}
//                         alt={product.name}
//                         fill
//                         className="object-cover group-hover:scale-108 transition-transform duration-700"
//                       />
//                     ) : (
//                       <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-teal-900/30 to-ocean-900/60">
//                         <span className="text-7xl select-none group-hover:scale-110 transition-transform duration-500">
//                           🐟
//                         </span>
//                       </div>
//                     )}

//                     {/* Gradient scrim at bottom of image */}
//                     <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ocean-950/70 to-transparent" />

//                     {/* Stock badge */}
//                     <span
//                       className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide backdrop-blur-sm ${
//                         isStockOut
//                           ? "bg-red-500/80 text-white"
//                           : "bg-teal-500/85 text-ocean-950"
//                       }`}
//                     >
//                       {isStockOut ? "স্টক আউট" : "স্টকে আছে"}
//                     </span>

//                     {/* Wishlist button */}
//                     <button
//                       onClick={() => toggleWishlist(product)}
//                       className={`absolute top-3 right-3 p-2.5 rounded-xl backdrop-blur-sm border transition-all duration-300 cursor-pointer ${
//                         inWishlist
//                           ? "bg-rose-500/90 text-white border-rose-400/50 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
//                           : "bg-black/30 border-white/15 text-gray-300 hover:text-rose-400 hover:bg-black/50 hover:border-rose-400/30"
//                       }`}
//                     >
//                       <Heart
//                         className="w-4 h-4"
//                         fill={inWishlist ? "currentColor" : "none"}
//                       />
//                     </button>
//                   </div>

//                   {/* Product Details */}
//                   <div className="p-5 flex-1 flex flex-col justify-between gap-4">
//                     <div className="space-y-1.5">
//                       <span className="text-xs font-semibold text-teal-400/80 uppercase tracking-widest">
//                         {product.category.name}
//                       </span>
//                       <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors duration-200 line-clamp-1">
//                         {product.name}
//                       </h3>
//                       <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
//                         {product.description}
//                       </p>
//                     </div>

//                     {/* Price row */}
//                     <div className="flex items-end justify-between">
//                       <div>
//                         <p className="text-xs text-gray-600 mb-0.5">মূল্য</p>
//                         <span className="text-xl font-extrabold text-teal-400">
//                           ৳ {product.price.toLocaleString("bn-BD")}
//                         </span>
//                       </div>
//                       <span className="text-xs text-gray-600 pb-1">
//                         {product.stock.toLocaleString("bn-BD")} টি বাকি
//                       </span>
//                     </div>

//                     {/* Action buttons */}
//                     <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/6">
//                       <Link
//                         href={`/products/${product.id}`}
//                         className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/12 text-sm font-semibold text-gray-300 hover:bg-white/8 hover:text-white hover:border-white/20 transition-all duration-200"
//                       >
//                         <Info className="w-4 h-4" />
//                         বিস্তারিত
//                       </Link>
//                       <button
//                         onClick={() => addToCart(product, 1)}
//                         disabled={isStockOut}
//                         className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
//                           isStockOut
//                             ? "bg-gray-800/60 text-gray-600 border border-gray-700/50 cursor-not-allowed"
//                             : "bg-teal-500 text-ocean-950 hover:bg-teal-400 shadow-[0_4px_12px_rgba(20,184,166,0.35)] hover:shadow-[0_4px_18px_rgba(20,184,166,0.55)] active:scale-95"
//                         }`}
//                       >
//                         <ShoppingCart className="w-4 h-4" />
//                         কার্টে যোগ
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </section>
//     </div>
//   );
// }