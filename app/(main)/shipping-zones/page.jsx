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

  const columns = [
    {
      id: "zone",
      header: "Zone Name",
      cell: (_, row) => (
        <div>
          <div className="flex items-center gap-2">
            <LuGlobe className="size-4 text-primary" />
            <p className="font-semibold text-gray-900 dark:text-white">
              {row.name}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">Priority:</span>
            <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
              {row.priority || 0}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "coverage",
      header: "Coverage",
      cell: (_, row) => (
        <div className="space-y-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <LuMapPin className="size-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">
                Countries
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {row.countries?.map((country, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-xs font-medium"
                >
                  {country}
                </span>
              ))}
            </div>
          </div>
          {row.states?.length > 0 && (
            <div>
              <span className="text-xs text-gray-500">
                {row.states.length} State{row.states.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
          {row.cities?.length > 0 && (
            <div>
              <span className="text-xs text-gray-500">
                {row.cities.length} Cit{row.cities.length > 1 ? "ies" : "y"}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "rates",
      header: "Shipping Rates",
      cell: (_, row) => {
        const ratesCount = row.rates?.length || 0;
        const rateTypes = [...new Set(row.rates?.map((r) => r.rateType) || [])];

        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <LuTruck className="size-4 text-gray-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {ratesCount} Rate{ratesCount > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {rateTypes.map((type, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs capitalize"
                >
                  {type?.replace("_", " ")}
                </span>
              ))}
            </div>
            {row.freeShippingEnabled && row.freeShippingThreshold && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded font-medium">
                <LuCheck className="size-3" />
                Free over ৳{row.freeShippingThreshold}
              </span>
            )}
          </div>
        );
      },
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
            className="size-8 center text-blue-600 bg-blue-100/50 rounded dark:text-blue-300 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            aria-label="View"
          >
            <LuEye className="size-4" />
          </button>
          <Link
            href={`/shipping-zones/edit/${row._id}`}
            onClick={(e) => e.stopPropagation()}
            className="size-8 center text-amber-600 bg-amber-100/50 rounded dark:text-amber-300 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
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
            className="size-8 center text-destructive bg-red-100/50 rounded dark:text-red-300 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
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
          <div className="space-y-5">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Zone Name
                </label>
                <p className="text-gray-800 dark:text-white font-medium mt-1">
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
                  Priority
                </label>
                <p className="text-gray-800 dark:text-white mt-1">
                  {selectedZone.priority || 0}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Total Rates
                </label>
                <p className="text-gray-800 dark:text-white mt-1">
                  {selectedZone.rates?.length || 0}
                </p>
              </div>
            </div>

            {/* Coverage */}
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
                Coverage Area
              </label>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
                <div>
                  <span className="text-xs text-gray-500">Countries:</span>
                  <p className="text-gray-800 dark:text-white">
                    {selectedZone.countries?.join(", ") || "-"}
                  </p>
                </div>
                {selectedZone.states?.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500">
                      States/Divisions:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedZone.states.map((state, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-sm"
                        >
                          {state}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedZone.cities?.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500">Cities:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
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
              </div>
            </div>

            {/* Shipping Rates */}
            {selectedZone.rates?.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
                  Shipping Rates
                </label>
                <div className="space-y-2">
                  {selectedZone.rates.map((rate, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border ${
                        rate.isDefault
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-800 dark:text-white">
                              {rate.name}
                            </p>
                            {rate.isDefault && (
                              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="mt-2 space-y-1 text-sm">
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="text-gray-500">Type:</span>{" "}
                              <span className="capitalize">
                                {rate.rateType?.replace("_", " ")}
                              </span>
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="text-gray-500">Delivery:</span>{" "}
                              {rate.estimatedDeliveryDays?.min || 1}-
                              {rate.estimatedDeliveryDays?.max || 3} days
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            ৳{rate.flatRate || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Free Shipping */}
            {selectedZone.freeShippingEnabled && (
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-green-800 dark:text-green-300 font-medium">
                  🎉 Free shipping available on orders over{" "}
                  <strong>৳{selectedZone.freeShippingThreshold}</strong>
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
              <Button variant="outline" onClick={viewModal.close}>
                Close
              </Button>
              <Link href={`/shipping-zones/edit/${selectedZone._id}`}>
                <Button onClick={viewModal.close}>Edit Zone</Button>
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
