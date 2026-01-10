"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { toast } from "react-hot-toast";
import { LuX } from "react-icons/lu";
import { Input } from "../ui/input/Input";
import { Button } from "../ui/button/Button";
import { Select } from "../ui/select/Select";
import { Textarea } from "../ui/textarea/Textarea";
import {
  useCreateBrandMutation,
  useUpdateBrandMutation,
} from "@/features/brands/brandsApiSlice";
import generateFormData from "@/utils/generateFormData";
import { handleToast } from "@/utils/handleToast";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

// Allowed formats
const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];

const getFileExtension = (filename) => {
  return filename?.split(".").pop()?.toLowerCase() || "";
};

export default function BrandForm({ selectedBrand, isEdit, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    status: "active",
    logo: null,
  });

  const [existingLogo, setExistingLogo] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation();

  useEffect(() => {
    if (isEdit && selectedBrand) {
      setFormData({
        name: selectedBrand.name || "",
        slug: selectedBrand.slug || "",
        description: selectedBrand.description || "",
        metaTitle: selectedBrand.metaTitle || "",
        metaDescription: selectedBrand.metaDescription || "",
        status: selectedBrand.status || "active",
        logo: null,
      });
      setExistingLogo(selectedBrand.logo || null);
      setIsSlugManuallyEdited(true);
    }
  }, [isEdit, selectedBrand]);

  const generateSlug = (text) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleNameChange = (value) => {
    setFormData((prev) => {
      const newState = { ...prev, name: value };
      if (!isSlugManuallyEdited) {
        newState.slug = generateSlug(value);
      }
      return newState;
    });
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
    if (!isSlugManuallyEdited && errors.slug) {
      setErrors((prev) => ({ ...prev, slug: "" }));
    }
  };

  const handleSlugChange = (value) => {
    setIsSlugManuallyEdited(true);
    const sanitizedSlug = generateSlug(value);
    setFormData((prev) => ({ ...prev, slug: sanitizedSlug }));
    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: "" }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = getFileExtension(file.name);
    const maxSize = 2;
    const maxSizeInBytes = maxSize * 1024 * 1024;

    if (!IMAGE_FORMATS.includes(ext)) {
      toast.error(`Only JPG, JPEG, PNG, WebP formats allowed`, {
        id: "logo-format-error",
      });
      return;
    }

    if (file.size > maxSizeInBytes) {
      toast.error(`File size must be less than ${maxSize}MB`, {
        id: "logo-size-error",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      logo: {
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      },
    }));
    setExistingLogo(null);
    setErrors((prev) => ({ ...prev, logo: "" }));
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, logo: null }));
    setExistingLogo(null);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
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

    const brandData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      metaTitle: formData.metaTitle || null,
      metaDescription: formData.metaDescription || null,
      status: formData.status,
    };

    const payload = { data: JSON.stringify(brandData) };

    if (formData.logo?.file) {
      payload.logo = formData.logo.file;
    }

    const loadingToast = toast.loading(
      isEdit ? "Updating brand..." : "Creating brand...",
    );

    const formattedFormData = generateFormData(payload);

    const result = isEdit
      ? await updateBrand({ id: selectedBrand._id, data: formattedFormData })
      : await createBrand(formattedFormData);

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: isEdit ? "update-brand" : "create-brand",
      message: isEdit
        ? "Brand updated successfully!"
        : "Brand created successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      onClose();
    }
  };

  const isLoading = isCreating || isUpdating;
  const currentLogo = formData.logo || existingLogo;

  return (
    <div className="">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Brand Name"
                placeholder="Enter brand name"
                value={formData.name}
                onValueChange={handleNameChange}
                fullWidth
                className="h-10"
                error={errors.name}
                requiredSign={true}
              />

              <Input
                label="Slug"
                placeholder="brand-slug"
                value={formData.slug}
                onValueChange={handleSlugChange}
                fullWidth
                className="h-10"
                error={errors.slug}
                requiredSign={true}
                helperText="Auto-generated from name"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand Logo
              </label>

              {currentLogo ? (
                <div className="relative inline-block">
                  <img
                    src={formData.logo?.url || existingLogo?.url}
                    alt="Logo Preview"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <LuX className="size-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full max-w-xs h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Icon
                      icon="lucide:image-plus"
                      className="size-8 text-gray-400 mb-2"
                    />
                    <p className="text-sm text-gray-500">
                      <span className="text-primary font-medium">
                        Click to upload
                      </span>{" "}
                      logo
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, WebP (Max 2MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
              {errors.logo && (
                <p className="text-xs text-red-500 mt-1.5">{errors.logo}</p>
              )}
            </div>

            <Textarea
              label="Description"
              placeholder="Enter brand description"
              value={formData.description}
              onValueChange={(value) => handleInputChange("description", value)}
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Meta Title"
                placeholder="SEO title"
                value={formData.metaTitle}
                onValueChange={(value) => handleInputChange("metaTitle", value)}
                fullWidth
                className="h-10"
              />

              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
                fullWidth
                className="h-10"
              />
            </div>

            <Textarea
              label="Meta Description"
              placeholder="SEO description"
              value={formData.metaDescription}
              onValueChange={(value) =>
                handleInputChange("metaDescription", value)
              }
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              startIcon={<LuX className="size-4" />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              endIcon={<Icon icon="lucide:check" className="size-4" />}
            >
              {isEdit ? "Update" : "Create"} Brand
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
