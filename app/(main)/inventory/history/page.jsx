"use client";

import { useState } from "react";
import moment from "moment";
import {
  LuEye,
  LuArrowUp,
  LuArrowDown,
  LuPackage,
  LuRotateCcw,
  LuTruck,
  LuTriangleAlert,
} from "react-icons/lu";

import { useModal } from "@/lib/useModal";
import { Table } from "@/components/ui/table/Table";
import { Button } from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal/Modal";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import SimpleManageHeader from "@/components/section/SimpleManageHeader";
import { useGetStockLogListQuery } from "@/features/inventory/stockLogsApiSlice";

const typeConfig = {
  purchase: {
    icon: <LuPackage className="size-4" />,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  sale: {
    icon: <LuArrowDown className="size-4" />,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  return_in: {
    icon: <LuRotateCcw className="size-4" />,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  return_out: {
    icon: <LuRotateCcw className="size-4" />,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  adjustment: {
    icon: <LuArrowUp className="size-4" />,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  transfer_in: {
    icon: <LuTruck className="size-4" />,
    color: "text-teal-600",
    bg: "bg-teal-100",
  },
  transfer_out: {
    icon: <LuTruck className="size-4" />,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  damaged: {
    icon: <LuTriangleAlert className="size-4" />,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  expired: {
    icon: <LuTriangleAlert className="size-4" />,
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
};

export default function StockHistoryPage() {
  const viewModal = useModal();
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useGetStockLogListQuery({
    searchTerm,
    type: statusFilter || undefined,
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

  const columns = [
    {
      id: "product",
      header: "Product",
      cell: (_, row) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white">
            {row.productName || "---"}
          </p>
          <p className="text-xs text-gray-500">
            {row.warehouseName || "Default"}
          </p>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: (_, row) => {
        const config = typeConfig[row.type] || {
          icon: null,
          color: "text-gray-600",
          bg: "bg-gray-100",
        };
        return (
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}
          >
            {config.icon}
            <span className="capitalize">{row.type?.replace("_", " ")}</span>
          </div>
        );
      },
    },
    {
      id: "quantity",
      header: "Qty",
      cell: (_, row) => (
        <span
          className={`font-medium ${row.quantity > 0 ? "text-green-600" : "text-red-600"}`}
        >
          {row.quantity > 0 ? "+" : ""}
          {row.quantity}
        </span>
      ),
    },
    {
      id: "stock",
      header: "Stock Change",
      cell: (_, row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.previousStock} → {row.currentStock}
        </span>
      ),
    },
    {
      id: "cost",
      header: "Cost",
      cell: (_, row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.totalCost ? `$${row.totalCost.toFixed(2)}` : "---"}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Date",
      cell: (_, row) => (
        <span className="text-sm text-gray-500">
          {moment(row.createdAt).format("DD MMM YYYY HH:mm")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (_, row) => (
        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem(row);
              viewModal.open();
            }}
            className="size-8 center text-blue-600 bg-blue-100/50 rounded"
          >
            <LuEye className="size-4" />
          </button>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Stock History
            </h1>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isManualRefreshing}
              >
                <LuRotateCcw
                  className={`size-4 ${isManualRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
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

      <Modal
        open={viewModal.isOpen}
        onClose={viewModal.close}
        title="Stock Log Details"
        size="medium"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Product
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedItem.productName}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Type
                </label>
                <p className="text-gray-800 dark:text-white capitalize">
                  {selectedItem.type?.replace("_", " ")}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedItem.quantity}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Warehouse
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedItem.warehouseName || "Default"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Previous Stock
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedItem.previousStock}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Current Stock
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedItem.currentStock}
                </p>
              </div>
              {selectedItem.unitCost && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Unit Cost
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    ${selectedItem.unitCost.toFixed(2)}
                  </p>
                </div>
              )}
              {selectedItem.totalCost && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Total Cost
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    ${selectedItem.totalCost.toFixed(2)}
                  </p>
                </div>
              )}
              {selectedItem.notes && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Notes
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {selectedItem.notes}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={viewModal.close}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
