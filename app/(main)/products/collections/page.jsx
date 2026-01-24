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
  LuFolderOpen,
  LuPlus,
  LuSearch,
  LuRefreshCw,
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
  useGetProductCollectionListQuery,
  useDeleteProductCollectionMutation,
} from "@/features/products/productCollectionsApiSlice";
import { handleToast } from "@/utils/handleToast";
import { statusOptions } from "@/utils/DataHelper";

export default function ProductCollectionsPage() {
  const [deleteCollection, { isLoading: deleteLoading }] =
    useDeleteProductCollectionMutation();
  const viewModal = useModal();
  const deleteModal = useModal();

  const [selectedItem, setSelectedItem] = useState(null);
  const [filterData, setFilterData] = useState({ searchTerm: "", status: "" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } =
    useGetProductCollectionListQuery({
      searchTerm: filterData.searchTerm,
      status: filterData.status || undefined,
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
    const result = await deleteCollection(selectedItem._id);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "delete-collection",
      message: "Collection deleted!",
    });
    if (result?.data) {
      deleteModal.close();
      setSelectedItem(null);
    }
  };

  const columns = [
    {
      id: "name",
      header: "Collection",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
            <LuFolderOpen className="size-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">
              {row.name}
            </p>
            <p className="text-xs text-gray-500">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      id: "products",
      header: "Products",
      cell: (_, row) => (
        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-medium">
          {row.productCount || 0} items
        </span>
      ),
    },
    {
      id: "isActive",
      header: "Active",
      cell: (_, row) =>
        row.isActive ? (
          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded dark:bg-green-900/30 dark:text-green-300">
            Yes
          </span>
        ) : (
          <span className="text-gray-400">No</span>
        ),
    },
    {
      id: "dateRange",
      header: "Date Range",
      cell: (_, row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.startDate && row.endDate
            ? `${moment(row.startDate).format("DD MMM")} - ${moment(row.endDate).format("DD MMM")}`
            : "Always"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (_, row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${row.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"}`}
        >
          {row.status === "active" ? (
            <LuCheck className="size-3.5" />
          ) : (
            <LuX className="size-3.5" />
          )}
          {row.status}
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
          <Link
            href={`/products/collections/edit/${row._id}`}
            onClick={(e) => e.stopPropagation()}
            className="size-8 center text-amber-600 bg-amber-100/50 rounded dark:text-amber-300 dark:bg-amber-900/30"
          >
            <LuPencil className="size-4" />
          </Link>
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
              <h1 className="text-xl font-medium">Product Collections</h1>
              <Link href="/products/collections/add">
                <Button className="whitespace-nowrap">
                  <LuPlus className="size-4" /> Add Collection
                </Button>
              </Link>
            </div>

            {/* Row 2: Search, Filters, and Refresh */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Input
                placeholder="Search collections..."
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
                options={[{ value: "", label: "All Status" }, ...statusOptions]}
                value={filterData.status}
                onValueChange={(value) =>
                  setFilterData((prev) => ({ ...prev, status: value }))
                }
                placeholder="Filter by Status"
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
        open={viewModal.isOpen}
        onClose={viewModal.close}
        title="Collection Details"
        size="medium"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                <LuFolderOpen className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {selectedItem.name}
                </h3>
                <p className="text-sm text-gray-500">{selectedItem.slug}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Products
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedItem.productCount || 0}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Status
                </label>
                <p className="text-gray-800 dark:text-white capitalize">
                  {selectedItem.status}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Active
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedItem.isActive ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Display Order
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedItem.displayOrder || 0}
                </p>
              </div>
              {selectedItem.description && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Description
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {selectedItem.description}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={viewModal.close}>
                Close
              </Button>
              <Link href={`/products/collections/edit/${selectedItem._id}`}>
                <Button onClick={viewModal.close}>Edit</Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete Collection"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <strong>{selectedItem?.name}</strong>? This action cannot be undone.
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
