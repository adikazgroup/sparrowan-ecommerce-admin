"use client";

import { useState } from "react";
import Link from "next/link";
import moment from "moment";
import {
  LuEye,
  LuShoppingCart,
  LuUser,
  LuRefreshCw,
  LuSearch,
  LuX,
} from "react-icons/lu";

import { useModal } from "@/lib/useModal";
import { Table } from "@/components/ui/table/Table";
import { Button } from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal/Modal";
import { Input } from "@/components/ui/input/Input";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import { useGetCartListQuery } from "@/features/carts/cartsApiSlice";

export default function CartsPage() {
  const viewModal = useModal();
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterData, setFilterData] = useState({ searchTerm: "" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useGetCartListQuery({
    searchTerm: filterData.searchTerm || undefined,
    page,
    limit,
  });

  const items = data?.data || [];
  const totalData = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPage || 0;

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setIsManualRefreshing(false);
  };

  const clearSearch = () =>
    setFilterData((prev) => ({ ...prev, searchTerm: "" }));

  const columns = [
    {
      id: "customer",
      header: "Customer",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <LuUser className="size-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">
              {row.customer?.name || "Guest"}
            </p>
            <p className="text-xs text-gray-500">
              {row.customer?.email || "---"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "items",
      header: "Items",
      cell: (_, row) => (
        <div className="flex items-center gap-2">
          <LuShoppingCart className="size-4 text-gray-400" />
          <span className="font-medium text-gray-800 dark:text-white">
            {row.itemCount || 0}
          </span>
        </div>
      ),
    },
    {
      id: "total",
      header: "Total",
      cell: (_, row) => (
        <span className="font-semibold text-gray-800 dark:text-white">
          ৳{(row.total || 0).toFixed(2)}
        </span>
      ),
    },
    {
      id: "updated",
      header: "Last Updated",
      cell: (_, row) => (
        <span className="text-sm text-gray-500">
          {moment(row.updatedAt).format("DD MMM YYYY, hh:mm A")}
        </span>
      ),
    },
    {
      id: "expires",
      header: "Expires",
      cell: (_, row) => (
        <span className="text-sm text-gray-500">
          {row.expiresAt ? moment(row.expiresAt).format("DD MMM YYYY") : "---"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (_, row) => (
        <div className="flex justify-end gap-1">
          <Link
            href={`/carts/${row._id}`}
            className="size-8 center text-blue-600 bg-blue-100/50 rounded dark:text-blue-300 dark:bg-blue-900/30"
          >
            <LuEye className="size-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-5">
      {isError ? (
        <ErrorBoundaryFetcher />
      ) : isLoading ? (
        <TableSkeleton columns={columns} rowCount={limit} />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
              <h1 className="text-xl font-medium">Customer Carts</h1>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Input
                placeholder="Search by customer name or email..."
                value={filterData.searchTerm}
                onValueChange={(value) =>
                  setFilterData((prev) => ({ ...prev, searchTerm: value }))
                }
                endIcon={
                  filterData.searchTerm ? (
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
                onClick={handleRefresh}
                disabled={isManualRefreshing}
                className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <LuRefreshCw
                  className={`size-4 text-gray-500 ${isManualRefreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          <Table
            data={items}
            columns={columns}
            pagination
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            totalData={totalData}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}
