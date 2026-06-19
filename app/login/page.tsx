"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck, Loader2 } from "lucide-react";
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
import { saveClientUser } from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    try {
      const { data } = await clientApi.post("/auth/login", values);
      saveClientUser(data.user);
      toast.success("Welcome back");
      router.push(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Invalid email or password";
      toast.error(message);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
      {/* Magic Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent blur-[120px] rounded-full animate-pulse-glow" />
        </div>
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-background/80 border-border shadow-2xl">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <CardTitle>Sign in to Appointly</CardTitle>
          <CardDescription>Access the back-office workspace.</CardDescription>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
            <Button className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Sign in
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">
              Don't have an account?{" "}
            </span>
            <button
              onClick={() => router.push("/register")}
              className="text-primary hover:underline"
            >
              Create business account
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
