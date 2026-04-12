"use client";

import { Button } from "@repo/share-ui/components/reui/button";
import { Card, CardContent } from "@repo/share-ui/components/reui/card";
import { Input } from "@repo/share-ui/components/reui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/share-ui/components/shadcn/field";
import { cn } from "@repo/share-ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import Image from "next/image";
import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().min(1, { error: "请输入您的姓名" }),
    email: z.email({ error: "请输入有效的邮箱地址" }),
    password: z.string().min(6, { error: "密码至少 6 位" }),
    confirmPassword: z.string().min(1, { error: "请确认密码" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export type SignupType = z.infer<typeof signupSchema>;

export interface SignupFormProps {
  className?: string;
  onSubmit: (data: Omit<SignupType, "confirmPassword">) => Promise<boolean | void>;
  loading?: boolean;
}

export function SignupForm({ className, onSubmit, loading }: SignupFormProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onBlur: signupSchema,
      onSubmit: signupSchema,
    },
    onSubmit: async ({ value }) => {
      const { confirmPassword: _cp, ...rest } = value;
      await onSubmit(rest);
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Enter your details below to create your account
                </p>
              </div>

              {/* Name */}
              <form.Field name="name">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.isTouched && (
                      <FieldError
                        errors={field.state.meta.errors.map((e) =>
                          typeof e === "string" ? { message: e } : (e as { message?: string }),
                        )}
                      />
                    )}
                  </Field>
                )}
              </form.Field>

              {/* Email */}
              <form.Field name="email">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.isTouched && (
                      <FieldError
                        errors={field.state.meta.errors.map((e) =>
                          typeof e === "string" ? { message: e } : (e as { message?: string }),
                        )}
                      />
                    )}
                  </Field>
                )}
              </form.Field>

              {/* Password + Confirm */}
              <Field className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <form.Field name="password">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <Input
                        id="password"
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.isTouched && (
                        <FieldError
                          errors={field.state.meta.errors.map((e) =>
                            typeof e === "string" ? { message: e } : (e as { message?: string }),
                          )}
                        />
                      )}
                    </Field>
                  )}
                </form.Field>

                <form.Field name="confirmPassword">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {field.state.meta.isTouched && (
                        <FieldError
                          errors={field.state.meta.errors.map((e) =>
                            typeof e === "string" ? { message: e } : (e as { message?: string }),
                          )}
                        />
                      )}
                    </Field>
                  )}
                </form.Field>
              </Field>
              <FieldDescription>Must be at least 6 characters long.</FieldDescription>

              {/* Submit */}
              <Field>
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
                  {([canSubmit, isSubmitting]) => (
                    <Button type="submit" disabled={!canSubmit || loading} className="w-full">
                      {isSubmitting || loading ? "注册中..." : "Create Account"}
                    </Button>
                  )}
                </form.Subscribe>
              </Field>

              <FieldDescription className="text-center">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Sign in
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="relative hidden bg-muted md:block">
            <Image
              src="/placeholder.svg"
              alt="placeholder"
              fill
              loading="eager"
              className="object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <a href="/terms" className="underline underline-offset-4">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline underline-offset-4">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
