"use client";

import { Button } from "@repo/share-ui/components/reui/button";
import { Card, CardContent } from "@repo/share-ui/components/reui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/share-ui/components/shadcn/field";
import { Input } from "@repo/share-ui/components/reui/input";
import { cn } from "@repo/share-ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import Image from "next/image";
import { z } from "zod";

export const formSchema = z.object({
  email: z.email({ error: "请输入有效的邮箱地址" }),
  password: z.string().min(1, { error: "请输入密码" }),
});
export type LoginType = z.infer<typeof formSchema>;
export interface SignInProps {
  className?: string;
  onSubmit: (data: LoginType) => void;
  loading?: boolean;
}

export function LoginForm({ className, onSubmit, loading }: SignInProps) {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onBlur: formSchema,
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
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
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">Login to your Acme Inc account</p>
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
              <form.Field name="password">
                {(field) => (
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <a href="/forgot-password" className="ml-auto text-sm underline-offset-2 hover:underline">
                        Forgot your password?
                      </a>
                    </div>
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
              <Field>
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
                  {([canSubmit, isSubmitting]) => (
                    <Button type="submit" disabled={!canSubmit || loading} className="w-full">
                      {isSubmitting || loading ? "登录中..." : "Login"}
                    </Button>
                  )}
                </form.Subscribe>
              </Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account? <a href="/signup">Sign up</a>
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
        By clicking continue, you agree to our <a href="/terms">Terms of Service</a> and{" "}
        <a href="/privacy">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
