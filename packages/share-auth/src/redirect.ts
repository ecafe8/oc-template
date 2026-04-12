export function normalizeRedirectTarget(value: string | null, origin: string): string {
  if (!value) {
    return `${origin}/`;
  }

  try {
    const parsed = new URL(value, origin);
    if (parsed.origin !== origin) {
      return `${origin}/`;
    }
    return parsed.toString();
  } catch {
    return `${origin}/`;
  }
}
