"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { toast } from "react-hot-toast";
import { Input } from "../ui/input/Input";
import { Button } from "../ui/button/Button";
import { Select } from "../ui/select/Select";
import { Calendar } from "../ui/calender/Calender";
import {
  useCreateTaxRuleMutation,
  useUpdateTaxRuleMutation,
} from "@/features/taxRules/taxRulesApiSlice";
import { useGetTaxCategoryListQuery } from "@/features/taxCategories/taxCategoriesApiSlice";
import { handleToast } from "@/utils/handleToast";
import { format } from "date-fns";

const typeOptions = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount" },
];

// Country options
const countryOptions = [
  { value: "bangladesh", label: "Bangladesh" },
  { value: "india", label: "India" },
  { value: "pakistan", label: "Pakistan" },
  { value: "usa", label: "United States" },
];

// State options based on country
const statesByCountry = {
  bangladesh: [
    { value: "dhaka", label: "Dhaka" },
    { value: "chittagong", label: "Chittagong" },
    { value: "sylhet", label: "Sylhet" },
    { value: "khulna", label: "Khulna" },
    { value: "rajshahi", label: "Rajshahi" },
    { value: "rangpur", label: "Rangpur" },
    { value: "barisal", label: "Barisal" },
    { value: "mymensingh", label: "Mymensingh" },
  ],
  india: [
    { value: "maharashtra", label: "Maharashtra" },
    { value: "delhi", label: "Delhi" },
    { value: "karnataka", label: "Karnataka" },
    { value: "tamil_nadu", label: "Tamil Nadu" },
    { value: "west_bengal", label: "West Bengal" },
    { value: "gujarat", label: "Gujarat" },
    { value: "rajasthan", label: "Rajasthan" },
    { value: "uttar_pradesh", label: "Uttar Pradesh" },
  ],
  pakistan: [
    { value: "punjab", label: "Punjab" },
    { value: "sindh", label: "Sindh" },
    { value: "kpk", label: "Khyber Pakhtunkhwa" },
    { value: "balochistan", label: "Balochistan" },
    { value: "islamabad", label: "Islamabad" },
  ],
  usa: [
    { value: "california", label: "California" },
    { value: "texas", label: "Texas" },
    { value: "florida", label: "Florida" },
    { value: "new_york", label: "New York" },
    { value: "illinois", label: "Illinois" },
    { value: "pennsylvania", label: "Pennsylvania" },
    { value: "ohio", label: "Ohio" },
    { value: "georgia", label: "Georgia" },
  ],
};

export default function TaxRuleForm({ selectedTaxRule, isEdit, onClose }) {
  const [formData, setFormData] = useState({
    taxCategoryId: "",
    country: "",
    state: "",
    type: "percentage",
    rate: "",
    effectiveFrom: null,
    effectiveTo: null,
  });

  const [errors, setErrors] = useState({});
  const [createTaxRule, { isLoading: isCreating }] = useCreateTaxRuleMutation();
  const [updateTaxRule, { isLoading: isUpdating }] = useUpdateTaxRuleMutation();

  // Get tax categories for dropdown
  const { data: taxCategoryData } = useGetTaxCategoryListQuery({ limit: 100 });
  const taxCategoryOptions =
    taxCategoryData?.data?.map((cat) => ({
      value: cat._id,
      label: cat.name,
    })) || [];

  // Get state options based on selected country
  const stateOptions = formData.country
    ? statesByCountry[formData.country] || []
    : [];

  useEffect(() => {
    if (isEdit && selectedTaxRule) {
      setFormData({
        taxCategoryId:
          selectedTaxRule.taxCategoryId?._id ||
          selectedTaxRule.taxCategoryId ||
          "",
        country: selectedTaxRule.country || "",
        state: selectedTaxRule.state || "",
        type: selectedTaxRule.type || "percentage",
        rate: selectedTaxRule.rate?.toString() || "",
        effectiveFrom: selectedTaxRule.effectiveFrom
          ? new Date(selectedTaxRule.effectiveFrom)
          : null,
        effectiveTo: selectedTaxRule.effectiveTo
          ? new Date(selectedTaxRule.effectiveTo)
          : null,
      });
    }
  }, [isEdit, selectedTaxRule]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear state when country changes
    if (field === "country") {
      setFormData((prev) => ({
        ...prev,
        country: value,
        state: "",
      }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.taxCategoryId) {
      newErrors.taxCategoryId = "Tax Category is required";
      isValid = false;
    }

    if (!formData.country) {
      newErrors.country = "Country is required";
      isValid = false;
    }

    if (!formData.state) {
      newErrors.state = "State is required";
      isValid = false;
    }

    if (
      !formData.rate ||
      isNaN(Number(formData.rate)) ||
      Number(formData.rate) < 0
    ) {
      newErrors.rate = "Valid rate is required";
      isValid = false;
    }

    if (!formData.effectiveFrom) {
      newErrors.effectiveFrom = "Effective from date is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const submitData = {
      ...formData,
      rate: Number(formData.rate),
      effectiveFrom: formData.effectiveFrom
        ? format(formData.effectiveFrom, "yyyy-MM-dd")
        : null,
      effectiveTo: formData.effectiveTo
        ? format(formData.effectiveTo, "yyyy-MM-dd")
        : null,
    };

    const loadingToast = toast.loading(
      isEdit ? "Updating tax rule..." : "Creating tax rule...",
    );

    const result = isEdit
      ? await updateTaxRule({ id: selectedTaxRule._id, data: submitData })
      : await createTaxRule(submitData);

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: isEdit ? "update-tax-rule" : "create-tax-rule",
      message: isEdit
        ? "Tax rule updated successfully!"
        : "Tax rule created successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      onClose();
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className="">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div>
              <Select
                label="Tax Category"
                options={taxCategoryOptions}
                value={formData.taxCategoryId}
                onValueChange={(value) =>
                  handleInputChange("taxCategoryId", value)
                }
                fullWidth
                className="h-10"
                placeholder="Select tax category"
                requiredSign={true}
              />
              {errors.taxCategoryId && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.taxCategoryId}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Select
                  label="Country"
                  options={countryOptions}
                  value={formData.country}
                  onValueChange={(value) => handleInputChange("country", value)}
                  fullWidth
                  className="h-10"
                  placeholder="Select country"
                  requiredSign={true}
                />
                {errors.country && (
                  <p className="text-xs text-red-500 mt-1">{errors.country}</p>
                )}
              </div>

              <div>
                <Select
                  label="State/Region"
                  options={stateOptions}
                  value={formData.state}
                  onValueChange={(value) => handleInputChange("state", value)}
                  fullWidth
                  className="h-10"
                  placeholder={
                    formData.country ? "Select state" : "Select country first"
                  }
                  disabled={!formData.country}
                  requiredSign={true}
                />
                {errors.state && (
                  <p className="text-xs text-red-500 mt-1">{errors.state}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Select
                label="Type"
                options={typeOptions}
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
                fullWidth
                className="h-10"
                requiredSign={true}
              />

              <Input
                label={
                  formData.type === "percentage" ? "Rate (%)" : "Rate (Amount)"
                }
                type="number"
                placeholder={
                  formData.type === "percentage" ? "e.g., 15" : "e.g., 100"
                }
                value={formData.rate}
                onValueChange={(value) => handleInputChange("rate", value)}
                fullWidth
                className="h-10"
                error={errors.rate}
                requiredSign={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Calendar
                label="Effective From"
                value={formData.effectiveFrom}
                onChange={(date) => handleInputChange("effectiveFrom", date)}
                fullWidth
                inputClass="h-10"
                error={errors.effectiveFrom}
                requiredSign={true}
                placeholder="Select start date"
              />

              <Calendar
                label="Effective To (Optional)"
                value={formData.effectiveTo}
                onChange={(date) => handleInputChange("effectiveTo", date)}
                fullWidth
                inputClass="h-10"
                placeholder="Select end date"
                minDate={formData.effectiveFrom}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              endIcon={<Icon icon="lucide:check" className="size-4" />}
            >
              {isEdit ? "Update" : "Create"} Tax Rule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
