import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getServerUser } from "@/lib/api";
import { ReviewsClient } from "@/app/reviews/ui";

export default async function ReviewsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  return (
    <AppShell user={user}>
      <ReviewsClient role={user.role} user={user} />
    </AppShell>
  );
}
