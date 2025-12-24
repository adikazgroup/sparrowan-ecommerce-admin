export default function RecentActivitySkeleton() {
  return (
    <div className="animate-pulse mt-6 2xl:w-[28%] lg:w-[30%] md:w-[48%] w-full order-1 flex-1 border border-gray-100 dark:border-gray-800 p-5 rounded-lg">
      <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded-md mb-4" />
      <div className="space-y-4">
        {[...Array(11)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
