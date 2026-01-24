"use client";

import { LuSearch, LuRefreshCw, LuX } from "react-icons/lu";
import { Input } from "@/components/ui/input/Input";
import { Select } from "@/components/ui/select/Select";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const ratingOptions = [
  { value: "", label: "All Ratings" },
  { value: "5", label: "5 Stars" },
  { value: "4", label: "4 Stars" },
  { value: "3", label: "3 Stars" },
  { value: "2", label: "2 Stars" },
  { value: "1", label: "1 Star" },
];

export default function ReviewManageHeader({
  pageTitle = "Reviews",
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  ratingFilter,
  setRatingFilter,
  onRefresh,
  isRefreshing,
}) {
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: Title */}
      <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
        <h1 className="text-xl font-medium">{pageTitle}</h1>
      </div>

      {/* Row 2: Search, Filters and Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Input
          placeholder="Search reviews..."
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
        <Select
          options={statusOptions}
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="w-full sm:w-40 h-10"
          placeholder="All Status"
        />
        <Select
          options={ratingOptions}
          value={ratingFilter}
          onValueChange={setRatingFilter}
          className="w-full sm:w-36 h-10"
          placeholder="All Ratings"
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
