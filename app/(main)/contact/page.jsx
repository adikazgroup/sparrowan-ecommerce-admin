"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import moment from "moment";
import {
  LuEye,
  LuPencil,
  LuTrash2,
  LuX,
  LuMail,
  LuPhone,
  LuUser,
  LuMessageSquare,
  LuSearch,
  LuRefreshCw,
  LuSave,
  LuCheck,
  LuClock,
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
  useGetContactListQuery,
  useUpdateContactMutation,
  useDeleteContactMutation,
} from "@/features/contact/contactApiSlice";
import { handleToast } from "@/utils/handleToast";

const statusFilterOptions = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const statusEditOptions = [
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const getStatusBadge = (status) => {
  const config = {
    pending: {
      icon: <LuClock className="size-3.5" />,
      className:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
    },
    resolved: {
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

export default function ContactPage() {
  const [updateContact, { isLoading: updateLoading }] =
    useUpdateContactMutation();
  const [deleteContact, { isLoading: deleteLoading }] =
    useDeleteContactMutation();

  const viewModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  const [selectedItem, setSelectedItem] = useState(null);
  const [filterData, setFilterData] = useState({ searchTerm: "", status: "" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [editStatus, setEditStatus] = useState("pending");

  const { data, isLoading, isError, refetch } = useGetContactListQuery({
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

  const handleView = (contact) => {
    setSelectedItem(contact);
    viewModal.open();
  };

  const handleEdit = (contact) => {
    setSelectedItem(contact);
    setEditStatus(contact.status || "pending");
    editModal.open();
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem?._id) return;
    const result = await updateContact({
      id: selectedItem._id,
      status: editStatus,
    });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-contact",
      message: "Contact status updated successfully!",
    });
    if (result?.data) {
      editModal.close();
      setSelectedItem(null);
    }
  };

  const confirmDelete = async () => {
    if (!selectedItem?._id) return;
    const loadingToast = toast.loading("Deleting contact...");
    const result = await deleteContact(selectedItem._id);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "delete-contact",
      message: "Contact deleted successfully!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) {
      deleteModal.close();
      setSelectedItem(null);
    }
  };

  const columns = [
    {
      id: "contact",
      header: "Contact",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <LuUser className="size-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">
              {row.name}
            </p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      cell: (_, row) => (
        <span className="text-sm text-gray-700 dark:text-gray-300 max-w-[200px] truncate block">
          {row.subject}
        </span>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      cell: (_, row) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {row.phone || "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (_, row) => getStatusBadge(row.status),
    },
    {
      id: "date",
      header: "Received At",
      cell: (_, row) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {row.createdAt ? moment(row.createdAt).format("DD MMM, YYYY") : "—"}
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
              handleView(row);
            }}
            className="size-8 center text-blue-600 bg-blue-100/50 rounded dark:text-blue-300 dark:bg-blue-900/30"
            aria-label="View"
          >
            <LuEye className="size-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="size-8 center text-amber-600 bg-amber-100/50 rounded dark:text-amber-300 dark:bg-amber-900/30"
            aria-label="Edit"
          >
            <LuPencil className="size-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem(row);
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
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-medium">Contact Messages</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {totalData} message{totalData !== 1 ? "s" : ""} received
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Input
                placeholder="Search by name or email..."
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
                className="w-full sm:w-72"
              />
              <Select
                options={statusFilterOptions}
                value={filterData.status}
                onValueChange={(value) =>
                  setFilterData((prev) => ({ ...prev, status: value }))
                }
                placeholder="Filter by Status"
                className="w-full sm:w-44"
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

      {/* View Modal */}
      <Modal
        open={viewModal.isOpen}
        onClose={viewModal.close}
        title="Contact Details"
        size="medium"
      >
        {selectedItem && (
          <div className="space-y-4">
            {/* Sender Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <LuUser className="size-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {selectedItem.name}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                  <LuMail className="size-3.5" />
                  {selectedItem.email}
                </div>
                {selectedItem.phone && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                    <LuPhone className="size-3.5" />
                    {selectedItem.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Subject
                </label>
                <p className="text-gray-800 dark:text-white mt-1 font-medium">
                  {selectedItem.subject}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Message
                </label>
                <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedItem.message}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedItem.status)}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Received
                  </label>
                  <p className="text-gray-800 dark:text-white mt-1 text-sm">
                    {moment(selectedItem.createdAt).format(
                      "DD MMM YYYY, hh:mm A",
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={viewModal.close}>
                Close
              </Button>
              <Button
                onClick={() => {
                  viewModal.close();
                  handleEdit(selectedItem);
                }}
              >
                <LuPencil className="size-4" />
                Change Status
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal — Status Change Only */}
      <Modal
        open={editModal.isOpen}
        onClose={() => {
          editModal.close();
          setSelectedItem(null);
        }}
        title="Update Contact Status"
        size="small"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          {selectedItem && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <LuMessageSquare className="size-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                  {selectedItem.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {selectedItem.subject}
                </p>
              </div>
            </div>
          )}
          <Select
            label="Status"
            options={statusEditOptions}
            value={editStatus}
            onValueChange={(val) => setEditStatus(val)}
            requiredSign={true}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                editModal.close();
                setSelectedItem(null);
              }}
              disabled={updateLoading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={updateLoading}>
              <LuSave className="size-4" />
              {updateLoading ? "Saving..." : "Save Status"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete Contact"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete the message from{" "}
            <strong className="text-gray-800 dark:text-white">
              {selectedItem?.name}
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
