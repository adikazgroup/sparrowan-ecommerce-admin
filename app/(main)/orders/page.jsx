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
  LuRotateCcw,
  LuShoppingBag,
  LuWallet,
  LuMapPin,
  LuDollarSign,
  LuBarChart2,
} from "react-icons/lu";

import { Table } from "@/components/ui/table/Table";
import { Input } from "@/components/ui/input/Input";
import { Select } from "@/components/ui/select/Select";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import {
  useGetOrderListQuery,
  useGetOrderStatsQuery,
} from "@/features/orders/ordersApiSlice";

const statusFilterOptions = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
];

const orderTypeFilterOptions = [
  { value: "", label: "All Types" },
  { value: "cod", label: "Cash on Delivery" },
  { value: "pickup", label: "Pickup" },
  { value: "online-payment", label: "Online Payment" },
];

const statusConfig = {
  pending: {
    icon: LuClock,
    color:
      "text-yellow-600 bg-yellow-100/50 dark:text-yellow-300 dark:bg-yellow-900/30",
  },
  confirmed: {
    icon: LuCheck,
    color:
      "text-blue-600 bg-blue-100/50 dark:text-blue-300 dark:bg-blue-900/30",
  },
  shipped: {
    icon: LuTruck,
    color:
      "text-indigo-600 bg-indigo-100/50 dark:text-indigo-300 dark:bg-indigo-900/30",
  },
  delivered: {
    icon: LuCheck,
    color:
      "text-green-600 bg-green-100/50 dark:text-green-300 dark:bg-green-900/30",
  },
  cancelled: {
    icon: LuX,
    color: "text-red-600 bg-red-100/50 dark:text-red-300 dark:bg-red-900/30",
  },
  returned: {
    icon: LuRotateCcw,
    color:
      "text-orange-600 bg-orange-100/50 dark:text-orange-300 dark:bg-orange-900/30",
  },
};

const orderTypeConfig = {
  cod: {
    icon: LuWallet,
    label: "COD",
    color:
      "text-amber-700 bg-amber-100/60 dark:text-amber-300 dark:bg-amber-900/30",
  },
  pickup: {
    icon: LuMapPin,
    label: "Pickup",
    color:
      "text-cyan-700 bg-cyan-100/60 dark:text-cyan-300 dark:bg-cyan-900/30",
  },
  "online-payment": {
    icon: LuShoppingBag,
    label: "Online",
    color:
      "text-emerald-700 bg-emerald-100/60 dark:text-emerald-300 dark:bg-emerald-900/30",
  },
};

export default function OrdersPage() {
  const [filterData, setFilterData] = useState({
    searchTerm: "",
    status: "",
    orderType: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useGetOrderListQuery({
    searchTerm: filterData.searchTerm || undefined,
    status: filterData.status || undefined,
    orderType: filterData.orderType || undefined,
    page,
    limit,
  });

  const { data: statsData } = useGetOrderStatsQuery();
  const rawStats = statsData?.data?.byStatus || [];
  const getStatByStatus = (s) =>
    rawStats.find((x) => x._id === s) || { count: 0, totalAmount: 0 };
  const pendingCount =
    getStatByStatus("pending").count + getStatByStatus("pending_payment").count;
  const confirmedCount = getStatByStatus("confirmed").count;
  const deliveredCount = getStatByStatus("delivered").count;
  const todayOrders = statsData?.data?.todayOrders || 0;
  const todayRevenue = statsData?.data?.todayRevenue || 0;

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
      id: "orderNumber",
      header: "Order #",
      cell: (_, row) => (
        <Link
          href={`/orders/${row._id}`}
          className="font-mono font-semibold text-primary hover:underline"
        >
          {row.orderNumber}
        </Link>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: (_, row) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white">
            {row.customer?.name || row.shippingAddress?.name || "Guest"}
          </p>
          <p className="text-xs text-gray-500">
            {row.shippingAddress?.phone || "---"}
          </p>
        </div>
      ),
    },
    {
      id: "items",
      header: "Items",
      cell: (_, row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.items?.length || 0} item(s)
        </span>
      ),
    },
    {
      id: "total",
      header: "Total",
      cell: (_, row) => (
        <span className="font-semibold text-gray-800 dark:text-white">
          ৳{(row.total || 0).toLocaleString("en-BD")}
        </span>
      ),
    },
    {
      id: "orderType",
      header: "Type",
      cell: (_, row) => {
        const config = orderTypeConfig[row.orderType] || orderTypeConfig.cod;
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
            {moment(row.placedAt || row.createdAt).format("DD MMM YYYY")}
          </p>
          <p className="text-xs text-gray-500">
            {moment(row.placedAt || row.createdAt).format("hh:mm A")}
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
            href={`/orders/${row._id}`}
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
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide">
              Today Orders
            </p>
            <LuShoppingBag className="size-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {todayOrders}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800/30">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase tracking-wide">
              Today Revenue
            </p>
            <LuDollarSign className="size-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            ৳{todayRevenue.toLocaleString("en-BD")}
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-100 dark:border-yellow-800/30">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium uppercase tracking-wide">
              Pending
            </p>
            <LuClock className="size-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {pendingCount}
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wide">
              Delivered
            </p>
            <LuCheck className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {deliveredCount}
          </p>
        </div>
      </div>
      {isError ? (
        <ErrorBoundaryFetcher />
      ) : isLoading ? (
        <TableSkeleton columns={columns} rowCount={limit} />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
              <h1 className="text-xl font-medium">Orders</h1>
              <p className="text-sm text-gray-500">
                {totalData} total order(s)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Input
                placeholder="Search by order #, customer, phone..."
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
                options={orderTypeFilterOptions}
                value={filterData.orderType}
                onValueChange={(value) =>
                  setFilterData((prev) => ({ ...prev, orderType: value }))
                }
                placeholder="Filter by Type"
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
