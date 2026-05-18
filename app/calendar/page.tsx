import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getServerUser } from "@/lib/api";
import { CalendarClient } from "@/app/calendar/ui";

export default async function CalendarPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "business") redirect("/admin");
  return <AppShell user={user}><CalendarClient /></AppShell>;
}
