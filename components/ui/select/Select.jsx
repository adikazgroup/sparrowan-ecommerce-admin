"use client";

import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import { LuChevronUp, LuCheck } from "react-icons/lu";
import { useState, useEffect, useRef, forwardRef } from "react";

const Select = forwardRef(
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
      onValueChange,
      onChange,
      value,
      defaultValue,
      requiredSign = false,
      required = false,
      optionRenderer,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef(null);
    const optionsRef = useRef(null);
    const containerRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [dropdownStyle, setDropdownStyle] = useState({
      top: 0,
      left: 0,
      width: 0,
    });

    const [selectedValue, setSelectedValue] = useState(
      value || defaultValue || ""
    );
    const selectedOption = options.find(
      (option) => option.value === selectedValue
    );
    const displayValue = selectedOption ? selectedOption.label : "";

    useEffect(() => {
      if (value !== undefined && value !== selectedValue) {
        setSelectedValue(value);
      }
    }, [value]);

    // Close on outside click

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target) &&
          !optionsRef.current?.contains(event.target)
        ) {
          setIsVisible(false);
          setTimeout(() => setIsOpen(false), 200); // Wait for animation
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Toggle with positioning logics
    const toggleDropdown = () => {
      if (!isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownStyle({
          top: rect.bottom + window.scrollY + 3,
          left: rect.left + window.scrollX,
          width: rect.width,
        });

        setIsOpen(true);

        // ✅ Animate after one frame (ensures portal is mounted)
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      } else {
        setIsOpen(false);
        setIsVisible(false);
      }
    };

    useEffect(() => {
      if (isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownStyle({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }, [isOpen]);

    const handleOptionClick = (optionValue) => {
      setSelectedValue(optionValue);
      setIsOpen(false);
      const syntheticEvent = {
        target: { value: optionValue },
      };
      onChange?.(syntheticEvent);
      onValueChange?.(optionValue);
    };

    const handleKeyDown = (e) => {
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
          break;
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prevIndex) => {
            const newIndex = prevIndex < options.length - 1 ? prevIndex + 1 : 0;
            scrollOptionIntoView(newIndex);
            return newIndex;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prevIndex) => {
            const newIndex = prevIndex > 0 ? prevIndex - 1 : options.length - 1;
            scrollOptionIntoView(newIndex);
            return newIndex;
          });
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (highlightedIndex >= 0) {
            handleOptionClick(options[highlightedIndex].value);
          }
          break;
        default:
          break;
      }
    };

    const scrollOptionIntoView = (index) => {
      if (optionsRef.current && optionsRef.current.children[index]) {
        optionsRef.current.children[index].scrollIntoView({
          block: "nearest",
          inline: "start",
        });
      }
    };

    const defaultOptionRenderer = (option, isSelected, isHighlighted) => (
      <div
        className={cn(
          "flex items-center text-sm px-3 py-2 cursor-pointer rounded ",
          isSelected
            ? "bg-gray-100/80 dark:bg-primary text-primary dark:text-white justify-between hover:dark:bg-primary"
            : "hover:bg-gray-100/80 dark:hover:bg-primary/20",
          isHighlighted && "bg-gray-100 dark:bg-[#1E1E1E]"
        )}
      >
        <div className="flex items-center">
          <span>{option.label}</span>
          {option.description && (
            <span className="ml-2 text-xs text-muted-foreground">
              {option.description}
            </span>
          )}
        </div>
        {isSelected && (
          <LuCheck className="h-4 w-4 mr-2 text-primary dark:text-white" />
        )}
      </div>
    );

    const renderOption = optionRenderer || defaultOptionRenderer;

    return (
      <div
        ref={containerRef}
        className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}
      >
        {label && (
          <label
            onClick={() => setIsVisible(false)}
            className="text-sm font-medium dark:font-[350] text-gray-700 dark:text-gray-100 "
          >
            {label}
            {requiredSign && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <button
            type="button"
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-md border border-input  px-3 py-2 text-sm ring-offset-background focus:outline-none  disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer dark:bg-transparent dark:border-accent dark:font-[350]",
              startIcon && "pl-10",
              error && "border-red-500",
              className
            )}
            onClick={toggleDropdown}
            onKeyDown={handleKeyDown}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            ref={buttonRef}
            {...props}
          >
            <div className="flex items-center">
              {startIcon && (
                <span className="absolute left-3 flex items-center pointer-events-none text-gray-500">
                  {startIcon}
                </span>
              )}
              <span className={cn(!selectedValue && "text-gray-500")}>
                {displayValue || placeholder}
              </span>
            </div>
            {endIcon ? (
              <span
                className={`flex items-center text-gray-500 ani3 text-lg ${isOpen ? "rotate-0" : "rotate-180"}`}
              >
                {endIcon}
              </span>
            ) : (
              <span className={`flex items-center text-gray-500`}>
                <LuChevronUp
                  className={`ani3 text-lg ${isOpen ? "rotate-0" : "rotate-180"}`}
                />
              </span>
            )}
          </button>
        </div>

        {helperText && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}

        {dropdownStyle.top > 0 &&
          dropdownStyle.left > 0 &&
          createPortal(
            <div
              style={{
                top: dropdownStyle.top,
                left: dropdownStyle.left,
                width: dropdownStyle.width,
                position: "absolute",
                zIndex: 9999,
              }}
              className={`rounded-md border border-gray-200 dark:border-primary/20 bg-white dark:bg-accent shadow-lg ani3 transition-opacity duration-200 ${
                isVisible
                  ? "opacity-100 visible mt-1"
                  : "opacity-0 invisible mt-6"
              }`}
              role="listbox"
              ref={optionsRef}
            >
              <div className="max-h-60 overflow-auto sideBar rounded-md p-1.5 space-y-1 bg-white dark:bg-[#1a2536]">
                {options.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No options available
                  </div>
                ) : (
                  options.map((option, index) => (
                    <div
                      key={option.value}
                      role="option"
                      aria-selected={selectedValue === option.value}
                      tabIndex={-1}
                      onClick={() => {
                        handleOptionClick(option.value);
                        setIsVisible(false);
                      }}
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
            </div>,
            document.body
          )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
