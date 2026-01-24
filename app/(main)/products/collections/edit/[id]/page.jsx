"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { LuArrowLeft, LuSave } from "react-icons/lu";
import Link from "next/link";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea/Textarea";
import {
  useGetSingleProductCollectionQuery,
  useUpdateProductCollectionMutation,
} from "@/features/products/productCollectionsApiSlice";
import { handleToast } from "@/utils/handleToast";
import { statusOptions } from "@/utils/DataHelper";
import { PageSkeleton } from "@/components/skeleton/PageSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";

export default function EditProductCollectionPage() {
  const router = useRouter();
  const { id } = useParams();
  const {
    data,
    isLoading: isFetching,
    isError,
  } = useGetSingleProductCollectionQuery(id);
  const [updateCollection, { isLoading }] =
    useUpdateProductCollectionMutation();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    displayOrder: 0,
    icon: "",
    isActive: true,
    startDate: "",
    endDate: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (data?.data) {
      const collection = data.data;
      setFormData({
        name: collection.name || "",
        slug: collection.slug || "",
        description: collection.description || "",
        displayOrder: collection.displayOrder || 0,
        icon: collection.icon || "",
        isActive: collection.isActive ?? true,
        startDate: collection.startDate
          ? new Date(collection.startDate).toISOString().split("T")[0]
          : "",
        endDate: collection.endDate
          ? new Date(collection.endDate).toISOString().split("T")[0]
          : "",
        status: collection.status || "active",
      });
    }
  }, [data]);

  const generateSlug = (text) =>
    text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSlugChange = (value) => {
    setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
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
      toast.error("Please fix errors");
      return;
    }

    const payload = {
      ...formData,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
    };

    const loadingToast = toast.loading("Updating collection...");
    const result = await updateCollection({ id, data: payload });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-collection",
      message: "Collection updated!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) router.push("/products/collections");
  };

  if (isFetching) return <PageSkeleton />;
  if (isError) return <ErrorBoundaryFetcher />;

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
        <Link
          href="/products/collections"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Collection Name"
                  placeholder="Summer Sale"
                  value={formData.name}
                  onValueChange={(val) => handleInputChange("name", val)}
                  error={errors.name}
                  requiredSign={true}
                />
                <Input
                  label="Slug"
                  placeholder="summer-sale"
                  value={formData.slug}
                  onValueChange={handleSlugChange}
                  error={errors.slug}
                  requiredSign={true}
                />
              </div>
              <Textarea
                label="Description"
                placeholder="Collection description..."
                value={formData.description}
                onValueChange={(val) => handleInputChange("description", val)}
                rows={3}
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Schedule (Optional)
              </h2>
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

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Settings
              </h2>
              <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    handleInputChange("isActive", e.target.checked)
                  }
                  className="w-4 h-4 text-primary"
                />
                <div>
                  <p className="font-medium text-gray-800 dark:text-white text-sm">
                    Active
                  </p>
                  <p className="text-xs text-gray-500">Show in storefront</p>
                </div>
              </label>
              <Input
                label="Display Order"
                type="number"
                placeholder="0"
                value={formData.displayOrder}
                onValueChange={(val) =>
                  handleInputChange("displayOrder", parseInt(val) || 0)
                }
              />
              <Input
                label="Icon (Iconify ID)"
                placeholder="hugeicons:folder-open"
                value={formData.icon}
                onValueChange={(val) => handleInputChange("icon", val)}
              />
              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onValueChange={(val) => handleInputChange("status", val)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link href="/products/collections">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            <LuSave className="size-4" />
            {isLoading ? "Updating..." : "Update Collection"}
          </Button>
        </div>
      </form>
    </div>
  );
}
