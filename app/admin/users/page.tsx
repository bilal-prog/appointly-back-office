import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { getServerUser } from "@/lib/api";

export default async function AdminUsersPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  return (
    <AppShell user={user}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative w-full md:w-80"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search users" /></div>
          <Select defaultValue="all"><SelectTrigger className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">all roles</SelectItem><SelectItem value="admin">admin</SelectItem><SelectItem value="business">business</SelectItem></SelectContent></Select>
        </div>
        <DataTable headers={["User", "Email", "Role", "Status", "Business id"]}>
          <tr><td className="px-4 py-3 font-medium">Jane Doe</td><td className="px-4 py-3">jane@example.com</td><td className="px-4 py-3"><StatusBadge value="business" /></td><td className="px-4 py-3"><StatusBadge value="active" /></td><td className="px-4 py-3">business-1</td></tr>
        </DataTable>
      </div>
    </AppShell>
  );
}
