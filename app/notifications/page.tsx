import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getServerUser } from "@/lib/api";
import { NotificationsClient } from "@/app/notifications/ui";

export default async function NotificationsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  return <AppShell user={user}><NotificationsClient /></AppShell>;
}
