"use client";

import React, { useState } from "react";
import { Category, Product, Order, OrderItem, Role } from "@prisma/client";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/app/actions/productActions";
import { updateOrderStatus, updatePaymentStatus } from "@/app/actions/orderActions";
import { updateUserRole, deleteUser } from "@/app/actions/userActions";
import Swal from "sweetalert2";
import { useApp } from "@/context/AppContext";
import {
  Settings,
  ShoppingBag,
  ListPlus,
  PlusCircle,
  Trash2,
  Upload,
  AlertTriangle,
  CheckCircle,
  FileVideo,
  Package,
  Layers,
  MapPin,
  Calendar,
  Pencil,
  Users,
  X,
  Check,
  UserCheck,
  UserX,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface AdminPanelProps {
  initialCategories: Category[];
  initialProducts: (Product & { category: Category })[];
  initialOrders: (Order & { items: (OrderItem & { product: Product })[] })[];
  initialUsers: any[];
}

export default function AdminPanel({
  initialCategories,
  initialProducts,
  initialOrders,
  initialUsers,
}: AdminPanelProps) {
  const { data: session } = useSession();
  const { theme } = useApp();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<(Product & { category: Category })[]>(
    initialProducts
  );
  const [orders, setOrders] = useState(initialOrders);
  const [users, setUsers] = useState<any[]>(initialUsers);

  const [activeTab, setActiveTab] = useState<"orders" | "products" | "categories" | "users">("orders");

  // Status Alerts
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Category States
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

  // Product Form States
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productCatId, setProductCatId] = useState("");
  const [productYoutubeUrls, setProductYoutubeUrls] = useState<string[]>([]);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const clearAlerts = () => {
    setSuccessMsg("");
    setErrorMsg("");
  };

  // 1. Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!categoryName.trim()) return;

    setActionLoading(true);
    const res = await createCategory(categoryName);
    setActionLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.category) {
      setSuccessMsg(res.success || "ক্যাটাগরি তৈরি সফল হয়েছে!");
      setCategories((prev) => [...prev, res.category!].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryName("");
    }
  };

  // 2. Start Edit Category
  const handleStartEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.name);
  };

  // 3. Update Category
  const handleUpdateCategory = async (id: string) => {
    clearAlerts();
    if (!editingCategoryName.trim()) return;

    setActionLoading(true);
    const res = await updateCategory(id, editingCategoryName);
    setActionLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.category) {
      setSuccessMsg(res.success || "ক্যাটাগরি আপডেট সফল হয়েছে!");
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? res.category! : c)).sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingCategoryId(null);
    }
  };

  // 4. Delete Category
  const handleDeleteCategory = async (id: string) => {
    clearAlerts();
    Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "আপনি কি নিশ্চিতভাবে এই ক্যাটাগরিটি ডিলিট করতে চান?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F36D16",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "হ্যাঁ, ডিলিট করুন!",
      cancelButtonText: "বাতিল করুন",
      background: theme === "dark" ? "#0a1128" : "#FDF5E6",
      color: theme === "dark" ? "#f3f4f6" : "#004D40",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setActionLoading(true);
        const res = await deleteCategory(id);
        setActionLoading(false);

        if (res.error) {
          setErrorMsg(res.error);
          Swal.fire({
            title: "ত্রুটি!",
            text: res.error,
            icon: "error",
            confirmButtonColor: "#F36D16",
            background: theme === "dark" ? "#0a1128" : "#FDF5E6",
            color: theme === "dark" ? "#f3f4f6" : "#004D40",
          });
        } else {
          setSuccessMsg(res.success || "ক্যাটাগরি ডিলিট সফল হয়েছে!");
          setCategories((prev) => prev.filter((c) => c.id !== id));
          Swal.fire({
            title: "ডিলিট সম্পন্ন!",
            text: "ক্যাটাগরি সফলভাবে ডিলিট করা হয়েছে।",
            icon: "success",
            confirmButtonColor: "#F36D16",
            background: theme === "dark" ? "#0a1128" : "#FDF5E6",
            color: theme === "dark" ? "#f3f4f6" : "#004D40",
          });
        }
      }
    });
  };

  // 5. Upload Images to Cloudinary via local API Route
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    clearAlerts();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.url) {
          uploadedUrls.push(data.url);
        } else {
          setErrorMsg(data.error || "একটি ইমেজ আপলোডে ত্রুটি হয়েছে।");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("ইমেজ সার্ভার আপলোড ব্যর্থ হয়েছে।");
      }
    }

    setProductImages((prev) => [...prev, ...uploadedUrls]);
    setUploadingImages(false);
  };

  // 6. Create or Update Product
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();

    if (!productName || !productDesc || !productPrice || !productStock || !productCatId) {
      setErrorMsg("অনুগ্রহ করে সব প্রয়োজনীয় ঘর পূরণ করুন।");
      return;
    }

    setActionLoading(true);
    const formData = new FormData();
    formData.append("name", productName.trim());
    formData.append("description", productDesc.trim());
    formData.append("price", productPrice);
    formData.append("stock", productStock);
    formData.append("categoryId", productCatId);
    formData.append("youtubeUrls", JSON.stringify(productYoutubeUrls.filter(u => u.trim() !== "")));
    formData.append("images", JSON.stringify(productImages));

    let res;
    if (editingProductId) {
      res = await updateProduct(editingProductId, formData);
    } else {
      res = await createProduct(formData);
    }
    setActionLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.product) {
      const selectedCat = categories.find((c) => c.id === productCatId);
      const formattedProd = {
        ...res.product,
        category: selectedCat || { id: productCatId, name: "", slug: "", createdAt: new Date(), updatedAt: new Date() },
      };

      if (editingProductId) {
        setSuccessMsg(res.success || "পণ্য সফলভাবে আপডেট হয়েছে!");
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProductId ? formattedProd : p))
        );
        setEditingProductId(null);
      } else {
        setSuccessMsg(res.success || "পণ্য যোগ করা সফল হয়েছে!");
        setProducts((prev) => [formattedProd, ...prev]);
      }

      // Reset Form
      setProductName("");
      setProductDesc("");
      setProductPrice("");
      setProductStock("");
      setProductCatId("");
      setProductYoutubeUrls([]);
      setProductImages([]);
    }
  };

  // 7. Start Edit Product
  const handleStartEditProduct = (prod: Product & { category: Category }) => {
    setEditingProductId(prod.id);
    setProductName(prod.name);
    setProductDesc(prod.description);
    setProductPrice(prod.price.toString());
    setProductStock(prod.stock.toString());
    setProductCatId(prod.categoryId);
    setProductYoutubeUrls((prod as any).youtubeUrls || []);
    setProductImages(prod.images);
    setActiveTab("products"); // Switch to forms tab automatically
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 8. Cancel Edit Product
  const handleCancelEditProduct = () => {
    setEditingProductId(null);
    setProductName("");
    setProductDesc("");
    setProductPrice("");
    setProductStock("");
    setProductCatId("");
    setProductYoutubeUrls([]);
    setProductImages([]);
  };

  // 9. Delete Product
  const handleDeleteProduct = async (id: string) => {
    clearAlerts();
    Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "আপনি কি নিশ্চিতভাবে এই পণ্যটি ডিলিট করতে চান?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F36D16",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "হ্যাঁ, ডিলিট করুন!",
      cancelButtonText: "বাতিল করুন",
      background: theme === "dark" ? "#0a1128" : "#FDF5E6",
      color: theme === "dark" ? "#f3f4f6" : "#004D40",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setActionLoading(true);
        const res = await deleteProduct(id);
        setActionLoading(false);

        if (res.error) {
          setErrorMsg(res.error);
          Swal.fire({
            title: "ত্রুটি!",
            text: res.error,
            icon: "error",
            confirmButtonColor: "#F36D16",
            background: theme === "dark" ? "#0a1128" : "#FDF5E6",
            color: theme === "dark" ? "#f3f4f6" : "#004D40",
          });
        } else {
          setSuccessMsg(res.success || "পণ্য ডিলিট সফল হয়েছে!");
          setProducts((prev) => prev.filter((p) => p.id !== id));
          if (editingProductId === id) {
            handleCancelEditProduct();
          }
          Swal.fire({
            title: "ডিলিট সম্পন্ন!",
            text: "পণ্যটি সফলভাবে ডিলিট করা হয়েছে।",
            icon: "success",
            confirmButtonColor: "#F36D16",
            background: theme === "dark" ? "#0a1128" : "#FDF5E6",
            color: theme === "dark" ? "#f3f4f6" : "#004D40",
          });
        }
      }
    });
  };

  // 10. Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: any) => {
    clearAlerts();
    setActionLoading(true);
    const res = await updateOrderStatus(orderId, status);
    setActionLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.order) {
      setSuccessMsg(res.success || "অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: res.order!.orderStatus } : o))
      );
    }
  };

  // 11. Update Payment Status
  const handleUpdatePaymentStatus = async (orderId: string, status: any) => {
    clearAlerts();
    setActionLoading(true);
    const res = await updatePaymentStatus(orderId, status);
    setActionLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.order) {
      setSuccessMsg(res.success || "পেমেন্ট স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: res.order!.paymentStatus } : o))
      );
    }
  };

  // 12. Update User Role
  const handleUpdateUserRole = async (targetUserId: string, newRole: Role) => {
    clearAlerts();
    setActionLoading(true);
    const res = await updateUserRole(targetUserId, newRole);
    setActionLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.user) {
      setSuccessMsg(res.success || "ইউজারের রোল সফলভাবে আপডেট করা হয়েছে।");
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
      );
    }
  };

  // 13. Delete User
  const handleDeleteUser = async (targetUserId: string) => {
    clearAlerts();
    Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "আপনি কি নিশ্চিতভাবে এই ইউজার অ্যাকাউন্টটি ডিলিট করতে চান?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F36D16",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "হ্যাঁ, ডিলিট করুন!",
      cancelButtonText: "বাতিল করুন",
      background: theme === "dark" ? "#0a1128" : "#FDF5E6",
      color: theme === "dark" ? "#f3f4f6" : "#004D40",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setActionLoading(true);
        const res = await deleteUser(targetUserId);
        setActionLoading(false);

        if (res.error) {
          setErrorMsg(res.error);
          Swal.fire({
            title: "ত্রুটি!",
            text: res.error,
            icon: "error",
            confirmButtonColor: "#F36D16",
            background: theme === "dark" ? "#0a1128" : "#FDF5E6",
            color: theme === "dark" ? "#f3f4f6" : "#004D40",
          });
        } else {
          setSuccessMsg(res.success || "ইউজার ডিলিট সফল হয়েছে!");
          setUsers((prev) => prev.filter((u) => u.id !== targetUserId));
          Swal.fire({
            title: "ডিলিট সম্পন্ন!",
            text: "ইউজার অ্যাকাউন্টটি সফলভাবে ডিলিট করা হয়েছে।",
            icon: "success",
            confirmButtonColor: "#F36D16",
            background: theme === "dark" ? "#0a1128" : "#FDF5E6",
            color: theme === "dark" ? "#f3f4f6" : "#004D40",
          });
        }
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <h1 className="text-3xl font-extrabold text-white flex items-center gap-2.5 border-b border-white/5 pb-4">
        <Settings className="w-8 h-8 text-teal-400" />
        <span>অ্যাডমিন ড্যাশবোর্ড</span>
      </h1>

      {/* Tabs Switcher */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => {
            setActiveTab("orders");
            clearAlerts();
          }}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm cursor-pointer transition-all duration-300 whitespace-nowrap ${
            activeTab === "orders"
              ? "border-teal-500 text-teal-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>অর্ডার সমূহ ({orders.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("products");
            clearAlerts();
          }}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm cursor-pointer transition-all duration-300 whitespace-nowrap ${
            activeTab === "products"
              ? "border-teal-500 text-teal-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>পণ্য আপলোড ও সম্পাদন ({products.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("categories");
            clearAlerts();
          }}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm cursor-pointer transition-all duration-300 whitespace-nowrap ${
            activeTab === "categories"
              ? "border-teal-500 text-teal-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ক্যাটাগরি তৈরি ও এডিট ({categories.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("users");
            clearAlerts();
          }}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm cursor-pointer transition-all duration-300 whitespace-nowrap ${
            activeTab === "users"
              ? "border-teal-500 text-teal-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ইউজার ম্যানেজমেন্ট ({users.length})</span>
        </button>
      </div>

      {/* Alerts */}
      {(successMsg || errorMsg) && (
        <div className="max-w-2xl">
          {successMsg && (
            <div className="p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: Orders Control Pane */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-16 glassmorphism rounded-3xl border border-white/5 text-gray-400">
              কোনো কাস্টমার অর্ডার এখনো সিস্টেমে পাওয়া যায়নি।
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="glassmorphism rounded-2xl p-6 border border-white/5 space-y-4"
                >
                  {/* Order header information */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/5 pb-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">
                        অর্ডার আইডি: <span className="font-mono text-teal-400 font-bold">{order.id}</span>
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>তারিখ: {new Date(order.createdAt).toLocaleString("bn-BD")}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {/* Update Order Status Dropdown */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-gray-400">অর্ডার স্ট্যাটাস:</span>
                        <select
                          disabled={actionLoading}
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-ocean-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none cursor-pointer focus:border-teal-500/50"
                        >
                          <option value="PENDING">পেন্ডিং</option>
                          <option value="PROCESSING">প্রসেসিং</option>
                          <option value="DELIVERED">ডেলিভার্ড</option>
                          <option value="CANCELLED">বাতিল</option>
                        </select>
                      </div>

                      {/* Update Payment Status Dropdown */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-gray-400">পেমেন্ট স্ট্যাটাস:</span>
                        <select
                          disabled={actionLoading}
                          value={order.paymentStatus}
                          onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value)}
                          className="bg-ocean-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none cursor-pointer focus:border-teal-500/50"
                        >
                          <option value="PENDING">পেন্ডিং</option>
                          <option value="PAID">পরিশোধিত</option>
                          <option value="REFUNDED">রিফান্ড</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Customer details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs bg-ocean-950/30 p-4 rounded-xl border border-white/5">
                    <div className="space-y-1">
                      <p className="text-gray-400 uppercase font-semibold">গ্রাহক তথ্য</p>
                      <p className="text-white font-bold">{order.customerName}</p>
                      <p className="text-gray-300">ফোন: {order.customerPhone}</p>
                      {order.customerEmail && <p className="text-gray-400">ইমেইল: {order.customerEmail}</p>}
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 uppercase font-semibold">বিকাশ পেমেন্ট তথ্য</p>
                      <p className="text-teal-400 font-bold">
                        TrxID: <span className="font-mono uppercase">{order.transactionId}</span>
                      </p>
                      <p className="text-gray-300">প্রেরক বিকাশ নম্বর: {order.senderPhone || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 uppercase font-semibold flex items-center gap-0.5">
                        <MapPin className="w-3.5 h-3.5" /> শিপিং ঠিকানা
                      </p>
                      <p className="text-gray-200">{order.customerAddress}</p>
                    </div>
                  </div>

                  {/* Products purchased summary */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase">অর্ডারকৃত পণ্যসমূহ</p>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-300 font-medium">
                            {item.product.name}{" "}
                            <span className="text-gray-500 text-xs">
                              × {item.quantity.toLocaleString("bn-BD")}
                            </span>
                          </span>
                          <span className="text-gray-400">
                            ৳ {(item.price * item.quantity).toLocaleString("bn-BD")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end text-sm border-t border-white/5 pt-3">
                    <span className="text-gray-400">মোট পরিশোধ পরিমাণ: </span>
                    <span className="font-extrabold text-teal-400 ml-1.5">
                      ৳ {order.totalAmount.toLocaleString("bn-BD")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Product Upload and Update */}
      {activeTab === "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upload/Edit Product Form */}
          <form onSubmit={handleProductSubmit} className="lg:col-span-5 space-y-5">
            <div className="glassmorphism rounded-3xl p-6 border border-white/5 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <PlusCircle className="w-5 h-5 text-teal-400" />
                <span>{editingProductId ? "পণ্য সম্পাদনা করুন" : "নতুন পণ্য যোগ করুন"}</span>
              </h3>

              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">পণ্যের নাম *</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="যেমন: রেড ক্যাপ গোল্ডফিশ"
                  className="w-full px-4 py-2.5 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 text-sm"
                />
              </div>

              {/* Category selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">ক্যাটাগরি নির্বাচন *</label>
                <select
                  required
                  value={productCatId}
                  onChange={(e) => setProductCatId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-300 text-sm cursor-pointer"
                >
                  <option value="">নির্বাচন করুন</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">মূল্য (টাকা) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="৳ ৪৫০"
                    className="w-full px-4 py-2.5 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">স্টক পরিমাণ *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                    placeholder="২০"
                    className="w-full px-4 py-2.5 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">পণ্যের বিবরণ *</label>
                <textarea
                  required
                  rows={4}
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  placeholder="মাছ বা পণ্যের বিস্তারিত লিখুন..."
                  className="w-full px-4 py-2.5 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 text-sm resize-none"
                />
              </div>

              {/* YouTube Links */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <FileVideo className="w-3.5 h-3.5 text-red-500" /> ইউটিউব ভিডিও লিংকসমূহ (ঐচ্ছিক)
                  </label>
                  <button
                    type="button"
                    onClick={() => setProductYoutubeUrls([...productYoutubeUrls, ""])}
                    className="text-xs text-teal-400 hover:text-teal-300 font-bold cursor-pointer"
                  >
                    + আরও লিংক যোগ করুন
                  </button>
                </div>
                {productYoutubeUrls.map((url, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...productYoutubeUrls];
                        newUrls[idx] = e.target.value;
                        setProductYoutubeUrls(newUrls);
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 px-4 py-2.5 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setProductYoutubeUrls(productYoutubeUrls.filter((_, i) => i !== idx))}
                      className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {productYoutubeUrls.length === 0 && (
                  <button
                    type="button"
                    onClick={() => setProductYoutubeUrls([""])}
                    className="w-full py-2.5 border border-dashed border-white/10 rounded-xl text-xs text-gray-400 hover:text-gray-300 hover:border-teal-500/30 transition-colors cursor-pointer"
                  >
                    ভিডিও লিংক যোগ করতে ক্লিক করুন
                  </button>
                )}
              </div>

              {/* Cloudinary Image Picker */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">পণ্যের ছবি আপলোড</label>
                <div className="relative border-2 border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-teal-500/30 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={uploadingImages}
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-400 text-center">
                    {uploadingImages ? "আপলোড হচ্ছে..." : "কম্পিউটার থেকে ছবি সিলেক্ট করুন"}
                  </span>
                </div>

                {/* Uploaded thumbnails */}
                {productImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {productImages.map((img, i) => (
                      <div
                        key={i}
                        className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/5"
                      >
                        <Image src={img} alt="Uploaded thumbnail" fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setProductImages(productImages.filter((_, idx) => idx !== i))}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] text-white cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {editingProductId && (
                  <button
                    type="button"
                    onClick={handleCancelEditProduct}
                    className="flex-1 py-3 rounded-xl text-sm font-bold border border-white/10 hover:bg-white/5 transition-all duration-300 text-gray-300 cursor-pointer text-center"
                  >
                    বাতিল করুন
                  </button>
                )}

                <button
                  type="submit"
                  disabled={actionLoading || uploadingImages}
                  className={`py-3 rounded-xl text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer text-white ${
                    editingProductId ? "flex-1" : "w-full"
                  } ${
                    actionLoading || uploadingImages
                      ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
                      : "bg-teal-500 hover:bg-teal-400 glow-teal"
                  }`}
                >
                  {editingProductId ? "হালনাগাদ করুন" : "পণ্য আপলোড নিশ্চিত করুন"}
                </button>
              </div>
            </div>
          </form>

          {/* Product list catalog */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glassmorphism rounded-3xl p-6 border border-white/5 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <Package className="w-5 h-5 text-teal-400" /> পণ্য তালিকা ও সম্পাদন
              </h3>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {products.length === 0 ? (
                  <p className="text-gray-400 text-center py-10">কোনো পণ্য এখনো যোগ করা হয়নি।</p>
                ) : (
                  products.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 p-3 bg-ocean-950/40 rounded-xl border border-white/5 justify-between text-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 bg-ocean-950 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {p.images && p.images[0] ? (
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                          ) : (
                            <span className="text-2xl">🐠</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">
                            মূল্য: ৳ {p.price.toLocaleString("bn-BD")} | স্টক: {p.stock.toLocaleString("bn-BD")} টি
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEditProduct(p)}
                          className="p-2.5 text-gray-400 hover:text-teal-400 transition-colors cursor-pointer"
                          title="সম্পাদন করুন"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          disabled={actionLoading}
                          className="p-2.5 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="ডিলিট করুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Category Forms (Add & Edit) */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add Category Form */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleCreateCategory} className="glassmorphism rounded-3xl p-6 border border-white/5 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-2">
                <ListPlus className="w-5 h-5 text-teal-400" /> নতুন ক্যাটাগরি তৈরি করুন
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400">ক্যাটাগরি নাম *</label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="যেমন: লাইভ ফিশ, অ্যাকোয়ারিয়াম ফিল্টার"
                  className="w-full px-4 py-2.5 bg-ocean-950/80 border border-white/10 rounded-xl focus:border-teal-500/50 outline-none text-gray-200 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading || !categoryName.trim()}
                className={`w-full py-3 rounded-xl text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer text-white ${
                  actionLoading || !categoryName.trim()
                    ? "bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed"
                    : "bg-teal-500 hover:bg-teal-400 glow-teal"
                }`}
              >
                ক্যাটাগরি তৈরি করুন
              </button>
            </form>
          </div>

          {/* List & Edit/Delete existing categories */}
          <div className="lg:col-span-7 space-y-4">
            <div className="glassmorphism rounded-3xl p-6 border border-white/5 space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-400" /> বিদ্যমান ক্যাটাগরি তালিকা ({categories.length})
              </h3>
              
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {categories.length === 0 ? (
                  <p className="text-gray-400 text-center py-10">কোনো ক্যাটাগরি পাওয়া যায়নি।</p>
                ) : (
                  categories.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3.5 bg-ocean-950/40 rounded-xl border border-white/5"
                    >
                      {editingCategoryId === c.id ? (
                        /* Inline Edit Input Form */
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="text"
                            required
                            value={editingCategoryName}
                            onChange={(e) => setEditingCategoryName(e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-ocean-950 border border-white/10 rounded-lg outline-none text-white text-sm"
                          />
                          <button
                            onClick={() => handleUpdateCategory(c.id)}
                            disabled={actionLoading || !editingCategoryName.trim()}
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg cursor-pointer"
                            title="সংরক্ষণ করুন"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingCategoryId(null)}
                            className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg cursor-pointer"
                            title="বাতিল"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        /* Standard View Row */
                        <>
                          <span className="font-bold text-white">{c.name}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEditCategory(c)}
                              className="p-2 text-gray-400 hover:text-teal-400 transition-colors cursor-pointer"
                              title="সম্পাদন করুন"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(c.id)}
                              disabled={actionLoading}
                              className="p-2 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                              title="ডিলিট করুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: User Management */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="glassmorphism rounded-3xl p-6 border border-white/5 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Users className="w-5 h-5 text-teal-400" /> ইউজার তালিকা ও অ্যাডমিন রোল ব্যবস্থাপনা
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm text-gray-300">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 font-bold text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">নাম ও ইমেইল</th>
                    <th className="py-3 px-4">মোবাইল</th>
                    <th className="py-3 px-4">শিপিং ঠিকানা</th>
                    <th className="py-3 px-4">রোল (অ্যাক্সেস)</th>
                    <th className="py-3 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u) => {
                    const isSelf = session?.user?.id === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-xs text-gray-500 break-all">{u.email}</p>
                          {isSelf && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] font-bold text-teal-400">
                              আপনার নিজের অ্যাকাউন্ট
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold">
                          {u.phone || <span className="text-gray-500 italic">নেই</span>}
                        </td>
                        <td className="py-4 px-4 text-xs max-w-[200px] truncate" title={u.address}>
                          {u.address || <span className="text-gray-500 italic">নেই</span>}
                        </td>
                        <td className="py-4 px-4">
                          <select
                            disabled={actionLoading || isSelf}
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.id, e.target.value as Role)}
                            className="bg-ocean-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white outline-none cursor-pointer focus:border-teal-500/50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="CUSTOMER">গ্রাহক (CUSTOMER)</option>
                            <option value="ADMIN">অ্যাডমিন (ADMIN)</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={actionLoading || isSelf}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                            title={isSelf ? "নিজের অ্যাকাউন্ট ডিলিট করা সম্ভব নয়" : "ইউজার ডিলিট করুন"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
