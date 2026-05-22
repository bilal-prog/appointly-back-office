"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlanCard } from "@/components/shared/plan-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { clientApi } from "@/lib/client-api";
import type { Plan } from "@/lib/types";

const plans = [
  {
    plan: "free" as const,
    price: "0,00$US",
    features: [
      "Basic scheduling overview",
      "Service and customer records",
      "Email notifications",
    ],
  },
  {
    plan: "pro" as const,
    price: "19,00$US/mo",
    features: [
      "More appointment volume",
      "Advanced notifications",
      "Priority support",
    ],
  },
  {
    plan: "premium" as const,
    price: "29,00$US/mo",
    features: [
      "Multi-location readiness",
      "Analytics exports",
      "Premium support",
    ],
  },
];

export function SubscriptionsClient() {
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);

  const { data } = useQuery({
    queryKey: ["business"],
    queryFn: async () => (await clientApi.get("/myBusiness")).data,
  });

  const currentPlan: Plan =
    data?.business?.subscription?.plan ?? data?.business?.plan ?? "free";

  async function upgrade(plan: "pro" | "premium") {
    setLoadingPlan(plan);
    try {
      const { data } = await clientApi.post<{ url: string }>(
        "/subscriptions/checkout",
        { plan },
      );
      window.location.href = data.url;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Checkout could not be opened";
      toast.error(message);
      setLoadingPlan(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current subscription</CardTitle>
          <CardDescription>
            New businesses start on free. Paid plans are activated after Stripe
            confirms payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <div className="font-medium">Active plan</div>
            <div className="text-muted-foreground">
              Subscription status is synced by webhook.
            </div>
          </div>
          <StatusBadge value={currentPlan} />
          {loadingPlan ? (
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing checkout
            </div>
          ) : null}
        </CardContent>
      </Card>
      <section className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.plan}
            {...plan}
            current={currentPlan === plan.plan}
            loading={loadingPlan === plan.plan}
            onSelect={
              plan.plan === "free" ? undefined : () => upgrade(plan.plan)
            }
          />
        ))}
      </section>
    </div>
  );
}
