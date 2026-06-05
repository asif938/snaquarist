import React from "react";
import HomeContent from "@/components/HomeContent";
import { getProducts, getCategories } from "@/app/actions/productActions";

// Ensure page is revalidated dynamically
export const revalidate = 0;

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts("all", ""),
    getCategories(),
  ]);

  // Cast products correctly to match HomeContent expectation
  const typedProducts = products as any[];

  return <HomeContent initialProducts={typedProducts} categories={categories} />;
}
