"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState, LoadingState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { clientApi } from "@/lib/client-api";
import { formatCurrency } from "@/lib/utils";
import type { Service, ServicesResponse } from "@/lib/types";

const PAGE_SIZE = 10;

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  durationInMinutes: z.number().min(5, "Duration must be at least 5 minutes"),
  bufferTimeInMinutes: z.number().min(0, "Buffer time must be 0 or more"),
  price: z.number().min(0, "Price must be 0 or more"),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function ServicesClient() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      durationInMinutes: 30,
      bufferTimeInMinutes: 15,
      price: 0,
      isActive: true,
    },
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ["services", offset, PAGE_SIZE],
    queryFn: async () =>
      (
        await clientApi.get<ServicesResponse>("/services", {
          params: { limit: PAGE_SIZE, offset },
        })
      ).data,
  });

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      await clientApi.post("/services", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service created");
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create service";
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: FormValues }) => {
      await clientApi.put(`/services/${id}`, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service updated");
      setOpen(false);
      setEditingService(null);
      form.reset();
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update service";
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await clientApi.delete(`/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service deleted");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete service";
      toast.error(message);
    },
  });

  function handleEdit(service: Service) {
    setEditingService(service);
    form.reset({
      name: service.name,
      description: service.description,
      durationInMinutes: service.durationInMinutes,
      bufferTimeInMinutes: service.bufferTimeInMinutes,
      price: service.price,
      isActive: service.isActive,
    });
    setOpen(true);
  }

  function onSubmit(values: FormValues) {
    if (editingService) {
      updateMutation.mutate({ id: editingService._id, values });
    } else {
      createMutation.mutate(values);
    }
  }

  if (isLoading) return <LoadingState label="Loading services" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog
          open={open}
          onOpenChange={(open) => {
            setOpen(open);
            if (!open) {
              setEditingService(null);
              form.reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEditingService(null)}>
              <Plus className="h-4 w-4" />
              New service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Edit service" : "New service"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea {...form.register("description")} />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    {...form.register("durationInMinutes", {
                      valueAsNumber: true,
                    })}
                  />
                  {form.formState.errors.durationInMinutes && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.durationInMinutes.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Buffer time (minutes)</Label>
                  <Input
                    type="number"
                    {...form.register("bufferTimeInMinutes", {
                      valueAsNumber: true,
                    })}
                  />
                  {form.formState.errors.bufferTimeInMinutes && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.bufferTimeInMinutes.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("price", { valueAsNumber: true })}
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>
              {editingService ? (
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-1">
                    <Label htmlFor="service-status">Active status</Label>
                    <p className="text-sm text-muted-foreground">
                      Inactive services stay hidden from availability and
                      booking flows.
                    </p>
                  </div>
                  <Controller
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <Switch
                        id="service-status"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              ) : null}
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingService
                    ? "Update service"
                    : "Create service"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {services?.data && services.data.length > 0 ? (
        <DataTable
          headers={["Name", "Duration", "Buffer", "Price", "Status", "Actions"]}
          pagination={services.meta}
          onPageChange={setOffset}
        >
          {services.data.map((service) => (
            <tr key={service._id}>
              <td className="px-4 py-3">
                <div className="font-medium">{service.name}</div>
                <div className="text-xs text-muted-foreground">
                  {service.description}
                </div>
              </td>
              <td className="px-4 py-3">{service.durationInMinutes} min</td>
              <td className="px-4 py-3">{service.bufferTimeInMinutes} min</td>
              <td className="px-4 py-3">{formatCurrency(service.price)}</td>
              <td className="px-4 py-3">
                <StatusBadge value={service.isActive ? "active" : "inactive"} />
              </td>
              <td className="px-4 py-3 text-right flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(service)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(service._id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </DataTable>
      ) : (
        <EmptyState
          title="No services yet"
          description="Create the services this business offers."
        />
      )}
    </div>
  );
}
