import type { UserInfo } from "@server/auth/hono-middleware";
import { useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";

// 写入在 src/app/(public)/hooks/use-sign.tsx
export const userInfoAtom = atomWithStorage<UserInfo | null>("userInfo", null);

const useUserInfo = () => {
  const userInfo = useAtomValue(userInfoAtom);
  return userInfo;
};

export default useUserInfo;
