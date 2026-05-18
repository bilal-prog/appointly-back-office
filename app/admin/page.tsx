import { redirect } from "next/navigation";
import { BarChart3, Building2, CalendarCheck, CreditCard, Users } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getAdminStats, getServerUser } from "@/lib/api";

export default async function AdminPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  const stats = await getAdminStats();
  return (
    <AppShell user={user}>
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total businesses" value={stats.totalBusinesses} icon={Building2} />
          <StatCard title="Total users" value={stats.totalUsers} icon={Users} />
          <StatCard title="Appointments" value={stats.totalAppointments} icon={CalendarCheck} />
          <StatCard title="Active subscriptions" value={stats.activeSubscriptions} icon={CreditCard} />
        </section>
        <section className="grid gap-4 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>Recent businesses</CardTitle></CardHeader><CardContent><DataTable headers={["Business", "Owner", "Plan"]}><tr><td className="px-4 py-3">Downtown Clinic</td><td className="px-4 py-3">Jane Doe</td><td className="px-4 py-3"><StatusBadge value="pro" /></td></tr></DataTable></CardContent></Card>
          <Card><CardHeader><CardTitle>Platform activity</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p>New business created</p><p>Checkout session completed</p><p>Appointment status changed</p></CardContent></Card>
          <Card className="lg:col-span-2"><CardHeader><CardTitle>Revenue placeholder</CardTitle></CardHeader><CardContent className="flex h-56 items-center justify-center gap-2 text-sm text-muted-foreground"><BarChart3 className="h-5 w-5" />Subscription analytics will render here when available.</CardContent></Card>
        </section>
      </div>
    </AppShell>
  );
}
