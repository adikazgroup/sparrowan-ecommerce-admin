"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import moment from "moment";
import Link from "next/link";
import {
  LuEye,
  LuPencil,
  LuTrash2,
  LuCheck,
  LuX,
  LuPercent,
  LuDollarSign,
  LuCopy,
} from "react-icons/lu";

import { useModal } from "@/lib/useModal";
import { Table } from "@/components/ui/table/Table";
import { Button } from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal/Modal";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import CouponManageHeader from "@/components/section/couponSection/CouponManageHeader";
import {
  useGetCouponListQuery,
  useDeleteCouponMutation,
} from "@/features/coupons/couponsApiSlice";
import { handleToast } from "@/utils/handleToast";

const getStatusBadge = (status) => {
  const config = {
    active: {
      icon: <LuCheck className="size-3.5" />,
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    },
    inactive: {
      icon: <LuX className="size-3.5" />,
      className:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
    },
    expired: {
      icon: <LuX className="size-3.5" />,
      className: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    },
  };
  const { icon, className } = config[status] || config.inactive;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${className}`}
    >
      {icon}
      {status}
    </span>
  );
};

const getTypeBadge = (type) => {
  const config = {
    flat: {
      icon: <LuDollarSign className="size-3.5" />,
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    },
    percentage: {
      icon: <LuPercent className="size-3.5" />,
      className:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
    },
  };
  const { icon, className } = config[type] || config.flat;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${className}`}
    >
      {icon}
      {type}
    </span>
  );
};

export default function CouponsPage() {
  const [deleteCoupon, { isLoading: deleteLoading }] =
    useDeleteCouponMutation();

  const viewModal = useModal();
  const deleteModal = useModal();

  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useGetCouponListQuery({
    searchTerm,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
    page,
    limit,
  });

  const coupons = data?.data || [];
  const totalData = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPage || 0;

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setIsManualRefreshing(false);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
  };

  const confirmDelete = async () => {
    if (!selectedCoupon?._id) {
      toast.error("Coupon not selected");
      return;
    }
    const loadingToast = toast.loading("Deleting coupon...");
    const result = await deleteCoupon(selectedCoupon._id);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "delete-coupon",
      message: "Coupon deleted successfully!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) {
      deleteModal.close();
      setSelectedCoupon(null);
    }
  };

  const columns = [
    {
      id: "coupon",
      header: "Coupon",
      cell: (_, row) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white">
            {row.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <code className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
              {row.code}
            </code>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyCode(row.code);
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Copy code"
            >
              <LuCopy className="size-3.5 text-gray-500" />
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "discount",
      header: "Discount",
      cell: (_, row) => (
        <div className="flex items-center gap-2">
          {getTypeBadge(row.type)}
          <span className="font-semibold text-gray-800 dark:text-white">
            {row.type === "percentage"
              ? `${row.discountValue}%`
              : `৳${row.discountValue}`}
          </span>
        </div>
      ),
    },
    {
      id: "usage",
      header: "Usage",
      cell: (_, row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.usedCount} / {row.usageLimit || "∞"}
        </span>
      ),
    },
    {
      id: "validity",
      header: "Validity",
      cell: (_, row) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>{moment(row.startDate).format("DD MMM")}</p>
          <p className="text-xs">
            to {moment(row.endDate).format("DD MMM, YYYY")}
          </p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (_, row) => getStatusBadge(row.status),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (_, row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCoupon(row);
              viewModal.open();
            }}
            className="size-8 center text-blue-600 bg-blue-100/50 rounded dark:text-blue-300 dark:bg-blue-900/30"
            aria-label="View"
          >
            <LuEye className="size-4" />
          </button>
          <Link
            href={`/coupons/edit/${row._id}`}
            onClick={(e) => e.stopPropagation()}
            className="size-8 center text-amber-600 bg-amber-100/50 rounded dark:text-amber-300 dark:bg-amber-900/30"
            aria-label="Edit"
          >
            <LuPencil className="size-4" />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCoupon(row);
              deleteModal.open();
            }}
            className="size-8 center text-destructive bg-red-100/50 rounded dark:text-red-300 dark:bg-red-900/30"
            aria-label="Delete"
          >
            <LuTrash2 className="size-4" />
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
          <CouponManageHeader
            pageTitle="Coupons"
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            addHref="/coupons/add"
            onRefresh={handleRefresh}
            isRefreshing={isManualRefreshing}
          />
          <Table
            data={coupons}
            columns={columns}
            pagination={true}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            totalData={totalData}
            totalPages={totalPages}
          />
        </>
      )}

      {/* View Modal */}
      <Modal
        open={viewModal.isOpen}
        onClose={viewModal.close}
        title="Coupon Details"
        size="large"
      >
        {selectedCoupon && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Name
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedCoupon.name}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Code
                </label>
                <code className="block mt-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">
                  {selectedCoupon.code}
                </code>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Type
                </label>
                <div className="mt-1">{getTypeBadge(selectedCoupon.type)}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Discount
                </label>
                <p className="text-gray-800 dark:text-white text-lg font-semibold">
                  {selectedCoupon.type === "percentage"
                    ? `${selectedCoupon.discountValue}%`
                    : `৳${selectedCoupon.discountValue}`}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Min Order Amount
                </label>
                <p className="text-gray-800 dark:text-white">
                  ৳{selectedCoupon.minOrderAmount || 0}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Usage
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedCoupon.usedCount} /{" "}
                  {selectedCoupon.usageLimit || "Unlimited"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Start Date
                </label>
                <p className="text-gray-800 dark:text-white">
                  {moment(selectedCoupon.startDate).format("DD MMMM, YYYY")}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  End Date
                </label>
                <p className="text-gray-800 dark:text-white">
                  {moment(selectedCoupon.endDate).format("DD MMMM, YYYY")}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </label>
                <div className="mt-1">
                  {getStatusBadge(selectedCoupon.status)}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Public
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedCoupon.isPublic ? "Yes" : "No"}
                </p>
              </div>
            </div>
            {selectedCoupon.description && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Description
                </label>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {selectedCoupon.description}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={viewModal.close}>
                Close
              </Button>
              <Link href={`/coupons/edit/${selectedCoupon._id}`}>
                <Button onClick={viewModal.close}>Edit</Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete Coupon"
        size="medium"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete coupon{" "}
            <strong className="text-gray-800 dark:text-white">
              {selectedCoupon?.code}
            </strong>
            ? This action cannot be undone.
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
              disabled={deleteLoading}
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
