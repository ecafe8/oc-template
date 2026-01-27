import { hasFlag } from "country-flag-icons";
import * as Flags from "country-flag-icons/react/3x2";
import type { ElementType } from "react";
import { cn } from "@repo/share-ui/lib/utils";

export default function CountryFlag({
  iso2,
  className,
}: {
  iso2: string;
  className?: string;
}) {
  const FlagComponent = (Flags as Record<string, ElementType>)[
    iso2.toUpperCase()
  ];

  if (FlagComponent && hasFlag(iso2.toUpperCase())) {
    return <FlagComponent className={className} />;
  }

  return null;
}

export function CountryFlagWithName({
  iso2,
  name,
  className,
}: {
  iso2: string;
  name?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-1.5 items-center", className)}>
      <div className="shrink-0 w-6 h-4">
        <CountryFlag iso2={iso2} />
      </div>
      <div className=" truncate ">{name || iso2.toUpperCase()}</div>
    </div>
  );
}
