"use client";
import { ReactQueryProvider } from "./react-query-provider";
import { ThemesProviders } from "./themes-provider";
import { Provider as JotaiProvider } from "jotai";
import { Toaster } from "@repo/share-ui/components/reui/sonner";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <JotaiProvider>
      <ThemesProviders>
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster />
      </ThemesProviders>
    </JotaiProvider>
  );
};
export default Providers;
