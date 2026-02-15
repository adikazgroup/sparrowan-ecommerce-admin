"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import moment from "moment";
import { toast } from "react-hot-toast";
import {
  LuArrowLeft,
  LuPackage,
  LuMapPin,
  LuUser,
  LuPhone,
  LuMail,
  LuSave,
  LuX,
  LuRotateCcw,
  LuWallet,
  LuTrendingUp,
  LuTrendingDown,
} from "react-icons/lu";
import Link from "next/link";

import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { useModal } from "@/lib/useModal";
import { Modal } from "@/components/ui/modal/Modal";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import {
  useGetSingleOrderQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useProcessReturnMutation,
} from "@/features/orders/ordersApiSlice";
import { handleToast } from "@/utils/handleToast";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

const returnStatusOptions = [
  { value: "requested", label: "Requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
];

const orderTypeLabels = {
  cod: "Cash on Delivery",
  pickup: "Pickup",
  "online-payment": "Online Payment",
};

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id;

  const [updateStatus, { isLoading: updateLoading }] =
    useUpdateOrderStatusMutation();
  const [cancelOrder, { isLoading: cancelLoading }] = useCancelOrderMutation();
  const [processReturn, { isLoading: returnLoading }] =
    useProcessReturnMutation();

  const cancelModal = useModal();
  const returnModal = useModal();

  const [statusData, setStatusData] = useState({ status: "", notes: "" });
  const [cancelReason, setCancelReason] = useState("");
  const [returnStatus, setReturnStatus] = useState("");

  const { data, isLoading, isError } = useGetSingleOrderQuery(orderId);
  const order = data?.data;

  const handleStatusUpdate = async () => {
    if (!statusData.status) {
      toast.error("Please select a status");
      return;
    }
    const result = await updateStatus({
      id: orderId,
      status: statusData.status,
      notes: statusData.notes || undefined,
    });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-status",
      message: "Order status updated!",
    });
    if (result?.data) setStatusData({ status: "", notes: "" });
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }
    const result = await cancelOrder({ id: orderId, reason: cancelReason });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "cancel-order",
      message: "Order cancelled!",
    });
    if (result?.data) {
      cancelModal.close();
      setCancelReason("");
    }
  };

  const handleProcessReturn = async () => {
    if (!returnStatus) {
      toast.error("Please select a return status");
      return;
    }
    const result = await processReturn({ id: orderId, status: returnStatus });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "process-return",
      message: "Return processed!",
    });
    if (result?.data) {
      returnModal.close();
      setReturnStatus("");
    }
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

  const profit = order?.totalProfit || 0;
  const isProfitable = profit >= 0;

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
        <Link
          href="/orders"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LuArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Order Details
          </h1>
          <p className="text-sm text-gray-500">Order #{order?.orderNumber}</p>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${
            order?.status === "delivered"
              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
              : order?.status === "cancelled"
                ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
          }`}
        >
          {order?.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
              <LuPackage className="size-4" />
              Order Items
            </h2>
            <div className="space-y-3">
              {order?.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg"
                >
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <LuPackage className="size-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white">
                      {item.name}
                    </p>
                    {item.sku && (
                      <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      ৳{item.unitPrice?.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800 dark:text-white">
                      ৳{item.subtotal?.toFixed(2)}
                    </p>
                    {item.discount > 0 && (
                      <p className="text-xs text-green-600">
                        -৳{(item.discount * item.quantity).toFixed(2)}
                      </p>
                    )}
                    {item.unitCost > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        Cost: ৳{item.unitCost?.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="text-gray-800 dark:text-white">
                  ৳{order?.subtotal?.toFixed(2)}
                </span>
              </div>
              {order?.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Discount
                    {order?.coupon?.code && ` (${order.coupon.code})`}
                  </span>
                  <span className="text-green-600">
                    -৳{order?.discount?.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Shipping
                </span>
                <span className="text-gray-800 dark:text-white">
                  ৳{order?.shippingCost?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-800 dark:text-white">Total</span>
                <span className="text-gray-800 dark:text-white">
                  ৳{order?.total?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
              <LuMapPin className="size-4" />
              Shipping Address
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-800 dark:text-white">
                {order?.shippingAddress?.name}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {order?.shippingAddress?.street}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {order?.shippingAddress?.city}, {order?.shippingAddress?.state}{" "}
                {order?.shippingAddress?.zip}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {order?.shippingAddress?.country}
              </p>
              <div className="pt-2 space-y-1">
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <LuPhone className="size-4" />
                  {order?.shippingAddress?.phone}
                </p>
                {order?.shippingAddress?.email && (
                  <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <LuMail className="size-4" />
                    {order?.shippingAddress?.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Update Status */}
          {order?.status !== "cancelled" && order?.status !== "delivered" && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                Update Status
              </h2>
              <div className="space-y-3">
                <Select
                  label="New Status"
                  options={statusOptions}
                  value={statusData.status}
                  onValueChange={(value) =>
                    setStatusData((prev) => ({ ...prev, status: value }))
                  }
                />
                <Textarea
                  label="Notes (Optional)"
                  placeholder="Add any notes..."
                  value={statusData.notes}
                  onValueChange={(value) =>
                    setStatusData((prev) => ({ ...prev, notes: value }))
                  }
                  rows={3}
                />
                <Button
                  onClick={handleStatusUpdate}
                  disabled={updateLoading || !statusData.status}
                  className="w-full"
                >
                  <LuSave className="size-4" />
                  {updateLoading ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </div>
          )}

          {/* Order Type Info */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
              <LuWallet className="size-4" />
              Order Info
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Order Type
                </span>
                <span className="font-medium text-gray-800 dark:text-white capitalize">
                  {orderTypeLabels[order?.orderType] || order?.orderType}
                </span>
              </div>
            </div>
          </div>

          {/* Cost & Profit */}
          {(order?.totalCost > 0 || order?.totalProfit !== undefined) && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                {isProfitable ? (
                  <LuTrendingUp className="size-4 text-green-500" />
                ) : (
                  <LuTrendingDown className="size-4 text-red-500" />
                )}
                Cost & Profit
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Revenue
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    ৳{order?.total?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Cost (FIFO)
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    ৳{(order?.totalCost || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Profit
                  </span>
                  <span
                    className={`font-semibold ${isProfitable ? "text-green-600" : "text-red-600"}`}
                  >
                    {isProfitable ? "+" : ""}৳{profit.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
              <LuUser className="size-4" />
              Customer Info
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-800 dark:text-white">
                {order?.customer?.name || "Guest"}
              </p>
              {order?.customer?.email && (
                <p className="text-gray-600 dark:text-gray-400">
                  {order.customer.email}
                </p>
              )}
              {order?.customer?.phone && (
                <p className="text-gray-600 dark:text-gray-400">
                  {order.customer.phone}
                </p>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
              Timeline
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Placed</p>
                <p className="text-gray-800 dark:text-white">
                  {moment(order?.placedAt || order?.createdAt).format(
                    "DD MMM YYYY, hh:mm A",
                  )}
                </p>
              </div>
              {order?.confirmedAt && (
                <div>
                  <p className="text-gray-500">Confirmed</p>
                  <p className="text-gray-800 dark:text-white">
                    {moment(order.confirmedAt).format("DD MMM YYYY, hh:mm A")}
                  </p>
                </div>
              )}
              {order?.shippedAt && (
                <div>
                  <p className="text-gray-500">Shipped</p>
                  <p className="text-gray-800 dark:text-white">
                    {moment(order.shippedAt).format("DD MMM YYYY, hh:mm A")}
                  </p>
                </div>
              )}
              {order?.deliveredAt && (
                <div>
                  <p className="text-gray-500">Delivered</p>
                  <p className="text-gray-800 dark:text-white">
                    {moment(order.deliveredAt).format("DD MMM YYYY, hh:mm A")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {order?.status !== "cancelled" &&
              order?.status !== "delivered" &&
              order?.status !== "returned" && (
                <Button
                  variant="destructive"
                  onClick={cancelModal.open}
                  className="w-full"
                >
                  <LuX className="size-4" />
                  Cancel Order
                </Button>
              )}

            {order?.return?.status && (
              <Button
                variant="outline"
                onClick={returnModal.open}
                className="w-full"
              >
                <LuRotateCcw className="size-4" />
                Process Return
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        open={cancelModal.isOpen}
        onClose={cancelModal.close}
        title="Cancel Order"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to cancel order{" "}
            <strong>#{order?.orderNumber}</strong>?
          </p>
          <Textarea
            label="Cancellation Reason"
            placeholder="Enter reason for cancellation..."
            value={cancelReason}
            onValueChange={setCancelReason}
            rows={3}
            requiredSign
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={cancelModal.close}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={cancelLoading}
            >
              {cancelLoading ? "Cancelling..." : "Cancel Order"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return Modal */}
      <Modal
        open={returnModal.isOpen}
        onClose={returnModal.close}
        title="Process Return"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Return Reason:
            </p>
            <p className="text-gray-800 dark:text-white">
              {order?.return?.reason || "N/A"}
            </p>
          </div>
          <Select
            label="Return Status"
            options={returnStatusOptions}
            value={returnStatus}
            onValueChange={setReturnStatus}
            requiredSign
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={returnModal.close}>
              Close
            </Button>
            <Button onClick={handleProcessReturn} disabled={returnLoading}>
              {returnLoading ? "Processing..." : "Update Return"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
