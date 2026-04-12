import { AUTH_REDIRECT_CODES } from "@server/auth/errors/error-codes";
import type { ApiResponse } from "@server/auth/types/response";
import { useRequest } from "ahooks";
import { useRouter } from "next/navigation";

type useRequestWithErrorParams<T extends ApiResponse<unknown> | undefined, K extends unknown[]> = Parameters<
  typeof useRequest<T, K>
>;

export const useRequestWithAuth = <T extends ApiResponse<unknown> | undefined, K extends unknown[]>(
  servers: useRequestWithErrorParams<T, K>[0],
  options?: useRequestWithErrorParams<T, K>[1],
  plugins?: useRequestWithErrorParams<T, K>[2],
) => {
  const router = useRouter();
  return useRequest<T, K>(
    servers,
    {
      ...options,
      onSuccess: (data, params) => {
        if (data?.code !== undefined && AUTH_REDIRECT_CODES.has(data.code)) {
          router.push(`/login?redirect=${encodeURIComponent(window.location.href)}`);
          return;
        }
        if (options?.onSuccess) {
          options.onSuccess(data, params);
        }
      },
    },
    plugins,
  );
};
