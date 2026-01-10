"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { toast } from "react-hot-toast";
import { Input } from "../ui/input/Input";
import { Button } from "../ui/button/Button";
import { Textarea } from "../ui/textarea/Textarea";
import {
  useCreateTaxCategoryMutation,
  useUpdateTaxCategoryMutation,
} from "@/features/taxCategories/taxCategoriesApiSlice";

export default function TaxCategoryForm({
  selectedTaxCategory,
  isEdit,
  onClose,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [createTaxCategory, { isLoading: isCreating }] =
    useCreateTaxCategoryMutation();
  const [updateTaxCategory, { isLoading: isUpdating }] =
    useUpdateTaxCategoryMutation();

  useEffect(() => {
    if (isEdit && selectedTaxCategory) {
      setFormData({
        name: selectedTaxCategory.name || "",
        description: selectedTaxCategory.description || "",
      });
    }
  }, [isEdit, selectedTaxCategory]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
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

    const loadingToast = toast.loading(isEdit ? "Updating..." : "Creating...");
    try {
      if (isEdit) {
        await updateTaxCategory({
          id: selectedTaxCategory._id,
          data: formData,
        }).unwrap();
        toast.dismiss(loadingToast);
        toast.success("Tax Category updated successfully!");
      } else {
        await createTaxCategory(formData).unwrap();
        toast.dismiss(loadingToast);
        toast.success("Tax Category created successfully!");
      }
      onClose();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        error?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} tax category.`,
      );
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className="">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <Input
              label="Tax Category Name"
              placeholder="e.g., Standard Tax, Reduced Tax"
              value={formData.name}
              onValueChange={(value) => handleInputChange("name", value)}
              fullWidth
              className="h-10"
              error={errors.name}
              requiredSign={true}
            />

            <Textarea
              label="Description"
              placeholder="Enter tax category description"
              value={formData.description}
              onValueChange={(value) => handleInputChange("description", value)}
              rows={3}
            />
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
              {isEdit ? "Update" : "Create"} Tax Category
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
