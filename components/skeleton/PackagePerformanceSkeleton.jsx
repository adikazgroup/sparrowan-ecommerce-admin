export default function PackagePerformanceSkeleton() {
  return (
    <div className=" animate-pulse border border-gray-100 dark:border-gray-800 p-5 rounded-lg">
      <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-md mb-4" />
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-md mb-4" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
