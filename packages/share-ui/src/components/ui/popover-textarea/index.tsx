"use client";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/share-ui/components/reui/base-popover";
import { Button } from "@repo/share-ui/components/reui/button";
import { Textarea } from "@repo/share-ui/components/reui/textarea";
import { useState } from "react";

export type PopoverTextareaProps = {
  trigger: React.ReactElement<Record<string, unknown>>;
  placeholder?: string;
  onSubmit: (value: string) => void;
  submitButtonText?: string;
};

export function PopoverTextarea({ trigger, placeholder, onSubmit, submitButtonText = "提交" }: PopoverTextareaProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    onSubmit(value);
    setValue("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger as React.ReactElement<Record<string, unknown>>}></PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex flex-col gap-2">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button onClick={handleSubmit} disabled={!value.trim()} className="self-end">
            {submitButtonText}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
