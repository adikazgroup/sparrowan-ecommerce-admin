"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import moment from "moment";
import Link from "next/link";
import { LuEye, LuPencil, LuTrash2, LuBox, LuCheck, LuX } from "react-icons/lu";

import { useModal } from "@/lib/useModal";
import { Table } from "@/components/ui/table/Table";
import { Button } from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal/Modal";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import BrandManageHeader from "@/components/section/brandSection/BrandManageHeader";
import {
  useGetBrandListQuery,
  useDeleteBrandMutation,
} from "@/features/brands/brandsApiSlice";
import { handleToast } from "@/utils/handleToast";

export default function BrandsPage() {
  const [deleteBrand, { isLoading: deleteLoading }] = useDeleteBrandMutation();

  // Modal hooks - only view and delete
  const viewModal = useModal();
  const deleteModal = useModal();

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Manual refresh state
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // API call with refetch
  const { data, isLoading, isError, refetch } = useGetBrandListQuery({
    searchTerm,
    status: statusFilter || undefined,
    page,
    limit,
  });

  const brands = data?.data || [];
  const totalData = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPage || 0;

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setIsManualRefreshing(false);
  };

  // Confirm delete with handleToast
  const confirmDelete = async () => {
    if (!selectedBrand?._id) {
      toast.error("Brand not selected");
      return;
    }

    const loadingToast = toast.loading("Deleting brand...");
    const result = await deleteBrand(selectedBrand._id);

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "delete-brand",
      message: "Brand deleted successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      deleteModal.close();
      setSelectedBrand(null);
    }
  };

  // Define columns
  const columns = [
    {
      id: "name",
      header: "Brand",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          {row.logo?.url ? (
            <img
              src={row.logo.url}
              alt={row.name}
              className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <LuBox className="size-4 text-primary" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-800 dark:text-white">
              {row.name || "---"}
            </p>
            <p className="text-xs text-gray-500">{row.slug || "---"}</p>
          </div>
        </div>
      ),
    },
    {
      id: "description",
      header: "Description",
      cell: (_, row) => (
        <span
          className="text-gray-600 dark:text-gray-400 text-sm max-w-[150px] truncate block"
          title={row.description || ""}
        >
          {row.description
            ? row.description.length > 30
              ? row.description.substring(0, 30) + "..."
              : row.description
            : "---"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (_, row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
            row.status === "active"
              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
          }`}
        >
          {row.status === "active" ? (
            <LuCheck className="size-3.5" />
          ) : (
            <LuX className="size-3.5" />
          )}
          {row.status || "---"}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      cell: (_, row) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {row.createdAt
            ? moment(row.createdAt).format("DD MMMM, YYYY")
            : "---"}
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
              setSelectedBrand(row);
              viewModal.open();
            }}
            className="size-8 center text-blue-600 bg-blue-100/50 rounded dark:text-blue-300 dark:bg-blue-900/30"
            aria-label="View"
          >
            <LuEye className="size-4" />
          </button>
          <Link
            href={`/brands/edit/${row._id}`}
            onClick={(e) => e.stopPropagation()}
            className="size-8 center text-amber-600 bg-amber-100/50 rounded dark:text-amber-300 dark:bg-amber-900/30"
            aria-label="Edit"
          >
            <LuPencil className="size-4" />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBrand(row);
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
          {/* Header with Search and Refresh */}
          <BrandManageHeader
            pageTitle="Brands"
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            addHref="/brands/add"
            onRefresh={handleRefresh}
            isRefreshing={isManualRefreshing}
          />

          {/* Table */}
          <Table
            data={brands}
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
        title="Brand Details"
        size="large"
      >
        {selectedBrand && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {selectedBrand.logo?.url ? (
                <img
                  src={selectedBrand.logo.url}
                  alt={selectedBrand.name}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <LuBox className="size-6 text-primary" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {selectedBrand.name}
                </h3>
                <p className="text-sm text-gray-500">{selectedBrand.slug}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Description
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedBrand.description || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </label>
                <p className="text-gray-800 dark:text-white capitalize">
                  {selectedBrand.status}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Created At
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedBrand.createdAt
                    ? moment(selectedBrand.createdAt).format("DD MMMM, YYYY")
                    : "N/A"}
                </p>
              </div>
              {selectedBrand.metaTitle && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Meta Title
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {selectedBrand.metaTitle}
                  </p>
                </div>
              )}
              {selectedBrand.metaDescription && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Meta Description
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {selectedBrand.metaDescription}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={viewModal.close}>
                Close
              </Button>
              <Link href={`/brands/edit/${selectedBrand._id}`}>
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
        title="Delete Brand"
        size="medium"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <strong className="text-gray-800 dark:text-white">
              {selectedBrand?.name}
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
