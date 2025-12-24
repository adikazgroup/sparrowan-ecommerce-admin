"use client";

import {
  LuEye,
  LuBadgeX,
  LuPencil,
  LuTrash2,
  LuCalendar,
  LuBadgeCheck,
} from "react-icons/lu";
import TopPart from "./TopPart";
import { useState } from "react";
import UserView from "./UserView";
import UserEdit from "./UserEdit";
import toast from "react-hot-toast";
import UserDelete from "./UserDelete";
import { useModal } from "@/lib/useModal";
import { Table } from "@/components/ui/table/Table";
import { generateUserQueryObject } from "@/utils/generateUserQuery";
import {
  useDeleteUserMutation,
  useGetUserListQuery,
} from "@/features/user/userApiSlice";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import { ErrorState } from "@/components/errors/ErrorState";

const UserTable = () => {
  // State for data
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [selectedUser, setSelectedUser] = useState(null);

  // User data
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    role: {
      moderator: false,
      admin: false,
    },
    status: {
      active: false,
      inactive: false,
    },
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const apiQuery = generateUserQueryObject({
    searchTerm,
    filters,
    page,
    limit,
  });

  const { data, isLoading, isError } = useGetUserListQuery(apiQuery);
  const users = data?.data?.data || [];
  const totalUsers = data?.data?.meta?.total || 0;
  const totalPages = data?.data?.meta?.totalPage || 0;

  // Modal states using useModal hook
  const viewModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  const handleView = (row) => {
    setSelectedUser(row);
    viewModal.open();
  };
  const handleEdit = (row) => {
    setSelectedUser(row);
    editModal.open();
  };

  const handleDelete = (row) => {
    setSelectedUser(row);
    deleteModal.open();
  };

  const handleConfirmDelete = async () => {
    const loadingToast = toast.loading("Updating user...");
    if (!selectedUser?._id) {
      toast.error("Invalid user selected");
      return;
    }

    try {
      await deleteUser(selectedUser._id);
      toast.success("User deleted successfully");
      deleteModal.close();
      toast.dismiss(loadingToast);
    } catch (error) {
      toast.error("Failed to delete user");
      toast.dismiss(loadingToast);
    }
  };

  // Define columns
  const columns = [
    {
      id: "name",
      header: "Name",
      accessor: (row) => row?.name,
      minWidth: "150px",
    },
    {
      id: "email",
      header: "Email",
      accessor: (row) => row?.email,
    },
    {
      id: "phone",
      header: "Phone",
      accessor: (row) => row?.phoneNumber || "N/A",
      minWidth: "190px",
    },
    {
      id: "role",
      header: "Role",
      accessor: (row) => row?.role,
      minWidth: "140px",
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => row?.status,
      cell: (value) => (
        <div className="flex items-center">
          {value === "active" && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
              <LuBadgeCheck className="mr-1 h-3 w-3" />
              Active
            </span>
          )}
          {value === "pending" && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ">
              <LuCalendar className="mr-1 h-3 w-3" />
              Pending
            </span>
          )}
          {value === "inactive" && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200 ">
              <LuBadgeX className="mr-1 h-3 w-3" />
              Inactive
            </span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      accessor: () => null,
      cell: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(row);
            }}
            className="size-8 center text-blue-600 hover:text-blue-800 rounded hover:bg-blue-100 hover:dark:bg-blue-900/50 hover:dark:text-blue-200"
            aria-label="View"
          >
            <LuEye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="size-8 center text-amber-600 hover:text-amber-800 rounded hover:bg-amber-100 hover:dark:bg-amber-900/50 hover:dark:text-amber-200"
            aria-label="Edit"
          >
            <LuPencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            className="size-8 center text-destructive hover:text-red-800 rounded hover:bg-red-100 hover:dark:bg-red-900/50 hover:dark:text-red-200"
            aria-label="Delete"
          >
            <LuTrash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-5 rounded-lg dark:bg-[#010611] minBody dark:text-white space-y-5">
      {isError ? (
        <ErrorState />
      ) : isLoading ? (
        <TableSkeleton columns={columns} rowCount={limit} />
      ) : (
        <>
          <TopPart
            filters={filters}
            setFilters={setFilters}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <Table
            data={users}
            columns={columns}
            pagination={true}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            totalData={totalUsers}
            totalPages={totalPages}
            sorting={true}
          />
        </>
      )}

      {/* View User Modal */}
      <UserView viewModal={viewModal} selectedUser={selectedUser} />

      {/* Edit User Modal */}
      <UserEdit editModal={editModal} selectedUser={selectedUser} />

      {/* Delete Confirmation Modal */}
      <UserDelete
        deleteModal={deleteModal}
        isDeleting={isDeleting}
        selectedUser={selectedUser}
        handleConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default UserTable;
