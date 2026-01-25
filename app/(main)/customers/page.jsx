"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import moment from "moment";
import {
  LuEye,
  LuPencil,
  LuTrash2,
  LuCheck,
  LuX,
  LuMail,
  LuPhone,
  LuUser,
  LuPlus,
  LuSearch,
  LuRefreshCw,
  LuSave,
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
  useGetCustomerListQuery,
  useDeleteCustomerMutation,
  useUpdateCustomerStatusMutation,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from "@/features/customers/customersApiSlice";
import { handleToast } from "@/utils/handleToast";

const statusFilterOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "banned", label: "Banned" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "banned", label: "Banned" },
];

export default function CustomersPage() {
  const [deleteCustomer, { isLoading: deleteLoading }] =
    useDeleteCustomerMutation();
  const [updateStatus] = useUpdateCustomerStatusMutation();
  const [createCustomer, { isLoading: createLoading }] =
    useCreateCustomerMutation();
  const [updateCustomer, { isLoading: updateLoading }] =
    useUpdateCustomerMutation();

  const viewModal = useModal();
  const deleteModal = useModal();
  const addModal = useModal();
  const editModal = useModal();

  const [selectedItem, setSelectedItem] = useState(null);
  const [filterData, setFilterData] = useState({ searchTerm: "", status: "" });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});

  const { data, isLoading, isError, refetch } = useGetCustomerListQuery({
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

  const confirmDelete = async () => {
    if (!selectedItem?._id) return;
    const result = await deleteCustomer(selectedItem._id);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "delete-customer",
      message: "Customer deleted!",
    });
    if (result?.data) {
      deleteModal.close();
      setSelectedItem(null);
    }
  };

  const handleStatusToggle = async (row) => {
    const newStatus = row.status === "active" ? "inactive" : "active";
    const result = await updateStatus({ id: row._id, status: newStatus });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-status",
      message: `Customer ${newStatus}!`,
    });
  };

  const clearSearch = () =>
    setFilterData((prev) => ({ ...prev, searchTerm: "" }));

  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      status: "active",
    });
    setErrors({});
  };

  const validateForm = (isEdit = false) => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!isEdit && !formData.password.trim())
      newErrors.password = "Password is required";
    if (!isEdit && formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    resetForm();
    addModal.open();
  };

  const handleEdit = (customer) => {
    setSelectedItem(customer);
    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      password: "",
      status: customer.status || "active",
    });
    setErrors({});
    editModal.open();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(false)) {
      toast.error("Please fix the errors");
      return;
    }

    const result = await createCustomer(formData);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "create-customer",
      message: "Customer created!",
    });

    if (result?.data) {
      addModal.close();
      resetForm();
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) {
      toast.error("Please fix the errors");
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      status: formData.status,
    };

    const result = await updateCustomer({
      id: selectedItem._id,
      data: payload,
    });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-customer",
      message: "Customer updated!",
    });

    if (result?.data) {
      editModal.close();
      resetForm();
      setSelectedItem(null);
    }
  };

  const columns = [
    {
      id: "name",
      header: "Customer",
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
            {row.profileImage?.url ? (
              <img
                src={row.profileImage.url}
                alt={row.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <LuUser className="size-4 text-primary" />
            )}
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
      id: "phone",
      header: "Phone",
      cell: (_, row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.phone || "---"}
        </span>
      ),
    },
    {
      id: "joinedAt",
      header: "Joined At",
      cell: (_, row) => (
        <span className="text-sm text-gray-500">
          {moment(row.createdAt).format("DD MMM YYYY")}
        </span>
      ),
    },
    {
      id: "verified",
      header: "Verified",
      cell: (_, row) => (
        <div className="flex gap-1">
          {row.isEmailVerified && (
            <span className="px-1.5 py-0.5 text-[10px] bg-green-100 text-green-700 rounded dark:bg-green-900/30 dark:text-green-300">
              <LuMail className="size-3 inline" />
            </span>
          )}
          {row.isPhoneVerified && (
            <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded dark:bg-blue-900/30 dark:text-blue-300">
              <LuPhone className="size-3 inline" />
            </span>
          )}
          {!row.isEmailVerified && !row.isPhoneVerified && (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStatusToggle(row);
          }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize cursor-pointer hover:opacity-80 ${row.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : row.status === "banned" ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300"}`}
        >
          {row.status === "active" ? (
            <LuCheck className="size-3.5" />
          ) : (
            <LuX className="size-3.5" />
          )}
          {row.status}
        </button>
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
              setSelectedItem(row);
              viewModal.open();
            }}
            className="size-8 center text-blue-600 bg-blue-100/50 rounded dark:text-blue-300 dark:bg-blue-900/30"
          >
            <LuEye className="size-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="size-8 center text-amber-600 bg-amber-100/50 rounded dark:text-amber-300 dark:bg-amber-900/30"
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
          <div className="flex flex-col gap-4">
            <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4">
              <h1 className="text-xl font-medium">Customers</h1>
              <Button onClick={handleAdd} className="whitespace-nowrap">
                <LuPlus className="size-4" /> Add Customer
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Input
                placeholder="Search customers..."
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
                className="w-full sm:w-64"
              />
              <Select
                options={statusFilterOptions}
                value={filterData.status}
                onValueChange={(value) =>
                  setFilterData((prev) => ({ ...prev, status: value }))
                }
                placeholder="Filter by Status"
                className="w-full sm:w-40"
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
        title="Customer Details"
        size="medium"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                {selectedItem.profileImage?.url ? (
                  <img
                    src={selectedItem.profileImage.url}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <LuUser className="size-6 text-primary" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {selectedItem.name}
                </h3>
                <p className="text-sm text-gray-500">{selectedItem.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Phone
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedItem.phone || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Status
                </label>
                <p className="text-gray-800 dark:text-white capitalize">
                  {selectedItem.status}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">
                  Joined At
                </label>
                <p className="text-gray-800 dark:text-white">
                  {moment(selectedItem.createdAt).format("DD MMM YYYY")}
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
                  handleEdit(selectedItem);
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete Customer"
        size="small"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <strong>{selectedItem?.name}</strong>? This action cannot be undone.
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

      {/* Add Customer Modal */}
      <Modal
        open={addModal.isOpen}
        onClose={() => {
          addModal.close();
          resetForm();
        }}
        title="Add Customer"
        size="medium"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Name"
            placeholder="John Doe"
            value={formData.name}
            onValueChange={(val) => handleInputChange("name", val)}
            error={errors.name}
            requiredSign={true}
          />
          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onValueChange={(val) => handleInputChange("email", val)}
            error={errors.email}
            requiredSign={true}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onValueChange={(val) => handleInputChange("password", val)}
            error={errors.password}
            requiredSign={true}
          />
          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onValueChange={(val) => handleInputChange("status", val)}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                addModal.close();
                resetForm();
              }}
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createLoading}>
              <LuSave className="size-4" />
              {createLoading ? "Creating..." : "Create Customer"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        open={editModal.isOpen}
        onClose={() => {
          editModal.close();
          resetForm();
          setSelectedItem(null);
        }}
        title="Edit Customer"
        size="medium"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <Input
            label="Name"
            placeholder="John Doe"
            value={formData.name}
            onValueChange={(val) => handleInputChange("name", val)}
            error={errors.name}
            requiredSign={true}
          />
          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onValueChange={(val) => handleInputChange("email", val)}
            error={errors.email}
            requiredSign={true}
          />
          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onValueChange={(val) => handleInputChange("status", val)}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                editModal.close();
                resetForm();
                setSelectedItem(null);
              }}
              disabled={updateLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateLoading}>
              <LuSave className="size-4" />
              {updateLoading ? "Updating..." : "Update Customer"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
