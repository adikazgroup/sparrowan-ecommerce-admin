"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { LuArrowLeft, LuSave, LuImage, LuX, LuLoader } from "react-icons/lu";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea/Textarea";
import {
  useGetSingleProductCollectionQuery,
  useUpdateProductCollectionMutation,
} from "@/features/products/productCollectionsApiSlice";
import generateFormData from "@/utils/generateFormData";
import { handleToast } from "@/utils/handleToast";
import { cleanPayload } from "@/utils/cleanPayload";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const displayOrderOptions = Array.from({ length: 50 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}`,
}));

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];

const getFileExtension = (filename) => {
  return filename?.split(".").pop()?.toLowerCase() || "";
};

export default function EditCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params?.id;

  const { data: collectionData, isLoading: isFetching } =
    useGetSingleProductCollectionQuery(collectionId, { skip: !collectionId });
  const [updateCollection, { isLoading }] =
    useUpdateProductCollectionMutation();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    displayOrder: 0,
    image: null,
    startDate: "",
    endDate: "",
    status: "active",
  });

  const [existingImage, setExistingImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (collectionData?.data) {
      const collection = collectionData.data;
      setFormData({
        name: collection.name || "",
        slug: collection.slug || "",
        description: collection.description || "",
        displayOrder: collection.displayOrder || 0,
        image: collection.image
          ? {
              url: collection.image.url,
              publicId: collection.image.publicId,
            }
          : null,
        startDate: collection.startDate
          ? new Date(collection.startDate).toISOString().split("T")[0]
          : "",
        endDate: collection.endDate
          ? new Date(collection.endDate).toISOString().split("T")[0]
          : "",
        status: collection.status || "active",
      });
      setExistingImage(collection.image || null);
    }
  }, [collectionData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const generateSlug = (text) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/\\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSlugChange = (value) => {
    setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: "" }));
  };

  const processImageFile = (file) => {
    if (!file) return;

    const ext = getFileExtension(file.name);
    const maxSize = 5 * 1024 * 1024;

    if (!IMAGE_FORMATS.includes(ext)) {
      toast.error("Only JPG, JPEG, PNG, WebP formats allowed");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      image: {
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        isNew: true,
      },
    }));
  };

  const handleImageUpload = (e) => {
    processImageFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processImageFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

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

    const collectionPayload = cleanPayload({
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      displayOrder: formData.displayOrder,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
    });

    // Handle image: new upload, keep existing, or delete
    if (formData.image?.file) {
      // New upload - file sent via FormData
    } else if (existingImage) {
      collectionPayload.image = existingImage;
    } else {
      collectionPayload.image = { url: "", publicId: "" };
    }

    const payload = { data: JSON.stringify(collectionPayload) };
    if (formData.image?.file) {
      payload.image = formData.image.file;
    }

    const loadingToast = toast.loading("Updating collection...");
    const result = await updateCollection({
      id: collectionId,
      data: generateFormData(payload),
    });

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-collection",
      message: "Collection updated successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      router.push("/products/collections");
    }
  };

  if (isFetching) {
    return (
      <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl flex items-center justify-center">
        <LuLoader className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/products/collections"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LuArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Collection
            </h1>
            <p className="text-sm text-gray-500">Update collection details</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Collection Name"
                  placeholder="Enter collection name"
                  value={formData.name}
                  onValueChange={(val) => handleInputChange("name", val)}
                  error={errors.name}
                  requiredSign={true}
                />
                <Input
                  label="Slug"
                  placeholder="collection-slug"
                  value={formData.slug}
                  onValueChange={handleSlugChange}
                  error={errors.slug}
                  requiredSign={true}
                />
              </div>
              <Textarea
                label="Description"
                placeholder="Enter collection description"
                value={formData.description}
                onValueChange={(val) => handleInputChange("description", val)}
                rows={4}
              />
            </div>

            {/* Settings */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Display Order"
                  options={displayOrderOptions}
                  value={formData.displayOrder}
                  onValueChange={(val) =>
                    handleInputChange("displayOrder", val)
                  }
                  className="w-full"
                />
                <Select
                  label="Status"
                  options={statusOptions}
                  value={formData.status}
                  onValueChange={(val) => handleInputChange("status", val)}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onValueChange={(val) => handleInputChange("startDate", val)}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onValueChange={(val) => handleInputChange("endDate", val)}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Collection Image */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                <LuImage className="size-4" />
                Collection Image
              </h2>
              {formData.image ? (
                <div className="relative group">
                  <img
                    src={formData.image.url}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <LuX className="size-4" />
                  </button>
                  {formData.image.name && (
                    <p className="text-xs text-gray-500 mt-2 text-center truncate">
                      {formData.image.name}
                    </p>
                  )}
                  {formData.image.isExisting && (
                    <p className="text-xs text-blue-500 mt-1 text-center">
                      Current image
                    </p>
                  )}
                </div>
              ) : (
                <label
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <LuImage className="size-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Drag & drop or click to upload
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, WebP (Max 5MB)
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
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link href="/products/collections">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading} loading={isLoading}>
            <LuSave className="size-4" />
            {isLoading ? "Updating..." : "Update Collection"}
          </Button>
        </div>
      </form>
    </div>
  );
}
