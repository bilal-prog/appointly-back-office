import Link from "next/link";
import { CircleOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubscriptionCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CircleOff className="h-10 w-10 text-muted-foreground" />
          <CardTitle>Checkout cancelled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No payment was completed. The current plan remains unchanged.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild><Link href="/subscriptions">Subscriptions</Link></Button>
            <Button asChild variant="outline"><Link href="/dashboard">Dashboard</Link></Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
