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
  useGetSingleCustomerQuery,
  useUpdateCustomerMutation,
} from "@/features/customers/customersApiSlice";
import { handleToast } from "@/utils/handleToast";
import { PageSkeleton } from "@/components/skeleton/PageSkeleton";
import ErrorBoundaryFetcher from "@/components/errors/ErrorBoundaryFetcher";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "banned", label: "Banned" },
];

const genderOptions = [
  { value: "", label: "Select Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function EditCustomerPage() {
  const router = useRouter();
  const { id } = useParams();
  const {
    data,
    isLoading: isFetching,
    isError,
  } = useGetSingleCustomerQuery(id);
  const [updateCustomer, { isLoading }] = useUpdateCustomerMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    status: "active",
    isEmailVerified: false,
    isPhoneVerified: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (data?.data) {
      const customer = data.data;
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        gender: customer.gender || "",
        dateOfBirth: customer.dateOfBirth
          ? new Date(customer.dateOfBirth).toISOString().split("T")[0]
          : "",
        status: customer.status || "active",
        isEmailVerified: customer.isEmailVerified || false,
        isPhoneVerified: customer.isPhoneVerified || false,
      });
    }
  }, [data]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors");
      return;
    }

    const payload = {
      ...formData,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender || undefined,
    };

    const loadingToast = toast.loading("Updating customer...");
    const result = await updateCustomer({ id, data: payload });
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "update-customer",
      message: "Customer updated!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) router.push("/customers");
  };

  if (isFetching) return <PageSkeleton />;
  if (isError) return <ErrorBoundaryFetcher />;

  return (
    <div className="bg-white dark:bg-[#010611] minBody p-5 rounded-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
        <Link
          href="/customers"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <LuArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Customer
          </h1>
          <p className="text-sm text-gray-500">Update customer details</p>
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
                  label="Full Name"
                  placeholder="John Doe"
                  value={formData.name}
                  onValueChange={(val) => handleInputChange("name", val)}
                  error={errors.name}
                  requiredSign={true}
                />
                <Input
                  label="Email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onValueChange={(val) => handleInputChange("email", val)}
                  error={errors.email}
                  requiredSign={true}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  placeholder="+8801234567890"
                  value={formData.phone}
                  onValueChange={(val) => handleInputChange("phone", val)}
                />
                <Select
                  label="Gender"
                  options={genderOptions}
                  value={formData.gender}
                  onValueChange={(val) => handleInputChange("gender", val)}
                />
              </div>
              <Input
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onValueChange={(val) => handleInputChange("dateOfBirth", val)}
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Verification Status
              </h2>
              <div className="flex gap-6">
                <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isEmailVerified}
                    onChange={(e) =>
                      handleInputChange("isEmailVerified", e.target.checked)
                    }
                    className="w-4 h-4 text-primary"
                  />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm">
                      Email Verified
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPhoneVerified}
                    onChange={(e) =>
                      handleInputChange("isPhoneVerified", e.target.checked)
                    }
                    className="w-4 h-4 text-primary"
                  />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm">
                      Phone Verified
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Status
              </h2>
              <Select
                label="Account Status"
                options={statusOptions}
                value={formData.status}
                onValueChange={(val) => handleInputChange("status", val)}
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Account Stats
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Orders</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {data?.data?.totalOrders || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Spent</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    ৳{(data?.data?.totalSpent || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Loyalty Points</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {data?.data?.loyaltyPoints || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Link href="/customers">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            <LuSave className="size-4" />
            {isLoading ? "Updating..." : "Update Customer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
