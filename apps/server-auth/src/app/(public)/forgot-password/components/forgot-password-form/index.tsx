"use client";

import { Button } from "@repo/share-ui/components/reui/button";
import { Card, CardContent } from "@repo/share-ui/components/reui/card";
import { Input } from "@repo/share-ui/components/reui/input";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@repo/share-ui/components/shadcn/field";
import { cn } from "@repo/share-ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.email({ error: "请输入有效的邮箱地址" }),
});

export type ForgotPasswordType = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordFormProps {
  className?: string;
  onSubmit: (email: string) => Promise<boolean>;
  loading?: boolean;
}

export function ForgotPasswordForm({ className, onSubmit, loading }: ForgotPasswordFormProps) {
  const form = useForm({
    defaultValues: { email: "" },
    validators: {
      onBlur: forgotPasswordSchema,
      onSubmit: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value.email);
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="overflow-hidden p-0">
        <CardContent className="p-6 md:p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Forgot your password?</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Enter your email address and we will send you a reset link.
                </p>
              </div>

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

              <Field>
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
                  {([canSubmit, isSubmitting]) => (
                    <Button type="submit" disabled={!canSubmit || loading} className="w-full">
                      {isSubmitting || loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  )}
                </form.Subscribe>
              </Field>

              <FieldDescription className="text-center">
                Remember your password?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Back to login
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
