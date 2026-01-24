"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { LuArrowLeft, LuSave, LuImage, LuX } from "react-icons/lu";
import Link from "next/link";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import {
  useGetSingleProductVariantQuery,
  useUpdateProductVariantMutation,
} from "@/features/products/productVariantsApiSlice";
import { useGetProductsIdNameQuery } from "@/features/products/productsApiSlice";
import { handleToast } from "@/utils/handleToast";
import { PageSkeleton } from "@/components/skeleton/PageSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import { discountTypeOptions } from "@/utils/DataHelper";
import generateFormData from "@/utils/generateFormData";

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];
const getFileExtension = (filename) =>
  filename?.split(".").pop()?.toLowerCase() || "";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "out_of_stock", label: "Out of Stock" },
];

export default function EditProductVariantPage() {
  const router = useRouter();
  const { id } = useParams();
  const {
    data,
    isLoading: isFetching,
    isError,
  } = useGetSingleProductVariantQuery(id);
  const [updateVariant, { isLoading }] = useUpdateProductVariantMutation();
  const { data: productsData } = useGetProductsIdNameQuery();
  const productOptions = productsData?.data || [];

  const [formData, setFormData] = useState({
    product: "",
    sku: "",
    barcode: "",
    attributes: { size: "", color: "", material: "", style: "" },
    pricing: {
      buyingPrice: "",
      sellingPrice: "",
      discount: { type: "", value: "" },
    },
    inventory: { stock: "0", lowStockThreshold: "10" },
    weight: "",
    isDefault: false,
    status: "active",
  });
  const [image, setImage] = useState(null); // { file, url, name } for new upload OR existing { url }
  const [existingImage, setExistingImage] = useState(null); // Server image { url, publicId }
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (data?.data) {
      const variant = data.data;
      setFormData({
        product: variant.product?._id || variant.product || "",
        sku: variant.sku || "",
        barcode: variant.barcode || "",
        attributes: {
          size: variant.attributes?.size || "",
          color: variant.attributes?.color || "",
          material: variant.attributes?.material || "",
          style: variant.attributes?.style || "",
        },
        pricing: {
          buyingPrice: variant.pricing?.buyingPrice?.toString() || "",
          sellingPrice: variant.pricing?.sellingPrice?.toString() || "",
          discount: {
            type: variant.pricing?.discount?.type || "",
            value: variant.pricing?.discount?.value?.toString() || "",
          },
        },
        inventory: {
          stock: variant.inventory?.stock?.toString() || "0",
          lowStockThreshold:
            variant.inventory?.lowStockThreshold?.toString() || "10",
        },
        weight: variant.weight?.toString() || "",
        isDefault: variant.isDefault || false,
        status: variant.status || "active",
      });
      // Set existing image if exists
      if (variant.image?.url) {
        setExistingImage(variant.image);
      }
    }
  }, [data]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const parts = field.split(".");
      if (parts.length === 3) {
        const [parent, child, subChild] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: { ...prev[parent][child], [subChild]: value },
          },
        }));
      } else {
        const [parent, child] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: { ...prev[parent], [child]: value },
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Image handling
  const processImageFile = (file) => {
    if (!file) return;
    const ext = getFileExtension(file.name);
    if (!IMAGE_FORMATS.includes(ext)) {
      toast.error("Only JPG, JPEG, PNG, WebP allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5MB");
      return;
    }
    setImage({ file, url: URL.createObjectURL(file), name: file.name });
    setExistingImage(null); // Clear existing when new is uploaded
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
    setImage(null);
    setExistingImage(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.product) newErrors.product = "Product is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (
      !formData.pricing.sellingPrice ||
      parseFloat(formData.pricing.sellingPrice) < 0
    )
      newErrors["pricing.sellingPrice"] = "Valid selling price is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors");
      return;
    }

    const hasDiscount =
      formData.pricing.discount.type && formData.pricing.discount.value;

    const variantData = {
      ...formData,
      pricing: {
        buyingPrice: formData.pricing.buyingPrice
          ? parseFloat(formData.pricing.buyingPrice)
          : undefined,
        sellingPrice: parseFloat(formData.pricing.sellingPrice),
        discount: hasDiscount
          ? {
              type: formData.pricing.discount.type,
              value: parseFloat(formData.pricing.discount.value),
            }
          : undefined,
      },
      inventory: {
        stock: parseInt(formData.inventory.stock) || 0,
        lowStockThreshold: parseInt(formData.inventory.lowStockThreshold) || 10,
      },
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      attributes: Object.fromEntries(
        Object.entries(formData.attributes).filter(([_, v]) => v),
      ),
    };

    // Build FormData
    const payload = { data: JSON.stringify(variantData) };
    if (image?.file) payload.image = image.file;

    const loadingToast = toast.loading("Updating variant...");
    const result = await updateVariant({ id, data: generateFormData(payload) });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-variant",
      message: "Variant updated!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) router.push("/product-variants");
  };

  if (isFetching) return <PageSkeleton />;
  if (isError) return <ErrorBoundaryFetcher />;

  // Display image - either new upload or existing
  const displayImage =
    image ||
    (existingImage ? { url: existingImage.url, name: "Current image" } : null);

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
        <Link
          href="/product-variants"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LuArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Product Variant
          </h1>
          <p className="text-sm text-gray-500">Update variant details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Basic Information
              </h2>
              <Select
                label="Product"
                options={[
                  { value: "", label: "Select Product" },
                  ...productOptions.map((p) => ({
                    value: p.value,
                    label: p.label,
                  })),
                ]}
                value={formData.product}
                onValueChange={(val) => handleInputChange("product", val)}
                error={errors.product}
                requiredSign={true}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="SKU"
                  placeholder="VAR-001"
                  value={formData.sku}
                  onValueChange={(val) =>
                    handleInputChange("sku", val.toUpperCase())
                  }
                  error={errors.sku}
                  requiredSign={true}
                />
                <Input
                  label="Barcode"
                  placeholder="1234567890123"
                  value={formData.barcode}
                  onValueChange={(val) => handleInputChange("barcode", val)}
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Attributes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Size"
                  placeholder="M, L, XL..."
                  value={formData.attributes.size}
                  onValueChange={(val) =>
                    handleInputChange("attributes.size", val)
                  }
                />
                <Input
                  label="Color"
                  placeholder="Red, Blue..."
                  value={formData.attributes.color}
                  onValueChange={(val) =>
                    handleInputChange("attributes.color", val)
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Material"
                  placeholder="Cotton, Polyester..."
                  value={formData.attributes.material}
                  onValueChange={(val) =>
                    handleInputChange("attributes.material", val)
                  }
                />
                <Input
                  label="Style"
                  placeholder="Casual, Formal..."
                  value={formData.attributes.style}
                  onValueChange={(val) =>
                    handleInputChange("attributes.style", val)
                  }
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Pricing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Buying Price (৳)"
                  type="number"
                  placeholder="0.00"
                  value={formData.pricing.buyingPrice}
                  onValueChange={(val) =>
                    handleInputChange("pricing.buyingPrice", val)
                  }
                />
                <Input
                  label="Selling Price (৳)"
                  type="number"
                  placeholder="0.00"
                  value={formData.pricing.sellingPrice}
                  onValueChange={(val) =>
                    handleInputChange("pricing.sellingPrice", val)
                  }
                  error={errors["pricing.sellingPrice"]}
                  requiredSign={true}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Discount Type"
                  options={[
                    { value: "", label: "No Discount" },
                    ...discountTypeOptions,
                  ]}
                  value={formData.pricing.discount.type}
                  onValueChange={(val) =>
                    handleInputChange("pricing.discount.type", val)
                  }
                />
                <Input
                  label="Discount Value"
                  type="number"
                  placeholder="0"
                  value={formData.pricing.discount.value}
                  onValueChange={(val) =>
                    handleInputChange("pricing.discount.value", val)
                  }
                  disabled={!formData.pricing.discount.type}
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Inventory
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Stock"
                  type="number"
                  placeholder="0"
                  value={formData.inventory.stock}
                  onValueChange={(val) =>
                    handleInputChange("inventory.stock", val)
                  }
                />
                <Input
                  label="Low Stock Threshold"
                  type="number"
                  placeholder="10"
                  value={formData.inventory.lowStockThreshold}
                  onValueChange={(val) =>
                    handleInputChange("inventory.lowStockThreshold", val)
                  }
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  placeholder="0.5"
                  value={formData.weight}
                  onValueChange={(val) => handleInputChange("weight", val)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Variant Image */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                <LuImage className="size-4" /> Variant Image
              </h2>
              {displayImage ? (
                <div className="relative group">
                  <img
                    src={displayImage.url}
                    alt="Variant preview"
                    className="w-full h-48 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <LuX className="size-4" />
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center truncate">
                    {displayImage.name || "Current image"}
                  </p>
                </div>
              ) : (
                <label
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-700 hover:border-primary"}`}
                >
                  <LuImage className="size-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Drag & drop or click</p>
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

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Settings
              </h2>
              <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    handleInputChange("isDefault", e.target.checked)
                  }
                  className="w-4 h-4 text-primary"
                />
                <div>
                  <p className="font-medium text-gray-800 dark:text-white text-sm">
                    Default Variant
                  </p>
                  <p className="text-xs text-gray-500">
                    Primary variant for product
                  </p>
                </div>
              </label>
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
          <Link href="/product-variants">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            <LuSave className="size-4" />
            {isLoading ? "Updating..." : "Update Variant"}
          </Button>
        </div>
      </form>
    </div>
  );
}
