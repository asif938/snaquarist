import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCustomerOrders } from "@/app/actions/orderActions";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { LayoutDashboard, User, ShoppingBag, MapPin, Phone, Mail, Clock, ShieldCheck, AlertCircle, Calendar } from "lucide-react";

// Disable page cache for live orders tracking
export const revalidate = 0;

function formatStatus(status: string) {
  switch (status) {
    case "PENDING":
      return { text: "পেন্ডিং (রিভিউ হচ্ছে)", color: "text-yellow-400 bg-yellow-400/10 border-yellow-500/20" };
    case "PROCESSING":
      return { text: "প্রসেসিং হচ্ছে", color: "text-sky-400 bg-sky-400/10 border-sky-500/20" };
    case "DELIVERED":
      return { text: "ডেলিভারি সম্পন্ন", color: "text-emerald-400 bg-emerald-400/10 border-emerald-500/20" };
    case "CANCELLED":
      return { text: "বাতিল করা হয়েছে", color: "text-rose-400 bg-rose-400/10 border-rose-500/20" };
    default:
      return { text: status, color: "text-gray-400 bg-gray-400/10 border-gray-500/20" };
  }
}

function formatPaymentStatus(status: string) {
  switch (status) {
    case "PENDING":
      return { text: "পেন্ডিং", color: "text-yellow-400 bg-yellow-400/10 border-yellow-500/20" };
    case "PAID":
      return { text: "পরিশোধিত", color: "text-emerald-400 bg-emerald-400/10 border-emerald-500/20" };
    case "REFUNDED":
      return { text: "রিফান্ড করা হয়েছে", color: "text-rose-400 bg-rose-400/10 border-rose-500/20" };
    default:
      return { text: status, color: "text-gray-400 bg-gray-400/10 border-gray-500/20" };
  }
}

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Safeguard: although middleware checks this, double check to keep typescript safe
  if (!session?.user) return null;

  const [orders, dbUser] = await Promise.all([
    getCustomerOrders(),
    prisma.user.findUnique({
      where: { id: session.user.id },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2.5">
            <LayoutDashboard className="w-8 h-8 text-teal-400" />
            <span>গ্রাহক ড্যাশবোর্ড</span>
          </h1>
          <p className="text-gray-400 text-sm">
            স্বাগতম, <span className="text-teal-400 font-semibold">{session.user.name}</span>! আপনার প্রোফাইল ও অর্ডার ট্র্যাক করুন।
          </p>
        </div>

        {dbUser?.role === "ADMIN" && (
          <Link
            href="/admin"
            className="px-5 py-2.5 rounded-xl bg-teal-500 text-ocean-950 font-bold hover:bg-teal-400 transition-all glow-teal text-center"
          >
            অ্যাডমিন প্যানেল এ যান
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card left */}
        <div className="space-y-6">
          <div className="glassmorphism rounded-3xl p-6 border border-white/5 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <User className="w-5 h-5 text-teal-400" /> প্রোফাইল তথ্য
            </h3>

            <div className="space-y-4 text-sm">
              {/* Name */}
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs">নাম</p>
                  <p className="font-bold text-white">{dbUser?.name}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs">ইমেইল ঠিকানা</p>
                  <p className="font-semibold text-white break-all">{dbUser?.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs">মোবাইল নম্বর</p>
                  <p className="font-semibold text-white">
                    {dbUser?.phone || <span className="text-gray-500 italic">যুক্ত করা হয়নি</span>}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-xs">ডেলিভারি ঠিকানা</p>
                  <p className="font-medium text-white">
                    {dbUser?.address || <span className="text-gray-500 italic">যুক্ত করা হয়নি</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders list right */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glassmorphism rounded-3xl p-6 border border-white/5 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <ShoppingBag className="w-5 h-5 text-teal-400" /> আমার অর্ডার সমূহ ({orders.length})
            </h3>

            {orders.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center gap-3">
                <AlertCircle className="w-10 h-10 text-gray-500" />
                <p className="text-gray-400">আপনি এখনো কোনো অর্ডার করেননি!</p>
                <Link href="/" className="text-teal-400 hover:underline text-sm font-semibold">
                  আমাদের ফিশ কালেকশন দেখুন
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const orderStat = formatStatus(order.orderStatus);
                  const payStat = formatPaymentStatus(order.paymentStatus);

                  return (
                    <div
                      key={order.id}
                      className="border border-white/5 bg-ocean-950/40 rounded-2xl p-5 space-y-4"
                    >
                      {/* Order info header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">
                            অর্ডার আইডি: <span className="font-mono text-gray-300 font-bold">{order.id}</span>
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              তারিখ:{" "}
                              {new Date(order.createdAt).toLocaleDateString("bn-BD", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${orderStat.color}`}>
                            {orderStat.text}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${payStat.color}`}>
                            পেমেন্ট: {payStat.text}
                          </span>
                        </div>
                      </div>

                      {/* Items loop */}
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="text-gray-300">
                              {item.product.name}{" "}
                              <span className="text-gray-500 text-xs">
                                × {item.quantity.toLocaleString("bn-BD")}
                              </span>
                            </span>
                            <span className="font-semibold text-gray-400">
                              ৳ {(item.price * item.quantity).toLocaleString("bn-BD")}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Footer pricing & payment details */}
                      <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-white/5 text-sm">
                        <div className="text-xs text-gray-500 space-y-0.5">
                          <p>
                            বিকাশ নম্বর: <span className="text-gray-300">{order.senderPhone || "N/A"}</span>
                          </p>
                          <p>
                            TrxID: <span className="font-mono text-teal-400 font-bold uppercase">{order.transactionId}</span>
                          </p>
                        </div>

                        <div className="font-extrabold text-base text-teal-400">
                          সর্বমোট: ৳ {order.totalAmount.toLocaleString("bn-BD")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
