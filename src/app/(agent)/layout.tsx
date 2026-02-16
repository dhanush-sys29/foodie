
"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/firebase";
import { getAuth, signOut } from "firebase/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const pathname = usePathname();
    const isActive = pathname.startsWith(href);
    return (
        <Link
            href={href}
            className={cn(
                "transition-colors hover:text-foreground",
                isActive ? "text-foreground" : "text-muted-foreground"
            )}
        >
            {children}
        </Link>
    );
};


function AgentLayoutSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
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
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className="ml-auto flex-1 sm:flex-initial" />
            <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </header>
      <main className="flex-1 bg-muted/40" />
    </div>
  );
}


export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "delivery")) {
      router.push("/");
    }
  }, [user, profile, loading, router]);

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      router.push("/");
    });
  };

  if (loading || !user || profile?.role !== "delivery") {
    return <AgentLayoutSkeleton />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/deliveries"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Logo />
          </Link>
          <NavLink href="/deliveries">My Deliveries</NavLink>
          <NavLink href="/earnings">Earnings</NavLink>
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className="ml-auto flex-1 sm:flex-initial" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage data-ai-hint="person portrait" src={user.photoURL || "https://picsum.photos/seed/agent/100/100"} />
                  <AvatarFallback>{profile?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/agent-profile')}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/earnings')}>Earnings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 bg-muted/40">
        {children}
      </main>
    </div>
  );
}
