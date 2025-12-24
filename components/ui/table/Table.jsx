"use client";

import { cn } from "@/lib/utils";
import { Pagination } from "../pagination/Pagination";

const Table = ({
  data = [],
  columns = [],
  pagination = true,
  page,
  setPage,
  limit,
  setLimit,
  totalData = 0,
  totalPages = 0,
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
  actions,
  className,
  tableClassName,
}) => {
  // Render cell content
  const renderCellContent = (row, column) => {
    const value = column.accessor ? column.accessor(row) : row[column.id];
    return column.cell ? column.cell(value, row) : value;
  };

  // Render table header
  const renderTableHeader = () => (
    <thead className="bg-[#D5F9ED] dark:bg-[#161F2D] text-muted-foreground ">
      <tr>
        {columns.map((column) => (
          <th
            key={column.id}
            className={cn(
              "px-4 py-4 text-left text-sm font-medium whitespace-nowrap",
              column.className
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
  );

  // Render table rows
  const renderTableRows = () => (
    <tbody className="divide-y divide-gray-100 dark:divide-[#212a36]">
      {data.length > 0 ? (
        data.map((row, rowIndex) => (
          <tr
            key={row.id || rowIndex}
            className={cn(
              "hover:bg-secondary dark:hover:bg-[#161F2D] transition-colors",
              onRowClick && "cursor-pointer"
            )}
            onClick={() => onRowClick && onRowClick(row)}
          >
            {columns.map((column) => (
              <td
                key={`${row.id || rowIndex}-${column.id}`}
                className="px-4 py-3 text-sm whitespace-nowrap"
                style={column.minWidth ? { minWidth: column.minWidth } : {}}
              >
                {renderCellContent(row, column)}
              </td>
            ))}
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan={columns.length + (actions ? 1 : 0)}
            className="px-4 py-8 text-center text-muted-foreground whitespace-nowrap"
          >
            {loading ? "Loading data..." : emptyMessage}
          </td>
        </tr>
      )}
    </tbody>
  );

  // Handle page size change
  const handlePageSizeChange = (size) => {
    setLimit(size);
    setPage(1);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Table */}
      <div className="w-full border border-gray-100 dark:border-[#212a36] rounded-md overflow-x-auto">
        <table className={cn("w-full", tableClassName)}>
          {renderTableHeader()}
          {renderTableRows()}
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            totalItems={totalData}
            pageSize={limit}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(page) => setPage(page)}
            onPageSizeChange={handlePageSizeChange}
            showPageSizeOptions={false}
            showJumpToPage={false}
            align="end"
            size="small"
          />
        </div>
      )}
    </div>
  );
};

export { Table };
