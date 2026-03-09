"use client";
import { ThemesProviders } from "./themes-provider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <ThemesProviders>{children}</ThemesProviders>;
};
export default Providers;
