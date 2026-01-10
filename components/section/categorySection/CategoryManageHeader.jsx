"use client";

import Link from "next/link";
import { LuPlus, LuSearch, LuRefreshCw, LuX } from "react-icons/lu";
import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { useGetDepartmentsIdNameQuery } from "@/features/departments/departmentsApiSlice";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function CategoryManageHeader({
  pageTitle = "Categories",
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  departmentFilter,
  setDepartmentFilter,
  addHref = "/categories/add",
  onRefresh,
  isRefreshing,
}) {
  const clearSearch = () => {
    setSearchTerm("");
  };

  const { data: departmentData } = useGetDepartmentsIdNameQuery();
  const departmentOptions = [
    { value: "", label: "All Departments" },
    ...(departmentData?.data?.map((d) => ({
      value: d.value,
      label: d.label,
    })) || []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
        <h1 className="text-xl font-medium">{pageTitle}</h1>
        <Link href={addHref}>
          <Button className="whitespace-nowrap">
            <LuPlus className="size-4" /> Add Category
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
        <Input
          placeholder="Search categories..."
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
          options={departmentOptions}
          value={departmentFilter}
          onValueChange={setDepartmentFilter}
          className="w-full sm:w-44 h-10"
          placeholder="All Departments"
        />
        <Select
          options={statusOptions}
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="w-full sm:w-36 h-10"
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
