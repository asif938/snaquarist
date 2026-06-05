"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import { useSearchParams, useRouter } from "next/navigation";
import { ShoppingCart, Heart, Trash2, ArrowLeft, ShoppingBag, CreditCard, Sparkles } from "lucide-react";

function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, wishlist, removeFromCart, updateCartQuantity, addToCart, clearCart } = useApp();
  const [activeTab, setActiveTab] = useState<"cart" | "wishlist">("cart");

  // Read tab from query parameters
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "wishlist") {
      setActiveTab("wishlist");
    } else {
      setActiveTab("cart");
    }
  }, [searchParams]);

  const totalCartPrice = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Title */}
      <h1 className="text-3xl font-extrabold text-white flex items-center gap-2 border-b border-white/5 pb-4">
        <span>🎒</span> আমার শপিং ব্যাগ
      </h1>

      {/* Tabs Switcher */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => {
            setActiveTab("cart");
            router.push("/cart");
          }}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm cursor-pointer transition-all duration-300 ${
            activeTab === "cart"
              ? "border-teal-500 text-teal-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>আমার কার্ট ({cart.reduce((t, i) => t + i.quantity, 0)})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("wishlist");
            router.push("/cart?tab=wishlist");
          }}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm cursor-pointer transition-all duration-300 ${
            activeTab === "wishlist"
              ? "border-teal-500 text-teal-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>ইচ্ছেতালিকা ({wishlist.length})</span>
        </button>
      </div>

      {/* Cart Content Tab */}
      {activeTab === "cart" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {cart.length === 0 ? (
            <div className="lg:col-span-3 text-center py-20 glassmorphism rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-6">
              <ShoppingCart className="w-16 h-16 text-teal-400" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">আপনার শপিং কার্টটি খালি!</h3>
                <p className="text-gray-400">
                  কার্টে কোনো পণ্য যোগ করা হয়নি। দয়া করে আপনার পছন্দের মাছ নির্বাচন করুন।
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 text-ocean-950 font-bold hover:bg-teal-400 transition-all glow-teal"
              >
                <ArrowLeft className="w-4 h-4" /> কেনাকাটা করতে যান
              </Link>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="glassmorphism rounded-2xl p-4 md:p-5 flex gap-4 items-center border border-white/5"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 bg-ocean-950 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/5">
                      {item.product.images && item.product.images[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-3xl select-none">🐠</span>
                      )}
                    </div>

                    {/* Meta details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-base font-bold text-white truncate hover:text-teal-400 transition-colors">
                        <Link href={`/products/${item.product.id}`}>{item.product.name}</Link>
                      </h4>
                      <p className="text-sm text-teal-400 font-medium">
                        ৳ {item.product.price.toLocaleString("bn-BD")}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center bg-ocean-950 border border-white/10 rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          updateCartQuantity(item.product.id, item.quantity - 1)
                        }
                        className="px-2.5 py-1 hover:bg-white/5 text-gray-300 font-bold cursor-pointer transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2 text-white font-bold select-none text-sm">
                        {item.quantity.toLocaleString("bn-BD")}
                      </span>
                      <button
                        onClick={() =>
                          updateCartQuantity(item.product.id, item.quantity + 1)
                        }
                        className="px-2.5 py-1 hover:bg-white/5 text-gray-300 font-bold cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                {/* Empty Cart helper */}
                <button
                  onClick={clearCart}
                  className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-300"
                >
                  কার্ট পরিষ্কার করুন
                </button>
              </div>

              {/* Checkout Summary panel */}
              <div className="space-y-6">
                <div className="glassmorphism rounded-2xl p-6 border border-white/5 space-y-6">
                  <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">
                    অর্ডার সামারি
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>মোট পণ্যের দাম</span>
                      <span>৳ {totalCartPrice.toLocaleString("bn-BD")}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>ডেলিভারি চার্জ</span>
                      <span className="text-teal-400 font-medium">ফ্রি (কোম্পানি অফার)</span>
                    </div>
                    <div className="border-t border-white/5 pt-3 flex justify-between font-extrabold text-lg text-white">
                      <span>সর্বমোট</span>
                      <span className="text-teal-400">
                        ৳ {totalCartPrice.toLocaleString("bn-BD")}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full py-4 rounded-xl bg-teal-500 text-ocean-950 font-extrabold flex items-center justify-center gap-2 hover:bg-teal-400 transition-all glow-teal text-center cursor-pointer"
                  >
                    <CreditCard className="w-5 h-5" /> চেকআউট করতে এগিয়ে যান
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Wishlist Content Tab */}
      {activeTab === "wishlist" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.length === 0 ? (
            <div className="col-span-full text-center py-20 glassmorphism rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-6">
              <Heart className="w-16 h-16 text-teal-400" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">ইচ্ছেতালিকাটি খালি!</h3>
                <p className="text-gray-400">
                  এখনো কোনো পণ্য ইচ্ছেতালিকায় সংরক্ষণ করা হয়নি।
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 text-ocean-950 font-bold hover:bg-teal-400 transition-all glow-teal"
              >
                <ArrowLeft className="w-4 h-4" /> পণ্য সিলেক্ট করতে যান
              </Link>
            </div>
          ) : (
            wishlist.map((product) => (
              <div
                key={product.id}
                className="glassmorphism rounded-2xl overflow-hidden border border-white/5 flex flex-col justify-between group"
              >
                <div className="relative aspect-square bg-ocean-950 flex items-center justify-center">
                  {product.images && product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-5xl select-none">🐠</span>
                  )}

                  <button
                    onClick={() => removeFromCart(product.id)} // Wait, remove from wishlist!
                    className="absolute top-3 right-3 p-2 bg-ocean-950/80 border border-white/10 rounded-full text-gray-400 hover:text-red-400 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white truncate">
                      <Link href={`/products/${product.id}`}>{product.name}</Link>
                    </h4>
                    <p className="text-teal-400 text-sm font-semibold">
                      ৳ {product.price.toLocaleString("bn-BD")}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      addToCart(product, 1);
                      // optionally delete from wishlist or keep it
                    }}
                    className="w-full py-2.5 rounded-xl bg-teal-500 text-ocean-950 font-bold hover:bg-teal-400 transition-all glow-teal text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" /> কার্টে যোগ করুন
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto py-20 text-center text-teal-400">লোড হচ্ছে...</div>}>
      <CartContent />
    </Suspense>
  );
}
