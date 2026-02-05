"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "react-hot-toast";
import { Input } from "../ui/input/Input";
import { Button } from "../ui/button/Button";
import { Select } from "../ui/select/Select";
import { useCreateUserMutation } from "@/features/user/userApiSlice";
import { handleToast } from "@/utils/handleToast";
import { cleanPayload } from "@/utils/cleanPayload";
import { userRoleOptions, userStatusOptions } from "@/utils/DataHelper";

/**
 * CreateUserForm Component
 *
 * Professional form for creating new users with:
 * - Real-time validation
 * - Data sanitization before submission
 * - Loading states and error handling
 *
 * @param {Object} props
 * @param {Function} props.onClose - Callback to close the form modal
 */
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

  /**
   * Handles input field changes
   */
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  /**
   * Validates the entire form
   * @returns {boolean} - True if form is valid
   */
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email.trim())
    ) {
      newErrors.email = "Enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Role is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const loadingToast = toast.loading("Creating user...");

    try {
      // Clean payload to remove empty/null/undefined values
      const cleanedData = cleanPayload(formData);

      // Convert to FormData if image is present
      const payload = cleanedData.profileImage
        ? toFormData(cleanedData)
        : cleanedData;

      const result = await createUser(payload);

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
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to create user. Please try again.");
    }
  };

  return (
    <div className="">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields Grid */}
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              endIcon={<Icon icon="lucide:user-plus" className="size-4" />}
            >
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
