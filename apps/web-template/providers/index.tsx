"use client";
import { Toaster } from "sonner";
import { ReactQueryProvider } from "./react-query-provider";
import { ThemesProviders } from "./themes-provider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactQueryProvider>
      <ThemesProviders>
        {children}
        <Toaster />
      </ThemesProviders>
    </ReactQueryProvider>
  );
};
export default Providers;
