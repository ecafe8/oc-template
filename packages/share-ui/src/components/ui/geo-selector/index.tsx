"use client";

import * as React from "react";
import {
  getCountries,
  getStatesOfCountry,
  getCitiesOfState,
} from "@countrystatecity/countries";

import { ReuiAsyncCombobox } from "./async-combobox";
export interface GeoValues {
  country: string;
  state: string;
  city: string;
}

interface GeoSelectorProps {
  value?: GeoValues;
  defaultValue?: GeoValues;
  onChange?: (value: GeoValues) => void;
}

export function GeoSelector({
  value: valueProp,
  defaultValue,
  onChange,
}: GeoSelectorProps) {
  const [internalValue, setInternalValue] = React.useState<GeoValues>(
    defaultValue || { country: "", state: "", city: "" },
  );

  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;

  const handleCountryChange = (val: string) => {
    const newValue = { country: val, state: "", city: "" };
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleStateChange = (val: string) => {
    const newValue = { ...value, state: val, city: "" };
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleCityChange = (val: string) => {
    const newValue = { ...value, city: val };
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <div className="space-y-4 w-full max-w-sm">
      <ReuiAsyncCombobox
        label="国家"
        value={value.country}
        fetcher={async () => {
          const data = await getCountries();
          return data.map((item: any) => ({
            ...item,
            countryCode: item.iso2,
          }));
        }}
        onSelect={handleCountryChange}
        showFlag
      />

      <ReuiAsyncCombobox
        label="省/州"
        value={value.state}
        dependency={value.country}
        disabled={!value.country}
        fetcher={async () => {
          const data = await getStatesOfCountry(value.country);
          return data.map((item: any) => ({
            ...item,
            countryCode: item.iso2,
          }));
        }}
        onSelect={handleStateChange}
      />

      <ReuiAsyncCombobox
        label="城市"
        value={value.city}
        dependency={value.state}
        disabled={!value.state}
        fetcher={async () => getCitiesOfState(value.country, value.state)}
        onSelect={handleCityChange}
      />
    </div>
  );
}
