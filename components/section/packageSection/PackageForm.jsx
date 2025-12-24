"use client";
import { useEffect, useState } from "react";
import { LuPackage, LuPlus, LuTrash2 } from "react-icons/lu";
import { Input } from "@/components/ui/input/Input";
import { Select } from "@/components/ui/select/Select";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { useGetCategoryFeatureListQuery } from "@/features/feature/featureApiSlice";

export default function PackageForm({
  packageData,
  isEditing = false,
  onSubmit,
  editPackageLoading,
}) {
  const [formData, setFormData] = useState(packageData || {});
  const [errors, setErrors] = useState({});

  // Category wise feature api call
  const { data } = useGetCategoryFeatureListQuery();
  const categories = data?.data || [];

  console.log("categories", categories[0]?.category);
  const [activeTab, setActiveTab] = useState(categories[0]?.category);

  useEffect(() => {
    if (packageData) {
      setFormData(packageData);
      setActiveTab(categories[0]?.category);
    }
  }, [packageData]);

  // Handle form data changes
  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  // Handle package changes
  const handlePackageChange = (packageId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg) =>
        pkg.id === packageId ? { ...pkg, [field]: value } : pkg,
      ),
    }));
  };

  // Handle toggle changes
  const handleToggleChange = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleCategoryChange = (category) => {
    setActiveTab(category);
    updateFormData({ category });
  };

  // Handle feature toggle
  const handleFeatureToggle = (featureObj, checked) => {
    const category = activeTab;

    setFormData((prev) => {
      const currentFeatures = prev.features || [];
      const categoryIndex = currentFeatures.findIndex(
        (cat) => cat.category === category,
      );

      if (categoryIndex !== -1) {
        const existingCategory = currentFeatures[categoryIndex];
        const featureExists = existingCategory.features.some(
          (f) => f.id === featureObj.id,
        );

        let updatedCategoryFeatures;
        if (checked && !featureExists) {
          updatedCategoryFeatures = [...existingCategory.features, featureObj];
        } else if (!checked && featureExists) {
          updatedCategoryFeatures = existingCategory.features.filter(
            (f) => f.id !== featureObj.id,
          );
        } else {
          updatedCategoryFeatures = existingCategory.features;
        }

        const updatedCategory = {
          ...existingCategory,
          features: updatedCategoryFeatures,
        };

        const updatedFeatures = [...currentFeatures];
        updatedFeatures[categoryIndex] = updatedCategory;

        return {
          ...prev,
          features:
            updatedCategoryFeatures.length > 0
              ? updatedFeatures
              : updatedFeatures.filter((_, i) => i !== categoryIndex),
        };
      }
      if (checked) {
        return {
          ...prev,
          features: [
            ...currentFeatures,
            {
              category,
              features: [featureObj],
            },
          ],
        };
      }

      return prev;
    });
  };

  // Add a new package
  const handleAddPackage = () => {
    const newPackageId =
      formData.packages?.length > 0
        ? Math.max(...formData.packages.map((pkg) => pkg.id)) + 1
        : 1;

    const newPackage = {
      id: newPackageId,
      billingCycle: "",
      billingValue: "",
      duration: "",
      durationValue: "",
      discount: "",
      discountValue: "",
      currency: "USD",
      price: "",
    };

    setFormData((prev) => ({
      ...prev,
      packages: [...(prev.packages || []), newPackage],
    }));
  };

  // Delete a package
  const handleDeletePackage = (packageId) => {
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.filter((pkg) => pkg.id !== packageId),
    }));
  };

  // Handle form submission
  const handleSubmitForm = (e) => {
    e.preventDefault();

    // Validate form
    const newErrors = {};
    if (!formData.packageName)
      newErrors.packageName = "Package name is required";
    if (!formData.packageType)
      newErrors.packageType = "Package type is required";
    if (!formData.description)
      newErrors.description = "Description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call the onSubmit function passed from parent
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <div className="w-full space-y-6 max-w-3xl mx-auto">
      <form onSubmit={handleSubmitForm} className="space-y-6">
        {/* Package Information Section */}
        <div className="bg-white dark:bg-[#1e293b] dark:border-[#303e52] border border-[#B0B0B0] rounded-lg">
          <div className="flex flex-row items-center justify-between p-4  cursor-pointer bg-[#F6F6F6] dark:bg-[#161F2D] rounded-lg">
            <h3 className="text-lg font-medium">Package Information</h3>
          </div>

          <div className="p-6 ">
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
                readOnly={!isEditing}
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
                value={formData.packageType}
                defaultValue={formData.packageType}
                onChange={(e) => {
                  updateFormData({ packageType: e.target.value });
                  setErrors((prev) => ({ ...prev, packageType: "" }));
                }}
                error={errors.packageType && `${errors.packageType}`}
                disabled={!isEditing}
              />

              <div className="md:col-span-2">
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
                  readOnly={!isEditing}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Duration Section */}
        <div className="bg-white dark:bg-[#1e293b] dark:border-[#303e52] border border-[#B0B0B0] rounded-lg">
          <div className="flex flex-row items-center justify-between p-4 cursor-pointer bg-[#F6F6F6] dark:bg-[#161F2D] rounded-lg">
            <h3 className="text-lg font-medium">Pricing & Duration</h3>
          </div>

          <div className="p-6">
            {(formData.packages || []).map((pkg, idx) => (
              <div
                key={pkg.id}
                className="mb-6 pb-6 border-b border-gray-200 dark:border-[#475569] last:border-0 last:mb-0 last:pb-0"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <LuPackage className="h-5 w-5 text-black dark:text-primary" />
                    <h4 className="text-base font-medium">Package {idx + 1}</h4>
                  </div>

                  {isEditing && formData.packages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <LuTrash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>

                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* <div className="space-y-2">
                      <Input
                        label="Billing Cycle"
                        type="text"
                        placeholder="e.g., Monthly, Yearly"
                        fullWidth
                        requiredSign
                        value={pkg.billingCycle || ""}
                        onChange={(e) =>
                          handlePackageChange(
                            pkg.id,
                            "billingCycle",
                            e.target.value
                          )
                        }
                        className="h-12 dark:border-[#303e52]"
                        readOnly={!isEditing}
                      />
                    </div> */}

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
                        }}
                        disabled={!isEditing}
                        className="h-11 dark:border-[#475569]"
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
                        }}
                        className="h-11 dark:border-[#475569]"
                        disabled={!isEditing}
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
                        }}
                        className="h-11 dark:border-[#475569]"
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Input
                        label="Value"
                        type="text"
                        placeholder="Value"
                        fullWidth
                        value={pkg.durationValue || ""}
                        onChange={(e) =>
                          handlePackageChange(
                            pkg.id,
                            "durationValue",
                            e.target.value,
                          )
                        }
                        className="h-12 dark:border-[#303e52]"
                        readOnly={!isEditing}
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
                        }}
                        className="h-11 dark:border-[#475569]"
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        label="Value"
                        type="text"
                        placeholder="Value"
                        fullWidth
                        value={pkg.discountValue || ""}
                        onChange={(e) =>
                          handlePackageChange(
                            pkg.id,
                            "discountValue",
                            e.target.value,
                          )
                        }
                        className="h-12 dark:border-[#303e52]"
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Select
                        label="Currency"
                        placeholder="Select currency"
                        options={[
                          { value: "USD", label: "USD" },
                          { value: "EUR", label: "EUR" },
                          { value: "GBP", label: "GBP" },
                        ]}
                        fullWidth
                        className="h-12 dark:border-[#303e52]"
                        requiredSign
                        defaultValue={pkg.currency}
                        onChange={(e) =>
                          handlePackageChange(
                            pkg.id,
                            "currency",
                            e.target.value,
                          )
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        label="Price"
                        type="number"
                        placeholder="Price"
                        fullWidth
                        requiredSign
                        value={pkg.price || ""}
                        onChange={(e) =>
                          handlePackageChange(pkg.id, "price", e.target.value)
                        }
                        className="h-12 dark:border-[#303e52]"
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isEditing && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleAddPackage}
                  className="flex items-center gap-2 text-primary dark:text-blue-400 hover:text-primary-dark transition-colors"
                >
                  <LuPlus className="h-5 w-5" />
                  <span>Add New Package</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Discount & Free Trial Section */}
        <div className="bg-white border border-[#B0B0B0] dark:bg-[#1e293b] dark:border-[#303e52] rounded-lg">
          <div className="flex flex-row items-center justify-between p-4  cursor-pointer bg-[#F6F6F6] dark:bg-[#161F2D] rounded-lg">
            <h3 className="text-lg font-medium">Discount & Free Trial</h3>
          </div>

          <div className="p-6">
            <div className="py-3 my-4">
              <h4 className="text-lg font-medium mb-3">Free Trial</h4>

              <div className="flex items-center justify-between mb-6">
                <label className="text-base font-medium text-gray-700 dark:text-gray-300">
                  Enable Free Trial
                </label>
                <div
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    !isEditing
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer"
                  } ${formData.enableFreeTrial ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-800"}`}
                  onClick={() =>
                    isEditing && handleToggleChange("enableFreeTrial")
                  }
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
                  onChange={(e) =>
                    updateFormData({ trialDays: e.target.value })
                  }
                  disabled={!formData.enableFreeTrial || !isEditing}
                  className="h-12 dark:border-[#303e52]"
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
                value={formData.status || ""}
                defaultValue={formData.status}
                onChange={(e) => updateFormData({ status: e.target.value })}
                className="h-12 dark:border-[#303e52]"
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="text-base font-medium text-gray-700 dark:text-gray-300">
                Show Landing Page?
              </label>
              <div
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  !isEditing
                    ? "cursor-not-allowed opacity-70"
                    : "cursor-pointer"
                } ${formData.showLandingPage ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}
                onClick={() =>
                  isEditing && handleToggleChange("showLandingPage")
                }
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

        {/* Category & Features Section */}
        <div className="bg-white border border-[#B0B0B0] dark:bg-[#1e293b] dark:border-[#303e52] rounded-lg">
          <div className="flex flex-row items-center justify-between p-4  cursor-pointer bg-[#F6F6F6] dark:bg-[#161F2D] rounded-lg">
            <h3 className="text-lg font-medium">Category & Features</h3>
          </div>

          <div>
            <div
              className={`space-y-6  p-5 rounded-lg ${!isEditing ? "cursor-not-allowed " : ""}`}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Category
                </label>

                <div className="flex flex-wrap gap-3 pb-2 mb-2">
                  {categories.map((catObj) => (
                    <button
                      key={catObj.category}
                      type="button"
                      className={`px-4 py-2 text-sm whitespace-nowrap rounded mr-2 border ${
                        activeTab === catObj.category
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-transparent text-gray-700 dark:text-gray-300 border-gray-400 hover:border-gray-200"
                      } `}
                      onClick={() => handleCategoryChange(catObj.category)}
                    >
                      {catObj.category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Select Features
                </label>

                <div className="space-y-5">
                  {categories
                    .find((cat) => cat.category === activeTab)
                    ?.features.map((feature) => {
                      const selectedCategory = formData.features?.find(
                        (cat) => cat.category === activeTab,
                      );

                      const isChecked = selectedCategory?.features?.some(
                        (f) => f.id === feature.id,
                      );

                      return (
                        <div key={feature.id} className={`flex items-center`}>
                          <Checkbox
                            label={
                              feature?.value
                                ? `${feature?.value} ${feature?.label}`
                                : `${feature?.label}`
                            }
                            size="xs"
                            checked={isChecked || false}
                            onValueChange={(checked) =>
                              isEditing && handleFeatureToggle(feature, checked)
                            }
                          />
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="bg-white/90 dark:bg-[#161F2D] dark:border-[#2d3a4d] backdrop-blur-sm p-4 rounded-lg border border-gray-200 shadow-lg z-10 mt-6 flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-primary hover:bg-[#005bd2] text-white py-3 px-4 rounded-md transition-colors text-sm font-normal"
              disabled={editPackageLoading}
            >
              {editPackageLoading ? "Loading..." : "Save Changes"}
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
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
