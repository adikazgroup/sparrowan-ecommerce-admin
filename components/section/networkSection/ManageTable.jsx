"use client";

import {
  LuEye,
  LuBadgeX,
  LuPencil,
  LuCalendar,
  LuBadgeCheck,
} from "react-icons/lu";
import moment from "moment";
import TopPart from "./TopPart";
import { useState } from "react";
import toast from "react-hot-toast";
import NetworkView from "./NetworkView";
import NetworkEdit from "./NetworkEdit";
import { OctagonX } from "lucide-react";
import { useModal } from "@/lib/useModal";
import NetworkDelete from "./NetworkDelete";
import { Table } from "@/components/ui/table/Table";
import { ErrorState } from "@/components/errors/ErrorState";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import {
  useDeleteNetworkMutation,
  useUpdateNetworkMutation,
} from "@/features/network/networkApiSlice";

const ManageTable = ({
  page,
  setPage,
  limit,
  setLimit,
  totalNetwork,
  totalPages,
  data,
  loading = false,
  isError = false,
  setSearchTerm,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [updateNetwork, { isLoading: isUpdating }] = useUpdateNetworkMutation();
  const [deleteNetwork, { isLoading: isDeleting }] = useDeleteNetworkMutation();
  // Form state for editing
  const [formData, setFormData] = useState({
    networkName: "",
    networkDomain: "",
    email: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  // Modal states
  const viewModal = useModal();
  const editModal = useModal();
  const deleteModal = useModal();

  // Action handlers
  const handleView = (row) => {
    setSelectedNetwork(row);
    viewModal.open();
  };

  const handleEdit = (row) => {
    setSelectedNetwork(row);
    setFormData({
      networkName: row.networkName || "",
      networkDomain: row.networkDomain || "",
      email: row.email || "",
      startDate: row.startDate || "",
      endDate: row.endDate || "",
      status: row.status || "",
    });
    editModal.open();
  };

  const handleDelete = (row) => {
    setSelectedNetwork(row);
    deleteModal.open();
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateNetwork = async (e) => {
    e.preventDefault();

    if (!selectedNetwork) return;

    try {
      await updateNetwork({
        networkId: selectedNetwork._id,
        data: {
          networkName: formData.networkName,
          networkDomain: formData.networkDomain,
          email: formData.email,
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status,
        },
      });

      toast.success("Network updated successfully!");
      editModal.close();
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || "Failed to update network!");
    }
  };

  // ✅ Now the real delete API call:
  const handleDeleteNetwork = async () => {
    if (!selectedNetwork) return;
    console.log("deleteNetwork", selectedNetwork._id);
    try {
      await deleteNetwork(selectedNetwork._id);
      toast.success("Network deleted successfully!");
      deleteModal.close();
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || "Failed to delete network!");
    }
  };

  // Define columns
  const columns = [
    {
      id: "networkName",
      header: "Network Name",
      accessor: (row) => row.networkName,
      minWidth: "150px",
    },
    {
      id: "networkDomain",
      header: "networkDomain",
      accessor: (row) => row.networkDomain,
    },
    {
      id: "email",
      header: "Email",
      accessor: (row) => row.email,
      minWidth: "160px",
    },
    {
      id: "startDate",
      header: "Start Date",
      accessor: (row) => row.startDate,
      cell: (value) => (
        <div className="flex items-center">{moment(value).format("L")}</div>
      ),
      minWidth: "160px",
    },
    {
      id: "endDate",
      header: "End Date",
      accessor: (row) => row.endDate,
      cell: (value) => (
        <div className="flex items-center">{moment(value).format("L")}</div>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => row.status,
      cell: (value) => (
        <div className="flex items-center">
          {value === "approved" && (
            <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 dark:text-green-100 text-green-800">
              <LuBadgeCheck className="mr-1 h-3 w-3" />
              Approved
            </span>
          )}
          {value === "pending" && (
            <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-amber-900/20 dark:text-yellow-100 text-yellow-800">
              <LuCalendar className="mr-1 h-3 w-3" />
              Pending
            </span>
          )}
          {value === "disabled" && (
            <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/50 dark:text-gray-100 text-gray-800">
              <LuBadgeX className="mr-1 h-3 w-3" />
              Disabled
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
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleView(row);
              }}
              className="size-8 center text-blue-600 hover:text-blue-800 rounded hover:bg-blue-100 dark:hover:bg-blue-800/20"
              aria-label="View"
            >
              <LuEye className="h-4 w-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
              }}
              className="size-8 center text-amber-600 hover:text-amber-800 rounded hover:bg-amber-100 dark:hover:bg-amber-800/20"
              aria-label="Edit"
            >
              <LuPencil className="h-4 w-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              className="size-8 center text-destructive hover:text-red-800 rounded hover:bg-red-100 dark:hover:bg-red-800/20"
              aria-label="Delete"
            >
              <OctagonX className="h-4 w-4" />
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className=" space-y-5 ">
      {isError ? (
        <ErrorState />
      ) : loading ? (
        <TableSkeleton columns={columns} rowCount={limit} />
      ) : (
        <>
          <TopPart setSearchTerm={setSearchTerm} />

          <Table
            columns={columns}
            pagination={true}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            totalData={totalNetwork}
            totalPages={totalPages}
            data={data}
          />
        </>
      )}

      {/* View Network Modal */}
      <NetworkView selectedNetwork={selectedNetwork} viewModal={viewModal} />
      {/* Edit Network Modal */}
      <NetworkEdit
        isUpdating={isUpdating}
        formData={formData}
        editModal={editModal}
        selectedNetwork={selectedNetwork}
        handleFormChange={handleFormChange}
        handleUpdateNetwork={handleUpdateNetwork}
      />

      {/* Delete Confirmation Modal */}
      <NetworkDelete
        isDeleting={isDeleting}
        deleteModal={deleteModal}
        selectedNetwork={selectedNetwork}
        handleDeleteNetwork={handleDeleteNetwork}
      />
    </div>
  );
};

export default ManageTable;
