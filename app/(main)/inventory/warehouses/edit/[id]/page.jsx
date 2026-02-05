"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { LuArrowLeft, LuSave } from "react-icons/lu";
import Link from "next/link";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import {
  useGetSingleWarehouseQuery,
  useUpdateWarehouseMutation,
} from "@/features/inventory/warehousesApiSlice";
import { handleToast } from "@/utils/handleToast";
import { statusOptions } from "@/utils/DataHelper";
import { PageSkeleton } from "@/components/skeleton/PageSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";
import { cleanPayload } from "@/utils/cleanPayload";

export default function EditWarehousePage() {
  const router = useRouter();
  const { id } = useParams();
  const {
    data,
    isLoading: isFetching,
    isError,
  } = useGetSingleWarehouseQuery(id);
  const [updateWarehouse, { isLoading }] = useUpdateWarehouseMutation();

  // Form state matching server model (no isDefault field)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    status: "active",
    address: { street: "", city: "", state: "", country: "", postalCode: "" },
    contact: { name: "", phone: "", email: "" },
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (data?.data) {
      const warehouse = data.data;
      setFormData({
        name: warehouse.name || "",
        code: warehouse.code || "",
        status: warehouse.status || "active",
        address: {
          street: warehouse.address?.street || "",
          city: warehouse.address?.city || "",
          state: warehouse.address?.state || "",
          country: warehouse.address?.country || "",
          postalCode: warehouse.address?.postalCode || "",
        },
        contact: {
          name: warehouse.contact?.name || "",
          phone: warehouse.contact?.phone || "",
          email: warehouse.contact?.email || "",
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
      toast.error("Please fix the errors");
      return;
    }

    // Clean payload to remove empty/null/undefined values
    const cleanedData = cleanPayload(formData);

    const result = await updateWarehouse({ id, data: cleanedData });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-warehouse",
      message: "Warehouse updated!",
    });
    if (result?.data) router.push("/inventory/warehouses");
  };

  if (isFetching) return <PageSkeleton />;
  if (isError) return <ErrorBoundaryFetcher />;

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
        <Link
          href="/inventory/warehouses"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LuArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Warehouse
          </h1>
          <p className="text-sm text-gray-500">Update warehouse details</p>
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
                  label="Warehouse Name"
                  placeholder="Main Warehouse"
                  value={formData.name}
                  onValueChange={(val) => handleInputChange("name", val)}
                  error={errors.name}
                  requiredSign={true}
                />
                <Input
                  label="Code"
                  placeholder="WH-001"
                  value={formData.code}
                  onValueChange={(val) =>
                    handleInputChange("code", val.toUpperCase())
                  }
                  error={errors.code}
                  requiredSign={true}
                />
              </div>
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
                  placeholder="New York"
                  value={formData.address.city}
                  onValueChange={(val) =>
                    handleInputChange("address.city", val)
                  }
                />
                <Input
                  label="State"
                  placeholder="NY"
                  value={formData.address.state}
                  onValueChange={(val) =>
                    handleInputChange("address.state", val)
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Country"
                  placeholder="USA"
                  value={formData.address.country}
                  onValueChange={(val) =>
                    handleInputChange("address.country", val)
                  }
                />
                <Input
                  label="Postal Code"
                  placeholder="10001"
                  value={formData.address.postalCode}
                  onValueChange={(val) =>
                    handleInputChange("address.postalCode", val)
                  }
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Contact Name"
                  placeholder="John Doe"
                  value={formData.contact.name}
                  onValueChange={(val) =>
                    handleInputChange("contact.name", val)
                  }
                />
                <Input
                  label="Phone"
                  placeholder="+1234567890"
                  value={formData.contact.phone}
                  onValueChange={(val) =>
                    handleInputChange("contact.phone", val)
                  }
                />
                <Input
                  label="Email"
                  placeholder="contact@warehouse.com"
                  value={formData.contact.email}
                  onValueChange={(val) =>
                    handleInputChange("contact.email", val)
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Settings
              </h2>
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
          <Link href="/inventory/warehouses">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={isLoading}>
            <LuSave className="size-4" />
            {isLoading ? "Updating..." : "Update Warehouse"}
          </Button>
        </div>
      </form>
    </div>
  );
}
