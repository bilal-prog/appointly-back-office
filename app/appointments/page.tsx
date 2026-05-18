import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getServerUser } from "@/lib/api";
import { AppointmentsClient } from "@/app/appointments/ui";

export default async function AppointmentsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  return <AppShell user={user}><AppointmentsClient role={user.role} /></AppShell>;
}
