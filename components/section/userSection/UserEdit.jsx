import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal/Modal";
import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { useUpdateUserMutation } from "@/features/user/userApiSlice";

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "moderator", label: "Moderator" },
  { value: "user", label: "User" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function UserEdit({ editModal, selectedUser }) {
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    role: "",
    status: "",
    permission: {
      network: { access: false, create: false, show: false },
      subscription: { show: false },
      package: { create: false, show: false },
      user: { create: false, show: false },
      coupon: { create: false, show: false },
      affiliate: { access: false, show: false },
      advertise: { access: false, show: false },
    },
  });

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePermissionChange = (section, permission, value) => {
    setFormData((prev) => {
      const newPermission = { ...prev.permission[section] };

      if (permission === "create") {
        newPermission.create = value;
        if (value) {
          newPermission.show = true;
        }
      } else if (permission === "show") {
        if (prev.permission[section].create) {
          if (!value) return prev;
          newPermission.show = true;
        } else {
          newPermission.show = value;
        }
      } else {
        newPermission[permission] = value;
      }

      return {
        ...prev,
        permission: {
          ...prev.permission,
          [section]: newPermission,
        },
      };
    });
  };

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        name: selectedUser.name,
        email: selectedUser.email,
        phoneNumber: selectedUser.phoneNumber,
        role: selectedUser.role,
        status: selectedUser.status,
        permission: {
          network: { ...selectedUser.permission.network },
          subscription: { ...selectedUser.permission.subscription },
          package: { ...selectedUser.permission.package },
          user: { ...selectedUser.permission.user },
          coupon: { ...selectedUser.permission.coupon },
          affiliate: { ...selectedUser.permission.affiliate },
          advertise: { ...selectedUser.permission.advertise },
        },
      });
    }
  }, [selectedUser]);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Updating user...");
    if (!selectedUser?._id) return;
    try {
      await updateUser({
        id: selectedUser._id,
        data: formData,
      });

      toast.success("User updated successfully!");
      toast.dismiss(loadingToast);
      editModal.close();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update user");
      toast.dismiss(loadingToast);
    }
  };

  return (
    <Modal
      open={editModal.isOpen}
      onClose={editModal.close}
      title="Edit User"
      size="xxlarge"
    >
      {selectedUser && (
        <form onSubmit={handleSaveEdit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-4">
            <Input
              label="Name"
              value={formData.name}
              onValueChange={(value) => handleFormChange("name", value)}
              placeholder="Enter name"
              required
              fullWidth
              className="h-12 dark:border-[#475569]"
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onValueChange={(value) => handleFormChange("email", value)}
              placeholder="Enter email"
              required
              fullWidth
              className="h-12 dark:border-[#475569]"
            />

            <Input
              label="Phone"
              value={formData.phoneNumber}
              onValueChange={(value) => handleFormChange("phoneNumber", value)}
              placeholder="Enter phone number"
              required
              fullWidth
              className="h-12 dark:border-[#475569]"
            />

            <Select
              label="Role"
              options={roleOptions}
              value={formData.role}
              onValueChange={(value) => handleFormChange("role", value)}
              required
              className="h-12 dark:border-[#475569]"
            />

            <Select
              label="Status"
              options={statusOptions}
              value={formData.status}
              onValueChange={(value) => handleFormChange("status", value)}
              required
              className="h-12 dark:border-[#475569]"
            />
          </div>

          {/* Access Permissions */}
          <div className="mb-6">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Access Permissions
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-4">
                {/* Network */}
                <div className="border border-gray-200 dark:border-[#475569] rounded-md p-3">
                  <p className="font-medium text-sm mb-4">1. Network</p>
                  <div className="space-y-3">
                    <Checkbox
                      checked={formData.permission.network.access}
                      onValueChange={(value) =>
                        handlePermissionChange("network", "access", value)
                      }
                      label="Access"
                      size="xs"
                    />
                    <Checkbox
                      checked={formData.permission.network.create}
                      onValueChange={(value) =>
                        handlePermissionChange("network", "create", value)
                      }
                      label="Create"
                      size="xs"
                    />
                    <Checkbox
                      checked={formData.permission.network.show}
                      onValueChange={(value) =>
                        handlePermissionChange("network", "show", value)
                      }
                      size="xs"
                      label="Show"
                    />
                  </div>
                </div>

                {/* Subscriptions */}
                <div className="border border-gray-200 dark:border-[#475569]  rounded-md p-3">
                  <p className="font-medium text-sm mb-4">2. Subscriptions</p>
                  <div className="space-y-3">
                    <Checkbox
                      checked={formData.permission.subscription.show}
                      onValueChange={(value) =>
                        handlePermissionChange("subscription", "show", value)
                      }
                      label="Show"
                      size="xs"
                    />
                  </div>
                </div>

                {/* Package */}
                <div className="border border-gray-200 dark:border-[#475569] rounded-md p-3">
                  <p className="font-medium text-sm mb-4">3. Package</p>
                  <div className="space-y-3">
                    <Checkbox
                      checked={formData.permission.package.create}
                      onValueChange={(value) =>
                        handlePermissionChange("package", "create", value)
                      }
                      label="Create"
                      size="xs"
                    />
                    <Checkbox
                      checked={formData.permission.package.show}
                      onValueChange={(value) =>
                        handlePermissionChange("package", "show", value)
                      }
                      label="Show"
                      size="xs"
                    />
                  </div>
                </div>

                {/* Users */}
                <div className="border border-gray-200 dark:border-[#475569] rounded-md p-3">
                  <p className="font-medium text-sm mb-4">4. Users</p>
                  <div className="space-y-3">
                    <Checkbox
                      checked={formData.permission.user.create}
                      onValueChange={(value) =>
                        handlePermissionChange("user", "create", value)
                      }
                      label="Create"
                      size="xs"
                    />
                    <Checkbox
                      checked={formData.permission.user.show}
                      onValueChange={(value) =>
                        handlePermissionChange("user", "show", value)
                      }
                      label="Show"
                      size="xs"
                    />
                  </div>
                </div>

                {/* Coupon */}
                <div className="border border-gray-200 dark:border-[#475569] rounded-md p-3">
                  <p className="font-medium text-sm mb-4">5. Coupon</p>
                  <div className="space-y-3">
                    <Checkbox
                      checked={formData.permission.coupon.create}
                      onValueChange={(value) =>
                        handlePermissionChange("coupon", "create", value)
                      }
                      label="Create"
                      size="xs"
                    />
                    <Checkbox
                      checked={formData.permission.coupon.show}
                      onValueChange={(value) =>
                        handlePermissionChange("coupon", "show", value)
                      }
                      label="Show"
                      size="xs"
                    />
                  </div>
                </div>

                {/* Affiliates */}
                <div className="border border-gray-200 dark:border-[#475569] rounded-md p-3">
                  <p className="font-medium text-sm mb-4">6. Affiliates</p>
                  <div className="space-y-3">
                    <Checkbox
                      checked={formData.permission.affiliate.access}
                      onValueChange={(value) =>
                        handlePermissionChange("affiliate", "access", value)
                      }
                      label="access"
                      size="xs"
                    />

                    <Checkbox
                      checked={formData.permission.affiliate.show}
                      onValueChange={(value) =>
                        handlePermissionChange("affiliate", "show", value)
                      }
                      label="show"
                      size="xs"
                    />
                  </div>
                </div>

                {/* Advertiser */}
                <div className="border border-gray-200 dark:border-[#475569] rounded-md p-3">
                  <p className="font-medium text-sm mb-4">7. Advertiser</p>
                  <div className="space-y-3">
                    <Checkbox
                      checked={formData.permission.advertise.access}
                      onValueChange={(value) =>
                        handlePermissionChange("advertise", "access", value)
                      }
                      label="Access"
                      size="xs"
                    />
                    <Checkbox
                      checked={formData.permission.advertise.show}
                      onValueChange={(value) =>
                        handlePermissionChange("advertise", "show", value)
                      }
                      label="Show"
                      size="xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={editModal.close}
              className="mr-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:hover:bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
