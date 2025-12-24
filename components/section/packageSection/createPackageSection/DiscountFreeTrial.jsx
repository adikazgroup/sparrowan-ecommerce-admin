"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input/Input";
import { Select } from "@/components/ui/select/Select";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";

export default function DiscountFreeTrial({
  formData,
  updateFormData,
  onNext,
  onBack,
}) {
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    // Initialize errors object
    const newErrors = {};
    let isValid = true;

    // Validate free trial fields if free trial is enabled
    if (formData.enableFreeTrial) {
      if (!formData.trialDays) {
        newErrors.trialDays = "Trial days is required";
        isValid = false;
      }
    }

    // Validate status (always required)
    if (!formData.status) {
      newErrors.status = "Status is required";
      isValid = false;
    }

    setErrors(newErrors);

    // Only proceed if all required fields are filled
    if (isValid) {
      onNext();
    }
  };

  const handleToggleChange = (field) => {
    // Clear errors when toggling features off
    if (field === "enableDiscount" && formData.enableDiscount) {
      setErrors((prev) => ({
        ...prev,
        discountType: "",
        discountValue: "",
      }));
    }

    if (field === "enableFreeTrial" && formData.enableFreeTrial) {
      setErrors((prev) => ({
        ...prev,
        trialDays: "",
      }));
    }

    updateFormData({ [field]: !formData[field] });
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#010611] dark:to-[#01091a] p-6 rounded-lg mb-8">
        <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">
          Discount & Free Trial
        </h2>
        <p className="text-gray-600 dark:text-gray-500 text-sm">
          Configure discount options and free trial settings for your package
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-8">
          <div className="bg-white dark:bg-[#161F2D] dark:border-[#303e52] p-6 rounded-lg  border border-[#B0B0B0] ">
            <div className="pb-3 mb-4 rounded-lg ">
              <h3 className="text-lg font-medium mb-3">Free Trial</h3>

              <div className="flex items-center justify-between mb-6">
                <label className="text-base font-medium text-gray-700 dark:text-gray-400">
                  Enable Free Trial
                </label>
                <div
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    formData.enableFreeTrial
                      ? "bg-blue-600"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                  onClick={() => handleToggleChange("enableFreeTrial")}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.enableFreeTrial
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </div>
              </div>

              <div>
                <Input
                  label="Trial Days"
                  type="number"
                  placeholder="e.g., 14"
                  fullWidth
                  requiredSign={formData.enableFreeTrial}
                  value={formData.trialDays || ""}
                  onChange={(e) => {
                    updateFormData({ trialDays: e.target.value });
                    setErrors((prev) => ({ ...prev, trialDays: "" }));
                  }}
                  disabled={!formData.enableFreeTrial}
                  className="h-12 dark:border-[#475569] "
                  error={errors.trialDays && `${errors.trialDays}`}
                />
              </div>
            </div>

            <h3 className="text-lg font-medium mb-3">Package Status</h3>

            <div className="mb-6">
              <Select
                label="Status"
                placeholder="Select status"
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "archived", label: "Archived" },
                ]}
                fullWidth
                requiredSign
                defaultValue={formData.status}
                onChange={(e) => {
                  updateFormData({ status: e.target.value });
                  setErrors((prev) => ({ ...prev, status: "" }));
                }}
                className="h-12 dark:border-[#475569] "
                error={errors.status && `${errors.status}`}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="text-base font-medium text-gray-700 dark:text-gray-400">
                Show Landing Page?
              </label>
              <div
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  formData.showLandingPage
                    ? "bg-blue-600"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
                onClick={() => handleToggleChange("showLandingPage")}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.showLandingPage ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-[#161F2D] dark:border-[#2d3a4d] backdrop-blur-sm p-4 rounded-lg border border-gray-200 shadow-lg z-10 mt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-md transition-colors"
            >
              <LuArrowLeft className="h-5 w-5" />
              Back
            </button>

            <button
              type="submit"
              className=" flex items-center justify-center gap-2 bg-primary hover:bg-[#005bd2] text-white py-3 px-4 rounded-md transition-colors text-sm font-normal"
            >
              Continue to Category & Features
              <LuArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
