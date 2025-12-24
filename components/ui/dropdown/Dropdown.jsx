"use client";

import React from "react";
import { useState, useRef, useEffect, createContext, useContext } from "react";
import { LuChevronDown, LuCheck } from "react-icons/lu";
import { cn } from "@/lib/utils";

// Context for dropdown state management
const DropdownContext = createContext({
  isOpen: false,
  toggle: () => {},
  close: () => {},
  activeIndex: -1,
  setActiveIndex: () => {},
  registerItem: () => {},
});

export function Dropdown({
  children,
  className,
  fullWidth = false,
  disabled = false,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const itemsRef = useRef([]);

  const toggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setActiveIndex(-1);
    }
  };

  const close = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          close();
          break;
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < itemsRef.current.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : itemsRef.current.length - 1,
          );
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (activeIndex >= 0 && itemsRef.current[activeIndex]) {
            itemsRef.current[activeIndex].click();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, activeIndex]);

  // Focus active item
  useEffect(() => {
    if (isOpen && activeIndex >= 0 && itemsRef.current[activeIndex]) {
      itemsRef.current[activeIndex].focus();
    }
  }, [isOpen, activeIndex]);

  // Register item refs
  const registerItem = (index, ref) => {
    itemsRef.current[index] = ref;
  };

  const contextValue = {
    isOpen,
    toggle,
    close,
    activeIndex,
    setActiveIndex,
    registerItem,
    triggerRef,
    menuRef,
    disabled,
  };

  return (
    <DropdownContext.Provider value={contextValue}>
      <div
        ref={dropdownRef}
        className={cn(
          "relative inline-block text-left",
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// Dropdown trigger component
export function DropdownTrigger({
  children,
  className,
  asChild = false,
  showChevron = true,
  ...props
}) {
  const { toggle, isOpen, disabled, triggerRef } = useContext(DropdownContext);

  // If asChild is true, we clone the child and add our props
  if (asChild && children) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onClick: (e) => {
        children.props.onClick?.(e);
        toggle();
      },
      "aria-expanded": isOpen,
      "aria-haspopup": true,
      disabled,
      ...props,
    });
  }

  // Default trigger button
  return (
    <button
      type="button"
      className={cn(
        "flex items-center justify-between w-full  text-sm font-medium text-gray-700 bg-white dark:bg-[#010611] dark:hover:bg-[#161f2d1e] border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none ",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      onClick={toggle}
      aria-expanded={isOpen}
      aria-haspopup="true"
      disabled={disabled}
      ref={triggerRef}
      {...props}
    >
      {children}
      {showChevron && (
        <LuChevronDown
          className={cn(
            "ml-2 h-4 w-4 transition-transform duration-200",
            isOpen && "transform rotate-180",
          )}
          aria-hidden="true"
        />
      )}
    </button>
  );
}

// Dropdown menu component
export function DropdownMenu({
  children,
  className,
  align = "left",
  ...props
}) {
  const { isOpen, menuRef } = useContext(DropdownContext);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Handle animation timing
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready before starting animation
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      // Wait for animation to complete before removing from DOM
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  // Calculate alignment classes
  const alignClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 w-full min-w-[10rem] rounded-md bg-white dark:bg-[#161F2D] shadow-md shadow-gray-200 border border-gray-200 dark:border-[#1e2733] dark:shadow-black/20 ring-opacity-5 focus:outline-none",
        "origin-top-right transition-all duration-200 ease-out",
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-2 scale-95 pointer-events-none",
        alignClasses[align] || alignClasses.left,
        className,
      )}
      ref={menuRef}
      role="menu"
      aria-orientation="vertical"
      tabIndex={-1}
      {...props}
    >
      <div className="py-1">{children}</div>
    </div>
  );
}

// Dropdown item component
export function DropdownItem({
  children,
  className,
  disabled = false,
  selected = false,
  onClick,
  icon,
  ...props
}) {
  const { close, activeIndex, setActiveIndex, registerItem } =
    useContext(DropdownContext);
  const itemRef = useRef(null);
  const index = useRef(-1);

  // Get index for this item
  useEffect(() => {
    if (itemRef.current) {
      const items = itemRef.current
        .closest('[role="menu"]')
        ?.querySelectorAll('[role="menuitem"]');
      if (items) {
        index.current = Array.from(items).indexOf(itemRef.current);
        registerItem(index.current, itemRef.current);
      }
    }
  }, [registerItem]);

  const handleClick = (e) => {
    if (disabled) return;
    onClick?.(e);
    close();
  };

  return (
    <button
      className={cn(
        "flex items-center w-full px-4 py-2 text-sm text-left text-gray-700 hover:text-gray-900 focus:outline-none  focus:text-gray-900",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        selected && "bg-gray-100 text-gray-900",
        activeIndex === index.current && "hover:bg-gray-100",
        className,
      )}
      role="menuitem"
      onClick={handleClick}
      ref={itemRef}
      onMouseEnter={() => setActiveIndex(index.current)}
      disabled={disabled}
      tabIndex={-1}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
      {selected && (
        <LuCheck className="ml-auto h-4 w-4 text-primary" aria-hidden="true" />
      )}
    </button>
  );
}

// Dropdown separator component
export function DropdownSeparator({ className, ...props }) {
  return (
    <div
      className={cn(
        "h-px my-1 border-b border-b-gray-200 dark:border-b-[#475569] ",
        className,
      )}
      role="separator"
      {...props}
    />
  );
}

// Dropdown label component
export function DropdownLabel({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
