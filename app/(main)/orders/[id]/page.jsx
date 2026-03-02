"use client";

import { useState, Fragment } from "react";
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
  LuTruck,
  LuPlus,
  LuCreditCard,
  LuCheck,
  LuClock,
  LuExternalLink,
  LuWarehouse,
} from "react-icons/lu";
import Link from "next/link";

import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
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
import {
  useGetTransactionByOrderQuery,
  useProcessRefundMutation,
  useMarkCODCollectedMutation,
} from "@/features/transactions/transactionsApiSlice";
import {
  useGetShipmentByOrderQuery,
  useCreateShipmentMutation,
  useUpdateTrackingStatusMutation,
} from "@/features/shipments/shipmentsApiSlice";
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

const trackingStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "picked-up", label: "Picked Up" },
  { value: "in-transit", label: "In Transit" },
  { value: "hub", label: "At Hub" },
  { value: "out-for-delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "return-to-sender", label: "Return to Sender" },
  { value: "cancelled", label: "Cancelled" },
];

const refundMethodOptions = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "bank-transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "sslcommerz-reverse", label: "SSLCommerz Reverse" },
];

const txnStatusColors = {
  pending:
    "text-yellow-600 bg-yellow-100/50 dark:text-yellow-300 dark:bg-yellow-900/30",
  paid: "text-green-600 bg-green-100/50 dark:text-green-300 dark:bg-green-900/30",
  failed: "text-red-600 bg-red-100/50 dark:text-red-300 dark:bg-red-900/30",
  cancelled:
    "text-gray-600 bg-gray-100/50 dark:text-gray-300 dark:bg-gray-800/50",
  refunded:
    "text-orange-600 bg-orange-100/50 dark:text-orange-300 dark:bg-orange-900/30",
};

const deliveryStatusColors = {
  pending:
    "text-yellow-600 bg-yellow-100/50 dark:text-yellow-300 dark:bg-yellow-900/30",
  "picked-up":
    "text-blue-600 bg-blue-100/50 dark:text-blue-300 dark:bg-blue-900/30",
  "in-transit":
    "text-indigo-600 bg-indigo-100/50 dark:text-indigo-300 dark:bg-indigo-900/30",
  hub: "text-purple-600 bg-purple-100/50 dark:text-purple-300 dark:bg-purple-900/30",
  "out-for-delivery":
    "text-cyan-600 bg-cyan-100/50 dark:text-cyan-300 dark:bg-cyan-900/30",
  delivered:
    "text-green-600 bg-green-100/50 dark:text-green-300 dark:bg-green-900/30",
  "return-to-sender":
    "text-orange-600 bg-orange-100/50 dark:text-orange-300 dark:bg-orange-900/30",
  cancelled: "text-red-600 bg-red-100/50 dark:text-red-300 dark:bg-red-900/30",
};

// === Order Flow Logic ===
const COD_FLOW = ["pending", "confirmed", "shipped", "delivered"];
const PICKUP_FLOW = ["pending", "confirmed", "delivered"];
const ONLINE_PAYMENT_FLOW = [
  "pending_payment",
  "confirmed",
  "shipped",
  "delivered",
];

/**
 * For pickup: pending → confirmed → delivered (manual)
 * For COD pending orders: only allow confirm (shipment tracking handles shipped/delivered)
 * For online-payment pending_payment: no manual options (webhook handles → confirmed)
 * For COD/online-payment confirmed+: shipment tracking handles shipped → delivered
 *   — manual shipped/delivered kept as admin fallback when no shipment exists
 */
const getAllowedNextStatuses = (status, orderType, hasShipment) => {
  if (orderType === "pickup") {
    const pickupMap = {
      pending: ["confirmed"],
      confirmed: ["delivered"],
    };
    return pickupMap[status] || [];
  }
  // Online-payment: pending_payment handled by webhook — no manual advance
  if (status === "pending_payment") return [];
  // COD / online-payment (non-pickup)
  // After confirmed, if shipment exists → tracking handles shipped/delivered, no manual options
  if (hasShipment && ["confirmed", "shipped"].includes(status)) return [];
  const map = {
    pending: ["confirmed"],
    confirmed: ["shipped"],
    shipped: ["delivered"],
  };
  return map[status] || [];
};

const getAllowedNextTrackingStatuses = (status, usedStatuses = []) => {
  // Sequential flow: pending → picked-up → in-transit → hub → out-for-delivery → delivered
  // Only show the immediate next status + cancelled (no jumping ahead)
  const sequential = {
    pending: ["picked-up"],
    "picked-up": ["in-transit"],
    "in-transit": ["hub", "out-for-delivery"],
    hub: ["out-for-delivery"],
    "out-for-delivery": ["delivered"],
  };
  const next = sequential[status] || [];
  // Filter out already-used statuses, then add "cancelled" if not terminal
  const filtered = next.filter((s) => !usedStatuses.includes(s));
  // Add cancelled option if current status isn't terminal
  if (
    !["delivered", "cancelled", "return-to-sender"].includes(status) &&
    !usedStatuses.includes("cancelled")
  ) {
    filtered.push("cancelled");
  }
  // For out-for-delivery, also allow return-to-sender
  if (
    status === "out-for-delivery" &&
    !usedStatuses.includes("return-to-sender")
  ) {
    filtered.push("return-to-sender");
  }
  return filtered;
};

const trackingEventIcons = {
  pending: { icon: LuClock, color: "bg-yellow-500" },
  "picked-up": { icon: LuPackage, color: "bg-blue-500" },
  "in-transit": { icon: LuTruck, color: "bg-indigo-500" },
  hub: { icon: LuWarehouse, color: "bg-purple-500" },
  "out-for-delivery": { icon: LuTruck, color: "bg-cyan-500" },
  delivered: { icon: LuCheck, color: "bg-green-500" },
  "return-to-sender": { icon: LuMapPin, color: "bg-orange-500" },
  cancelled: { icon: LuX, color: "bg-red-500" },
};

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id;

  const [updateStatus, { isLoading: updateLoading }] =
    useUpdateOrderStatusMutation();
  const [cancelOrder, { isLoading: cancelLoading }] = useCancelOrderMutation();
  const [processReturn, { isLoading: returnLoading }] =
    useProcessReturnMutation();
  const [processRefund, { isLoading: refundLoading }] =
    useProcessRefundMutation();
  const [markCODCollected, { isLoading: codLoading }] =
    useMarkCODCollectedMutation();
  const [createShipment, { isLoading: createShipmentLoading }] =
    useCreateShipmentMutation();
  const [updateTracking, { isLoading: trackingLoading }] =
    useUpdateTrackingStatusMutation();

  const cancelModal = useModal();
  const returnModal = useModal();
  const refundModal = useModal();
  const createShipmentModal = useModal();
  const updateTrackingModal = useModal();

  const [statusData, setStatusData] = useState({ status: "", notes: "" });
  const [cancelReason, setCancelReason] = useState("");
  const [returnStatus, setReturnStatus] = useState("");
  const [refundData, setRefundData] = useState({
    reason: "",
    refundAmount: "",
    refundMethod: "",
    refundNote: "",
  });
  const [shipmentForm, setShipmentForm] = useState({
    trackingNumber: "",
    estimatedDelivery: "",
    note: "",
  });
  const [trackingData, setTrackingData] = useState({ status: "", note: "" });

  const { data, isLoading, isError } = useGetSingleOrderQuery(orderId);
  const order = data?.data;

  const { data: txnData } = useGetTransactionByOrderQuery(orderId, {
    skip: !orderId,
  });
  const txn = txnData?.data;

  const { data: shipData, isLoading: shipLoading } = useGetShipmentByOrderQuery(
    orderId,
    { skip: !orderId },
  );
  const shipment = shipData?.data;

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

  const handleRefund = async () => {
    if (!refundData.reason.trim()) {
      toast.error("Please provide a refund reason");
      return;
    }
    const result = await processRefund({
      id: txn?._id,
      reason: refundData.reason,
      refundAmount: refundData.refundAmount
        ? parseFloat(refundData.refundAmount)
        : undefined,
      refundMethod: refundData.refundMethod || undefined,
      refundNote: refundData.refundNote || undefined,
    });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "refund",
      message: "Refund processed!",
    });
    if (result?.data) {
      refundModal.close();
      setRefundData({
        reason: "",
        refundAmount: "",
        refundMethod: "",
        refundNote: "",
      });
    }
  };

  const handleMarkCOD = async () => {
    const result = await markCODCollected(txn?._id);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "cod-collected",
      message: "COD marked as collected!",
    });
  };

  const handleCreateShipment = async () => {
    const body = { orderId };
    if (shipmentForm.trackingNumber)
      body.trackingNumber = shipmentForm.trackingNumber;
    if (shipmentForm.estimatedDelivery)
      body.estimatedDelivery = new Date(
        shipmentForm.estimatedDelivery,
      ).toISOString();
    if (shipmentForm.note) body.note = shipmentForm.note;
    const result = await createShipment(body);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "create-shipment",
      message: "Shipment created!",
    });
    if (result?.data) {
      createShipmentModal.close();
      setShipmentForm({ trackingNumber: "", estimatedDelivery: "", note: "" });
    }
  };

  const handleUpdateTracking = async () => {
    if (!trackingData.status) {
      toast.error("Please select a tracking status");
      return;
    }
    const result = await updateTracking({
      id: shipment?._id,
      status: trackingData.status,
      note: trackingData.note || undefined,
    });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-tracking",
      message: "Tracking updated!",
    });
    if (result?.data) {
      updateTrackingModal.close();
      setTrackingData({ status: "", note: "" });
    }
  };

  // === Flow-aware computed values ===
  const isPickup = order?.orderType === "pickup";
  const isOnlinePayment = order?.orderType === "online-payment";
  const ORDER_FLOW = isPickup
    ? PICKUP_FLOW
    : isOnlinePayment
      ? ONLINE_PAYMENT_FLOW
      : COD_FLOW;

  const allowedNextStatuses = getAllowedNextStatuses(
    order?.status,
    order?.orderType,
    !!shipment,
  );
  const filteredStatusOptions = statusOptions.filter((o) =>
    allowedNextStatuses.includes(o.value),
  );

  const allowedNextTracking = getAllowedNextTrackingStatuses(
    shipment?.deliveryStatus,
    shipment?.events?.map((e) => e.status) ?? [],
  );
  const filteredTrackingOptions = trackingStatusOptions.filter((o) =>
    allowedNextTracking.includes(o.value),
  );

  const canCreateShipment =
    !shipLoading &&
    !shipment &&
    !isPickup &&
    ["pending", "confirmed"].includes(order?.status);
  const canUpdateTracking = shipment && allowedNextTracking.length > 0;
  // Pickup payments auto-mark paid when admin marks delivered — no manual COD step
  // Online-payment: already paid via SSLCommerz — no COD step
  const canMarkCOD =
    txn?.method === "cash-on-delivery" &&
    !isPickup &&
    !isOnlinePayment &&
    txn?.status === "pending" &&
    ["shipped", "delivered"].includes(order?.status);
  const isTerminal = ["cancelled", "returned"].includes(order?.status);

  // Next action hint for admin
  const getNextActionHint = () => {
    if (!order) return null;
    if (isTerminal) return null;
    if (order.status === "pending_payment")
      return "Waiting for customer to complete online payment.";
    // Pickup-specific hints
    if (isPickup) {
      if (order.status === "pending")
        return "Confirm this pickup order so the customer can collect it.";
      if (order.status === "confirmed")
        return "Mark as Delivered once the customer has picked up their order.";
      return null;
    }
    // Online-payment hints
    if (isOnlinePayment) {
      if (order.status === "confirmed" && !shipment)
        return "Payment received. Create a shipment to begin fulfillment.";
      if (order.status === "confirmed" && shipment)
        return "Shipment created. Update tracking to 'In Transit' to mark as shipped.";
      if (order.status === "shipped")
        return "Update tracking to 'Delivered' to complete delivery.";
      if (order.status === "delivered")
        return "Order complete — payment already collected via online payment.";
      return null;
    }
    // COD hints
    if (order.status === "pending" && !shipment)
      return "Confirm this order, or create a shipment (auto-confirms).";
    if (order.status === "pending" && shipment)
      return "Shipment exists. Confirm the order to proceed.";
    if (order.status === "confirmed" && !shipment)
      return "Create a shipment to begin fulfillment.";
    if (order.status === "confirmed" && shipment)
      return "Update tracking to 'In Transit' to mark as shipped.";
    if (order.status === "shipped")
      return (
        "Update tracking to 'Delivered' to complete delivery." +
        (canMarkCOD ? " Collect COD when ready." : "")
      );
    if (order.status === "delivered" && canMarkCOD)
      return "Order delivered — mark COD as collected.";
    return null;
  };
  const nextActionHint = getNextActionHint();

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

      {/* Order Progress Stepper */}
      {!isTerminal && (
        <div className="flex items-center">
          {ORDER_FLOW.map((step, i) => {
            const currentIdx = ORDER_FLOW.indexOf(order?.status);
            const isCompleted = i < currentIdx;
            const isCurrent = i === currentIdx;
            const stepLabel =
              step === "pending_payment" ? "Pending Payment" : step;
            return (
              <Fragment key={step}>
                {i > 0 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      i <= currentIdx
                        ? "bg-primary"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    isCurrent
                      ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                      : isCompleted
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                  }`}
                >
                  {isCompleted && <LuCheck className="size-3" />}
                  <span className="capitalize">{stepLabel}</span>
                </div>
              </Fragment>
            );
          })}
        </div>
      )}

      {/* Next Action Hint */}
      {nextActionHint && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300">
          <LuClock className="size-4 shrink-0" />
          <span>{nextActionHint}</span>
        </div>
      )}

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
              {order?.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="text-gray-800 dark:text-white">
                    ৳{order?.tax?.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-800 dark:text-white">Total</span>
                <span className="text-gray-800 dark:text-white">
                  ৳
                  {(
                    (order?.subtotal || 0) -
                    (order?.discount || 0) +
                    (order?.shippingCost || 0) +
                    (order?.tax || 0)
                  ).toFixed(2)}
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

          {/* Shipment Section */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                <LuTruck className="size-4" /> Shipment
              </h2>
              {shipment && (
                <Link
                  href={`/shipments/${shipment._id}`}
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  <LuExternalLink className="size-3.5" /> View Details
                </Link>
              )}
            </div>
            {shipLoading ? (
              <div className="animate-pulse h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ) : shipment ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Tracking #</p>
                    <p className="font-mono font-medium text-gray-800 dark:text-white">
                      {shipment.trackingNumber || "---"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Courier</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {shipment.courier || "Manual"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span
                      className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${deliveryStatusColors[shipment.deliveryStatus] || deliveryStatusColors.pending}`}
                    >
                      {shipment.deliveryStatus?.replace("-", " ")}
                    </span>
                  </div>
                  {shipment.estimatedDelivery && (
                    <div>
                      <p className="text-gray-500">Est. Delivery</p>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {moment(shipment.estimatedDelivery).format(
                          "DD MMM YYYY",
                        )}
                      </p>
                    </div>
                  )}
                </div>
                {shipment.events?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Tracking Events
                    </p>
                    <div className="space-y-3">
                      {shipment.events.map((event, i) => {
                        const info =
                          trackingEventIcons[event.status] ||
                          trackingEventIcons.pending;
                        const EventIcon = info.icon;
                        return (
                          <div
                            key={i}
                            className="flex items-start gap-3 relative"
                          >
                            {i < shipment.events.length - 1 && (
                              <div className="absolute left-[11px] top-6 w-0.5 h-[calc(100%+4px)] bg-gray-200 dark:bg-gray-700" />
                            )}
                            <div
                              className={`w-[22px] h-[22px] rounded-full ${info.color} flex items-center justify-center shrink-0 z-10`}
                            >
                              <EventIcon className="size-3 text-white" />
                            </div>
                            <div className="flex-1 pb-0.5">
                              <p className="text-sm font-medium text-gray-800 dark:text-white capitalize">
                                {(event.status || "").replace(/-/g, " ")}
                              </p>
                              {event.note && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {event.note}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-0.5">
                                {moment(event.time).format(
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
                {canUpdateTracking && (
                  <Button
                    variant="outline"
                    onClick={updateTrackingModal.open}
                    className="w-full"
                  >
                    <LuTruck className="size-4" /> Update Tracking
                  </Button>
                )}
              </div>
            ) : isPickup ? (
              <div className="text-center py-4">
                <LuPackage className="size-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Pickup order — no shipment needed
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Customer will collect from store
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <LuTruck className="size-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-3">
                  No shipment created yet
                </p>
                {canCreateShipment ? (
                  <Button onClick={createShipmentModal.open}>
                    <LuPlus className="size-4" /> Create Shipment
                  </Button>
                ) : !isTerminal && order?.status !== "pending_payment" ? (
                  <p className="text-xs text-gray-400">
                    Order must be pending or confirmed to create a shipment
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {/* Return Info */}
          {order?.return?.status && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                <LuRotateCcw className="size-4" /> Return Info
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      order.return.status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : order.return.status === "rejected"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}
                  >
                    {order.return.status}
                  </span>
                </div>
                {order.return.reason && (
                  <div>
                    <p className="text-gray-500">Reason</p>
                    <p className="text-gray-800 dark:text-white">
                      {order.return.reason}
                    </p>
                  </div>
                )}
                {order.return.requestedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Requested</span>
                    <span className="text-gray-800 dark:text-white">
                      {moment(order.return.requestedAt).format(
                        "DD MMM, hh:mm A",
                      )}
                    </span>
                  </div>
                )}
                {order.return.refundAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Refund Amount</span>
                    <span className="font-semibold text-orange-600">
                      ৳{order.return.refundAmount?.toFixed(2)}
                    </span>
                  </div>
                )}
                {order.return.refundMethod && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Via</span>
                    <span className="text-gray-800 dark:text-white capitalize">
                      {order.return.refundMethod}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Transaction / Payment Panel */}
          {txn && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                  <LuCreditCard className="size-4" /> Payment
                </h2>
                <Link
                  href={`/transactions/${txn._id}`}
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  <LuExternalLink className="size-3.5" /> View
                </Link>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium text-gray-800 dark:text-white capitalize">
                    {txn.method === "cash-on-delivery"
                      ? "Cash on Delivery"
                      : txn.method === "sslcommerz"
                        ? "SSLCommerz"
                        : txn.method}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${txnStatusColors[txn.status] || txnStatusColors.pending}`}
                  >
                    {txn.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    ৳{(txn.amount || 0).toLocaleString("en-BD")}
                  </span>
                </div>
                {txn.transactionId && (
                  <div>
                    <p className="text-gray-500">Transaction ID</p>
                    <p className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all">
                      {txn.transactionId}
                    </p>
                  </div>
                )}
                {txn.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paid At</span>
                    <span className="text-gray-800 dark:text-white">
                      {moment(txn.paidAt).format("DD MMM, hh:mm A")}
                    </span>
                  </div>
                )}
                {txn.failureReason && (
                  <div>
                    <p className="text-gray-500">Failure Reason</p>
                    <p className="text-red-500 text-xs">{txn.failureReason}</p>
                  </div>
                )}
                {txn.status === "refunded" && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                      Refund Details
                    </p>
                    {txn.refundedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Refunded</span>
                        <span className="text-gray-800 dark:text-white">
                          {moment(txn.refundedAt).format("DD MMM, hh:mm A")}
                        </span>
                      </div>
                    )}
                    {txn.refundAmount && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount</span>
                        <span className="font-semibold text-orange-600">
                          ৳{txn.refundAmount?.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {txn.refundMethod && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Via</span>
                        <span className="text-gray-800 dark:text-white capitalize">
                          {txn.refundMethod}
                        </span>
                      </div>
                    )}
                    {txn.refundReason && (
                      <div>
                        <p className="text-gray-500">Reason</p>
                        <p className="text-gray-800 dark:text-white text-xs">
                          {txn.refundReason}
                        </p>
                      </div>
                    )}
                    {txn.refundNote && (
                      <div>
                        <p className="text-gray-500">Note</p>
                        <p className="text-gray-800 dark:text-white text-xs">
                          {txn.refundNote}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2">
                {canMarkCOD && (
                  <Button
                    onClick={handleMarkCOD}
                    disabled={codLoading}
                    className="w-full"
                  >
                    <LuCheck className="size-4" />
                    {codLoading ? "Marking..." : "Mark COD Collected"}
                  </Button>
                )}
                {txn.method === "cash-on-delivery" &&
                  txn.status === "pending" &&
                  !canMarkCOD &&
                  !isPickup && (
                    <p className="text-xs text-gray-400 text-center py-1">
                      COD collection available after shipment
                    </p>
                  )}
                {isPickup && txn.status === "pending" && (
                  <p className="text-xs text-gray-400 text-center py-1">
                    Payment auto-marks paid when order is delivered
                  </p>
                )}
                {isOnlinePayment && txn.status === "paid" && (
                  <p className="text-xs text-green-500 text-center py-1">
                    Paid via online payment
                  </p>
                )}
                {txn.status === "paid" && (
                  <Button
                    variant="outline"
                    onClick={refundModal.open}
                    className="w-full"
                  >
                    <LuRotateCcw className="size-4" /> Process Refund
                  </Button>
                )}
              </div>
            </div>
          )}
          {/* Update Status */}
          {filteredStatusOptions.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                Update Status
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                Current:{" "}
                <span className="font-medium capitalize">{order?.status}</span>{" "}
                → Next:{" "}
                <span className="font-medium capitalize">
                  {allowedNextStatuses.join(", ")}
                </span>
              </p>
              <div className="space-y-3">
                <Select
                  label="New Status"
                  options={filteredStatusOptions}
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
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Order #
                </span>
                <span className="font-mono font-medium text-gray-800 dark:text-white">
                  {order?.orderNumber}
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
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
              <LuClock className="size-4" />
              Timeline
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-gray-500">Placed</p>
                  <p className="text-gray-800 dark:text-white">
                    {moment(order?.placedAt || order?.createdAt).format(
                      "DD MMM YYYY, hh:mm A",
                    )}
                  </p>
                </div>
              </div>
              {order?.confirmedAt && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-gray-500">Confirmed</p>
                    <p className="text-gray-800 dark:text-white">
                      {moment(order.confirmedAt).format("DD MMM YYYY, hh:mm A")}
                    </p>
                  </div>
                </div>
              )}
              {order?.shippedAt && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-gray-500">Shipped</p>
                    <p className="text-gray-800 dark:text-white">
                      {moment(order.shippedAt).format("DD MMM YYYY, hh:mm A")}
                    </p>
                  </div>
                </div>
              )}
              {order?.deliveredAt && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-gray-500">Delivered</p>
                    <p className="text-gray-800 dark:text-white">
                      {moment(order.deliveredAt).format("DD MMM YYYY, hh:mm A")}
                    </p>
                  </div>
                </div>
              )}
              {order?.cancelledAt && (
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-gray-500">Cancelled</p>
                    <p className="text-gray-800 dark:text-white">
                      {moment(order.cancelledAt).format("DD MMM YYYY, hh:mm A")}
                    </p>
                    {order.cancellationReason && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.cancellationReason}
                      </p>
                    )}
                  </div>
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

      {/* Refund Modal */}
      <Modal
        open={refundModal.isOpen}
        onClose={refundModal.close}
        title="Process Refund"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Transaction:{" "}
              <span className="font-mono text-xs">
                {txn?.transactionId || txn?._id}
              </span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Amount:{" "}
              <span className="font-semibold">৳{txn?.amount?.toFixed(2)}</span>
            </p>
          </div>
          <Textarea
            label="Refund Reason"
            placeholder="Enter reason for refund..."
            value={refundData.reason}
            onValueChange={(v) => setRefundData((p) => ({ ...p, reason: v }))}
            rows={3}
            requiredSign
          />
          <Input
            label="Refund Amount (Optional)"
            type="number"
            placeholder="Leave empty for full refund"
            value={refundData.refundAmount}
            onValueChange={(v) =>
              setRefundData((p) => ({ ...p, refundAmount: v }))
            }
          />
          <Select
            label="Refund Method"
            options={refundMethodOptions}
            value={refundData.refundMethod}
            onValueChange={(v) =>
              setRefundData((p) => ({ ...p, refundMethod: v }))
            }
            placeholder="Select method"
          />
          <Input
            label="Note (Optional)"
            placeholder="e.g. Sent to 01XXXXXXXXX"
            value={refundData.refundNote}
            onValueChange={(v) =>
              setRefundData((p) => ({ ...p, refundNote: v }))
            }
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={refundModal.close}>
              Close
            </Button>
            <Button onClick={handleRefund} disabled={refundLoading}>
              {refundLoading ? "Processing..." : "Process Refund"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Shipment Modal */}
      <Modal
        open={createShipmentModal.isOpen}
        onClose={createShipmentModal.close}
        title="Create Shipment"
      >
        <div className="space-y-4">
          <Input
            label="Tracking Number (Optional)"
            placeholder="e.g. SUN-123456"
            value={shipmentForm.trackingNumber}
            onValueChange={(v) =>
              setShipmentForm((p) => ({ ...p, trackingNumber: v }))
            }
          />
          <Input
            label="Estimated Delivery (Optional)"
            type="date"
            value={shipmentForm.estimatedDelivery}
            onValueChange={(v) =>
              setShipmentForm((p) => ({ ...p, estimatedDelivery: v }))
            }
          />
          <Textarea
            label="Note (Optional)"
            placeholder="Any instructions for courier..."
            value={shipmentForm.note}
            onValueChange={(v) => setShipmentForm((p) => ({ ...p, note: v }))}
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={createShipmentModal.close}>
              Close
            </Button>
            <Button
              onClick={handleCreateShipment}
              disabled={createShipmentLoading}
            >
              <LuPlus className="size-4" />
              {createShipmentLoading ? "Creating..." : "Create Shipment"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Update Tracking Modal */}
      <Modal
        open={updateTrackingModal.isOpen}
        onClose={updateTrackingModal.close}
        title="Update Tracking Status"
      >
        <div className="space-y-4">
          <Select
            label="New Status"
            options={filteredTrackingOptions}
            value={trackingData.status}
            onValueChange={(v) => setTrackingData((p) => ({ ...p, status: v }))}
            requiredSign
          />
          {shipment && (
            <p className="text-xs text-gray-500 -mt-2">
              Current:{" "}
              <span className="font-medium capitalize">
                {shipment.deliveryStatus?.replace("-", " ")}
              </span>
            </p>
          )}
          <Textarea
            label="Note (Optional)"
            placeholder="Add a note about this update..."
            value={trackingData.note}
            onValueChange={(v) => setTrackingData((p) => ({ ...p, note: v }))}
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={updateTrackingModal.close}>
              Close
            </Button>
            <Button onClick={handleUpdateTracking} disabled={trackingLoading}>
              <LuTruck className="size-4" />
              {trackingLoading ? "Updating..." : "Update Tracking"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
