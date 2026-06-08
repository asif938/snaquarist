"use server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
// import { authOptions } from "../api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  return session && session.user.role === "ADMIN";
}

// Category Actions
export async function createCategory(name: string) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return { error: "অননুমোদিত প্রবেশাধিকার" };

    if (!name.trim()) return { error: "ক্যাটাগরি নাম খালি হতে পারে না" };

    // Generate slug supporting Bengali Unicode characters
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      return { error: "এই ক্যাটাগরিটি ইতিমধ্যে তৈরি করা আছে" };
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), slug },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: "ক্যাটাগরি সফলভাবে তৈরি হয়েছে!", category };
  } catch (error) {
    console.error("Create category error:", error);
    return { error: "ক্যাটাগরি তৈরি করতে সমস্যা হয়েছে" };
  }
}

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return [];
  }
}

export async function updateCategory(id: string, name: string) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return { error: "অননুমোদিত প্রবেশাধিকার" };

    if (!name.trim()) return { error: "ক্যাটাগরি নাম খালি হতে পারে না" };

    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await prisma.category.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });

    if (existing) {
      return { error: "এই নামের আরেকটি ক্যাটাগরি ইতিমধ্যে রয়েছে" };
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name: name.trim(), slug },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: "ক্যাটাগরি সফলভাবে আপডেট হয়েছে!", category };
  } catch (error) {
    console.error("Update category error:", error);
    return { error: "ক্যাটাগরি আপডেট করতে সমস্যা হয়েছে" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return { error: "অননুমোদিত প্রবেশাধিকার" };

    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return { error: "এই ক্যাটাগরিতে পণ্য রয়েছে, প্রথমে পণ্যগুলো ডিলিট করুন" };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: "ক্যাটাগরি সফলভাবে ডিলিট করা হয়েছে!" };
  } catch (error) {
    console.error("Delete category error:", error);
    return { error: "ক্যাটাগরি ডিলিট করতে সমস্যা হয়েছে" };
  }
}

// Product Actions
export async function createProduct(formData: FormData) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return { error: "অননুমোদিত প্রবেশাধিকার" };

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const categoryId = formData.get("categoryId") as string;

    // Images will be passed as JSON string
    const imagesJson = formData.get("images") as string;
    const images: string[] = imagesJson ? JSON.parse(imagesJson) : [];

    const youtubeUrlsJson = formData.get("youtubeUrls") as string;
    const youtubeUrls: string[] = youtubeUrlsJson ? JSON.parse(youtubeUrlsJson) : [];

    if (!name || !description || isNaN(price) || isNaN(stock) || !categoryId) {
      return { error: "অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন" };
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        youtubeUrls,
        images,
      },
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    return { success: "পণ্যটি সফলভাবে যোগ করা হয়েছে!", product };
  } catch (error) {
    console.error("Create product error:", error);
    return { error: "পণ্য যোগ করতে সমস্যা হয়েছে, পুনরায় চেষ্টা করুন" };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return { error: "অননুমোদিত প্রবেশাধিকার" };

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const categoryId = formData.get("categoryId") as string;

    const imagesJson = formData.get("images") as string;
    const images: string[] = imagesJson ? JSON.parse(imagesJson) : [];

    const youtubeUrlsJson = formData.get("youtubeUrls") as string;
    const youtubeUrls: string[] = youtubeUrlsJson ? JSON.parse(youtubeUrlsJson) : [];

    if (!name || !description || isNaN(price) || isNaN(stock) || !categoryId) {
      return { error: "অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন" };
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        youtubeUrls,
        images,
      },
    });

    revalidatePath("/");
    revalidatePath(`/products/${id}`);
    revalidatePath("/admin");
    return { success: "পণ্য আপডেট সফল হয়েছে!", product };
  } catch (error) {
    console.error("Update product error:", error);
    return { error: "পণ্য আপডেট করতে সমস্যা হয়েছে, পুনরায় চেষ্টা করুন" };
  }
}

export async function deleteProduct(id: string) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return { error: "অননুমোদিত প্রবেশাধিকার" };

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin");
    return { success: "পণ্যটি সফলভাবে ডিলিট করা হয়েছে!" };
  } catch (error) {
    console.error("Delete product error:", error);
    return { error: "পণ্য ডিলিট করতে সমস্যা হয়েছে" };
  }
}

export async function getProducts(categoryId?: string, search?: string) {
  try {
    const whereClause: any = {};

    if (categoryId && categoryId !== "all") {
      whereClause.categoryId = categoryId;
    }

    if (search && search.trim() !== "") {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    return await prisma.product.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return [];
  }
}

export async function getProductById(id: string) {
  try {
    return await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  } catch (error) {
    console.error("Get product by ID error:", error);
    return null;
  }
}
