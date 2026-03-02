"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  LuArrowLeft,
  LuCheck,
  LuPackage,
  LuTruck,
  LuWarehouse,
  LuCalendar,
  LuClock,
  LuX,
  LuDollarSign,
} from "react-icons/lu";

import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
import { Modal } from "@/components/ui/modal/Modal";
import { PageSkeleton } from "@/components/skeleton/PageSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import {
  useGetSinglePurchaseOrderQuery,
  useConfirmPurchaseOrderMutation,
  useReceivePurchaseOrderItemsMutation,
  useRecordPurchaseOrderPaymentMutation,
} from "@/features/inventory/purchaseOrdersApiSlice";
import { handleToast } from "@/utils/handleToast";
import { useModal } from "@/lib/useModal";

const getStatusBadge = (status) => {
  const styles = {
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    confirmed:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    received:
      "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  };
  const icons = {
    draft: <LuClock className="size-4" />,
    confirmed: <LuCheck className="size-4" />,
    received: <LuPackage className="size-4" />,
    cancelled: <LuX className="size-4" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium capitalize ${styles[status] || styles.draft}`}
    >
      {icons[status]} {status}
    </span>
  );
};

const formatCurrency = (amount) => `৳${(amount || 0).toLocaleString()}`;
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "---";

export default function ViewPurchaseOrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading, isError, refetch } =
    useGetSinglePurchaseOrderQuery(id);
  const [confirmPO, { isLoading: confirmLoading }] =
    useConfirmPurchaseOrderMutation();
  const [receiveItems, { isLoading: receiveLoading }] =
    useReceivePurchaseOrderItemsMutation();
  const [recordPayment, { isLoading: paymentLoading }] =
    useRecordPurchaseOrderPaymentMutation();

  const [paymentAmount, setPaymentAmount] = useState("");
  const paymentModal = useModal();

  const po = data?.data;

  const handleConfirm = async () => {
    const loadingToast = toast.loading("Approving order...");
    const result = await confirmPO(id);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "confirm-po",
      message: "Purchase order approved!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) refetch();
  };

  const handleReceive = async () => {
    const loadingToast = toast.loading("Receiving items...");
    const result = await receiveItems(id);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "receive-po",
      message: "Items received! Stock updated.",
    });
    toast.dismiss(loadingToast);
    if (result?.data) refetch();
  };

  const handleRecordPayment = async () => {
    const amount = parseFloat(paymentAmount);
    const remaining = po.total - (po.paidAmount || 0);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (amount > remaining) {
      toast.error(
        `Payment amount cannot exceed remaining balance of ${formatCurrency(remaining)}`,
      );
      return;
    }

    const loadingToast = toast.loading("Recording payment...");
    const result = await recordPayment({ id, data: { amount } });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "record-payment",
      message: "Payment recorded successfully!",
    });
    toast.dismiss(loadingToast);

    if (result?.data) {
      paymentModal.close();
      setPaymentAmount("");
      refetch();
    }
  };

  const openPaymentModal = () => {
    const remaining = po.total - (po.paidAmount || 0);
    setPaymentAmount(remaining.toString());
    paymentModal.open();
  };

  const canConfirm = po?.status === "draft";
  const canReceive = po?.status === "confirmed";

  if (isLoading) return <PageSkeleton />;
  if (isError || !po) return <ErrorBoundaryFetcher />;

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/inventory/purchase-orders"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <LuArrowLeft className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {po.poNumber}
              </h1>
              {getStatusBadge(po.status)}
            </div>
            <p className="text-sm text-gray-500">
              Created on {formatDate(po.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canConfirm && (
            <Button onClick={handleConfirm} disabled={confirmLoading}>
              <LuCheck className="size-4" />{" "}
              {confirmLoading ? "Confirming..." : "Confirm Order"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <LuTruck className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Supplier</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {po.supplier?.name || "---"}
                </p>
                {po.supplier?.email && (
                  <p className="text-xs text-gray-500">{po.supplier.email}</p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                <LuWarehouse className="size-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Warehouse</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {po.warehouse?.name || "---"}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <LuCalendar className="size-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">
                  Expected Delivery
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {formatDate(po.expectedDelivery)}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
              <LuPackage className="size-4" /> Order Items
            </h2>

            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Ordered</div>
              <div className="col-span-2 text-center">Received</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {po.items?.map((item) => {
                const itemTotal = item.unitCost * item.orderedQuantity;
                const isFullyReceived =
                  item.receivedQuantity >= item.orderedQuantity;

                return (
                  <div
                    key={item._id}
                    className={`grid grid-cols-12 gap-2 items-center p-3 rounded-lg border ${isFullyReceived ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}
                  >
                    <div className="col-span-12 md:col-span-5">
                      <p className="font-medium text-gray-800 dark:text-white">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {item.sku && <span>SKU: {item.sku}</span>}
                        <span>
                          Unit Cost: ৳{item.unitCost?.toLocaleString()}
                        </span>
                        {item.discount > 0 && (
                          <span>Disc: -৳{item.discount}</span>
                        )}
                        {item.tax > 0 && <span>Tax: +৳{item.tax}</span>}
                      </div>
                    </div>
                    <div className="col-span-4 md:col-span-2 text-center">
                      <span className="text-gray-800 dark:text-white font-medium">
                        {item.orderedQuantity}
                      </span>
                    </div>
                    <div className="col-span-4 md:col-span-2 text-center">
                      <span
                        className={`font-medium ${isFullyReceived ? "text-green-600" : "text-amber-600"}`}
                      >
                        {item.receivedQuantity}
                        {isFullyReceived && (
                          <LuCheck className="inline-block size-3.5 ml-1" />
                        )}
                      </span>
                    </div>
                    <div className="col-span-4 md:col-span-3 text-right">
                      <span className="font-medium text-gray-800 dark:text-white">
                        {formatCurrency(itemTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Receive Button */}
            {canReceive && (
              <div className="pt-4 flex justify-end">
                <Button onClick={handleReceive} disabled={receiveLoading}>
                  <LuPackage className="size-4" />{" "}
                  {receiveLoading
                    ? "Receiving..."
                    : "Receive All Items & Update Stock"}
                </Button>
              </div>
            )}
          </div>

          {/* Notes */}
          {po.notes && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                Notes
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{po.notes}</p>
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4 sticky top-4">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Order Summary
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-800 dark:text-white">
                  {formatCurrency(po.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-800 dark:text-white">
                  +{formatCurrency(po.shippingCost)}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800 dark:text-white">
                    Total
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(po.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
              <h3 className="text-xs font-medium text-gray-500 uppercase flex items-center gap-2">
                <LuDollarSign className="size-4" /> Payment
              </h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Paid Amount</span>
                <span className="text-gray-800 dark:text-white font-medium">
                  {formatCurrency(po.paidAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Remaining</span>
                <span className="text-gray-800 dark:text-white font-medium">
                  {formatCurrency(po.total - (po.paidAmount || 0))}
                </span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-500">Status</span>
                <span
                  className={`capitalize font-medium ${po.paymentStatus === "paid" ? "text-green-600" : po.paymentStatus === "partial" ? "text-amber-600" : "text-gray-500"}`}
                >
                  {po.paymentStatus || "Pending"}
                </span>
              </div>
              {po.paymentStatus !== "paid" && (
                <Button
                  onClick={openPaymentModal}
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                >
                  <LuDollarSign className="size-4" /> Record Payment
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Recording Modal */}
      <Modal
        open={paymentModal.isOpen}
        onClose={paymentModal.close}
        title="Record Payment"
        size="small"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">
                Total Amount:
              </span>
              <span className="font-medium text-gray-800 dark:text-white">
                {formatCurrency(po?.total || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">
                Already Paid:
              </span>
              <span className="font-medium text-green-600">
                {formatCurrency(po?.paidAmount || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-blue-200 dark:border-blue-800">
              <span className="text-gray-600 dark:text-gray-400">
                Remaining Balance:
              </span>
              <span className="font-bold text-amber-600">
                {formatCurrency((po?.total || 0) - (po?.paidAmount || 0))}
              </span>
            </div>
          </div>

          <Input
            label="Payment Amount"
            type="number"
            placeholder="Enter amount"
            min="0"
            step="0.01"
            value={paymentAmount}
            onValueChange={setPaymentAmount}
            requiredSign={true}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={paymentModal.close}
              disabled={paymentLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleRecordPayment} loading={paymentLoading}>
              <LuDollarSign className="size-4" />
              {paymentLoading ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
