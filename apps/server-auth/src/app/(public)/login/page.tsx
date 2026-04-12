"use client";
import { Alert, AlertDescription, AlertTitle } from "@repo/share-ui/components/reui/alert";
import { Button } from "@repo/share-ui/components/reui/button";
import { CheckCircle2Icon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSign } from "../hooks/use-sign";
import { LoginForm } from "./components/login-form";

function LoginPage() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");

  const { signInEmail, loading, loginSuccess } = useSign(redirectPath);
  const router = useRouter();

  if (loginSuccess) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Alert>
            <CheckCircle2Icon />
            <AlertTitle>登录成功!</AlertTitle>
            <AlertDescription>页面跳转中...</AlertDescription>
          </Alert>
          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={() => {
              router.push(redirectPath || "/account");
            }}
            disabled={loading}
          >
            手动跳转
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm onSubmit={signInEmail} loading={loading} />
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
