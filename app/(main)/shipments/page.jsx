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
  LuClock,
  LuTruck,
  LuPackage,
  LuPlus,
  LuMapPin,
} from "react-icons/lu";

import { Table } from "@/components/ui/table/Table";
import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
import { Select } from "@/components/ui/select/Select";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import { useGetShipmentListQuery } from "@/features/shipments/shipmentsApiSlice";

const statusFilterOptions = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "picked-up", label: "Picked Up" },
  { value: "in-transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "return-to-sender", label: "Return to Sender" },
  { value: "cancelled", label: "Cancelled" },
];

const courierFilterOptions = [
  { value: "", label: "All Couriers" },
  { value: "PATHAO", label: "Pathao" },
  { value: "SUNDARBAN", label: "Sundarban" },
  { value: "MANUAL", label: "Manual" },
];

const statusConfig = {
  pending: {
    icon: LuClock,
    color:
      "text-yellow-600 bg-yellow-100/50 dark:text-yellow-300 dark:bg-yellow-900/30",
  },
  "picked-up": {
    icon: LuPackage,
    color:
      "text-blue-600 bg-blue-100/50 dark:text-blue-300 dark:bg-blue-900/30",
  },
  "in-transit": {
    icon: LuTruck,
    color:
      "text-indigo-600 bg-indigo-100/50 dark:text-indigo-300 dark:bg-indigo-900/30",
  },
  delivered: {
    icon: LuCheck,
    color:
      "text-green-600 bg-green-100/50 dark:text-green-300 dark:bg-green-900/30",
  },
  "return-to-sender": {
    icon: LuMapPin,
    color:
      "text-orange-600 bg-orange-100/50 dark:text-orange-300 dark:bg-orange-900/30",
  },
  cancelled: {
    icon: LuX,
    color: "text-red-600 bg-red-100/50 dark:text-red-300 dark:bg-red-900/30",
  },
};

const courierConfig = {
  PATHAO: {
    label: "Pathao",
    color:
      "text-emerald-700 bg-emerald-100/60 dark:text-emerald-300 dark:bg-emerald-900/30",
  },
  SUNDARBAN: {
    label: "Sundarban",
    color:
      "text-cyan-700 bg-cyan-100/60 dark:text-cyan-300 dark:bg-cyan-900/30",
  },
  MANUAL: {
    label: "Manual",
    color:
      "text-gray-700 bg-gray-100/60 dark:text-gray-300 dark:bg-gray-800/60",
  },
};

export default function ShipmentsPage() {
  const [filterData, setFilterData] = useState({
    searchTerm: "",
    deliveryStatus: "",
    courier: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useGetShipmentListQuery({
    searchTerm: filterData.searchTerm || undefined,
    deliveryStatus: filterData.deliveryStatus || undefined,
    courier: filterData.courier || undefined,
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
      id: "trackingNumber",
      header: "Tracking #",
      cell: (_, row) => (
        <Link
          href={`/shipments/${row._id}`}
          className="font-mono font-semibold text-primary hover:underline text-sm"
        >
          {row.trackingNumber || "---"}
        </Link>
      ),
    },
    {
      id: "order",
      header: "Order",
      cell: (_, row) => (
        <Link
          href={`/orders/${row.order?._id}`}
          className="font-mono font-semibold text-primary hover:underline"
        >
          {row.order?.orderNumber || "---"}
        </Link>
      ),
    },
    {
      id: "courier",
      header: "Courier",
      cell: (_, row) => {
        const config = courierConfig[row.courier] || courierConfig.MANUAL;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      id: "recipient",
      header: "Recipient",
      cell: (_, row) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white text-sm">
            {row.recipientName || "---"}
          </p>
          <p className="text-xs text-gray-500">{row.recipientPhone || ""}</p>
        </div>
      ),
    },
    {
      id: "cod",
      header: "COD Amount",
      cell: (_, row) => (
        <span className="font-semibold text-gray-800 dark:text-white">
          {row.codAmount > 0
            ? `৳${row.codAmount.toLocaleString("en-BD")}`
            : "---"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (_, row) => {
        const config = statusConfig[row.deliveryStatus] || statusConfig.pending;
        const Icon = config.icon;
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${config.color}`}
          >
            <Icon className="size-3.5" />
            {(row.deliveryStatus || "pending").replace("_", " ")}
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
      header: "Actions",
      cell: (_, row) => (
        <div className="flex justify-end gap-1">
          <Link
            href={`/shipments/${row._id}`}
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
              <h1 className="text-xl font-medium">Shipments</h1>
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-500">
                  {totalData} total shipment(s)
                </p>
                <Link href="/shipments/create">
                  <Button>
                    <LuPlus className="size-4" />
                    Create Shipment
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
              <Input
                placeholder="Search by tracking #, order..."
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
                value={filterData.deliveryStatus}
                onValueChange={(value) =>
                  setFilterData((prev) => ({
                    ...prev,
                    deliveryStatus: value,
                  }))
                }
                placeholder="Filter by Status"
                className="w-full sm:w-40"
              />
              <Select
                options={courierFilterOptions}
                value={filterData.courier}
                onValueChange={(value) =>
                  setFilterData((prev) => ({ ...prev, courier: value }))
                }
                placeholder="Filter by Courier"
                className="w-full sm:w-40"
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
