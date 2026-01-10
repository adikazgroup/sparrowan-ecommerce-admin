"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import moment from "moment";
import Link from "next/link";
import { LuEye, LuPencil, LuTrash2, LuTag, LuCheck, LuX } from "react-icons/lu";

import { useModal } from "@/lib/useModal";
import { Table } from "@/components/ui/table/Table";
import { Button } from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal/Modal";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import SubCategoryManageHeader from "@/components/section/subCategorySection/SubCategoryManageHeader";
import {
  useGetCategoryListQuery,
  useDeleteCategoryMutation,
} from "@/features/categories/categoriesApiSlice";
import { handleToast } from "@/utils/handleToast";

export default function SubCategoriesPage() {
  const [deleteCategory, { isLoading: deleteLoading }] =
    useDeleteCategoryMutation();

  const viewModal = useModal();
  const deleteModal = useModal();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useGetCategoryListQuery({
    searchTerm,
    level: 1,
    status: statusFilter || undefined,
    departmentId: departmentFilter || undefined,
    parent: categoryFilter || undefined,
    page,
    limit,
  });

  const categories = data?.data || [];
  const totalData = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPage || 0;

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setIsManualRefreshing(false);
  };

  const confirmDelete = async () => {
    if (!selectedCategory?._id) {
      toast.error("Sub category not selected");
      return;
    }
    const loadingToast = toast.loading("Deleting...");
    const result = await deleteCategory(selectedCategory._id);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "delete-subcategory",
      message: "Sub category deleted successfully!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) {
      deleteModal.close();
      setSelectedCategory(null);
    }
  };

  const columns = [
    {
      id: "name",
      header: "Sub Category",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          {row.image?.url ? (
            <img
              src={row.image.url}
              alt={row.name}
              className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <LuTag className="size-4 text-primary" />
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
      id: "parent",
      header: "Parent Category",
      cell: (_, row) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {row.parent?.name || "---"}
        </span>
      ),
    },
    {
      id: "department",
      header: "Department",
      cell: (_, row) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {row.departmentName || "---"}
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
              setSelectedCategory(row);
              viewModal.open();
            }}
            className="size-8 center text-blue-600 bg-blue-100/50 rounded dark:text-blue-300 dark:bg-blue-900/30"
            aria-label="View"
          >
            <LuEye className="size-4" />
          </button>
          <Link
            href={`/sub-categories/edit/${row._id}`}
            onClick={(e) => e.stopPropagation()}
            className="size-8 center text-amber-600 bg-amber-100/50 rounded dark:text-amber-300 dark:bg-amber-900/30"
            aria-label="Edit"
          >
            <LuPencil className="size-4" />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCategory(row);
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
          <SubCategoryManageHeader
            pageTitle="Sub Categories"
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            addHref="/sub-categories/add"
            onRefresh={handleRefresh}
            isRefreshing={isManualRefreshing}
          />
          <Table
            data={categories}
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
        title="Sub Category Details"
        size="large"
      >
        {selectedCategory && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {selectedCategory.image?.url ? (
                <img
                  src={selectedCategory.image.url}
                  alt={selectedCategory.name}
                  className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <LuTag className="size-6 text-primary" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {selectedCategory.name}
                </h3>
                <p className="text-sm text-gray-500">{selectedCategory.slug}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Parent Category
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedCategory.parent?.name || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Department
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedCategory.departmentName || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </label>
                <p className="text-gray-800 dark:text-white capitalize">
                  {selectedCategory.status}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Description
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedCategory.description || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={viewModal.close}>
                Close
              </Button>
              <Link href={`/sub-categories/edit/${selectedCategory._id}`}>
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
        title="Delete Sub Category"
        size="medium"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <strong className="text-gray-800 dark:text-white">
              {selectedCategory?.name}
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
