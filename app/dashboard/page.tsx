import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getServerUser } from "@/lib/api";
import { DashboardClient } from "@/app/dashboard/ui";

export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  return (
    <AppShell user={user}>
      <DashboardClient user={user} />
    </AppShell>
  );
}
