"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, AlertTriangle, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get errors from URL query parameters (e.g. NextAuth auth errors)
  const urlError = searchParams.get("error");
  const displayError = error || (urlError ? "লগইন করতে সমস্যা হয়েছে, অনুগ্রহ করে তথ্য চেক করুন।" : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password: password,
        redirect: false, // We handle redirection manually
      });

      if (res?.error) {
        // Translate or display error message
        setError(res.error || "ইমেইল বা পাসওয়ার্ড ভুল, দয়া করে আবার চেষ্টা করুন।");
        setLoading(false);
      } else {
        // Fetch current session to check role and redirect accordingly
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        if (session?.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("সার্ভার সংযোগে ত্রুটি ঘটেছে, পুনরায় চেষ্টা করুন।");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="glassmorphism rounded-3xl p-8 border border-white/5 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mx-auto text-teal-400">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">অ্যাকাউন্টে লগইন করুন</h2>
          <p className="text-sm text-gray-400">SN Aquarist-এ আপনার অ্যাক্সেস নিশ্চিত করুন</p>
        </div>

        {/* Display errors */}
        {displayError && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400">ইমেইল ঠিকানা</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full pl-10 pr-4 py-3 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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
            {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
          </button>
        </form>

        {/* Link to Register */}
        <p className="text-center text-sm text-gray-400">
          নতুন ক্রেতা?{" "}
          <Link href="/register" className="text-teal-400 hover:underline font-semibold">
            এখানে রেজিস্ট্রেশন করুন
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto py-12 text-center text-teal-400">লোড হচ্ছে...</div>}>
      <LoginForm />
    </Suspense>
  );
}
