"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
// import { authOptions } from "../api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";

async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

// Fetch all registered users
export async function getUsers() {
  try {
    const session = await getAdminSession();
    if (!session) return { error: "অননুমোদিত প্রবেশাধিকার" };

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { users };
  } catch (error) {
    console.error("Get users error:", error);
    return { error: "ইউজারদের তথ্য সংগ্রহ করতে ব্যর্থ হয়েছে" };
  }
}

// Update a user's role
export async function updateUserRole(targetUserId: string, newRole: Role) {
  try {
    const session = await getAdminSession();
    if (!session) return { error: "অননুমোদিত প্রবেশাধিকার" };

    // Prevent changing own role
    if (session.user.id === targetUserId) {
      return { error: "আপনি নিজের রোল নিজে পরিবর্তন করতে পারবেন না" };
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: { id: true, name: true, role: true },
    });

    revalidatePath("/admin");
    return { success: "ইউজারের রোল সফলভাবে পরিবর্তন করা হয়েছে!", user: updatedUser };
  } catch (error) {
    console.error("Update user role error:", error);
    return { error: "ইউজারের রোল আপডেট করতে ব্যর্থ হয়েছে" };
  }
}

// Delete user account
export async function deleteUser(targetUserId: string) {
  try {
    const session = await getAdminSession();
    if (!session) return { error: "অননুমোদিত প্রবেশাধিকার" };

    // Prevent deleting own account
    if (session.user.id === targetUserId) {
      return { error: "আপনি নিজের অ্যাকাউন্ট নিজে ডিলিট করতে পারবেন না" };
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    revalidatePath("/admin");
    return { success: "ইউজার অ্যাকাউন্ট সফলভাবে ডিলিট করা হয়েছে!" };
  } catch (error) {
    console.error("Delete user error:", error);
    return { error: "ইউজার অ্যাকাউন্ট ডিলিট করতে ব্যর্থ হয়েছে" };
  }
}
