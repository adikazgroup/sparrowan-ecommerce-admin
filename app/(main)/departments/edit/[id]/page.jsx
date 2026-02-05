"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { LuArrowLeft, LuSave, LuX, LuImage, LuLoader } from "react-icons/lu";
import Link from "next/link";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea/Textarea";
import {
  useGetSingleDepartmentQuery,
  useUpdateDepartmentMutation,
} from "@/features/departments/departmentsApiSlice";
import { useGetTaxCategoriesIdNameQuery } from "@/features/taxCategories/taxCategoriesApiSlice";
import generateFormData from "@/utils/generateFormData";
import { handleToast } from "@/utils/handleToast";
import { cleanPayload } from "@/utils/cleanPayload";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];

const getFileExtension = (filename) => {
  return filename?.split(".").pop()?.toLowerCase() || "";
};

export default function EditDepartmentPage() {
  const router = useRouter();
  const params = useParams();
  const departmentId = params.id;

  const {
    data: departmentData,
    isLoading: isFetching,
    isError,
  } = useGetSingleDepartmentQuery(departmentId);
  const [updateDepartment, { isLoading: isUpdating }] =
    useUpdateDepartmentMutation();
  const { data: taxCategoriesData } = useGetTaxCategoriesIdNameQuery();

  const taxCategoryOptions = [
    { value: "", label: "No Tax Category" },
    ...(taxCategoriesData?.data?.map((t) => ({
      value: t.value,
      label: t.label,
    })) || []),
  ];

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    taxCategory: "",
    metaTitle: "",
    metaDescription: "",
    status: "active",
    image: null,
  });

  const [existingImage, setExistingImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (departmentData?.data) {
      const dept = departmentData.data;
      setFormData({
        name: dept.name || "",
        slug: dept.slug || "",
        description: dept.description || "",
        taxCategory: dept.taxCategory || "",
        metaTitle: dept.metaTitle || "",
        metaDescription: dept.metaDescription || "",
        status: dept.status || "active",
        image: null,
      });
      setExistingImage(dept.image || null);
    }
  }, [departmentData]);

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
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleNameChange = (value) => {
    setFormData((prev) => {
      const newState = { ...prev, name: value };
      if (!isSlugManuallyEdited) newState.slug = generateSlug(value);
      return newState;
    });
    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
  };

  const handleSlugChange = (value) => {
    setIsSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: "" }));
  };

  const processImageFile = (file) => {
    if (!file) return;
    const ext = getFileExtension(file.name);
    const maxSize = 2 * 1024 * 1024;

    if (!IMAGE_FORMATS.includes(ext)) {
      toast.error("Only JPG, JPEG, PNG, WebP formats allowed");
      return;
    }
    if (file.size > maxSize) {
      toast.error("File size must be less than 2MB");
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
  };

  const handleImageUpload = (e) => processImageFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processImageFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setExistingImage(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const deptPayload = cleanPayload({
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      taxCategory: formData.taxCategory,
      metaTitle: formData.metaTitle,
      metaDescription: formData.metaDescription,
      status: formData.status,
    });

    // Handle image: new upload, keep existing, or delete
    if (formData.image?.file) {
      // New upload - file sent via FormData
    } else if (existingImage) {
      deptPayload.image = existingImage;
    } else {
      deptPayload.image = { url: "", publicId: "" };
    }

    const payload = { data: JSON.stringify(deptPayload) };
    if (formData.image?.file) payload.image = formData.image.file;

    const loadingToast = toast.loading("Updating department...");
    const result = await updateDepartment({
      id: departmentId,
      data: generateFormData(payload),
    });

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-department",
      message: "Department updated successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      router.push("/departments");
    }
  };

  if (isFetching) {
    return (
      <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl flex items-center justify-center">
        <LuLoader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl">
        <div className="text-center py-10">
          <p className="text-red-500">Failed to load department data</p>
          <Link href="/departments">
            <Button variant="outline" className="mt-4">
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentImage = formData.image?.url || existingImage?.url;

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/departments"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LuArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Department
            </h1>
            <p className="text-sm text-gray-500">
              Update department information
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Department Name"
                  placeholder="Enter department name"
                  value={formData.name}
                  onValueChange={handleNameChange}
                  error={errors.name}
                  requiredSign={true}
                />
                <Input
                  label="Slug"
                  placeholder="department-slug"
                  value={formData.slug}
                  onValueChange={handleSlugChange}
                  error={errors.slug}
                  requiredSign={true}
                />
              </div>
              <Textarea
                label="Description"
                placeholder="Enter department description..."
                value={formData.description}
                onValueChange={(val) => handleInputChange("description", val)}
                rows={3}
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Tax Settings
              </h2>
              <Select
                label="Tax Category"
                options={taxCategoryOptions}
                value={formData.taxCategory}
                onValueChange={(val) => handleInputChange("taxCategory", val)}
                placeholder="Select Tax Category (Optional)"
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                SEO Information
              </h2>
              <Input
                label="Meta Title"
                placeholder="SEO meta title"
                value={formData.metaTitle}
                onValueChange={(val) => handleInputChange("metaTitle", val)}
              />
              <Textarea
                label="Meta Description"
                placeholder="SEO meta description..."
                value={formData.metaDescription}
                onValueChange={(val) =>
                  handleInputChange("metaDescription", val)
                }
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Department Image
              </h2>
              {currentImage ? (
                <div className="relative group">
                  <img
                    src={currentImage}
                    alt="Image preview"
                    className="w-full h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <LuX className="size-4" />
                  </button>
                </div>
              ) : (
                <label
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                >
                  <LuImage className="size-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, WebP (Max 2MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

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
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link href="/departments">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isUpdating}>
            <LuSave className="size-4" />
            {isUpdating ? "Updating..." : "Update Department"}
          </Button>
        </div>
      </form>
    </div>
  );
}
