"use client";

import { cn } from "@/lib/utils";

const TableSkeleton = ({ columns = [], rowCount = 5, className }) => {
  const renderSkeletonRows = () => {
    return Array(rowCount)
      .fill(0)
      .map((_, rowIndex) => (
        <tr key={`skeleton-row-${rowIndex}`} className="animate-pulse">
          {columns.map((column, colIndex) => (
            <td
              key={`skeleton-cell-${rowIndex}-${colIndex}`}
              className="px-4 py-4 whitespace-nowrap"
              style={column.minWidth ? { minWidth: column.minWidth } : {}}
            >
              <div
                className={cn(
                  "h-6 bg-gray-200 dark:bg-gray-700 rounded",
                  column.id === "actions" ? "w-20 ml-auto" : "w-3/4",
                )}
              />
            </td>
          ))}
        </tr>
      ));
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full border border-gray-100 dark:border-[#212a36] rounded-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#DEEDFF] dark:bg-[#161F2D] text-muted-foreground">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={`skeleton-header-${index}`}
                  className={cn(
                    "px-4 py-4 text-left text-sm font-medium whitespace-nowrap",
                    column.className,
                  )}
                  style={column.minWidth ? { minWidth: column.minWidth } : {}}
                >
                  <div
                    className={`flex items-center gap-1 ${column.id === "actions" ? "justify-end" : ""}`}
                  >
                    <span>{column.header}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[#212a36]">
            {renderSkeletonRows()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { TableSkeleton };
