"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { LuArrowLeft, LuTruck, LuSave } from "react-icons/lu";

import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
import { SearchSelect } from "@/components/ui/select/SearchSelect";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import { useCreateShipmentMutation } from "@/features/shipments/shipmentsApiSlice";
import { useGetOrderIdAndNumberListQuery } from "@/features/orders/ordersApiSlice";
import { handleToast } from "@/utils/handleToast";

export default function CreateShipmentPage() {
  const router = useRouter();
  const [createShipment, { isLoading: creating }] = useCreateShipmentMutation();

  const [formData, setFormData] = useState({
    orderId: "",
    trackingNumber: "",
    estimatedDelivery: "",
  });

  // Fetch confirmed orders for SearchSelect
  const { data: ordersData, isError } = useGetOrderIdAndNumberListQuery();
  const orders = ordersData?.data || [];

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.orderId) {
      toast.error("Please select an order");
      return;
    }

    const body = {
      orderId: formData.orderId,
      ...(formData.trackingNumber && {
        trackingNumber: formData.trackingNumber,
      }),
      ...(formData.estimatedDelivery && {
        estimatedDelivery: new Date(formData.estimatedDelivery).toISOString(),
      }),
    };

    const result = await createShipment(body);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "create-shipment",
      message: "Shipment created successfully!",
    });
    if (result?.data) {
      router.push("/shipments");
    }
  };

  const selectedOrder = orders.find((o) => o._id === formData.orderId);

  // Prepare order options for SearchSelect
  const orderOptions = orders.map((order) => ({
    value: order._id,
    label: `#${order.orderNumber} - ${order.customerName || "Customer"} (৳${(order.total || 0).toLocaleString("en-BD")})`,
  }));

  if (isError) return <ErrorBoundaryFetcher />;

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
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create Shipment
          </h1>
          <p className="text-sm text-gray-500">
            Create a new shipment for a confirmed order
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Selection */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
              Select Order
            </h2>
            <SearchSelect
              label="Confirmed Order"
              placeholder="Select an order..."
              searchPlaceholder="Search by order number or customer..."
              options={orderOptions}
              value={formData.orderId}
              onValueChange={(value) => updateField("orderId", value)}
              requiredSign
              helperText={
                selectedOrder
                  ? `${selectedOrder.customerName || "Customer"} • ৳${(selectedOrder.total || 0).toLocaleString("en-BD")}`
                  : "Only confirmed orders are shown"
              }
            />
          </div>

          {/* Shipment Details */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
              <LuTruck className="size-4" />
              Shipment Details
            </h2>
            <div className="space-y-4">
              <Input
                label="Tracking Number (Optional)"
                placeholder="Auto-generated if left empty"
                value={formData.trackingNumber}
                onValueChange={(value) => updateField("trackingNumber", value)}
                helperText="Leave blank to auto-generate"
              />
              <Input
                label="Estimated Delivery (Optional)"
                type="date"
                value={formData.estimatedDelivery}
                onValueChange={(value) =>
                  updateField("estimatedDelivery", value)
                }
              />
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 sticky top-5">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
              Shipment Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order</span>
                <span className="font-mono font-medium text-gray-800 dark:text-white">
                  {selectedOrder ? `#${selectedOrder.orderNumber}` : "---"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tracking #</span>
                <span className="font-mono text-gray-800 dark:text-white">
                  {formData.trackingNumber || "Auto-generated"}
                </span>
              </div>
              {formData.estimatedDelivery && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Est. Delivery</span>
                  <span className="text-gray-800 dark:text-white">
                    {formData.estimatedDelivery}
                  </span>
                </div>
              )}
              {selectedOrder && (
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Order Total
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    ৳{(selectedOrder.total || 0).toLocaleString("en-BD")}
                  </span>
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={creating || !formData.orderId}
              className="w-full mt-5"
            >
              <LuSave className="size-4" />
              {creating ? "Creating..." : "Create Shipment"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
