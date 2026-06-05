import { redirect } from "next/navigation";
import { Building2, CalendarCheck, CreditCard, Users } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getAdminStats, getBusinesses, getServerUser } from "@/lib/api";

export default async function AdminPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  const stats = await getAdminStats();
  const businesses = await getBusinesses(
    new URLSearchParams({ limit: "5", offset: "0" }),
  ).catch(() => null);

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
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent businesses</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable headers={["Business", "Plan", "Status", "Created"]}>
                {(businesses?.data ?? []).map((business) => (
                  <tr key={business._id}>
                    <td className="px-4 py-3 font-medium">{business.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={business.subscription?.plan ?? "free"} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        value={
                          business.status ??
                          business.subscription?.status ??
                          "active"
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      {business.createdAt
                        ? new Date(business.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </DataTable>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
