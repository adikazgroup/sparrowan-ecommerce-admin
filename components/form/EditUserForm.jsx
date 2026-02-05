"use client";

import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { Input } from "../ui/input/Input";
import { Select } from "../ui/select/Select";
import { Button } from "../ui/button/Button";
import React, { useEffect, useState } from "react";
import { useUpdateUserMutation } from "@/features/user/userApiSlice";
import { handleToast } from "@/utils/handleToast";
import { cleanPayload } from "@/utils/cleanPayload";
import { userRoleOptions, userStatusOptions } from "@/utils/DataHelper";

/**
 * EditUserForm Component
 *
 * Professional form for editing existing users with:
 * - Data sanitization
 * - Loading states
 * - Comprehensive validation
 *
 * @param {Object} props
 * @param {Object} props.selectedUser - The user object to edit
 * @param {Function} props.onClose - Callback to close the form modal
 */
export default function EditUserForm({ selectedUser, onClose }) {
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
  });

  const [editErrors, setEditErrors] = useState({});
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  /**
   * Initialize form with selected user data
   */
  useEffect(() => {
    if (selectedUser) {
      setEditFormData({
        name: selectedUser.name || "",
        email: selectedUser.email || "",
        role: selectedUser.role || "",
        status: selectedUser.status || "",
      });
    }
  }, [selectedUser]);

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setEditFormData({
      name: "",
      email: "",
      role: "",
      status: "",
    });
    setEditErrors({});
  };

  /**
   * Handles input field changes
   */
  const handleEditInputChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (editErrors[field]) {
      setEditErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  /**
   * Validates the edit form
   * @returns {boolean} - True if form is valid
   */
  const validateEditForm = () => {
    const newErrors = {};
    let isValid = true;

    // Name validation
    if (!editFormData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    // Email validation
    if (!editFormData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(editFormData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Role validation
    if (!editFormData.role) {
      newErrors.role = "Role is required";
      isValid = false;
    }

    // Status validation
    if (!editFormData.status) {
      newErrors.status = "Status is required";
      isValid = false;
    }

    setEditErrors(newErrors);
    return isValid;
  };

  /**
   * Handles form submission
   */
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!validateEditForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const loadingToast = toast.loading("Updating user...");

    try {
      // Clean payload to remove empty/null/undefined values
      const cleanedData = cleanPayload(editFormData);

      // If profileImage is a File (new upload), use FormData
      // If it's a string (existing URL), remove it from payload (backend keeps it)
      let payload = cleanedData;

      if (cleanedData.profileImage instanceof File) {
        payload = toFormData(cleanedData);
      } else {
        // Remove profileImage if it's just the existing URL
        const { profileImage, ...rest } = cleanedData;
        payload = rest;
      }

      const result = await updateUser({
        id: selectedUser._id,
        data: payload,
      });

      handleToast({
        result,
        type: result?.data ? "success" : "error",
        id: "edit-user",
        message: "User updated successfully!",
      });

      toast.dismiss(loadingToast);

      if (result?.data) {
        onClose();
        resetForm();
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update user. Please try again.");
    }
  };

  return (
    <form onSubmit={handleEditSubmit} className="space-y-4 mt-3">
      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={
            <span>
              Name <span className="text-red-500">*</span>
            </span>
          }
          placeholder="Enter name"
          value={editFormData.name}
          onValueChange={(value) => handleEditInputChange("name", value)}
          fullWidth
          className="h-12 dark:border-[#475569]"
          error={editErrors.name}
        />

        <Input
          label={
            <span>
              Email <span className="text-red-500">*</span>
            </span>
          }
          type="email"
          placeholder="Enter email"
          value={editFormData.email}
          onValueChange={(value) => handleEditInputChange("email", value)}
          fullWidth
          className="h-12 dark:border-[#475569]"
          error={editErrors.email}
        />

        <Select
          label={
            <span>
              Role <span className="text-red-500">*</span>
            </span>
          }
          options={userRoleOptions}
          value={editFormData.role}
          onValueChange={(value) => handleEditInputChange("role", value)}
          fullWidth
          className="h-12 dark:border-[#475569]"
          error={editErrors.role}
        />

        <Select
          label={
            <span>
              Status <span className="text-red-500">*</span>
            </span>
          }
          options={userStatusOptions}
          value={editFormData.status}
          onValueChange={(value) => handleEditInputChange("status", value)}
          fullWidth
          className="h-12 dark:border-[#475569]"
          error={editErrors.status}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          startIcon={<Icon icon="lucide:x" className="size-4" />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          endIcon={<Icon icon="lucide:check" className="size-4" />}
        >
          {isLoading ? "Updating..." : "Update User"}
        </Button>
      </div>
    </form>
  );
}
