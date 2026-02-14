"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import moment from "moment";
import Link from "next/link";
import {
  LuEye,
  LuPencil,
  LuTrash2,
  LuImage,
  LuCheck,
  LuX,
} from "react-icons/lu";

import { useModal } from "@/lib/useModal";
import { Table } from "@/components/ui/table/Table";
import { Button } from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal/Modal";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import BannerManageHeader from "@/components/section/bannerSection/BannerManageHeader";
import {
  useGetBannerListQuery,
  useDeleteBannerMutation,
} from "@/features/banners/bannersApiSlice";
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

export default function BannersPage() {
  const [deleteBanner, { isLoading: deleteLoading }] =
    useDeleteBannerMutation();

  const viewModal = useModal();
  const deleteModal = useModal();

  const [selectedBanner, setSelectedBanner] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useGetBannerListQuery({
    searchTerm,
    status: statusFilter || undefined,
    page,
    limit,
  });

  const banners = data?.data || [];
  const totalData = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPage || 0;

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setIsManualRefreshing(false);
  };

  const confirmDelete = async () => {
    if (!selectedBanner?._id) {
      toast.error("Banner not selected");
      return;
    }
    const loadingToast = toast.loading("Deleting banner...");
    const result = await deleteBanner(selectedBanner._id);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "delete-banner",
      message: "Banner deleted successfully!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) {
      deleteModal.close();
      setSelectedBanner(null);
    }
  };

  const columns = [
    {
      id: "banner",
      header: "Banner",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          {row.image?.url ? (
            <img
              src={row.image.url}
              alt={row.title}
              className="w-16 h-10 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <LuImage className="size-4 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-800 dark:text-white">
              {row.title || "Untitled"}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "displayOrder",
      header: "Order",
      cell: (_, row) => (
        <span className="text-gray-600 dark:text-gray-400 font-medium">
          {row.displayOrder}
        </span>
      ),
    },
    {
      id: "link",
      header: "Link",
      cell: (_, row) =>
        row.link ? (
          <a
            href={row.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
          >
            Visit Link
          </a>
        ) : (
          <span className="text-gray-400 text-sm">---</span>
        ),
    },
    {
      id: "status",
      header: "Status",
      cell: (_, row) => getStatusBadge(row.status),
    },
    {
      id: "dates",
      header: "Schedule",
      cell: (_, row) => (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {row.startDate || row.endDate ? (
            <div className="flex flex-col">
              <span className="whitespace-nowrap">
                Start:{" "}
                {row.startDate ? moment(row.startDate).format("DD MMM") : "---"}
              </span>
              <span className="whitespace-nowrap">
                End:{" "}
                {row.endDate ? moment(row.endDate).format("DD MMM") : "---"}
              </span>
            </div>
          ) : (
            <span>Always Active</span>
          )}
        </div>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
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
              setSelectedBanner(row);
              viewModal.open();
            }}
            className="size-8 center text-blue-600 bg-blue-100/50 rounded dark:text-blue-300 dark:bg-blue-900/30"
            aria-label="View"
          >
            <LuEye className="size-4" />
          </button>
          <Link
            href={`/banners/edit/${row._id}`}
            onClick={(e) => e.stopPropagation()}
            className="size-8 center text-amber-600 bg-amber-100/50 rounded dark:text-amber-300 dark:bg-amber-900/30"
            aria-label="Edit"
          >
            <LuPencil className="size-4" />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBanner(row);
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
          <BannerManageHeader
            pageTitle="Banners"
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            addHref="/banners/add"
            onRefresh={handleRefresh}
            isRefreshing={isManualRefreshing}
          />
          <Table
            data={banners}
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
        title="Banner Preview"
        size="large"
      >
        {selectedBanner && (
          <div className="space-y-4">
            <div className="aspect-[16/9] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              {selectedBanner.image?.url ? (
                <img
                  src={selectedBanner.image.url}
                  alt={selectedBanner.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <LuImage className="size-12 text-gray-400" />
                </div>
              )}
            </div>
            {selectedBanner.mobileImage?.url && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Mobile Image
                </label>
                <div className="aspect-[9/16] max-w-[150px] rounded-lg overflow-hidden mt-2">
                  <img
                    src={selectedBanner.mobileImage.url}
                    alt={`${selectedBanner.title} mobile`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Title
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedBanner.title}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </label>
                <div className="mt-1">
                  {getStatusBadge(selectedBanner.status)}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Display Order
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedBanner.displayOrder}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Link
                </label>
                <p className="text-gray-800 dark:text-white truncate">
                  {selectedBanner.link || "N/A"}
                </p>
              </div>
              {selectedBanner.startDate && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Start Date
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {moment(selectedBanner.startDate).format("DD MMMM, YYYY")}
                  </p>
                </div>
              )}
              {selectedBanner.endDate && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    End Date
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {moment(selectedBanner.endDate).format("DD MMMM, YYYY")}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={viewModal.close}>
                Close
              </Button>
              <Link href={`/banners/edit/${selectedBanner._id}`}>
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
        title="Delete Banner"
        size="medium"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <strong className="text-gray-800 dark:text-white">
              {selectedBanner?.title}
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
