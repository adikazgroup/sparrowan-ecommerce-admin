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
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/features/categories/categoriesApiSlice";
import { useGetDepartmentsIdNameQuery } from "@/features/departments/departmentsApiSlice";
import generateFormData from "@/utils/generateFormData";
import { cleanPayload } from "@/utils/cleanPayload";
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

export default function CategoryForm({ selectedCategory, isEdit, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    departmentId: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    status: "active",
    image: null,
  });

  const [existingImage, setExistingImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();

  // Get departments for dropdown
  const { data: departmentData } = useGetDepartmentsIdNameQuery();
  const departmentOptions =
    departmentData?.data?.map((d) => ({
      value: d.value,
      label: d.label,
    })) || [];

  useEffect(() => {
    if (isEdit && selectedCategory) {
      setFormData({
        name: selectedCategory.name || "",
        slug: selectedCategory.slug || "",
        departmentId:
          selectedCategory.departmentId?._id ||
          selectedCategory.departmentId ||
          "",
        description: selectedCategory.description || "",
        metaTitle: selectedCategory.metaTitle || "",
        metaDescription: selectedCategory.metaDescription || "",
        status: selectedCategory.status || "active",
        image: null,
      });
      setExistingImage(selectedCategory.image || null);
      setIsSlugManuallyEdited(true);
    }
  }, [isEdit, selectedCategory]);

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
        id: "image-format-error",
      });
      return;
    }

    if (file.size > maxSizeInBytes) {
      toast.error(`File size must be less than ${maxSize}MB`, {
        id: "image-size-error",
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      image: {
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      },
    }));
    setExistingImage(null);
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setExistingImage(null);
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

    if (!formData.departmentId) {
      newErrors.departmentId = "Department is required";
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

    // Image handling logic
    let imagePayload = undefined;
    let shouldRemoveImage = false;

    if (formData.image?.file) {
      if (existingImage) shouldRemoveImage = true;
    } else if (existingImage && !imageRemoved) {
      imagePayload = {
        url: existingImage.url,
        publicId: existingImage.publicId,
      };
    } else if (imageRemoved) {
      shouldRemoveImage = true;
    }

    const categoryData = cleanPayload({
      name: formData.name,
      slug: formData.slug,
      departmentId: formData.departmentId,
      description: formData.description,
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      status: formData.status,
      level: 0,
      image: imagePayload,
      removeImage: shouldRemoveImage || undefined,
    });

    const payload = { data: JSON.stringify(categoryData) };

    // Handle new image file upload
    if (formData.image?.file) {
      payload.image = formData.image.file;
    }

    const loadingToast = toast.loading(
      isEdit ? "Updating category..." : "Creating category...",
    );

    const formattedFormData = generateFormData(payload);

    const result = isEdit
      ? await updateCategory({
          id: selectedCategory._id,
          data: formattedFormData,
        })
      : await createCategory(formattedFormData);

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: isEdit ? "update-category" : "create-category",
      message: isEdit
        ? "Category updated successfully!"
        : "Category created successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      onClose();
    }
  };

  const isLoading = isCreating || isUpdating;
  const currentImage = formData.image || existingImage;

  return (
    <div className="">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            {/* Department Selection */}
            <div>
              <Select
                label="Department"
                options={departmentOptions}
                value={formData.departmentId}
                onValueChange={(value) =>
                  handleInputChange("departmentId", value)
                }
                fullWidth
                className="h-10"
                placeholder="Select department"
                requiredSign={true}
              />
              {errors.departmentId && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.departmentId}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Category Name"
                placeholder="Enter category name"
                value={formData.name}
                onValueChange={handleNameChange}
                fullWidth
                className="h-10"
                error={errors.name}
                requiredSign={true}
              />

              <Input
                label="Slug"
                placeholder="category-slug"
                value={formData.slug}
                onValueChange={handleSlugChange}
                fullWidth
                className="h-10"
                error={errors.slug}
                requiredSign={true}
                helperText="Auto-generated from name"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category Image
              </label>

              {currentImage ? (
                <div className="relative inline-block">
                  <img
                    src={formData.image?.url || existingImage?.url}
                    alt="Image Preview"
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
                      image
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
            </div>

            <Textarea
              label="Description"
              placeholder="Enter category description"
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
              {isLoading
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                  ? "Update Category"
                  : "Create Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
