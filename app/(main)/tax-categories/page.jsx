"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import moment from "moment";
import { LuEye, LuPencil, LuTrash2, LuX } from "react-icons/lu";

import { useModal } from "@/lib/useModal";
import { Table } from "@/components/ui/table/Table";
import { Button } from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal/Modal";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import TaxCategoryManageHeader from "@/components/section/taxCategorySection/TaxCategoryManageHeader";
import TaxCategoryForm from "@/components/form/TaxCategoryForm";
import {
  useGetTaxCategoryListQuery,
  useDeleteTaxCategoryMutation,
} from "@/features/taxCategories/taxCategoriesApiSlice";
import { handleToast } from "@/utils/handleToast";

export default function TaxCategoriesPage() {
  const [deleteTaxCategory, { isLoading: deleteLoading }] =
    useDeleteTaxCategoryMutation();

  // Modal hooks
  const viewModal = useModal();
  const deleteModal = useModal();
  const addModal = useModal();
  const editModal = useModal();

  const [selectedTaxCategory, setSelectedTaxCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Manual refresh state - only for reload button animation
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // API call with refetch
  const { data, isLoading, isError, refetch } = useGetTaxCategoryListQuery({
    searchTerm,
    page,
    limit,
  });

  const taxCategories = data?.data || [];
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
    if (!selectedTaxCategory?._id) {
      toast.error("Tax category not selected");
      return;
    }

    const loadingToast = toast.loading("Deleting tax category...");

    const result = await deleteTaxCategory(selectedTaxCategory._id);

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "delete-tax-category",
      message: "Tax category deleted successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      deleteModal.close();
      setSelectedTaxCategory(null);
    }
  };

  // Define columns
  const columns = [
    {
      id: "name",
      header: "Name",
      cell: (_, row) => (
        <span className="font-medium text-gray-800 dark:text-white">
          {row.name}
        </span>
      ),
    },
    {
      id: "description",
      header: "Description",
      cell: (_, row) => (
        <span className="text-gray-500 dark:text-gray-400 line-clamp-1">
          {row.description || "---"}
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
              setSelectedTaxCategory(row);
              viewModal.open();
            }}
            className="size-8 center text-blue-600 bg-blue-100/50 rounded dark:text-blue-300 dark:bg-blue-900/30"
            aria-label="View"
          >
            <LuEye className="size-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTaxCategory(row);
              editModal.open();
            }}
            className="size-8 center text-amber-600 bg-amber-100/50 rounded dark:text-amber-300 dark:bg-amber-900/30"
            aria-label="Edit"
          >
            <LuPencil className="size-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTaxCategory(row);
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
          <TaxCategoryManageHeader
            pageTitle="Tax Categories"
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddClick={addModal.open}
            onRefresh={handleRefresh}
            isRefreshing={isManualRefreshing}
          />

          {/* Table */}
          <Table
            data={taxCategories}
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
        title="Tax Category Details"
        size="medium"
      >
        {selectedTaxCategory && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Name
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedTaxCategory.name}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Description
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedTaxCategory.description || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Created At
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedTaxCategory.createdAt
                    ? moment(selectedTaxCategory.createdAt).format(
                        "DD MMMM, YYYY",
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={viewModal.close}>
                Close
              </Button>
              <Button
                onClick={() => {
                  viewModal.close();
                  editModal.open();
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal
        open={addModal.isOpen}
        onClose={addModal.close}
        title="Add Tax Category"
        size="medium"
      >
        <TaxCategoryForm onClose={addModal.close} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editModal.isOpen}
        onClose={editModal.close}
        title="Edit Tax Category"
        size="medium"
      >
        <TaxCategoryForm
          selectedTaxCategory={selectedTaxCategory}
          isEdit
          onClose={editModal.close}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete Tax Category"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <strong className="text-gray-800 dark:text-white">
              {selectedTaxCategory?.name}
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
