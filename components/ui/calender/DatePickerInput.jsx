"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "./Calendar";
import { DateRangePicker } from "./DateRangePicker";

const DatePickerInput = forwardRef(
  (
    {
      className,
      type = "single", // 'single' or 'range'
      value,
      onChange,
      label,
      error,
      helperText,
      fullWidth = false,
      disabled = false,
      readOnly = false,
      format = "yyyy-MM-dd",
      placeholder,
      minDate,
      maxDate,
      ...props
    },
    ref,
  ) => {
    // Handle single date value
    const handleSingleDateChange = (date) => {
      if (onChange) {
        onChange(date);
      }
    };

    // Handle date range value
    const handleRangeChange = (range) => {
      if (onChange) {
        onChange(range);
      }
    };

    return (
      <div className={cn(fullWidth && "w-full", className)}>
        {type === "single" ? (
          <Calendar
            ref={ref}
            value={value}
            onChange={handleSingleDateChange}
            label={label}
            error={error}
            helperText={helperText}
            fullWidth={fullWidth}
            disabled={disabled}
            readOnly={readOnly}
            format={format}
            placeholder={placeholder || "Select date"}
            minDate={minDate}
            maxDate={maxDate}
            {...props}
          />
        ) : (
          <DateRangePicker
            ref={ref}
            value={value}
            onChange={handleRangeChange}
            label={label}
            error={error}
            helperText={helperText}
            fullWidth={fullWidth}
            disabled={disabled}
            readOnly={readOnly}
            format={format}
            placeholder={placeholder || "Select date range"}
            minDate={minDate}
            maxDate={maxDate}
            {...props}
          />
        )}
      </div>
    );
  },
);

DatePickerInput.displayName = "DatePickerInput";

export { DatePickerInput };
