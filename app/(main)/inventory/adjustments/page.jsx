"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import moment from "moment";
import Link from "next/link";
import {
  LuEye,
  LuTrash2,
  LuCheck,
  LuX,
  LuClock,
  LuArrowUp,
  LuArrowDown,
  LuMinus,
  LuPlus,
  LuSearch,
  LuRefreshCw,
  LuWarehouse,
  LuPackage,
} from "react-icons/lu";

import { useModal } from "@/lib/useModal";
import { Table } from "@/components/ui/table/Table";
import { Button } from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal/Modal";
import { Input } from "@/components/ui/input/Input";
import { Select } from "@/components/ui/select/Select";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import {
  useGetStockAdjustmentListQuery,
  useGetSingleStockAdjustmentQuery,
  useApproveStockAdjustmentMutation,
  useDeleteStockAdjustmentMutation,
} from "@/features/inventory/stockAdjustmentsApiSlice";
import { handleToast } from "@/utils/handleToast";
import { adjustmentStatusOptions } from "@/utils/DataHelper";

const typeIcons = {
  increase: <LuArrowUp className="size-4 text-green-500" />,
  decrease: <LuArrowDown className="size-4 text-red-500" />,
  set: <LuMinus className="size-4 text-blue-500" />,
};
const statusColors = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

const adjustmentTypeOptions = [
  { value: "", label: "All Types" },
  { value: "increase", label: "Increase" },
  { value: "decrease", label: "Decrease" },
];

// Helper to format variant attributes
const formatVariantLabel = (row) => {
  const attrs = [];
  if (row.variantAttributes?.size) attrs.push(row.variantAttributes.size);
  if (row.variantAttributes?.color) attrs.push(row.variantAttributes.color);
  if (row.variantAttributes?.material)
    attrs.push(row.variantAttributes.material);
  if (attrs.length > 0) return attrs.join(" / ");
  return row.variantSku || "";
};

export default function StockAdjustmentsPage() {
  const [approveAdjustment, { isLoading: approveLoading }] =
    useApproveStockAdjustmentMutation();
  const [deleteAdjustment, { isLoading: deleteLoading }] =
    useDeleteStockAdjustmentMutation();
  const viewModal = useModal();
  const deleteModal = useModal();
  const approveModal = useModal();

  const [selectedItem, setSelectedItem] = useState(null);
  const [filterData, setFilterData] = useState({
    searchTerm: "",
    status: "",
    adjustmentType: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useGetStockAdjustmentListQuery({
    searchTerm: filterData.searchTerm,
    status: filterData.status || undefined,
    adjustmentType: filterData.adjustmentType || undefined,
    page,
    limit,
  });

  // Fetch full details when viewing a single adjustment
  const { data: singleData } = useGetSingleStockAdjustmentQuery(
    selectedItem?._id,
    { skip: !selectedItem?._id || !viewModal.isOpen },
  );
  const detailItem = singleData?.data || selectedItem;

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

  const confirmDelete = async () => {
    if (!selectedItem?._id) return;
    const result = await deleteAdjustment(selectedItem._id);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "delete-adjustment",
      message: "Adjustment deleted!",
    });
    if (result?.data) {
      deleteModal.close();
      setSelectedItem(null);
    }
  };

  const handleApprove = async (status) => {
    if (!selectedItem?._id) return;
    const loadingToast = toast.loading(
      `${status === "approved" ? "Approving" : "Rejecting"}...`,
    );
    const result = await approveAdjustment({
      id: selectedItem._id,
      data: { status },
    });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "approve-adjustment",
      message: `Adjustment ${status}!`,
    });
    toast.dismiss(loadingToast);
    if (result?.data) {
      approveModal.close();
      setSelectedItem(null);
    }
  };

  const columns = [
    {
      id: "product",
      header: "Product / Variant",
      cell: (_, row) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white">
            {row.productName || "---"}
          </p>
          {formatVariantLabel(row) && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <LuPackage className="size-3" />
              {formatVariantLabel(row)}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "warehouse",
      header: "Warehouse",
      cell: (_, row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <LuWarehouse className="size-3.5" />
          {row.warehouseName || "---"}
        </span>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: (_, row) => (
        <div className="flex items-center gap-2">
          {typeIcons[row.adjustmentType]}
          <span className="capitalize text-sm">{row.adjustmentType}</span>
        </div>
      ),
    },
    {
      id: "quantity",
      header: "Qty",
      cell: (_, row) => (
        <span
          className={`font-medium ${row.adjustmentType === "increase" ? "text-green-600" : row.adjustmentType === "decrease" ? "text-red-600" : "text-blue-600"}`}
        >
          {row.adjustmentType === "increase"
            ? "+"
            : row.adjustmentType === "decrease"
              ? "-"
              : ""}
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
      id: "status",
      header: "Status",
      cell: (_, row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[row.status]}`}
        >
          {row.status === "pending" ? (
            <LuClock className="size-3.5" />
          ) : row.status === "approved" ? (
            <LuCheck className="size-3.5" />
          ) : (
            <LuX className="size-3.5" />
          )}
          {row.status}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Date",
      cell: (_, row) => (
        <span className="text-sm text-gray-500">
          {moment(row.createdAt).format("DD MMM YYYY")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (_, row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem(row);
              viewModal.open();
            }}
            className="size-8 center text-blue-600 bg-blue-100/50 rounded dark:text-blue-300 dark:bg-blue-900/30"
          >
            <LuEye className="size-4" />
          </button>
          {row.status === "pending" && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItem(row);
                  approveModal.open();
                }}
                className="size-8 center text-green-600 bg-green-100/50 rounded dark:text-green-300 dark:bg-green-900/30"
              >
                <LuCheck className="size-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItem(row);
                  deleteModal.open();
                }}
                className="size-8 center text-destructive bg-red-100/50 rounded dark:text-red-300 dark:bg-red-900/30"
              >
                <LuTrash2 className="size-4" />
              </button>
            </>
          )}
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
          {/* Row 1: Title and Add Button */}
          <div className="flex flex-col gap-4">
            <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
              <h1 className="text-xl font-medium">Stock Adjustments</h1>
              <Link href="/inventory/adjustments/add">
                <Button className="whitespace-nowrap">
                  <LuPlus className="size-4" /> Add Adjustment
                </Button>
              </Link>
            </div>

            {/* Row 2: Search, Filters, and Refresh */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Input
                placeholder="Search adjustments..."
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
                options={[
                  { value: "", label: "All Status" },
                  ...adjustmentStatusOptions,
                ]}
                value={filterData.status}
                onValueChange={(value) =>
                  setFilterData((prev) => ({ ...prev, status: value }))
                }
                placeholder="Filter by Status"
                className="w-full sm:w-40"
              />
              <Select
                options={adjustmentTypeOptions}
                value={filterData.adjustmentType}
                onValueChange={(value) =>
                  setFilterData((prev) => ({ ...prev, adjustmentType: value }))
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

      {/* View Details Modal */}
      <Modal
        open={viewModal.isOpen}
        onClose={viewModal.close}
        title="Adjustment Details"
        size="medium"
      >
        {detailItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Product
                </label>
                <p className="text-gray-800 dark:text-white">
                  {detailItem.productName || detailItem.product?.name || "---"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Variant (SKU)
                </label>
                <p className="text-gray-800 dark:text-white">
                  {detailItem.variantSku || detailItem.variant?.sku || "---"}
                </p>
                {(detailItem.variantAttributes ||
                  detailItem.variant?.attributes) && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(() => {
                      const attrs =
                        detailItem.variantAttributes ||
                        detailItem.variant?.attributes;
                      const parts = [];
                      if (attrs?.size) parts.push(attrs.size);
                      if (attrs?.color) parts.push(attrs.color);
                      if (attrs?.material) parts.push(attrs.material);
                      return parts.join(" / ");
                    })()}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Warehouse
                </label>
                <p className="text-gray-800 dark:text-white">
                  {detailItem.warehouseName ||
                    detailItem.warehouse?.name ||
                    "---"}
                </p>
              </div>
              {detailItem.batch?.batchNumber && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Inventory Batch
                  </label>
                  <p className="font-mono font-semibold text-gray-800 dark:text-white">
                    {detailItem.batch.batchNumber}
                  </p>
                  {detailItem.batch.unitCost && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Unit Cost: ৳{detailItem.batch.unitCost?.toFixed(2)}
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Type
                </label>
                <p className="text-gray-800 dark:text-white capitalize flex items-center gap-2">
                  {typeIcons[detailItem.adjustmentType]}
                  {detailItem.adjustmentType}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </label>
                <p
                  className={`font-semibold ${detailItem.adjustmentType === "increase" ? "text-green-600" : detailItem.adjustmentType === "decrease" ? "text-red-600" : "text-blue-600"}`}
                >
                  {detailItem.adjustmentType === "increase"
                    ? "+"
                    : detailItem.adjustmentType === "decrease"
                      ? "-"
                      : ""}
                  {detailItem.quantity}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Status
                </label>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize mt-1 ${statusColors[detailItem.status]}`}
                >
                  {detailItem.status === "pending" ? (
                    <LuClock className="size-3.5" />
                  ) : detailItem.status === "approved" ? (
                    <LuCheck className="size-3.5" />
                  ) : (
                    <LuX className="size-3.5" />
                  )}
                  {detailItem.status}
                </span>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Previous Stock
                </label>
                <p className="text-gray-800 dark:text-white">
                  {detailItem.previousStock}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Current Stock
                </label>
                <p className="text-gray-800 dark:text-white font-semibold">
                  {detailItem.currentStock}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Reason
                </label>
                <p className="text-gray-800 dark:text-white">
                  {detailItem.reason}
                </p>
              </div>
              {detailItem.notes && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Notes
                  </label>
                  <p className="text-gray-700 dark:text-gray-300">
                    {detailItem.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Approval info */}
            {detailItem.status !== "pending" && (
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  {(detailItem.approvedBy?.name ||
                    detailItem.approvedBy?.email) && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        {detailItem.status === "approved"
                          ? "Approved By"
                          : "Rejected By"}
                      </label>
                      <p className="text-gray-800 dark:text-white">
                        {detailItem.approvedBy?.name ||
                          detailItem.approvedBy?.email}
                      </p>
                    </div>
                  )}
                  {detailItem.approvedAt && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        {detailItem.status === "approved"
                          ? "Approved At"
                          : "Rejected At"}
                      </label>
                      <p className="text-gray-800 dark:text-white">
                        {moment(detailItem.approvedAt).format(
                          "DD MMM YYYY, hh:mm A",
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {detailItem.createdBy?.name && (
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>Created by: {detailItem.createdBy.name}</span>
                <span>
                  {moment(detailItem.createdAt).format("DD MMM YYYY, hh:mm A")}
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {detailItem.status === "pending" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    viewModal.close();
                    setTimeout(() => {
                      setSelectedItem(detailItem);
                      approveModal.open();
                    }, 150);
                  }}
                  startIcon={<LuCheck className="size-4" />}
                >
                  Approve / Reject
                </Button>
              )}
              <Button variant="outline" onClick={viewModal.close}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Approve/Reject Modal */}
      <Modal
        open={approveModal.isOpen}
        onClose={approveModal.close}
        title="Approve/Reject Adjustment"
        size="small"
      >
        <div className="space-y-4">
          {selectedItem && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg space-y-1 text-sm">
              <p>
                <span className="text-gray-500">Product:</span>{" "}
                <span className="font-medium text-gray-800 dark:text-white">
                  {selectedItem.productName}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Variant:</span>{" "}
                <span className="font-medium text-gray-800 dark:text-white">
                  {formatVariantLabel(selectedItem) || selectedItem.variantSku}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Action:</span>{" "}
                <span className="font-medium capitalize">
                  {selectedItem.adjustmentType}
                </span>{" "}
                <span className="font-bold">{selectedItem.quantity}</span> units
              </p>
            </div>
          )}
          <p className="text-gray-600 dark:text-gray-400">
            Choose action for this stock adjustment. Approving will update stock
            across the system (variant, warehouse, batches).
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={approveModal.close}
              disabled={approveLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleApprove("rejected")}
              startIcon={<LuX className="size-4" />}
              loading={approveLoading}
              disabled={approveLoading}
            >
              Reject
            </Button>
            <Button
              onClick={() => handleApprove("approved")}
              startIcon={<LuCheck className="size-4" />}
              loading={approveLoading}
              disabled={approveLoading}
            >
              Approve
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete Adjustment"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this adjustment? This action cannot
            be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={deleteModal.close}
              disabled={deleteLoading}
              startIcon={<LuX className="size-4" />}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              loading={deleteLoading}
              startIcon={<LuTrash2 className="size-4" />}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
