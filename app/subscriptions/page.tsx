import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getServerUser } from "@/lib/api";
import { SubscriptionsClient } from "@/app/subscriptions/ui";

export default async function SubscriptionsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "business") redirect("/admin/subscriptions");
  return (
    <AppShell user={user}>
      <SubscriptionsClient />
    </AppShell>
  );
}
