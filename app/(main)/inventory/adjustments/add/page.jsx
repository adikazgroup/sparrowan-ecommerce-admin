"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import moment from "moment";
import {
  LuArrowLeft,
  LuSave,
  LuPackage,
  LuBoxes,
  LuInfo,
} from "react-icons/lu";
import Link from "next/link";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { SearchSelect } from "@/components/ui/select/SearchSelect";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { useCreateStockAdjustmentMutation } from "@/features/inventory/stockAdjustmentsApiSlice";
import { useGetBatchesByVariantQuery } from "@/features/inventory/inventoryBatchesApiSlice";
import { useGetProductsIdNameQuery } from "@/features/products/productsApiSlice";
import { useGetVariantsByProductQuery } from "@/features/products/productVariantsApiSlice";
import { handleToast } from "@/utils/handleToast";
import { cleanPayload } from "@/utils/cleanPayload";

const adjustmentTypeOptions = [
  { value: "decrease", label: "Decrease — damage, loss, write-off" },
  { value: "increase", label: "Increase — customer return, correction" },
];

export default function AddStockAdjustmentPage() {
  const router = useRouter();
  const [createAdjustment, { isLoading }] = useCreateStockAdjustmentMutation();
  const { data: productsData } = useGetProductsIdNameQuery();
  const productOptions = productsData?.data || [];

  const [formData, setFormData] = useState({
    product: "",
    variant: "",
    batch: "",
    adjustmentType: "decrease",
    quantity: "",
    reason: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [selectedVariantData, setSelectedVariantData] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Fetch variants when product selected
  const { data: variantsData, isLoading: variantsLoading } =
    useGetVariantsByProductQuery(formData.product, { skip: !formData.product });
  const variantOptions = variantsData?.data || [];

  // Fetch batches when variant selected
  const { data: batchesData, isLoading: batchesLoading } =
    useGetBatchesByVariantQuery(formData.variant, {
      skip: !formData.variant,
    });
  const batches = batchesData?.data || [];

  // Auto-select default variant for single-variant products
  useEffect(() => {
    if (formData.product && variantOptions.length === 1 && !formData.variant) {
      const defaultVariant = variantOptions[0];
      setFormData((prev) => ({ ...prev, variant: defaultVariant._id }));
      setSelectedVariantData(defaultVariant);
    }
  }, [formData.product, variantOptions, formData.variant]);

  const handleInputChange = (field, value) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));

    if (field === "product") {
      setFormData((prev) => ({
        ...prev,
        product: value,
        variant: "",
        batch: "",
        quantity: "",
      }));
      setSelectedVariantData(null);
      setSelectedBatch(null);
      return;
    }
    if (field === "variant") {
      setFormData((prev) => ({
        ...prev,
        variant: value,
        batch: "",
        quantity: "",
      }));
      const selectedVariant = variantOptions.find((v) => v._id === value);
      setSelectedVariantData(selectedVariant || null);
      setSelectedBatch(null);
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBatchSelect = (batch) => {
    setSelectedBatch(batch);
    setFormData((prev) => ({ ...prev, batch: batch._id, quantity: "" }));
    if (errors.batch) setErrors((prev) => ({ ...prev, batch: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.product) newErrors.product = "Product is required";
    if (!formData.variant) newErrors.variant = "Variant is required";
    if (!formData.batch) newErrors.batch = "Please select an inventory batch";
    if (!formData.quantity || Number(formData.quantity) <= 0)
      newErrors.quantity = "Valid quantity is required";
    if (
      formData.adjustmentType === "decrease" &&
      selectedBatch &&
      Number(formData.quantity) > selectedBatch.quantityRemaining
    ) {
      newErrors.quantity = `Cannot exceed available stock (${selectedBatch.quantityRemaining})`;
    }
    if (!formData.reason.trim()) newErrors.reason = "Reason is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors");
      return;
    }

    const loadingToast = toast.loading("Creating adjustment...");
    const payload = cleanPayload({
      product: formData.product,
      variant: formData.variant,
      batch: formData.batch,
      warehouse: selectedBatch?.warehouse?._id || selectedBatch?.warehouse,
      adjustmentType: formData.adjustmentType,
      quantity: Number(formData.quantity),
      reason: formData.reason,
      notes: formData.notes || undefined,
    });
    const result = await createAdjustment(payload);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "create-adjustment",
      message: "Adjustment created successfully!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) router.push("/inventory/adjustments");
  };

  // Build variant select options
  const variantSelectOptions = variantOptions.map((v) => {
    const attrs = [];
    if (v.attributes?.size) attrs.push(v.attributes.size);
    if (v.attributes?.color) attrs.push(v.attributes.color);
    if (v.attributes?.material) attrs.push(v.attributes.material);
    const label =
      attrs.length > 0 ? `${attrs.join(" / ")} (${v.sku})` : v.sku || v._id;
    return { value: v._id, label };
  });

  // Preview: batch stock after adjustment
  const afterQty =
    selectedBatch && formData.quantity > 0
      ? formData.adjustmentType === "increase"
        ? selectedBatch.quantityRemaining + Number(formData.quantity)
        : Math.max(
            0,
            selectedBatch.quantityRemaining - Number(formData.quantity),
          )
      : null;

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6">
      {/* Header */}
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
            Select a product, variant, and inventory batch to adjust
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Product & Variant */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                <LuPackage className="size-4" /> Step 1 — Product & Variant
              </h2>
              <SearchSelect
                label="Product"
                placeholder="Select a product"
                searchPlaceholder="Search products..."
                options={productOptions.map((p) => ({
                  value: p.value,
                  label: `${p.label}${p.variantCount > 1 ? ` (${p.variantCount} variants)` : ""}`,
                }))}
                value={formData.product}
                onValueChange={(val) => handleInputChange("product", val)}
                error={errors.product}
                requiredSign={true}
              />
              {formData.product && (
                <Select
                  label="Variant"
                  placeholder={
                    variantsLoading ? "Loading variants..." : "Select Variant"
                  }
                  options={[
                    { value: "", label: "Select Variant" },
                    ...variantSelectOptions,
                  ]}
                  value={formData.variant}
                  onValueChange={(val) => handleInputChange("variant", val)}
                  error={errors.variant}
                  requiredSign={true}
                  disabled={variantsLoading}
                />
              )}
            </div>

            {/* Step 2: Batch Selection */}
            {formData.variant && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                  <LuBoxes className="size-4" /> Step 2 — Select Inventory Batch
                  <span className="text-red-500 ml-0.5">*</span>
                </h2>
                {errors.batch && (
                  <p className="text-sm text-red-500">{errors.batch}</p>
                )}
                {batchesLoading ? (
                  <p className="text-sm text-gray-500 py-4 text-center">
                    Loading batches...
                  </p>
                ) : batches.length === 0 ? (
                  <div className="text-center py-6 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <LuBoxes className="size-8 mx-auto text-amber-500 mb-2" />
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      No inventory batches found for this variant
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                      Stock must be received via a Purchase Order first.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="text-left py-2.5 px-3 w-8"></th>
                          <th className="text-left py-2.5 px-3 text-gray-500 font-medium">
                            Batch #
                          </th>
                          <th className="text-left py-2.5 px-3 text-gray-500 font-medium">
                            PO #
                          </th>
                          <th className="text-left py-2.5 px-3 text-gray-500 font-medium">
                            Warehouse
                          </th>
                          <th className="text-right py-2.5 px-3 text-gray-500 font-medium">
                            Unit Cost
                          </th>
                          <th className="text-right py-2.5 px-3 text-gray-500 font-medium">
                            Received
                          </th>
                          <th className="text-right py-2.5 px-3 text-gray-500 font-medium">
                            Remaining
                          </th>
                          <th className="text-center py-2.5 px-3 text-gray-500 font-medium">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {batches.map((batch) => (
                          <tr
                            key={batch._id}
                            onClick={() => handleBatchSelect(batch)}
                            className={`cursor-pointer transition-colors ${
                              formData.batch === batch._id
                                ? "bg-primary/10 dark:bg-primary/20"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            }`}
                          >
                            <td className="py-3 px-3">
                              <input
                                type="radio"
                                name="batch"
                                checked={formData.batch === batch._id}
                                onChange={() => handleBatchSelect(batch)}
                                className="accent-primary"
                              />
                            </td>
                            <td className="py-3 px-3 font-mono font-medium text-gray-800 dark:text-white">
                              {batch.batchNumber}
                            </td>
                            <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                              {batch.purchaseOrder?.poNumber || "---"}
                            </td>
                            <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                              {batch.warehouse?.name || "---"}
                            </td>
                            <td className="py-3 px-3 text-right font-medium text-gray-800 dark:text-white">
                              ৳{batch.unitCost?.toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-right text-gray-600 dark:text-gray-400">
                              {batch.quantityReceived}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-gray-800 dark:text-white">
                              {batch.quantityRemaining}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                  batch.status === "active"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                                }`}
                              >
                                {batch.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Adjustment Details */}
            {formData.batch && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Step 3 — Adjustment Details
                </h2>
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
                    max={
                      formData.adjustmentType === "decrease"
                        ? selectedBatch?.quantityRemaining
                        : undefined
                    }
                  />
                </div>
                <Textarea
                  label="Reason"
                  placeholder="e.g. Damaged goods, Customer return, Physical count correction"
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
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Selected Batch Preview */}
            {selectedBatch && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Selected Batch
                </h2>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Batch #</span>
                    <span className="font-mono font-semibold text-gray-800 dark:text-white">
                      {selectedBatch.batchNumber}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Warehouse</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {selectedBatch.warehouse?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Unit Cost</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      ৳{selectedBatch.unitCost?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Received On</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {moment(selectedBatch.receivedDate).format("DD MMM YYYY")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span className="text-gray-500">Current Stock</span>
                    <span className="font-bold text-gray-800 dark:text-white">
                      {selectedBatch.quantityRemaining}
                    </span>
                  </div>
                  {afterQty !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">After Adjustment</span>
                      <span
                        className={`font-bold ${
                          formData.adjustmentType === "increase"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {afterQty}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <h3 className="text-sm font-medium text-primary mb-2 flex items-center gap-1.5">
                <LuInfo className="size-4" /> How it works
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1.5 list-disc list-inside">
                <li>Select exactly which batch to adjust</li>
                <li>
                  <strong>Decrease</strong> — damage, loss, write-off
                </li>
                <li>
                  <strong>Increase</strong> — customer return, count correction
                </li>
                <li>Requires admin approval before stock updates</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link href="/inventory/adjustments">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={isLoading} disabled={!formData.batch}>
            <LuSave className="size-4" />
            {isLoading ? "Creating..." : "Create Adjustment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
