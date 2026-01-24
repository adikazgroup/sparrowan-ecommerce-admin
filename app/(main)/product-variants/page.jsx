"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  LuEye,
  LuPencil,
  LuTrash2,
  LuCheck,
  LuX,
  LuLayers,
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
  useGetProductVariantListQuery,
  useDeleteProductVariantMutation,
} from "@/features/products/productVariantsApiSlice";
import { handleToast } from "@/utils/handleToast";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "out_of_stock", label: "Out of Stock" },
];

export default function ProductVariantsPage() {
  const [deleteVariant, { isLoading: deleteLoading }] =
    useDeleteProductVariantMutation();
  const viewModal = useModal();
  const deleteModal = useModal();

  const [selectedItem, setSelectedItem] = useState(null);
  const [filterData, setFilterData] = useState({ searchTerm: "", status: "" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useGetProductVariantListQuery({
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
    const result = await deleteVariant(selectedItem._id);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "delete-variant",
      message: "Variant deleted!",
    });
    if (result?.data) {
      deleteModal.close();
      setSelectedItem(null);
    }
  };

  const getAttributesText = (attrs) => {
    if (!attrs) return "---";
    const parts = [];
    if (attrs.size) parts.push(`Size: ${attrs.size}`);
    if (attrs.color) parts.push(`Color: ${attrs.color}`);
    if (attrs.material) parts.push(attrs.material);
    return parts.length > 0 ? parts.join(", ") : "---";
  };

  const columns = [
    {
      id: "variant",
      header: "Variant",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
            {row.image ? (
              <img
                src={row.image}
                alt="Variant"
                className="w-full h-full object-cover"
              />
            ) : (
              <LuLayers className="size-4 text-primary" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">
              {row.productName || row.product?.name || "---"}
            </p>
            <p className="text-xs text-gray-500">SKU: {row.sku}</p>
          </div>
        </div>
      ),
    },
    {
      id: "attributes",
      header: "Attributes",
      cell: (_, row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {getAttributesText(row.attributes)}
        </span>
      ),
    },
    {
      id: "pricing",
      header: "Price",
      cell: (_, row) => (
        <div className="text-sm">
          <p className="font-medium text-gray-800 dark:text-white">
            ৳{(row.pricing?.sellingPrice || 0).toFixed(2)}
          </p>
          {row.pricing?.discount?.value && (
            <p className="text-xs text-green-600">
              {row.pricing.discount.type === "percentage"
                ? `${row.pricing.discount.value}% off`
                : `৳${row.pricing.discount.value} off`}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "stock",
      header: "Stock",
      cell: (_, row) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${(row.inventory?.stock || 0) > 10 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : (row.inventory?.stock || 0) > 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}
        >
          {row.inventory?.stock || 0}
        </span>
      ),
    },
    {
      id: "isDefault",
      header: "Default",
      cell: (_, row) =>
        row.isDefault ? (
          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded dark:bg-blue-900/30 dark:text-blue-300">
            Yes
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      id: "status",
      header: "Status",
      cell: (_, row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${row.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : row.status === "out_of_stock" ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300"}`}
        >
          {row.status === "active" ? (
            <LuCheck className="size-3.5" />
          ) : (
            <LuX className="size-3.5" />
          )}
          {row.status?.replace("_", " ")}
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
            href={`/product-variants/edit/${row._id}`}
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
              <h1 className="text-xl font-medium">Product Variants</h1>
              <Link href="/product-variants/add">
                <Button className="whitespace-nowrap">
                  <LuPlus className="size-4" /> Add Variant
                </Button>
              </Link>
            </div>

            {/* Row 2: Search, Filters, and Refresh */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Input
                placeholder="Search variants..."
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
        title="Variant Details"
        size="medium"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                {selectedItem.image ? (
                  <img
                    src={selectedItem.image}
                    alt="Variant"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <LuLayers className="size-6 text-primary" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {selectedItem.productName ||
                    selectedItem.product?.name ||
                    "---"}
                </h3>
                <p className="text-sm text-gray-500">SKU: {selectedItem.sku}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Selling Price
                </label>
                <p className="text-gray-800 dark:text-white">
                  ৳{(selectedItem.pricing?.sellingPrice || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Buying Price
                </label>
                <p className="text-gray-800 dark:text-white">
                  ৳{(selectedItem.pricing?.buyingPrice || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Stock
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedItem.inventory?.stock || 0}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Status
                </label>
                <p className="text-gray-800 dark:text-white capitalize">
                  {selectedItem.status?.replace("_", " ")}
                </p>
              </div>
              {selectedItem.pricing?.discount?.value && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Discount
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {selectedItem.pricing.discount.type === "percentage"
                      ? `${selectedItem.pricing.discount.value}%`
                      : `৳${selectedItem.pricing.discount.value}`}
                  </p>
                </div>
              )}
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Attributes
                </label>
                <p className="text-gray-800 dark:text-white">
                  {getAttributesText(selectedItem.attributes)}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={viewModal.close}>
                Close
              </Button>
              <Link href={`/product-variants/edit/${selectedItem._id}`}>
                <Button onClick={viewModal.close}>Edit</Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete Variant"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this variant? This action cannot be
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
