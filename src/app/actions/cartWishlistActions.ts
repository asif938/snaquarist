"use server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
// import { authOptions } from "../api/auth/[...nextauth]/route";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id;
}

export async function getDBCartAndWishlist() {
  const userId = await getUserId();
  if (!userId) return { cart: [], wishlist: [] };

  const cart = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  });

  const wishlist = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: true },
  });

  return {
    cart: cart.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    })),
    wishlist: wishlist.map((item) => item.product),
  };
}

export async function syncLocalWithDB(
  localCart: { productId: string; quantity: number }[],
  localWishlist: string[]
) {
  const userId = await getUserId();
  if (!userId) return null;

  // Merge Cart Items
  for (const item of localCart) {
    const prod = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!prod) continue;

    await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId,
          productId: item.productId,
        },
      },
      update: {
        quantity: { increment: item.quantity },
      },
      create: {
        userId,
        productId: item.productId,
        quantity: item.quantity,
      },
    });
  }

  // Merge Wishlist Items
  for (const productId of localWishlist) {
    const prod = await prisma.product.findUnique({ where: { id: productId } });
    if (!prod) continue;

    const exists = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
    if (!exists) {
      await prisma.wishlistItem.create({
        data: { userId, productId },
      });
    }
  }

  return getDBCartAndWishlist();
}

export async function addToDBCart(productId: string, quantity: number) {
  const userId = await getUserId();
  if (!userId) return false;

  const prod = await prisma.product.findUnique({ where: { id: productId } });
  if (!prod) return false;

  await prisma.cartItem.upsert({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      userId,
      productId,
      quantity,
    },
  });
  return true;
}

export async function updateDBCartQuantity(productId: string, quantity: number) {
  const userId = await getUserId();
  if (!userId) return false;

  if (quantity <= 0) {
    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  } else {
    await prisma.cartItem.update({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      data: { quantity },
    });
  }
  return true;
}

export async function removeFromDBCart(productId: string) {
  const userId = await getUserId();
  if (!userId) return false;

  await prisma.cartItem.delete({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });
  return true;
}

export async function clearDBCart() {
  const userId = await getUserId();
  if (!userId) return false;

  await prisma.cartItem.deleteMany({
    where: { userId },
  });
  return true;
}

export async function toggleDBWishlist(productId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, added: false };

  const prod = await prisma.product.findUnique({ where: { id: productId } });
  if (!prod) return { success: false, added: false };

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existing) {
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
    return { success: true, added: false };
  } else {
    await prisma.wishlistItem.create({
      data: {
        userId,
        productId,
      },
    });
    return { success: true, added: true };
  }
}
