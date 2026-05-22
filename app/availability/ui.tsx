"use client";

import { format } from "date-fns";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { clientApi } from "@/lib/client-api";

export function AvailabilityClient({ businessId }: { businessId: string }) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [serviceId, setServiceId] = useState("");

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => (await clientApi.get("/services")).data
  });

  const { data: slots, isLoading, refetch } = useQuery({
    queryKey: ["availability", businessId, serviceId, date],
    queryFn: async () => {
      if (!serviceId) return [];
      const response = await clientApi.get(`/businesses/${businessId}/availability`, {
        params: { serviceId, date }
      });
      return response.data;
    },
    enabled: !!serviceId
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Availability checker</CardTitle>
          <CardDescription>View available time slots for appointments based on your working hours and existing bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48" />
            </div>
            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Select a service" /></SelectTrigger>
                <SelectContent>
                  {services?.map((service: any) => (
                    <SelectItem key={service._id} value={service._id}>{service.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => refetch()} disabled={!serviceId || isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                Check availability
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingState label="Checking availability" />
      ) : slots && slots.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Available slots</CardTitle>
            <CardDescription>{slots.length} time slots available on {format(new Date(date), "PPP")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
              {slots.map((slot: string, index: number) => (
                <Button key={index} variant="outline" className="justify-start">
                  {format(new Date(slot), "HH:mm")}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : serviceId ? (
        <EmptyState title="No available slots" description="All time slots are booked or the business is closed on this date." />
      ) : null}
    </div>
  );
}
