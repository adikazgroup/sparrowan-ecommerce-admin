"use client";

import { useState, useEffect, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { LuCheck } from "react-icons/lu";

const Checkbox = forwardRef(
  (
    {
      className,
      label,
      helperText,
      error,
      fullWidth = false,
      disabled = false,
      indeterminate = false,
      checked,
      defaultChecked = false,
      onValueChange,
      onChange,
      id,
      size = "md",
      children,
      ...props
    },
    ref
  ) => {
    const [isChecked, setIsChecked] = useState(
      checked !== undefined ? checked : defaultChecked
    );

    useEffect(() => {
      if (checked !== undefined && checked !== isChecked) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleChange = (e) => {
      const newChecked = e.target.checked;

      if (checked === undefined) {
        setIsChecked(newChecked);
      }

      // Call both callbacks if provided
      if (onChange) {
        onChange(e);
      }

      if (onValueChange) {
        onValueChange(newChecked);
      }
    };

    return (
      <div className={cn("flex", fullWidth && "w-full", className)}>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              className="sr-only"
              id={id}
              checked={isChecked}
              disabled={disabled}
              onChange={handleChange}
              ref={ref}
              {...props}
            />
            <div
              className={cn(
                "flex items-center justify-center size-[1.15rem] border rounded transition-colors cursor-pointer",
                size === "sm" && "size-[1rem]",
                size === "lg" && "size-[1.5rem]",
                size === "md" && "size-[1.25rem]",
                isChecked
                  ? "bg-primary border-primary text-white"
                  : "bg-background dark:bg-transparent dark:border-darkMain border-input",
                disabled && "opacity-50 cursor-not-allowed",
                error && "border-red-500",
                !disabled && !isChecked && "hover:border-primary/50"
              )}
              onClick={() => {
                if (!disabled) {
                  const newChecked = !isChecked;

                  if (checked === undefined) {
                    setIsChecked(newChecked);
                  }

                  // Create a synthetic event
                  const syntheticEvent = {
                    target: { checked: newChecked },
                  };

                  if (onChange) {
                    onChange(syntheticEvent);
                  }

                  if (onValueChange) {
                    onValueChange(newChecked);
                  }
                }
              }}
            >
              {isChecked && !indeterminate && (
                <LuCheck className="w-3.5 h-3.5 text-primary-foreground" />
              )}
              {indeterminate && (
                <div className="w-2.5 h-0.5 bg-primary-foreground rounded-full" />
              )}
            </div>
          </div>

          {(label || children) && (
            <div className="ml-3 text-sm">
              <label
                className={cn(
                  "font-medium text-gray-700 dark:text-gray-400 dark:font-normal cursor-pointer",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => {
                  if (!disabled) {
                    const newChecked = !isChecked;

                    if (checked === undefined) {
                      setIsChecked(newChecked);
                    }

                    // Create a synthetic event
                    const syntheticEvent = {
                      target: { checked: newChecked },
                    };

                    if (onChange) {
                      onChange(syntheticEvent);
                    }

                    if (onValueChange) {
                      onValueChange(newChecked);
                    }
                  }
                }}
              >
                {label || children}
              </label>

              {helperText && !error && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {helperText}
                </p>
              )}

              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
