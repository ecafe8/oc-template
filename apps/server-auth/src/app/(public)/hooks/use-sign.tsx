"use client";
import { authClient } from "@server/auth/lib/auth/auth-client";
import { userInfoAtom } from "@server/auth/stores/user-info";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { LoginType } from "../login/components/login-form";

function resolveRedirectPath(redirectPath?: string | null) {
  if (redirectPath && redirectPath.trim().length > 0) {
    return redirectPath;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/account`;
  }

  return "/account";
}

export const useSign = (redirectPath?: string | null) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [, setUserInfo] = useAtom(userInfoAtom);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const resolvedRedirectPath = resolveRedirectPath(redirectPath);

  const signInEmail = async ({ email, password }: LoginType) => {
    try {
      setLoading(true);
      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe: true,
        callbackURL: resolvedRedirectPath,
      });
      if (!result.data) {
        toast.error(result?.error?.message || "服务器异常，请稍后重试");
      } else {
        setUserInfo(result.data.user);
        setLoginSuccess(true);
      }
    } catch (error) {
      console.error("[signInEmail]", error);
      toast.error("登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({
    email,
    password,
    name,
  }: {
    email: string;
    password: string;
    name: string;
  }) => {
    try {
      setLoading(true);
      const result = await authClient.signUp.email({ email, password, name });
      if (!result.data) {
        toast.error(result?.error?.message || "注册失败，请稍后重试");
        return false;
      }
      toast.success("注册成功！请登录");
      router.push("/login");
      return true;
    } catch (error) {
      console.error("[signUp]", error);
      toast.error("注册失败，请稍后重试");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signInGoogle = async () => {
    try {
      setLoading(true);
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: resolvedRedirectPath,
      });
      if (result.error) {
        toast.error(result.error.message);
      }
    } catch (error) {
      console.error("[signInGoogle]", error);
      toast.error("Google 登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await authClient
      .signOut({
        fetchOptions: {
          onSuccess: () => {
            setUserInfo(null);
            toast("登出成功.");
            router.push("/login");
          },
        },
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (result.error) {
        toast.error(result.error.message || "发送失败，请稍后重试");
        return false;
      }
      return true;
    } catch (error) {
      console.error("[forgotPassword]", error);
      toast.error("发送失败，请稍后重试");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (newPassword: string, token: string) => {
    try {
      setLoading(true);
      const result = await authClient.resetPassword({ newPassword, token });
      if (result.error) {
        toast.error(result.error.message || "重置失败，请稍后重试");
        return false;
      }
      toast.success("密码重置成功，请登录");
      router.push("/login");
      return true;
    } catch (error) {
      console.error("[resetPassword]", error);
      toast.error("重置失败，请稍后重试");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    signInEmail,
    signUp,
    signInGoogle,
    signOut,
    forgotPassword,
    resetPassword,
    loading,
    loginSuccess,
  };
};
