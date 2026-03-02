"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  LuArrowLeft,
  LuSave,
  LuPlus,
  LuTrash2,
  LuPackage,
} from "react-icons/lu";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { PageSkeleton } from "@/components/skeleton/PageSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import {
  useGetSinglePurchaseOrderQuery,
  useUpdatePurchaseOrderMutation,
} from "@/features/inventory/purchaseOrdersApiSlice";
import { useGetSuppliersIdNameQuery } from "@/features/inventory/suppliersApiSlice";
import { useGetWarehousesIdNameQuery } from "@/features/inventory/warehousesApiSlice";
import { useGetProductsIdNameQuery } from "@/features/products/productsApiSlice";
import { useGetVariantsByProductQuery } from "@/features/products/productVariantsApiSlice";
import { handleToast } from "@/utils/handleToast";
import { cleanPayload } from "@/utils/cleanPayload";

const createEmptyItem = () => ({
  id: Date.now(),
  product: "",
  productData: null,
  variant: "",
  variantData: null,
  displayName: "",
  sku: "",
  orderedQuantity: 1,
  unitCost: 0,
  discount: 0,
  tax: 0,
});

export default function EditPurchaseOrderPage() {
  const router = useRouter();
  const { id } = useParams();

  const {
    data: poData,
    isLoading: poLoading,
    isError,
  } = useGetSinglePurchaseOrderQuery(id);
  const [updatePO, { isLoading }] = useUpdatePurchaseOrderMutation();

  const { data: suppliersData } = useGetSuppliersIdNameQuery();
  const { data: warehousesData } = useGetWarehousesIdNameQuery();
  const { data: productsData } = useGetProductsIdNameQuery();

  const supplierOptions = suppliersData?.data || [];
  const warehouseOptions = warehousesData?.data || [];
  const productOptions = productsData?.data || [];

  const [formData, setFormData] = useState({
    expectedDelivery: "",
    shippingCost: 0,
    notes: "",
  });

  const [items, setItems] = useState([createEmptyItem()]);
  const [errors, setErrors] = useState({});
  const [initialized, setInitialized] = useState(false);

  const po = poData?.data;

  // Initialize form when data loads
  useEffect(() => {
    if (po && productOptions.length > 0 && !initialized) {
      setFormData({
        expectedDelivery: po.expectedDelivery
          ? new Date(po.expectedDelivery).toISOString().split("T")[0]
          : "",
        shippingCost: po.shippingCost || 0,
        notes: po.notes || "",
      });

      if (po.items?.length > 0) {
        setItems(
          po.items.map((item, idx) => {
            const productData = productOptions.find(
              (p) => p.value === item.product?._id,
            );
            return {
              id: item._id || Date.now() + idx,
              product: item.product?._id || "",
              productData: productData || null,
              variant: item.variant?._id || "",
              variantData: item.variant || null,
              displayName: item.name || "",
              sku: item.sku || "",
              orderedQuantity: item.orderedQuantity || 1,
              unitCost: item.unitCost || 0,
              discount: item.discount || 0,
              tax: item.tax || 0,
            };
          }),
        );
      }
      setInitialized(true);
    }
  }, [po, productOptions, initialized]);

  // Check if PO can be edited
  const canEdit = po?.status === "draft";

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const addItem = () => setItems((prev) => [...prev, createEmptyItem()]);
  const removeItem = (id) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const updateItem = (id, field, value, extraData = null) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };

        if (field === "product") {
          const selectedProduct = productOptions.find((p) => p.value === value);
          updated.productData = selectedProduct || null;
          updated.variant = "";
          updated.variantData = null;
          if (selectedProduct && selectedProduct.variantCount === 1) {
            updated.displayName = selectedProduct.label;
            updated.sku = selectedProduct.sku || "";
          } else {
            updated.displayName = "";
            updated.sku = "";
          }
        }

        if (field === "variant" && extraData) {
          updated.variantData = extraData;
          const productName = updated.productData?.label || "";
          const variantAttrs = [];
          if (extraData.attributes?.size)
            variantAttrs.push(extraData.attributes.size);
          if (extraData.attributes?.color)
            variantAttrs.push(extraData.attributes.color);
          updated.displayName =
            variantAttrs.length > 0
              ? `${productName} - ${variantAttrs.join(" / ")}`
              : productName;
          updated.sku = extraData.sku || "";
        }

        return updated;
      }),
    );
  };

  const calculations = useMemo(() => {
    let subtotal = 0,
      totalDiscount = 0,
      totalTax = 0;
    items.forEach((item) => {
      const qty = parseFloat(item.orderedQuantity) || 0;
      const cost = parseFloat(item.unitCost) || 0;
      const discount = parseFloat(item.discount) || 0;
      const tax = parseFloat(item.tax) || 0;
      subtotal += cost * qty;
      totalDiscount += discount * qty;
      totalTax += tax * qty;
    });
    const shipping = parseFloat(formData.shippingCost) || 0;
    const total = subtotal - totalDiscount + totalTax + shipping;
    return { subtotal, totalDiscount, totalTax, total };
  }, [items, formData.shippingCost]);

  const validateForm = () => {
    const newErrors = {};

    const validItems = items.filter((i) => i.product);
    if (validItems.length === 0) {
      newErrors.items = "At least one product is required";
    } else {
      for (const item of validItems) {
        if (item.productData?.variantCount >= 1 && !item.variant) {
          newErrors.items = "Please select a variant for all products";
          break;
        }
        if (!item.orderedQuantity || item.orderedQuantity <= 0) {
          newErrors.items = "All items must have valid quantity";
          break;
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors");
      return;
    }

    const validItems = items.filter((i) => i.product);
    const payload = {
      expectedDelivery: formData.expectedDelivery || undefined,
      shippingCost: parseFloat(formData.shippingCost) || 0,
      notes: formData.notes || undefined,
      items: validItems.map((item) => ({
        product: item.product,
        variant: item.variant || undefined,
        name: item.displayName,
        sku: item.sku,
        orderedQuantity: parseInt(item.orderedQuantity),
        unitCost: parseFloat(item.unitCost),
        discount: parseFloat(item.discount) || 0,
        tax: parseFloat(item.tax) || 0,
      })),
    };

    // Clean payload to remove empty/null/undefined values
    const cleanedPayload = cleanPayload(payload);

    const result = await updatePO({ id, data: cleanedPayload });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-po",
      message: "Purchase order updated!",
    });
    if (result?.data) router.push("/inventory/purchase-orders");
  };

  const formatCurrency = (amount) => `৳${(amount || 0).toLocaleString()}`;

  if (poLoading) return <PageSkeleton />;
  if (isError || !po) return <ErrorBoundaryFetcher />;

  if (!canEdit) {
    return (
      <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Cannot Edit
          </h2>
          <p className="text-gray-500 mb-4">
            Only draft purchase orders can be edited. Current status:{" "}
            <span className="capitalize font-medium">{po.status}</span>
          </p>
          <Link href={`/inventory/purchase-orders/${id}`}>
            <Button>View Order</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
        <Link
          href="/inventory/purchase-orders"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LuArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Purchase Order
          </h1>
          <p className="text-sm text-gray-500">{po.poNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Order Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Supplier
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {po.supplier?.name || "N/A"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Warehouse
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {po.warehouse?.name || "N/A"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Expected Delivery"
                  type="date"
                  value={formData.expectedDelivery}
                  onValueChange={(val) =>
                    handleInputChange("expectedDelivery", val)
                  }
                />
              </div>
            </div>

            {/* Products */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Products
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <LuPlus className="size-4" /> Add Product
                </Button>
              </div>
              {errors.items && (
                <p className="text-sm text-red-500">{errors.items}</p>
              )}

              <div className="space-y-3">
                {items.map((item) => (
                  <POItemRow
                    key={item.id}
                    item={item}
                    productOptions={productOptions}
                    updateItem={updateItem}
                    removeItem={removeItem}
                    canRemove={items.length > 1}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Notes
              </h2>
              <Textarea
                label="Internal Notes"
                placeholder="Any special instructions..."
                value={formData.notes}
                onValueChange={(val) => handleInputChange("notes", val)}
                rows={3}
              />
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4 sticky top-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                <LuPackage className="size-4" /> Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-800 dark:text-white">
                    {formatCurrency(calculations.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-red-500">
                    -{formatCurrency(calculations.totalDiscount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="text-gray-800 dark:text-white">
                    +{formatCurrency(calculations.totalTax)}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">Shipping</span>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.shippingCost}
                    onValueChange={(val) =>
                      handleInputChange("shippingCost", val)
                    }
                    className="w-24 text-right"
                  />
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800 dark:text-white">
                      Total
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(calculations.total)}
                    </span>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment Status</span>
                    <span
                      className={`capitalize font-medium ${po.paymentStatus === "paid" ? "text-green-600" : po.paymentStatus === "partial" ? "text-amber-600" : "text-gray-500"}`}
                    >
                      {po.paymentStatus || "Pending"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Paid: {formatCurrency(po.paidAmount || 0)} /{" "}
                    {formatCurrency(po.total)}
                  </p>
                </div>
              </div>
              <div className="pt-4 space-y-2">
                <Button type="submit" loading={isLoading} className="w-full">
                  <LuSave className="size-4" />{" "}
                  {isLoading ? "Updating..." : "Update Order"}
                </Button>
                <Link href="/inventory/purchase-orders" className="block">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// Same component as Add page
function POItemRow({
  item,
  productOptions,
  updateItem,
  removeItem,
  canRemove,
  formatCurrency,
}) {
  const productId = item.product;
  const hasVariants = (item.productData?.variantCount || 0) >= 1;

  // Fetch variants for all products (every product has at least 1 variant)
  const { data: variantsData, isLoading: variantsLoading } =
    useGetVariantsByProductQuery(productId, {
      skip: !productId || !hasVariants,
    });

  const variantOptions = variantsData?.data || [];

  // Auto-select default variant for single-variant products when data loads
  useEffect(() => {
    if (productId && variantOptions.length === 1 && !item.variant) {
      const defaultVariant = variantOptions[0];
      updateItem(item.id, "variant", defaultVariant._id, defaultVariant);
    }
  }, [productId, variantOptions, item.variant, item.id, updateItem]);

  const itemTotal =
    ((parseFloat(item.unitCost) || 0) -
      (parseFloat(item.discount) || 0) +
      (parseFloat(item.tax) || 0)) *
    (parseFloat(item.orderedQuantity) || 0);

  const handleVariantChange = (variantId) => {
    const selectedVariant = variantOptions.find((v) => v._id === variantId);
    updateItem(item.id, "variant", variantId, selectedVariant);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Select
          label="Product"
          placeholder="Select Product"
          options={[
            { value: "", label: "Select Product" },
            ...productOptions.map((p) => ({
              value: p.value,
              label: `${p.label}${p.variantCount > 1 ? " (multiple variants)" : ""}`,
            })),
          ]}
          value={item.product}
          onValueChange={(val) => updateItem(item.id, "product", val)}
        />
        {hasVariants && (
          <Select
            label="Variant"
            placeholder={variantsLoading ? "Loading..." : "Select Variant"}
            options={[
              { value: "", label: "Select Variant" },
              ...variantOptions.map((v) => {
                const attrs = [];
                if (v.attributes?.size) attrs.push(v.attributes.size);
                if (v.attributes?.color) attrs.push(v.attributes.color);
                return {
                  value: v._id,
                  label: attrs.length > 0 ? attrs.join(" / ") : v.sku || v._id,
                };
              }),
            ]}
            value={item.variant}
            onValueChange={handleVariantChange}
            disabled={variantsLoading}
          />
        )}
      </div>

      <div className="grid grid-cols-12 gap-2 items-end">
        <div className="col-span-6 md:col-span-2">
          <Input
            label="Qty"
            type="number"
            placeholder="1"
            min="1"
            value={item.orderedQuantity}
            onValueChange={(val) => updateItem(item.id, "orderedQuantity", val)}
          />
        </div>
        <div className="col-span-6 md:col-span-3">
          <Input
            label="Unit Cost"
            type="number"
            placeholder="0"
            min="0"
            value={item.unitCost}
            onValueChange={(val) => updateItem(item.id, "unitCost", val)}
          />
        </div>
        <div className="col-span-4 md:col-span-2">
          <Input
            label="Discount"
            type="number"
            placeholder="0"
            min="0"
            value={item.discount}
            onValueChange={(val) => updateItem(item.id, "discount", val)}
          />
        </div>
        <div className="col-span-4 md:col-span-2">
          <Input
            label="Tax"
            type="number"
            placeholder="0"
            min="0"
            value={item.tax}
            onValueChange={(val) => updateItem(item.id, "tax", val)}
          />
        </div>
        <div className="col-span-4 md:col-span-2 text-right pb-2">
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <span className="font-semibold text-gray-800 dark:text-white">
            {formatCurrency(itemTotal)}
          </span>
        </div>
        <div className="col-span-12 md:col-span-1 flex justify-end pb-2">
          {canRemove && (
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            >
              <LuTrash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {item.displayName && (
        <div className="text-xs text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-700">
          <span className="font-medium">{item.displayName}</span>{" "}
          {item.sku && <span className="ml-2">SKU: {item.sku}</span>}
        </div>
      )}
    </div>
  );
}
