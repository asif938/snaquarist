import React from "react";
import ProductDetails from "@/components/ProductDetails";
import { getProductById } from "@/app/actions/productActions";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

// Disable caching for dynamic product detail queries
export const revalidate = 0;

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    return (
      <div className="text-center py-20 glassmorphism rounded-3xl border border-white/5 max-w-lg mx-auto flex flex-col items-center justify-center gap-6">
        <AlertCircle className="w-16 h-16 text-teal-400" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">পণ্যটি পাওয়া যায়নি!</h2>
          <p className="text-gray-400">
            দুঃখিত, আপনি যে পণ্যটি খুঁজছেন তা সিস্টেমে পাওয়া যায়নি অথবা মুছে ফেলা হয়েছে।
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 text-ocean-950 font-bold hover:bg-teal-400 transition-all glow-teal"
        >
          <ArrowLeft className="w-4 h-4" /> বাজারে ফিরে যান
        </Link>
      </div>
    );
  }

  // Cast product to match ProductDetails expected types
  const typedProduct = product as any;

  return <ProductDetails product={typedProduct} />;
}
