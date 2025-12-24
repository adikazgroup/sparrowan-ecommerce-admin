import React from "react";

export default function DashShortCardSkeleton() {
  return (
    <div className=" animate-pulse sm:p-6 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex sm:flex-row flex-col gap-4 justify-between sm:items-center mb-6">
        {/* Dashboard Title */}
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-md" />

        {/* Date Range Picker */}
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-md" />
      </div>

      {/* ShortOverview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
