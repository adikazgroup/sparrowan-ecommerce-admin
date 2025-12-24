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
  isBefore,
  isWithinInterval,
} from "date-fns";

const DateRangePicker = forwardRef(
  (
    {
      className,
      value = { start: null, end: null },
      onChange,
      placeholder = "Select date range",
      format: dateFormat = "yyyy-MM-dd",
      separator = " - ",
      minDate,
      maxDate,
      disabled = false,
      readOnly = false,
      showClearButton = true,
      highlightToday = true,
      allowManualInput = true,
      label,
      error,
      helperText,
      fullWidth = false,
      startIcon,
      align = "left-0",
      endIcon,
      ...props
    },
    ref,
  ) => {
    const [dateRange, setDateRange] = useState({
      start: value.start ? new Date(value.start) : null,
      end: value.end ? new Date(value.end) : null,
    });
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(
      dateRange.start || new Date(),
    );
    const [nextMonth, setNextMonth] = useState(addMonths(currentMonth, 1));
    const [selectingStart, setSelectingStart] = useState(true);
    const [hoverDate, setHoverDate] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const calendarRef = useRef(null);
    const inputRef = useRef(null);

    // Check if screen is mobile
    useEffect(() => {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth < 764);
      };

      // Initial check
      checkIsMobile();

      // Add event listener for window resize
      window.addEventListener("resize", checkIsMobile);

      // Cleanup
      return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    // Format the input value based on the date range
    const formatInputValue = (range) => {
      if (range.start && range.end) {
        return `${format(range.start, dateFormat)}${separator}${format(range.end, dateFormat)}`;
      } else if (range.start) {
        return `${format(range.start, dateFormat)}${separator}...`;
      }
      return "";
    };

    // Update internal state when value prop changes
    useEffect(() => {
      const newRange = {
        start: value.start ? new Date(value.start) : null,
        end: value.end ? new Date(value.end) : null,
      };
      setDateRange(newRange);
      setInputValue(formatInputValue(newRange));
      if (newRange.start) {
        setCurrentMonth(newRange.start);
        setNextMonth(addMonths(newRange.start, 1));
      }
    }, [value, dateFormat, separator]);

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
      let newRange = { ...dateRange };

      if (
        selectingStart ||
        !dateRange.start ||
        (dateRange.start && dateRange.end)
      ) {
        // Start a new selection
        newRange = { start: date, end: null };
        setSelectingStart(false);
      } else {
        // Complete the selection
        if (isBefore(date, dateRange.start)) {
          // If selected date is before start date, swap them
          newRange = { start: date, end: dateRange.start };
        } else {
          newRange = { start: dateRange.start, end: date };
        }
        setSelectingStart(true);
        setIsOpen(false);
      }

      setDateRange(newRange);
      setInputValue(formatInputValue(newRange));

      if (onChange) {
        onChange(newRange);
      }
    };

    // Handle input change for manual date entry
    const handleInputChange = (e) => {
      const value = e.target.value;
      setInputValue(value);

      // Try to parse the date range
      if (value.includes(separator)) {
        try {
          const [startStr, endStr] = value.split(separator);

          if (startStr && endStr) {
            const parsedStart = parse(startStr.trim(), dateFormat, new Date());
            const parsedEnd = parse(endStr.trim(), dateFormat, new Date());

            if (isValid(parsedStart) && isValid(parsedEnd)) {
              const newRange = { start: parsedStart, end: parsedEnd };
              setDateRange(newRange);
              if (onChange) {
                onChange(newRange);
              }
            }
          }
        } catch (error) {
          // Invalid date format, just update the input
        }
      }
    };

    // Handle input blur for validation
    const handleInputBlur = () => {
      if (inputValue === "") {
        setDateRange({ start: null, end: null });
        if (onChange) {
          onChange({ start: null, end: null });
        }
        return;
      }

      // Reformat the input to ensure it's consistent
      setInputValue(formatInputValue(dateRange));
    };

    // Clear the selected date range
    const handleClear = (e) => {
      e.stopPropagation();
      setDateRange({ start: null, end: null });
      setInputValue("");
      setSelectingStart(true);
      if (onChange) {
        onChange({ start: null, end: null });
      }
    };

    // Navigate to previous month
    const prevMonth = () => {
      setCurrentMonth(subMonths(currentMonth, 1));
      setNextMonth(subMonths(nextMonth, 1));
    };

    // Navigate to next month
    const nextMonthHandler = () => {
      setCurrentMonth(addMonths(currentMonth, 1));
      setNextMonth(addMonths(nextMonth, 1));
    };

    // Navigate to previous year
    const prevYear = () => {
      setCurrentMonth(subYears(currentMonth, 1));
      setNextMonth(subYears(nextMonth, 1));
    };

    // Navigate to next year
    const nextYear = () => {
      setCurrentMonth(addYears(currentMonth, 1));
      setNextMonth(addYears(nextMonth, 1));
    };

    // Handle mouse hover on dates
    const handleDateHover = (date) => {
      if (!selectingStart && dateRange.start && !dateRange.end) {
        setHoverDate(date);
      }
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
      setHoverDate(null);
    };

    // Generate calendar days for a specific month
    const generateCalendarDays = (month) => {
      const year = month.getFullYear();
      const monthIndex = month.getMonth();

      // First day of the month
      const firstDayOfMonth = new Date(year, monthIndex, 1);
      // Last day of the month
      const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

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
        const date = new Date(year, monthIndex, day);
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

    // Check if a date is in the selected range
    const isInRange = (date) => {
      if (!date || !dateRange.start || !dateRange.end) return false;

      return isWithinInterval(date, {
        start: dateRange.start,
        end: dateRange.end,
      });
    };

    // Check if a date is the start of the range
    const isRangeStart = (date) => {
      if (!date || !dateRange.start) return false;
      return isSameDay(date, dateRange.start);
    };

    // Check if a date is the end of the range
    const isRangeEnd = (date) => {
      if (!date || !dateRange.end) return false;
      return isSameDay(date, dateRange.end);
    };

    // Check if a date is in the hover range
    const isInHoverRange = (date) => {
      if (!date || !dateRange.start || !hoverDate || selectingStart)
        return false;

      // If hovering over a date before the start date
      if (isBefore(hoverDate, dateRange.start)) {
        return isWithinInterval(date, {
          start: hoverDate,
          end: dateRange.start,
        });
      }

      // If hovering over a date after the start date
      return isWithinInterval(date, { start: dateRange.start, end: hoverDate });
    };

    // Days of the week
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    // Render a calendar month
    const renderCalendarMonth = (month, monthTitle) => (
      <div>
        <div className="text-sm font-medium mb-2 text-center">{monthTitle}</div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {daysOfWeek.map((day) => (
            <div
              key={`${monthTitle}-${day}`}
              className="text-center text-xs font-medium text-gray-500 py-1 dark:text-gray-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1" onMouseLeave={handleMouseLeave}>
          {generateCalendarDays(month).map((date, index) => (
            <div key={`${monthTitle}-${index}`} className="text-center">
              {date ? (
                <button
                  type="button"
                  onClick={() =>
                    !isDateDisabled(date) && handleDateSelect(date)
                  }
                  onMouseEnter={() =>
                    !isDateDisabled(date) && handleDateHover(date)
                  }
                  onMouseLeave={handleMouseLeave}
                  className={cn(
                    "w-8 h-8 rounded-full text-sm flex items-center justify-center",
                    isDateDisabled(date) &&
                      "text-gray-300 cursor-not-allowed dark:text-gray-600",
                    !isDateDisabled(date) &&
                      !isRangeStart(date) &&
                      "hover:bg-gray-100 dark:hover:bg-gray-700",
                    isRangeStart(date) &&
                      "bg-primary text-white hover:bg-primary rounded-l-full",
                    isRangeEnd(date) &&
                      "bg-primary text-white hover:bg-primary/90 rounded-r-full",
                    isInRange(date) &&
                      !isRangeStart(date) &&
                      !isRangeEnd(date) &&
                      "bg-primary/20 text-primary",
                    !isInRange(date) &&
                      !isRangeStart(date) &&
                      isInHoverRange(date) &&
                      "bg-primary/10 text-primary",
                    highlightToday &&
                      isToday(date) &&
                      !isInRange(date) &&
                      !isRangeStart(date) &&
                      !isRangeEnd(date) &&
                      !isInHoverRange(date) &&
                      "border border-primary text-primary",
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
      </div>
    );

    return (
      <div
        className={cn("relative", fullWidth && "w-full", className)}
        ref={calendarRef}
      >
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {startIcon}
            </div>
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
                "flex h-10 w-full rounded-md border border-input bg-white dark:bg-transparent dark:border-[#4b6385] px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50 pl-10",
                (endIcon || (showClearButton && inputValue)) && "pr-10",
                error && "border-red-500",
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
        </div>

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}

        <div
          className={`absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3 dark:bg-gray-800 dark:border-gray-700 ani3 ${align} ${isOpen && !disabled && !readOnly ? "visible opacity-100 mt-0" : "invisible opacity-0 mt-5"}`}
          style={{ width: isMobile ? "300px" : "580px" }}
        >
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-4">
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
              {selectingStart ? "Select Start Date" : "Select End Date"}
            </div>

            <div className="flex items-center">
              <button
                type="button"
                onClick={nextMonthHandler}
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

          {/* Responsive calendar view - single or dual based on screen size */}
          <div
            className={isMobile ? "grid grid-cols-1" : "grid grid-cols-2 gap-4"}
          >
            {renderCalendarMonth(
              currentMonth,
              format(currentMonth, "MMMM yyyy"),
            )}
            {!isMobile &&
              renderCalendarMonth(nextMonth, format(nextMonth, "MMMM yyyy"))}
          </div>

          {/* Footer with clear and apply buttons */}
          <div className="mt-4 flex justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Clear
            </button>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              {dateRange.start && (
                <span>
                  {format(dateRange.start, dateFormat)}
                  {dateRange.end && ` - ${format(dateRange.end, dateFormat)}`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

DateRangePicker.displayName = "DateRangePicker";

export { DateRangePicker };
