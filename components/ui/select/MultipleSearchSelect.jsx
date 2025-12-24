"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, forwardRef } from "react";
import { LuChevronUp, LuCheck, LuSearch, LuX, LuPlus } from "react-icons/lu";

const MultipleSearchSelect = forwardRef(
  (
    {
      className,
      label,
      helperText,
      error,
      fullWidth = false,
      startIcon,
      endIcon,
      options = [],
      placeholder = "Select options",
      searchPlaceholder = "Search...",
      onValueChange,
      onChange,
      value = [],
      defaultValue = [],
      optionRenderer,
      maxItems = Number.POSITIVE_INFINITY,
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
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef(null);
    const optionsRef = useRef(null);
    const searchInputRef = useRef(null);
    const triggerRef = useRef(null);

    // Find the selected options to display
    const selectedOptions = options.filter((option) =>
      selectedValues.includes(option.value),
    );

    const filteredOptions = options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedValues.length < maxItems ||
          selectedValues.includes(option.value)),
    );

    useEffect(() => {
      if (
        value !== undefined &&
        JSON.stringify(value) !== JSON.stringify(selectedValues)
      ) {
        setSelectedValues(Array.isArray(value) ? value : []);
      }
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
          setSearchQuery("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current.focus();
        }, 10);
      }
    }, [isOpen]);

    const handleOptionToggle = (optionValue) => {
      let newSelectedValues;

      if (selectedValues.includes(optionValue)) {
        newSelectedValues = selectedValues.filter((v) => v !== optionValue);
      } else if (selectedValues.length < maxItems) {
        newSelectedValues = [...selectedValues, optionValue];
      } else {
        return;
      }
      setSelectedValues(newSelectedValues);
      if (onChange) {
        const syntheticEvent = { target: { value: newSelectedValues } };
        onChange(syntheticEvent);
      }

      if (onValueChange) {
        onValueChange(newSelectedValues);
      }

      console.log("Selected values after toggle:", newSelectedValues);
    };

    const handleRemoveValue = (optionValue, e) => {
      e.stopPropagation();

      const newSelectedValues = selectedValues.filter((v) => v !== optionValue);

      setSelectedValues(newSelectedValues);

      if (onChange) {
        const syntheticEvent = { target: { value: newSelectedValues } };
        onChange(syntheticEvent);
      }
      if (onValueChange) {
        onValueChange(newSelectedValues);
      }

      console.log("Selected values after remove:", newSelectedValues);
    };

    const handleKeyDown = (e) => {
      if (
        document.activeElement === searchInputRef.current &&
        e.key !== "Escape" &&
        e.key !== "Enter"
      ) {
        return;
      }

      if (
        !isOpen &&
        (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")
      ) {
        setIsOpen(true);
        e.preventDefault();
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          setIsOpen(false);
          setSearchQuery("");
          break;
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prevIndex) => {
            const newIndex =
              prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : 0;
            scrollOptionIntoView(newIndex);
            return newIndex;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prevIndex) => {
            const newIndex =
              prevIndex > 0 ? prevIndex - 1 : filteredOptions.length - 1;
            scrollOptionIntoView(newIndex);
            return newIndex;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleOptionToggle(filteredOptions[highlightedIndex].value);
          }
          break;
        default:
          break;
      }
    };

    const scrollOptionIntoView = (index) => {
      if (optionsRef.current && optionsRef.current.children[index + 1]) {
        optionsRef.current.children[index + 1].scrollIntoView({
          block: "nearest",
          inline: "start",
        });
      }
    };

    // Default option renderer if none provided
    const defaultOptionRenderer = (option, isSelected, isHighlighted) => (
      <div
        className={cn(
          "flex items-center text-sm px-3 py-2 cursor-pointer rounded mb-1",
          isSelected
            ? "bg-gray-100/80 dark:bg-[#153355] text-primary dark:text-white"
            : "hover:bg-gray-100/80 hover:dark:bg-[#153355]",
          isHighlighted && "bg-gray-100 dark:bg-[#153355]",
        )}
      >
        <div className="flex-1">{option.label}</div>
        {isSelected ? (
          <LuCheck className="h-4 w-4 text-primary dark:text-white" />
        ) : selectedValues.length < maxItems ? (
          <LuPlus className="h-4 w-4 text-gray-400 " />
        ) : null}
        {option.description && (
          <span className="ml-2 text-xs text-muted-foreground">
            {option.description}
          </span>
        )}
      </div>
    );

    // Use custom renderer or default
    const renderOption = optionRenderer || defaultOptionRenderer;

    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
      setHighlightedIndex(-1);
    };

    const clearSearch = () => {
      setSearchQuery("");
      searchInputRef.current.focus();
    };

    const clearAll = (e) => {
      e.stopPropagation();
      setSelectedValues([]);

      if (onChange) {
        const syntheticEvent = { target: { value: [] } };
        onChange(syntheticEvent);
      }
      if (onValueChange) {
        onValueChange([]);
      }
      console.log("Selected values after clear:", []);
    };

    return (
      <div
        className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}
        ref={dropdownRef}
      >
        {label && (
          <label className="text-sm font-medium dark:font-normal text-gray-700 dark:text-gray-200 ">
            {label}
          </label>
        )}

        <div className="relative">
          <button
            type="button"
            className={cn(
              "flex min-h-12 w-full items-center justify-between rounded-md border border-input dark:border-[#475569] bg-background dark:bg-transparent px-3 py-[11px] text-sm ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
              startIcon && "pl-10",
              error && "border-red-500",
              className,
            )}
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            ref={triggerRef}
            {...props}
          >
            <div className="flex flex-wrap items-center gap-1 pr-2">
              {startIcon && (
                <span className="absolute left-3 flex items-center pointer-events-none text-gray-500">
                  {startIcon}
                </span>
              )}

              {selectedValues.length === 0 ? (
                <span className="text-muted-foreground dark:text-gray-500">
                  {placeholder}
                </span>
              ) : (
                <div className="flex flex-wrap gap-1 max-w-full">
                  {selectedOptions.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center bg-gray-100 dark:bg-[#153355] text-gray-800 dark:text-gray-100 rounded-md px-2 py-1 text-xs"
                    >
                      <span className="truncate max-w-[150px]">
                        {option.label}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveValue(option.value, e)}
                        className="ml-1 text-gray-500 hover:text-red-700"
                      >
                        <LuX className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {selectedValues.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-gray-400 hover:text-red-600 p-1"
                >
                  <LuX className="h-4 w-4" />
                </button>
              )}
              {endIcon ? (
                <span className="flex items-center text-gray-500">
                  {endIcon}
                </span>
              ) : (
                <span className="flex items-center text-gray-500">
                  <LuChevronUp
                    className={`ani3 text-lg ${isOpen ? "rotate-0" : "rotate-180"}`}
                  />
                </span>
              )}
            </div>
          </button>

          {/* Dropdown */}
          <div
            className={`absolute z-10 mt-1  w-full rounded-md border border-gray-200 dark:border-[#3f5c88] bg-white dark:bg-[#1A2536] shadow-lg ani3 ${
              isOpen
                ? " visible opacity-100 top-full"
                : "top-[calc(100%+10px)] invisible opacity-0"
            }`}
            role="listbox"
            aria-multiselectable="true"
          >
            <div
              className="max-h-60 overflow-auto sideBar bg-white dark:bg-[#1A2536] rounded-md p-1.5 pt-0"
              ref={optionsRef}
            >
              {/* Search input */}
              <div className="sticky top-0 bg-white dark:bg-[#1A2536] p-1 mb-1 border-b border-gray-100 dark:border-[#25354d] ">
                <div className="relative mt-1.5">
                  <LuSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    ref={searchInputRef}
                    className="w-full h-9 pl-8 pr-8 rounded border border-gray-200 dark:border-[#3f5c88] text-sm focus:outline-none focus:border-blue-500 dark:focus:border-gray-400"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <LuX className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {selectedValues.length > 0 && (
                  <div className="flex justify-between items-center mt-2 px-1 text-xs text-gray-500">
                    <span>{selectedValues.length} selected</span>
                    {selectedValues.length < maxItems ? (
                      <span>
                        {maxItems < Number.POSITIVE_INFINITY
                          ? `${maxItems - selectedValues.length} more available`
                          : ""}
                      </span>
                    ) : (
                      <span className="text-amber-600">
                        Maximum items selected
                      </span>
                    )}
                  </div>
                )}
              </div>

              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={selectedValues.includes(option.value)}
                    tabIndex={-1}
                    onClick={() => handleOptionToggle(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseLeave={() => setHighlightedIndex(-1)}
                  >
                    {renderOption(
                      option,
                      selectedValues.includes(option.value),
                      highlightedIndex === index,
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {helperText && !error && (
          <p className="text-xs text-gray-500 ">{helperText}</p>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

MultipleSearchSelect.displayName = "MultipleSearchSelect";

export { MultipleSearchSelect };
