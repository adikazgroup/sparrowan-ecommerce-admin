"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import moment from "moment";
import {
  LuEye,
  LuPencil,
  LuTrash2,
  LuUser,
  LuShield,
  LuUsers,
  LuCheck,
  LuX,
} from "react-icons/lu";

import { useModal } from "@/lib/useModal";
import { Table } from "@/components/ui/table/Table";
import { Button } from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal/Modal";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import UserManageHeader from "@/components/section/userSection/UserManageHeader";
import CreateUserForm from "@/components/form/CreateUserForm";
import EditUserForm from "@/components/form/EditUserForm";
import {
  useGetUserListQuery,
  useDeleteUserMutation,
} from "@/features/user/userApiSlice";
import { handleToast } from "@/utils/handleToast";

export default function UserPage() {
  const [deleteUser, { isLoading: deleteLoading }] = useDeleteUserMutation();

  // Modal hooks
  const viewModal = useModal();
  const deleteModal = useModal();
  const addModal = useModal();
  const editModal = useModal();

  const [selectedUser, setSelectedUser] = useState(null);

  // Filter state
  const [filterData, setFilterData] = useState({
    searchTerm: "",
    role: "",
    status: "",
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // API call with refetch
  const { data, isLoading, isError, refetch } = useGetUserListQuery({
    ...filterData,
    page,
    limit,
  });

  // Manual refresh state - only for reload button animation
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setIsManualRefreshing(false);
  };

  const users = data?.data || [];
  const totalData = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPage || 0;

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedUser?._id) {
      toast.error("User not selected");
      return;
    }

    const loadingToast = toast.loading("Deleting user...");

    const result = await deleteUser(selectedUser._id);

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "delete-user",
      message: "User deleted successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      deleteModal.close();
      setSelectedUser(null);
    }
  };

  // Define columns
  const columns = [
    {
      id: "name",
      header: "User",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          {row.profileImage?.url ? (
            <img
              src={row.profileImage.url}
              alt={row.name}
              className="w-10 h-10 object-cover rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <LuUser className="size-4 text-primary" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-800 dark:text-white">
              {row.name || "---"}
            </p>
            <p className="text-xs text-gray-500">{row.email || "---"}</p>
          </div>
        </div>
      ),
    },
    {
      id: "phoneNumber",
      header: "Phone",
      cell: (_, row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.phoneNumber || "---"}
        </span>
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: (_, row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
          {row.role === "admin" ? (
            <LuShield className="size-3.5" />
          ) : (
            <LuUsers className="size-3.5" />
          )}
          {row.role || "---"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (_, row) => (
        <div>
          {row?.status === "active" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
              <LuCheck className="size-3.5" />
              {row?.status}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
              <LuX className="size-3.5" />
              {row?.status || "---"}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "isEmailVerified",
      header: "Email Verified",
      cell: (_, row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            row?.isEmailVerified
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
              : "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300"
          }`}
        >
          {row?.isEmailVerified ? (
            <LuCheck className="size-3.5" />
          ) : (
            <LuX className="size-3.5" />
          )}
          {row?.isEmailVerified ? "Verified" : "Not Verified"}
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
        <div className="text-right">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(row);
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
                setSelectedUser(row);
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
                setSelectedUser(row);
                deleteModal.open();
              }}
              className="size-8 center text-destructive bg-red-100/50 rounded dark:text-red-300 dark:bg-red-900/30"
              aria-label="Delete"
            >
              <LuTrash2 className="size-4" />
            </button>
          </div>
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
          {/* Header with Search and Filters */}
          <UserManageHeader
            pageTitle="User Management"
            filterData={filterData}
            setFilterData={setFilterData}
            onAddClick={addModal.open}
            onRefresh={handleRefresh}
            isRefetching={isManualRefreshing}
          />

          {/* Table */}
          <Table
            data={users}
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

      {/* View User Modal */}
      <Modal
        open={viewModal.isOpen}
        onClose={viewModal.close}
        title="User Details"
        size="large"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {selectedUser.profileImage?.url ? (
                <img
                  src={selectedUser.profileImage.url}
                  alt={selectedUser.name}
                  className="w-16 h-16 object-cover rounded-full border-2 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <LuUser className="size-6 text-primary" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {selectedUser.name}
                </h3>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Phone Number
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedUser.phoneNumber || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Role
                </label>
                <p className="text-gray-800 dark:text-white capitalize">
                  {selectedUser.role || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </label>
                <p className="text-gray-800 dark:text-white capitalize">
                  {selectedUser.status || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Gender
                </label>
                <p className="text-gray-800 dark:text-white capitalize">
                  {selectedUser.gender || "N/A"}
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
                Edit User
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal
        open={addModal.isOpen}
        onClose={addModal.close}
        title="Add New User"
        size="xxlarge"
      >
        <CreateUserForm onClose={addModal.close} />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={editModal.isOpen}
        onClose={editModal.close}
        title="Edit User"
        size="xxlarge"
      >
        <EditUserForm selectedUser={selectedUser} onClose={editModal.close} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete User"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <strong className="text-gray-800 dark:text-white">
              {selectedUser?.name}
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
