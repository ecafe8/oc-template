"use client";

import { Button } from "@repo/share-ui/components/reui/button";
import { Card, CardContent } from "@repo/share-ui/components/reui/card";
import { Input } from "@repo/share-ui/components/reui/input";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@repo/share-ui/components/shadcn/field";
import { cn } from "@repo/share-ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, { error: "密码至少 6 位" }),
    confirmPassword: z.string().min(1, { error: "请确认密码" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

export type ResetPasswordType = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordFormProps {
  className?: string;
  onSubmit: (newPassword: string) => Promise<boolean>;
  loading?: boolean;
}

export function ResetPasswordForm({ className, onSubmit, loading }: ResetPasswordFormProps) {
  const form = useForm({
    defaultValues: { newPassword: "", confirmPassword: "" },
    validators: {
      onBlur: resetPasswordSchema,
      onSubmit: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value.newPassword);
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
                <h1 className="text-2xl font-bold">Reset your password</h1>
                <p className="text-balance text-sm text-muted-foreground">Enter your new password below.</p>
              </div>

              <form.Field name="newPassword">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                    <Input
                      id="new-password"
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

              <FieldDescription>Must be at least 6 characters long.</FieldDescription>

              <Field>
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
                  {([canSubmit, isSubmitting]) => (
                    <Button type="submit" disabled={!canSubmit || loading} className="w-full">
                      {isSubmitting || loading ? "Resetting..." : "Reset Password"}
                    </Button>
                  )}
                </form.Subscribe>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
