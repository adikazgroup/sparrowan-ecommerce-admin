"use client";

import { useState, useEffect, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Radio } from "./Radio";

const RadioGroup = forwardRef(
  (
    {
      label,
      error,
      name,
      onChange,
      className,
      value = "",
      helperText,
      options = [],
      onValueChange,
      defaultValue = "",
      fullWidth = false,
      orientation = "vertical",
      ...props
    },
    ref,
  ) => {
    const [selectedValue, setSelectedValue] = useState(
      value || defaultValue || "",
    );

    useEffect(() => {
      if (value !== undefined && value !== selectedValue) {
        setSelectedValue(value);
      }
    }, [value]);

    const handleRadioChange = (radioValue) => {
      if (value === undefined) {
        setSelectedValue(radioValue);
      }
      if (onChange) {
        const syntheticEvent = {
          target: { name, value: radioValue },
        };
        onChange(syntheticEvent);
      }

      if (onValueChange) {
        onValueChange(radioValue);
      }
    };

    return (
      <div
        className={cn(
          "flex flex-col gap-1.5",
          fullWidth && "w-full",
          className,
        )}
        ref={ref}
      >
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200 dark:font-normal ">
            {label}
          </label>
        )}

        <div
          className={cn(
            "flex gap-3 my-1",
            orientation === "vertical" ? "flex-col" : "flex-wrap",
          )}
          role="radiogroup"
        >
          {options.map((option) => (
            <Radio
              key={option.value}
              checked={selectedValue === option.value}
              value={option.value}
              name={name}
              label={option.label}
              disabled={option.disabled}
              onValueChange={handleRadioChange}
              {...props}
            >
              {option.icon && (
                <div className="flex items-center ">
                  {option.icon}
                  <span className="ml-2 ">{option.label}</span>
                </div>
              )}
            </Radio>
          ))}
        </div>

        {helperText && !error && (
          <p className="text-xs text-gray-500  ">{helperText}</p>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

RadioGroup.displayName = "RadioGroup";

export { RadioGroup };
