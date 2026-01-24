"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import moment from "moment";
import { LuTrash2, LuMail, LuCheck, LuX, LuDownload } from "react-icons/lu";

import { useModal } from "@/lib/useModal";
import { Table } from "@/components/ui/table/Table";
import { Button } from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal/Modal";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import NewsletterManageHeader from "@/components/section/newsletterSection/NewsletterManageHeader";
import {
  useGetSubscriberListQuery,
  useUpdateSubscriberStatusMutation,
  useDeleteSubscriberMutation,
} from "@/features/newsletter/newsletterApiSlice";
import { handleToast } from "@/utils/handleToast";

const getStatusBadge = (status) => {
  const config = {
    active: {
      icon: <LuCheck className="size-3.5" />,
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    },
    unsubscribed: {
      icon: <LuX className="size-3.5" />,
      className:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
    },
  };
  const { icon, className } = config[status] || config.active;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${className}`}
    >
      {icon}
      {status}
    </span>
  );
};

export default function NewsletterPage() {
  const [updateStatus, { isLoading: updateLoading }] =
    useUpdateSubscriberStatusMutation();
  const [deleteSubscriber, { isLoading: deleteLoading }] =
    useDeleteSubscriberMutation();

  const deleteModal = useModal();

  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useGetSubscriberListQuery({
    searchTerm,
    status: statusFilter || undefined,
    page,
    limit,
  });

  const subscribers = data?.data || [];
  const totalData = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPage || 0;

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setIsManualRefreshing(false);
  };

  const handleStatusChange = async (subscriberId, newStatus) => {
    const result = await updateStatus({ id: subscriberId, status: newStatus });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-status",
      message: `Subscriber ${newStatus === "active" ? "activated" : "unsubscribed"} successfully!`,
    });
  };

  const confirmDelete = async () => {
    if (!selectedSubscriber?._id) {
      toast.error("Subscriber not selected");
      return;
    }
    const loadingToast = toast.loading("Deleting subscriber...");
    const result = await deleteSubscriber(selectedSubscriber._id);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "delete-subscriber",
      message: "Subscriber deleted successfully!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) {
      deleteModal.close();
      setSelectedSubscriber(null);
    }
  };

  const handleExportEmails = () => {
    const activeEmails = subscribers
      .filter((s) => s.status === "active")
      .map((s) => s.email)
      .join("\n");
    const blob = new Blob([activeEmails], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Emails exported successfully!");
  };

  const columns = [
    {
      id: "email",
      header: "Email",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <LuMail className="size-4 text-primary" />
          </div>
          <span className="font-medium text-gray-800 dark:text-white">
            {row.email}
          </span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (_, row) => getStatusBadge(row.status),
    },
    {
      id: "subscribedAt",
      header: "Subscribed At",
      cell: (_, row) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {row.createdAt ? moment(row.createdAt).format("DD MMM, YYYY") : "---"}
        </span>
      ),
    },
    {
      id: "unsubscribedAt",
      header: "Unsubscribed At",
      cell: (_, row) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {row.unsubscribedAt
            ? moment(row.unsubscribedAt).format("DD MMM, YYYY")
            : "---"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (_, row) => (
        <div className="flex justify-end gap-1">
          {row.status === "unsubscribed" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(row._id, "active");
              }}
              disabled={updateLoading}
              className="size-8 center text-green-600 bg-green-100/50 rounded dark:text-green-300 dark:bg-green-900/30"
              aria-label="Reactivate"
            >
              <LuCheck className="size-4" />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(row._id, "unsubscribed");
              }}
              disabled={updateLoading}
              className="size-8 center text-gray-600 bg-gray-100/50 rounded dark:text-gray-300 dark:bg-gray-900/30"
              aria-label="Unsubscribe"
            >
              <LuX className="size-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSubscriber(row);
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
          <NewsletterManageHeader
            pageTitle="Newsletter Subscribers"
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onRefresh={handleRefresh}
            isRefreshing={isManualRefreshing}
            onExport={handleExportEmails}
            totalActive={
              subscribers.filter((s) => s.status === "active").length
            }
            totalUnsubscribed={
              subscribers.filter((s) => s.status === "unsubscribed").length
            }
          />
          <Table
            data={subscribers}
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

      {/* Delete Modal */}
      <Modal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete Subscriber"
        size="medium"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <strong className="text-gray-800 dark:text-white">
              {selectedSubscriber?.email}
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
