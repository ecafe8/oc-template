export function toAbsoluteUrl(relativeUrl: string): string {
  if (typeof window !== "undefined" && window.location && relativeUrl.startsWith("/")) {
    return `${window.location.origin}${relativeUrl}`;
  }
  return relativeUrl;
}

export function toRelativeUrl(absoluteUrl: string): string {
  try {
    const url = new URL(absoluteUrl);
    return url.pathname + url.search + url.hash;
  } catch {
    return absoluteUrl;
  }
}
