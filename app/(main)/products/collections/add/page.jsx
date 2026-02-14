"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { LuArrowLeft, LuSave, LuImage, LuX } from "react-icons/lu";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { MultipleSearchSelect } from "@/components/ui/select/MultipleSearchSelect";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { useCreateProductCollectionMutation } from "@/features/products/productCollectionsApiSlice";
import { useGetProductsIdNameQuery } from "@/features/products/productsApiSlice";
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

export default function AddCollectionPage() {
  const router = useRouter();
  const [createCollection, { isLoading }] =
    useCreateProductCollectionMutation();
  const { data: productsData } = useGetProductsIdNameQuery();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    products: [],
    displayOrder: 0,
    image: null,
    startDate: "",
    endDate: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const generateSlug = (text) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/\\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
    if (!isSlugManuallyEdited && errors.slug)
      setErrors((prev) => ({ ...prev, slug: "" }));
  };

  const handleSlugChange = (value) => {
    setIsSlugManuallyEdited(true);
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
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (!formData.products || formData.products.length === 0) {
      newErrors.products = "At least one product is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const collectionData = cleanPayload({
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      products: formData.products,
      displayOrder: formData.displayOrder,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status,
    });

    const payload = { data: JSON.stringify(collectionData) };
    if (formData.image?.file) payload.image = formData.image.file;

    const loadingToast = toast.loading("Creating collection...");
    const result = await createCollection(generateFormData(payload));

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "create-collection",
      message: "Collection created successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      router.push("/products/collections");
    }
  };

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
              Add New Collection
            </h1>
            <p className="text-sm text-gray-500">
              Create a new product collection
            </p>
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
                  onValueChange={handleNameChange}
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

            {/* Products Selection */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Products
              </h2>
              <MultipleSearchSelect
                label="Select Products"
                options={productsData?.data || []}
                value={formData.products}
                onValueChange={(val) => handleInputChange("products", val)}
                error={errors.products}
                requiredSign={true}
                placeholder="Select products for this collection"
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
                  <p className="text-xs text-gray-500 mt-2 text-center truncate">
                    {formData.image.name}
                  </p>
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
            {isLoading ? "Creating..." : "Create Collection"}
          </Button>
        </div>
      </form>
    </div>
  );
}
