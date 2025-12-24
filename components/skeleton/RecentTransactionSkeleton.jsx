export default function RecentTransactionSkeleton() {
  return (
    <div className=" animate-pulse border border-gray-100 dark:border-gray-800 p-5 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-md" />
        <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded-md" />
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
