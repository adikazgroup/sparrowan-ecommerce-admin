"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, forwardRef, useRef } from "react";

const Textarea = forwardRef(
  (
    {
      className,
      label,
      helperText,
      error,
      fullWidth = false,
      startIcon,
      endIcon,
      onValueChange,
      onChange,
      value,
      defaultValue,
      requiredSign = false,
      required = false,
      minRows = 3,
      maxRows = 8,
      autoResize = true,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState(value || defaultValue || "");
    const textareaRef = useRef(null);

    useEffect(() => {
      if (value !== undefined && value !== inputValue) {
        setInputValue(value);
        if (autoResize) {
          adjustHeight();
        }
      }
    }, [value, inputValue, autoResize]);

    useEffect(() => {
      if (autoResize) {
        adjustHeight();
      }
    }, [inputValue, autoResize]);

    const handleChange = (e) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onChange?.(e);
      onValueChange?.(newValue);
    };

    const adjustHeight = () => {
      if (!textareaRef.current) return;

      // Reset height to calculate the right height
      textareaRef.current.style.height = "auto";

      // Calculate the scroll height
      const scrollHeight = textareaRef.current.scrollHeight;

      // Calculate min and max heights based on line height (approx 20px per line)
      const lineHeight = 20;
      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows * lineHeight;

      // Set the height based on content, but within min/max constraints
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
      textareaRef.current.style.height = `${newHeight}px`;
    };

    // Combine refs
    const combinedRef = (node) => {
      textareaRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
        {label && (
          <label className="text-sm font-medium dark:font-[350] text-gray-700 dark:text-gray-100">
            {label}
            {required ||
              (requiredSign && <span className="text-red-500 ml-1">*</span>)}
          </label>
        )}

        <div className="relative flex items-start">
          {startIcon && (
            <div className="absolute left-3 top-3 flex items-center pointer-events-none text-gray-500">
              <span className="pointer-events-auto">{startIcon}</span>
            </div>
          )}

          <textarea
            className={cn(
              "flex w-full rounded-md border border-input dark:border-[#0066d27c] dark:font-[350] bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none",
              startIcon && "pl-10",
              endIcon && "pr-10",
              error && "border-red-500",
              className
            )}
            value={inputValue}
            onChange={handleChange}
            ref={combinedRef}
            required={required}
            rows={minRows}
            style={{ minHeight: `${minRows * 20}px` }}
            {...props}
          />

          {endIcon && (
            <div className="absolute right-3 top-3 flex items-center pointer-events-none text-gray-500">
              <span className="pointer-events-auto">{endIcon}</span>
            </div>
          )}
        </div>

        {helperText && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
