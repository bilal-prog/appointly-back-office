import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/api";

export default async function HomePage() {
  const user = await getServerUser();
  redirect(user?.role === "admin" ? "/admin" : user ? "/dashboard" : "/login");
}
