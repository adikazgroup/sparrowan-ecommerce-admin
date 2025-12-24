"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const Radio = forwardRef(
  (
    {
      name,
      label,
      error,
      value,
      checked,
      onChange,
      children,
      className,
      helperText,
      onValueChange,
      disabled = false,
      fullWidth = false,
      ...props
    },
    ref,
  ) => {
    const handleChange = (e) => {
      if (onChange) {
        onChange(e);
      }

      if (onValueChange) {
        onValueChange(e.target.value);
      }
    };

    return (
      <div
        className={cn("flex", fullWidth && "w-full", className)}
        onClick={() => {
          if (!disabled) {
            if (onChange) {
              const syntheticEvent = {
                target: { name, value, checked: true },
              };
              onChange(syntheticEvent);
            }

            if (onValueChange) {
              onValueChange(value);
            }
          }
        }}
      >
        <div className="flex items-start">
          <div className="flex items-center h-5 cursor-pointer">
            <input
              type="radio"
              className="sr-only"
              checked={checked}
              disabled={disabled}
              value={value}
              name={name}
              onChange={handleChange}
              ref={ref}
              {...props}
            />
            <div
              className={cn(
                "flex items-center justify-center w-[18px] h-[18px] rounded-full border transition-colors",
                checked ? "border-primary" : "border-input",
                disabled && "opacity-50 cursor-not-allowed",
                error && "border-red-500",
                !disabled && !checked && "hover:border-primary/50",
              )}
            >
              {checked && (
                <div className="size-[12px] rounded-full bg-primary" />
              )}
            </div>
          </div>

          {(label || children) && (
            <div className="ml-3 text-sm">
              <label
                className={cn(
                  "font-medium text-gray-700 dark:text-gray-200 cursor-pointer",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
                onClick={() => {
                  if (!disabled) {
                    if (onChange) {
                      const syntheticEvent = {
                        target: { name, value, checked: true },
                      };
                      onChange(syntheticEvent);
                    }

                    if (onValueChange) {
                      onValueChange(value);
                    }
                  }
                }}
              >
                {label || children}
              </label>

              {helperText && !error && (
                <p className="text-xs text-gray-500  mt-1">{helperText}</p>
              )}

              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
          )}
        </div>
      </div>
    );
  },
);

Radio.displayName = "Radio";

export { Radio };
