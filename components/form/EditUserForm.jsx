"use client";

import toast from "react-hot-toast";
import { Input } from "../ui/input/Input";
import { Select } from "../ui/select/Select";
import { Button } from "../ui/button/Button";
import React, { useEffect, useState } from "react";
import { userRoleOptions, userStatusOptions } from "@/utils/DataHelper";

// Discount options
const discountTypeOptions = [
  { value: "flat", label: "Flat Amount" },
  { value: "percentage", label: "Percentage" },
];

export default function EditUserForm({ selectedUser, editModal, setUsers }) {
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: "active",
    discount: {
      type: "flat",
      value: "",
    },
  });

  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    if (selectedUser) {
      setEditFormData({
        name: selectedUser.name || "",
        email: selectedUser.email || "",
        role: selectedUser.role || "",
        status: selectedUser.status || "active",
        discount: selectedUser.discount || { type: "flat", value: "" },
      });
    }
  }, [selectedUser]);

  const resetForm = () => {
    setEditFormData({
      name: "",
      email: "",
      role: "",
      status: "active",
      discount: { type: "flat", value: "" },
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

  const handleDiscountChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      discount: {
        ...prev.discount,
        [field]: value,
      },
    }));
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

    if (editFormData?.role === "special-user" && !editFormData.discount.value) {
      newErrors.discount = "Discount value is required";
      isValid = false;
    }

    setEditErrors(newErrors);
    return isValid;
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    if (validateEditForm()) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === selectedUser.id ? { ...user, ...editFormData } : user
        )
      );
      console.log("Updated User Data:", editFormData);
      toast.success("User updated successfully!");
      editModal.close();
      resetForm();
    } else {
      toast.error("Please fix the errors in the form");
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
      </div>

      {/* Conditional Discount Fields */}
      {editFormData?.role === "special-user" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Discount Type"
            options={discountTypeOptions}
            value={editFormData.discount.type}
            onValueChange={(value) => handleDiscountChange("type", value)}
            fullWidth
            className="h-12 dark:border-[#475569]"
          />

          <Input
            label={`Discount Value ${
              editFormData.discount.type === "percentage" ? "(%)" : "($)"
            }`}
            type="number"
            placeholder={
              editFormData.discount.type === "percentage" ? "10" : "50"
            }
            value={editFormData.discount.value}
            onValueChange={(value) => handleDiscountChange("value", value)}
            fullWidth
            className="h-12 dark:border-[#475569]"
            error={editErrors.discount}
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="button"
          onClick={editModal.close}
          className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Update User
        </Button>
      </div>
    </form>
  );
}
