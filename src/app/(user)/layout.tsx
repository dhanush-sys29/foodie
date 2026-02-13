
"use client";
import { UserHeader } from "@/components/user-header";
import type { ReactNode } from "react";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CartProvider } from "@/context/cart-context";
import { CartSheet } from "@/components/cart-sheet";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Logo } from "@/components/logo";

function UserLayoutSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="#"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Logo />
          </Link>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </nav>
        <div className="md:hidden">
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <Skeleton className="h-10 w-full sm:w-[300px] md:w-[200px] lg:w-[300px]" />
          </form>
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10" />
    </div>
  );
}

export default function UserLayout({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "customer")) {
      router.push("/");
    }
  }, [user, profile, loading, router]);

  if (loading || !user || profile?.role !== "customer") {
    return <UserLayoutSkeleton />;
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
