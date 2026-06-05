"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useApp } from "@/context/AppContext";
import { createOrder } from "@/app/actions/orderActions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CreditCard, ShoppingCart, User, MapPin, Phone, Mail, Award, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cart, clearCart } = useApp();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");

  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  // Autofill fields if logged in
  useEffect(() => {
    if (session?.user) {
      setCustomerName(session.user.name || "");
      setCustomerEmail(session.user.email || "");
      // Other details like phone & address might not be in the initial oauth session.
      // We could query the DB or let the user fill them out.
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (cart.length === 0) {
      setError("আপনার শপিং কার্ট খালি!");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim() || !transactionId.trim()) {
      setError("অনগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন।");
      return;
    }

    setLoading(true);

    try {
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const res = await createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerAddress: customerAddress.trim(),
        transactionId: transactionId.trim(),
        senderPhone: senderPhone.trim() || undefined,
        items: orderItems,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setCreatedOrderId(res.orderId || "");
        setOrderCompleted(true);
        await clearCart();

        // ✅ Send admin email notification via Web3Forms
        const orderSummary = cart
          .map((item) => `• ${item.product.name} × ${item.quantity} = ৳${item.product.price * item.quantity}`)
          .join("\n");

        const emailPayload = {
          access_key: "ed31fac3-70cf-4736-a6db-4c26478d0144", // 🔑 Replace with your Web3Forms key
          subject: `🛒 নতুন অর্ডার - ${res.orderId}`,
          from_name: "Shop Notification",
          message: `
          নতুন অর্ডার পাওয়া গেছে!

          📦 অর্ডার আইডি: ${res.orderId}
          👤 ক্রেতার নাম: ${customerName.trim()}
          📞 মোবাইল: ${customerPhone.trim()}
          📧 ইমেইল: ${customerEmail.trim() || "দেওয়া হয়নি"}
          🏠 ঠিকানা: ${customerAddress.trim()}

          💳 বিকাশ নম্বর: ${senderPhone.trim() || "দেওয়া হয়নি"}
          🔖 TrxID: ${transactionId.trim()}

          🛍️ অর্ডার সারসংক্ষেপ:
          ${orderSummary}

          💰 সর্বমোট: ৳${cartTotal}
          `.trim(),
        };

        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(emailPayload),
        });
        // Note: We don't block the order success on email failure
      }
    } catch (err) {
      console.error(err);
      setError("অর্ডার সম্পন্ন করতে সার্ভার ত্রুটি হয়েছে। দয়া করে আবার চেষতা করুন।");
    } finally {
      setLoading(false);
    }
  };

  // Success view
  if (orderCompleted) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-8 glassmorphism rounded-3xl border border-white/5 p-8 md:p-12">
        <div className="w-20 h-20 bg-teal-500/10 border-2 border-teal-500 rounded-full flex items-center justify-center mx-auto glow-teal">
          <CheckCircle className="w-10 h-10 text-teal-400" />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold text-white">অর্ডার সম্পন্ন হয়েছে!</h2>
          <p className="text-gray-300">
            আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। অ্যাডমিন পেমেন্ট চেক করে শীঘ্রই অর্ডারটি প্রসেস করবে।
          </p>
        </div>

        <div className="bg-ocean-950/80 p-5 rounded-2xl border border-white/5 space-y-2 text-left text-sm max-w-sm mx-auto">
          <p className="text-gray-400">
            অর্ডার আইডি: <span className="font-mono text-teal-400 font-bold">{createdOrderId}</span>
          </p>
          <p className="text-gray-400">
            বিকাশ TrxID: <span className="font-mono text-white font-bold">{transactionId}</span>
          </p>
          <p className="text-gray-400">
            অবস্থা: <span className="text-yellow-400 font-bold">পেন্ডিং (রিভিউ হচ্ছে)</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          {session ? (
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-teal-500 text-ocean-950 font-bold rounded-xl hover:bg-teal-400 transition-all glow-teal cursor-pointer"
            >
              ড্যাশবোর্ড এ যান
            </Link>
          ) : (
            <Link
              href="/"
              className="px-6 py-3 bg-teal-500 text-ocean-950 font-bold rounded-xl hover:bg-teal-400 transition-all glow-teal cursor-pointer"
            >
              হোম পেজে ফিরে যান
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Normal checkout form
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold text-white flex items-center gap-2 border-b border-white/5 pb-4">
        <span>🛒</span> নিরাপদ চেকআউট
      </h1>

      {cart.length === 0 ? (
        <div className="text-center py-16 glassmorphism rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-4">
          <AlertTriangle className="w-12 h-12 text-teal-400" />
          <p className="text-gray-400 text-lg">অর্ডার করার জন্য কার্টে কোনো পণ্য নেই!</p>
          <Link
            href="/"
            className="px-5 py-2.5 bg-teal-500 text-ocean-950 rounded-xl font-bold hover:bg-teal-400 glow-teal transition-colors cursor-pointer"
          >
            বাজারে ফিরে যান
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Checkout billing/payment form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
            {/* Delivery address info */}
            <div className="glassmorphism rounded-3xl p-6 md:p-8 border border-white/5 space-y-5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <MapPin className="w-5 h-5 text-teal-400" /> ডেলিভারি তথ্য
              </h3>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Customer Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">ক্রেতার নাম *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="আপনার পুরো নাম লিখুন"
                    className="w-full px-4 py-3 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 transition-colors"
                  />
                </div>

                {/* Customer Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">মোবাইল নম্বর *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="১১ ডিজিটের সচল মোবাইল নম্বর"
                    className="w-full px-4 py-3 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 transition-colors"
                  />
                </div>

                {/* Customer Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="আপনার সচল ইমেইল (যদি থাকে)"
                    className="w-full px-4 py-3 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 transition-colors"
                  />
                </div>

                {/* Shipping Address */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">সম্পূর্ণ ঠিকানা *</label>
                  <textarea
                    required
                    rows={3}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="গ্রাম/রোড নম্বর, উপজেলা, জেলা এবং ল্যান্ডমার্ক লিখুন"
                    className="w-full px-4 py-3 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* bKash Payment details block */}
            <div className="glassmorphism rounded-3xl p-6 md:p-8 border border-white/5 space-y-5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                <CreditCard className="w-5 h-5 text-teal-400" /> বিকাশ পেমেন্ট
              </h3>

              {/* Step instructions */}
              <div className="bg-teal-500/5 border border-teal-500/20 rounded-2xl p-5 space-y-3 text-sm leading-relaxed text-gray-300">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-teal-400" /> কিভাবে পরিশোধ করবেন?
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-gray-400">
                  <li>
                    আপনার বিকাশ অ্যাকাউন্ট থেকে নিচের নাম্বারে{" "}
                    <span className="text-teal-400 font-bold">
                      ৳ {cartTotal.toLocaleString("bn-BD")}
                    </span>{" "}
                    টাকা <span className="text-white font-bold">Send Money</span> করুন।
                  </li>
                  <li>
                    বিকাশ নম্বর:{" "}
                    <span className="font-mono text-white text-base font-bold bg-ocean-950 px-2 py-0.5 rounded border border-white/5">
                      {process.env.NEXT_PUBLIC_BKASH_NUMBER || "01842332856"}
                    </span>{" "}
                    (পার্সোনাল)
                  </li>
                  <li>টাকা পাঠানোর পর বিকাশ মেসেজ থেকে Transaction ID (TrxID) কপি করুন।</li>
                  <li>নিচের ফরমে আপনার বিকাশ নম্বর এবং ট্রানজেকশন আইডিটি দিন।</li>
                </ol>
              </div>

              {/* Form fields for bKash */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">যে নম্বর থেকে টাকা পাঠিয়েছেন (বিকাশ নম্বর)</label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="যেমন: ০১৭XXXXXXXX"
                    className="w-full px-4 py-3 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">বিকাশ ট্রানজেকশন আইডি (TrxID) *</label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="যেমন: K8H2J9L3P0"
                    className="w-full px-4 py-3 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 transition-colors font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Submit checkout CTA */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl text-base font-extrabold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${loading
                  ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
                  : "bg-teal-500 text-ocean-950 hover:bg-teal-400 glow-teal"
                }`}
            >
              {loading ? "অর্ডার প্রসেস হচ্ছে..." : "পেমেন্ট নিশ্চিত করে অর্ডার করুন"}
            </button>
          </form>

          {/* Cart review right panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glassmorphism rounded-3xl p-6 border border-white/5 space-y-6 sticky top-24">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-3">
                অর্ডারের পণ্যাদি ({cart.reduce((t, i) => t + i.quantity, 0)})
              </h3>

              <div className="max-h-60 overflow-y-auto space-y-4 pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3 items-center text-sm">
                    <div className="relative w-12 h-12 bg-ocean-950 rounded-lg overflow-hidden border border-white/5 flex-shrink-0 flex items-center justify-center">
                      {item.product.images && item.product.images[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-2xl select-none">🐠</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400">
                        {item.quantity.toLocaleString("bn-BD")} টি × ৳ {item.product.price.toLocaleString("bn-BD")}
                      </p>
                    </div>
                    <span className="font-bold text-teal-400">
                      ৳ {(item.product.price * item.quantity).toLocaleString("bn-BD")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>মোট পণ্য মূল্য</span>
                  <span>৳ {cartTotal.toLocaleString("bn-BD")}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="text-teal-400 font-semibold">ফ্রি</span>
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between font-extrabold text-base text-white">
                  <span>সর্বমোট</span>
                  <span className="text-teal-400">৳ {cartTotal.toLocaleString("bn-BD")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
