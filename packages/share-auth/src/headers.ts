export interface BuildForwardAuthHeadersOptions {
  internalApiSecret?: string;
}

export function buildForwardAuthHeaders(
  inputHeaders: Headers,
  options: BuildForwardAuthHeadersOptions = {},
): Headers {
  const forwardedHeaders = new Headers();
  const cookie = inputHeaders.get("cookie");
  const authorization = inputHeaders.get("authorization");

  if (cookie) {
    forwardedHeaders.set("cookie", cookie);
  }

  if (authorization) {
    forwardedHeaders.set("authorization", authorization);
  }

  if (options.internalApiSecret) {
    forwardedHeaders.set("x-internal-secret", options.internalApiSecret);
  }

  return forwardedHeaders;
}
