"use client";
import { Toaster } from "sonner";
import { ThemesProviders } from "./themes-provider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemesProviders>
      {children}
      <Toaster />
    </ThemesProviders>
  );
};
export default Providers;
