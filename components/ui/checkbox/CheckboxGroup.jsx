"use client";

import { cn } from "@/lib/utils";
import { Checkbox } from "./Checkbox";
import { useState, useEffect, forwardRef } from "react";

const CheckboxGroup = forwardRef(
  (
    {
      label,
      error,
      onChange,
      className,
      helperText,
      value = [],
      options = [],
      onValueChange,
      defaultValue = [],
      fullWidth = false,
      orientation = "vertical",
      ...props
    },
    ref,
  ) => {
    const [selectedValues, setSelectedValues] = useState(
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [],
    );

    useEffect(() => {
      if (
        value !== undefined &&
        JSON.stringify(value) !== JSON.stringify(selectedValues)
      ) {
        setSelectedValues(Array.isArray(value) ? value : []);
      }
    }, [value]);

    const handleCheckboxChange = (optionValue, isChecked) => {
      let newSelectedValues;
      if (isChecked) {
        newSelectedValues = [...selectedValues, optionValue];
      } else {
        newSelectedValues = selectedValues.filter((val) => val !== optionValue);
      }
      if (value === undefined) {
        setSelectedValues(newSelectedValues);
      }
      if (onChange) {
        const syntheticEvent = {
          target: { value: newSelectedValues },
        };
        onChange(syntheticEvent);
      }
      if (onValueChange) {
        onValueChange(newSelectedValues);
      }
    };

    return (
      <div
        className={cn(
          "flex flex-col gap-1.5",
          fullWidth && "w-full",
          className,
        )}
      >
        {label && (
          <label className="text-sm font-medium text-gray-700 ">{label}</label>
        )}

        <div
          className={cn(
            "flex gap-3 my-1",
            orientation === "vertical" ? "flex-col" : "flex-wrap",
          )}
        >
          {options.map((option) => (
            <Checkbox
              key={option.value}
              checked={selectedValues.includes(option.value)}
              label={option.label}
              disabled={option.disabled}
              onValueChange={(isChecked) =>
                handleCheckboxChange(option.value, isChecked)
              }
              {...props}
            />
          ))}
        </div>

        {helperText && !error && (
          <p className="text-xs text-gray-500 ">{helperText}</p>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

CheckboxGroup.displayName = "CheckboxGroup";

export { CheckboxGroup };
