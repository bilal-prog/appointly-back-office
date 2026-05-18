"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
} from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { clientApi } from "@/lib/client-api";
import type { Appointment, AppointmentStatus } from "@/lib/types";

export function CalendarClient() {
  const now = new Date();
  const [status, setStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const startDate = format(startOfMonth(now), "yyyy-MM-dd");
  const endDate = format(endOfMonth(now), "yyyy-MM-dd");
  const query = useQuery({
    queryKey: ["calendar", startDate, endDate],
    queryFn: async () =>
      (
        await clientApi.get<Appointment[]>("/calendar", {
          params: { startDate, endDate },
        })
      ).data,
  });
  const days = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(now), end: endOfMonth(now) }),
    [now],
  );
  const appointments = (query.data ?? []).filter(
    (item) => status === "all" || item.status === status,
  );

  if (query.isLoading) return <LoadingState label="Loading calendar" />;
  if (query.isError) return <ErrorState label="Unable to load calendar" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          {format(now, "MMMM yyyy")}
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
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
      <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
        {days.map((day) => {
          const dayAppointments = appointments.filter((item) =>
            isSameDay(new Date(item.startTime), day),
          );
          return (
            <div
              key={day.toISOString()}
              className="min-h-32 rounded-lg border bg-card p-3"
            >
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                {format(day, "d EEE")}
              </div>
              <div className="space-y-2">
                {dayAppointments.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => setSelected(item)}
                    className="w-full rounded-md border bg-background p-2 text-left text-xs hover:bg-accent"
                  >
                    <div className="font-medium">
                      {format(new Date(item.startTime), "HH:mm")} -{" "}
                      {format(new Date(item.endTime), "HH:mm")}
                    </div>
                    <div className="mt-1">
                      <StatusBadge value={item.status as AppointmentStatus} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {!appointments.length ? (
        <EmptyState title="No appointments in this range" />
      ) : null}
      <Dialog open={Boolean(selected)} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment details</DialogTitle>
            <DialogDescription>
              {selected
                ? `${format(new Date(selected.startTime), "PPpp")} to ${format(new Date(selected.endTime), "p")}`
                : null}
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-3 text-sm">
              <StatusBadge value={selected.status} />
              <p>{selected.notes ?? "No notes"}</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
