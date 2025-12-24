"use client";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { LuSearch } from "react-icons/lu";
import { Input } from "@/components/ui/input/Input";

export default function TopPart({ setSearchTerm }) {
  return (
    <div className="flex items-center sm:flex-row flex-col justify-between md:gap-14 gap-4">
      <h1 className="text-xl font-medium">Network</h1>
      <div className="flex  items-center gap-5">
        <Input
          placeholder="Search anything..."
          endIcon={<LuSearch className="h-5 w-5" />}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-full md:w-[300px]  bg-[#DEF4FF33] dark:bg-[#161F2D] dark:border-[#162127]  px-4"
        />
        <Link
          className="flex items-center whitespace-nowrap gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm"
          href={"/network/add-network"}
        >
          Create Network
          <Icon icon="gridicons:create" className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
