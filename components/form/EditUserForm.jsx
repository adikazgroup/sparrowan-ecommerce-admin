"use client";

import { Icon } from "@iconify/react";

import toast from "react-hot-toast";
import { Input } from "../ui/input/Input";
import { Select } from "../ui/select/Select";
import { Button } from "../ui/button/Button";
import React, { useEffect, useState } from "react";
import { useUpdateUserMutation } from "@/features/user/userApiSlice";
import { handleToast } from "@/utils/handleToast";
import {
  userRoleOptions,
  userStatusOptions,
  emailVerifiedOptions,
} from "@/utils/DataHelper";

export default function EditUserForm({ selectedUser, onClose }) {
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
    isEmailVerified: false,
  });

  const [editErrors, setEditErrors] = useState({});
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  useEffect(() => {
    if (selectedUser) {
      setEditFormData({
        name: selectedUser.name || "",
        email: selectedUser.email || "",
        role: selectedUser.role || "",
        status: selectedUser.status || "",
        isEmailVerified: selectedUser.isEmailVerified ?? false,
      });
    }
  }, [selectedUser]);

  const resetForm = () => {
    setEditFormData({
      name: "",
      email: "",
      role: "",
      status: "",
      isEmailVerified: false,
    });
    setEditErrors({});
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (editErrors[field]) {
      setEditErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateEditForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!editFormData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!editFormData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(editFormData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!editFormData.role) {
      newErrors.role = "Role is required";
      isValid = false;
    }

    if (!editFormData.status) {
      newErrors.status = "Status is required";
      isValid = false;
    }

    setEditErrors(newErrors);
    return isValid;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!validateEditForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const loadingToast = toast.loading("Updating user...");

    const result = await updateUser({
      id: selectedUser._id,
      data: editFormData,
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
  };

  return (
    <form onSubmit={handleEditSubmit} className="space-y-4 mt-3">
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

        <Select
          label="Email Verified"
          options={emailVerifiedOptions}
          value={editFormData.isEmailVerified}
          onValueChange={(value) =>
            handleEditInputChange("isEmailVerified", value)
          }
          fullWidth
          className="h-12 dark:border-[#475569]"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          startIcon={<Icon icon="lucide:x" className="size-4" />}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          endIcon={<Icon icon="lucide:check" className="size-4" />}
        >
          {isLoading ? "Updating..." : "Update User"}
        </Button>
      </div>
    </form>
  );
}
