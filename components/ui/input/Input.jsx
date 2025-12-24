"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, forwardRef } from "react";

const Input = forwardRef(
  (
    {
      className,
      type = "text",
      label,
      helperText,
      error,
      fullWidth = false,
      startIcon,
      endIcon,
      onValueChange,
      onChange,
      value,
      name,
      defaultValue,
      requiredSign = false,
      required = false,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState(value || defaultValue || "");

    useEffect(() => {
      if (value !== undefined && value !== inputValue) {
        setInputValue(value);
      }
    }, [value]);

    const handleChange = (e) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onChange?.(e);
      onValueChange?.(newValue);
    };

    return (
      <div className={cn("flex flex-col gap-1.5 ", fullWidth && "w-full")}>
        {label && (
          <label className="text-sm font-medium dark:font-[350] text-gray-700 dark:text-gray-100 ">
            {label}
            {requiredSign && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-gray-500">
              <span className="pointer-events-auto">{startIcon}</span>
            </div>
          )}

          <input
            type={type}
            name={name}
            autoComplete={name}
            className={cn(
              "flex h-10 w-full rounded-md border border-input dark:border-[#0066d27c] dark:font-[350] bg-transparent px-3 py-2 text-sm ring-offset-background  placeholder:text-muted-foreground focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50",
              startIcon && "pl-10",
              endIcon && "pr-10",
              error && "border-red-500 ",
              className
            )}
            value={inputValue}
            onChange={handleChange}
            ref={ref}
            required={required}
            {...props}
          />

          {endIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-gray-500">
              <span className="pointer-events-auto">{endIcon}</span>
            </div>
          )}
        </div>

        {helperText && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-400 ">
            {helperText}
          </p>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
