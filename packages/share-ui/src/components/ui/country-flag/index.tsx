import { hasFlag } from "country-flag-icons";
import * as Flags from "country-flag-icons/react/3x2";
import type { ElementType } from "react";
import { cn } from "@repo/share-ui/lib/utils";

export default function CountryFlag({
  countryCode,
  className,
}: {
  countryCode: string;
  className?: string;
}) {
  const FlagComponent = (Flags as Record<string, ElementType>)[
    countryCode.toUpperCase()
  ];

  if (FlagComponent && hasFlag(countryCode.toUpperCase())) {
    return <FlagComponent className={className} />;
  }

  return null;
}

export function CountryFlagWithName({
  countryCode,
  name,
  className,
}: {
  countryCode: string;
  name?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1.5 items-center", className)}>
      <div className="shrink-0 w-6 h-4">
        <CountryFlag countryCode={countryCode} />
      </div>
      <div className=" truncate ">{name || countryCode.toUpperCase()}</div>
    </div>
  );
}
