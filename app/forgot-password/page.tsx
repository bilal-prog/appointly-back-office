"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { clientApi } from "@/lib/client-api";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type ForgotPasswordForm = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordForm) {
    try {
      await clientApi.post("/auth/forgot-password", values);
      toast.success("If an account exists, a new password will be emailed.");
      router.push("/login");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to process request"
      );
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Mail className="h-5 w-5" />
          </div>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your email and we will send you a new temporary password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>
            <Button className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Send reset email
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => router.push("/login")}
              className="text-primary hover:underline"
            >
              Back to login
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
