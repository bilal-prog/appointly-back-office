"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FileUpload } from "@/components/shared/file-upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState } from "@/components/shared/states";
import { clientApi } from "@/lib/client-api";
import type { Category, WorkingHours } from "@/lib/types";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const workingHoursSchema = z
  .object({
    isOpen: z.boolean(),
    start: z.string().optional(),
    end: z.string().optional(),
  })
  .refine((data) => !data.isOpen || (data.start && data.end), {
    message: "Start and end times are required when open",
    path: ["start"],
  });

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  category: z.string().min(1, "Category is required"),
  currency: z.string().length(3, "Use a 3-letter currency code"),
  country: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(4),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(2),
  cancellationWindowHours: z
    .number()
    .min(0, "Cancellation window must be 0 or more"),
  workingHours: z.record(workingHoursSchema),
  logoFileId: z.string().optional(),
  coverFileId: z.string().optional(),
  galleryFileIds: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

const defaultWorkingHours: Record<string, WorkingHours> = DAYS.reduce(
  (acc, day) => {
    acc[day] = {
      isOpen: day !== "saturday" && day !== "sunday",
      start: "09:00",
      end: "17:00",
    };
    return acc;
  },
  {} as Record<string, WorkingHours>,
);

export function BusinessClient() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["business"],
    queryFn: async () => {
      try {
        return (await clientApi.get("/myBusiness")).data;
      } catch (error) {
        toast.error("Failed to fetch business: " + (error as Error).message);
        return null;
      }
    },
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () =>
      (await clientApi.get<{ data: Category[] }>("/categories")).data.data,
  });

  console.log("categories:", categories);

  const business = data?.business;
  const businessCategory =
    typeof business?.category === "object"
      ? business.category._id
      : business?.category;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      currency: "MAD",
      country: "",
      city: "",
      address: "",
      latitude: 0,
      longitude: 0,
      timezone: "",
      cancellationWindowHours: 24,
      workingHours: defaultWorkingHours,
      logoFileId: "",
      coverFileId: "",
      galleryFileIds: [],
    },
    values: business
      ? {
          name: business.name ?? "",
          description: business.description ?? "",
          category: businessCategory ?? "",
          currency: business.currency ?? "MAD",
          country: business.location?.country ?? "",
          city: business.location?.city ?? "",
          address: business.location?.address ?? "",
          latitude: business.location?.coordinates?.latitude ?? 0,
          longitude: business.location?.coordinates?.longitude ?? 0,
          timezone: business.timezone ?? "",
          cancellationWindowHours: business.cancellationWindowHours ?? 24,
          workingHours: business.workingHours ?? defaultWorkingHours,
          logoFileId: business.logoFileId ?? "",
          coverFileId: business.coverFileId ?? "",
          galleryFileIds: business.galleryFileIds ?? [],
        }
      : undefined,
    resetOptions: {
      keepDirtyValues: false,
      keepErrors: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        name: values.name,
        description: values.description,
        category: values.category,
        currency: values.currency,
        location: {
          country: values.country,
          city: values.city,
          address: values.address,
          coordinates: {
            latitude: values.latitude,
            longitude: values.longitude,
          },
        },
        timezone: values.timezone,
        cancellationWindowHours: values.cancellationWindowHours,
        workingHours: values.workingHours,
        logoFileId: values.logoFileId || undefined,
        coverFileId: values.coverFileId || undefined,
        galleryFileIds: values.galleryFileIds || [],
      };

      if (business) {
        await clientApi.put(`/businesses/${business._id}`, payload);
      } else {
        await clientApi.post("/businesses", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business"] });
      toast.success(
        business ? "Business profile updated" : "Business profile created",
      );
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to save business profile";
      toast.error(message);
    },
  });

  async function onSubmit(values: FormValues) {
    mutation.mutate(values);
  }

  if (isLoading) return <LoadingState label="Loading business profile" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business profile</CardTitle>
          <CardDescription>
            Manage the operational profile used by the back office.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Field label="Name" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} />
            </Field>

            <Field
              label="Category"
              error={form.formState.errors.category?.message}
            >
              <Controller
                control={form.control}
                name="category"
                render={({ field }) =>
                  isLoadingCategories ? (
                    <div className="h-9 w-full rounded-md border bg-background px-3 text-sm flex items-center text-muted-foreground">
                      Loading categories...
                    </div>
                  ) : categories && categories.length > 0 ? (
                    <Select
                      key={field.value}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        side="bottom"
                        sideOffset={5}
                        className="z-[9999]"
                      >
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-9 w-full rounded-md border bg-background px-3 text-sm flex items-center text-muted-foreground">
                      No categories found
                    </div>
                  )
                }
              />
            </Field>

            <Field
              label="Timezone"
              error={form.formState.errors.timezone?.message}
            >
              <Controller
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      sideOffset={5}
                      className="z-[9999]"
                    >
                      <SelectItem value="Africa/Casablanca">
                        Africa/Casablanca
                      </SelectItem>
                      <SelectItem value="Africa/Tunis">Africa/Tunis</SelectItem>
                      <SelectItem value="Africa/Algiers">
                        Africa/Algiers
                      </SelectItem>
                      <SelectItem value="Africa/Cairo">Africa/Cairo</SelectItem>
                      <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                      <SelectItem value="Europe/London">
                        Europe/London
                      </SelectItem>
                      <SelectItem value="Europe/Berlin">
                        Europe/Berlin
                      </SelectItem>
                      <SelectItem value="Europe/Madrid">
                        Europe/Madrid
                      </SelectItem>
                      <SelectItem value="Europe/Rome">Europe/Rome</SelectItem>
                      <SelectItem value="America/New_York">
                        America/New_York
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        America/Los_Angeles
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        America/Chicago
                      </SelectItem>
                      <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                      <SelectItem value="Asia/Shanghai">
                        Asia/Shanghai
                      </SelectItem>
                      <SelectItem value="Australia/Sydney">
                        Australia/Sydney
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field
              label="Country"
              error={form.formState.errors.country?.message}
            >
              <Input {...form.register("country")} />
            </Field>
            <Field
              label="Currency"
              error={form.formState.errors.currency?.message}
            >
              <Controller
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      side="bottom"
                      sideOffset={5}
                      className="z-[9999]"
                    >
                      {["MAD", "USD", "EUR", "GBP", "CAD"].map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="City" error={form.formState.errors.city?.message}>
              <Input {...form.register("city")} />
            </Field>
            <Field
              label="Address"
              error={form.formState.errors.address?.message}
            >
              <Input {...form.register("address")} />
            </Field>
            <Field
              label="Latitude"
              error={form.formState.errors.latitude?.message}
            >
              <Input
                type="number"
                step="any"
                {...form.register("latitude", { valueAsNumber: true })}
              />
            </Field>
            <Field
              label="Longitude"
              error={form.formState.errors.longitude?.message}
            >
              <Input
                type="number"
                step="any"
                {...form.register("longitude", { valueAsNumber: true })}
              />
            </Field>
            <Field
              label="Cancellation window (hours)"
              error={form.formState.errors.cancellationWindowHours?.message}
            >
              <Input
                type="number"
                min="0"
                {...form.register("cancellationWindowHours", {
                  valueAsNumber: true,
                })}
              />
            </Field>
            <div className="md:col-span-2">
              <Field
                label="Description"
                error={form.formState.errors.description?.message}
              >
                <Textarea {...form.register("description")} />
              </Field>
            </div>
            <div className="md:col-span-2 border-t pt-6 mt-4">
              <h3 className="text-lg font-semibold mb-4">Business Media</h3>
              <div className="grid gap-6 md:grid-cols-2 mb-6">
                <div>
                  <Label className="block mb-2 font-medium text-sm">Logo</Label>
                  <Controller
                    control={form.control}
                    name="logoFileId"
                    render={({ field }) => (
                      <FileUpload
                        value={field.value}
                        onChange={field.onChange}
                        maxFiles={1}
                        helperText="Square image up to 5MB"
                      />
                    )}
                  />
                </div>
                <div>
                  <Label className="block mb-2 font-medium text-sm">
                    Cover Image
                  </Label>
                  <Controller
                    control={form.control}
                    name="coverFileId"
                    render={({ field }) => (
                      <FileUpload
                        value={field.value}
                        onChange={field.onChange}
                        maxFiles={1}
                        helperText="Landscape banner up to 5MB"
                      />
                    )}
                  />
                </div>
              </div>
              <div className="mb-6">
                <Label className="block mb-2 font-medium text-sm">
                  Gallery Images
                </Label>
                <Controller
                  control={form.control}
                  name="galleryFileIds"
                  render={({ field }) => (
                    <FileUpload
                      value={field.value}
                      onChange={field.onChange}
                      maxFiles={10}
                      helperText="Showcase your space, services, or team (up to 10 images)"
                    />
                  )}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Button disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {business ? "Update profile" : "Create profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Working hours
          </CardTitle>
          <CardDescription>
            Set your business operating hours for each day of the week.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS.map((day) => (
              <div
                key={day}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="flex-1">
                  <Label className="capitalize">{day}</Label>
                </div>
                <Switch
                  checked={form.watch(`workingHours.${day}.isOpen`)}
                  onCheckedChange={(checked: boolean) =>
                    form.setValue(`workingHours.${day}.isOpen`, checked)
                  }
                />
                {form.watch(`workingHours.${day}.isOpen`) && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      {...form.register(`workingHours.${day}.start`)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      {...form.register(`workingHours.${day}.end`)}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
