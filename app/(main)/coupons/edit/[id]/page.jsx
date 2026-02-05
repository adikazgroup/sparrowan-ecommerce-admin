"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { LuArrowLeft, LuSave, LuLoader } from "react-icons/lu";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea/Textarea";
import {
  useGetSingleCouponQuery,
  useUpdateCouponMutation,
} from "@/features/coupons/couponsApiSlice";
import { handleToast } from "@/utils/handleToast";
import { cleanPayload } from "@/utils/cleanPayload";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expired", label: "Expired" },
];

const typeOptions = [
  { value: "flat", label: "Flat Amount" },
  { value: "percentage", label: "Percentage" },
];

const scopeOptions = [
  { value: "all", label: "All Products" },
  { value: "specific", label: "Specific Products" },
];

const visibilityOptions = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = params.id;

  const { data: couponData, isLoading: isFetching } =
    useGetSingleCouponQuery(couponId);
  const [updateCoupon, { isLoading }] = useUpdateCouponMutation();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    type: "percentage",
    discountValue: "",
    scope: "all",
    minOrderAmount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    visibility: "private",
    isPublic: true,
    status: "active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (couponData?.data) {
      const coupon = couponData.data;
      setFormData({
        name: coupon.name || "",
        code: coupon.code || "",
        description: coupon.description || "",
        type: coupon.type || "percentage",
        discountValue: coupon.discountValue || "",
        scope: coupon.scope || "all",
        minOrderAmount: coupon.minOrderAmount || "",
        usageLimit: coupon.usageLimit || "",
        startDate: coupon.startDate ? coupon.startDate.split("T")[0] : "",
        endDate: coupon.endDate ? coupon.endDate.split("T")[0] : "",
        visibility: coupon.visibility || "private",
        isPublic: coupon.isPublic ?? true,
        status: coupon.status || "active",
      });
    }
  }, [couponData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
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
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate >= formData.endDate
    ) {
      newErrors.endDate = "End date must be after start date";
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

    const couponPayload = cleanPayload({
      name: formData.name,
      code: formData.code.toUpperCase(),
      description: formData.description,
      type: formData.type,
      discountValue: Number(formData.discountValue),
      scope: formData.scope,
      minOrderAmount: formData.minOrderAmount
        ? Number(formData.minOrderAmount)
        : undefined,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isPublic: formData.isPublic,
      status: formData.status,
    });

    const loadingToast = toast.loading("Updating coupon...");
    const result = await updateCoupon({ id: couponId, data: couponPayload });

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-coupon",
      message: "Coupon updated successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      router.push("/coupons");
    }
  };

  if (isFetching) {
    return (
      <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl flex items-center justify-center">
        <LuLoader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

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
              Edit Coupon
            </h1>
            <p className="text-sm text-gray-500">
              Update coupon: {formData.code}
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

            {/* Visibility */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Visibility
              </h2>
              <Select
                options={visibilityOptions}
                value={formData.visibility}
                onValueChange={(val) => handleInputChange("visibility", val)}
                className="w-full"
              />
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
                  Show in public coupon list
                </label>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Usage Stats
              </h2>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {couponData?.data?.usedCount || 0}
                </p>
                <p className="text-sm text-gray-500">Times Used</p>
              </div>
            </div>
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
            {isLoading ? "Updating..." : "Update Coupon"}
          </Button>
        </div>
      </form>
    </div>
  );
}
