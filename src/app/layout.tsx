import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SN Aquarist - প্রিমিয়াম অ্যাকোয়ারিয়াম ফিশ ই-কমার্স স্টোর",
  description:
    "আপনার অ্যাকোয়ারিয়ামের জন্য সেরা মানের বিভিন্ন প্রজাতির মাছ, খাবার এবং আনুষঙ্গিক জিনিসপত্র কিনুন নিরাপদে ও সহজে।",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body>
        <Providers>
          <Navbar />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:px-8">
            {children}
          </main>
          <footer className="mt-auto border-t border-white/5 bg-ocean-950/80 backdrop-blur-md py-8 px-4 text-center text-sm text-gray-400">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gradient text-base mb-1">SN Aquarist</p>
                <p>সেরা মানের অ্যাকোয়ারিয়াম ফিশ এবং এক্সেসরিজ বিক্রেতা।</p>
              </div>
              <div className="flex flex-col gap-1 items-center md:items-end text-xs">
                <p>হেল্পলাইন: +8801842332856 (বিকাশ পার্সোনাল)</p>
                <p className="text-gray-500">
                  © {new Date().getFullYear()} SN Aquarist. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
