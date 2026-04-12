"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSign } from "../hooks/use-sign";
import { ForgotPasswordForm } from "./components/forgot-password-form";

export default function ForgotPasswordPage() {
  const { forgotPassword, loading } = useSign();
  const [sent, setSent] = useState(false);

  const handleSubmit = async (email: string): Promise<boolean> => {
    const ok = await forgotPassword(email);
    if (ok) {
      setSent(true);
      toast.success("Reset link sent — check your email (or server logs in dev)");
    }
    return ok;
  };

  if (sent) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="mt-2 text-muted-foreground">
            A password reset link has been sent. Follow the link to set a new password.
          </p>
          <a href="/login" className="mt-4 inline-block underline underline-offset-4">
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
