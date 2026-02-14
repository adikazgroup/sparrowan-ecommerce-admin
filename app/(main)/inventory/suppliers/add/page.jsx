"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { LuArrowLeft, LuSave } from "react-icons/lu";
import Link from "next/link";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea/Textarea";
import { useCreateSupplierMutation } from "@/features/inventory/suppliersApiSlice";
import { handleToast } from "@/utils/handleToast";
import { statusOptions, paymentTermsOptions } from "@/utils/DataHelper";
import { cleanPayload } from "@/utils/cleanPayload";

export default function AddSupplierPage() {
  const router = useRouter();
  const [createSupplier, { isLoading }] = useCreateSupplierMutation();

  // Form state matching server model (flat strings for address & bankDetails)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    paymentTerms: "",
    bankDetails: "",
    taxId: "",
    notes: "",
    status: "active",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    // Clean payload to remove empty/null/undefined values
    const cleanedData = cleanPayload(formData);

    const result = await createSupplier(cleanedData);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "create-supplier",
      message: "Supplier created!",
    });
    if (result?.data) router.push("/inventory/suppliers");
  };

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
            Add Supplier
          </h1>
          <p className="text-sm text-gray-500">Create a new supplier</p>
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
              <Select
                label="Payment Terms"
                options={paymentTermsOptions}
                placeholder="Select Payment Terms"
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
              <Textarea
                label="Full Address"
                placeholder="123 Main St, City, State, Country, Postal Code"
                value={formData.address}
                onValueChange={(val) => handleInputChange("address", val)}
                rows={3}
              />
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
              <Textarea
                label="Bank Information"
                placeholder="Bank Name, Account Name, Account Number, Routing Number"
                value={formData.bankDetails}
                onValueChange={(val) => handleInputChange("bankDetails", val)}
                rows={6}
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
          <Button type="submit" loading={isLoading}>
            <LuSave className="size-4" />
            {isLoading ? "Creating..." : "Create Supplier"}
          </Button>
        </div>
      </form>
    </div>
  );
}
