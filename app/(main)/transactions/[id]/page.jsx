"use client";

import { useParams } from "next/navigation";
import moment from "moment";
import { toast } from "react-hot-toast";
import { useState } from "react";
import Link from "next/link";
import {
  LuArrowLeft,
  LuCreditCard,
  LuDollarSign,
  LuPackage,
  LuRotateCcw,
  LuCalendar,
  LuHash,
  LuCheck,
  LuX,
  LuWallet,
} from "react-icons/lu";

import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
import { Select } from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { useModal } from "@/lib/useModal";
import { Modal } from "@/components/ui/modal/Modal";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import {
  useGetSingleTransactionQuery,
  useProcessRefundMutation,
  useMarkCODCollectedMutation,
} from "@/features/transactions/transactionsApiSlice";
import { handleToast } from "@/utils/handleToast";

const refundMethodOptions = [
  { value: "", label: "Select Method" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "bank-transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "sslcommerz-reverse", label: "SSLCommerz Reverse" },
];

const statusColors = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
  refunded:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
};

export default function TransactionDetailsPage() {
  const params = useParams();
  const txnId = params.id;

  const [processRefund, { isLoading: refundLoading }] =
    useProcessRefundMutation();
  const [markCODCollected, { isLoading: codLoading }] =
    useMarkCODCollectedMutation();
  const refundModal = useModal();
  const [refundData, setRefundData] = useState({
    reason: "",
    amount: "",
    refundMethod: "",
    refundNote: "",
  });

  const { data, isLoading, isError } = useGetSingleTransactionQuery(txnId);
  const txn = data?.data;

  const handleRefund = async () => {
    if (!refundData.reason.trim()) {
      toast.error("Please provide a refund reason");
      return;
    }
    const result = await processRefund({
      id: txnId,
      reason: refundData.reason,
      refundAmount: refundData.amount
        ? parseFloat(refundData.amount)
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
        amount: "",
        refundMethod: "",
        refundNote: "",
      });
    }
  };

  const handleMarkCOD = async () => {
    const result = await markCODCollected(txnId);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "cod-collected",
      message: "COD marked as collected!",
    });
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
          href="/transactions"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LuArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Transaction Details
          </h1>
          <p className="text-sm text-gray-500 font-mono">
            {txn?.transactionId || txn?._id}
          </p>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${statusColors[txn?.status] || statusColors.pending}`}
        >
          {txn?.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transaction Info */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
              <LuCreditCard className="size-4" />
              Transaction Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-gray-500 flex items-center gap-1.5">
                  <LuHash className="size-3.5" /> Transaction ID
                </p>
                <p className="font-mono font-medium text-gray-800 dark:text-white">
                  {txn?.transactionId || "---"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 flex items-center gap-1.5">
                  <LuDollarSign className="size-3.5" /> Amount
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  ৳{(txn?.amount || 0).toLocaleString("en-BD")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 flex items-center gap-1.5">
                  <LuWallet className="size-3.5" /> Method
                </p>
                <p className="font-medium text-gray-800 dark:text-white capitalize">
                  {txn?.method === "cash-on-delivery"
                    ? "Cash on Delivery"
                    : txn?.method}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500 flex items-center gap-1.5">
                  <LuCalendar className="size-3.5" /> Created
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {moment(txn?.createdAt).format("DD MMM YYYY, hh:mm A")}
                </p>
              </div>
            </div>
          </div>

          {/* Linked Order */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
              <LuPackage className="size-4" />
              Linked Order
            </h2>
            {txn?.order ? (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div>
                  <Link
                    href={`/orders/${txn.order._id}`}
                    className="font-mono font-semibold text-primary hover:underline"
                  >
                    #{txn.order.orderNumber}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    Status: {txn.order.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800 dark:text-white">
                    ৳{(txn.order.total || 0).toLocaleString("en-BD")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {txn.order.items?.length || 0} item(s)
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No linked order</p>
            )}
          </div>

          {/* Gateway Response (if SSLCommerz) */}
          {txn?.method === "sslcommerz" && txn?.gatewayResponse && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                SSLCommerz Response
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {txn.gatewayResponse.bank_tran_id && (
                  <div>
                    <p className="text-gray-500">Bank Txn ID</p>
                    <p className="font-mono text-gray-800 dark:text-white">
                      {txn.gatewayResponse.bank_tran_id}
                    </p>
                  </div>
                )}
                {txn.gatewayResponse.card_type && (
                  <div>
                    <p className="text-gray-500">Card Type</p>
                    <p className="text-gray-800 dark:text-white">
                      {txn.gatewayResponse.card_type}
                    </p>
                  </div>
                )}
                {txn.gatewayResponse.card_issuer && (
                  <div>
                    <p className="text-gray-500">Card Issuer</p>
                    <p className="text-gray-800 dark:text-white">
                      {txn.gatewayResponse.card_issuer}
                    </p>
                  </div>
                )}
                {txn.gatewayResponse.tran_date && (
                  <div>
                    <p className="text-gray-500">SSL Transaction Date</p>
                    <p className="text-gray-800 dark:text-white">
                      {txn.gatewayResponse.tran_date}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Refund Info */}
          {txn?.status === "refunded" && (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-5 border border-orange-200 dark:border-orange-800/30">
              <h2 className="text-sm font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                <LuRotateCcw className="size-4" />
                Refund Details
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Refund Amount
                  </span>
                  <span className="font-semibold text-orange-700 dark:text-orange-300">
                    ৳{(txn.refundAmount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Reason
                  </span>
                  <span className="text-gray-800 dark:text-white">
                    {txn.refundReason}
                  </span>
                </div>
                {txn.refundMethod && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Method
                    </span>
                    <span className="text-gray-800 dark:text-white capitalize">
                      {txn.refundMethod}
                    </span>
                  </div>
                )}
                {txn.refundNote && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Note
                    </span>
                    <span className="text-gray-800 dark:text-white">
                      {txn.refundNote}
                    </span>
                  </div>
                )}
                {txn.refundedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Processed At
                    </span>
                    <span className="text-gray-800 dark:text-white">
                      {moment(txn.refundedAt).format("DD MMM YYYY, hh:mm A")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Failure Info */}
          {txn?.status === "failed" && txn?.failedAt && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800/30">
              <h2 className="text-sm font-medium text-red-700 dark:text-red-300 uppercase tracking-wide mb-4 flex items-center gap-2">
                <LuX className="size-4" />
                Failure Details
              </h2>
              <div className="space-y-2 text-sm">
                {txn.failureReason && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Reason
                    </span>
                    <span className="text-gray-800 dark:text-white">
                      {txn.failureReason}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Failed At
                  </span>
                  <span className="text-gray-800 dark:text-white">
                    {moment(txn.failedAt).format("DD MMM YYYY, hh:mm A")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
              Actions
            </h2>
            {txn?.status === "paid" && (
              <Button
                variant="outline"
                onClick={refundModal.open}
                className="w-full"
              >
                <LuRotateCcw className="size-4" />
                Process Refund
              </Button>
            )}
            {txn?.method === "cash-on-delivery" &&
              txn?.status === "pending" && (
                <Button
                  onClick={handleMarkCOD}
                  disabled={codLoading}
                  className="w-full"
                >
                  <LuCheck className="size-4" />
                  {codLoading ? "Marking..." : "Mark COD Collected"}
                </Button>
              )}
            {txn?.status !== "paid" &&
              !(
                txn?.method === "cash-on-delivery" && txn?.status === "pending"
              ) && (
                <p className="text-sm text-gray-500 text-center py-2">
                  No actions available
                </p>
              )}
          </div>

          {/* Status Timeline */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
              Timeline
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="text-gray-800 dark:text-white">
                    {moment(txn?.createdAt).format("DD MMM YYYY, hh:mm A")}
                  </p>
                </div>
              </div>
              {txn?.paidAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-gray-500">Paid</p>
                    <p className="text-gray-800 dark:text-white">
                      {moment(txn.paidAt).format("DD MMM YYYY, hh:mm A")}
                    </p>
                  </div>
                </div>
              )}
              {txn?.failedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-gray-500">Failed</p>
                    <p className="text-gray-800 dark:text-white">
                      {moment(txn.failedAt).format("DD MMM YYYY, hh:mm A")}
                    </p>
                    {txn.failureReason && (
                      <p className="text-xs text-red-500 mt-0.5">
                        {txn.failureReason}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {txn?.refundedAt && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-gray-500">Refunded</p>
                    <p className="text-gray-800 dark:text-white">
                      {moment(txn.refundedAt).format("DD MMM YYYY, hh:mm A")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      <Modal
        open={refundModal.isOpen}
        onClose={refundModal.close}
        title="Process Refund"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Transaction:{" "}
              <span className="font-mono">
                {txn?.transactionId || txn?._id}
              </span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Amount:{" "}
              <span className="font-semibold">৳{txn?.amount?.toFixed(2)}</span>
            </p>
          </div>
          <Textarea
            label="Refund Reason"
            placeholder="Enter reason for refund..."
            value={refundData.reason}
            onValueChange={(value) =>
              setRefundData((prev) => ({ ...prev, reason: value }))
            }
            rows={3}
            requiredSign
          />
          <Input
            label="Refund Amount (Optional)"
            type="number"
            placeholder="Leave empty for full refund"
            value={refundData.amount}
            onValueChange={(value) =>
              setRefundData((prev) => ({ ...prev, amount: value }))
            }
          />
          <Select
            label="Refund Method"
            options={refundMethodOptions}
            value={refundData.refundMethod}
            onValueChange={(value) =>
              setRefundData((prev) => ({ ...prev, refundMethod: value }))
            }
          />
          <Input
            label="Refund Note (Optional)"
            placeholder="e.g. bKash number, bank details..."
            value={refundData.refundNote}
            onValueChange={(value) =>
              setRefundData((prev) => ({ ...prev, refundNote: value }))
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
    </div>
  );
}
