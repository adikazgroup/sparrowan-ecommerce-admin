"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "react-hot-toast";
import { Input } from "../ui/input/Input";
import { Button } from "../ui/button/Button";
import { Select } from "../ui/select/Select";
import { useCreateUserMutation } from "@/features/user/userApiSlice";
import { handleToast } from "@/utils/handleToast";
import { userRoleOptions, userStatusOptions } from "@/utils/DataHelper";

export default function CreateUserForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    role: "staff",
    email: "",
    password: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [createUser, { isLoading }] = useCreateUserMutation();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email.trim())
    ) {
      newErrors.email = "Enter a valid email address";
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const loadingToast = toast.loading("Creating user...");

    const result = await createUser(formData);

    handleToast({
      result,
      type: result?.data ? "success" : "error",
      id: "create-user",
      message: "User created successfully!",
    });

    toast.dismiss(loadingToast);

    if (result?.data) {
      onClose();
    }
  };

  return (
    <div className="">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={formData.name}
              onValueChange={(value) => handleInputChange("name", value)}
              fullWidth
              className="h-10"
              error={errors.name}
              requiredSign={true}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onValueChange={(value) => handleInputChange("email", value)}
              fullWidth
              className="h-10"
              error={errors.email}
              requiredSign={true}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onValueChange={(value) => handleInputChange("password", value)}
              fullWidth
              className="h-10"
              error={errors.password}
              requiredSign={true}
            />

            <div>
              <Select
                label="Role"
                options={userRoleOptions}
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
                fullWidth
                className="h-10"
                placeholder="Select role"
              />
              {errors.role && (
                <p className="text-xs text-red-500 mt-1">{errors.role}</p>
              )}
            </div>

            <div>
              <Select
                label="Status"
                options={userStatusOptions}
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
                fullWidth
                className="h-10"
                placeholder="Select status"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              endIcon={<Icon icon="lucide:arrow-right" className="size-4" />}
            >
              Create User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
