"use client";

import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import { LuTag } from "react-icons/lu";
import { Input } from "@/components/ui/input/Input";
import { Modal } from "@/components/ui/modal/Modal";
import { Select } from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";
import { Calendar } from "@/components/ui/calender/Calender";
import { MultipleSearchSelect } from "@/components/ui/select/MultipleSearchSelect";
import { useGetPackageIdAndNameListFromDBQuery } from "@/features/package/packageApiSlice";
import { useUpdateCouponMutation } from "@/features/coupon/couponApiSlice";
import { handleToast } from "@/utils/handleToast";

export default function CouponEdit({ editModal, selectedCoupon }) {
  // Packages data
  const { data } = useGetPackageIdAndNameListFromDBQuery();
  const couponType = data?.data || [];

  const formattedCouponType = couponType.map(({ _id, name }) => ({
    value: _id,
    label: name,
  }));

  // Form state with default applicablePackages
  const [formData, setFormData] = useState({
    description: "",
    code: "",
    couponType: "flat",
    discountValue: "",
    applicablePackages: [],
    usageLimit: "",
    expiresAt: "",
    status: "active",
  });

  useEffect(() => {
    if (selectedCoupon) {
      setFormData((prev) => ({
        ...prev,
        code: selectedCoupon.code,
        description: selectedCoupon.description,
        couponType: selectedCoupon.couponType,
        discountValue: selectedCoupon.discountValue,
        applicablePackages: selectedCoupon.applicablePackages,
        usageLimit: selectedCoupon.usageLimit,
        expiresAt: selectedCoupon.expiresAt,
        status: selectedCoupon.status,
      }));
    }
  }, [selectedCoupon]);

  // Handle form change
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        value && value.target && value.target.value !== undefined
          ? value.target.value
          : value,
    }));
  };

  const typeOptions = [
    { value: "flat", label: "Flat" },
    { value: "percentage", label: "Percentage" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "expired", label: "Expired" },
  ];

  // Update coupon
  const [updateCoupon, { isLoading }] = useUpdateCouponMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCoupon) {
      toast.error("No coupon selected for editing.");
      return;
    }

    const result = await updateCoupon({
      id: selectedCoupon?._id,
      data: formData,
    });

    if (result?.data) {
      handleToast(result);
      editModal.close();
    } else {
      handleToast(result, "error");
    }
  };

  return (
    <Modal
      open={editModal.isOpen}
      onClose={editModal.close}
      title="Edit Coupon"
      size="xxlarge"
    >
      {selectedCoupon && (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Code"
                value={formData.code}
                onValueChange={(value) => handleFormChange("code", value)}
                placeholder="Enter coupon code"
                required
                className=" h-12 dark:border-[#475569]"
                fullWidth
              />
            </div>

            <div>
              <Input
                label="Description"
                value={formData.description}
                onValueChange={(value) =>
                  handleFormChange("description", value)
                }
                placeholder="Enter coupon description"
                className=" h-12 dark:border-[#475569]"
                fullWidth
              />
            </div>

            <div>
              <Select
                label="Coupon Type"
                options={typeOptions}
                value={formData.couponType}
                onValueChange={(value) => handleFormChange("couponType", value)}
                required
                className="h-12 dark:border-[#475569]"
                fullWidth
              />
            </div>

            <div>
              <Input
                label="Discount Value"
                value={formData.discountValue}
                onValueChange={(value) =>
                  handleFormChange("discountValue", value)
                }
                placeholder="Enter discount value"
                required
                className="h-12 dark:border-[#475569]"
                fullWidth
              />
            </div>

            <div>
              <MultipleSearchSelect
                label="Applicable Packages"
                placeholder="Select your Packages"
                searchPlaceholder="Search for Packages..."
                options={formattedCouponType}
                startIcon={<LuTag className="h-4 w-4" />}
                fullWidth
                value={formData.applicablePackages}
                onChange={(value) =>
                  handleFormChange("applicablePackages", value)
                }
              />
            </div>

            <div>
              <Input
                label="Usage Limit"
                value={formData.usageLimit}
                onValueChange={(value) => handleFormChange("usageLimit", value)}
                placeholder="Enter usage limit"
                required
                className="h-12 dark:border-[#475569]"
                fullWidth
              />
            </div>

            <div>
              <Calendar
                label="Expiry Date"
                value={formData.expiresAt}
                onChange={(value) => handleFormChange("expiresAt", value)}
                minDate={new Date()}
                required
                inputClass="h-12 dark:border-[#475569]"
                upper={true}
              />
            </div>

            <div>
              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onValueChange={(value) => handleFormChange("status", value)}
                required
                className=" h-12 dark:border-[#475569]"
                fullWidth
              />
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="submit"
              className="w-full dark:font-normal bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
              endIcon={
                isLoading ? (
                  <Icon
                    icon="eos-icons:loading"
                    className="size-5 animate-spin"
                  />
                ) : (
                  <Icon
                    icon="material-symbols:arrow-right-alt-rounded"
                    className="size-5"
                  />
                )
              }
            >
              {isLoading ? "Loading..." : "Update Coupon"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
