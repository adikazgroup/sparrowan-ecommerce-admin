"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { LuArrowLeft, LuTruck, LuSave, LuSearch } from "react-icons/lu";

import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
import { Select } from "@/components/ui/select/Select";
import { SearchSelect } from "@/components/ui/select/SearchSelect";
import { Textarea } from "@/components/ui/textarea/Textarea";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import {
  useCreateShipmentMutation,
  useGetPathaoZonesQuery,
  useGetPathaoAreasQuery,
} from "@/features/shipments/shipmentsApiSlice";
import { useGetOrderIdAndNumberListQuery } from "@/features/orders/ordersApiSlice";
import { handleToast } from "@/utils/handleToast";

const courierOptions = [
  { value: "PATHAO", label: "Pathao Courier" },
  { value: "SUNDARBAN", label: "Sundarban Courier" },
  { value: "MANUAL", label: "Manual Shipping" },
];

const itemTypeOptions = [
  { value: "parcel", label: "Parcel" },
  { value: "document", label: "Document" },
];

export default function CreateShipmentPage() {
  const router = useRouter();
  const [createShipment, { isLoading: creating }] = useCreateShipmentMutation();

  const [formData, setFormData] = useState({
    orderId: "",
    courier: "",
    recipientName: "",
    recipientPhone: "",
    recipientAddress: "",
    recipientCity: "",
    recipientZone: "",
    recipientArea: "",
    itemType: "parcel",
    weight: "0.5",
    specialInstructions: "",
    // PATHAO specific
    pathaoCityId: "",
    pathaoZoneId: "",
    pathaoAreaId: "",
  });

  // Fetch confirmed orders for SearchSelect
  const { data: ordersData } = useGetOrderIdAndNumberListQuery();

  // Pathao cascading dropdowns
  const { data: zonesData } = useGetPathaoZonesQuery(formData.pathaoCityId, {
    skip: !formData.pathaoCityId,
  });
  const { data: areasData } = useGetPathaoAreasQuery(formData.pathaoZoneId, {
    skip: !formData.pathaoZoneId,
  });

  const orders = ordersData?.data || [];
  const zones = zonesData?.data?.data || zonesData?.data || [];
  const areas = areasData?.data?.data || areasData?.data || [];

  const zoneOptions = Array.isArray(zones)
    ? zones.map((z) => ({ value: String(z.zone_id), label: z.zone_name }))
    : [];
  const areaOptions = Array.isArray(areas)
    ? areas.map((a) => ({ value: String(a.area_id), label: a.area_name }))
    : [];

  const updateField = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Reset dependent dropdowns
      if (field === "pathaoCityId") {
        updated.pathaoZoneId = "";
        updated.pathaoAreaId = "";
      }
      if (field === "pathaoZoneId") {
        updated.pathaoAreaId = "";
      }
      // Reset pathao fields if courier changes
      if (field === "courier" && value !== "PATHAO") {
        updated.pathaoCityId = "";
        updated.pathaoZoneId = "";
        updated.pathaoAreaId = "";
      }
      return updated;
    });
  };

  const handleSelectOrder = (orderId) => {
    const order = orders.find((o) => o._id === orderId);
    if (!order) return;

    setFormData((prev) => ({
      ...prev,
      orderId: order._id,
      recipientName: order.shippingName || order.customerName || "",
      recipientPhone: "", // Will need to fetch full order for phone
      recipientAddress: "",
      recipientCity: "",
    }));
  };

  const handleSubmit = async () => {
    if (!formData.orderId) {
      toast.error("Please select an order");
      return;
    }
    if (!formData.courier) {
      toast.error("Please select a courier");
      return;
    }
    if (!formData.recipientName || !formData.recipientPhone) {
      toast.error("Recipient name and phone are required");
      return;
    }

    const body = {
      orderId: formData.orderId,
      courier: formData.courier,
      recipientName: formData.recipientName,
      recipientPhone: formData.recipientPhone,
      recipientAddress: formData.recipientAddress,
      recipientCity: formData.recipientCity,
      itemType: formData.itemType,
      weight: parseFloat(formData.weight) || 0.5,
      specialInstructions: formData.specialInstructions || undefined,
    };

    // Add Pathao-specific fields
    if (formData.courier === "PATHAO") {
      body.pathaoZoneId = formData.pathaoZoneId
        ? parseInt(formData.pathaoZoneId)
        : undefined;
      body.pathaoAreaId = formData.pathaoAreaId
        ? parseInt(formData.pathaoAreaId)
        : undefined;
    }

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
    label: `#${order.orderNumber} - ${order.customerName} (৳${order.total.toLocaleString("en-BD")})`,
  }));

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
              onValueChange={handleSelectOrder}
              requiredSign
              helperText={
                selectedOrder
                  ? `${selectedOrder.customerName} • ৳${selectedOrder.total.toLocaleString("en-BD")}`
                  : "Only confirmed orders are shown"
              }
            />
          </div>

          {/* Courier Selection */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4 flex items-center gap-2">
              <LuTruck className="size-4" />
              Courier & Delivery
            </h2>
            <div className="space-y-4">
              <Select
                label="Courier Service"
                options={courierOptions}
                value={formData.courier}
                onValueChange={(value) => updateField("courier", value)}
                requiredSign
              />

              {formData.courier === "PATHAO" && (
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Zone"
                    options={zoneOptions}
                    value={formData.pathaoZoneId}
                    onValueChange={(value) =>
                      updateField("pathaoZoneId", value)
                    }
                    placeholder="Select Zone"
                    disabled={zoneOptions.length === 0}
                  />
                  <Select
                    label="Area"
                    options={areaOptions}
                    value={formData.pathaoAreaId}
                    onValueChange={(value) =>
                      updateField("pathaoAreaId", value)
                    }
                    placeholder="Select Area"
                    disabled={areaOptions.length === 0}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Item Type"
                  options={itemTypeOptions}
                  value={formData.itemType}
                  onValueChange={(value) => updateField("itemType", value)}
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  value={formData.weight}
                  onValueChange={(value) => updateField("weight", value)}
                  min="0.1"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Recipient Details */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
              Recipient Details
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Recipient Name"
                  value={formData.recipientName}
                  onValueChange={(value) => updateField("recipientName", value)}
                  requiredSign
                />
                <Input
                  label="Phone Number"
                  value={formData.recipientPhone}
                  onValueChange={(value) =>
                    updateField("recipientPhone", value)
                  }
                  requiredSign
                />
              </div>
              <Input
                label="Address"
                value={formData.recipientAddress}
                onValueChange={(value) =>
                  updateField("recipientAddress", value)
                }
              />
              <Input
                label="City"
                value={formData.recipientCity}
                onValueChange={(value) => updateField("recipientCity", value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Zone/Area"
                  placeholder="e.g., Dhanmondi, Gulshan"
                  value={formData.recipientZone}
                  onValueChange={(value) => updateField("recipientZone", value)}
                  helperText={
                    formData.courier === "PATHAO"
                      ? "Will use Pathao zone if selected"
                      : ""
                  }
                />
                <Input
                  label="Area/Locality"
                  placeholder="e.g., Road 27, Block A"
                  value={formData.recipientArea}
                  onValueChange={(value) => updateField("recipientArea", value)}
                  helperText={
                    formData.courier === "PATHAO"
                      ? "Will use Pathao area if selected"
                      : ""
                  }
                />
              </div>
              <Textarea
                label="Special Instructions (Optional)"
                placeholder="Any special delivery instructions..."
                value={formData.specialInstructions}
                onValueChange={(value) =>
                  updateField("specialInstructions", value)
                }
                rows={3}
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
                <span className="text-gray-500">Courier</span>
                <span className="font-medium text-gray-800 dark:text-white">
                  {courierOptions.find((c) => c.value === formData.courier)
                    ?.label || "---"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Recipient</span>
                <span className="text-gray-800 dark:text-white">
                  {formData.recipientName || "---"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="text-gray-800 dark:text-white">
                  {formData.recipientPhone || "---"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Weight</span>
                <span className="text-gray-800 dark:text-white">
                  {formData.weight} kg
                </span>
              </div>
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
              disabled={creating || !formData.orderId || !formData.courier}
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
