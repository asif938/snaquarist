"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
// import { authOptions } from "../api/auth/[...nextauth]/route";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id;
}

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  return session && session.user.role === "ADMIN";
}

interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  transactionId: string;
  senderPhone?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

// Place Order (Guest & Logged-In)
export async function createOrder(input: CreateOrderInput) {
  try {
    const userId = await getUserId();
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      transactionId,
      senderPhone,
      items,
    } = input;

    if (!customerName || !customerPhone || !customerAddress || !transactionId || items.length === 0) {
      return { error: "দয়া করে সকল প্রয়োজনীয় তথ্য প্রদান করুন" };
    }

    // Verify bKash transaction is unique in DB
    const txExists = await prisma.order.findFirst({
      where: { transactionId: transactionId.trim() },
    });

    if (txExists) {
      return { error: "এই ট্রানজেকশন আইডিটি ইতিমধ্যে সিস্টেমে ব্যবহৃত হয়েছে" };
    }

    // Calculate total pricing and verify stock
    let totalAmount = 0;
    const orderItemsData: { productId: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return { error: "কোনো একটি পণ্য সিস্টেমে পাওয়া যায়নি" };
      }

      if (product.stock < item.quantity) {
        return { error: `দুঃখিত, '${product.name}' পর্যাপ্ত পরিমাণে স্টকে নেই।` };
      }

      totalAmount += product.price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Create Order and OrderItems, and decrease stocks in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const newOrder = await tx.order.create({
        data: {
          userId: userId || null,
          customerName,
          customerPhone,
          customerEmail: customerEmail || null,
          customerAddress,
          transactionId: transactionId.trim(),
          senderPhone: senderPhone || null,
          totalAmount,
          items: {
            create: orderItemsData,
          },
        },
      });

      // 2. Adjust products stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: "অর্ডার সফলভাবে গ্রহণ করা হয়েছে!", orderId: order.id };
  } catch (error: any) {
    console.error("Create order error:", error);
    return { error: "অর্ডারটি সম্পন্ন করতে সমস্যা হয়েছে, পুনরায় চেষ্টা করুন।" };
  }
}

// Fetch Customer Orders
export async function getCustomerOrders() {
  try {
    const userId = await getUserId();
    if (!userId) return [];

    return await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Get customer orders error:", error);
    return [];
  }
}

// Admin Fetch All Orders
export async function getAdminOrders() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return [];

    return await prisma.order.findMany({
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Get admin orders error:", error);
    return [];
  }
}

// Admin Update Order Status
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return { error: "অননুমোদিত প্রবেশাধিকার" };

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status },
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: "অর্ডারের স্ট্যাটাস পরিবর্তন সফল হয়েছে!", order };
  } catch (error) {
    console.error("Update order status error:", error);
    return { error: "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে" };
  }
}

// Admin Update Payment Status
export async function updatePaymentStatus(orderId: string, status: PaymentStatus) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return { error: "অননুমোদিত প্রবেশাধিকার" };

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: status },
    });

    revalidatePath("/admin");
    revalidatePath("/dashboard");
    return { success: "পেমেন্ট স্ট্যাটাস পরিবর্তন সফল হয়েছে!", order };
  } catch (error) {
    console.error("Update payment status error:", error);
    return { error: "পেমেন্ট স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে" };
  }
}
