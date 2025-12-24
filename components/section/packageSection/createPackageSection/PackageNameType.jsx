"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input/Input";
import { Select } from "@/components/ui/select/Select";

export default function PackageNameType({ formData, updateFormData, onNext }) {
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("formData", formData);
    // Validation
    const newErrors = {};
    if (!formData.packageName)
      newErrors.packageName = "Package name is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.packageType)
      newErrors.packageType = "Package type is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  const packageTypeData = [
    { value: "individual", label: "Individual" },
    { value: "business", label: "Business" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <div className="bg-white  dark:bg-[#161F2D] dark:border-[#303e52] border border-[#B0B0B0] rounded-xl p-6">
      <h2 className="text-xl font-medium mb-6">Package name and type</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid sm:grid-cols-2 gap-7 ">
          <Input
            label="Package Name"
            type="text"
            placeholder="Enter Package Name"
            fullWidth
            requiredSign
            onChange={(e) => {
              updateFormData({ packageName: e.target.value });
              setErrors((prev) => ({ ...prev, packageName: "" }));
            }}
            className="h-11 dark:border-[#475569]"
            error={errors.packageName && `${errors.packageName}`}
          />

          <Select
            label="Package Type"
            placeholder="Select your package"
            options={packageTypeData}
            fullWidth
            className="h-11 dark:border-[#475569]"
            requiredSign
            defaultValue={formData?.packageType}
            onChange={(e) => {
              updateFormData({ packageType: e.target.value });
              setErrors((prev) => ({ ...prev, packageType: "" }));
            }}
            error={errors.packageType && `${errors.packageType}`}
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description<span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              type="text"
              rows={4}
              className={`w-full px-4 py-2 border text-sm   ${errors.description ? "border-red-500" : "border-gray-300 dark:border-[#475569]"} rounded-md focus:outline-none`}
              placeholder="Enter Description"
              value={formData.description}
              onChange={(e) => {
                updateFormData({ description: e.target.value });
                setErrors((prev) => ({ ...prev, description: "" }));
              }}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description}</p>
            )}
          </div>
        </div>

        <div className="sm:mt-10 mt-5">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-[#005bd2] text-white py-3 px-4 rounded-md transition-colors text-sm font-normal"
          >
            <ArrowRight className="h-5 w-5" />
            Continue to Category & Features
          </button>
        </div>
      </form>
    </div>
  );
}
