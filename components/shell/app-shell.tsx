"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { clearClientUser, saveClientUser } from "@/lib/auth";
import { clientApi } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

const businessNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/appointments", label: "Appointments", icon: BriefcaseBusiness },
  { href: "/business", label: "Business Profile", icon: Building2 },
  { href: "/services", label: "Services", icon: Settings },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings }
];

const adminNav = [
  { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
  { href: "/admin/businesses", label: "Businesses", icon: Building2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/appointments", label: "Appointments", icon: BriefcaseBusiness },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user);
  const [open, setOpen] = useState(false);
  const nav = currentUser.role === "admin" ? adminNav : businessNav;
  const title = useMemo(() => nav.find((item) => item.href === pathname)?.label ?? "Appointly", [nav, pathname]);

  useEffect(() => {
    let cancelled = false;

    async function refreshUser() {
      try {
        const { data } = await clientApi.get<{ user: User }>("/me");
        if (cancelled) return;
        setCurrentUser(data.user);
        saveClientUser(data.user);
      } catch {
        return;
      }
    }

    refreshUser();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function logout() {
    await clientApi.post("/auth/logout").catch(() => null);
    clearClientUser();
    toast.success("Signed out");
    router.push("/login");
  }

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center justify-between border-b px-4">
        <Link href={currentUser.role === "admin" ? "/admin" : "/dashboard"} className="text-base font-semibold">
          Appointly
        </Link>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                active && "bg-accent text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <div className="rounded-md bg-muted p-3 text-sm">
          <div className="font-medium">{currentUser.name}</div>
          <div className="truncate text-xs text-muted-foreground">{currentUser.email}</div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
      {open ? <div className="fixed inset-0 z-50 bg-slate-950/30 lg:hidden"><div className="h-full max-w-72">{sidebar}</div></div> : null}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-base font-semibold">{title}</h1>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </header>
        <main className="mx-auto max-w-7xl p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
