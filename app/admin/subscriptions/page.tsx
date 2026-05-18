import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { getServerUser } from "@/lib/api";

export default async function AdminSubscriptionsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  return (
    <AppShell user={user}>
      <div className="space-y-4">
        <div className="flex gap-3">
          <Select defaultValue="all"><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">all plans</SelectItem><SelectItem value="pro">pro</SelectItem><SelectItem value="premium">premium</SelectItem></SelectContent></Select>
          <Select defaultValue="all"><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">all statuses</SelectItem><SelectItem value="active">active</SelectItem><SelectItem value="inactive">inactive</SelectItem></SelectContent></Select>
        </div>
        <DataTable headers={["Business", "Owner", "Plan", "Status", "Stripe customer", "Stripe subscription"]}>
          <tr><td className="px-4 py-3">Downtown Clinic</td><td className="px-4 py-3">Jane Doe</td><td className="px-4 py-3"><StatusBadge value="pro" /></td><td className="px-4 py-3"><StatusBadge value="active" /></td><td className="px-4 py-3">cus_mock</td><td className="px-4 py-3">sub_mock</td></tr>
        </DataTable>
      </div>
    </AppShell>
  );
}
