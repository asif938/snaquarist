"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useApp } from "@/context/AppContext";
import { ShoppingCart, Heart, User, LogOut, LayoutDashboard, Settings, Menu, X, Sun, Moon } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();
  const { cart, wishlist, theme, toggleTheme } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="sticky top-0 z-50 glassmorphism border-b border-white/5 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-[200px] h-[60px] flex items-center justify-center overflow-hidden">
            <Image
              src="/sn-aquarist.png"
              alt="SN Aquarist"
              fill
              className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                // If image fails to load, we can hide it or let it display the fallback letters
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
            {/* Fallback initials */}
            {/* <span className="text-teal-400 font-bold text-lg select-none">SN</span> */}
          </div>
          {/* <span className="text-xl font-bold text-gradient tracking-wide">
            SN Aquarist
          </span> */}
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-300 hover:text-teal-400 transition-colors duration-200">
            হোম
          </Link>
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-gray-300 hover:text-teal-400 transition-colors duration-200 font-medium"
            >
              <Settings className="w-4 h-4" />
              অ্যাডমিন প্যানেল
            </Link>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="hidden md:flex items-center gap-5">
          {/* Wishlist */}
          <Link
            href="/cart?tab=wishlist"
            className="relative p-2 text-gray-300 hover:text-teal-400 transition-colors duration-200"
          >
            <Heart className="w-6 h-6" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-ocean-950 font-bold text-xs rounded-full flex items-center justify-center glow-teal">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2 text-gray-300 hover:text-teal-400 transition-colors duration-200"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 text-ocean-950 font-bold text-xs rounded-full flex items-center justify-center glow-teal">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-300 hover:text-teal-400 transition-colors duration-200 cursor-pointer"
            title={theme === "dark" ? "লাইট মোড" : "ডার্ক মোড"}
          >
            {theme === "dark" ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6" />}
          </button>

          {/* User Section */}
          {session ? (
            <div className="flex items-center gap-4 border-l border-white/10 pl-5">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-300 hover:text-teal-400 transition-colors duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-ocean-700 border border-teal-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-teal-400" />
                </div>
                <span className="text-sm font-medium max-w-[100px] truncate">
                  {session.user.name}
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                title="লগআউট"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-white/10 pl-5">
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-lg border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 transition-colors duration-200 text-sm font-medium"
              >
                লগইন
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 rounded-lg bg-teal-500 text-ocean-950 hover:bg-teal-400 transition-colors duration-200 text-sm font-bold glow-teal"
              >
                রেজিস্ট্রেশন
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-gray-300 hover:text-teal-400 transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/5 flex flex-col gap-4 animate-fadeIn">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="text-gray-300 hover:text-teal-400 transition-colors duration-200 py-1"
          >
            হোম
          </Link>
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1.5 text-gray-300 hover:text-teal-400 transition-colors duration-200 py-1"
            >
              <Settings className="w-4 h-4" />
              অ্যাডমিন প্যানেল
            </Link>
          )}

          <div className="flex flex-col gap-3 py-2 border-t border-b border-white/5">
            <div className="flex items-center gap-6">
              <Link
                href="/cart?tab=wishlist"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-teal-400"
              >
                <Heart className="w-5 h-5 text-teal-400" />
                ইচ্ছেতালিকা ({wishlistCount})
              </Link>

              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-teal-400"
              >
                <ShoppingCart className="w-5 h-5 text-teal-400" />
                কার্ট ({cartCount})
              </Link>
            </div>

            {/* Mobile Theme Toggle */}
            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 text-gray-300 hover:text-teal-400 py-1 text-left cursor-pointer"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-5 h-5 text-yellow-400" />
                  <span>লাইট মোড চালু করুন</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5" />
                  <span>ডার্ক মোড চালু করুন</span>
                </>
              )}
            </button>
          </div>

          {session ? (
            <div className="flex flex-col gap-3 py-1">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-teal-400"
              >
                <LayoutDashboard className="w-5 h-5 text-teal-400" />
                ড্যাশবোর্ড ({session.user.name})
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleSignOut();
                }}
                className="flex items-center gap-2 text-red-400 text-left hover:text-red-300 py-1"
              >
                <LogOut className="w-5 h-5" />
                লগআউট
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 pb-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2 rounded-lg border border-teal-500/30 text-teal-400 font-medium"
              >
                লগইন
              </Link>
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2 rounded-lg bg-teal-500 text-ocean-950 font-bold"
              >
                রেজিস্ট্রেশন
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
