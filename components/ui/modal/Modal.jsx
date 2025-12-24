"use client";

import { forwardRef, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";

import { cn } from "@/lib/utils";

const Modal = forwardRef(
  (
    {
      className,
      children,
      open = false,
      onClose,
      size = "medium",
      closeOnBackdropClick = true,
      closeOnEsc = true,
      showCloseButton = true,
      preventScroll = true,
      initialFocus,
      title,
      description,
      footer,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(open);
    const [isClosing, setIsClosing] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const modalRef = useRef(null);
    const previousActiveElement = useRef(null);

    // Sync open state with prop
    useEffect(() => {
      if (open && !isOpen) {
        setIsOpen(true);
        setIsClosing(false);
        // Set animating after a small delay to ensure CSS transitions work
        setTimeout(() => {
          setIsAnimating(true);
        }, 10);
      } else if (!open && isOpen && !isClosing) {
        handleClose();
      }
    }, [open, isOpen, isClosing]);

    // Handle client-side only rendering
    useEffect(() => {
      setIsMounted(true);
      return () => setIsMounted(false);
    }, []);

    // Handle scroll locking
    useEffect(() => {
      if (!isMounted) return;

      if (isOpen && preventScroll) {
        // Save current scroll position
        const scrollY = window.scrollY;
        const scrollbarWidth =
          window.innerWidth - document.documentElement.clientWidth;

        // Add padding to the right of the body to prevent layout shift when scrollbar disappears
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden"; // Changed from overflowY: "scroll"

        return () => {
          // Restore scroll position
          document.body.style.position = "";
          document.body.style.top = "";
          document.body.style.width = "";
          document.body.style.overflow = "";
          document.body.style.paddingRight = "";
          window.scrollTo(0, scrollY);
        };
      }
    }, [isOpen, preventScroll, isMounted]);

    // Handle focus management
    useEffect(() => {
      if (!isMounted) return;

      if (isOpen) {
        previousActiveElement.current = document.activeElement;

        // Set focus to the specified element or the modal itself
        setTimeout(() => {
          if (initialFocus && initialFocus.current) {
            initialFocus.current.focus();
          } else if (modalRef.current) {
            modalRef.current.focus();
          }
        }, 50);
      } else if (previousActiveElement.current) {
        // Return focus to the previously focused element
        setTimeout(() => {
          previousActiveElement.current.focus();
        }, 50);
      }
    }, [isOpen, initialFocus, isMounted]);

    // Handle ESC key press
    useEffect(() => {
      if (!isMounted) return;

      const handleKeyDown = (e) => {
        if (isOpen && e.key === "Escape" && closeOnEsc) {
          handleClose();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, closeOnEsc, isMounted]);

    // Handle closing animation
    const handleClose = () => {
      if (!isOpen) return;

      setIsClosing(true);
      setIsAnimating(false);

      // Wait for animation to complete before fully closing
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
        if (onClose) onClose();
      }, 200); // Match this with the CSS transition duration
    };

    // Handle backdrop click
    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget && closeOnBackdropClick) {
        handleClose();
      }
    };

    // Handle focus trap
    const handleTabKey = (e) => {
      if (!modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // If shift + tab and on first element, move to last element
      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
      // If tab and on last element, move to first element
      else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    };

    // Size classes
    const sizeClasses = {
      small: "max-w-sm",
      medium: "max-w-md",
      large: "max-w-lg",
      xlarge: "max-w-xl",
      xxlarge: "max-w-2xl",
      full: "max-w-full mx-4",
    };

    // Variant classes
    const variantClasses = {
      default:
        "bg-white text-gray-900 dark:bg-[#161F2D] dark:border-[#2c3746] border-gray-200 dark:text-white",
      destructive:
        "bg-white border-red-100 dark:bg-[#161F2D] dark:border-[#2c3746]",
      warning:
        "bg-amber-50 border-amber-100 dark:bg-[#161F2D] dark:border-[#2c3746]",
      success:
        "bg-green-50 border-green-100 dark:bg-[#161F2D] dark:border-[#2c3746]",
    };

    // Don't render anything on the server or if not mounted or closed
    if (!isMounted || !isOpen) return null;

    return createPortal(
      <div
        className={cn(
          "fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-200 ease-in-out",
          isAnimating && !isClosing ? "opacity-100" : "opacity-0"
        )}
        onClick={handleBackdropClick}
        aria-modal="true"
        role="dialog"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
      >
        <div
          ref={(node) => {
            modalRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          className={cn(
            "relative w-full rounded-lg border shadow-lg transition-all duration-200 ease-in-out transform",
            isAnimating && !isClosing
              ? "scale-100 opacity-100"
              : "scale-95 opacity-0",
            sizeClasses[size] || sizeClasses.medium,
            variantClasses[variant] || variantClasses.default,
            className
          )}
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              handleTabKey(e);
            }
          }}
          {...props}
        >
          {/* Close button */}
          {showCloseButton && (
            <button
              type="button"
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none size-8 hover:bg-gray-100 dark:hover:bg-red-900/50 dark:hover:text-red-200 hover:text-red-500 center dark:text-red-100"
              onClick={handleClose}
              aria-label="Close"
            >
              <LuX className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          )}

          {/* Modal content */}
          <div className="p-6">
            {/* Title */}
            {title && (
              <div className="mb-4">
                <h2
                  id="modal-title"
                  className="text-lg font-medium leading-none tracking-tight dark:font-normal"
                >
                  {title}
                </h2>
                {description && (
                  <p
                    id="modal-description"
                    className="mt-1 text-sm text-gray-500 dark:text-gray-500"
                  >
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* Body - Using overflow-auto and ensuring no extra space */}
            <div
              className={cn(
                !title ? "mt-0" : "mt-2",
                "max-h-[80vh] overflow-auto noBar dark:text-gray-400",
                "flex flex-col" // Added flex to prevent extra space
              )}
              style={{
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {children}
            </div>

            {/* Footer */}
            {footer && <div className="mt-6">{footer}</div>}
          </div>
        </div>
      </div>,
      document.body
    );
  }
);

Modal.displayName = "Modal";

export { Modal };
