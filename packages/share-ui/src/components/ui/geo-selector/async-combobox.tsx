"use client";

import CountryFlag from "@repo/share-ui/components/ui/country-flag";
import { type ComboboxOption, ResponsiveCombobox } from "@repo/share-ui/components/ui/responsive-combobox";
import { useEffect, useState } from "react";
import type { GeoOption } from "./types";

// --- 内部封装：适配 reui 的异步搜索组件 ---
export function AsyncCombobox({
  label,
  value,
  onSelect,
  fetcher,
  dependency,
  disabled = false,
  showFlag = false,
}: {
  label: string;
  value: string;
  onSelect: (val: string) => void;
  fetcher: () => Promise<GeoOption[]>;
  dependency?: string;
  disabled?: boolean;
  showFlag?: boolean;
}) {
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (disabled) {
      setOptions([]);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetcher();
        if (isMounted) {
          setOptions(
            data.map((opt) => {
              const internalValue = opt.iso2 || opt.name;
              return {
                value: internalValue,
                label: (
                  <span className="flex items-center gap-2">
                    {showFlag && opt.iso2 ? (
                      <CountryFlag countryCode={opt.iso2} className="w-6 object-contain" />
                    ) : (
                      opt.emoji
                    )}
                    {opt.name}
                  </span>
                ),
                keywords: [opt.name],
              };
            }),
          );
        }
      } catch (error) {
        if (isMounted) {
          console.error(`Fetch error [${label}]:`, error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadData();

    return () => {
      isMounted = false;
    };
  }, [dependency, disabled, fetcher]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <ResponsiveCombobox
        label={label}
        value={value}
        onSelect={onSelect}
        options={options}
        loading={loading}
        disabled={disabled}
      />
    </div>
  );
}
