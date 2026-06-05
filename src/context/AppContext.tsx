"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Product } from "@prisma/client";
import {
  getDBCartAndWishlist,
  syncLocalWithDB,
  addToDBCart,
  updateDBCartQuantity,
  removeFromDBCart,
  clearDBCart,
  toggleDBWishlist,
} from "@/app/actions/cartWishlistActions";

interface CartItemType {
  product: Product;
  quantity: number;
}

interface AppContextType {
  cart: CartItemType[];
  wishlist: Product[];
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setIsMounted(true);
    
    // Set initial theme
    const savedTheme = localStorage.getItem("sn_theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("sn_theme", next);
      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  // Sync state based on auth status
  useEffect(() => {
    if (!isMounted) return;

    const syncState = async () => {
      setLoading(true);
      if (status === "authenticated") {
        // Load local items first to sync
        const localCartStr = localStorage.getItem("sn_cart");
        const localWishlistStr = localStorage.getItem("sn_wishlist");

        const localCart: CartItemType[] = localCartStr ? JSON.parse(localCartStr) : [];
        const localWishlist: Product[] = localWishlistStr ? JSON.parse(localWishlistStr) : [];

        if (localCart.length > 0 || localWishlist.length > 0) {
          // Merge guest data with DB
          const cartPayload = localCart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          }));
          const wishlistPayload = localWishlist.map((item) => item.id);

          const merged = await syncLocalWithDB(cartPayload, wishlistPayload);
          if (merged) {
            setCart(merged.cart);
            setWishlist(merged.wishlist);
          }

          // Clear local storage since it's merged
          localStorage.removeItem("sn_cart");
          localStorage.removeItem("sn_wishlist");
        } else {
          // No local data, just load DB cart & wishlist
          const data = await getDBCartAndWishlist();
          setCart(data.cart);
          setWishlist(data.wishlist);
        }
      } else if (status === "unauthenticated") {
        // Guest mode: load from localStorage
        const localCart = localStorage.getItem("sn_cart");
        const localWishlist = localStorage.getItem("sn_wishlist");

        setCart(localCart ? JSON.parse(localCart) : []);
        setWishlist(localWishlist ? JSON.parse(localWishlist) : []);
      }
      setLoading(false);
    };

    syncState();
  }, [status, isMounted]);

  // Add to Cart
  const addToCart = async (product: Product, quantity: number = 1) => {
    if (status === "authenticated") {
      setCart((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product, quantity }];
      });
      await addToDBCart(product.id, quantity);
    } else {
      // Guest local storage update
      setCart((prev) => {
        let updated;
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          updated = prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updated = [...prev, { product, quantity }];
        }
        localStorage.setItem("sn_cart", JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Remove from Cart
  const removeFromCart = async (productId: string) => {
    if (status === "authenticated") {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      await removeFromDBCart(productId);
    } else {
      setCart((prev) => {
        const updated = prev.filter((item) => item.product.id !== productId);
        localStorage.setItem("sn_cart", JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Update Cart Quantity
  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (status === "authenticated") {
      setCart((prev) => {
        if (quantity <= 0) {
          return prev.filter((item) => item.product.id !== productId);
        }
        return prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        );
      });
      await updateDBCartQuantity(productId, quantity);
    } else {
      setCart((prev) => {
        let updated;
        if (quantity <= 0) {
          updated = prev.filter((item) => item.product.id !== productId);
        } else {
          updated = prev.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          );
        }
        localStorage.setItem("sn_cart", JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Clear Cart
  const clearCart = async () => {
    setCart([]);
    if (status === "authenticated") {
      await clearDBCart();
    } else {
      localStorage.removeItem("sn_cart");
    }
  };

  // Toggle Wishlist
  const toggleWishlist = async (product: Product) => {
    if (status === "authenticated") {
      setWishlist((prev) => {
        const exists = prev.some((item) => item.id === product.id);
        if (exists) {
          return prev.filter((item) => item.id !== product.id);
        } else {
          return [...prev, product];
        }
      });
      await toggleDBWishlist(product.id);
    } else {
      setWishlist((prev) => {
        let updated;
        const exists = prev.some((item) => item.id === product.id);
        if (exists) {
          updated = prev.filter((item) => item.id !== product.id);
        } else {
          updated = [...prev, product];
        }
        localStorage.setItem("sn_wishlist", JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Is in Wishlist
  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        wishlist,
        loading,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
