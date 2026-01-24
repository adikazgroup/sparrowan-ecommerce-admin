/**
 * PageSkeleton - Loading skeleton for edit/detail pages
 */
export function PageSkeleton() {
  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="space-y-2">
          <div className="w-40 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1 */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
            <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>

          {/* Card 2 */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Sidebar Card */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
            <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  );
}
