"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { LuArrowLeft, LuSave } from "react-icons/lu";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { MultipleSearchSelect } from "@/components/ui/select/MultipleSearchSelect";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { useCreateCouponMutation } from "@/features/coupons/couponsApiSlice";
import { useGetProductsIdNameQuery } from "@/features/products/productsApiSlice";
import { useGetCustomersIdNameQuery } from "@/features/customers/customersApiSlice";
import { handleToast } from "@/utils/handleToast";
import { cleanPayload } from "@/utils/cleanPayload";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const typeOptions = [
  { value: "flat", label: "Flat Amount" },
  { value: "percentage", label: "Percentage" },
];

const scopeOptions = [
  { value: "all", label: "All Products" },
  { value: "specific", label: "Specific Products" },
];

export default function AddCouponPage() {
  const router = useRouter();
  const [createCoupon, { isLoading }] = useCreateCouponMutation();
  const { data: productsData } = useGetProductsIdNameQuery();
  const { data: customersData } = useGetCustomersIdNameQuery();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    type: "percentage",
    discountValue: "",
    scope: "all",
    applicableProducts: [],
    minOrderAmount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    isPublic: true,
    eligibleCustomers: [],
    status: "active",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    handleInputChange("code", code);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.code.trim()) newErrors.code = "Code is required";
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      newErrors.discountValue = "Valid discount value is required";
    }
    if (
      formData.type === "percentage" &&
      Number(formData.discountValue) > 100
    ) {
      newErrors.discountValue = "Percentage cannot exceed 100%";
    }
    if (
      formData.scope === "specific" &&
      formData.applicableProducts.length === 0
    ) {
      newErrors.applicableProducts = "At least one product is required";
    }
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate >= formData.endDate
    ) {
      newErrors.endDate = "End date must be after start date";
    }
    if (!formData.isPublic && formData.eligibleCustomers.length === 0) {
      newErrors.eligibleCustomers = "At least one customer is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const couponData = cleanPayload({
      name: formData.name,
      code: formData.code.toUpperCase(),
      description: formData.description,
      type: formData.type,
      discountValue: Number(formData.discountValue),
      scope: formData.scope,
      applicableProducts:
        formData.scope === "specific" ? formData.applicableProducts : undefined,
      minOrderAmount: formData.minOrderAmount
        ? Number(formData.minOrderAmount)
        : undefined,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      startDate: formData.startDate
        ? new Date(formData.startDate).toISOString()
        : undefined,
      endDate: formData.endDate
        ? new Date(formData.endDate).toISOString()
        : undefined,
      isPublic: formData.isPublic,
      eligibleCustomers: !formData.isPublic
        ? formData.eligibleCustomers
        : undefined,
      status: formData.status,
    });

    const loadingToast = toast.loading("Creating coupon...");
    const result = await createCoupon(couponData);

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "create-coupon",
      message: "Coupon created successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      router.push("/coupons");
    }
  };

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/coupons"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LuArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Add New Coupon
            </h1>
            <p className="text-sm text-gray-500">
              Create a new discount coupon
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Coupon Name"
                  placeholder="Summer Sale Coupon"
                  value={formData.name}
                  onValueChange={(val) => handleInputChange("name", val)}
                  error={errors.name}
                  requiredSign={true}
                />
                <div>
                  <Input
                    label="Coupon Code"
                    placeholder="SUMMER20"
                    value={formData.code}
                    onValueChange={(val) =>
                      handleInputChange("code", val.toUpperCase())
                    }
                    error={errors.code}
                    requiredSign={true}
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="text-xs text-primary hover:underline mt-1"
                  >
                    Generate random code
                  </button>
                </div>
              </div>
              <Textarea
                label="Description"
                placeholder="Describe the coupon details..."
                value={formData.description}
                onValueChange={(val) => handleInputChange("description", val)}
                rows={3}
              />
            </div>

            {/* Discount Settings */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Discount Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Discount Type
                  </label>
                  <Select
                    options={typeOptions}
                    value={formData.type}
                    onValueChange={(val) => handleInputChange("type", val)}
                    className="w-full"
                  />
                </div>
                <Input
                  label={
                    formData.type === "percentage"
                      ? "Discount (%)"
                      : "Discount Amount (৳)"
                  }
                  type="number"
                  placeholder={formData.type === "percentage" ? "20" : "100"}
                  value={formData.discountValue}
                  onValueChange={(val) =>
                    handleInputChange("discountValue", val)
                  }
                  error={errors.discountValue}
                  requiredSign={true}
                />
                <Input
                  label="Min Order Amount (৳)"
                  type="number"
                  placeholder="500"
                  value={formData.minOrderAmount}
                  onValueChange={(val) =>
                    handleInputChange("minOrderAmount", val)
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Scope
                  </label>
                  <Select
                    options={scopeOptions}
                    value={formData.scope}
                    onValueChange={(val) => handleInputChange("scope", val)}
                    className="w-full"
                  />
                </div>
                <Input
                  label="Usage Limit (Leave empty for unlimited)"
                  type="number"
                  placeholder="100"
                  value={formData.usageLimit}
                  onValueChange={(val) => handleInputChange("usageLimit", val)}
                />
              </div>
              {/* Applicable Products - Only show when scope is specific */}
              {formData.scope === "specific" && (
                <div>
                  <MultipleSearchSelect
                    label="Select Products"
                    options={productsData?.data || []}
                    value={formData.applicableProducts}
                    onValueChange={(val) =>
                      handleInputChange("applicableProducts", val)
                    }
                    error={errors.applicableProducts}
                    requiredSign={true}
                    placeholder="Select products for this coupon"
                  />
                </div>
              )}
            </div>

            {/* Validity Period */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Validity Period
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onValueChange={(val) => handleInputChange("startDate", val)}
                  error={errors.startDate}
                  requiredSign={true}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onValueChange={(val) => handleInputChange("endDate", val)}
                  error={errors.endDate}
                  requiredSign={true}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Status
              </h2>
              <Select
                options={statusOptions}
                value={formData.status}
                onValueChange={(val) => handleInputChange("status", val)}
                className="w-full"
              />
            </div>

            {/* Coupon Visibility */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Coupon Visibility
              </h2>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    handleInputChange("isPublic", e.target.checked)
                  }
                  className="rounded border-gray-300"
                />
                <label
                  htmlFor="isPublic"
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  Public coupon (visible to all customers)
                </label>
              </div>
              <p className="text-xs text-gray-500">
                {formData.isPublic
                  ? "This coupon will be visible to all customers"
                  : "This coupon will only be available to selected customers"}
              </p>
            </div>

            {/* Eligible Customers - Only show when isPublic is false */}
            {!formData.isPublic && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Eligible Customers
                </h2>
                <MultipleSearchSelect
                  label="Select Customers"
                  options={customersData?.data || []}
                  value={formData.eligibleCustomers}
                  onValueChange={(val) =>
                    handleInputChange("eligibleCustomers", val)
                  }
                  error={errors.eligibleCustomers}
                  requiredSign={true}
                  placeholder="Select customers for this coupon"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link href="/coupons">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            <LuSave className="size-4" />
            {isLoading ? "Creating..." : "Create Coupon"}
          </Button>
        </div>
      </form>
    </div>
  );
}
