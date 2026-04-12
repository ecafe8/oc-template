import "@repo/share-ui/styles/globals.css";
import "../styles/globals.css";
import type { Metadata } from "next";
import Providers from "../providers";

export const metadata: Metadata = {
  title: "X-Counselor",
  description: "AI-powered website auditing and optimization tool for enhanced performance and user experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
