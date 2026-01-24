"use client";

import { LuSearch, LuRefreshCw, LuX, LuDownload } from "react-icons/lu";
import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "unsubscribed", label: "Unsubscribed" },
];

export default function NewsletterManageHeader({
  pageTitle = "Newsletter Subscribers",
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onRefresh,
  isRefreshing,
  onExport,
  totalActive = 0,
  totalUnsubscribed = 0,
}) {
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: Title and Export Button */}
      <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">{pageTitle}</h1>
          <div className="flex gap-4 mt-1 text-sm text-gray-500">
            <span>
              Active: <strong className="text-green-600">{totalActive}</strong>
            </span>
            <span>
              Unsubscribed:{" "}
              <strong className="text-gray-600">{totalUnsubscribed}</strong>
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={onExport}
          className="whitespace-nowrap"
        >
          <LuDownload className="size-4" /> Export Emails
        </Button>
      </div>

      {/* Row 2: Search, Filter and Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Input
          placeholder="Search by email..."
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
