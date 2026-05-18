import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { getServerUser } from "@/lib/api";

export default async function AdminBusinessesPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  return (
    <AppShell user={user}>
      <div className="space-y-4">
        <div className="relative w-full md:w-80"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search businesses" /></div>
        <DataTable headers={["Business", "Owner", "Plan", "Status", "Appointments"]}>
          <tr><td className="px-4 py-3 font-medium">Downtown Clinic</td><td className="px-4 py-3">Jane Doe</td><td className="px-4 py-3"><StatusBadge value="pro" /></td><td className="px-4 py-3"><StatusBadge value="active" /></td><td className="px-4 py-3">42</td></tr>
        </DataTable>
      </div>
    </AppShell>
  );
}
