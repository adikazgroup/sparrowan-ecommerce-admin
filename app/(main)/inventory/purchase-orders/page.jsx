"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  LuEye,
  LuTrash2,
  LuCheck,
  LuX,
  LuPackage,
  LuPlus,
  LuSearch,
  LuRefreshCw,
  LuClock,
  LuPencil,
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
  useGetPurchaseOrdersQuery,
  useDeletePurchaseOrderMutation,
  useCancelPurchaseOrderMutation,
} from "@/features/inventory/purchaseOrdersApiSlice";
import { handleToast } from "@/utils/handleToast";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "confirmed", label: "Confirmed" },
  { value: "received", label: "Received" },
  { value: "cancelled", label: "Cancelled" },
];

const paymentStatusOptions = [
  { value: "", label: "All Payment" },
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
];

const getStatusBadge = (status) => {
  const styles = {
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    confirmed:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    received:
      "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  };
  const icons = {
    draft: <LuPencil className="size-3.5" />,
    confirmed: <LuCheck className="size-3.5" />,
    received: <LuPackage className="size-3.5" />,
    cancelled: <LuX className="size-3.5" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || styles.draft}`}
    >
      {icons[status]} {status}
    </span>
  );
};

const formatCurrency = (amount) => `৳${(amount || 0).toLocaleString()}`;
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "---";

export default function PurchaseOrdersPage() {
  const [deletePO, { isLoading: deleteLoading }] =
    useDeletePurchaseOrderMutation();
  const [cancelPO, { isLoading: cancelLoading }] =
    useCancelPurchaseOrderMutation();
  const deleteModal = useModal();
  const cancelModal = useModal();

  const [selectedItem, setSelectedItem] = useState(null);
  const [filterData, setFilterData] = useState({
    searchTerm: "",
    status: "",
    paymentStatus: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useGetPurchaseOrdersQuery({
    searchTerm: filterData.searchTerm,
    status: filterData.status || undefined,
    paymentStatus: filterData.paymentStatus || undefined,
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

  const confirmDelete = async () => {
    if (!selectedItem?._id) return;
    const result = await deletePO(selectedItem._id);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "delete-po",
      message: "Purchase order deleted!",
    });
    if (result?.data) {
      deleteModal.close();
      setSelectedItem(null);
    }
  };

  const confirmCancel = async () => {
    if (!selectedItem?._id) return;
    const result = await cancelPO(selectedItem._id);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "cancel-po",
      message: "Purchase order cancelled!",
    });
    if (result?.data) {
      cancelModal.close();
      setSelectedItem(null);
    }
  };

  const columns = [
    {
      id: "poNumber",
      header: "PO Number",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <LuPackage className="size-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">
              {row.poNumber}
            </p>
            <p className="text-xs text-gray-500">
              {row.items?.length || 0} items
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "supplier",
      header: "Supplier",
      cell: (_, row) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {row.supplier?.name || "---"}
        </span>
      ),
    },
    {
      id: "total",
      header: "Amount Info",
      cell: (_, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800 dark:text-white">
            Total: {formatCurrency(row.total)}
          </span>
          <span className="text-xs text-gray-500">
            Paid: {formatCurrency(row.paidAmount || 0)}
          </span>
        </div>
      ),
    },
    {
      id: "paymentStatus",
      header: "Payment Status",
      cell: (_, row) => {
        const paymentStyles = {
          pending:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
          partial:
            "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
          paid: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
        };
        const paymentIcons = {
          pending: <LuClock className="size-3.5" />,
          partial: <LuClock className="size-3.5" />,
          paid: <LuCheck className="size-3.5" />,
        };
        const status = row.paymentStatus || "pending";
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${paymentStyles[status]}`}
          >
            {paymentIcons[status]} {status}
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: (_, row) => getStatusBadge(row.status),
    },
    {
      id: "orderDate",
      header: "Date",
      cell: (_, row) => (
        <span className="text-gray-500 text-sm">
          {formatDate(row.orderDate)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (_, row) => (
        <div className="flex justify-end gap-1">
          <Link
            href={`/inventory/purchase-orders/${row._id}`}
            onClick={(e) => e.stopPropagation()}
            className="size-8 center text-blue-600 bg-blue-100/50 rounded dark:text-blue-300 dark:bg-blue-900/30"
          >
            <LuEye className="size-4" />
          </Link>
          {row.status === "draft" && (
            <Link
              href={`/inventory/purchase-orders/edit/${row._id}`}
              onClick={(e) => e.stopPropagation()}
              className="size-8 center text-amber-600 bg-amber-100/50 rounded dark:text-amber-300 dark:bg-amber-900/30"
            >
              <LuPencil className="size-4" />
            </Link>
          )}
          {!["received", "cancelled"].includes(row.status) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem(row);
                cancelModal.open();
              }}
              className="size-8 center text-orange-600 bg-orange-100/50 rounded dark:text-orange-300 dark:bg-orange-900/30"
            >
              <LuX className="size-4" />
            </button>
          )}
          {["draft", "cancelled"].includes(row.status) && (
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
          <div className="flex flex-col gap-4">
            <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
              <h1 className="text-xl font-medium">Purchase Orders</h1>
              <Link href="/inventory/purchase-orders/add">
                <Button className="whitespace-nowrap">
                  <LuPlus className="size-4" /> Create PO
                </Button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Input
                placeholder="Search PO number..."
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
                options={statusOptions}
                value={filterData.status}
                onValueChange={(value) =>
                  setFilterData((prev) => ({ ...prev, status: value }))
                }
                placeholder="Filter by Status"
                className="w-full sm:w-40"
              />
              <Select
                options={paymentStatusOptions}
                value={filterData.paymentStatus}
                onValueChange={(value) =>
                  setFilterData((prev) => ({ ...prev, paymentStatus: value }))
                }
                placeholder="Payment Status"
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

      <Modal
        open={cancelModal.isOpen}
        onClose={cancelModal.close}
        title="Cancel Purchase Order"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to cancel{" "}
            <strong>{selectedItem?.poNumber}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={cancelModal.close}
              disabled={cancelLoading}
            >
              No, Keep It
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              loading={cancelLoading}
            >
              {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete Purchase Order"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <strong>{selectedItem?.poNumber}</strong>? This action cannot be
            undone.
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
