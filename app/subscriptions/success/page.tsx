import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubscriptionSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CheckCircle2 className="h-10 w-10 text-primary" />
          <CardTitle>Checkout completed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Subscription activation is confirmed by webhook and may take a moment to appear in the back office.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild><Link href="/dashboard">Dashboard</Link></Button>
            <Button asChild variant="outline"><Link href="/subscriptions">Subscriptions</Link></Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
