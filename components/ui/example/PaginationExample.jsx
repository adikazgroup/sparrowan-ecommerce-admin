"use client";

import { useState } from "react";
import { Pagination } from "@/components/ui/pagination/Pagination";

export default function PaginationExamples() {
  const [currentPages, setCurrentPages] = useState({
    example1: 1,
    example2: 1,
    example3: 1,
    example4: 1,
    example5: 1,
  });

  const handlePageChange = (example, page) => {
    setCurrentPages((prev) => ({
      ...prev,
      [example]: page,
    }));
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className=" font-medium mb-6">Pagination Examples</h1>

      <div className="space-y-12">
        {/* Example 1: Simple Pagination */}
        <div className="p-5 border border-gray-200 rounded-lg bg-white">
          <h2 className="text-lg font-semibold mb-2">Simple Pagination</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Basic pagination with default styling. Perfect for most use cases.
          </p>

          <div className="bg-gray-50 p-6 rounded-md">
            <Pagination
              totalItems={100}
              pageSize={10}
              size="small"
              currentPage={currentPages.example1}
              onPageChange={(page) => handlePageChange("example1", page)}
              showPageSizeOptions={false}
              showJumpToPage={false}
              align="end"
            />
          </div>
        </div>

        {/* Example 2: Rounded Pills Style */}
        <div className="p-5 border border-gray-200 rounded-lg bg-white ">
          <h2 className="text-lg font-semibold mb-2">Rounded Pills Style</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Modern pill-style pagination with a contained look.
          </p>

          <div className="bg-gray-50 p-6 rounded-md">
            <Pagination
              totalItems={250}
              pageSize={25}
              currentPage={currentPages.example2}
              onPageChange={(page) => handlePageChange("example2", page)}
              variant="pills"
              color="accent"
              size="small"
              showPageSizeOptions={false}
              showJumpToPage={false}
              showPageInfo={false}
            />
          </div>
        </div>

        {/* Example 4: Outline Style with Page Size Options */}
        <div className="p-5 border border-gray-200 rounded-lg bg-white ">
          <h2 className="text-lg font-semibold mb-2">
            Outline Style with Page Size Options
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Outlined buttons with page size selector for flexible content
            viewing.
          </p>

          <div className="bg-gray-50 p-6 rounded-md">
            <Pagination
              totalItems={1000}
              pageSize={50}
              currentPage={currentPages.example4}
              onPageChange={(page) => handlePageChange("example4", page)}
              onPageSizeChange={(size) =>
                console.log(`Page size changed to ${size}`)
              }
              variant="outline"
              color="neutral"
              size="small"
              pageSizeOptions={[10, 25, 50, 100, 250]}
              showJumpToPage={false}
              align="end"
            />
          </div>
        </div>

        {/* Example 5: Compact Mobile-Friendly */}
        <div className="p-5 border border-gray-200 rounded-lg bg-white ">
          <h2 className="text-lg font-semibold mb-2">
            Compact Mobile-Friendly
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Compact design optimized for mobile devices with essential controls
            only.
          </p>

          <div className="bg-gray-50 p-6 rounded-md">
            <Pagination
              totalItems={150}
              pageSize={10}
              currentPage={currentPages.example5}
              onPageChange={(page) => handlePageChange("example5", page)}
              variant="rounded"
              size="small"
              color="primary"
              showPageSizeOptions={false}
              showJumpToPage={false}
              showPageInfo={false}
              siblingCount={0}
            />
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Current Page: {currentPages.example5}
          </div>
        </div>
      </div>
    </div>
  );
}
