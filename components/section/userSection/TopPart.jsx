"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { LuFilter, LuSearch } from "react-icons/lu";
import { Input } from "@/components/ui/input/Input";
import {
  Dropdown,
  DropdownMenu,
  DropdownTrigger,
} from "@/components/ui/dropdown/Dropdown";
import { ToggleSwitch } from "@/components/ui/toggle/ToggleSwitch";

const TopPart = ({ filters, setFilters, searchTerm, setSearchTerm }) => {
  const [activeTab, setActiveTab] = useState("role");

  // Handle filter change
  const handleFilterChange = (category, option, value) => {
    setFilters((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [option]: value,
      },
    }));
  };

  return (
    <div className="flex sm:flex-row flex-col gap-5 md:items-center sm:items-end justify-between">
      <div className="flex md:flex-row flex-col md:items-center lg:gap-14 gap-4">
        <h1 className="text-xl font-medium">Users</h1>
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search  by package name"
          endIcon={<LuSearch className="h-5 w-5" />}
          className="rounded-full sm:w-fit lg:min-w-68 bg-[#DEF4FF33] dark:bg-[#161F2D] dark:border-[#162127] px-4"
        />
      </div>

      <div className="flex justify-end items-center gap-5">
        <Link
          className="flex items-center whitespace-nowrap gap-2 bg-primary hover:bg-transparent hover:text-primary border border-primary text-white px-4 py-2 text-sm rounded-full"
          href={"/users/add"}
        >
          Add User
          <Icon icon="gridicons:create" className="h-5 w-5" />
        </Link>

        {/* Filter Dropdown */}
        <Dropdown>
          <DropdownTrigger showChevron={false}>
            <button className="flex items-center gap-2 py-1 px-2 dark:text-gray-300">
              Filter
              <Icon
                icon="mage:filter"
                className="h-8 w-8 bg-[#B6DCFF] dark:bg-[#161F2D] p-2 rounded  dark:text-white"
              />
            </button>
          </DropdownTrigger>
          <DropdownMenu className="w-72 p-0" align="right">
            <div className="p-4">
              <h2 className="text-lg font-medium mb-4">Filter</h2>

              {/* Tabs */}
              <div className="flex rounded-full bg-gray-100 dark:bg-[#1b2536] p-1 mb-4">
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-full ${
                    activeTab === "role"
                      ? "bg-white dark:bg-[#293852] shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                  onClick={() => setActiveTab("role")}
                >
                  By Role
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-full ${
                    activeTab === "status"
                      ? "bg-white dark:bg-[#01030E] shadow-sm"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                  onClick={() => setActiveTab("status")}
                >
                  By Status
                </button>
              </div>

              {/* Role Filters */}
              {activeTab === "role" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pt-3 ">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
                      Moderator
                    </span>
                    <ToggleSwitch
                      checked={filters.role.moderator}
                      onChange={(value) =>
                        handleFilterChange("role", "moderator", value)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between pt-3 ">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
                      Admin
                    </span>
                    <ToggleSwitch
                      checked={filters.role.admin}
                      onChange={(value) =>
                        handleFilterChange("role", "admin", value)
                      }
                    />
                  </div>
                </div>
              )}

              {/* Status Filters */}
              {activeTab === "status" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pt-3 ">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
                      Active
                    </span>
                    <ToggleSwitch
                      checked={filters.status.active}
                      onChange={(value) =>
                        handleFilterChange("status", "active", value)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
                      Inactive
                    </span>
                    <ToggleSwitch
                      checked={filters.status.inactive}
                      onChange={(value) =>
                        handleFilterChange("status", "inactive", value)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default TopPart;
