
"use client";
import { UserHeader } from "@/components/user-header";
import type { ReactNode } from "react";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CartProvider } from "@/context/cart-context";
import { CartSheet } from "@/components/cart-sheet";

export default function UserLayout({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "customer")) {
      router.push("/");
    }
  }, [user, profile, loading, router]);

  if (loading || !user || profile?.role !== "customer") {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="flex min-h-screen w-full flex-col">
        <UserHeader />
        <main className="flex flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
          {children}
        </main>
        <CartSheet />
      </div>
    </CartProvider>
  );
}
