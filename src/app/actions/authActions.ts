"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    if (!name || !email || !password) {
      return { error: "নাম, ইমেইল এবং পাসওয়ার্ড আবশ্যক" };
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        address: address || null,
        role: "CUSTOMER", // Default role is customer
      },
    });

    return { success: "অ্যাকাউন্ট তৈরি সফল হয়েছে! দয়া করে লগইন করুন।" };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: "অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে, দয়া করে আবার চেষ্টা করুন।" };
  }
}
