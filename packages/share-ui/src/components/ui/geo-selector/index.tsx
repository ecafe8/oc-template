"use client"

import * as React from "react"
import { getCountries, getStatesOfCountry, getCitiesOfState } from '@countrystatecity/countries'

import CountryFlag from "@repo/share-ui/components/ui/country-flag"
import { type ComboboxOption, ResponsiveCombobox } from "@repo/share-ui/components/ui/responsive-combobox"

interface GeoOption {
  id: number | string
  name: string
  countryCode?: string
  emoji?: string
}

// --- 内部封装：适配 reui 的异步搜索组件 ---
export function ReuiAsyncCombobox({
  label,
  value,
  onSelect,
  fetcher,
  dependency,
  disabled = false,
  showFlag = false,
}: {
  label: string
  value: string
  onSelect: (val: string) => void
  fetcher: () => Promise<GeoOption[]>
  dependency?: string
  disabled?: boolean
  showFlag?: boolean
}) {
  const [options, setOptions] = React.useState<ComboboxOption[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (disabled) {
      setOptions([])
      return
    }

    const loadData = async () => {
      setLoading(true)
      try {
        const data = await fetcher()
        setOptions(
          data.map((opt) => {
            const internalValue = opt.countryCode || opt.name
            return {
              value: internalValue,
              label: (
                <span className="flex items-center gap-2">
                  {showFlag && opt.countryCode ? (
                    <CountryFlag countryCode={opt.countryCode} className="w-6 object-contain" />
                  ) : (
                    opt.emoji
                  )}
                  {opt.name}
                </span>
              ),
              keywords: [opt.name],
            }
          })
        )
      } catch (error) {
        console.error(`Fetch error [${label}]:`, error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [dependency, disabled])

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
  )
}

// --- 导出的业务组件 ---
export interface GeoValues {
  country: string
  state: string
  city: string
}

interface GeoSelectorProps {
  value?: GeoValues
  defaultValue?: GeoValues
  onChange?: (value: GeoValues) => void
}

export function GeoSelector({ value: valueProp, defaultValue, onChange }: GeoSelectorProps) {
  const [internalValue, setInternalValue] = React.useState<GeoValues>(
    defaultValue || { country: "", state: "", city: "" }
  )

  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : internalValue

  const handleCountryChange = (val: string) => {
    const newValue = { country: val, state: "", city: "" }
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  const handleStateChange = (val: string) => {
    const newValue = { ...value, state: val, city: "" }
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  const handleCityChange = (val: string) => {
    const newValue = { ...value, city: val }
    if (!isControlled) {
      setInternalValue(newValue)
    }
    onChange?.(newValue)
  }

  return (
    <div className="space-y-4 w-full max-w-sm">
      <ReuiAsyncCombobox
        label="国家"
        value={value.country}
        fetcher={() => getCountries()}
        onSelect={handleCountryChange}
      />

      <ReuiAsyncCombobox
        label="省/州"
        value={value.state}
        dependency={value.country}
        disabled={!value.country}
        fetcher={() => getStatesOfCountry(value.country)}
        onSelect={handleStateChange}
      />

      <ReuiAsyncCombobox
        label="城市"
        value={value.city}
        dependency={value.state}
        disabled={!value.state}
        fetcher={() => getCitiesOfState(value.country, value.state)}
        onSelect={handleCityChange}
      />
    </div>
  )
}
