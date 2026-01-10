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
import TaxRuleManageHeader from "@/components/section/taxRuleSection/TaxRuleManageHeader";
import TaxRuleForm from "@/components/form/TaxRuleForm";
import {
  useGetTaxRuleListQuery,
  useDeleteTaxRuleMutation,
} from "@/features/taxRules/taxRulesApiSlice";
import { handleToast } from "@/utils/handleToast";

export default function TaxRulesPage() {
  const [deleteTaxRule, { isLoading: deleteLoading }] =
    useDeleteTaxRuleMutation();

  // Modal hooks
  const viewModal = useModal();
  const deleteModal = useModal();
  const addModal = useModal();
  const editModal = useModal();

  const [selectedTaxRule, setSelectedTaxRule] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Manual refresh state - only for reload button animation
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // API call with refetch
  const { data, isLoading, isError, refetch } = useGetTaxRuleListQuery({
    searchTerm,
    page,
    limit,
  });

  const taxRules = data?.data || [];
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
    if (!selectedTaxRule?._id) {
      toast.error("Tax rule not selected");
      return;
    }

    const loadingToast = toast.loading("Deleting tax rule...");

    const result = await deleteTaxRule(selectedTaxRule._id);

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "delete-tax-rule",
      message: "Tax rule deleted successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      deleteModal.close();
      setSelectedTaxRule(null);
    }
  };

  // Define columns
  const columns = [
    {
      id: "taxCategory",
      header: "Tax Category",
      cell: (_, row) => (
        <span className="font-medium text-gray-800 dark:text-white">
          {row.taxCategoryName || "---"}
        </span>
      ),
    },
    {
      id: "country",
      header: "Country",
      cell: (_, row) => (
        <span className="text-gray-600 dark:text-gray-400 capitalize">
          {row.country}
        </span>
      ),
    },
    {
      id: "state",
      header: "State",
      cell: (_, row) => (
        <span className="text-gray-600 dark:text-gray-400 capitalize">
          {row.state}
        </span>
      ),
    },
    {
      id: "rate",
      header: "Rate",
      cell: (_, row) => (
        <span className="font-medium text-gray-800 dark:text-white">
          {row.rate}
          {row.type === "percentage" ? "%" : " ৳"}
        </span>
      ),
    },
    {
      id: "effectiveFrom",
      header: "Effective From",
      cell: (_, row) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {row.effectiveFrom
            ? moment(row.effectiveFrom).format("DD MMMM, YYYY")
            : "---"}
        </span>
      ),
    },
    {
      id: "effectiveTo",
      header: "Effective To",
      cell: (_, row) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {row.effectiveTo ? (
            moment(row.effectiveTo).format("DD MMMM, YYYY")
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
              No End Date
            </span>
          )}
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
              setSelectedTaxRule(row);
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
              setSelectedTaxRule(row);
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
              setSelectedTaxRule(row);
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
          <TaxRuleManageHeader
            pageTitle="Tax Rules"
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onAddClick={addModal.open}
            onRefresh={handleRefresh}
            isRefreshing={isManualRefreshing}
          />

          {/* Table */}
          <Table
            data={taxRules}
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
        title="Tax Rule Details"
        size="medium"
      >
        {selectedTaxRule && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Tax Category
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedTaxRule.taxCategoryName || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Country
                </label>
                <p className="text-gray-800 dark:text-white capitalize">
                  {selectedTaxRule.country}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  State
                </label>
                <p className="text-gray-800 dark:text-white capitalize">
                  {selectedTaxRule.state}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Type
                </label>
                <p className="text-gray-800 dark:text-white capitalize">
                  {selectedTaxRule.type}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Rate
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedTaxRule.rate}
                  {selectedTaxRule.type === "percentage" ? "%" : " ৳"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Effective From
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedTaxRule.effectiveFrom
                    ? moment(selectedTaxRule.effectiveFrom).format(
                        "DD MMMM, YYYY",
                      )
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Effective To
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedTaxRule.effectiveTo
                    ? moment(selectedTaxRule.effectiveTo).format(
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
        title="Add Tax Rule"
        size="large"
      >
        <TaxRuleForm onClose={addModal.close} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editModal.isOpen}
        onClose={editModal.close}
        title="Edit Tax Rule"
        size="large"
      >
        <TaxRuleForm
          selectedTaxRule={selectedTaxRule}
          isEdit
          onClose={editModal.close}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete Tax Rule"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this tax rule? This action cannot be
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
