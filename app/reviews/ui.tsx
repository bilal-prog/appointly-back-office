"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Flag,
  ShieldAlert,
  ShieldCheck,
  Star,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clientApi } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import type {
  Review,
  ReviewsResponse,
  BusinessesResponse,
  ServicesResponse,
  User,
  UserRole,
} from "@/lib/types";

const PAGE_SIZE = 10;

export function ReviewsClient({ role, user }: { role: UserRole; user: User }) {
  const queryClient = useQueryClient();
  const [offset, setOffset] = useState(0);

  // Filters for Business Owner
  const [serviceId, setServiceId] = useState("all");
  const [rating, setRating] = useState("all");

  // Filters for Admin
  const [status, setStatus] = useState("all");
  const [businessId, setBusinessId] = useState("all");

  // Fetch businesses (Admin only)
  const { data: businesses } = useQuery({
    queryKey: ["businesses-list"],
    queryFn: async () => {
      const res = await clientApi.get<BusinessesResponse>("/businesses", {
        params: { limit: 100 },
      });
      return res.data.data;
    },
    enabled: role === "admin",
  });

  // Fetch services (Business only)
  const { data: services } = useQuery({
    queryKey: ["services-list"],
    queryFn: async () => {
      const res = await clientApi.get<ServicesResponse>("/services", {
        params: { limit: 100 },
      });
      return res.data.data;
    },
    enabled: role === "business",
  });

  // Fetch Reviews
  const { data: reviewsResponse, isLoading } = useQuery({
    queryKey: ["reviews", role, serviceId, rating, status, businessId, offset],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("limit", PAGE_SIZE.toString());
      params.append("offset", offset.toString());

      if (role === "business" && user.businessId) {
        params.append("businessId", user.businessId);
        if (serviceId !== "all") params.append("serviceId", serviceId);
      } else if (role === "admin") {
        if (businessId !== "all") params.append("businessId", businessId);
      }

      // Fetch reviews
      const res = await clientApi.get<ReviewsResponse>("/reviews", { params });

      // Client-side filtering for ratings and status if not supported by backend natively
      let filtered = res.data.data;

      if (role === "business" && rating !== "all") {
        filtered = filtered.filter((r) => r.rating === parseInt(rating, 10));
      }

      if (role === "admin" && status !== "all") {
        filtered = filtered.filter((r) => r.status === status);
      }

      return {
        data: filtered,
        meta: {
          total: res.data.meta.total,
          limit: PAGE_SIZE,
          offset,
        },
      };
    },
  });

  // Mutate: Flag Review (Business Owner)
  const flagMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      await clientApi.patch(`/reviews/${reviewId}/flag`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review flagged successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to flag review");
    },
  });

  // Mutate: Moderate Review (Admin)
  const moderateMutation = useMutation({
    mutationFn: async ({
      reviewId,
      status,
    }: {
      reviewId: string;
      status: "published" | "removed";
    }) => {
      await clientApi.patch(`/reviews/${reviewId}/moderate`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success(
        variables.status === "published"
          ? "Review published"
          : "Review removed",
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to moderate review");
    },
  });

  const renderStars = (score: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= score
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30",
            )}
          />
        ))}
      </div>
    );
  };

  // Stats calculation
  const totalCount = reviewsResponse?.data?.length ?? 0;
  const averageRating = totalCount
    ? (
        reviewsResponse!.data.reduce((acc, curr) => acc + curr.rating, 0) /
        totalCount
      ).toFixed(1)
    : "0.0";
  const flaggedCount =
    reviewsResponse?.data?.filter((r) => r.status === "flagged").length ?? 0;

  if (isLoading) return <LoadingState label="Loading reviews" />;

  const headers =
    role === "admin"
      ? [
          "Business",
          "Customer",
          "Rating",
          "Service",
          "Feedback",
          "Status",
          "Date",
          "Actions",
        ]
      : [
          "Customer",
          "Rating",
          "Service",
          "Feedback",
          "Status",
          "Date",
          "Actions",
        ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Feedback
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">Reviews received</p>
          </CardContent>
        </Card>

        {role === "business" ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Rating
              </CardTitle>
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating} / 5.0</div>
              <p className="text-xs text-muted-foreground">
                Based on active feedback
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Flagged Reviews
              </CardTitle>
              <ShieldAlert className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {flaggedCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting moderation
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
        {role === "business" && (
          <>
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-xs font-medium text-muted-foreground">
                Filter by Service
              </span>
              <Select
                value={serviceId}
                onValueChange={(val) => {
                  setServiceId(val);
                  setOffset(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  side="bottom"
                  sideOffset={5}
                  className="z-[9999]"
                >
                  <SelectItem value="all">All Services</SelectItem>
                  {(services ?? []).map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 w-full sm:w-44">
              <span className="text-xs font-medium text-muted-foreground">
                Filter by Rating
              </span>
              <Select
                value={rating}
                onValueChange={(val) => {
                  setRating(val);
                  setOffset(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All ratings" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  side="bottom"
                  sideOffset={5}
                  className="z-[9999]"
                >
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {role === "admin" && (
          <>
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-xs font-medium text-muted-foreground">
                Filter by Business
              </span>
              <Select
                value={businessId}
                onValueChange={(val) => {
                  setBusinessId(val);
                  setOffset(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All businesses" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  side="bottom"
                  sideOffset={5}
                  className="z-[9999]"
                >
                  <SelectItem value="all">All Businesses</SelectItem>
                  {(businesses ?? []).map((b) => (
                    <SelectItem key={b._id} value={b._id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 w-full sm:w-44">
              <span className="text-xs font-medium text-muted-foreground">
                Filter by Status
              </span>
              <Select
                value={status}
                onValueChange={(val) => {
                  setStatus(val);
                  setOffset(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  side="bottom"
                  sideOffset={5}
                  className="z-[9999]"
                >
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="removed">Removed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Reviews Table */}
      {reviewsResponse?.data && reviewsResponse.data.length > 0 ? (
        <DataTable
          headers={headers}
          pagination={reviewsResponse.meta}
          onPageChange={setOffset}
        >
          {reviewsResponse.data.map((review) => {
            const customerName =
              review.customerId && typeof review.customerId === "object"
                ? review.customerId.name
                : typeof review.customerId === "string"
                  ? review.customerId
                  : "Customer";

            const serviceName =
              review.serviceId && typeof review.serviceId === "object"
                ? review.serviceId.name
                : typeof review.serviceId === "string"
                  ? review.serviceId
                  : "Unknown Service";

            const businessName =
              review.businessId && typeof review.businessId === "object"
                ? review.businessId.name
                : typeof review.businessId === "string"
                  ? review.businessId
                  : "Deleted Business";

            return (
              <tr key={review._id}>
                {role === "admin" && (
                  <td className="px-4 py-3 font-medium">{businessName}</td>
                )}
                <td className="px-4 py-3">{customerName}</td>
                <td className="px-4 py-3">{renderStars(review.rating)}</td>
                <td className="px-4 py-3 text-xs">{serviceName}</td>
                <td className="px-4 py-3 text-sm italic">
                  {review.comment ? `"${review.comment}"` : "-"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge value={review.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    {role === "business" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          review.status === "flagged" ||
                          review.status === "removed" ||
                          flagMutation.isPending
                        }
                        onClick={() => flagMutation.mutate(review._id)}
                      >
                        <Flag className="h-3.5 w-3.5 mr-1" />
                        {review.status === "flagged" ? "Flagged" : "Flag"}
                      </Button>
                    )}

                    {/* {role === "admin" && (
                      <> */}
                    {review.status !== "published" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-emerald-600 hover:text-emerald-700"
                        disabled={moderateMutation.isPending}
                        onClick={() =>
                          moderateMutation.mutate({
                            reviewId: review._id,
                            status: "published",
                          })
                        }
                      >
                        <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                        Publish
                      </Button>
                    )}
                    {review.status !== "removed" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={moderateMutation.isPending}
                        onClick={() =>
                          moderateMutation.mutate({
                            reviewId: review._id,
                            status: "removed",
                          })
                        }
                      >
                        <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                        Remove
                      </Button>
                    )}
                    {/* </>
                    )} */}
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      ) : (
        <EmptyState
          title="No reviews found"
          description="Adjust your filters or wait for customers to leave feedback."
        />
      )}
    </div>
  );
}
