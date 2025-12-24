"use client";

import { useState, useEffect } from "react";
import {
  LuChevronsLeft,
  LuChevronsRight,
  LuChevronLeft,
  LuChevronRight,
  LuEllipsis,
} from "react-icons/lu";
import { cn } from "@/lib/utils";

const Pagination = ({
  totalItems = 0,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeOptions = true,
  showPageNumbers = true,
  showFirstLastButtons = true,
  showPrevNextButtons = true,
  showItemsPerPageLabel = true,
  itemsPerPageLabel = "Per page:",
  showingLabel = "Showing",
  ofLabel = "of",
  variant = "default",
  size = "default",
  color = "primary",
  className,
  align = "center",
  siblingCount = 1,
  showPageInfo = true,
}) => {
  const [page, setPage] = useState(currentPage);
  const [perPage, setPerPage] = useState(pageSize);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  // Update internal state when props change
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setPerPage(pageSize);
  }, [pageSize]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    onPageChange?.(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPerPage(newSize);
    onPageSizeChange?.(newSize);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    // If less than 6 pages, just show all page numbers without ellipsis
    if (totalPages < 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pageNumbers = [];
    pageNumbers.push(1);

    const leftSiblingIndex = Math.max(2, page - siblingCount);
    const rightSiblingIndex = Math.min(totalPages - 1, page + siblingCount);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from(
        { length: leftItemCount },
        (_, i) => totalPages - leftItemCount + i + 1,
      );
      return [1, "leftDots", ...leftRange];
    }

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => i + 1,
      );
      return [...rightRange, "rightDots", totalPages];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i,
      );
      return [1, "leftDots", ...middleRange, "rightDots", totalPages];
    }

    const range = Array.from({ length: totalPages }, (_, i) => i + 1);
    return range;
  };

  // Variant styles
  const getVariantStyles = () => {
    const baseButtonStyles =
      "transition-all duration-200 ease-in-out focus:outline-none ";

    const variants = {
      default: {
        container: "rounded-lg overflow-hidden",
        button: `${baseButtonStyles} border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300`,
        activeButton:
          "bg-primary dark:bg-[#0067D2] text-white border-primary dark:border-[#0067D2] hover:bg-primary/90 dark:hover:bg-[#0067D2]/90 shadow-md",
        dots: "text-gray-500 dark:text-gray-400",
        wrapper: "",
      },
      floating: {
        container: "rounded-full overflow-hidden shadow-lg",
        button: `${baseButtonStyles} border-0 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300`,
        activeButton:
          "bg-primary dark:bg-[#0067D2] text-white hover:bg-primary/90 dark:hover:bg-[#0067D2]/90 shadow-inner",
        dots: "text-gray-500 dark:text-gray-400",
        wrapper: "bg-white dark:bg-gray-800 p-1 rounded-full shadow-lg",
      },
      gradient: {
        container: "rounded-lg overflow-hidden",
        button: `${baseButtonStyles} border-0 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300`,
        activeButton:
          "bg-gradient-to-r from-primary to-primary/80 dark:from-[#0067D2] dark:to-[#0067D2]/80 text-white hover:from-primary/90 hover:to-primary/70 dark:hover:from-[#0067D2]/90 dark:hover:to-[#0067D2]/70 shadow-md",
        dots: "text-gray-500 dark:text-gray-400",
        wrapper: "bg-white dark:bg-gray-800 shadow-md rounded-lg p-1",
      },
      pill: {
        container: "",
        button: `${baseButtonStyles} rounded-full border-0 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300`,
        activeButton:
          "bg-primary dark:bg-[#0067D2] text-white hover:bg-primary/90 dark:hover:bg-[#0067D2]/90 shadow-md",
        dots: "text-gray-500 dark:text-gray-400",
        wrapper: "",
      },
    };

    return variants[variant] || variants.default;
  };

  // Size styles
  const getSizeStyles = () => {
    const sizes = {
      small: {
        button: "h-8 w-8 text-xs",
        text: "text-xs",
        input: "h-8 text-xs",
        select: "h-8 text-xs",
        gap: "gap-1",
      },
      default: {
        button: "h-10 w-10 text-sm",
        text: "text-sm",
        input: "h-10 text-sm",
        select: "h-10 text-sm",
        gap: "gap-1.5",
      },
      large: {
        button: "h-12 w-12 text-base",
        text: "text-base",
        input: "h-12 text-base",
        select: "h-12 text-base",
        gap: "gap-2",
      },
    };

    return sizes[size] || sizes.default;
  };

  // Color styles
  const getColorStyles = () => {
    const colors = {
      primary: {
        active: "bg-primary border-primary text-white hover:bg-primary/90",

        text: "text-primary",
        border: " border-primary",
        gradient: "from-primary to-primary/80",
      },
      secondary: {
        active:
          "bg-secondary border-secondary text-white hover:bg-secondary/90",

        text: "text-secondary",
        border: "border-secondary",
        gradient: "from-secondary to-secondary/80",
      },
      accent: {
        active: "bg-accent border-accent text-white hover:bg-accent/90",

        text: "text-accent",
        border: "border-accent",
        gradient: "from-accent to-accent/80",
      },
      custom: {
        active: "bg-blue-600 border-blue-600 text-white hover:bg-blue-700",
        text: "text-blue-600",
        border: "border-blue-600",
        gradient: "from-blue-600 to-blue-500",
      },
    };

    return colors[color] || colors.primary;
  };

  // Get styles based on variant, size, and color
  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const colorStyles = getColorStyles();

  // Calculate alignment styles
  const alignStyles = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
  };

  // Calculate start and end item numbers
  const startItem = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, totalItems);

  return (
    <div
      className={cn(
        `w-full flex sm:flex-row flex-col gap-3 mt-7 ${align === "end" ? "items-start justify-between " : "items-center justify-center "}`,
        className,
      )}
    >
      {/* Page info */}
      {showPageInfo && (
        <div
          className={cn(
            "text-gray-600 dark:text-gray-400 font-medium",
            sizeStyles.text,
          )}
        >
          {showingLabel}{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {startItem} - {endItem}
          </span>{" "}
          {ofLabel}{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {totalItems}
          </span>
        </div>
      )}

      <div className="flex flex-col justify-end items-end">
        {/* Pagination controls */}
        <div
          className={`${showPageSizeOptions && "flex items-center space-x-10"}`}
        >
          <div
            className={cn(
              "flex flex-wrap items-center ",
              alignStyles[align],
              sizeStyles.gap,
              "relative",
            )}
          >
            <div
              className={cn(
                variantStyles.wrapper,
                "flex items-center",
                sizeStyles.gap,
              )}
            >
              {/* First page button */}
              {showFirstLastButtons && (
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                  className={cn(
                    "flex items-center justify-center rounded-md",
                    variantStyles.button,
                    sizeStyles.button,
                    page === 1 && "opacity-50 cursor-not-allowed",
                  )}
                  aria-label="First page"
                >
                  <LuChevronsLeft className="h-4 w-4" />
                </button>
              )}

              {/* Previous page button */}
              {showPrevNextButtons && (
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={cn(
                    "flex items-center justify-center rounded-md",
                    variantStyles.button,
                    sizeStyles.button,
                    page === 1 && "opacity-50 cursor-not-allowed",
                  )}
                  aria-label="Previous page"
                >
                  <LuChevronLeft className="h-4 w-4" />
                </button>
              )}

              {/* Page numbers */}
              {showPageNumbers &&
                getPageNumbers().map((pageNumber, index) => {
                  if (pageNumber === "leftDots" || pageNumber === "rightDots") {
                    return (
                      <span
                        key={`dots-${index}`}
                        className={cn(
                          "flex items-center justify-center",
                          variantStyles.dots,
                          sizeStyles.button,
                        )}
                        aria-hidden="true"
                      >
                        <LuEllipsis className="h-4 w-4" />
                      </span>
                    );
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={cn(
                        "flex items-center justify-center rounded-md relative overflow-hidden",
                        variantStyles.button,
                        sizeStyles.button,
                        page === pageNumber && variantStyles.activeButton,
                        page === pageNumber && colorStyles.active,
                        variant === "gradient" &&
                          page === pageNumber &&
                          `bg-gradient-to-r ${colorStyles.gradient}`,
                      )}
                      aria-label={`Page ${pageNumber}`}
                      aria-current={page === pageNumber ? "page" : undefined}
                    >
                      {/* Ripple effect for active page */}
                      {page === pageNumber && variant && (
                        <span className="absolute inset-0 bg-white opacity-20 rounded-full scale-0 animate-ping-once"></span>
                      )}
                      {pageNumber}
                    </button>
                  );
                })}

              {/* Next page button */}
              {showPrevNextButtons && (
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={cn(
                    "flex items-center justify-center rounded-md",
                    variantStyles.button,
                    sizeStyles.button,
                    page === totalPages && "opacity-50 cursor-not-allowed",
                  )}
                  aria-label="Next page"
                >
                  <LuChevronRight className="h-4 w-4" />
                </button>
              )}

              {/* Last page button */}
              {showFirstLastButtons && (
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page === totalPages}
                  className={cn(
                    "flex items-center justify-center rounded-md",
                    variantStyles.button,
                    sizeStyles.button,
                    page === totalPages && "opacity-50 cursor-not-allowed",
                  )}
                  aria-label="Last page"
                >
                  <LuChevronsRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 ">
            {showPageSizeOptions && (
              <div className="flex items-center gap-2">
                {showItemsPerPageLabel && (
                  <label
                    htmlFor="page-size"
                    className={cn(
                      "text-gray-600 dark:text-gray-400",
                      sizeStyles.text,
                    )}
                  >
                    {itemsPerPageLabel}
                  </label>
                )}
                <select
                  id="page-size"
                  className={cn(
                    "border dark:border-gray-700 rounded-md px-2 focus:outline-none bg-white dark:bg-gray-800 dark:text-gray-300 arrow",
                    colorStyles.focus,
                    sizeStyles.select,
                  )}
                  value={perPage}
                  onChange={handlePageSizeChange}
                  aria-label="Items per page"
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Total pages indicator */}
        <div
          className={`mt-2 text-center ${align === "end" ? "w-fit" : "w-full"}`}
        >
          <span
            className={cn("text-gray-500 dark:text-gray-400", sizeStyles.text)}
          >
            Page{" "}
            <span className={cn("font-medium", colorStyles.text)}>{page}</span>{" "}
            of {totalPages}
          </span>
        </div>
      </div>
    </div>
  );
};

export { Pagination };
