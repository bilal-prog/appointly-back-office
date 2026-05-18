import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getServerUser } from "@/lib/api";
import { BusinessClient } from "@/app/business/ui";

export default async function BusinessPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "business") redirect("/admin/businesses");
  return <AppShell user={user}><BusinessClient /></AppShell>;
}
