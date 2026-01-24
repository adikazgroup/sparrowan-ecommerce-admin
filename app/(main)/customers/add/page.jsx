"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { LuArrowLeft, LuSave } from "react-icons/lu";
import Link from "next/link";

import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { useCreateCustomerMutation } from "@/features/customers/customersApiSlice";
import { handleToast } from "@/utils/handleToast";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const genderOptions = [
  { value: "", label: "Select Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function AddCustomerPage() {
  const router = useRouter();
  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    dateOfBirth: "",
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
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
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
      phone: formData.phone || undefined,
    };

    const loadingToast = toast.loading("Creating customer...");
    const result = await createCustomer(payload);
    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "create-customer",
      message: "Customer created!",
    });
    toast.dismiss(loadingToast);
    if (result?.data) router.push("/customers");
  };

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
            Add Customer
          </h1>
          <p className="text-sm text-gray-500">Create a new customer account</p>
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
                  type="email"
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
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onValueChange={(val) => handleInputChange("password", val)}
                  error={errors.password}
                  requiredSign={true}
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Additional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Gender"
                  options={genderOptions}
                  value={formData.gender}
                  onValueChange={(val) => handleInputChange("gender", val)}
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onValueChange={(val) => handleInputChange("dateOfBirth", val)}
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
                label="Account Status"
                options={statusOptions}
                value={formData.status}
                onValueChange={(val) => handleInputChange("status", val)}
              />
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
            {isLoading ? "Creating..." : "Create Customer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
