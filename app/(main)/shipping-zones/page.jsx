"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  LuEye,
  LuPencil,
  LuTrash2,
  LuCheck,
  LuX,
  LuGlobe,
  LuMapPin,
  LuTruck,
} from "react-icons/lu";

import { useModal } from "@/lib/useModal";
import { Table } from "@/components/ui/table/Table";
import { Button } from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal/Modal";
import { TableSkeleton } from "@/components/skeleton/TableSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import ShippingZoneManageHeader from "@/components/section/shippingZoneSection/ShippingZoneManageHeader";
import {
  useGetShippingZoneListQuery,
  useDeleteShippingZoneMutation,
} from "@/features/shippingZones/shippingZonesApiSlice";
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

export default function ShippingZonesPage() {
  const [deleteZone, { isLoading: deleteLoading }] =
    useDeleteShippingZoneMutation();

  const viewModal = useModal();
  const deleteModal = useModal();

  const [selectedZone, setSelectedZone] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const { data, isLoading, isError, refetch } = useGetShippingZoneListQuery({
    searchTerm,
    status: statusFilter || undefined,
    page,
    limit,
  });

  const zones = data?.data || [];
  const totalData = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPage || 0;

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setIsManualRefreshing(false);
  };

  const confirmDelete = async () => {
    if (!selectedZone?._id) {
      toast.error("Zone not selected");
      return;
    }
    const loadingToast = toast.loading("Deleting zone...");
    const result = await deleteZone(selectedZone._id);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "delete-zone",
      message: "Shipping zone deleted successfully!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) {
      deleteModal.close();
      setSelectedZone(null);
    }
  };

  const getDefaultRate = (rates) => {
    const defaultRate = rates?.find((r) => r.isDefault) || rates?.[0];
    return defaultRate?.flatRate || 0;
  };

  const columns = [
    {
      id: "zone",
      header: "Zone",
      cell: (_, row) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white flex items-center gap-2">
            <LuGlobe className="size-4 text-gray-400" />
            {row.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Priority: {row.priority || 0}
          </p>
        </div>
      ),
    },
    {
      id: "coverage",
      header: "Coverage",
      cell: (_, row) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <LuMapPin className="size-3.5" />
            <span>{row.countries?.join(", ") || "-"}</span>
          </div>
          {row.cities?.length > 0 && (
            <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
              {row.cities.slice(0, 3).join(", ")}
              {row.cities.length > 3 ? `... +${row.cities.length - 3}` : ""}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "rate",
      header: "Shipping Rate",
      cell: (_, row) => (
        <div className="flex items-center gap-2">
          <LuTruck className="size-4 text-gray-400" />
          <span className="font-semibold text-gray-800 dark:text-white">
            ৳{getDefaultRate(row.rates)}
          </span>
          {row.freeShippingEnabled && row.freeShippingThreshold && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
              Free over ৳{row.freeShippingThreshold}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (_, row) => getStatusBadge(row.status),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (_, row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedZone(row);
              viewModal.open();
            }}
            className="size-8 center text-blue-600 bg-blue-100/50 rounded dark:text-blue-300 dark:bg-blue-900/30"
            aria-label="View"
          >
            <LuEye className="size-4" />
          </button>
          <Link
            href={`/shipping-zones/edit/${row._id}`}
            onClick={(e) => e.stopPropagation()}
            className="size-8 center text-amber-600 bg-amber-100/50 rounded dark:text-amber-300 dark:bg-amber-900/30"
            aria-label="Edit"
          >
            <LuPencil className="size-4" />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedZone(row);
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
          <ShippingZoneManageHeader
            pageTitle="Shipping Zones"
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            addHref="/shipping-zones/add"
            onRefresh={handleRefresh}
            isRefreshing={isManualRefreshing}
          />
          <Table
            data={zones}
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
        title="Shipping Zone Details"
        size="large"
      >
        {selectedZone && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Name
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedZone.name}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </label>
                <div className="mt-1">
                  {getStatusBadge(selectedZone.status)}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Countries
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedZone.countries?.join(", ") || "-"}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Priority
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedZone.priority || 0}
                </p>
              </div>
            </div>
            {selectedZone.cities?.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Cities
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedZone.cities.map((city, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm"
                    >
                      {city}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {selectedZone.rates?.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Shipping Rates
                </label>
                <div className="mt-2 space-y-2">
                  {selectedZone.rates.map((rate, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {rate.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {rate.estimatedDeliveryDays?.min || 1}-
                          {rate.estimatedDeliveryDays?.max || 3} days
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          ৳{rate.flatRate || 0}
                        </p>
                        {rate.isDefault && (
                          <span className="text-xs text-green-600">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedZone.freeShippingEnabled && (
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <p className="text-green-800 dark:text-green-300">
                  Free shipping on orders over{" "}
                  <strong>৳{selectedZone.freeShippingThreshold}</strong>
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={viewModal.close}>
                Close
              </Button>
              <Link href={`/shipping-zones/edit/${selectedZone._id}`}>
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
        title="Delete Shipping Zone"
        size="medium"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <strong className="text-gray-800 dark:text-white">
              {selectedZone?.name}
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
