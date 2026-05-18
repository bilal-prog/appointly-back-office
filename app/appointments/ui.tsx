"use client";

import { format } from "date-fns";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Appointment, UserRole } from "@/lib/types";

const seed: Appointment[] = [
  {
    _id: "apt-1",
    businessId: "business-1",
    serviceId: "svc-1",
    customerId: "cus-1",
    businessName: "Downtown Clinic",
    customerName: "Jane Doe",
    serviceName: "General Consultation",
    startTime: "2026-05-13T10:00:00.000Z",
    endTime: "2026-05-13T10:30:00.000Z",
    status: "pending",
    notes: "First visit",
    createdAt: "2026-05-12T10:00:00.000Z",
    updatedAt: "2026-05-12T10:00:00.000Z"
  }
];

export function AppointmentsClient({ role }: { role: UserRole }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const filtered = useMemo(() => seed.filter((item) => {
    const text = `${item.customerName} ${item.serviceName} ${item.businessName}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (status === "all" || item.status === status);
  }), [search, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search appointments" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <Input className="w-full md:w-44" type="date" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["all", "pending", "confirmed", "cancelled", "completed"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {filtered.length ? (
        <DataTable headers={role === "admin" ? ["Date", "Business", "Customer", "Service", "Status"] : ["Date", "Customer", "Service", "Status"]}>
          {filtered.map((item) => (
            <tr key={item._id} className="cursor-pointer hover:bg-muted/60" onClick={() => setSelected(item)}>
              <td className="px-4 py-3">{format(new Date(item.startTime), "PPp")}</td>
              {role === "admin" ? <td className="px-4 py-3">{item.businessName}</td> : null}
              <td className="px-4 py-3">{item.customerName}</td>
              <td className="px-4 py-3">{item.serviceName}</td>
              <td className="px-4 py-3"><StatusBadge value={item.status} /></td>
            </tr>
          ))}
        </DataTable>
      ) : <EmptyState title="No appointments found" description="Adjust the filters to review more appointments." />}
      <Dialog open={Boolean(selected)} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Appointment details</DialogTitle></DialogHeader>
          {selected ? <div className="space-y-2 text-sm">
            <p><strong>Customer:</strong> {selected.customerName}</p>
            <p><strong>Service:</strong> {selected.serviceName}</p>
            <p><strong>Notes:</strong> {selected.notes ?? "None"}</p>
            <StatusBadge value={selected.status} />
          </div> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
