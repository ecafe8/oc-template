import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL("https://m.media-amazon.com/**")],
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: true,
      },
    ];
  },
  allowedDevOrigins: ["*.local.com"],
  output: "standalone",
};

export default nextConfig;
