import { redirect } from "next/navigation";
import { LogOut, Wifi } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import { getServerUser } from "@/lib/api";

export default async function SettingsPage() {
  const user = await getServerUser();
  if (!user) redirect("/login");
  return (
    <AppShell user={user}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>User profile</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p>{user.name}</p><p className="text-muted-foreground">{user.email}</p><StatusBadge value={user.role} /></CardContent></Card>
        <Card><CardHeader><CardTitle>API connection</CardTitle></CardHeader><CardContent className="flex items-center gap-2 text-sm"><Wifi className="h-4 w-4 text-primary" />Configured through server-side proxy routes</CardContent></Card>
        <Card><CardHeader><CardTitle>Account settings</CardTitle></CardHeader><CardContent className="space-y-3"><Label>Name</Label><Input defaultValue={user.name} /><Label>Email</Label><Input defaultValue={user.email} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Business preferences</CardTitle></CardHeader><CardContent className="space-y-3"><Label>Timezone</Label><Input defaultValue="Africa/Casablanca" /><Button variant="outline"><LogOut className="h-4 w-4" />Logout from topbar</Button></CardContent></Card>
      </div>
    </AppShell>
  );
}
