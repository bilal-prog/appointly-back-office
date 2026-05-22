"use client";

import { format } from "date-fns";
import { Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type {
  Appointment,
  UserRole,
  AppointmentStatus,
  AppointmentsResponse,
} from "@/lib/types";

const PAGE_SIZE = 10;

function relationName(
  relation: { name?: string } | string | null | undefined,
  fallback: string,
) {
  if (relation && typeof relation === "object" && relation.name) {
    return relation.name;
  }
  return fallback;
}

export function AppointmentsClient({ role }: { role: UserRole }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<Appointment | null>(null);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments", status, date, offset, PAGE_SIZE],
    queryFn: async () =>
      (
        await clientApi.get<AppointmentsResponse>("/appointments", {
          params: {
            limit: PAGE_SIZE,
            offset,
            ...(status === "all" ? {} : { status }),
            ...(date ? { startDate: date, endDate: date } : {}),
          },
        })
      ).data,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: AppointmentStatus;
    }) => {
      await clientApi.put(`/appointments/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment status updated");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update appointment status";
      toast.error(message);
    },
  });

  const filtered = useMemo(() => {
    if (!appointments?.data) return [];
    return appointments?.data.filter((item) => {
      const text =
        `${relationName(item.customerId, "Deleted customer")} ${relationName(
          item.serviceId,
          item.serviceName ?? "Deleted service",
        )} ${relationName(item.businessId, "Deleted business")}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [appointments, search]);

  useEffect(() => {
    setOffset(0);
  }, [search, status, date]);

  if (isLoading) return <LoadingState label="Loading appointments" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search appointments"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Input
          className="w-full md:w-44"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["all", "pending", "confirmed", "cancelled", "completed"].map(
              (item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>
      {filtered.length ? (
        <DataTable
          headers={
            role === "admin"
              ? ["Date", "Business", "Customer", "Service", "Status", "Actions"]
              : ["Date", "Customer", "Service", "Status", "Actions"]
          }
          pagination={appointments?.meta}
          onPageChange={setOffset}
        >
          {filtered.map((item) => (
            <tr
              key={item._id}
              className="cursor-pointer hover:bg-muted/60"
              onClick={() => setSelected(item)}
            >
              <td className="px-4 py-3">
                {format(new Date(item.startTime), "PPp")}
              </td>
              {role === "admin" ? (
                <td className="px-4 py-3">
                  {relationName(item.businessId, "Deleted business")}
                </td>
              ) : null}
              <td className="px-4 py-3">
                {relationName(item.customerId, "Deleted customer")}
              </td>
              <td className="px-4 py-3">
                {relationName(item.serviceId, item.serviceName ?? "Deleted service")}
              </td>
              <td className="px-4 py-3">
                <StatusBadge value={item.status} />
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <Select
                  value={item.status}
                  onValueChange={(value: AppointmentStatus) =>
                    updateStatusMutation.mutate({ id: item._id, status: value })
                  }
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    side="bottom"
                    sideOffset={5}
                    className="z-[9999]"
                  >
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState
          title="No appointments found"
          description="Adjust the filters to review more appointments."
        />
      )}
      <Dialog open={Boolean(selected)} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment details</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-2 text-sm">
              <p>
                <strong>Customer:</strong>{" "}
                {relationName(selected.customerId, "Deleted customer")}
              </p>
              <p>
                <strong>Service:</strong>{" "}
                {relationName(
                  selected.serviceId,
                  selected.serviceName ?? "Deleted service",
                )}
              </p>
              <p>
                <strong>Notes:</strong> {selected.notes ?? "None"}
              </p>
              <StatusBadge value={selected.status} />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
