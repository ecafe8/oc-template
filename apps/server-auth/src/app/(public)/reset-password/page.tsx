"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSign } from "../hooks/use-sign";
import { ResetPasswordForm } from "./components/reset-password-form";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { resetPassword, loading } = useSign();

  if (!token) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-2xl font-bold">Invalid reset link</h2>
          <p className="mt-2 text-muted-foreground">
            This password reset link is missing a token. Please request a new reset link.
          </p>
          <a href="/forgot-password" className="mt-4 inline-block underline underline-offset-4">
            Request new link
          </a>
        </div>
      </div>
    );
  }

  const handleSubmit = async (newPassword: string): Promise<boolean> => {
    return resetPassword(newPassword, token);
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ResetPasswordForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
