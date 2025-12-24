"use client";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  LuEye,
  LuPencil,
  LuBadgeX,
  LuTrash2,
  LuBadgeCheck,
} from "react-icons/lu";

import { useModal } from "@/lib/useModal";
import { handleToast } from "@/utils/handleToast";
import { Modal } from "@/components/ui/modal/Modal";
import { Table } from "@/components/ui/table/Table";
import { Button } from "@/components/ui/button/Button";
import { ErrorState } from "@/components/errors/ErrorState";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import PackageManegeHeader from "@/components/section/packageSection/managePackageSection/PackageManegeHeader";
import { generateData } from "@/utils/DataGenerator";
const sampleData = generateData(50);
export default function ManagePackagePage() {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const deleteModal = useModal();

  // Package Data
  const [filters, setFilters] = useState({
    status: {
      active: false,
      inactive: false,
      archived: false,
    },
  });
  const [sortOption, setSortOption] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const isError = false; // Replace with actual error state
  const packageLoading = false; // Replace with actual loading state
  const deletePackageLoading = false; // Replace with actual loading state

  const confirmDelete = async () => {
    if (!selectedPackage?._id) {
      toast.error("Package not selected");
      return;
    }

    const result = await removePackage(selectedPackage?._id);

    if (result?.data) {
      handleToast(result);
      deleteModal.close();
    } else {
      handleToast(result, "error");
    }
  };

  // Define columns
  const columns = [
    {
      id: "packageName",
      header: "Package Name",
      accessor: () => null,
      cell: () => (
        <Link
          href={`/package/manage-package/view`}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-400"
        >
          Package Name
        </Link>
      ),
    },
    {
      id: "duration",
      header: "Package Duration",
      accessor: () => null,
      cell: () => <div className="text-black">24 October, 2024</div>,
    },
    {
      id: "maxPeople",
      header: "MaxPeople",
      accessor: () => null,
      cell: () => (
        <span className="text-gray-600 dark:text-gray-400">10 people</span>
      ),
    },
    {
      id: "location",
      header: "Location",
      accessor: () => null,
      cell: () => (
        <span className="text-gray-600 dark:text-gray-400">
          Dhaka, Bangladesh
        </span>
      ),
    },
    {
      id: "price",
      header: "Price",
      accessor: () => null,
      cell: () => (
        <span className="text-gray-600 dark:text-gray-400"> $4,000</span>
      ),
    },
    {
      id: "bookingDeadline",
      header: "Booking Deadline",
      accessor: () => null,
      cell: () => (
        <span className="text-gray-600 dark:text-gray-400">
          29 October, 2024
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: () => null,
      cell: (value) => (
        <div className="flex items-center">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 dark:text-green-300 text-green-800 ">
            <LuBadgeCheck className="mr-1 h-3 w-3" />
            Active
          </span>

          {value === "pending" && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
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
      cell: (_) => (
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/package/manage-package/view/12`}
              className="size-8 center text-blue-600 hover:text-blue-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 dark:hover:text-blue-300"
              aria-label="View"
            >
              <LuEye className="h-4 w-4" />
            </Link>

            <Link
              href={`/package/manage-package/edit/12`}
              className="size-8 center text-amber-600 hover:text-amber-800 rounded hover:bg-amber-100 dark:hover:bg-amber-900/50 dark:hover:text-amber-300"
              aria-label="Edit"
            >
              <LuPencil className="h-4 w-4" />
            </Link>

            <button
              className="size-8 center text-destructive hover:text-red-800 rounded hover:bg-red-100 dark:hover:bg-red-900/50 dark:hover:text-red-300"
              aria-label="Delete"
            >
              <LuTrash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-5">
      {isError ? (
        <ErrorState />
      ) : packageLoading ? (
        <TableSkeleton columns={columns} rowCount={limit} />
      ) : (
        <>
          <PackageManegeHeader
            pageTitle={"Show all packages"}
            filters={filters}
            setFilters={setFilters}
            sortOption={sortOption}
            setSortOption={setSortOption}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />
          <Table
            data={sampleData}
            columns={columns}
            pagination={true}
            page={page}
            setPage={setPage}
            limit={limit}
            setLimit={setLimit}
            totalData={30}
            totalPages={3}
            sorting={true}
          />
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete Package"
        description={
          selectedPackage &&
          `Are you sure you want to delete "${selectedPackage?.name}"?`
        }
        variant="destructive"
      >
        <p className="mb-4">
          This action cannot be undone. The package will be permanently deleted
          from the system.
        </p>

        <div className="flex justify-end mt-6">
          <Button
            variant="outline"
            onClick={deleteModal.close}
            className="mr-2 dark:bg-gray-500 dark:border-gray-500 dark:text-white dark:hover:bg-transparent"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={deletePackageLoading}
          >
            {deletePackageLoading ? "Loading..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
