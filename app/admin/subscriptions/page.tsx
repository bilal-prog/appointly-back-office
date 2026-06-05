import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getServerUser } from "@/lib/api";
import { AdminBusinessesClient } from "../businesses/ui";

export default async function AdminSubscriptionsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <AppShell user={user}>
      <AdminBusinessesClient subscriptionsOnly />
    </AppShell>
  );
}
