"use client";

import { useParams } from "next/navigation";
import moment from "moment";
import Link from "next/link";
import {
  LuArrowLeft,
  LuCreditCard,
  LuDollarSign,
  LuPackage,
  LuRotateCcw,
  LuCalendar,
  LuHash,
  LuX,
  LuWallet,
  LuUser,
  LuPhone,
  LuMapPin,
  LuExternalLink,
  LuShoppingCart,
} from "react-icons/lu";

import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import { useGetSingleTransactionQuery } from "@/features/transactions/transactionsApiSlice";

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

  const { data, isLoading, isError } = useGetSingleTransactionQuery(txnId);
  const txn = data?.data;

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
                <p className="font-mono font-medium text-gray-800 dark:text-white break-all">
                  {txn?.transactionId || txn?._id || "---"}
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
              <div className="space-y-4">
                {/* Order header */}
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <LuShoppingCart className="size-4 text-primary shrink-0" />
                    <Link
                      href={`/orders/${txn.order._id}`}
                      className="font-mono font-semibold text-primary hover:underline text-base"
                    >
                      #{txn.order.orderNumber}
                    </Link>
                    <Link
                      href={`/orders/${txn.order._id}`}
                      className="text-gray-400 hover:text-primary"
                    >
                      <LuExternalLink className="size-3.5" />
                    </Link>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 dark:text-white text-lg">
                      ৳{(txn.order.total || 0).toLocaleString("en-BD")}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                        txn.order.status === "delivered"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : txn.order.status === "cancelled"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                            : txn.order.status === "shipped"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                      }`}
                    >
                      {txn.order.status}
                    </span>
                  </div>
                </div>

                {/* Customer / Shipping info */}
                {txn.order.shippingAddress && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <LuUser className="size-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Customer</p>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {txn.order.shippingAddress.name || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <LuPhone className="size-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {txn.order.shippingAddress.phone || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <LuMapPin className="size-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">
                          Shipping Address
                        </p>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {[
                            txn.order.shippingAddress.street,
                            txn.order.shippingAddress.city,
                            txn.order.shippingAddress.state,
                            txn.order.shippingAddress.country,
                          ]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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

        {/* Right Column — Timeline only */}
        <div className="space-y-6">
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
    </div>
  );
}
