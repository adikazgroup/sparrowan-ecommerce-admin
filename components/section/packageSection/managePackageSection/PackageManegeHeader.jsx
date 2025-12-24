"use client";
import { LuSearch } from "react-icons/lu";
import { Input } from "@/components/ui/input/Input";
import { Select } from "@/components/ui/select/Select";

export default function PackageManegeHeader({
  pageTitle,
  searchInput,
  status,
  setStatus,
  setSearchInput,
}) {
  return (
    <div className="flex  sm:flex-row flex-col md:items-center sm:items-end justify-between gap-5 lg:gap-0">
      <div className="flex md:flex-row flex-col sm:items-center lg:gap-14 gap-5">
        <h1 className="text-xl font-medium whitespace-nowrap">{pageTitle}</h1>
        <Input
          placeholder="Search by package name"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          endIcon={<LuSearch className="h-5 w-5" />}
          className="rounded-full sm:w-fit xl:min-w-68 bg-[#DEF4FF33] dark:bg-[#161F2D] dark:border-[#162127] px-4"
        />
      </div>
      <div>
        <Select
          options={[
            {
              value: "active",
              label: "Active",
            },
            {
              value: "inactive",
              label: "Inactive",
            },
          ]}
          value={status}
          onValueChange={(value) => setStatus(value)}
          fullWidth
          className="w-48 rounded-full px-4"
        />
      </div>
    </div>
  );
}
