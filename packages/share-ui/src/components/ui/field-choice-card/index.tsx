import { RadioGroup, RadioGroupItem } from "@repo/share-ui/components/reui/radio-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@repo/share-ui/components/shadcn/field";
import React, { useId } from "react";

export type FieldChoiceOption = {
  label: React.ReactNode;
  value: string | number;
  description: React.ReactNode;
};

export type FieldChoiceCardProps = {
  title: React.ReactNode;
  description: React.ReactNode;
  value: string | number;
  options: FieldChoiceOption[];
  onChange?: (value: string | number) => void;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: React.ReactNode;
  className?: string;
  name?: string;
};

export function FieldChoiceCard({
  title,
  description,
  value,
  options,
  onChange,
  disabled = false,
  error = false,
  errorMessage,
  className = "w-full max-w-xs",
  name,
}: FieldChoiceCardProps) {
  const groupId = useId();

  const handleValueChange = (newValue: string): void => {
    const selectedValue = options.find((opt) => String(opt.value) === newValue)?.value;
    if (selectedValue !== undefined && onChange) {
      onChange(selectedValue);
    }
  };

  if (options.length === 0) {
    return (
      <FieldGroup className={className}>
        <FieldSet disabled={disabled}>
          <FieldLegend variant="label">{title}</FieldLegend>
          <FieldDescription>{description}</FieldDescription>
          <div className="text-sm text-muted-foreground">No options available.</div>
        </FieldSet>
      </FieldGroup>
    );
  }

  return (
    <FieldGroup className={className}>
      <FieldSet disabled={disabled}>
        <FieldLegend variant="label">{title}</FieldLegend>
        <FieldDescription>{description}</FieldDescription>
        <RadioGroup
          value={String(value)}
          onValueChange={handleValueChange}
          disabled={disabled}
          aria-labelledby={groupId}
          aria-invalid={error}
          aria-describedby={error && errorMessage ? `${groupId}-error` : undefined}
        >
          {options.map((option) => {
            const optionId = `${groupId}-${String(option.value)}`;
            return (
              <FieldLabel key={String(option.value)} htmlFor={optionId}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{option.label}</FieldTitle>
                    <FieldDescription>{option.description}</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value={String(option.value)} id={optionId} disabled={disabled} />
                </Field>
              </FieldLabel>
            );
          })}
        </RadioGroup>
        {error && errorMessage && (
          <div id={`${groupId}-error`} className="mt-2 text-sm text-destructive" role="alert">
            {errorMessage}
          </div>
        )}
        {name && <input type="hidden" name={name} value={value} />}
      </FieldSet>
    </FieldGroup>
  );
}
