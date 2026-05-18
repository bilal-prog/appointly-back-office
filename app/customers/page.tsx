import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getServerUser } from "@/lib/api";
import { CustomersClient } from "@/app/customers/ui";

export default async function CustomersPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (user.role !== "business") redirect("/admin/users");
  return <AppShell user={user}><CustomersClient /></AppShell>;
}
