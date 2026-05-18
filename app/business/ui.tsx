"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clientApi } from "@/lib/client-api";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  country: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(4),
  timezone: z.string().min(2)
});

type FormValues = z.infer<typeof schema>;

export function BusinessClient() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      country: "Morocco",
      city: "Casablanca",
      address: "",
      timezone: "Africa/Casablanca"
    }
  });

  async function onSubmit(values: FormValues) {
    try {
      await clientApi.post("/businesses", {
        name: values.name,
        description: values.description,
        location: { country: values.country, city: values.city, address: values.address },
        timezone: values.timezone
      });
      toast.success("Business profile saved");
    } catch {
      toast.error("Business profile could not be saved");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business profile</CardTitle>
        <CardDescription>Manage the operational profile used by the back office.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <Field label="Name" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
          <Field label="Timezone" error={form.formState.errors.timezone?.message}><Input {...form.register("timezone")} /></Field>
          <Field label="Country" error={form.formState.errors.country?.message}><Input {...form.register("country")} /></Field>
          <Field label="City" error={form.formState.errors.city?.message}><Input {...form.register("city")} /></Field>
          <Field label="Address" error={form.formState.errors.address?.message}><Input {...form.register("address")} /></Field>
          <div className="md:col-span-2">
            <Field label="Description" error={form.formState.errors.description?.message}><Textarea {...form.register("description")} /></Field>
          </div>
          <div className="md:col-span-2">
            <Button disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Save profile</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error ? <p className="text-sm text-destructive">{error}</p> : null}</div>;
}
