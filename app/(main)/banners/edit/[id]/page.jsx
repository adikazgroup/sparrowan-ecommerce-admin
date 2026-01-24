"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  LuArrowLeft,
  LuSave,
  LuImage,
  LuX,
  LuSmartphone,
  LuLoader,
} from "react-icons/lu";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import {
  useGetSingleBannerQuery,
  useUpdateBannerMutation,
} from "@/features/banners/bannersApiSlice";
import generateFormData from "@/utils/generateFormData";
import { handleToast } from "@/utils/handleToast";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const displayOrderOptions = Array.from({ length: 20 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];

const getFileExtension = (filename) => {
  return filename?.split(".").pop()?.toLowerCase() || "";
};

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const bannerId = params?.id;

  const { data: bannerData, isLoading: isFetching } = useGetSingleBannerQuery(
    bannerId,
    {
      skip: !bannerId,
    },
  );
  const [updateBanner, { isLoading }] = useUpdateBannerMutation();

  const [formData, setFormData] = useState({
    title: "",
    link: "",
    displayOrder: 0,
    startDate: "",
    endDate: "",
    status: "active",
    image: null,
    mobileImage: null,
  });

  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState({ main: false, mobile: false });

  // Populate form when data loads
  useEffect(() => {
    if (bannerData?.data) {
      const banner = bannerData.data;
      setFormData({
        title: banner.title || "",
        link: banner.link || "",
        displayOrder: banner.displayOrder || 0,
        startDate: banner.startDate ? banner.startDate.split("T")[0] : "",
        endDate: banner.endDate ? banner.endDate.split("T")[0] : "",
        status: banner.status || "active",
        image: banner.image
          ? {
              url: banner.image.url,
              publicId: banner.image.publicId,
              isExisting: true,
            }
          : null,
        mobileImage: banner.mobileImage
          ? {
              url: banner.mobileImage.url,
              publicId: banner.mobileImage.publicId,
              isExisting: true,
            }
          : null,
      });
    }
  }, [bannerData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const processImageFile = (file, type) => {
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
      [type]: {
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        isNew: true,
      },
    }));
    if (errors[type]) {
      setErrors((prev) => ({ ...prev, [type]: "" }));
    }
  };

  const handleImageUpload = (e, type) => {
    processImageFile(e.target.files?.[0], type);
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setIsDragging((prev) => ({
      ...prev,
      [type === "image" ? "main" : "mobile"]: false,
    }));
    processImageFile(e.dataTransfer.files?.[0], type);
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    setIsDragging((prev) => ({
      ...prev,
      [type === "image" ? "main" : "mobile"]: true,
    }));
  };

  const handleDragLeave = (type) => {
    setIsDragging((prev) => ({
      ...prev,
      [type === "image" ? "main" : "mobile"]: false,
    }));
  };

  const removeImage = (type) => {
    setFormData((prev) => ({ ...prev, [type]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.image) newErrors.image = "Main image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const bannerPayload = {
      title: formData.title,
      link: formData.link || null,
      displayOrder: Number(formData.displayOrder) || 0,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      status: formData.status,
    };

    // If existing image not changed, include url and publicId
    if (formData.image?.isExisting) {
      bannerPayload.image = {
        url: formData.image.url,
        publicId: formData.image.publicId,
      };
    }

    if (formData.mobileImage?.isExisting) {
      bannerPayload.mobileImage = {
        url: formData.mobileImage.url,
        publicId: formData.mobileImage.publicId,
      };
    } else if (!formData.mobileImage) {
      bannerPayload.mobileImage = null;
    }

    const payload = { data: JSON.stringify(bannerPayload) };
    if (formData.image?.isNew && formData.image?.file)
      payload.image = formData.image.file;
    if (formData.mobileImage?.isNew && formData.mobileImage?.file)
      payload.mobileImage = formData.mobileImage.file;

    const loadingToast = toast.loading("Updating banner...");
    const result = await updateBanner({
      id: bannerId,
      data: generateFormData(payload),
    });

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-banner",
      message: "Banner updated successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      router.push("/banners");
    }
  };

  const ImageUploader = ({ type, label, image, icon: Icon }) => (
    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
      <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
        <Icon className="size-4" />
        {label}
      </h2>
      {image ? (
        <div className="relative group">
          <img
            src={image.url}
            alt={`${label} preview`}
            className={`w-full ${type === "mobileImage" ? "h-64" : "h-48"} object-cover rounded-lg border border-gray-200 dark:border-gray-700`}
          />
          <button
            type="button"
            onClick={() => removeImage(type)}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <LuX className="size-4" />
          </button>
          {image.name && (
            <p className="text-xs text-gray-500 mt-2 text-center truncate">
              {image.name}
            </p>
          )}
          {image.isExisting && (
            <p className="text-xs text-blue-500 mt-1 text-center">
              Current image
            </p>
          )}
        </div>
      ) : (
        <label
          onDrop={(e) => handleDrop(e, type)}
          onDragOver={(e) => handleDragOver(e, type)}
          onDragLeave={() => handleDragLeave(type)}
          className={`flex flex-col items-center justify-center ${type === "mobileImage" ? "h-64" : "h-48"} border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isDragging[type === "image" ? "main" : "mobile"]
              ? "border-primary bg-primary/5"
              : "border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Icon className="size-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
            Drag & drop or click to upload
          </p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (Max 5MB)</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, type)}
            className="hidden"
          />
        </label>
      )}
      {errors[type] && <p className="text-red-500 text-sm">{errors[type]}</p>}
    </div>
  );

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
            href="/banners"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LuArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Banner
            </h1>
            <p className="text-sm text-gray-500">Update banner details</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Banner Title"
                  placeholder="Enter banner title"
                  value={formData.title}
                  onValueChange={(val) => handleInputChange("title", val)}
                  error={errors.title}
                  requiredSign={true}
                />
                <Input
                  label="Link URL"
                  placeholder="https://example.com/promo"
                  value={formData.link}
                  onValueChange={(val) => handleInputChange("link", val)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Display Order
                  </label>
                  <Select
                    options={displayOrderOptions}
                    value={String(formData.displayOrder)}
                    onValueChange={(val) =>
                      handleInputChange("displayOrder", val)
                    }
                    placeholder="Select order"
                    className="w-full"
                  />
                </div>
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

            {/* Main Image */}
            <ImageUploader
              type="image"
              label="Main Banner Image (Desktop)"
              image={formData.image}
              icon={LuImage}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Status */}
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

            {/* Mobile Image */}
            <ImageUploader
              type="mobileImage"
              label="Mobile Banner Image (Optional)"
              image={formData.mobileImage}
              icon={LuSmartphone}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link href="/banners">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            <LuSave className="size-4" />
            {isLoading ? "Updating..." : "Update Banner"}
          </Button>
        </div>
      </form>
    </div>
  );
}
