"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import moment from "moment";
import Link from "next/link";
import {
  LuEye,
  LuPencil,
  LuTrash2,
  LuFileText,
  LuCheck,
  LuX,
  LuClock,
} from "react-icons/lu";

import { useModal } from "@/lib/useModal";
import { Table } from "@/components/ui/table/Table";
import { Button } from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal/Modal";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import BlogManageHeader from "@/components/section/blogSection/BlogManageHeader";
import {
  useGetBlogListQuery,
  useDeleteBlogMutation,
} from "@/features/blogs/blogsApiSlice";
import { handleToast } from "@/utils/handleToast";

const getStatusBadge = (status) => {
  const config = {
    draft: {
      icon: <LuClock className="size-3.5" />,
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    },
    published: {
      icon: <LuCheck className="size-3.5" />,
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    },
    archived: {
      icon: <LuX className="size-3.5" />,
      className:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
    },
  };
  const { icon, className } = config[status] || config.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${className}`}
    >
      {icon}
      {status}
    </span>
  );
};

export default function BlogsPage() {
  const [deleteBlog, { isLoading: deleteLoading }] = useDeleteBlogMutation();

  const viewModal = useModal();
  const deleteModal = useModal();

  const [selectedBlog, setSelectedBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useGetBlogListQuery({
    searchTerm,
    status: statusFilter || undefined,
    page,
    limit,
  });

  const blogs = data?.data || [];
  const totalData = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPage || 0;

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setIsManualRefreshing(false);
  };

  const confirmDelete = async () => {
    if (!selectedBlog?._id) {
      toast.error("Blog not selected");
      return;
    }
    const loadingToast = toast.loading("Deleting blog...");
    const result = await deleteBlog(selectedBlog._id);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "delete-blog",
      message: "Blog deleted successfully!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) {
      deleteModal.close();
      setSelectedBlog(null);
    }
  };

  const columns = [
    {
      id: "blog",
      header: "Blog",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          {row.featuredImage?.url ? (
            <img
              src={row.featuredImage.url}
              alt={row.title}
              className="w-16 h-10 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <LuFileText className="size-4 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-800 dark:text-white truncate max-w-[200px]">
              {row.title || "Untitled"}
            </p>
            <p className="text-xs text-gray-500">{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: (_, row) => (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {row.categoryName || "---"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (_, row) => getStatusBadge(row.status),
    },
    {
      id: "views",
      header: "Views",
      cell: (_, row) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {row.viewCount || 0}
        </span>
      ),
    },
    {
      id: "publishedAt",
      header: "Published",
      cell: (_, row) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {row.publishedAt
            ? moment(row.publishedAt).format("DD MMM, YYYY")
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
              setSelectedBlog(row);
              viewModal.open();
            }}
            className="size-8 center text-blue-600 bg-blue-100/50 rounded dark:text-blue-300 dark:bg-blue-900/30"
            aria-label="View"
          >
            <LuEye className="size-4" />
          </button>
          <Link
            href={`/blogs/edit/${row._id}`}
            onClick={(e) => e.stopPropagation()}
            className="size-8 center text-amber-600 bg-amber-100/50 rounded dark:text-amber-300 dark:bg-amber-900/30"
            aria-label="Edit"
          >
            <LuPencil className="size-4" />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBlog(row);
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
          <BlogManageHeader
            pageTitle="Blogs"
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            addHref="/blogs/add"
            onRefresh={handleRefresh}
            isRefreshing={isManualRefreshing}
          />
          <Table
            data={blogs}
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
        title="Blog Preview"
        size="large"
      >
        {selectedBlog && (
          <div className="space-y-4">
            {selectedBlog.featuredImage?.url && (
              <div className="aspect-[16/9] rounded-lg overflow-hidden">
                <img
                  src={selectedBlog.featuredImage.url}
                  alt={selectedBlog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {selectedBlog.title}
              </h3>
              <p className="text-sm text-gray-500">{selectedBlog.slug}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Category
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedBlog.categoryName || "---"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </label>
                <div className="mt-1">
                  {getStatusBadge(selectedBlog.status)}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Views
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedBlog.viewCount || 0}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Published
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedBlog.publishedAt
                    ? moment(selectedBlog.publishedAt).format("DD MMMM, YYYY")
                    : "Not published"}
                </p>
              </div>
              {selectedBlog.tags?.length > 0 && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedBlog.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={viewModal.close}>
                Close
              </Button>
              <Link href={`/blogs/edit/${selectedBlog._id}`}>
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
        title="Delete Blog"
        size="medium"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <strong className="text-gray-800 dark:text-white">
              {selectedBlog?.title}
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
