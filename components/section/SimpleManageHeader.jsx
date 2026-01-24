"use client";

import Link from "next/link";
import { LuRefreshCw, LuPlus, LuSearch } from "react-icons/lu";
import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { statusOptions } from "@/utils/DataHelper";

export default function SimpleManageHeader({
  pageTitle,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  addHref,
  onRefresh,
  isRefreshing,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        {pageTitle}
      </h1>
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="pl-9 w-48"
          />
        </div>

        {/* Status Filter */}
        <Select
          options={[{ value: "", label: "All Status" }, ...statusOptions]}
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="w-32"
        />

        {/* Refresh */}
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <LuRefreshCw
            className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </Button>

        {/* Add New */}
        {addHref && (
          <Link href={addHref}>
            <Button startIcon={<LuPlus className="size-4" />}>Add New</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
