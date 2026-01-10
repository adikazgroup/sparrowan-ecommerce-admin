"use client";

import { LuPlus, LuSearch, LuRefreshCw, LuX } from "react-icons/lu";
import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";

export default function TaxCategoryManageHeader({
  pageTitle = "Tax Categories",
  searchTerm,
  setSearchTerm,
  onAddClick,
  onRefresh,
  isRefreshing,
}) {
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: Title and Add Button */}
      <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
        <h1 className="text-xl font-medium">{pageTitle}</h1>
        <Button onClick={onAddClick} className="whitespace-nowrap">
          <LuPlus className="size-4" /> Add Tax Category
        </Button>
      </div>

      {/* Row 2: Search and Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Input
          placeholder="Search tax categories..."
          value={searchTerm}
          onValueChange={setSearchTerm}
          endIcon={
            searchTerm ? (
              <button
                type="button"
                onClick={clearSearch}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <LuX className="h-4 w-4 text-gray-500" />
              </button>
            ) : (
              <LuSearch className="h-5 w-5" />
            )
          }
          className="w-full sm:w-64"
        />
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <LuRefreshCw
            className={`size-4 text-gray-500 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
