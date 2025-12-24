"use client";

import { useState, useMemo } from "react";
import { LuSearch, LuPlus, LuEye, LuX } from "react-icons/lu";
import { Table } from "@/components/ui/table/Table";
import { Input } from "@/components/ui/input/Input";
import { Select } from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";
import { LucideEdit } from "lucide-react";
import { Modal } from "@/components/ui/modal/Modal";
import { useModal } from "@/lib/useModal";
import { mockUsers } from "@/utils/FakeData";
import { toast } from "react-hot-toast";
import { userRoleOptions, userStatusOptions } from "@/utils/DataHelper";
import EditUserForm from "@/components/form/EditUserForm";

export default function UserPage() {
  const [users, setUsers] = useState(mockUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);

  // Modal hooks
  const viewModal = useModal();
  const editModal = useModal();

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter ? user.role === roleFilter : true;
      const matchStatus = statusFilter ? user.status === statusFilter : true;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / limit);
  const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit);

  const handleView = (user) => {
    setSelectedUser(user);
    viewModal.open();
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    // setEditFormData({
    //   name: user.name,
    //   email: user.email,
    //   phoneNumber: user.phoneNumber,
    //   role: user.role,
    //   status: user.status,
    // });
    // setEditErrors({});
    editModal.open();
  };

  const columns = [
    {
      id: "name",
      header: "Name",
      accessor: (row) => row.name,
    },
    {
      id: "email",
      header: "Email",
      accessor: (row) => row.email,
    },
    {
      id: "phoneNumber",
      header: "Phone Number",
      accessor: (row) => row.phoneNumber,
    },
    {
      id: "isEmailVerified",
      header: "Email Verified",
      accessor: (row) => (row.isEmailVerified ? "Yes" : "No"),
    },
    {
      id: "role",
      header: "Role",
      accessor: (row) => row.role,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => row.status,
      cell: (_, row) => (
        <div>
          {row?.status === "active" ? (
            <div className="bg-green-500/10 text-green-800 center py-1.5 rounded-full capitalize font-medium ">
              {row?.status}
            </div>
          ) : (
            <div className="bg-red-500/10 text-red-800 center py-1.5 rounded-full capitalize font-medium ">
              {row?.status}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Action",
      accessor: () => null,
      cell: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleView(row);
            }}
            className="size-10 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded flex items-center justify-center"
            aria-label="View"
          >
            <LuEye className="size-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="size-10 p-0 text-green-600 hover:text-green-800 hover:bg-green-100 dark:hover:bg-green-900/50 rounded flex items-center justify-center"
            aria-label="Edit"
          >
            <LucideEdit className="size-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="bg-white dark:bg-[#010611] minBody p-6 rounded-xl space-y-6">
        <div className="flex sm:flex-row flex-col sm:items-center justify-between lg:gap-14 gap-4">
          <h1 className="text-xl font-medium">User Management</h1>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              endIcon={<LuSearch className="h-5 w-5" />}
              className="rounded-full sm:w-fit sm:min-w-52 bg-[#DEF4FF33] dark:bg-[#161F2D] dark:border-[#162127] px-4"
            />

            {/* Filter Controls */}
            <div className="flex items-center gap-2">
              <div className="w-48">
                <Select
                  options={userRoleOptions}
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  fullWidth
                  className="h-10 dark:border-[#475569]"
                />
              </div>

              <div className="w-[8.5rem]">
                <Select
                  options={userStatusOptions}
                  value={statusFilter}
                  fullWidth
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 dark:border-[#475569]"
                />
              </div>
            </div>
          </div>
        </div>

        <Table
          data={paginatedUsers}
          columns={columns}
          pagination={true}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalData={totalUsers}
          totalPages={totalPages}
        />
      </div>

      {/* View User Modal */}

      <Modal
        open={viewModal.isOpen}
        onClose={viewModal.close}
        title="User Details"
        size="xxlarge"
      >
        <div>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                  {!selectedUser.profileImage ? (
                    <img
                      src={selectedUser.profileImage || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 text-xl font-semibold">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedUser.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              {/* User Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <p className="text-black dark:text-white">
                    {selectedUser.phoneNumber || "Not provided"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <p className="text-black dark:text-white capitalize">
                    {selectedUser.role}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <span
                    className={`inline-flex px-4 py-1.5 text-[13px] capitalize font-medium rounded-full ${
                      selectedUser.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {selectedUser.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                    Email Verified
                  </label>
                  <p className="text-black dark:text-white">
                    {selectedUser.isEmailVerified ? "Yes" : "No"}
                  </p>
                </div>

                {selectedUser.age && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                      Age
                    </label>
                    <p className="text-black dark:text-white">
                      {selectedUser.age} years
                    </p>
                  </div>
                )}

                {selectedUser.gender && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                      Gender
                    </label>
                    <p className="text-black dark:text-white capitalize">
                      {selectedUser.gender}
                    </p>
                  </div>
                )}

                {selectedUser.designation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                      Designation
                    </label>
                    <p className="text-black dark:text-white">
                      {selectedUser.designation}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                    Street Address
                  </label>
                  <p className="text-black dark:text-white">
                    {selectedUser.address.streetAddress || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                    Area/Village
                  </label>
                  <p className="text-black dark:text-white">
                    {selectedUser.address.areaOrVillage || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">
                    District
                  </label>
                  <p className="text-black dark:text-white">
                    {selectedUser.address.district || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        open={editModal.isOpen}
        onClose={editModal.close}
        title="Edit User"
        size="xxlarge"
      >
        <EditUserForm
          selectedUser={selectedUser}
          editModal={editModal}
          setUsers={setUsers}
        />
      </Modal>
    </>
  );
}
