const PROTECTED_EXACT_PATHS = new Set<string>(["/"]);
const PROTECTED_PREFIXES = ["/test"];

export function isProtectedAppPath(pathname: string): boolean {
  if (PROTECTED_EXACT_PATHS.has(pathname)) {
    return true;
  }

  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function buildAuthRedirectTarget(pathname: string, search: string): string {
  return `${pathname}${search}` || "/";
}

export const protectedRouteConfig = {
  exact: Array.from(PROTECTED_EXACT_PATHS),
  prefixes: PROTECTED_PREFIXES,
};
