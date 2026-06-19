import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getServerUser, getNotifications } from "@/lib/api";
import { NotificationsClient } from "@/app/notifications/ui";

export default async function NotificationsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");

  const initialNotifications = await getNotifications().catch(() => ({
    data: [],
    meta: { total: 0, limit: 50, offset: 0 },
  }));

  return (
    <AppShell user={user}>
      <NotificationsClient initialData={initialNotifications} user={user} />
    </AppShell>
  );
}
