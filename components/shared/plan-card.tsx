"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Plan } from "@/lib/types";

export function PlanCard({
  plan,
  price,
  features,
  current,
  loading,
  onSelect
}: {
  plan: Plan;
  price: string;
  features: string[];
  current?: boolean;
  loading?: boolean;
  onSelect?: () => void;
}) {
  return (
    <Card className={current ? "border-primary" : undefined}>
      <CardHeader>
        <CardTitle className="capitalize">{plan}</CardTitle>
        <div className="text-2xl font-semibold">{price}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
        <Button className="w-full" variant={current ? "secondary" : "default"} disabled={current || loading || plan === "free"} onClick={onSelect}>
          {current ? "Current plan" : loading ? "Opening checkout" : plan === "free" ? "Included" : "Upgrade"}
        </Button>
      </CardContent>
    </Card>
  );
}
