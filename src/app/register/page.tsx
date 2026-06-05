"use client";

import React, { useState } from "react";
import { registerUser } from "@/app/actions/authActions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, User, Mail, Lock, Phone, MapPin, AlertTriangle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await registerUser(formData);

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setSuccess(res.success || "অ্যাকাউন্ট তৈরি সফল হয়েছে!");
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError("সার্ভার ত্রুটি ঘটেছে, দয়া করে আবার চেষ্টা করুন।");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="glassmorphism rounded-3xl p-8 border border-white/5 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto text-teal-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">নতুন অ্যাকাউন্ট তৈরি করুন</h2>
          <p className="text-sm text-gray-400">SN Aquarist-এ যুক্ত হয়ে কেনাকাটা সহজ করুন</p>
        </div>

        {/* Display feedback messages */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400 text-sm flex items-center gap-2 glow-teal/10">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400">নাম *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                name="name"
                required
                placeholder="যেমন: সাকিব হাসান"
                className="w-full pl-10 pr-4 py-3 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400">ইমেইল ঠিকানা *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                name="email"
                required
                placeholder="example@email.com"
                className="w-full pl-10 pr-4 py-3 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400">পাসওয়ার্ড *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                name="password"
                required
                placeholder="কমপক্ষে ৬ ডিজিটের পাসওয়ার্ড"
                minLength={6}
                className="w-full pl-10 pr-4 py-3 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Phone (optional) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400">মোবাইল নম্বর (ঐচ্ছিক)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="tel"
                name="phone"
                placeholder="যেমন: ০১৭XXXXXXXX"
                className="w-full pl-10 pr-4 py-3 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Address (optional) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400">ডেলিভারি ঠিকানা (ঐচ্ছিক)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <textarea
                name="address"
                rows={2}
                placeholder="গ্রাম/রোড, জেলা লিখুন"
                className="w-full pl-10 pr-4 py-2.5 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 transition-colors text-sm resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
              loading
                ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
                : "bg-teal-500 text-ocean-950 hover:bg-teal-400 glow-teal"
            }`}
          >
            {loading ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "রেজিস্ট্রেশন করুন"}
          </button>
        </form>

        {/* Link to Login */}
        <p className="text-center text-sm text-gray-400">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          <Link href="/login" className="text-teal-400 hover:underline font-semibold">
            এখানে লগইন করুন
          </Link>
        </p>
      </div>
    </div>
  );
}
