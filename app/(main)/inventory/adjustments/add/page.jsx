"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { LuArrowLeft, LuSave } from "react-icons/lu";
import Link from "next/link";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { SearchSelect } from "@/components/ui/select/SearchSelect";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { useCreateStockAdjustmentMutation } from "@/features/inventory/stockAdjustmentsApiSlice";
import { useGetWarehousesIdNameQuery } from "@/features/inventory/warehousesApiSlice";
import { useGetProductsIdNameQuery } from "@/features/products/productsApiSlice";
import { handleToast } from "@/utils/handleToast";
import { adjustmentTypeOptions } from "@/utils/DataHelper";
import { cleanPayload } from "@/utils/cleanPayload";

export default function AddStockAdjustmentPage() {
  const router = useRouter();
  const [createAdjustment, { isLoading }] = useCreateStockAdjustmentMutation();
  const { data: warehousesData } = useGetWarehousesIdNameQuery();
  const { data: productsData } = useGetProductsIdNameQuery();

  const warehouseOptions = warehousesData?.data || [];
  const productOptions = productsData?.data || [];

  const [formData, setFormData] = useState({
    product: "",
    adjustmentType: "increase",
    quantity: 0,
    reason: "",
    notes: "",
    warehouse: "",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.product) newErrors.product = "Product is required";
    if (!formData.quantity || formData.quantity <= 0)
      newErrors.quantity = "Valid quantity is required";
    if (!formData.reason.trim()) newErrors.reason = "Reason is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix errors");
      return;
    }

    const loadingToast = toast.loading("Creating adjustment...");
    const payload = cleanPayload({
      ...formData,
      quantity: Number(formData.quantity),
    });
    const result = await createAdjustment(payload);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "create-adjustment",
      message: "Adjustment created!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) router.push("/inventory/adjustments");
  };

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
        <Link
          href="/inventory/adjustments"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LuArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            New Stock Adjustment
          </h1>
          <p className="text-sm text-gray-500">
            Adjust stock levels for a product
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Adjustment Details
              </h2>
              <SearchSelect
                label="Product"
                placeholder="Select a product"
                searchPlaceholder="Search products..."
                options={productOptions.map((p) => ({
                  value: p.value,
                  label: p.label,
                }))}
                value={formData.product}
                onValueChange={(val) => handleInputChange("product", val)}
                error={errors.product}
                requiredSign={true}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Adjustment Type"
                  options={adjustmentTypeOptions}
                  value={formData.adjustmentType}
                  onValueChange={(val) =>
                    handleInputChange("adjustmentType", val)
                  }
                  requiredSign={true}
                />
                <Input
                  label="Quantity"
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onValueChange={(val) => handleInputChange("quantity", val)}
                  error={errors.quantity}
                  requiredSign={true}
                  min={1}
                />
              </div>
              <Textarea
                label="Reason"
                placeholder="Why is this adjustment needed?"
                value={formData.reason}
                onValueChange={(val) => handleInputChange("reason", val)}
                error={errors.reason}
                requiredSign={true}
                rows={2}
              />
              <Textarea
                label="Notes"
                placeholder="Additional notes (optional)"
                value={formData.notes}
                onValueChange={(val) => handleInputChange("notes", val)}
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Warehouse
              </h2>
              <Select
                label="Warehouse (Optional)"
                options={[
                  { value: "", label: "Default Warehouse" },
                  ...warehouseOptions.map((w) => ({
                    value: w.value,
                    label: w.label,
                  })),
                ]}
                value={formData.warehouse}
                onValueChange={(val) => handleInputChange("warehouse", val)}
              />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <h3 className="text-sm font-medium text-primary mb-2">Note</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Stock adjustments require approval before they take effect.
                After creation, an admin can approve or reject this adjustment.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link href="/inventory/adjustments">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={isLoading}>
            <LuSave className="size-4" />
            {isLoading ? "Creating..." : "Create Adjustment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
