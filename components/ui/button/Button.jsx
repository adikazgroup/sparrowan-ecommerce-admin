"use client";

import { cn } from "@/lib/utils";
import { LuLoader } from "react-icons/lu";
import { forwardRef, useState, useRef } from "react";

const Button = forwardRef(
  (
    {
      endIcon,
      onClick,
      children,
      className,
      startIcon,
      loadingText,
      ripple = true,
      type = "button",
      loading = false,
      disabled = false,
      size = "default",
      fullWidth = false,
      elevation = "none",
      rounded = "default",
      variant = "default",
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef(null);
    const [rippleEffect, setRippleEffect] = useState([]);

    // Handle ripple effect
    const handleRipple = (e) => {
      if (!ripple || disabled || loading) return;
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const rippleId = Date.now();
      setRippleEffect((prev) => [
        ...prev,
        {
          id: rippleId,
          x,
          y,
          size,
        },
      ]);

      setTimeout(() => {
        setRippleEffect((prev) =>
          prev.filter((ripple) => ripple.id !== rippleId)
        );
      }, 600);
    };

    // Handle click with ripple
    const handleClick = (e) => {
      handleRipple(e);
      onClick?.(e);
    };

    // Variant styles
    const variantStyles = {
      default: "bg-primary hover:bg-primary/90 border-transparent text-white",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent",
      outline: "border-input bg-background hover:bg-accent hover:text-white",
      ghost: "hover:bg-secondary  border-transparent",
      destructive:
        "bg-destructive text-white hover:bg-destructive/90 border-transparent",
      success: "bg-green-600 text-white hover:bg-green-700 border-transparent",
      warning: "bg-amber-500 text-white hover:bg-amber-600 border-transparent",
      info: "bg-blue-500 text-white hover:bg-blue-600 border-transparent",
      light: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200",
      dark: "bg-gray-800 text-white hover:bg-gray-900 border-transparent",
      link: "text-primary underline-offset-4 hover:underline p-0 h-auto border-transparent",
    };

    // Size styles
    const sizeStyles = {
      sm: "h-8 px-3 text-xs",
      default: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-6 ",
      xl: "h-14 px-8 text-lg",
      icon: "h-10 w-10 p-0",
      "icon-sm": "h-8 w-8 p-0",
      "icon-lg": "h-12 w-12 p-0",
    };

    // Rounded styles
    const roundedStyles = {
      none: "rounded-none",
      sm: "rounded-sm",
      default: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
    };

    // Elevation styles
    const elevationStyles = {
      none: "",
      sm: "shadow-sm",
      default: "shadow",
      md: "shadow-md",
      lg: "shadow-lg",
      xl: "shadow-xl",
    };

    return (
      <button
        ref={(node) => {
          buttonRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        type={type}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 whitespace-nowrap border font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          roundedStyles[rounded],
          elevationStyles[elevation],
          fullWidth && "w-full",
          variant !== "link" && "active:translate-y-0.5 active:duration-75",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effect container */}
        {ripple && (
          <span
            className="absolute inset-0 overflow-hidden"
            style={{ borderRadius: "inherit" }}
          >
            {rippleEffect.map((ripple) => (
              <span
                key={ripple.id}
                className="absolute bg-white/30 rounded-full animate-ripple"
                style={{
                  width: `${ripple.size}px`,
                  height: `${ripple.size}px`,
                  left: `${ripple.x}px`,
                  top: `${ripple.y}px`,
                }}
              />
            ))}
          </span>
        )}

        {/* Loading spinner */}
        {loading && (
          <LuLoader
            className={cn(
              "animate-spin",
              size === "sm" ? "h-3 w-3" : "h-4 w-4"
            )}
          />
        )}

        {/* Start icon */}
        {!loading && startIcon && (
          <span className="inline-flex shrink-0">{startIcon}</span>
        )}

        {/* Button text */}
        {loading && loadingText ? loadingText : children}

        {/* End icon */}
        {!loading && endIcon && (
          <span className="inline-flex shrink-0">{endIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
