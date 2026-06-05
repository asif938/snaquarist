import React from "react";
import AdminPanel from "@/components/AdminPanel";
import { getCategories, getProducts } from "@/app/actions/productActions";
import { getAdminOrders } from "@/app/actions/orderActions";
import { getUsers } from "@/app/actions/userActions";

// Disable page cache for live administrator actions
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [categories, products, orders, usersData] = await Promise.all([
    getCategories(),
    getProducts("all", ""),
    getAdminOrders(),
    getUsers(),
  ]);

  // Cast arrays to match expected types of AdminPanel
  const typedProducts = products as any[];
  const typedOrders = orders as any[];
  const initialUsers = usersData.users || [];

  return (
    <AdminPanel
      initialCategories={categories}
      initialProducts={typedProducts}
      initialOrders={typedOrders}
      initialUsers={initialUsers}
    />
  );
}
