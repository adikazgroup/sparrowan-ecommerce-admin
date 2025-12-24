"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { LuChevronUp, LuCheck, LuSearch, LuX } from "react-icons/lu";

const SearchSelect = forwardRef(
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
      placeholder = "Select an option",
      searchPlaceholder = "Search...",
      onValueChange,
      onChange,
      value,
      defaultValue,
      optionRenderer,
      ...props
    },
    ref
  ) => {
    const [selectedValue, setSelectedValue] = useState(
      value || defaultValue || ""
    );
    const dropdownRef = useRef(null);
    const optionsRef = useRef(null);
    const searchInputRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    // Find the selected option's label to display
    const selectedOption = options.find(
      (option) => option.value === selectedValue
    );
    const displayValue = selectedOption ? selectedOption.label : "";

    // Filter options based on search query
    const filteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
      if (value !== undefined && value !== selectedValue) {
        setSelectedValue(value);
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

    const handleOptionClick = (optionValue) => {
      setSelectedValue(optionValue);
      setIsOpen(false);
      setSearchQuery("");
      const syntheticEvent = {
        target: { value: optionValue },
      };
      onChange?.(syntheticEvent);
      onValueChange?.(optionValue);
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
            handleOptionClick(filteredOptions[highlightedIndex].value);
          }
          break;
        default:
          break;
      }
    };

    const scrollOptionIntoView = (index) => {
      if (optionsRef.current && optionsRef.current.children[index + 1]) {
        // +1 to account for search input
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
          "flex items-center text-sm px-3 py-2 cursor-pointer rounded hover:dark:bg-accent",
          isSelected
            ? "bg-gray-100/80 dark:bg-accent text-primary dark:text-lime-400 justify-between"
            : "hover:bg-gray-100/80 dark:hover:bg-accent",
          isHighlighted && "bg-gray-100 dark:bg-[#1E1E1E]"
        )}
      >
        <span>{option.label}</span>
        {isSelected && <LuCheck className="h-4 w-4 mr-2 text-primary" />}

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

    return (
      <div
        className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}
        ref={dropdownRef}
      >
        {label && (
          <label className="text-sm font-medium dark:font-[350] text-gray-700 dark:text-gray-100 ">
            {label}
          </label>
        )}

        <div className="relative">
          <button
            type="button"
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input  px-3 py-2 text-sm ring-offset-background focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer dark:border-accent dark:font-[350]",
              startIcon && "pl-10",
              error && "border-red-500",
              className
            )}
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            ref={ref}
            {...props}
          >
            <div className="flex items-center">
              {startIcon && (
                <span className="absolute left-3 flex items-center pointer-events-none text-gray-500">
                  {startIcon}
                </span>
              )}
              <span className={cn(!selectedValue && "text-muted-foreground")}>
                {displayValue || placeholder}
              </span>
            </div>
            {endIcon ? (
              <span className="flex items-center text-gray-500">{endIcon}</span>
            ) : (
              <span className="flex items-center text-gray-500">
                <LuChevronUp
                  className={`ani3 text-lg ${isOpen ? "rotate-0" : "rotate-180"}`}
                />
              </span>
            )}
          </button>

          <div
            className={`absolute z-10 mt-1 w-full rounded-md border border-gray-200 dark:border-accent bg-white dark:bg-[#050505] shadow-lg ani3 ${
              isOpen
                ? " visible opacity-100 top-10"
                : "top-16 invisible opacity-0"
            }`}
            role="listbox"
          >
            <div
              className="max-h-60 overflow-auto sideBar bg-white dark:bg-[#050505] rounded-md p-1.5 pt-0"
              ref={optionsRef}
            >
              {/* Search input */}
              <div className="sticky top-0 bg-white dark:bg-[#050505] dark:border-accent p-1 pb-2 mb-1 border-b border-gray-100">
                <div className="relative mt-1.5">
                  <LuSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    ref={searchInputRef}
                    className="w-full h-9 pl-8 pr-8 rounded border border-gray-200 dark:border-accent text-sm focus:outline-none focus:border-gray-500"
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
                    aria-selected={selectedValue === option.value}
                    tabIndex={-1}
                    onClick={() => handleOptionClick(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseLeave={() => setHighlightedIndex(-1)}
                  >
                    {renderOption(
                      option,
                      selectedValue === option.value,
                      highlightedIndex === index
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
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

SearchSelect.displayName = "SearchSelect";

export { SearchSelect };
