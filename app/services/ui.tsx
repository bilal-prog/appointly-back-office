"use client";

import { Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { clientApi } from "@/lib/client-api";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@/lib/types";

export function ServicesClient() {
  const [open, setOpen] = useState(false);
  const query = useQuery({ queryKey: ["services"], queryFn: async () => (await clientApi.get<Service[]>("/services")).data });
  if (query.isLoading) return <LoadingState label="Loading services" />;
  const services = query.data ?? [];
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" />New service</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Service</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              {["Name", "Description", "Duration in minutes", "Buffer time", "Price"].map((item) => <Input key={item} placeholder={item} />)}
              <Button onClick={() => { setOpen(false); toast.success("Service saved in mock data"); }}>Save service</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {services.length ? <DataTable headers={["Name", "Duration", "Buffer", "Price", "Status", ""]}>
        {services.map((service) => (
          <tr key={service._id}>
            <td className="px-4 py-3"><div className="font-medium">{service.name}</div><div className="text-xs text-muted-foreground">{service.description}</div></td>
            <td className="px-4 py-3">{service.durationInMinutes} min</td>
            <td className="px-4 py-3">{service.bufferTimeInMinutes} min</td>
            <td className="px-4 py-3">{formatCurrency(service.price)}</td>
            <td className="px-4 py-3"><StatusBadge value={service.isActive ? "active" : "inactive"} /></td>
            <td className="px-4 py-3 text-right"><Button variant="ghost" size="icon" onClick={() => toast.success("Delete confirmation would open")}><Trash2 className="h-4 w-4" /></Button></td>
          </tr>
        ))}
      </DataTable> : <EmptyState title="No services yet" description="Create the services this business offers." />}
    </div>
  );
}
