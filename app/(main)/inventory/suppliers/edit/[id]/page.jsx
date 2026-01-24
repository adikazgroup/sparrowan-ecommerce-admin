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
  useGetSingleSupplierQuery,
  useUpdateSupplierMutation,
} from "@/features/inventory/suppliersApiSlice";
import { handleToast } from "@/utils/handleToast";
import { statusOptions } from "@/utils/DataHelper";
import { PageSkeleton } from "@/components/skeleton/PageSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";

export default function EditSupplierPage() {
  const router = useRouter();
  const { id } = useParams();
  const {
    data,
    isLoading: isFetching,
    isError,
  } = useGetSingleSupplierQuery(id);
  const [updateSupplier, { isLoading }] = useUpdateSupplierMutation();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    company: "",
    email: "",
    phone: "",
    paymentTerms: "",
    taxId: "",
    notes: "",
    status: "active",
    address: { street: "", city: "", state: "", country: "", postalCode: "" },
    bankDetails: {
      bankName: "",
      accountNumber: "",
      accountName: "",
      routingNumber: "",
    },
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (data?.data) {
      const supplier = data.data;
      setFormData({
        name: supplier.name || "",
        code: supplier.code || "",
        company: supplier.company || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        paymentTerms: supplier.paymentTerms || "",
        taxId: supplier.taxId || "",
        notes: supplier.notes || "",
        status: supplier.status || "active",
        address: {
          street: supplier.address?.street || "",
          city: supplier.address?.city || "",
          state: supplier.address?.state || "",
          country: supplier.address?.country || "",
          postalCode: supplier.address?.postalCode || "",
        },
        bankDetails: {
          bankName: supplier.bankDetails?.bankName || "",
          accountNumber: supplier.bankDetails?.accountNumber || "",
          accountName: supplier.bankDetails?.accountName || "",
          routingNumber: supplier.bankDetails?.routingNumber || "",
        },
      });
    }
  }, [data]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.code.trim()) newErrors.code = "Code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix errors");
      return;
    }

    const loadingToast = toast.loading("Updating supplier...");
    const result = await updateSupplier({ id, data: formData });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-supplier",
      message: "Supplier updated!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) router.push("/inventory/suppliers");
  };

  if (isFetching) return <PageSkeleton />;
  if (isError) return <ErrorBoundaryFetcher />;

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
        <Link
          href="/inventory/suppliers"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LuArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Supplier
          </h1>
          <p className="text-sm text-gray-500">Update supplier details</p>
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
                  label="Supplier Name"
                  placeholder="ABC Supplies"
                  value={formData.name}
                  onValueChange={(val) => handleInputChange("name", val)}
                  error={errors.name}
                  requiredSign={true}
                />
                <Input
                  label="Code"
                  placeholder="SUP-001"
                  value={formData.code}
                  onValueChange={(val) =>
                    handleInputChange("code", val.toUpperCase())
                  }
                  error={errors.code}
                  requiredSign={true}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company"
                  placeholder="ABC Inc."
                  value={formData.company}
                  onValueChange={(val) => handleInputChange("company", val)}
                />
                <Input
                  label="Tax ID"
                  placeholder="123-45-6789"
                  value={formData.taxId}
                  onValueChange={(val) => handleInputChange("taxId", val)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  placeholder="supplier@email.com"
                  value={formData.email}
                  onValueChange={(val) => handleInputChange("email", val)}
                />
                <Input
                  label="Phone"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onValueChange={(val) => handleInputChange("phone", val)}
                />
              </div>
              <Input
                label="Payment Terms"
                placeholder="Net 30"
                value={formData.paymentTerms}
                onValueChange={(val) => handleInputChange("paymentTerms", val)}
              />
              <Textarea
                label="Notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onValueChange={(val) => handleInputChange("notes", val)}
                rows={2}
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Address
              </h2>
              <Input
                label="Street"
                placeholder="123 Main St"
                value={formData.address.street}
                onValueChange={(val) =>
                  handleInputChange("address.street", val)
                }
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="City"
                  value={formData.address.city}
                  onValueChange={(val) =>
                    handleInputChange("address.city", val)
                  }
                />
                <Input
                  label="State"
                  placeholder="State"
                  value={formData.address.state}
                  onValueChange={(val) =>
                    handleInputChange("address.state", val)
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Country"
                  placeholder="Country"
                  value={formData.address.country}
                  onValueChange={(val) =>
                    handleInputChange("address.country", val)
                  }
                />
                <Input
                  label="Postal Code"
                  placeholder="Postal Code"
                  value={formData.address.postalCode}
                  onValueChange={(val) =>
                    handleInputChange("address.postalCode", val)
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Status
              </h2>
              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onValueChange={(val) => handleInputChange("status", val)}
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Bank Details
              </h2>
              <Input
                label="Bank Name"
                placeholder="Bank Name"
                value={formData.bankDetails.bankName}
                onValueChange={(val) =>
                  handleInputChange("bankDetails.bankName", val)
                }
              />
              <Input
                label="Account Name"
                placeholder="Account Name"
                value={formData.bankDetails.accountName}
                onValueChange={(val) =>
                  handleInputChange("bankDetails.accountName", val)
                }
              />
              <Input
                label="Account Number"
                placeholder="123456789"
                value={formData.bankDetails.accountNumber}
                onValueChange={(val) =>
                  handleInputChange("bankDetails.accountNumber", val)
                }
              />
              <Input
                label="Routing Number"
                placeholder="012345678"
                value={formData.bankDetails.routingNumber}
                onValueChange={(val) =>
                  handleInputChange("bankDetails.routingNumber", val)
                }
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link href="/inventory/suppliers">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            <LuSave className="size-4" />
            {isLoading ? "Updating..." : "Update Supplier"}
          </Button>
        </div>
      </form>
    </div>
  );
}
