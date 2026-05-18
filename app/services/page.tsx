import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getServerUser } from "@/lib/api";
import { ServicesClient } from "@/app/services/ui";

export default async function ServicesPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "business") redirect("/admin");
  return <AppShell user={user}><ServicesClient /></AppShell>;
}
