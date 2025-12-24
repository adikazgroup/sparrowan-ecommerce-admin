"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import { cn } from "@/lib/utils";
import {
  LuCalendar,
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
  LuX,
} from "react-icons/lu";
import {
  format,
  parse,
  addMonths,
  subMonths,
  addYears,
  subYears,
  isValid,
  isToday,
  isSameDay,
} from "date-fns";

const Calendar = forwardRef(
  (
    {
      className,
      value,
      onChange,
      placeholder = "Select date",
      format: dateFormat = "yyyy-MM-dd",
      minDate,
      maxDate,
      disabled = false,
      readOnly = false,
      showClearButton = true,
      showTodayButton = true,
      highlightToday = true,
      allowManualInput = true,
      label,
      error,
      helperText,
      fullWidth = false,
      startIcon,
      inputClass,
      upper = false,
      requiredSign = false,
      endIcon,
      ...props
    },
    ref
  ) => {
    const [selectedDate, setSelectedDate] = useState(
      value ? new Date(value) : null
    );
    const [inputValue, setInputValue] = useState(
      value ? format(new Date(value), dateFormat) : ""
    );
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(
      selectedDate || new Date()
    );
    const calendarRef = useRef(null);
    const inputRef = useRef(null);

    // Update internal state when value prop changes
    useEffect(() => {
      if (value) {
        const date = new Date(value);
        setSelectedDate(date);
        setInputValue(format(date, dateFormat));
        setCurrentMonth(date);
      } else {
        setSelectedDate(null);
        setInputValue("");
      }
    }, [value, dateFormat]);

    // Handle click outside to close the calendar
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          calendarRef.current &&
          !calendarRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Handle date selection
    const handleDateSelect = (date) => {
      setSelectedDate(date);
      setInputValue(format(date, dateFormat));
      setIsOpen(false);

      if (onChange) {
        onChange(date);
      }
    };

    // Handle input change for manual date entry
    const handleInputChange = (e) => {
      const value = e.target.value;
      setInputValue(value);

      // Try to parse the date
      try {
        const parsedDate = parse(value, dateFormat, new Date());
        if (isValid(parsedDate)) {
          setSelectedDate(parsedDate);
          if (onChange) {
            onChange(parsedDate);
          }
        }
      } catch (error) {
        // Invalid date format, just update the input
      }
    };

    // Handle input blur for validation
    const handleInputBlur = () => {
      if (inputValue === "") {
        setSelectedDate(null);
        if (onChange) {
          onChange(null);
        }
        return;
      }

      try {
        const parsedDate = parse(inputValue, dateFormat, new Date());
        if (isValid(parsedDate)) {
          setSelectedDate(parsedDate);
          setInputValue(format(parsedDate, dateFormat));
          if (onChange) {
            onChange(parsedDate);
          }
        } else {
          // Invalid date, revert to previous value
          if (selectedDate) {
            setInputValue(format(selectedDate, dateFormat));
          } else {
            setInputValue("");
          }
        }
      } catch (error) {
        // Invalid date format, revert to previous value
        if (selectedDate) {
          setInputValue(format(selectedDate, dateFormat));
        } else {
          setInputValue("");
        }
      }
    };

    // Clear the selected date
    const handleClear = (e) => {
      e.stopPropagation();
      setSelectedDate(null);
      setInputValue("");
      if (onChange) {
        onChange(null);
      }
    };

    // Navigate to previous month
    const prevMonth = () => {
      setCurrentMonth(subMonths(currentMonth, 1));
    };

    // Navigate to next month
    const nextMonth = () => {
      setCurrentMonth(addMonths(currentMonth, 1));
    };

    // Navigate to previous year
    const prevYear = () => {
      setCurrentMonth(subYears(currentMonth, 1));
    };

    // Navigate to next year
    const nextYear = () => {
      setCurrentMonth(addYears(currentMonth, 1));
    };

    // Go to today
    const goToToday = () => {
      const today = new Date();
      setCurrentMonth(today);
      if (showTodayButton) {
        handleDateSelect(today);
      }
    };

    // Generate calendar days
    const generateCalendarDays = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();

      // First day of the month
      const firstDayOfMonth = new Date(year, month, 1);
      // Last day of the month
      const lastDayOfMonth = new Date(year, month + 1, 0);

      // Day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
      const firstDayOfWeek = firstDayOfMonth.getDay();

      // Total days in the month
      const daysInMonth = lastDayOfMonth.getDate();

      // Array to hold all calendar days
      const calendarDays = [];

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDayOfWeek; i++) {
        calendarDays.push(null);
      }

      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        calendarDays.push(date);
      }

      return calendarDays;
    };

    // Check if a date is disabled
    const isDateDisabled = (date) => {
      if (!date) return false;

      if (minDate && date < new Date(minDate)) {
        return true;
      }

      if (maxDate && date > new Date(maxDate)) {
        return true;
      }

      return false;
    };

    // Days of the week
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    return (
      <div className={cn("relative", fullWidth && "w-full", className)}>
        {label && (
          <label className="text-sm font-medium  text-gray-700 dark:text-gray-100 ">
            {label}
            {requiredSign && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <input
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            type="text"
            className={cn(
              "flex h-12 w-full rounded-md border border-input dark:border-[#475569] bg-background dark:bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50 pl-10",
              inputClass,
              (endIcon || (showClearButton && inputValue)) && "pr-10",
              error && "border-red-500"
            )}
            placeholder={placeholder}
            value={inputValue}
            onChange={allowManualInput ? handleInputChange : undefined}
            onBlur={handleInputBlur}
            onClick={() => !disabled && !readOnly && setIsOpen(true)}
            readOnly={!allowManualInput || readOnly}
            disabled={disabled}
            {...props}
          />

          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer">
              {startIcon}
            </div>
          )}

          {!startIcon && (
            <div
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={() => !disabled && !readOnly && setIsOpen(true)}
            >
              <LuCalendar className="h-4 w-4" />
            </div>
          )}

          {inputValue && showClearButton && !disabled && !readOnly ? (
            <div
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={handleClear}
            >
              <LuX className="h-4 w-4" />
            </div>
          ) : (
            endIcon && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {endIcon}
              </div>
            )
          )}
        </div>

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}

        <div
          ref={calendarRef}
          className={`absolute  z-50 mt-1 bg-white  border border-gray-200 rounded-md shadow-lg p-3 w-[280px] dark:bg-gray-800 dark:border-gray-700 ani3 ${upper && "bottom-14"} ${isOpen && !disabled && !readOnly ? "visible opacity-100 mt-0" : "invisible opacity-0 mt-5"}`}
        >
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <button
                type="button"
                onClick={prevYear}
                className="p-1 hover:bg-gray-100 rounded-md dark:hover:bg-gray-700"
                aria-label="Previous Year"
              >
                <LuChevronsLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 hover:bg-gray-100 rounded-md dark:hover:bg-gray-700"
                aria-label="Previous Month"
              >
                <LuChevronLeft className="h-4 w-4" />
              </button>
            </div>

            <div className="text-sm font-medium">
              {format(currentMonth, "MMMM yyyy")}
            </div>

            <div className="flex items-center">
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 hover:bg-gray-100 rounded-md dark:hover:bg-gray-700"
                aria-label="Next Month"
              >
                <LuChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextYear}
                className="p-1 hover:bg-gray-100 rounded-md dark:hover:bg-gray-700"
                aria-label="Next Year"
              >
                <LuChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 py-1 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((date, index) => (
              <div key={index} className="text-center">
                {date ? (
                  <button
                    type="button"
                    onClick={() =>
                      !isDateDisabled(date) && handleDateSelect(date)
                    }
                    className={cn(
                      "w-8 h-8 rounded-full text-sm flex items-center justify-center",
                      isDateDisabled(date) &&
                        "text-gray-300 cursor-not-allowed dark:text-gray-600",
                      !isDateDisabled(date) &&
                        "hover:bg-gray-100 dark:hover:bg-gray-700",
                      selectedDate &&
                        isSameDay(date, selectedDate) &&
                        "bg-primary text-white hover:bg-primary/90",
                      highlightToday &&
                        isToday(date) &&
                        !isSameDay(date, selectedDate) &&
                        "border border-primary text-primary"
                    )}
                    disabled={isDateDisabled(date)}
                  >
                    {date.getDate()}
                  </button>
                ) : (
                  <div className="w-8 h-8"></div>
                )}
              </div>
            ))}
          </div>

          {/* Today button */}
          {showTodayButton && (
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={goToToday}
                className="text-xs text-primary hover:underline"
              >
                Today
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Calendar.displayName = "Calendar";

export { Calendar };
