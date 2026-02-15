"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import moment from "moment";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  LuArrowLeft,
  LuTruck,
  LuPackage,
  LuMapPin,
  LuPhone,
  LuHash,
  LuCalendar,
  LuSave,
  LuCheck,
  LuClock,
  LuX,
  LuDollarSign,
} from "react-icons/lu";

import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import {
  useGetSingleShipmentQuery,
  useUpdateTrackingStatusMutation,
} from "@/features/shipments/shipmentsApiSlice";
import { handleToast } from "@/utils/handleToast";

const deliveryStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "picked", label: "Picked Up" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned" },
  { value: "cancelled", label: "Cancelled" },
];

const statusColors = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  picked: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  in_transit:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300",
  delivered:
    "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  returned:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

const courierLabels = {
  PATHAO: "Pathao Courier",
  SUNDARBAN: "Sundarban Courier",
  MANUAL: "Manual Shipping",
};

const timelineIcons = {
  pending: { icon: LuClock, color: "bg-yellow-500" },
  picked: { icon: LuPackage, color: "bg-blue-500" },
  in_transit: { icon: LuTruck, color: "bg-indigo-500" },
  delivered: { icon: LuCheck, color: "bg-green-500" },
  returned: { icon: LuMapPin, color: "bg-orange-500" },
  cancelled: { icon: LuX, color: "bg-red-500" },
};

export default function ShipmentDetailsPage() {
  const params = useParams();
  const shipmentId = params.id;

  const [updateTracking, { isLoading: updateLoading }] =
    useUpdateTrackingStatusMutation();
  const [newStatus, setNewStatus] = useState("");

  const { data, isLoading, isError } = useGetSingleShipmentQuery(shipmentId);
  const shipment = data?.data;

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }
    const result = await updateTracking({
      id: shipmentId,
      deliveryStatus: newStatus,
    });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-tracking",
      message: "Tracking status updated!",
    });
    if (result?.data) setNewStatus("");
  };

  if (isError) return <ErrorBoundaryFetcher />;
  if (isLoading)
    return (
      <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    );

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
        <Link
          href="/shipments"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LuArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Shipment Details
          </h1>
          <p className="text-sm text-gray-500 font-mono">
            {shipment?.trackingNumber}
          </p>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${statusColors[shipment?.deliveryStatus] || statusColors.pending}`}
        >
          {(shipment?.deliveryStatus || "pending").replace("_", " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipment Info */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
              <LuTruck className="size-4" />
              Shipment Information
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-gray-500 flex items-center gap-1.5">
                  <LuHash className="size-3.5" /> Tracking Number
                </p>
                <p className="font-mono font-medium text-gray-800 dark:text-white">
                  {shipment?.trackingNumber || "---"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 flex items-center gap-1.5">
                  <LuTruck className="size-3.5" /> Courier
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {courierLabels[shipment?.courier] || shipment?.courier}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 flex items-center gap-1.5">
                  <LuDollarSign className="size-3.5" /> COD Amount
                </p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">
                  {shipment?.codAmount > 0
                    ? `৳${shipment.codAmount.toLocaleString("en-BD")}`
                    : "Prepaid"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 flex items-center gap-1.5">
                  <LuCalendar className="size-3.5" /> Created
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {moment(shipment?.createdAt).format("DD MMM YYYY, hh:mm A")}
                </p>
              </div>
            </div>
          </div>

          {/* Recipient Info */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
              <LuMapPin className="size-4" />
              Recipient Information
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-800 dark:text-white">
                {shipment?.recipientName}
              </p>
              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <LuPhone className="size-4" />
                {shipment?.recipientPhone}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {shipment?.recipientAddress}
              </p>
              {shipment?.recipientCity && (
                <p className="text-gray-600 dark:text-gray-400">
                  {shipment.recipientCity}
                  {shipment.recipientZone && `, ${shipment.recipientZone}`}
                  {shipment.recipientArea && `, ${shipment.recipientArea}`}
                </p>
              )}
            </div>
          </div>

          {/* Linked Order */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
              <LuPackage className="size-4" />
              Linked Order
            </h2>
            {shipment?.order ? (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div>
                  <Link
                    href={`/orders/${shipment.order._id || shipment.order}`}
                    className="font-mono font-semibold text-primary hover:underline"
                  >
                    #{shipment.order.orderNumber || "View Order"}
                  </Link>
                  {shipment.order.status && (
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      Status: {shipment.order.status}
                    </p>
                  )}
                </div>
                {shipment.order.total && (
                  <div className="text-right">
                    <p className="font-semibold text-gray-800 dark:text-white">
                      ৳{shipment.order.total.toLocaleString("en-BD")}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No linked order</p>
            )}
          </div>

          {/* Tracking Events */}
          {shipment?.trackingEvents?.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                Tracking History
              </h2>
              <div className="space-y-4">
                {shipment.trackingEvents.map((event, index) => {
                  const statusInfo =
                    timelineIcons[event.status] || timelineIcons.pending;
                  const EventIcon = statusInfo.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 relative"
                    >
                      {index < shipment.trackingEvents.length - 1 && (
                        <div className="absolute left-[11px] top-7 w-0.5 h-[calc(100%+4px)] bg-gray-200 dark:bg-gray-700" />
                      )}
                      <div
                        className={`w-6 h-6 rounded-full ${statusInfo.color} flex items-center justify-center shrink-0 z-10`}
                      >
                        <EventIcon className="size-3 text-white" />
                      </div>
                      <div className="flex-1 pb-1">
                        <p className="font-medium text-gray-800 dark:text-white capitalize text-sm">
                          {(event.status || "").replace("_", " ")}
                        </p>
                        {event.note && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {event.note}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {moment(event.timestamp || event.createdAt).format(
                            "DD MMM YYYY, hh:mm A",
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Update Status */}
          {shipment?.deliveryStatus !== "delivered" &&
            shipment?.deliveryStatus !== "cancelled" && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                  Update Status
                </h2>
                <div className="space-y-3">
                  <Select
                    label="New Status"
                    options={deliveryStatusOptions}
                    value={newStatus}
                    onValueChange={setNewStatus}
                  />
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={updateLoading || !newStatus}
                    className="w-full"
                  >
                    <LuSave className="size-4" />
                    {updateLoading ? "Updating..." : "Update Status"}
                  </Button>
                </div>
              </div>
            )}

          {/* Courier Details */}
          {shipment?.courier === "PATHAO" && shipment?.pathaoConsignmentId && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                Pathao Details
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Consignment ID</span>
                  <span className="font-mono text-gray-800 dark:text-white">
                    {shipment.pathaoConsignmentId}
                  </span>
                </div>
                {shipment.pathaoStore && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Store</span>
                    <span className="text-gray-800 dark:text-white">
                      {shipment.pathaoStore}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Summary */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
              Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Weight</span>
                <span className="text-gray-800 dark:text-white">
                  {shipment?.weight ? `${shipment.weight} kg` : "---"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Item Type</span>
                <span className="text-gray-800 dark:text-white capitalize">
                  {shipment?.itemType || "---"}
                </span>
              </div>
              {shipment?.specialInstructions && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 mb-1">Special Instructions</p>
                  <p className="text-gray-800 dark:text-white text-xs">
                    {shipment.specialInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
