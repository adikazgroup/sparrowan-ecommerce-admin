"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input/Input";
import { Select } from "@/components/ui/select/Select";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import {
  LuArrowLeft,
  LuChevronDown,
  LuChevronUp,
  LuPackage,
} from "react-icons/lu";
import { useGetCategoryFeatureListQuery } from "@/features/feature/featureApiSlice";
import { useCreatePackageMutation } from "@/features/package/packageApiSlice";
import { handleToast } from "@/utils/handleToast";
import CategoryFeatures from "./CategoryFeatures";

export default function ReviewSubmit({
  formData,
  updateFormData,
  onSubmit,
  onBack,
}) {
  const [errors, setErrors] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    packageInfo: true,
    pricingDuration: true,
    discountFreeTrial: true,
    categoryFeatures: true,
  });

  const [activeTab, setActiveTab] = useState(formData.category);

  // Category wise feature api call
  const { data, isLoading } = useGetCategoryFeatureListQuery();
  const categories = data?.data?.categories || [];
  const categoryFeatures = data?.data?.categoryFeatures || [];

  const toggleSection = (section) => {
    console.log("Toggling:", section);
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    if (!activeTab && categories.length > 0) {
      setActiveTab(categories[0]);
    }
  }, [categories, activeTab]);

  const handleCategoryChange = (category) => {
    setActiveTab(category);
    updateFormData({ category });
  };

  const handleFeatureToggle = (featureId, checked) => {
    const currentFeatures = formData.features || [];
    if (!checked) {
      updateFormData({
        features: currentFeatures.filter((id) => id !== featureId),
      });
    } else {
      updateFormData({
        features: [...currentFeatures, featureId],
      });
    }
  };

  const handleToggleChange = (field) => {
    updateFormData({ [field]: !formData[field] });
  };

  const handlePackageChange = (id, field, value) => {
    const updatedPackages = (formData.packages || []).map((pkg) =>
      pkg.id === id ? { ...pkg, [field]: value } : pkg,
    );
    updateFormData({ packages: updatedPackages });
  };

  const [createPackage, { isLoading: createPackageLoading }] =
    useCreatePackageMutation();

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    const newErrors = {};
    let isValid = true;

    // Package Info Validation
    if (!formData.packageName?.trim()) {
      newErrors.packageName = "Package name is required";
      isValid = false;
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    }

    if (!formData.packageType) {
      newErrors.packageType = "Package type is required";
      isValid = false;
    }

    // Pricing & Duration Validation
    (formData.packages || []).forEach((pkg) => {
      if (!pkg.billingCycle?.trim()) {
        newErrors[`billingCycle_${pkg.id}`] = "Billing cycle is required";
        isValid = false;
      }

      if (!pkg.duration?.trim()) {
        newErrors[`duration_${pkg.id}`] = "Duration is required";
        isValid = false;
      }

      if (!pkg.currency?.trim()) {
        newErrors[`currency_${pkg.id}`] = "Currency is required";
        isValid = false;
      }

      if (!pkg.price) {
        newErrors[`price_${pkg.id}`] = "Price is required";
        isValid = false;
      }

      if (!pkg.billingValue) {
        newErrors[`billingValue_${pkg.id}`] = "Billing value is required";
        isValid = false;
      }

      if (!pkg.durationValue) {
        newErrors[`durationValue_${pkg.id}`] = "Duration value is required";
        isValid = false;
      }
    });

    // Free Trial & Status Validation
    if (formData.enableFreeTrial) {
      if (!formData.trialDays) {
        newErrors.trialDays = "Trial days is required";
        isValid = false;
      }
    }

    if (!formData.status?.trim()) {
      newErrors.status = "Status is required";
      isValid = false;
    }

    setErrors(newErrors);

    // ✅ If valid, call submit
    if (isValid) {
      const pricingOptions = formData?.packages?.map((item) => ({
        billing: {
          cycleType: item.billingCycle,
          cycleValue: Number(item.billingValue),
        },
        duration: {
          unit: item.duration,
          value: Number(item.durationValue),
        },
        currency: item.currency,
        price: Number(item.price),
        discount: {
          type: item.discount,
          value: Number(item.discountValue),
        },
      }));

      const payload = {
        name: formData.packageName,
        description: formData.description,
        features: formData.features,
        pricingOptions: pricingOptions,
        trialPeriod: {
          enabled: formData.enableFreeTrial,
          days: Number(formData.trialDays),
        },
        packageType: formData.packageType,
        showLandingPage: formData.showLandingPage,
        status: formData.status,
      };

      const result = await createPackage(payload);

      if (result?.data?.success) {
        handleToast(result, "success");
        onSubmit();
      } else {
        handleToast(result, "error");
      }
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#010611] dark:to-[#01091a] p-6 rounded-lg mb-8">
        <h2 className="text-lg font-semibold mb-1 text-gray-800 dark:text-white">
          Review & Submit
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Review and edit your package details before submitting
        </p>
      </div>

      <form onSubmit={handleSubmitForm} className="space-y-6">
        {/* Package Information Section */}
        <div className="bg-white dark:bg-[#161F2D] dark:border-[#303e52] border border-[#B0B0B0] rounded-lg">
          <div
            className="flex flex-row items-center justify-between p-4 cursor-pointer bg-[#F6F6F6] dark:bg-[#161F2D] rounded-lg"
            onClick={() => toggleSection("packageInfo")}
          >
            <h3 className="text-lg font-medium">Package Information</h3>
            {expandedSections.packageInfo ? (
              <LuChevronUp className="h-5 w-5 text-blue-500" />
            ) : (
              <LuChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>

          {expandedSections.packageInfo && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Package Name"
                  type="text"
                  placeholder="Enter Package Name"
                  fullWidth
                  requiredSign
                  value={formData.packageName || ""}
                  onChange={(e) => {
                    updateFormData({ packageName: e.target.value });
                    setErrors((prev) => ({ ...prev, packageName: "" }));
                  }}
                  className="h-12 dark:border-[#303e52]"
                  error={errors.packageName && `${errors.packageName}`}
                />

                <Select
                  label="Package Type"
                  placeholder="Select your package"
                  options={[
                    { value: "individual", label: "Individual" },
                    { value: "business", label: "Business" },
                    { value: "custom", label: "Custom" },
                  ]}
                  fullWidth
                  className="h-12 dark:border-[#303e52]"
                  requiredSign
                  defaultValue={formData.packageType}
                  onChange={(e) => {
                    updateFormData({ packageType: e.target.value });
                    setErrors((prev) => ({ ...prev, packageType: "" }));
                  }}
                  error={errors.packageType && `${errors.packageType}`}
                />

                <div className="col-span-2">
                  <label className="block text-sm font-medium dark:font-normal text-gray-700 dark:text-gray-200 mb-1">
                    Description<span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    rows={4}
                    className={`w-full px-4 py-2 border text-sm ${
                      errors.description
                        ? "border-red-500"
                        : "border-gray-300 dark:border-[#303e52]"
                    } rounded-md focus:outline-none`}
                    placeholder="Enter Description"
                    value={formData.description || ""}
                    onChange={(e) => {
                      updateFormData({ description: e.target.value });
                      setErrors((prev) => ({ ...prev, description: "" }));
                    }}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Duration Section */}
        <div className="bg-white dark:bg-[#161F2D] dark:border-[#303e52]  border border-[#B0B0B0] rounded-lg">
          <div
            className="flex flex-row items-center justify-between p-4 cursor-pointer bg-[#F6F6F6] dark:bg-[#161F2D]  rounded-lg"
            onClick={() => toggleSection("pricingDuration")}
          >
            <h3 className="text-lg font-medium">Pricing & Duration</h3>
            {expandedSections.pricingDuration ? (
              <LuChevronUp className="h-5 w-5 text-blue-500" />
            ) : (
              <LuChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>

          {expandedSections.pricingDuration && (
            <div className="p-6">
              {(formData.packages || []).map((pkg, idx) => (
                <div
                  key={pkg.id}
                  className="mb-6 pb-6 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <LuPackage className="h-5 w-5 text-black dark:text-primary" />
                    <h4 className="text-base font-medium">Package {idx + 1}</h4>
                  </div>

                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Select
                          id={`billingCycle_${pkg.id}`}
                          label="Billing Cycle"
                          placeholder="Select billing cycle"
                          options={[
                            { value: "daily", label: "Daily" },
                            { value: "weekly", label: "Weekly" },
                            { value: "monthly", label: "Monthly" },
                            { value: "yearly", label: "Yearly" },
                            { value: "one_time", label: "One Time" },
                          ]}
                          fullWidth
                          requiredSign
                          defaultValue={pkg.billingCycle}
                          onChange={(e) => {
                            handlePackageChange(
                              pkg.id,
                              "billingCycle",
                              e.target.value,
                            );
                            setErrors((prev) => ({
                              ...prev,
                              [`billingCycle_${pkg.id}`]: "",
                            }));
                          }}
                          className="h-11 dark:border-[#475569]"
                          error={
                            errors[`billingCycle_${pkg.id}`] &&
                            `${errors[`billingCycle_${pkg.id}`]}`
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Input
                          id={`billingValue_${pkg.id}`}
                          label="Value"
                          type="number"
                          placeholder="Value"
                          fullWidth
                          requiredSign
                          value={pkg.billingValue}
                          onChange={(e) => {
                            handlePackageChange(
                              pkg.id,
                              "billingValue",
                              e.target.value,
                            );
                            setErrors((prev) => ({
                              ...prev,
                              [`billingValue_${pkg.id}`]: "",
                            }));
                          }}
                          className="h-11 dark:border-[#475569]"
                          error={
                            errors[`billingValue_${pkg.id}`] &&
                            `${errors[`billingValue_${pkg.id}`]}`
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Select
                          id={`duration_${pkg.id}`}
                          label="Duration"
                          placeholder="Select duration"
                          options={[
                            { value: "day", label: "Day" },
                            { value: "week", label: "Week" },
                            { value: "month", label: "Month" },
                            { value: "year", label: "Year" },
                            { value: "one_time", label: "One Time" },
                          ]}
                          fullWidth
                          requiredSign
                          defaultValue={pkg.duration}
                          onChange={(e) => {
                            handlePackageChange(
                              pkg.id,
                              "duration",
                              e.target.value,
                            );
                            setErrors((prev) => ({
                              ...prev,
                              [`duration_${pkg.id}`]: "",
                            }));
                          }}
                          className="h-11 dark:border-[#475569]"
                          error={
                            errors[`duration_${pkg.id}`] &&
                            `${errors[`duration_${pkg.id}`]}`
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Input
                          id={`durationValue_${pkg.id}`}
                          label="Value"
                          type="number"
                          placeholder="Value"
                          fullWidth
                          requiredSign
                          value={pkg.durationValue}
                          onChange={(e) => {
                            handlePackageChange(
                              pkg.id,
                              "durationValue",
                              e.target.value,
                            );
                            setErrors((prev) => ({
                              ...prev,
                              [`durationValue_${pkg.id}`]: "",
                            }));
                          }}
                          className="h-11 dark:border-[#475569]"
                          error={
                            errors[`durationValue_${pkg.id}`] &&
                            `${errors[`durationValue_${pkg.id}`]}`
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Select
                          id={`discount_${pkg.id}`}
                          label="Discount"
                          placeholder="Select discount type"
                          options={[
                            { value: "flat", label: "Flat" },
                            { value: "percentage", label: "Percentage" },
                          ]}
                          fullWidth
                          defaultValue={pkg.discount}
                          onChange={(e) => {
                            handlePackageChange(
                              pkg.id,
                              "discount",
                              e.target.value,
                            );
                            setErrors((prev) => ({
                              ...prev,
                              [`discount_${pkg.id}`]: "",
                            }));
                          }}
                          className="h-11 dark:border-[#475569]"
                          error={
                            errors[`discount_${pkg.id}`] &&
                            `${errors[`discount_${pkg.id}`]}`
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Input
                          id={`discountValue_${pkg.id}`}
                          label="Value"
                          type="number"
                          placeholder="Value"
                          fullWidth
                          value={pkg.discountValue}
                          onChange={(e) => {
                            handlePackageChange(
                              pkg.id,
                              "discountValue",
                              e.target.value,
                            );
                            setErrors((prev) => ({
                              ...prev,
                              [`discountValue_${pkg.id}`]: "",
                            }));
                          }}
                          className="h-11 dark:border-[#475569]"
                          error={
                            errors[`discountValue_${pkg.id}`] &&
                            `${errors[`discountValue_${pkg.id}`]}`
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Select
                          id={`currency_${pkg.id}`}
                          label="Currency"
                          placeholder="Select currency"
                          options={[{ value: "USD", label: "USD" }]}
                          fullWidth
                          className="h-11 dark:border-[#475569]"
                          requiredSign
                          defaultValue={pkg.currency}
                          onChange={(e) => {
                            handlePackageChange(
                              pkg.id,
                              "currency",
                              e.target.value,
                            );
                            setErrors((prev) => ({
                              ...prev,
                              [`currency_${pkg.id}`]: "",
                            }));
                          }}
                          error={
                            errors[`currency_${pkg.id}`] &&
                            `${errors[`currency_${pkg.id}`]}`
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          id={`price_${pkg.id}`}
                          label="Price"
                          type="number"
                          placeholder="Price"
                          fullWidth
                          requiredSign
                          value={pkg.price}
                          onChange={(e) => {
                            handlePackageChange(
                              pkg.id,
                              "price",
                              e.target.value,
                            );
                            setErrors((prev) => ({
                              ...prev,
                              [`price_${pkg.id}`]: "",
                            }));
                          }}
                          className="h-11 dark:border-[#475569]"
                          error={
                            errors[`price_${pkg.id}`] &&
                            `${errors[`price_${pkg.id}`]}`
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discount & Free Trial Section */}
        <div className="bg-white border border-[#B0B0B0] dark:bg-[#161F2D] dark:border-[#303e52]  rounded-lg">
          <div
            className="flex flex-row items-center justify-between px-4 py-4 cursor-pointer bg-[#F6F6F6] dark:bg-[#161F2D]  rounded-lg"
            onClick={() => toggleSection("discountFreeTrial")}
          >
            <h3 className="text-lg font-medium">Discount & Free Trial</h3>
            {expandedSections.discountFreeTrial ? (
              <LuChevronUp className="h-5 w-5 text-blue-500" />
            ) : (
              <LuChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>

          {expandedSections.discountFreeTrial && (
            <div className="px-6 pb-6">
              <div className="py-3 mb-4">
                <h4 className="text-lg font-medium mb-3">Free Trial</h4>

                <div className="flex items-center justify-between mb-6">
                  <label className="text-base font-medium text-gray-700 dark:text-gray-300">
                    Enable Free Trial
                  </label>
                  <div
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      formData.enableFreeTrial
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-800"
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

              <h4 className="text-lg font-medium mb-3">Package Status</h4>

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
                <label className="text-base font-medium text-gray-700 dark:text-gray-300">
                  Show Landing Page?
                </label>
                <div
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    formData.showLandingPage
                      ? "bg-blue-600"
                      : "bg-gray-200 dark:bg-gray-800"
                  }`}
                  onClick={() => handleToggleChange("showLandingPage")}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.showLandingPage
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <CategoryFeatures
          formData={formData}
          updateFormData={updateFormData}
          onlyBody={true}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          onNext={() => {}}
          onBack={() => {}}
        />

        <div className="bg-white/90  dark:bg-[#161F2D] dark:border-[#2d3a4d] backdrop-blur-sm p-4 rounded-lg border border-gray-200 shadow-lg z-10 mt-6">
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
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors text-sm font-normal ${
                createPackageLoading
                  ? "bg-primary/70 cursor-not-allowed"
                  : "bg-primary hover:bg-[#005bd2]"
              } text-white`}
              disabled={createPackageLoading}
            >
              {createPackageLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Package
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
