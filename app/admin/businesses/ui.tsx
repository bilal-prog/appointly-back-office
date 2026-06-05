"use client";

import { Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { clientApi } from "@/lib/client-api";
import type { BusinessesResponse, Business } from "@/lib/types";

const PAGE_SIZE = 20;

function ownerName(business: Business) {
  if (business.ownerId && typeof business.ownerId === "object") {
    return business.ownerId.name ?? business.ownerId.email ?? "-";
  }
  return business.ownerId ?? "-";
}

function categoryName(business: Business) {
  if (business.category && typeof business.category === "object") {
    return business.category.name;
  }
  return business.category ?? "-";
}

export function AdminBusinessesClient({
  subscriptionsOnly = false,
}: {
  subscriptionsOnly?: boolean;
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [offset, setOffset] = useState(0);

  const { data: businesses, isLoading } = useQuery({
    queryKey: ["admin-businesses", status, offset],
    queryFn: async () =>
      (
        await clientApi.get<BusinessesResponse>("/businesses", {
          params: {
            limit: PAGE_SIZE,
            offset,
            ...(status === "all" ? {} : { status }),
          },
        })
      ).data,
  });

  const statusMutation = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "publish" | "suspend";
    }) => clientApi.patch(`/businesses/${id}/${action}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      toast.success("Business status updated");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to update business",
      );
    },
  });

  const filtered = useMemo(() => {
    return (businesses?.data ?? []).filter((business) => {
      const text = `${business.name} ${ownerName(business)} ${categoryName(
        business,
      )}`
        .toLowerCase()
        .trim();
      return text.includes(search.toLowerCase());
    });
  }, [businesses?.data, search]);

  if (isLoading) return <LoadingState label="Loading businesses" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search businesses"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        {!subscriptionsOnly ? (
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setOffset(0);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">all statuses</SelectItem>
              <SelectItem value="draft">draft</SelectItem>
              <SelectItem value="published">published</SelectItem>
              <SelectItem value="suspended">suspended</SelectItem>
            </SelectContent>
          </Select>
        ) : null}
      </div>
      {filtered.length ? (
        <DataTable
          headers={
            subscriptionsOnly
              ? [
                  "Business",
                  "Owner",
                  "Plan",
                  "Status",
                  "Stripe customer",
                  "Stripe subscription",
                ]
              : ["Business", "Owner", "Category", "Plan", "Status", "Actions"]
          }
          pagination={businesses?.meta}
          onPageChange={setOffset}
        >
          {filtered.map((business) => {
            const status =
              business.status ?? business.subscription?.status ?? "active";
            const plan = business.subscription?.plan ?? "free";

            return (
              <tr key={business._id}>
                <td className="px-4 py-3 font-medium">{business.name}</td>
                <td className="px-4 py-3">{ownerName(business)}</td>
                {subscriptionsOnly ? null : (
                  <td className="px-4 py-3">{categoryName(business)}</td>
                )}
                <td className="px-4 py-3">
                  <StatusBadge value={plan} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={status} />
                </td>
                {subscriptionsOnly ? (
                  <>
                    <td className="px-4 py-3">
                      {business.subscription?.stripeCustomerId ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      {business.subscription?.stripeSubscriptionId ?? "-"}
                    </td>
                  </>
                ) : (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          status === "published" || statusMutation.isPending
                        }
                        onClick={() =>
                          statusMutation.mutate({
                            id: business._id,
                            action: "publish",
                          })
                        }
                      >
                        Publish
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                          status === "suspended" || statusMutation.isPending
                        }
                        onClick={() =>
                          statusMutation.mutate({
                            id: business._id,
                            action: "suspend",
                          })
                        }
                      >
                        Suspend
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </DataTable>
      ) : (
        <EmptyState
          title="No businesses found"
          description="Adjust the search to review more businesses."
        />
      )}
    </div>
  );
}
