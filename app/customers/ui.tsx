"use client";

import { format } from "date-fns";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { clientApi } from "@/lib/client-api";
import type { Customer } from "@/lib/types";

export function CustomersClient() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const query = useQuery({ queryKey: ["customers"], queryFn: async () => (await clientApi.get<Customer[]>("/customers")).data });
  const customers = useMemo(() => (query.data ?? []).filter((item) => `${item.name} ${item.email}`.toLowerCase().includes(search.toLowerCase())), [query.data, search]);
  if (query.isLoading) return <LoadingState label="Loading customers" />;
  return (
    <div className="space-y-4">
      <div className="relative w-full md:w-80"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search customers" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
      {customers.length ? <DataTable headers={["Name", "Email", "Appointments", "Last appointment", "Status"]}>
        {customers.map((customer) => (
          <tr key={customer._id} className="cursor-pointer hover:bg-muted/60" onClick={() => setSelected(customer)}>
            <td className="px-4 py-3 font-medium">{customer.name}</td>
            <td className="px-4 py-3">{customer.email}</td>
            <td className="px-4 py-3">{customer.totalAppointments}</td>
            <td className="px-4 py-3">{format(new Date(customer.lastAppointmentDate), "PP")}</td>
            <td className="px-4 py-3"><StatusBadge value={customer.status} /></td>
          </tr>
        ))}
      </DataTable> : <EmptyState title="No customers found" />}
      <Dialog open={Boolean(selected)} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selected?.name}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{selected?.email}</p>
          <div className="rounded-md border bg-muted/40 p-4 text-sm">Appointment history will appear here when the endpoint is available.</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
