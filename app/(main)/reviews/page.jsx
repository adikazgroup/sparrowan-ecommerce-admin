"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import moment from "moment";
import { LuEye, LuTrash2, LuStar, LuCheck, LuX, LuTimer } from "react-icons/lu";

import { useModal } from "@/lib/useModal";
import { Table } from "@/components/ui/table/Table";
import { Button } from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal/Modal";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import ReviewManageHeader from "@/components/section/reviewSection/ReviewManageHeader";
import {
  useGetReviewListQuery,
  useUpdateReviewStatusMutation,
  useDeleteReviewMutation,
} from "@/features/reviews/reviewsApiSlice";
import { handleToast } from "@/utils/handleToast";

const renderStars = (rating) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <LuStar
        key={star}
        className={`size-3.5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))}
  </div>
);

const getStatusBadge = (status) => {
  const config = {
    pending: {
      icon: <LuTimer className="size-3.5" />,
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    },
    approved: {
      icon: <LuCheck className="size-3.5" />,
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    },
    rejected: {
      icon: <LuX className="size-3.5" />,
      className: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    },
  };
  const { icon, className } = config[status] || config.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${className}`}
    >
      {icon}
      {status}
    </span>
  );
};

export default function ReviewsPage() {
  const [updateStatus, { isLoading: updateLoading }] =
    useUpdateReviewStatusMutation();
  const [deleteReview, { isLoading: deleteLoading }] =
    useDeleteReviewMutation();

  const viewModal = useModal();
  const deleteModal = useModal();

  const [selectedReview, setSelectedReview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useGetReviewListQuery({
    searchTerm,
    status: statusFilter || undefined,
    rating: ratingFilter || undefined,
    page,
    limit,
  });

  const reviews = data?.data || [];
  const totalData = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPage || 0;

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setIsManualRefreshing(false);
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    const result = await updateStatus({ id: reviewId, status: newStatus });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-status",
      message: `Review ${newStatus} successfully!`,
    });
  };

  const confirmDelete = async () => {
    if (!selectedReview?._id) {
      toast.error("Review not selected");
      return;
    }
    const loadingToast = toast.loading("Deleting review...");
    const result = await deleteReview(selectedReview._id);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "delete-review",
      message: "Review deleted successfully!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) {
      deleteModal.close();
      setSelectedReview(null);
    }
  };

  const columns = [
    {
      id: "product",
      header: "Product",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          {row.product?.images?.[0]?.url ? (
            <img
              src={row.product.images[0].url}
              alt={row.product.name}
              className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <LuStar className="size-4 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-800 dark:text-white truncate max-w-[120px]">
              {row.product?.name || "Unknown Product"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: (_, row) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white">
            {row.user?.name || "Unknown"}
          </p>
          <p className="text-xs text-gray-500">{row.user?.email}</p>
        </div>
      ),
    },
    {
      id: "rating",
      header: "Rating",
      cell: (_, row) => renderStars(row.rating),
    },
    {
      id: "comment",
      header: "Comment",
      cell: (_, row) => (
        <span
          className="text-gray-600 dark:text-gray-400 text-sm max-w-[150px] truncate block"
          title={row.comment}
        >
          {row.comment
            ? row.comment.length > 30
              ? row.comment.substring(0, 30) + "..."
              : row.comment
            : "---"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (_, row) => getStatusBadge(row.status),
    },
    {
      id: "createdAt",
      header: "Date",
      cell: (_, row) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {row.createdAt ? moment(row.createdAt).format("DD MMM, YYYY") : "---"}
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
              setSelectedReview(row);
              viewModal.open();
            }}
            className="size-8 center text-blue-600 bg-blue-100/50 rounded dark:text-blue-300 dark:bg-blue-900/30"
            aria-label="View"
          >
            <LuEye className="size-4" />
          </button>
          {row.status === "pending" && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(row._id, "approved");
                }}
                disabled={updateLoading}
                className="size-8 center text-green-600 bg-green-100/50 rounded dark:text-green-300 dark:bg-green-900/30"
                aria-label="Approve"
              >
                <LuCheck className="size-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(row._id, "rejected");
                }}
                disabled={updateLoading}
                className="size-8 center text-amber-600 bg-amber-100/50 rounded dark:text-amber-300 dark:bg-amber-900/30"
                aria-label="Reject"
              >
                <LuX className="size-4" />
              </button>
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReview(row);
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
          <ReviewManageHeader
            pageTitle="Reviews"
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            ratingFilter={ratingFilter}
            setRatingFilter={setRatingFilter}
            onRefresh={handleRefresh}
            isRefreshing={isManualRefreshing}
          />
          <Table
            data={reviews}
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
        title="Review Details"
        size="large"
      >
        {selectedReview && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {selectedReview.product?.images?.[0]?.url && (
                <img
                  src={selectedReview.product.images[0].url}
                  alt={selectedReview.product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {selectedReview.product?.name}
                </h3>
                <p className="text-sm text-gray-500">
                  By: {selectedReview.user?.name} ({selectedReview.user?.email})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {renderStars(selectedReview.rating)}
              {getStatusBadge(selectedReview.status)}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-800 dark:text-white">
                {selectedReview.comment}
              </p>
            </div>
            {selectedReview.images?.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Images
                </label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {selectedReview.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={`Review ${idx + 1}`}
                      className="size-20 rounded-lg object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={viewModal.close}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete Review"
        size="medium"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete this review? This action cannot be
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
