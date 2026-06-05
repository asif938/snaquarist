"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, Category } from "@prisma/client";
import { useApp } from "@/context/AppContext";
import { Heart, ShoppingCart, ArrowLeft, Youtube, Sparkles, AlertCircle, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProductDetailsProps {
  product: Product & { category: Category };
}

// Extract YouTube Video ID
function getYouTubeEmbedId(url: string | null) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const inWishlist = isInWishlist(product.id);
  const isStockOut = product.stock <= 0;
  const videoId = getYouTubeEmbedId(product.youtubeUrl);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push("/checkout");
  };

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-teal-400 transition-colors font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> বাজারে ফিরে যান
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full bg-ocean-950 rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center">
            {product.images && product.images[activeImageIndex] ? (
              <Image
                src={product.images[activeImageIndex]}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-9xl select-none">🐠</span>
            )}

            {/* Floating Stock Indicator */}
            <span
              className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${
                isStockOut
                  ? "bg-red-500/90 text-white"
                  : "bg-teal-500/90 text-ocean-950 glow-teal"
              }`}
            >
              {isStockOut ? "স্টক আউট" : "স্টকে আছে"}
            </span>

            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full border transition-all duration-300 cursor-pointer ${
                inWishlist
                  ? "bg-rose-500 text-white border-rose-400"
                  : "bg-ocean-950/80 border-white/10 text-gray-300 hover:text-rose-500"
              }`}
            >
              <Heart
                className="w-5 h-5"
                fill={inWishlist ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Thumbnail list */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border bg-ocean-950 flex-shrink-0 cursor-pointer transition-all ${
                    activeImageIndex === index
                      ? "border-teal-500 scale-95"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${index}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information & Actions */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="px-3.5 py-1.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold uppercase tracking-wider">
              {product.category.name}
            </span>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              {product.name}
            </h1>

            <div className="text-3xl font-extrabold text-teal-400">
              ৳ {product.price.toLocaleString("bn-BD")}
            </div>

            <div className="border-t border-b border-white/5 py-4 space-y-2">
              <h3 className="text-lg font-semibold text-gray-200">পণ্যের বিবরণ</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Spec grid for premium look */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl glassmorphism border border-white/5 space-y-1">
                <span className="text-xs text-gray-400">ক্যাটাগরি</span>
                <p className="font-bold text-teal-400">{product.category.name}</p>
              </div>
              <div className="p-4 rounded-2xl glassmorphism border border-white/5 space-y-1">
                <span className="text-xs text-gray-400">স্টক পরিমাণ</span>
                <p className={`font-bold ${isStockOut ? "text-red-400" : "text-emerald-400"}`}>
                  {isStockOut ? "স্টক নেই" : `${product.stock.toLocaleString("bn-BD")} টি বাকি`}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-white/5">
            {/* Quantity Selector */}
            {!isStockOut && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-300">পরিমাণ:</span>
                <div className="flex items-center bg-ocean-950 border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-white/5 text-gray-300 font-bold transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 text-white font-bold select-none">
                    {quantity.toLocaleString("bn-BD")}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 hover:bg-white/5 text-gray-300 font-bold transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Order Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                onClick={handleAddToCart}
                disabled={isStockOut}
                className={`w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 border transition-all duration-300 cursor-pointer ${
                  isStockOut
                    ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-ocean-950/80 border-white/10 text-teal-400 hover:bg-white/5"
                }`}
              >
                <ShoppingCart className="w-5 h-5" /> কার্টে যোগ করুন
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isStockOut}
                className={`w-full py-4 rounded-2xl text-base font-extrabold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                  isStockOut
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-teal-500 text-ocean-950 hover:bg-teal-400 glow-teal"
                }`}
              >
                <ShoppingBag className="w-5 h-5" /> এখনই কিনুন
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Youtube Video Embed section */}
      {videoId && (
        <section className="glassmorphism p-6 md:p-8 rounded-3xl border border-white/5 space-y-5">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Youtube className="w-6 h-6 text-red-500" />
            <span>মাছটির লাইভ ভিডিও দেখে নিন</span>
          </h3>
          <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-white/5 bg-ocean-950 shadow-2xl">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`${product.name} Video`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </section>
      )}
    </div>
  );
}
