import type { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";

// ── React Query Meta 类型注册 ──────────────────────────────────
// 让 query.meta / mutation.meta 支持 silent 和 successMessage 类型提示
declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: ApiMeta;
    mutationMeta: ApiMeta;
  }
}

interface ApiMeta {
  /** 静默模式：跳过全局错误 toast */
  silent?: boolean;
  /** 成功消息：操作成功后自动 toast */
  successMessage?: string;
}

// ── Hook Options ───────────────────────────────────────────────

/**
 * Extended query hook options with API-specific features.
 * - `silent`: suppress error toast notifications
 * - `successMessage`: show success toast after data loads
 */
export interface ApiQueryOptions<TData = unknown, TError = Error>
  extends Omit<UseQueryOptions<TData, TError, TData>, "queryKey" | "queryFn"> {
  /** 静默模式：当该查询发生错误时不弹出 toast */
  silent?: boolean;
  /** 查询成功后弹出的 toast 消息 */
  successMessage?: string;
}

/**
 * Extended mutation hook options with API-specific features.
 * - `silent`: suppress error toast notifications
 * - `successMessage`: show success toast after mutation succeeds
 */
export interface ApiMutationOptions<TData = unknown, TVariables = void, TError = Error, TContext = unknown>
  extends Omit<UseMutationOptions<TData, TError, TVariables, TContext>, "mutationFn"> {
  /** 静默模式：当该 mutation 发生错误时不弹出 toast */
  silent?: boolean;
  /** mutation 成功后弹出的 toast 消息 */
  successMessage?: string;
}

// ── Utility Types ──────────────────────────────────────────────

/** Extract `data` field from ApiResponse<T> wrapper. Falls back to T. */
export type ExtractData<T> = T extends { data: infer D } ? D : T;
