"use client";
import { buttonVariants } from "@repo/share-ui/components/reui/base-button";
import {
  Menu,
  MenuArrow,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuPortal,
  MenuPositioner,
  MenuSeparator,
  MenuShortcut,
  MenuSubmenuRoot,
  MenuSubmenuTrigger,
  MenuTrigger,
} from "@repo/share-ui/components/reui/base-menu";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

export type Option = {
  value: string;
  label: string;
  children?: Option[];
};

type CascaderProps = {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
};

const renderOptions = (
  options: Option[],
  path: string[],
  onChange: (value: string[]) => void,
  selectedValue: string[],
) => {
  return options.map((option) => {
    const isLeaf = !option.children || option.children.length === 0;
    const currentPath = [...path, option.value];
    const depth = path.length;
    // Check if the current option value matches the value at the current depth of selectedValue
    const isPathMatch = selectedValue?.[depth] === option.value;

    // For a leaf, it is selected if it matches and the lengths are same (implies full path match)
    const isLeafSelected = isLeaf && isPathMatch && selectedValue.length === currentPath.length;

    if (!isLeaf) {
      return (
        <MenuSubmenuRoot key={option.value}>
          <MenuSubmenuTrigger className={isPathMatch ? "text-primary font-medium" : ""}>
            {option.label}
          </MenuSubmenuTrigger>
          <MenuPortal>
            <MenuContent>{renderOptions(option.children!, currentPath, onChange, selectedValue)}</MenuContent>
          </MenuPortal>
        </MenuSubmenuRoot>
      );
    }

    return (
      <MenuItem
        key={option.value}
        onSelect={() => {
          onChange(currentPath);
        }}
        className="justify-between"
      >
        <span className={isLeafSelected ? "text-primary font-medium" : ""}>{option.label}</span>
        {isLeafSelected && <Check className="ml-2 h-4 w-4" />}
      </MenuItem>
    );
  });
};

const getDisplayLabel = (options: Option[], value: string[]): string => {
  if (!value || value.length === 0) return "";

  const labels: string[] = [];
  let currentOptions = options;

  for (const v of value) {
    const option = currentOptions.find((o) => o.value === v);
    if (option) {
      labels.push(option.label);
      currentOptions = option.children || [];
    } else {
      break;
    }
  }

  return labels.join(" / ");
};

export const Cascader: React.FC<CascaderProps> = ({ options, value, onChange, placeholder = "请选择" }) => {
  const displayLabel = getDisplayLabel(options, value);

  return (
    <Menu>
      <MenuTrigger className={`${buttonVariants({ variant: "outline" })} w-full justify-between font-normal`}>
        {displayLabel || <span className="text-muted-foreground">{placeholder}</span>}
        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
      </MenuTrigger>
      <MenuContent>{renderOptions(options, [], onChange, value)}</MenuContent>
    </Menu>
  );
};
