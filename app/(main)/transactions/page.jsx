"use client";

import { useState } from "react";
import Link from "next/link";
import moment from "moment";
import {
  LuEye,
  LuRefreshCw,
  LuSearch,
  LuX,
  LuCheck,
  LuRotateCcw,
  LuCreditCard,
  LuWallet,
} from "react-icons/lu";

import { Table } from "@/components/ui/table/Table";
import { Select } from "@/components/ui/select/Select";
import { Input } from "@/components/ui/input/Input";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import { useGetTransactionListQuery } from "@/features/transactions/transactionsApiSlice";

const statusFilterOptions = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

const methodFilterOptions = [
  { value: "", label: "All Methods" },
  { value: "cash-on-delivery", label: "Cash on Delivery" },
  { value: "sslcommerz", label: "SSLCommerz" },
];

const refundMethodOptions = [
  { value: "", label: "Select Method" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "bank-transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "sslcommerz-reverse", label: "SSLCommerz Reverse" },
];

const statusConfig = {
  pending: {
    icon: LuCreditCard,
    color:
      "text-yellow-600 bg-yellow-100/50 dark:text-yellow-300 dark:bg-yellow-900/30",
  },
  paid: {
    icon: LuCheck,
    color:
      "text-green-600 bg-green-100/50 dark:text-green-300 dark:bg-green-900/30",
  },
  failed: {
    icon: LuX,
    color: "text-red-600 bg-red-100/50 dark:text-red-300 dark:bg-red-900/30",
  },
  cancelled: {
    icon: LuX,
    color:
      "text-gray-600 bg-gray-100/50 dark:text-gray-300 dark:bg-gray-900/30",
  },
  refunded: {
    icon: LuRotateCcw,
    color:
      "text-orange-600 bg-orange-100/50 dark:text-orange-300 dark:bg-orange-900/30",
  },
};

const methodConfig = {
  "cash-on-delivery": {
    icon: LuWallet,
    label: "COD",
    color:
      "text-amber-700 bg-amber-100/60 dark:text-amber-300 dark:bg-amber-900/30",
  },
  sslcommerz: {
    icon: LuCreditCard,
    label: "SSLCommerz",
    color:
      "text-emerald-700 bg-emerald-100/60 dark:text-emerald-300 dark:bg-emerald-900/30",
  },
};

export default function TransactionsPage() {
  const [filterData, setFilterData] = useState({
    searchTerm: "",
    status: "",
    method: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useGetTransactionListQuery({
    searchTerm: filterData.searchTerm || undefined,
    status: filterData.status || undefined,
    method: filterData.method || undefined,
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
      id: "transactionId",
      header: "Transaction ID",
      cell: (_, row) => (
        <Link
          href={`/transactions/${row._id}`}
          className="font-mono text-sm font-semibold text-primary hover:underline"
        >
          {row.transactionId || row._id?.slice(-8) || "---"}
        </Link>
      ),
    },
    {
      id: "order",
      header: "Order",
      cell: (_, row) => (
        <Link
          href={`/orders/${row?.order}`}
          className="font-mono font-semibold text-primary hover:underline"
        >
          {row?.orderNumber || "---"}
        </Link>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      cell: (_, row) => (
        <span className="font-semibold text-gray-800 dark:text-white">
          ৳{(row.amount || 0).toLocaleString("en-BD")}
        </span>
      ),
    },
    {
      id: "method",
      header: "Method",
      cell: (_, row) => {
        const config =
          methodConfig[row.method] || methodConfig["cash-on-delivery"];
        const Icon = config.icon;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
          >
            <Icon className="size-3.5" />
            {config.label}
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: (_, row) => {
        const config = statusConfig[row.status] || statusConfig.pending;
        const Icon = config.icon;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${config.color}`}
          >
            <Icon className="size-3.5" />
            {row.status}
          </span>
        );
      },
    },
    {
      id: "date",
      header: "Date",
      cell: (_, row) => (
        <div className="text-sm">
          <p className="text-gray-800 dark:text-white">
            {moment(row.createdAt).format("DD MMM YYYY")}
          </p>
          <p className="text-xs text-gray-500">
            {moment(row.createdAt).format("hh:mm A")}
          </p>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (_, row) => (
        <div className="flex justify-end">
          <Link
            href={`/transactions/${row._id}`}
            className="size-8 center text-blue-600 bg-blue-100/50 rounded dark:text-blue-300 dark:bg-blue-900/30"
            title="View Details"
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
              <h1 className="text-xl font-medium">Transactions</h1>
              <p className="text-sm text-gray-500">
                {totalData} total transaction(s)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
              <Input
                placeholder="Search by transaction ID, order..."
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
              <Select
                options={statusFilterOptions}
                value={filterData.status}
                onValueChange={(value) =>
                  setFilterData((prev) => ({ ...prev, status: value }))
                }
                placeholder="Filter by Status"
                className="w-full sm:w-40"
              />
              <Select
                options={methodFilterOptions}
                value={filterData.method}
                onValueChange={(value) =>
                  setFilterData((prev) => ({ ...prev, method: value }))
                }
                placeholder="Filter by Method"
                className="w-full sm:w-44"
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
