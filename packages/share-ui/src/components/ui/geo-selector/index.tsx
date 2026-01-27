"use client";

import type { ICity, ICountry, IState } from "@countrystatecity/countries";
import * as React from "react";
import { useCallback } from "react";
import { AsyncCombobox } from "./async-combobox";
export interface GeoValues {
  country: string;
  state: string;
  city: string;
}

interface GeoSelectorProps {
  value?: GeoValues;
  defaultValue?: GeoValues;
  onChange?: (value: GeoValues) => void;
  fetchCountries: () => Promise<ICountry[]>;
  fetchStates: (country: string) => Promise<IState[]>;
  fetchCities: (country: string, state: string) => Promise<ICity[]>;
}

export function GeoSelector({
  fetchCountries,
  fetchStates,
  fetchCities,
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

  const _fetchCountries = useCallback(async () => {
    const data = await fetchCountries();
    return data.map((item: any) => ({
      ...item,
    }));
  }, [fetchCountries]);

  const _fetchStates = useCallback(async () => {
    if (!value.country) return [];
    const data = await fetchStates(value.country);
    return data.map((item: any) => ({
      ...item,
    }));
  }, [value.country, fetchStates]);

  const _fetchCities = useCallback(async () => {
    if (!value.country || !value.state) return [];
    return fetchCities(value.country, value.state);
  }, [value.country, value.state, fetchCities]);

  return (
    <div className="space-y-4 w-full max-w-sm">
      <AsyncCombobox
        label="国家"
        value={value.country}
        fetcher={_fetchCountries}
        onSelect={handleCountryChange}
        showFlag
      />

      <AsyncCombobox
        label="省/州"
        value={value.state}
        dependency={value.country}
        disabled={!value.country}
        fetcher={_fetchStates}
        onSelect={handleStateChange}
      />

      <AsyncCombobox
        label="城市"
        value={value.city}
        dependency={value.state}
        disabled={!value.state}
        fetcher={_fetchCities}
        onSelect={handleCityChange}
      />
    </div>
  );
}
