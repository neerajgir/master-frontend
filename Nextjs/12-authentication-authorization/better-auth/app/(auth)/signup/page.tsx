"use client"

import { cn } from "cn";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<{
    name: string;
    email: string;
    password: string;
  }>({
    defaultValues: { name: "", email: "", password: "" },
  });

  async function handleSubmit(values: {
    name: string;
    email: string;
    password: string;
  }) {
    setError(null);
    setIsLoading(true);
    try {
      await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to create account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-destructive text-sm">
            {error}
          </div>
        )}
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-xl font-bold">Create Account</h1>
              <FieldDescription>
                Already have an account? <a href="/auth/login">Sign in</a>
              </FieldDescription>
            </div>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                {...form.register("name", {
                  required: "Full name is required",
                })}
              />
              <FieldError message={form.formState.errors.name?.message} />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                {...form.register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
              />
              <FieldError message={form.formState.errors.email?.message} />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                {...form.register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              <FieldError message={form.formState.errors.password?.message} />
            </Field>
            <Field>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign up"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}

function FieldError({
  message,
}: {
  message?: string;
}) {
  if (!message) return null;
  return (
    <p className="text-sm font-normal text-destructive mt-1">
      {message}
    </p>
  );
}