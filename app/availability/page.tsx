import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getServerUser } from "@/lib/api";
import { AvailabilityClient } from "@/app/availability/ui";

export default async function AvailabilityPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "business") redirect("/admin");
  return <AppShell user={user}><AvailabilityClient businessId={user.businessId!} /></AppShell>;
}
