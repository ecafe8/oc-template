"use client";

import { AUTH_REDIRECT_CODES, NO_RETRY_CODES } from "@server/auth/errors/error-codes";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useMemoizedFn, useThrottleFn } from "ahooks";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";

interface ReactQueryRejectError {
  code: string;
  message: string;
  silent?: boolean;
}
interface ReactQueryError extends Error {
  cause: ReactQueryRejectError;
}

const isQueryError = (error: unknown): error is ReactQueryError => {
  if (error instanceof Error) {
    const { cause } = error;
    return !!cause && typeof cause === "object" && "code" in cause && "message" in cause;
  }
  return false;
};

const isQueryRejectError = (error: unknown): error is ReactQueryRejectError => {
  if (error === null || typeof error !== "object") {
    return false;
  }
  return "code" in error && "message" in error;
};

const getQueryErrorCause = (error: unknown): ReactQueryRejectError | undefined => {
  if (isQueryRejectError(error)) {
    return error;
  }
  if (isQueryError(error)) {
    return error.cause;
  }
  return undefined;
};

export const ReactQueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  const goLogin = useThrottleFn(
    () => {
      router.push(`/login?redirect=${encodeURIComponent(window.location.href)}`);
    },
    { leading: true, trailing: false },
  );

  const handleError = useMemoizedFn((error: unknown) => {
    let code: string = "UNKNOWN_ERROR";
    let message = "An unknown error occurred.";
    let silent = false;

    if (isQueryError(error)) {
      const { cause } = error;
      code = cause.code;
      message = cause.message;
      silent = cause.silent ?? false;
    } else if (isQueryRejectError(error)) {
      code = error.code;
      message = error.message;
      silent = error.silent ?? false;
    }

    if (!silent) {
      toast.error(message);
    }

    if (AUTH_REDIRECT_CODES.has(code)) {
      goLogin.run();
    }
  });

  const queryClient = useMemo(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          retry: (failureCount: number, error): boolean => {
            const cause = getQueryErrorCause(error);
            if (cause && NO_RETRY_CODES.has(cause.code)) {
              return false;
            }
            return failureCount < 3;
          },
        },
      },
      queryCache: new QueryCache({ onError: handleError }),
      mutationCache: new MutationCache({ onError: handleError }),
    });
  }, [handleError]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
