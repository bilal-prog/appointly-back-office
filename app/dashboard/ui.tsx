"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Scissors,
  Users,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/shared/states";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { clientApi } from "@/lib/client-api";
import type { BusinessDashboard, User } from "@/lib/types";

const trend = [
  { day: "Mon", appointments: 8 },
  { day: "Tue", appointments: 12 },
  { day: "Wed", appointments: 9 },
  { day: "Thu", appointments: 15 },
  { day: "Fri", appointments: 11 },
  { day: "Sat", appointments: 6 },
];

function appointmentLabel(
  value: string | { name?: string } | null | undefined,
  fallback = "Unknown",
) {
  if (typeof value === "string") return value;
  return value?.name ?? fallback;
}

export function DashboardClient({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const query = useQuery({
    queryKey: ["business-dashboard"],
    queryFn: async () =>
      (await clientApi.get<BusinessDashboard>("/dashboard")).data,
  });

  useEffect(() => {
    let closed = false;
    const abortController = new AbortController();

    async function connect() {
      try {
        const { data } = await clientApi.get<{
          token: string;
          url: string;
          user: User;
        }>("/socket-token", { signal: abortController.signal });

        if (closed) return;

        socketRef.current?.disconnect();

        const socket = io(data.url, {
          auth: { token: data.token },
          transports: ["websocket", "polling"],
        });
        socketRef.current = socket;

        const businessId = data.user.businessId ?? user.businessId;

        if (businessId) {
          socket.on("connect", () => {
            socket.emit("join:business", businessId);
          });
        }

        const refreshDashboard = () => {
          queryClient.invalidateQueries({ queryKey: ["business-dashboard"] });
        };

        socket.on("appointment:created", refreshDashboard);
        // socket.on("new_appointment", refreshDashboard);
        socket.on("appointment:updated", refreshDashboard);
        socket.on("appointment:cancelled", refreshDashboard);
        socket.on("notification", refreshDashboard);
      } catch {
        return;
      }
    }

    const connectTimer = window.setTimeout(() => {
      void connect();
    }, 0);

    return () => {
      closed = true;
      window.clearTimeout(connectTimer);
      abortController.abort();
      socketRef.current?.removeAllListeners();
      socketRef.current?.offAny();
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [queryClient, user.businessId]);

  if (query.isLoading) return <LoadingState label="Loading dashboard" />;
  if (query.isError || !query.data)
    return <ErrorState label="Unable to load dashboard" />;

  const { stats, todayAppointments } = query.data;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total appointments"
          value={stats.totalAppointments}
          icon={CalendarCheck}
        />
        <StatCard
          title="Pending"
          value={stats.pendingAppointments}
          icon={Clock3}
        />
        <StatCard
          title="Confirmed"
          value={stats.confirmedAppointments}
          icon={CheckCircle2}
        />
        <StatCard
          title="Services"
          value={stats.totalServices}
          icon={Scissors}
        />
        <StatCard title="Customers" value={stats.totalCustomers} icon={Users} />
      </section>
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length ? (
              <DataTable headers={["Time", "Service", "Customer", "Status"]}>
                {todayAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td className="px-4 py-3">
                      {new Date(appointment.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {appointment.serviceName ??
                        appointmentLabel(appointment.serviceId, "Service")}
                    </td>
                    <td className="px-4 py-3">
                      {appointment.customerName ??
                        appointmentLabel(appointment.customerId, "Customer")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={appointment.status} />
                    </td>
                  </tr>
                ))}
              </DataTable>
            ) : (
              <EmptyState
                title="No appointments today"
                description="Today is clear for this business."
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appointment trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="appointments"
                    stroke="#0f8f83"
                    fill="#ccfbf1"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
