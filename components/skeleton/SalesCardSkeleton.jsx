export default function SalesCardSkeleton() {
  return (
    <div className=" animate-pulse border border-gray-100 dark:border-gray-800 p-5 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded-md" />
        <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded-md" />
      </div>
      <div className="flex justify-between items-end mb-4">
        <div className="space-y-2">
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-md" />
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
        </div>
      </div>
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-md" />
    </div>
  );
}
